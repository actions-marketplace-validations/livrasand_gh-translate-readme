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
    assert.equal(result.provider, "google");
    assert.equal(result.outputFile, "README.fr.md");
    assert.equal(result.stats.total, 2);
    assert.deepEqual(failures, []);
    assert.deepEqual(Object.keys(written), [join("/virtual/repo", "README.fr.md")]);
    assert.equal(written[join("/virtual/repo", "README.fr.md")].encoding, "utf8");
    assert.match(written[join("/virtual/repo", "README.fr.md")].content, /FR:Hello/);
    assert.ok(gitCalls.some(([name]) => name === "push"));
    assert.ok(sink.lines.some((line) => line.includes("[translate-readme:config] Configuration resolved")));
    assert.ok(sink.lines.some((line) => line.includes("[translate-readme:read] README parsed")));
    assert.ok(sink.lines.some((line) => line.includes("[translate-readme:write] Translated README written")));
    assert.ok(sink.lines.some((line) => line.includes("[translate-readme] Done")));
  });

  it("traduce usando proveedor libretranslate de extremo a extremo", async () => {
    const { deps, written, gitCalls } = createDeps({
      getInput: (name) => {
        if (name === "PROVIDER") return "libretranslate";
        if (name === "LANG") return "es";
        if (name === "LIBRETRANSLATE_URL") return "http://localhost:5000";
        return "";
      },
      statusFiles: [{ path: "/virtual/repo/README.es.md" }],
      fetch: async () => ({
        ok: true,
        status: 200,
        json: async () => ({ translatedText: "Texto traducido por LibreTranslate" }),
      }),
    });

    const result = await run(deps);

    assert.equal(result.ok, true);
    assert.equal(result.lang, "es");
    assert.equal(result.provider, "libretranslate");
    assert.equal(result.outputFile, "README.es.md");
    assert.match(written[join("/virtual/repo", "README.es.md")].content, /LibreTranslate/);
    assert.ok(gitCalls.some(([name]) => name === "push"));
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

  it("reporta INVALID_PROVIDER si el proveedor no está soportado", async () => {
    const { deps, failures } = createDeps({
      getInput: (name) => (name === "PROVIDER" ? "bing" : ""),
    });
    const result = await run(deps);
    assert.equal(result.ok, false);
    assert.equal(result.error.code, "INVALID_PROVIDER");
    assert.equal(result.error.step, "config");
    assert.match(failures[0], /^\[INVALID_PROVIDER@config\]/);
  });

  it("reporta INVALID_CONFIG si LIBRETRANSLATE_URL no es válida", async () => {
    const { deps, failures } = createDeps({
      getInput: (name) => {
        if (name === "PROVIDER") return "libretranslate";
        if (name === "LIBRETRANSLATE_URL") return "not-a-url";
        return "";
      },
    });
    const result = await run(deps);
    assert.equal(result.ok, false);
    assert.equal(result.error.code, "INVALID_CONFIG");
    assert.equal(result.error.step, "config");
    assert.match(failures[0], /^\[INVALID_CONFIG@config\]/);
  });

  it("reporta INVALID_LANGUAGE si SOURCE_LANG es inválido", async () => {
    const { deps, failures } = createDeps({
      getInput: (name) => (name === "SOURCE_LANG" ? "../invalid" : ""),
    });
    const result = await run(deps);
    assert.equal(result.ok, false);
    assert.equal(result.error.code, "INVALID_LANGUAGE");
    assert.equal(result.error.step, "config");
    assert.match(failures[0], /^\[INVALID_LANGUAGE@config\]/);
  });

  it("reporta README_NOT_FOUND con el directorio en el mensaje", async () => {
    const { deps, failures } = createDeps({ readdir: () => [] });
    const result = await run(deps);
    assert.equal(result.ok, false);
    assert.equal(result.error.code, "README_NOT_FOUND");
    assert.equal(result.error.step, "read");
    assert.match(failures[0], /^\[README_NOT_FOUND@read\]/);
    assert.match(failures[0], /\/virtual\/repo/);
  });

  it("no escribe un README parcialmente traducido si falla la API", async () => {
    const translationError = new Error("API limit exceeded");
    const { deps, written, failures, gitCalls } = createDeps({
      translate: async () => {
        throw translationError;
      },
    });

    const result = await run(deps);

    assert.equal(result.ok, false);
    assert.equal(result.error.code, "TRANSLATION_FAILED");
    assert.equal(result.error.step, "translate");
    assert.match(failures[0], /^\[TRANSLATION_FAILED@translate\]/);
    assert.deepEqual(written, {});
    assert.deepEqual(gitCalls, []);
  });

  it("reporta WRITE_FAILED cuando no se puede escribir la salida", async () => {
    const { deps, failures, gitCalls } = createDeps({
      writeFile: () => {
        throw new Error("Disk full");
      },
    });

    const result = await run(deps);

    assert.equal(result.ok, false);
    assert.equal(result.error.code, "WRITE_FAILED");
    assert.equal(result.error.step, "write");
    assert.match(failures[0], /^\[WRITE_FAILED@write\]/);
    assert.match(failures[0], /Disk full/);
    assert.deepEqual(gitCalls, []);
  });

  it("reporta GIT_FAILED si falla el push, con setFailed y sin lanzar", async () => {
    const { deps, failures } = createDeps({
      statusFiles: [{ path: "/virtual/repo/README.zh-CN.md" }],
      createGit: () => ({
        status: async () => ({ files: [{ path: "/virtual/repo/README.zh-CN.md" }] }),
        addConfig: async () => {},
        add: async () => {},
        commit: async () => {},
        push: async () => {
          throw new Error("push rejected: protected branch");
        },
      }),
    });
    const result = await run(deps);
    assert.equal(result.ok, false);
    assert.equal(result.error.code, "GIT_FAILED");
    assert.equal(result.error.step, "commit");
    assert.match(failures[0], /GIT_FAILED@commit/);
    assert.match(failures[0], /push rejected/);
  });

  it("actualiza la lista de badges en README.md cuando incluye el marcador", async () => {
    const readmeContent = "# Repo\n\n<!-- translate-readme:badges -->\n\nContenido original.";
    const { deps, written } = createDeps({
      getInput: (name) => {
        if (name === "LANG") return "es";
        if (name === "FLAG") return "es";
        if (name === "LANG_NAME") return "Spanish";
        return "";
      },
      readFile: () => readmeContent,
      readdir: () => ["README.md", "README.es.md"],
      flagBadgeClient: async (code, opts) => ({
        code,
        markdown: `[![${opts.langName || code}](https://custom-icon-badges.demolab.com/badge/${opts.langName || code}-100%25-white.svg?logo=ghtr-${code})](README.${code}.md)`,
      }),
    });

    const result = await run(deps);
    assert.equal(result.ok, true);
    const updatedReadme = written[join("/virtual/repo", "README.md")];
    assert.ok(updatedReadme);
    assert.match(updatedReadme.content, /<!-- translate-readme:badges -->/);
    assert.match(updatedReadme.content, /\[!\[Spanish\]/);
  });

  it("preserva badges y nombres personalizados existentes en README.md al traducir otro idioma", async () => {
    const existingBadgesLine =
      "[![简体中文](https://custom-icon-badges.demolab.com/badge/%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87-100%25-white.svg?logo=ghtr-zh-cn)](README.zh-CN.md)";
    const readmeContent = `# Repo\n\n<!-- translate-readme:badges -->\n${existingBadgesLine}\n\nContenido original.`;

    const { deps, written } = createDeps({
      getInput: (name) => {
        if (name === "LANG") return "fr";
        if (name === "FLAG") return "fr";
        if (name === "LANG_NAME") return "Française";
        return "";
      },
      readFile: () => readmeContent,
      readdir: () => ["README.md", "README.zh-CN.md", "README.fr.md"],
      flagBadgeClient: async (code, opts) => ({
        code,
        markdown: `[![${opts.langName || code}](https://custom-icon-badges.demolab.com/badge/${encodeURIComponent(opts.langName || code)}-100%25-white.svg?logo=ghtr-${code})](README.${code}.md)`,
      }),
    });

    const result = await run(deps);
    assert.equal(result.ok, true);
    const updatedReadme = written[join("/virtual/repo", "README.md")];
    assert.ok(updatedReadme);
    assert.match(updatedReadme.content, /\[!\[简体中文\]/);
    assert.match(updatedReadme.content, /\[!\[Française\]/);
    assert.doesNotMatch(updatedReadme.content, /Chinese \(China\)/);
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
