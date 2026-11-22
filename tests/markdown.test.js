"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { toAst, toMarkdown, collectTextNodes } = require("../src/markdown");

const SAMPLE = [
  "# Título",
  "",
  "Texto del párrafo con **negrita** y [enlace](https://example.com).",
  "",
  "```js",
  'console.log("no traducir");',
  "```",
  "",
  "Usa `npm test` para verificar.",
  "",
  "<!-- comentario -->",
  "",
].join("\n");

describe("markdown", () => {
  it("el AST se puede serializar de vuelta sin perder estructura", () => {
    const output = toMarkdown(toAst(SAMPLE));
    assert.match(output, /^# Título/);
    assert.match(output, /```js/);
    assert.match(output, /\[enlace\]\(https:\/\/example\.com\)/);
  });

  it("collectTextNodes ignora bloques de código, código inline, HTML y espacios", () => {
    const entries = collectTextNodes(toAst(SAMPLE));
    const values = entries.map((entry) => entry.node.value);
    assert.deepEqual(values, [
      "Título",
      "Texto del párrafo con ",
      "negrita",
      " y ",
      "enlace",
      ".",
      "Usa ",
      " para verificar.",
    ]);
    assert.ok(!values.some((value) => value.includes("no traducir")));
    assert.ok(!values.some((value) => value.includes("npm test")));
    assert.ok(!values.some((value) => value.includes("comentario")));
  });

  it("cada entrada expone una ruta y un índice para diagnosticar fallos", () => {
    const [first] = collectTextNodes(toAst("# Hola"));
    assert.equal(first.node.value, "Hola");
    assert.equal(first.index, 0);
    assert.equal(first.path, "root.children[0].children[0]");
    assert.deepEqual(first.ancestors, ["root", "heading"]);
  });

  it("no devuelve entradas para un README con sólo código", () => {
    assert.deepEqual(collectTextNodes(toAst("```js\nconst a = 1;\n```\n")), []);
  });
});
