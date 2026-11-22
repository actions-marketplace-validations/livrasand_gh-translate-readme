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
const { createFlagBadgeClient, resolveShowPercentage } = require("./flags");
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

  const flagBadgeClient =
    overrides.flagBadgeClient ||
    createFlagBadgeClient({
      fetchClient,
      slugPrefix: "ghtr",
    });

  return {
    cwd: process.cwd(),
    getInput,
    setFailed: (message) => coreAdapter.setFailed(message),
    readdir: (dir) => fsAdapter.readdirSync(dir),
    readFile: (path, encoding) => fsAdapter.readFileSync(path, encoding),
    writeFile: (path, data, encoding) => fsAdapter.writeFileSync(path, data, encoding),
    translate,
    flagBadgeClient,
    createGit: () => gitAdapter(),
    sleep: defaultSleep,
    concurrency: 5,
    retries: 2,
    fetch: fetchClient,
    ...overrides,
    logger: createLogger(overrides.logger || console),
  };
}

function resolveShowPercentageInput(getInput) {
  const candidateNames = [
    "SHOW_PERCENTAGE",
    "SHOW_TRANSLATED_PERCENTAGE",
    "SHOW_TRANSLATED_PERCENT",
    "BADGE_SHOW_PERCENTAGE",
    "BADGE_PERCENTAGE",
    "PERCENTAGE",
    "SHOW_PERCENT",
    "BADGE_SHOW_PERCENT",
  ];
  for (const name of candidateNames) {
    let raw = "";
    try {
      raw = (getInput(name) || "").trim();
    } catch {
      raw = "";
    }
    if (raw !== "") {
      return resolveShowPercentage(raw, true);
    }
  }
  return true;
}

function resolveIconInput(getInput) {
  const iconNames = [
    "SHOW_ICON",
    "ICON",
    "BADGE_ICON",
    "USE_ICON",
    "SHOW_BADGE_ICON",
    "DISPLAY_ICON",
    "BADGE_ICON_MODE",
  ];
  for (const name of iconNames) {
    let raw = "";
    try {
      raw = (getInput(name) || "").trim();
    } catch {
      raw = "";
    }
    if (raw !== "") {
      const normalized = raw.toLowerCase();
      if (["true", "1", "yes", "on", "show", "shown", "icon"].includes(normalized)) {
        return true;
      }
      if (["false", "0", "no", "off", "hide", "hidden", "none", "percentage", "percent"].includes(normalized)) {
        return false;
      }
    }
  }
  return false;
}

function resolveBadgeDisplayMode(getInput) {
  const modeNames = [
    "BADGE_MODE",
    "BADGE_STYLE",
    "BADGE_TYPE",
    "BADGE_DISPLAY",
    "DISPLAY_MODE",
    "DISPLAY",
    "MODE",
    "STYLE",
    "TYPE",
  ];
  for (const name of modeNames) {
    let raw = "";
    try {
      raw = (getInput(name) || "").trim();
    } catch {
      raw = "";
    }
    if (raw !== "") {
      const normalized = raw.toLowerCase();
      if (normalized.includes("icon")) {
        return "icon";
      }
      if (normalized.includes("percent")) {
        return "percentage";
      }
    }
  }
  if (resolveIconInput(getInput)) {
    return "icon";
  }
  return "percentage";
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
    const iconMode = resolveBadgeDisplayMode(deps.getInput) === "icon";
    const showPercentage = iconMode ? false : resolveShowPercentageInput(deps.getInput);
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
        const percentageSegment = showPercentage ? "100%25" : "";

        // Extraer badges existentes para preservar sus nombres personalizados (LANG_NAME) y URLs
        const existingBadgesMap = new Map();
        const badgeRegex = /\[!\[([^\]]*)\]\(([^)]+)\)\]\(([^)]+)\)/g;
        let match;
        while ((match = badgeRegex.exec(mainReadme)) !== null) {
          const target = match[3];
          const targetCodeMatch = target.match(/README\.([A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*)\.md$/i);
          if (targetCodeMatch) {
            const targetCode = targetCodeMatch[1];
            existingBadgesMap.set(targetCode, match[0]);
          }
        }

        const badgePromises = langs.map(async (code) => {
          // Si ya existe en README.md y no es el idioma actual, preservar su badge intacto
          if (code !== lang && existingBadgesMap.has(code)) {
            return existingBadgesMap.get(code);
          }

          if (code !== lang) {
            let name = code;
            try {
              name = new Intl.DisplayNames(["en"], { type: "language" }).of(code) || code;
            } catch {
              name = code;
            }
            const slug = `ghtr-${String(code)
              .toLowerCase()
              .replace(/[^a-z0-9_-]/g, "-")}`;
            return `[![${name}](https://custom-icon-badges.demolab.com/badge/${encodeURIComponent(
              name,
            )}-${percentageSegment}-white.svg?logo=${encodeURIComponent(
              slug,
            )}&labelColor=white&color=white)](README.${code}.md)`;
          }

          const explicitFlag = (deps.getInput("FLAG") || "").trim();
          const explicitName = (deps.getInput("LANG_NAME") || "").trim();

          try {
            const badge = await deps.flagBadgeClient(code, {
              flag: explicitFlag,
              langName: explicitName,
              showPercentage,
              showPercent: showPercentage,
              showTranslatedPercentage: showPercentage,
              percentage: showPercentage,
              showIcon: iconMode,
              showIcons: iconMode,
              icon: iconMode,
              useIcon: iconMode,
              badgeIcon: iconMode,
              iconBadge: iconMode,
              displayIcon: iconMode,
              badgeMode: iconMode ? "icon" : "percentage",
              badgeStyle: iconMode ? "icon" : "percentage",
              badgeType: iconMode ? "icon" : "percentage",
              mode: iconMode ? "icon" : "percentage",
              style: iconMode ? "icon" : "percentage",
              type: iconMode ? "icon" : "percentage",
            });
            return badge.markdown;
          } catch {
            let name = explicitName || code;
            if (!explicitName) {
              try {
                name = new Intl.DisplayNames(["en"], { type: "language" }).of(code) || code;
              } catch {
                name = code;
              }
            }
            const fallbackSlug = `ghtr-${String(code)
              .toLowerCase()
              .replace(/[^a-z0-9_-]/g, "-")}`;
            return `[![${name}](https://custom-icon-badges.demolab.com/badge/${encodeURIComponent(
              name,
            )}-${percentageSegment}-white.svg?logo=${encodeURIComponent(
              fallbackSlug,
            )}&labelColor=white&color=white)](README.${code}.md)`;
          }
        });
        const badges = (await Promise.all(badgePromises)).join(" ");
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
