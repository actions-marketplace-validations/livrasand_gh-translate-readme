"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { commitTranslation, isNothingToCommit, BOT_NAME, BOT_EMAIL } = require("../src/git");
const { createLoggerSink, createFakeGit } = require("./helpers");
const { createLogger } = require("../src/logger");

const OUTPUT_PATH = "/repo/README.fr.md";
const makeLogger = () => createLogger(createLoggerSink());

describe("isNothingToCommit", () => {
  it("reconoce los mensajes típicos de git", () => {
    assert.equal(isNothingToCommit(new Error("nothing to commit, working tree clean")), true);
    assert.equal(isNothingToCommit(new Error("no changes added to commit")), true);
    assert.equal(isNothingToCommit(new Error("permission denied")), false);
  });
});

describe("commitTranslation", () => {
  it("hace commit y push sólo del README traducido", async () => {
    const { git, calls } = createFakeGit({ statusFiles: [{ path: OUTPUT_PATH }] });
    const sink = createLoggerSink();
    const result = await commitTranslation({
      lang: "fr",
      outputPath: OUTPUT_PATH,
      createGit: () => git,
      logger: createLogger(sink),
    });

    assert.deepEqual(result, { committed: true, reason: "committed" });
    assert.deepEqual(calls, [
      ["status"],
      ["addConfig", "user.name", BOT_NAME],
      ["addConfig", "user.email", BOT_EMAIL],
      ["add", "README.fr.md"],
      ["add", "README.md"],
      ["commit", "docs: Added README.fr.md translation via https://github.com/livrasand/gh-translate-readme"],
      ["push"],
    ]);
    assert.ok(sink.lines.some((line) => line.includes("[translate-readme:commit] Translation pushed")));
  });

  it("no hace commit si el archivo traducido no cambió", async () => {
    const { git, calls } = createFakeGit({ statusFiles: [{ path: "src/otro.js" }] });
    const result = await commitTranslation({
      lang: "fr",
      outputPath: OUTPUT_PATH,
      createGit: () => git,
      logger: makeLogger(),
    });
    assert.deepEqual(result, { committed: false, reason: "unchanged" });
    assert.deepEqual(calls, [["status"]]);
  });

  it("detecta el archivo cuando git reporta una ruta relativa", async () => {
    const { git, calls } = createFakeGit({ statusFiles: [{ path: "README.fr.md" }] });
    await commitTranslation({
      lang: "fr",
      outputPath: OUTPUT_PATH,
      createGit: () => git,
      logger: makeLogger(),
    });
    assert.ok(calls.some(([name]) => name === "commit"));
  });

  it("trata 'nothing to commit' como un no-op", async () => {
    const { git } = createFakeGit({
      statusFiles: [{ path: OUTPUT_PATH }],
      commitError: new Error("nothing to commit, working tree clean"),
    });
    const result = await commitTranslation({
      lang: "fr",
      outputPath: OUTPUT_PATH,
      createGit: () => git,
      logger: makeLogger(),
    });
    assert.deepEqual(result, { committed: false, reason: "nothing-to-commit" });
  });

  it("reporta GIT_FAILED con el mensaje de git si falla el push", async () => {
    const failure = new Error("remote: permission denied");
    const { git } = createFakeGit({ statusFiles: [{ path: OUTPUT_PATH }] });
    git.push = async () => { throw failure; };

    await assert.rejects(
      commitTranslation({
        lang: "fr",
        outputPath: OUTPUT_PATH,
        createGit: () => git,
        logger: makeLogger(),
      }),
      (error) => {
        assert.equal(error.code, "GIT_FAILED");
        assert.equal(error.step, "commit");
        assert.equal(error.cause, failure);
        assert.equal(error.details.gitMessage, "remote: permission denied");
        assert.match(error.message, /README\.fr\.md/);
        return true;
      },
    );
  });
});
