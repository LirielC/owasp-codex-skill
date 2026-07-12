#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const SKILL_NAME = "owasp-codex-skill";
const PROJECT_ROOT = path.resolve(__dirname, "..");
const REQUIRED = [
  "SKILL.md",
  path.join("agents", "openai.yaml"),
  path.join("references", "owasp-top-10-review-map.md"),
  path.join("references", "report-template.md"),
  path.join("references", "open-source-tooling.md"),
];
const OPTIONAL_TOOLS = ["opengrep", "gitleaks", "osv-scanner", "trivy", "checkov", "syft"];

function usage() {
  console.log(`Usage:
  owasp-codex-skill install [--force] [--target <path>]
  owasp-codex-skill path
  owasp-codex-skill doctor [--tools]
  owasp-codex-skill --help

Commands:
  install        Install the Codex skill into the Codex skills directory.
  path           Print the default installation path.
  doctor         Validate skill structure and detect optional tools on PATH.

Options:
  --force        Transactionally replace an existing installation.
  --target       Install into a specific skill directory.
  --tools        Execute version-only commands for detected optional tools; never scan.

Default target:
  \${CODEX_HOME:-~/.codex}/skills/${SKILL_NAME}`);
}

function codexHome() {
  return path.resolve(process.env.CODEX_HOME || path.join(os.homedir(), ".codex"));
}

function defaultTarget() {
  return path.join(codexHome(), "skills", SKILL_NAME);
}

function validateSkill(root) {
  const results = REQUIRED.map((entry) => ({ entry, present: fs.existsSync(path.join(root, entry)) }));
  const skill = fs.existsSync(path.join(root, "SKILL.md")) ? fs.readFileSync(path.join(root, "SKILL.md"), "utf8") : "";
  const yaml = fs.existsSync(path.join(root, "agents", "openai.yaml")) ? fs.readFileSync(path.join(root, "agents", "openai.yaml"), "utf8") : "";
  results.push({ entry: "SKILL.md frontmatter", present: /^---\r?\nname: owasp-codex-skill\r?\ndescription: .+\r?\n---/m.test(skill) });
  results.push({ entry: "agents/openai.yaml interface", present: /interface:\s*[\s\S]*display_name:\s*["'].+["'][\s\S]*short_description:\s*["'].+["'][\s\S]*default_prompt:\s*["'].+["']/m.test(yaml) });
  return results;
}

function findOnPath(command) {
  const extensions = process.platform === "win32"
    ? (process.env.PATHEXT || ".EXE;.CMD;.BAT;.COM").split(";")
    : [""];
  for (const directory of (process.env.PATH || "").split(path.delimiter).filter(Boolean)) {
    for (const extension of extensions) {
      const candidate = path.join(directory, process.platform === "win32" ? command + extension.toLowerCase() : command);
      const alternate = process.platform === "win32" ? path.join(directory, command + extension.toUpperCase()) : candidate;
      if (fs.existsSync(candidate)) return candidate;
      if (alternate !== candidate && fs.existsSync(alternate)) return alternate;
    }
  }
  return null;
}

function toolVersion(executable) {
  const result = spawnSync(executable, ["--version"], { encoding: "utf8", timeout: 5000, windowsHide: true });
  const output = `${result.stdout || ""} ${result.stderr || ""}`.trim().split(/\r?\n/)[0];
  return result.error ? `version unavailable (${result.error.message})` : output || `version command exited ${result.status}`;
}

function doctor(args) {
  const unknown = args.filter((arg) => arg !== "--tools");
  if (unknown.length) throw new Error(`Unknown doctor option: ${unknown[0]}`);
  const queryVersions = args.includes("--tools");
  const results = validateSkill(PROJECT_ROOT);
  for (const result of results) console.log(`${result.present ? "ok" : "missing"}  ${result.entry}`);
  console.log(`${Number(process.versions.node.split(".")[0]) >= 16 ? "ok" : "unsupported"}  Node ${process.versions.node} (requires >=16)`);
  console.log("");
  console.log("Optional tools (PATH inspection only unless --tools was explicitly supplied):");
  for (const tool of OPTIONAL_TOOLS) {
    const executable = findOnPath(tool);
    const detail = executable && queryVersions ? ` — ${toolVersion(executable)}` : "";
    console.log(`${executable ? "found" : "not found"}  ${tool}${detail}`);
  }
  console.log(queryVersions ? "No scans were run; only version commands were executed." : "No optional tools were executed.");
  if (results.some((result) => !result.present) || Number(process.versions.node.split(".")[0]) < 16) process.exitCode = 1;
}

