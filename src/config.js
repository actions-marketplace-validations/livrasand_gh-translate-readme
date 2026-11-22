"use strict";

const { ActionError } = require("./errors");

const DEFAULT_LANG = "zh-CN";
// ISO 639-1/3 opcionalmente seguido de guiones y región/variante: en, fr, zh-CN, es-419.
const LANG_PATTERN = /^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/;
const SOURCE_CANDIDATES = ["readme.md", "README.md", "Readme.md"];

function resolveLanguage(input) {
  const lang = typeof input === "string" ? input.trim() : "";
  if (!lang) {
    return DEFAULT_LANG;
  }

  if (!LANG_PATTERN.test(lang)) {
    throw new ActionError({
      code: "INVALID_LANGUAGE",
      step: "config",
      message: `Invalid LANG "${lang}". Use an ISO code such as "en", "fr" or "zh-CN".`,
      details: { received: input, expectedPattern: LANG_PATTERN.toString() },
    });
  }

  return lang;
}

module.exports = { DEFAULT_LANG, LANG_PATTERN, SOURCE_CANDIDATES, resolveLanguage };
