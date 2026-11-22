"use strict";

const { Buffer } = require("buffer");
const { ActionError } = require("./errors");

/**
 * Mapeo de códigos de idioma (ISO 639-1 / etiquetas IETF) a códigos de país (ISO 3166-1 alpha-2)
 * para obtener la bandera adecuada desde FlagCDN.
 */
const LANGUAGE_TO_COUNTRY_MAP = {
  en: "us",
  "en-us": "us",
  "en-gb": "gb",
  es: "es",
  "es-es": "es",
  fr: "fr",
  de: "de",
  it: "it",
  pt: "pt",
  "pt-br": "br",
  ru: "ru",
  ja: "jp",
  ko: "kr",
  zh: "cn",
  "zh-cn": "cn",
  "zh-tw": "tw",
  "zh-hk": "hk",
  hi: "in",
  ar: "sa",
  bn: "bd",
  id: "id",
  ms: "my",
  th: "th",
  vi: "vn",
  tr: "tr",
  pl: "pl",
  uk: "ua",
  nl: "nl",
  el: "gr",
  sv: "se",
  no: "no",
  da: "dk",
  fi: "fi",
  cs: "cz",
  ro: "ro",
  hu: "hu",
  he: "il",
  fa: "ir",
  bg: "bg",
  hr: "hr",
  sk: "sk",
  sl: "si",
  et: "ee",
  lv: "lv",
  lt: "lt",
};

/**
 * Resuelve el código de país de 2 letras para FlagCDN.
 */
function resolveCountryCode(lang, explicitFlag = "") {
  if (typeof explicitFlag === "string" && explicitFlag.trim()) {
    return explicitFlag.trim().toLowerCase();
  }
  if (typeof lang !== "string" || !lang.trim()) {
    return "";
  }

  const normalized = lang.trim().toLowerCase();
  if (LANGUAGE_TO_COUNTRY_MAP[normalized]) {
    return LANGUAGE_TO_COUNTRY_MAP[normalized];
  }

  // Si tiene región (ej: es-MX, fr-CA), extrae el código de país
  const parts = normalized.split("-");
  if (parts.length > 1 && parts[parts.length - 1].length === 2) {
    return parts[parts.length - 1];
  }

  // Si es un código de 2 letras estándar, úsalo directamente como fallback
  if (normalized.length === 2) {
    return normalized;
  }

  return "";
}

/**
 * Obtiene el nombre legible del idioma en inglés o usa el fallback.
 */
function resolveLanguageDisplayName(lang, explicitName = "", locale = "en") {
  if (typeof explicitName === "string" && explicitName.trim()) {
    return explicitName.trim();
  }
  if (typeof lang !== "string" || !lang.trim()) {
    return "";
  }

  try {
    return new Intl.DisplayNames([locale], { type: "language" }).of(lang) || lang;
  } catch {
    return lang;
  }
}

/**
 * Genera el identificador único (slug) para custom-icon-badges.
 */
function buildBadgeSlug(lang, { prefix = "ghtr" } = {}) {
  const sanitized = String(lang).toLowerCase().replace(/[^a-z0-9_-]/g, "-");
  return `${prefix}-${sanitized}`;
}

/**
 * Construye la URL del badge de custom-icon-badges.
 */
function buildBadgeUrl({
  badgesUrl = "https://custom-icon-badges.demolab.com",
  name,
  slug,
  color = "white",
  labelColor = "white",
  message = "100%",
}) {
  const base = badgesUrl.replace(/\/+$/, "");
  const encodedName = encodeURIComponent(name);
  const encodedMsg = encodeURIComponent(message);
  const encodedColor = encodeURIComponent(color);
  const encodedLogo = encodeURIComponent(slug);
  const encodedLabelColor = encodeURIComponent(labelColor);

  return `${base}/badge/${encodedName}-${encodedMsg}-${encodedColor}.svg?logo=${encodedLogo}&labelColor=${encodedLabelColor}&color=${encodedColor}`;
}

/**
 * Construye el markdown del enlace con badge.
 */
function buildBadgeMarkdown({ name, badgeUrl, code, targetFile }) {
  const link = targetFile || `README.${code}.md`;
  return `[![${name}](${badgeUrl})](${link})`;
}

/**
 * Crea el cliente para descargar banderas de FlagCDN y subirlas a custom-icon-badges.
 */
