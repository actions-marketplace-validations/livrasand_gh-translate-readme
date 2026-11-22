"use strict";

const { join } = require("path");
const { ActionError } = require("./errors");
const { SOURCE_CANDIDATES } = require("./config");
const { toAst, collectTextNodes } = require("./markdown");

function resolveSource({ cwd, readdir, readFile }) {
  let entries;
  try {
    entries = readdir(cwd);
  } catch (error) {
    throw new ActionError({
      code: "DIRECTORY_READ_FAILED",
      step: "read",
      message: `Cannot list directory "${cwd}"`,
      details: { cwd },
      cause: error,
    });
  }

  const filename = SOURCE_CANDIDATES.find((candidate) => entries.includes(candidate));
  if (!filename) {
    throw new ActionError({
      code: "README_NOT_FOUND",
      step: "read",
      message: `No README found in "${cwd}". Expected one of: ${SOURCE_CANDIDATES.join(", ")}.`,
      details: { cwd, expected: SOURCE_CANDIDATES },
    });
  }

  let markdown;
  try {
    markdown = readFile(join(cwd, filename), "utf8");
  } catch (error) {
    throw new ActionError({
      code: "README_READ_FAILED",
      step: "read",
      message: `Cannot read "${filename}" in "${cwd}"`,
      details: { file: filename, cwd },
      cause: error,
    });
  }

  if (typeof markdown !== "string" || markdown.trim() === "") {
    throw new ActionError({
      code: "README_EMPTY",
      step: "read",
      message: `"${filename}" is empty; there is nothing to translate.`,
      details: { file: filename },
    });
  }

  const ast = toAst(markdown);
  const nodes = collectTextNodes(ast);
  if (nodes.length === 0) {
    throw new ActionError({
      code: "README_NO_TEXT",
      step: "read",
      message: `"${filename}" has no translatable text (only code, HTML or whitespace).`,
      details: { file: filename },
    });
  }

  return { filename, markdown, ast, nodes };
}

module.exports = { resolveSource };
