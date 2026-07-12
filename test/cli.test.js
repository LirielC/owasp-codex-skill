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
  assert.match(result.stdout, /never installed or executed/);
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
