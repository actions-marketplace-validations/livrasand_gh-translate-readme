"use strict";

const { ActionError } = require("./errors");

/**
 * Normaliza códigos de idioma para LibreTranslate / Argos Translate.
 * Los modelos de Argos Translate generalmente usan códigos ISO 639-1 de 2 letras
 * (por ejemplo "zh" en lugar de "zh-CN" o "zh-TW").
 */
function normalizeLibreTranslateLang(lang) {
  if (typeof lang !== "string") {
    return "";
  }
  const trimmed = lang.trim().toLowerCase();
  if (trimmed.startsWith("zh-")) {
    return "zh";
  }
  return trimmed;
}

/**
 * Crea un cliente de traducción que realiza llamadas HTTP POST a la API de LibreTranslate.
 */
function createLibreTranslateClient({
  url = "http://localhost:5000",
  apiKey = "",
  sourceLang = "auto",
  fetchClient = globalThis.fetch,
} = {}) {
  const baseUrl = (url || "http://localhost:5000").replace(/\/+$/, "");

  return async function translate(text, targetLang) {
    if (typeof fetchClient !== "function") {
      throw new ActionError({
        code: "TRANSLATION_FAILED",
        step: "translate",
        message: "Global fetch is not available in this environment.",
      });
    }

    const target = normalizeLibreTranslateLang(targetLang);
    const source = normalizeLibreTranslateLang(sourceLang) || "auto";
    const endpoint = `${baseUrl}/translate`;
    const payload = {
      q: text,
      source,
      target,
      format: "text",
    };

    if (apiKey) {
      payload.api_key = apiKey;
    }

    let response;
    try {
      response = await fetchClient(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    } catch (networkError) {
      throw new ActionError({
        code: "TRANSLATION_FAILED",
        step: "translate",
        message: `Network error connecting to LibreTranslate at ${baseUrl}: ${networkError.message}`,
        cause: networkError,
      });
    }

    let data;
    let parseError;
    try {
      data = await response.json();
    } catch (error) {
      parseError = error;
    }

    if (!response.ok) {
      const errorMsg =
        (!parseError && data && (data.error || data.message)) ||
        `HTTP ${response.status} ${response.statusText || "error"}`;
      throw new ActionError({
        code: "TRANSLATION_FAILED",
        step: "translate",
        message: `LibreTranslate error: ${errorMsg}`,
        details: { status: response.status, response: data },
      });
    }

    if (parseError) {
      throw new ActionError({
        code: "TRANSLATION_FAILED",
        step: "translate",
        message: `Failed to parse LibreTranslate response as JSON: ${parseError.message}`,
        details: { status: response.status },
        cause: parseError,
      });
    }

    if (!data || typeof data.translatedText !== "string") {
      throw new ActionError({
        code: "TRANSLATION_FAILED",
        step: "translate",
        message: "LibreTranslate response missing translatedText property",
        details: { response: data },
      });
    }

    return { text: data.translatedText };
  };
}

module.exports = {
  createLibreTranslateClient,
  normalizeLibreTranslateLang,
};
