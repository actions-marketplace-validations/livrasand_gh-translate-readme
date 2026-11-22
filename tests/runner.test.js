"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { join } = require("path");
const { run } = require("../src/runner");
const { createDeps, createTempRepo } = require("./helpers");

describe("run", () => {
  it("traduce, escribe el archivo y hace commit/push en el camino feliz", async () => {
    const { deps, sink, written, failures, gitCalls } = createDeps({
      getInput: () => "fr",
      statusFiles: [{ path: "/virtual/repo/README.fr.md" }],
      translate: async (text, lang) => ({ text: `${lang.toUpperCase()}:${text}` }),
    });

    const result = await run(deps);

    assert.equal(result.ok, true);
    assert.equal(result.lang, "fr");
    assert.equal(result.outputFile, "README.fr.md");
    assert.equal(result.stats.total, 2);
    assert.deepEqual(failures, []);
    assert.deepEqual(Object.keys(written), [join("/virtual/repo", "README.fr.md")]);
    assert.equal(written[join("/virtual/repo", "README.fr.md")].encoding, "utf8");
    assert.match(written[join("/virtual/repo", "README.fr.md")].content, /FR:Hello/);
    assert.ok(gitCalls.some(([name]) => name === "push"));
    assert.ok(sink.lines.some((line) => line.includes("[translate-readme:config] Language resolved")));
    assert.ok(sink.lines.some((line) => line.includes("[translate-readme:read] README parsed")));
    assert.ok(sink.lines.some((line) => line.includes("[translate-readme:write] Translated README written")));
    assert.ok(sink.lines.some((line) => line.includes("[translate-readme] Done")));
  });

  it("usa zh-CN y omite el commit cuando no hay cambios", async () => {
    const { deps, written, gitCalls } = createDeps();
    const result = await run(deps);
    assert.equal(result.ok, true);
    assert.equal(result.lang, "zh-CN");
    assert.ok(Object.keys(written)[0].endsWith("README.zh-CN.md"));
    assert.deepEqual(gitCalls, [["status"]]);
    assert.equal(result.git.reason, "unchanged");
  });

  it("reporta INVALID_LANGUAGE antes de leer o escribir", async () => {
    const { deps, written, failures, gitCalls } = createDeps({ getInput: () => "../secrets" });
    const result = await run(deps);
    assert.equal(result.ok, false);
    assert.equal(result.error.code, "INVALID_LANGUAGE");
    assert.equal(result.error.step, "config");
    assert.match(failures[0], /^\[INVALID_LANGUAGE@config\]/);
    assert.deepEqual(written, {});
    assert.deepEqual(gitCalls, []);
  });

  it("reporta README_NOT_FOUND con el directorio en el mensaje", async () => {
    const { deps, failures } = createDeps({ readdir: () => [] });
    const result = await run(deps);
    assert.equal(result.ok, false);
    assert.equal(result.error.code, "README_NOT_FOUND");
    assert.equal(result.error.step, "read");
    assert.match(failures[0], /README_NOT_FOUND@read/);
    assert.match(failures[0], /\/virtual\/repo/);
  });

  it("no escribe un README parcialmente traducido si falla la API", async () => {
    const { deps, written, failures } = createDeps({
      translate: async (text) => {
        if (text.includes("Hello")) {
          throw new Error("API 429");
        }
        return { text: text.toUpperCase() };
      },
      retries: 0,
    });
    const result = await run(deps);
    assert.equal(result.ok, false);
    assert.equal(result.error.code, "TRANSLATION_FAILED");
    assert.match(failures[0], /TRANSLATION_FAILED@translate/);
    assert.match(failures[0], /API 429/);
    assert.match(failures[0], /root\.children\[0\]\.children\[0\]/);
    assert.deepEqual(written, {});
  });

  it("reporta WRITE_FAILED cuando no se puede escribir la salida", async () => {
    const { deps, failures } = createDeps({
      writeFile: () => { throw new Error("EACCES"); },
    });
    const result = await run(deps);
    assert.equal(result.ok, false);
    assert.equal(result.error.code, "WRITE_FAILED");
    assert.equal(result.error.step, "write");
    assert.match(failures[0], /WRITE_FAILED@write/);
  });

  it("reporta GIT_FAILED si falla el push, con setFailed y sin lanzar", async () => {
    const { deps, failures } = createDeps({
      statusFiles: [{ path: "/virtual/repo/README.fr.md" }],
      getInput: () => "fr",
      createGit: () => ({
        status: async () => ({ files: [{ path: "/virtual/repo/README.fr.md" }] }),
        addConfig: async () => {},
        add: async () => {},
        commit: async () => {},
        push: async () => { throw new Error("push rejected"); },
      }),
    });
    const result = await run(deps);
    assert.equal(result.ok, false);
    assert.equal(result.error.code, "GIT_FAILED");
    assert.equal(result.error.step, "commit");
    assert.match(failures[0], /GIT_FAILED@commit/);
    assert.match(failures[0], /push rejected/);
  });

  it("funciona de extremo a extremo con archivos y git simulados en disco", async () => {
    const repo = createTempRepo({ readme: "# Hola\n\nMundo.\n" });
    const { readdirSync, readFileSync, writeFileSync } = require("fs");
    try {
      const { deps } = createDeps({
        cwd: repo.cwd,
        getInput: () => "en",
        readdir: readdirSync,
        readFile: readFileSync,
        writeFile: writeFileSync,
        translate: async (text) => ({ text: `EN:${text}` }),
        statusFiles: [{ path: join(repo.cwd, "README.en.md") }],
      });
      const result = await run(deps);
      assert.equal(result.ok, true);
      assert.match(readFileSync(join(repo.cwd, "README.en.md"), "utf8"), /EN:Hola/);
    } finally {
      repo.cleanup();
    }
  });
});
