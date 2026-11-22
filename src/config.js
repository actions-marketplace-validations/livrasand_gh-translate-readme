"use strict";

const { URL } = require("url");
const { ActionError } = require("./errors");

const DEFAULT_LANG = "zh-CN";
// ISO 639-1/3 opcionalmente seguido de guiones y región/variante: en, fr, zh-CN, es-419.
const LANG_PATTERN = /^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/;
const SOURCE_CANDIDATES = ["readme.md", "README.md", "Readme.md"];

const DEFAULT_PROVIDER = "google";
const SUPPORTED_PROVIDERS = ["google", "libretranslate"];
const DEFAULT_LIBRETRANSLATE_URL = "http://localhost:5000";
const DEFAULT_SOURCE_LANG = "auto";

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

function resolveProvider(input) {
  const provider = typeof input === "string" ? input.trim().toLowerCase() : "";
  if (!provider) {
    return DEFAULT_PROVIDER;
  }

  if (!SUPPORTED_PROVIDERS.includes(provider)) {
    throw new ActionError({
      code: "INVALID_PROVIDER",
      step: "config",
      message: `Invalid PROVIDER "${input}". Supported providers: ${SUPPORTED_PROVIDERS.join(", ")}.`,
      details: { received: input, supportedProviders: SUPPORTED_PROVIDERS },
    });
  }

  return provider;
}

function resolveLibreTranslateUrl(input) {
  const url = typeof input === "string" ? input.trim() : "";
  if (!url) {
    return DEFAULT_LIBRETRANSLATE_URL;
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error("Invalid protocol");
    }
    return url.replace(/\/+$/, "");
  } catch {
    throw new ActionError({
      code: "INVALID_CONFIG",
      step: "config",
      message: `Invalid LIBRETRANSLATE_URL "${input}". Must be a valid HTTP or HTTPS URL.`,
      details: { received: input },
    });
  }
}

function resolveLibreTranslateApiKey(input) {
  if (typeof input !== "string") {
    return "";
  }
  return input.trim();
}

function resolveSourceLang(input) {
  const source = typeof input === "string" ? input.trim() : "";
  if (!source) {
    return DEFAULT_SOURCE_LANG;
  }

  if (source.toLowerCase() === "auto") {
    return "auto";
  }

  if (!LANG_PATTERN.test(source)) {
    throw new ActionError({
      code: "INVALID_LANGUAGE",
      step: "config",
      message: `Invalid SOURCE_LANG "${source}". Use "auto" or an ISO code such as "en" or "fr".`,
      details: { received: input, expectedPattern: LANG_PATTERN.toString() },
    });
  }

  return source;
}

module.exports = {
  DEFAULT_LANG,
  LANG_PATTERN,
  SOURCE_CANDIDATES,
  DEFAULT_PROVIDER,
  SUPPORTED_PROVIDERS,
  DEFAULT_LIBRETRANSLATE_URL,
  DEFAULT_SOURCE_LANG,
  resolveLanguage,
  resolveProvider,
  resolveLibreTranslateUrl,
  resolveLibreTranslateApiKey,
  resolveSourceLang,
};
