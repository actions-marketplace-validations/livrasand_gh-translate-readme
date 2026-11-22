"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { buildDependencies } = require("../src/runner");

describe("buildDependencies (cableado con librerías externas)", () => {
  it("lee y reporta errores a @actions/core", () => {
    const calls = [];
    const deps = buildDependencies({}, {
      core: {
        getInput: (name) => {
          calls.push(["getInput", name]);
          return "fr";
        },
        setFailed: (message) => calls.push(["setFailed", message]),
      },
    });

    assert.equal(deps.getInput("LANG"), "fr");
    deps.setFailed("boom");
    assert.deepEqual(calls, [["getInput", "LANG"], ["setFailed", "boom"]]);
  });

  it("usa la opción `to` de la API de traducción", async () => {
    let received;
    const deps = buildDependencies({}, {
      translate: async (text, options) => {
        received = [text, options];
        return { text: "hola" };
      },
    });
    const result = await deps.translate("hello", "es");
    assert.deepEqual(received, ["hello", { to: "es" }]);
    assert.equal(result.text, "hola");
  });

  it("crea el cliente de git a través de la factory", () => {
    let created = 0;
    const git = { status: async () => ({ files: [] }) };
    const deps = buildDependencies({}, { git: () => { created++; return git; } });
    assert.equal(deps.createGit(), git);
    assert.equal(deps.createGit(), git);
    assert.equal(created, 2);
  });

  it("el cliente git por defecto expone los métodos que usa el action", () => {
    const deps = buildDependencies();
    const client = deps.createGit();
    for (const method of ["status", "addConfig", "add", "commit", "push"]) {
      assert.equal(typeof client[method], "function", `falta git.${method}`);
    }
  });

  it("delega lectura y escritura en el filesystem con codificación utf8", () => {
    const calls = [];
    const deps = buildDependencies({}, {
      fs: {
        readdirSync: (dir) => { calls.push(["readdir", dir]); return ["README.md"]; },
        readFileSync: (path, encoding) => { calls.push(["readFile", path, encoding]); return "# Hola"; },
        writeFileSync: (path, data, encoding) => calls.push(["writeFile", path, data, encoding]),
      },
    });

    assert.deepEqual(deps.readdir("/repo"), ["README.md"]);
    assert.equal(deps.readFile("/repo/README.md", "utf8"), "# Hola");
    deps.writeFile("/repo/README.fr.md", "# Salut", "utf8");
    assert.deepEqual(calls, [
      ["readdir", "/repo"],
      ["readFile", "/repo/README.md", "utf8"],
      ["writeFile", "/repo/README.fr.md", "# Salut", "utf8"],
    ]);
  });

  it("sleep resuelve y los overrides ganan a los defaults", async () => {
    const deps = buildDependencies({ getInput: () => "override" }, {
      core: { getInput: () => "default" },
    });
    assert.equal(deps.getInput("LANG"), "override");
    assert.equal(deps.concurrency, 5);
    assert.equal(deps.retries, 2);
    await deps.sleep(0);
  });
});
