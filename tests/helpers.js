"use strict";

const { mkdtempSync, writeFileSync, rmSync } = require("fs");
const { tmpdir } = require("os");
const { join } = require("path");

const DEFAULT_README = "# Hello\n\nSome text to translate.\n";

function createTempRepo({ readmeName = "README.md", readme = DEFAULT_README } = {}) {
  const cwd = mkdtempSync(join(tmpdir(), "translate-readme-"));
  if (readmeName) {
    writeFileSync(join(cwd, readmeName), readme, "utf8");
  }
  return { cwd, cleanup: () => rmSync(cwd, { recursive: true, force: true }) };
}

function createLoggerSink() {
  const lines = [];
  return {
    lines,
    log: (...args) => lines.push(args.join(" ")),
    error: (...args) => lines.push(args.join(" ")),
  };
}

function createFakeGit({ statusFiles = [], commitError } = {}) {
  const calls = [];
  const git = {
    status: async () => {
      calls.push(["status"]);
      return { files: statusFiles };
    },
    addConfig: async (key, value) => calls.push(["addConfig", key, value]),
    add: async (file) => calls.push(["add", file]),
    commit: async (message) => {
      calls.push(["commit", message]);
      if (commitError) {
        throw commitError;
      }
    },
    push: async () => calls.push(["push"]),
  };
  return { git, calls };
}

function createDeps(overrides = {}) {
  const sink = createLoggerSink();
  const { git, calls } = createFakeGit({
    statusFiles: overrides.statusFiles || [],
    commitError: overrides.commitError,
  });
  const written = {};
  const failures = [];

  const overrideGetInput = overrides.getInput;
  const getInput = (name) => {
    if (typeof overrideGetInput === "function") {
      if (overrideGetInput.length === 0) {
        return name === "LANG" ? overrideGetInput() : "";
      }
      return overrideGetInput(name);
    }
    return "";
  };

  const defaultTranslate = async (text) => ({ text: `[${text}]` });
  const translate =
    overrides.translate !== undefined
      ? overrides.translate
      : (overrides.fetch ? undefined : defaultTranslate);

  const deps = {
    cwd: "/virtual/repo",
    getInput,
    setFailed: (message) => failures.push(message),
    readdir: () => ["README.md"],
    readFile: () => DEFAULT_README,
    writeFile: (path, content, encoding) => {
      written[path] = { content, encoding };
    },
    ...(translate !== undefined ? { translate } : {}),
    createGit: () => git,
    sleep: async () => {},
    logger: sink,
    concurrency: 2,
    retries: 1,
    ...overrides,
  };

  if (overrides.translate === undefined && overrides.fetch) {
    delete deps.translate;
  }
  deps.getInput = getInput;

  return { deps, sink, written, failures, gitCalls: calls };
}

module.exports = {
  DEFAULT_README,
  createTempRepo,
  createLoggerSink,
  createFakeGit,
  createDeps,
};