function copyRecursive(source, target) {
  const stats = fs.lstatSync(source);
  if (stats.isSymbolicLink()) throw new Error(`Refusing to copy symbolic link: ${source}`);
  if (stats.isDirectory()) {
    fs.mkdirSync(target, { recursive: true });
    for (const entry of fs.readdirSync(source)) copyRecursive(path.join(source, entry), path.join(target, entry));
  } else {
    fs.copyFileSync(source, target, fs.constants.COPYFILE_EXCL);
  }
}

function assertSafeTarget(target) {
  const resolved = path.resolve(target);
  const root = path.parse(resolved).root;
  const forbidden = new Set([root, path.resolve(os.homedir()), codexHome(), path.join(codexHome(), "skills"), PROJECT_ROOT].map((item) => path.resolve(item).toLowerCase()));
  if (forbidden.has(resolved.toLowerCase())) throw new Error(`Refusing dangerous installation target: ${resolved}`);
  let cursor = resolved;
  while (!fs.existsSync(cursor)) {
    const parent = path.dirname(cursor);
    if (parent === cursor) break;
    cursor = parent;
  }
  if (fs.existsSync(cursor) && fs.lstatSync(cursor).isSymbolicLink()) throw new Error(`Refusing target beneath symbolic link: ${cursor}`);
  return resolved;
}

function parseInstallArgs(args) {
  const options = { force: false, target: defaultTarget() };
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === "--force") options.force = true;
    else if (args[index] === "--target") {
      if (!args[index + 1]) throw new Error("Missing value for --target.");
      options.target = path.resolve(args[index + 1]);
      index += 1;
    } else throw new Error(`Unknown option: ${args[index]}`);
  }
  return options;
}

function install(args) {
  const options = parseInstallArgs(args);
  const target = assertSafeTarget(options.target);
  if (fs.existsSync(target) && !options.force) throw new Error(`Skill already exists at ${target}. Re-run with --force to replace it.`);
  const parent = path.dirname(target);
  fs.mkdirSync(parent, { recursive: true });
  const nonce = `${process.pid}-${Date.now()}`;
  const staging = path.join(parent, `.${path.basename(target)}.staging-${nonce}`);
  const backup = path.join(parent, `.${path.basename(target)}.backup-${nonce}`);
  let backedUp = false;
  try {
    fs.mkdirSync(staging);
    for (const entry of ["SKILL.md", "agents", "references"]) copyRecursive(path.join(PROJECT_ROOT, entry), path.join(staging, entry));
    const invalid = validateSkill(staging).filter((result) => !result.present);
    if (invalid.length) throw new Error(`Staged skill failed validation: ${invalid.map((item) => item.entry).join(", ")}`);
    if (fs.existsSync(target)) {
      fs.renameSync(target, backup);
      backedUp = true;
    }
    fs.renameSync(staging, target);
    if (backedUp) fs.rmSync(backup, { recursive: true, force: true });
    console.log(`Installed ${SKILL_NAME} to ${target}`);
  } catch (error) {
    if (fs.existsSync(staging)) fs.rmSync(staging, { recursive: true, force: true });
    if (backedUp && !fs.existsSync(target) && fs.existsSync(backup)) fs.renameSync(backup, target);
    throw error;
  }
}

function main() {
  const [command, ...args] = process.argv.slice(2);
  try {
    if (!command || command === "--help" || command === "-h") usage();
    else if (command === "install") install(args);
    else if (command === "path") console.log(defaultTarget());
    else if (command === "doctor") doctor(args);
    else throw new Error(`Unknown command: ${command}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    console.error("");
    usage();
    process.exitCode = 1;
  }
}

main();
