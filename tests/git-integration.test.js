"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { spawnSync } = require("child_process");
const { mkdtempSync, rmSync, writeFileSync } = require("fs");
const { tmpdir } = require("os");
const { join } = require("path");
const { createGitClient } = require("../src/git-client");
const { commitTranslation } = require("../src/git");
const { createLogger } = require("../src/logger");
const { createLoggerSink } = require("./helpers");

const gitAvailable = spawnSync("git", ["--version"], { stdio: "ignore" }).status === 0;

describe("commitTranslation con git real (sin red)", () => {
  it("hace un commit real del README traducido", async (t) => {
    if (!gitAvailable) {
      t.skip("git no está disponible en este entorno");
      return;
    }

    const cwd = mkdtempSync(join(tmpdir(), "translate-readme-git-"));
    try {
      const git = createGitClient({ baseDir: cwd });
      await git.init();
      await git.addConfig("user.name", "Test");
      await git.addConfig("user.email", "test@example.com");
      writeFileSync(join(cwd, "README.md"), "# Hola\n", "utf8");
      await git.add("README.md");
      await git.commit("initial");

      writeFileSync(join(cwd, "README.fr.md"), "# Salut\n", "utf8");
      let pushed = false;
      git.push = async () => { pushed = true; };

      const result = await commitTranslation({
        lang: "fr",
        outputPath: join(cwd, "README.fr.md"),
        createGit: () => git,
        logger: createLogger(createLoggerSink()),
      });

      assert.deepEqual(result, { committed: true, reason: "committed" });
      assert.equal(pushed, true);
      const log = await git.log();
      assert.match(log.latest.message, /Added README\.fr\.md/);
      assert.deepEqual((await git.status()).files, []);
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });

  it("no hace commit cuando el archivo traducido no cambió", async (t) => {
    if (!gitAvailable) {
      t.skip("git no está disponible en este entorno");
      return;
    }

    const cwd = mkdtempSync(join(tmpdir(), "translate-readme-git-"));
    try {
      const git = createGitClient({ baseDir: cwd });
      await git.init();
      await git.addConfig("user.name", "Test");
      await git.addConfig("user.email", "test@example.com");
      writeFileSync(join(cwd, "README.md"), "# Hola\n", "utf8");
      await git.add("README.md");
      await git.commit("initial");

      const result = await commitTranslation({
        lang: "fr",
        outputPath: join(cwd, "README.fr.md"),
        createGit: () => git,
        logger: createLogger(createLoggerSink()),
      });

      assert.deepEqual(result, { committed: false, reason: "unchanged" });
      assert.equal((await git.log()).all.length, 1);
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });
});
