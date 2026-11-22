"use strict";

const unified = require("unified");
const parse = require("remark-parse");
const stringify = require("remark-stringify");

// Traducir código, HTML o frontmatter rompe el README: se excluyen explícitamente.
const NON_TRANSLATABLE_TYPES = new Set(["code", "inlineCode", "html", "yaml", "toml"]);

function toAst(markdown) {
  return unified().use(parse).parse(markdown);
}

function toMarkdown(ast) {
  return unified().use(stringify).stringify(ast);
}

/** Devuelve referencias a los nodos de texto traducibles con su ruta en el AST. */
function collectTextNodes(root) {
  const entries = [];

  function walk(node, path, ancestors) {
    if (!node || typeof node !== "object" || NON_TRANSLATABLE_TYPES.has(node.type)) {
      return;
    }

    if (node.type === "text" && typeof node.value === "string" && node.value.trim() !== "") {
      entries.push({ node, path, index: entries.length, ancestors });
    }

    const children = Array.isArray(node.children) ? node.children : [];
    children.forEach((child, index) => {
      walk(child, `${path}.children[${index}]`, [...ancestors, node.type]);
    });
  }

  walk(root, "root", []);
  return entries;
}

module.exports = { toAst, toMarkdown, collectTextNodes, NON_TRANSLATABLE_TYPES };
