"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { join } = require("path");
const { resolveSource } = require("../src/readme");
const { createTempRepo, createLoggerSink, DEFAULT_README } = require("./helpers");

function depsFor(readme, entries = ["README.md"]) {
  return {
    cwd: "/repo",
    readdir: () => entries,
    readFile: (path, encoding) => {
      assert.equal(encoding, "utf8");
      assert.equal(path, join("/repo", "README.md"));
      return readme;
    },
  };
}

describe("resolveSource", () => {
  it("prefiere readme.md en minúsculas cuando existen ambos", () => {
    const source = resolveSource({
      cwd: "/repo",
      readdir: () => ["README.md", "readme.md"],
      readFile: (path) => (path.endsWith("readme.md") && !path.endsWith("README.md") ? "# lowercase" : "# uppercase"),
    });
    assert.equal(source.filename, "readme.md");
    assert.equal(source.markdown, "# lowercase");
    assert.equal(source.nodes.length, 1);
  });

  it("acepta README.md y Readme.md", () => {
    for (const filename of ["README.md", "Readme.md"]) {
      const source = resolveSource({
        cwd: "/repo",
        readdir: () => [filename],
        readFile: () => DEFAULT_README,
      });
      assert.equal(source.filename, filename);
    }
  });

  it("falla con README_NOT_FOUND si no hay README", () => {
    assert.throws(
      () => resolveSource({ cwd: "/repo", readdir: () => ["src", "package.json"], readFile: () => "" }),
      (error) => {
        assert.equal(error.code, "README_NOT_FOUND");
        assert.equal(error.step, "read");
        assert.match(error.message, /readme\.md, README\.md, Readme\.md/);
        return true;
      },
    );
  });

  it("falla con README_EMPTY si el archivo está vacío", () => {
    assert.throws(
      () => resolveSource(depsFor("   \n")),
      (error) => {
        assert.equal(error.code, "README_EMPTY");
        assert.equal(error.details.file, "README.md");
        return true;
      },
    );
  });

  it("falla con README_NO_TEXT si sólo contiene código", () => {
    assert.throws(
      () => resolveSource(depsFor("```js\nconst x = 1;\n```")),
      (error) => {
        assert.equal(error.code, "README_NO_TEXT");
        return true;
      },
    );
  });

  it("envuelve errores de lectura de directorio y de archivo", () => {
    assert.throws(
      () => resolveSource({ cwd: "/repo", readdir: () => { throw new Error("EACCES"); }, readFile: () => "" }),
      (error) => error.code === "DIRECTORY_READ_FAILED" && error.cause.message === "EACCES",
    );
    assert.throws(
      () => resolveSource({ cwd: "/repo", readdir: () => ["README.md"], readFile: () => { throw new Error("ENOENT"); } }),
      (error) => error.code === "README_READ_FAILED" && error.cause.message === "ENOENT",
    );
  });

  it("funciona contra un repositorio temporal real", () => {
    const repo = createTempRepo({ readme: "# Título\n\nTexto.\n" });
    try {
      const { readdirSync, readFileSync } = require("fs");
      const source = resolveSource({
        cwd: repo.cwd,
        readdir: readdirSync,
        readFile: readFileSync,
      });
      assert.equal(source.filename, "README.md");
      assert.equal(source.nodes.length, 2);
    } finally {
      repo.cleanup();
    }
  });
});

describe("logger", () => {
  it("prefija los mensajes con el paso correspondiente", () => {
    const sink = createLoggerSink();
    const { createLogger } = require("../src/logger");
    const logger = createLogger(sink);
    logger.info("Done");
    logger.step("commit", "Pushed", { files: 1 });
    logger.error("Fallback");
    assert.deepEqual(sink.lines, [
      "[translate-readme] Done",
      '[translate-readme:commit] Pushed {"files":1}',
      "[translate-readme:error] Fallback",
    ]);
  });
});
