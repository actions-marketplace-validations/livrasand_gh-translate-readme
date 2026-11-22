"use strict";

const { readdirSync, readFileSync, writeFileSync } = require("fs");
const { join } = require("path");
const core = require("@actions/core");
const { translate: translateApi } = require("@vitalets/google-translate-api");
const { createGitClient } = require("./git-client");

const { wrapError, formatError } = require("./errors");
const { createLogger } = require("./logger");
const {
  resolveLanguage,
  resolveProvider,
  resolveLibreTranslateUrl,
  resolveLibreTranslateApiKey,
  resolveSourceLang,
} = require("./config");
const { createLibreTranslateClient } = require("./libretranslate");
const { resolveSource } = require("./readme");
const { toMarkdown } = require("./markdown");
const { translateNodes } = require("./translator");
const { commitTranslation } = require("./git");

const STEP_CODES = {
  init: "UNEXPECTED_ERROR",
  config: "CONFIG_FAILED",
  read: "READ_FAILED",
  translate: "TRANSLATE_FAILED",
  write: "WRITE_FAILED",
  commit: "COMMIT_FAILED",
};

function defaultSleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * `overrides` sustituye dependencias por test; `adapters` sustituye las librerías
 * externas para verificar que el cableado por defecto es correcto.
 */
function buildDependencies(overrides = {}, adapters = {}) {
  const {
    core: coreAdapter = core,
    translate: translateAdapter = translateApi,
    git: gitAdapter = createGitClient,
    fs: fsAdapter = { readdirSync, readFileSync, writeFileSync },
    fetch: fetchAdapter = globalThis.fetch,
  } = adapters;

  const fetchClient = overrides.fetch || fetchAdapter;
  const getInput = overrides.getInput || ((name) => coreAdapter.getInput(name));

  const translate =
    overrides.translate ||
    ((text, lang) => {
      const rawProvider = (getInput("PROVIDER") || "").trim().toLowerCase();
      if (rawProvider === "libretranslate") {
        const rawLibreUrl = (
          getInput("LIBRETRANSLATE_URL") ||
          getInput("API_URL") ||
          "http://localhost:5000"
        ).trim();
        const rawLibreApiKey = (
          getInput("LIBRETRANSLATE_API_KEY") ||
          getInput("API_KEY") ||
          ""
        ).trim();
        const rawSourceLang = (getInput("SOURCE_LANG") || "auto").trim();
        const client = createLibreTranslateClient({
          url: rawLibreUrl,
          apiKey: resolveLibreTranslateApiKey(rawLibreApiKey),
          sourceLang: rawSourceLang,
          fetchClient,
        });
        return client(text, lang);
      }
      return translateAdapter(text, { to: lang });
    });

  return {
    cwd: process.cwd(),
    getInput,
    setFailed: (message) => coreAdapter.setFailed(message),
    readdir: (dir) => fsAdapter.readdirSync(dir),
    readFile: (path, encoding) => fsAdapter.readFileSync(path, encoding),
    writeFile: (path, data, encoding) => fsAdapter.writeFileSync(path, data, encoding),
    translate,
    createGit: () => gitAdapter(),
    sleep: defaultSleep,
    concurrency: 5,
    retries: 2,
    fetch: fetchClient,
    ...overrides,
    logger: createLogger(overrides.logger || console),
  };
}

async function run(overrides = {}) {
  const deps = buildDependencies(overrides);
  const { logger } = deps;
  let step = "init";

  try {
    step = "config";
    const lang = resolveLanguage(deps.getInput("LANG"));
    const ignored = (deps.getInput("IGNORE") || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    if (ignored.includes(lang)) {
      logger.step("config", "Language is ignored; skipping translation", { lang });
      return { ok: true, lang, skipped: true };
    }
    const provider = resolveProvider(deps.getInput("PROVIDER"));
    const sourceLang = resolveSourceLang(deps.getInput("SOURCE_LANG"));
    let libreTranslateUrl;
    if (provider === "libretranslate") {
      libreTranslateUrl = resolveLibreTranslateUrl(
        deps.getInput("LIBRETRANSLATE_URL") || deps.getInput("API_URL")
      );
    }

    logger.step("config", "Configuration resolved", {
      lang,
      provider,
      sourceLang,
      ...(libreTranslateUrl ? { libreTranslateUrl } : {}),
    });

    step = "read";
    const source = resolveSource(deps);
    logger.step("read", "README parsed", {
      file: source.filename,
      textNodes: source.nodes.length,
    });

    step = "translate";
    const stats = await translateNodes({
      nodes: source.nodes,
      lang,
      translate: deps.translate,
      sleep: deps.sleep,
      logger,
      concurrency: deps.concurrency,
      retries: deps.retries,
    });
    logger.step("translate", "Translation finished", stats);

    step = "write";
    const outputFile = `README.${lang}.md`;
    const outputPath = join(deps.cwd, outputFile);
    deps.writeFile(outputPath, toMarkdown(source.ast), "utf8");

    // Optionally keep the main README's translation badge list up to date.
    try {
      const mainReadmePath = join(deps.cwd, "README.md");
      let mainReadme = deps.readFile(mainReadmePath, "utf8");
      const marker = "<!-- translate-readme:badges -->";
      if (typeof mainReadme === "string" && mainReadme.includes(marker)) {
        const files = deps.readdir(deps.cwd).filter((name) =>
          /^README\.[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*\.md$/.test(name),
        );
        const langs = files
          .map((name) => name.match(/^README\.(.+)\.md$/)[1])
          .sort();
        const badges = langs
          .map((code) => {
            const countryCodes = {
              en: "us",
              "zh-CN": "cn",
              "zh-TW": "tw",
              hi: "in",
              fr: "fr",
              ar: "sa",
              es: "es",
              de: "de",
              pt: "pt",
              ja: "jp",
              ko: "kr",
              ru: "ru",
              it: "it",
            };
            let name = code;
            try {
              name = new Intl.DisplayNames(["en"], { type: "language" }).of(code) || code;
            } catch {
              name = code;
            }
            return `[![${name}](https://custom-icon-badges.demolab.com/badge/${encodeURIComponent(
              name,
            )}-100%25-white.svg?logo=ghtr-${encodeURIComponent(
              code,
            )}&labelColor=white&color=white)](README.${code}.md)`;
          })
          .join(" ");
        const lines = mainReadme.split("\n");
        const filtered = [];
        let inserted = false;
        for (const line of lines) {
          if (line.trim() === marker) {
            if (!inserted) {
              filtered.push(marker);
              filtered.push(badges);
              inserted = true;
            }
            continue;
          }
          if (/^\[!\[/.test(line.trim())) {
            continue;
          }
          filtered.push(line);
        }
        if (!inserted) {
          filtered.unshift(marker, badges);
        }
        mainReadme = filtered.join("\n").replace(/\n{3,}/g, "\n\n");
        deps.writeFile(mainReadmePath, mainReadme, "utf8");
      }
    } catch (_error) {
      logger.step("write", "Could not update main README badges", { error: _error.message });
    }
    logger.step("write", "Translated README written", { outputFile });

    step = "commit";
    const gitResult = await commitTranslation({
      lang,
      outputPath,
      createGit: deps.createGit,
      logger,
    });

    logger.info("Done");
    return { ok: true, lang, provider, outputFile, outputPath, stats, git: gitResult };
  } catch (error) {
    const failure = wrapError(error, {
      code: STEP_CODES[step],
      step,
      details: { step },
    });
    deps.setFailed(formatError(failure));
    return { ok: false, error: failure };
  }
}

module.exports = { run, buildDependencies, STEP_CODES };
