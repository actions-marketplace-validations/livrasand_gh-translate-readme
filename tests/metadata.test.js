"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync, existsSync } = require("fs");
const { join } = require("path");

const root = join(__dirname, "..");

describe("metadatos del action (prevención de errores humanos)", () => {
  it("action.yml apunta a un dist/index.js existente con node20", () => {
    const action = readFileSync(join(root, "action.yml"), "utf8");
    assert.match(action, /using:\s*'node20'|using:\s*"node20"/);
    assert.match(action, /main:\s*'dist\/index\.js'|main:\s*"dist\/index\.js"/);
    assert.equal(existsSync(join(root, "dist", "index.js")), true);
  });

  it("expone los scriptsNeeded para verificar localmente", () => {
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
    for (const script of ["test", "test:coverage", "lint", "build", "check:dist", "verify"]) {
      assert.equal(typeof pkg.scripts[script], "string", `falta el script ${script}`);
    }
    assert.equal(pkg.c8["check-coverage"], true);
    assert.equal(existsSync(join(root, "scripts", "check-dist.js")), true);
  });

  it("el entrypoint no usa process.exit() y sólo corre al ejecutarse directamente", () => {
    const source = readFileSync(join(root, "index.js"), "utf8");
    assert.doesNotMatch(source, /process\.exit\(/);
    assert.match(source, /require\.main === module/);
  });

  it("el CI ejecuta tests, lint y comprobación de dist", () => {
    const ci = readFileSync(join(root, ".github", "workflows", "ci.yml"), "utf8");
    assert.match(ci, /npm run lint/);
    assert.match(ci, /npm run test:coverage/);
    assert.match(ci, /npm run check:dist/);
  });
});
