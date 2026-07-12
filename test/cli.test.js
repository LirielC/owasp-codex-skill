const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const cli = path.join(root, "bin", "owasp-codex-skill.js");

test("doctor validates files without running scanners", () => {
  const result = spawnSync(process.execPath, [cli, "doctor"], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /ok\s+SKILL\.md/);
  assert.match(result.stdout, /No optional tools were executed/);
  assert.match(result.stdout, /SKILL\.md frontmatter/);
  assert.match(result.stdout, /Node .*requires >=16/);
});

test("installer copies every runtime reference", () => {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), "owasp-skill-"));
  const target = path.join(base, "installed");
  try {
    const result = spawnSync(process.execPath, [cli, "install", "--target", target], { encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
    assert.ok(fs.existsSync(path.join(target, "SKILL.md")));
    assert.ok(fs.existsSync(path.join(target, "references", "open-source-tooling.md")));
  } finally {
    fs.rmSync(base, { recursive: true, force: true });
  }
});

test("installer refuses replacement without force", () => {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), "owasp-skill-"));
  const target = path.join(base, "installed");
  fs.mkdirSync(target);
  try {
    const result = spawnSync(process.execPath, [cli, "install", "--target", target], { encoding: "utf8" });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /already exists/);
  } finally {
    fs.rmSync(base, { recursive: true, force: true });
  }
});

test("force installation replaces content transactionally and removes temporary directories", () => {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), "owasp-skill-"));
  const target = path.join(base, "installed");
  fs.mkdirSync(target);
  fs.writeFileSync(path.join(target, "old.txt"), "old");
  try {
    const result = spawnSync(process.execPath, [cli, "install", "--force", "--target", target], { encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
    assert.ok(fs.existsSync(path.join(target, "SKILL.md")));
    assert.ok(!fs.existsSync(path.join(target, "old.txt")));
    assert.deepEqual(fs.readdirSync(base).filter((name) => name.includes(".staging-") || name.includes(".backup-")), []);
  } finally {
    fs.rmSync(base, { recursive: true, force: true });
  }
});

test("installer rejects dangerous target directories", () => {
  for (const target of [os.homedir(), path.parse(os.homedir()).root]) {
    const result = spawnSync(process.execPath, [cli, "install", "--force", "--target", target], { encoding: "utf8" });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /dangerous installation target/);
  }
});

test("evaluation fixtures encode confirmed, dismissed, redacted, and clean outcomes", () => {
  const confirmed = JSON.parse(fs.readFileSync(path.join(root, "test", "fixtures", "confirmed.json"), "utf8"));
  const clean = JSON.parse(fs.readFileSync(path.join(root, "test", "fixtures", "clean.json"), "utf8"));
  assert.ok(confirmed.artifacts.some((item) => item.expected === "confirmed"));
  assert.ok(confirmed.artifacts.some((item) => item.expected === "dismissed"));
  assert.ok(confirmed.artifacts.some((item) => /never reproduce/i.test(item.outputConstraint || "")));
  assert.ok(clean.artifacts.every((item) => item.expected === "no-confirmed-finding"));
  assert.ok(clean.requiredResidualRisk);
});

test("published file allowlist excludes development tests", () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  assert.ok(!manifest.files.includes("test"));
});