function createFlagBadgeClient({
  flagCdnUrl = "https://flagcdn.com",
  badgesUrl = "https://custom-icon-badges.demolab.com",
  slugPrefix = "ghtr",
  fetchClient = globalThis.fetch,
} = {}) {
  const baseUrlBadges = (badgesUrl || "https://custom-icon-badges.demolab.com").replace(/\/+$/, "");
  const baseUrlFlagCdn = (flagCdnUrl || "https://flagcdn.com").replace(/\/+$/, "");

  /**
   * Sube un icono SVG en formato Base64 a custom-icon-badges.
   */
  async function uploadIcon({ slug, base64Data }) {
    if (typeof fetchClient !== "function") {
      throw new ActionError({
        code: "BADGE_FAILED",
        step: "badge",
        message: "Global fetch is not available in this environment.",
      });
    }

    const endpoint = `${baseUrlBadges}/`;
    const payload = {
      slug,
      type: "svg+xml",
      data: base64Data,
    };

    let response;
    try {
      response = await fetchClient(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (networkError) {
      throw new ActionError({
        code: "ICON_UPLOAD_FAILED",
        step: "badge",
        message: `Network error uploading icon "${slug}" to ${baseUrlBadges}: ${networkError.message}`,
        cause: networkError,
      });
    }

    // 200 = Éxito / Creado nuevo
    if (response.status === 200) {
      return { uploaded: true, alreadyExisted: false };
    }

    // 409 = El slug ya existe (idempotente y totalmente utilizable)
    if (response.status === 409) {
      return { uploaded: false, alreadyExisted: true };
    }

    // Cualquier otro error
    let data;
    try {
      data = await response.json();
    } catch {
      // Ignora error de parseo si devuelve texto o HTML de error
    }

    const errorMsg = (data && (data.message || data.error)) || `HTTP ${response.status} ${response.statusText || "error"}`;
    throw new ActionError({
      code: "ICON_UPLOAD_FAILED",
      step: "badge",
      message: `Failed to upload icon "${slug}" to Custom Icon Badges: ${errorMsg}`,
      details: { status: response.status, response: data },
    });
  }

  /**
   * Descarga la bandera SVG desde FlagCDN y la convierte a base64.
   */
  async function fetchFlagSvgBase64(countryCode) {
    if (typeof fetchClient !== "function") {
      throw new ActionError({
        code: "BADGE_FAILED",
        step: "badge",
        message: "Global fetch is not available in this environment.",
      });
    }

    const url = `${baseUrlFlagCdn}/${countryCode.toLowerCase()}.svg`;
    let response;
    try {
      response = await fetchClient(url);
    } catch (networkError) {
      throw new ActionError({
        code: "FLAG_FETCH_FAILED",
        step: "badge",
        message: `Network error fetching flag from ${url}: ${networkError.message}`,
        cause: networkError,
      });
    }

    if (!response.ok) {
      throw new ActionError({
        code: "FLAG_NOT_FOUND",
        step: "badge",
        message: `Flag not found on FlagCDN for country code "${countryCode}" (HTTP ${response.status}).`,
        details: { status: response.status, url },
      });
    }

    let base64;
    if (typeof response.arrayBuffer === "function") {
      const buffer = await response.arrayBuffer();
      base64 = Buffer.from(buffer).toString("base64");
    } else {
      const text = await response.text();
      base64 = Buffer.from(text, "utf8").toString("base64");
    }

    return base64;
  }

  /**
   * Sube la bandera si es necesario y devuelve la información del badge.
   */
  async function uploadAndGetBadge(lang, options = {}) {
    const countryCode = resolveCountryCode(lang, options.flag);
    if (!countryCode) {
      throw new ActionError({
        code: "FLAG_NOT_FOUND",
        step: "badge",
        message: `Could not resolve country code for language "${lang}". Provide a FLAG input.`,
        details: { lang },
      });
    }

    const slug = options.slug || buildBadgeSlug(lang, { prefix: slugPrefix, countryCode });
    const name = resolveLanguageDisplayName(lang, options.langName);

    // 1. Descargar SVG de FlagCDN
    const base64Data = await fetchFlagSvgBase64(countryCode);

    // 2. Subir a Custom Icon Badges
    const uploadResult = await uploadIcon({ slug, base64Data });

    // 3. Construir URLs y Markdown
    const badgeUrl = buildBadgeUrl({
      badgesUrl: baseUrlBadges,
      name,
      slug,
      color: options.color || "white",
      labelColor: options.labelColor || "white",
      message: options.message || "100%",
    });

    const markdown = buildBadgeMarkdown({
      name,
      badgeUrl,
      code: lang,
      targetFile: options.targetFile,
    });

    return {
      code: lang,
      countryCode,
      slug,
      name,
      badgeUrl,
      markdown,
      uploaded: uploadResult.uploaded,
      alreadyExisted: uploadResult.alreadyExisted,
    };
  }

  // Permitir llamar a la función directamente o a través de sus métodos
  const client = uploadAndGetBadge;
  client.uploadAndGetBadge = uploadAndGetBadge;
  client.uploadIcon = uploadIcon;
  client.fetchFlagSvgBase64 = fetchFlagSvgBase64;

  return client;
}

module.exports = {
  LANGUAGE_TO_COUNTRY_MAP,
  resolveCountryCode,
  resolveLanguageDisplayName,
  buildBadgeSlug,
  buildBadgeUrl,
  buildBadgeMarkdown,
  createFlagBadgeClient,
};
