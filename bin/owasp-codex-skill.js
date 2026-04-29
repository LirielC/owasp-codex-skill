#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const path = require("path");

const SKILL_NAME = "owasp-codex-skill";
const PROJECT_ROOT = path.resolve(__dirname, "..");

function usage() {
  console.log(`Usage:
  owasp-codex-skill install [--force] [--target <path>]
  owasp-codex-skill path
  owasp-codex-skill --help

Commands:
  install        Install the Codex skill into the Codex skills directory.
  path           Print the default installation path.

Options:
  --force        Replace an existing installation.
  --target       Install into a specific skill directory.

Default target:
  \${CODEX_HOME:-~/.codex}/skills/${SKILL_NAME}`);
}

function defaultTarget() {
  const codexHome = process.env.CODEX_HOME || path.join(os.homedir(), ".codex");
  return path.join(codexHome, "skills", SKILL_NAME);
}

function copyRecursive(source, target) {
  const stats = fs.statSync(source);

  if (stats.isDirectory()) {
    fs.mkdirSync(target, { recursive: true });
    for (const entry of fs.readdirSync(source)) {
      copyRecursive(path.join(source, entry), path.join(target, entry));
    }
    return;
  }

  fs.copyFileSync(source, target);
}

function removeRecursive(target) {
  fs.rmSync(target, { recursive: true, force: true });
}

function parseInstallArgs(args) {
  const options = {
    force: false,
    target: defaultTarget(),
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--force") {
      options.force = true;
      continue;
    }

    if (arg === "--target") {
      const value = args[index + 1];
      if (!value) {
        throw new Error("Missing value for --target.");
      }
      options.target = path.resolve(value);
      index += 1;
      continue;
    }

    throw new Error(`Unknown option: ${arg}`);
  }

  return options;
}

function install(args) {
  const options = parseInstallArgs(args);
  const target = options.target;

  if (fs.existsSync(target)) {
    if (!options.force) {
      throw new Error(
        `Skill already exists at ${target}. Re-run with --force to replace it.`
      );
    }
    removeRecursive(target);
  }

  fs.mkdirSync(target, { recursive: true });

  for (const entry of ["SKILL.md", "agents", "references"]) {
    copyRecursive(path.join(PROJECT_ROOT, entry), path.join(target, entry));
  }

  console.log(`Installed ${SKILL_NAME} to ${target}`);
}

function main() {
  const [command, ...args] = process.argv.slice(2);

  try {
    if (!command || command === "--help" || command === "-h") {
      usage();
      return;
    }

    if (command === "install") {
      install(args);
      return;
    }

    if (command === "path") {
      console.log(defaultTarget());
      return;
    }

    throw new Error(`Unknown command: ${command}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    console.error("");
    usage();
    process.exitCode = 1;
  }
}

main();
