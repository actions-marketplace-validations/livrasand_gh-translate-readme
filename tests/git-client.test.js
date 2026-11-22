"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { resolveFactory, createGitClient } = require("../src/git-client");

describe("resolveFactory", () => {
  it("soporta la exportación directa de simple-git v3", () => {
    const factory = () => "v3";
    assert.equal(resolveFactory(factory), factory);
  });

  it("soporta la exportación nombrada de simple-git v4", () => {
    const factory = () => "v4";
    assert.equal(resolveFactory({ simpleGit: factory }), factory);
  });

  it("falla con un mensaje claro si la librería cambia de API", () => {
    assert.throws(() => resolveFactory({}), {
      name: "TypeError",
      message: /simple-git no expone una fábrica de cliente compatible/,
    });
    assert.throws(() => resolveFactory(undefined), TypeError);
  });
});

describe("createGitClient", () => {
  it("devuelve un cliente con la API usada por el action", () => {
    const client = createGitClient();
    for (const method of ["status", "addConfig", "add", "commit", "push"]) {
      assert.equal(typeof client[method], "function");
    }
  });
});
