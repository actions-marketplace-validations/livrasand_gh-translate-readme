"use strict";

const { basename } = require("path");
const { ActionError } = require("./errors");

const BOT_NAME = "github-actions[bot]";
const BOT_EMAIL = "41898282+github-actions[bot]@users.noreply.github.com";

function isNothingToCommit(error) {
  return /nothing to commit|no changes added to commit/i.test(String(error && error.message));
}

/** Hace commit y push sólo del README traducido; nunca de cambios ajenos al action. */
async function commitTranslation({ lang, outputPath, createGit, logger }) {
  const outputFile = basename(outputPath);
  const message = `docs: Added README.${lang}.md translation via https://github.com/dephraiim/translate-readme`;

  try {
    const git = createGit();
    const status = await git.status();
    const files = Array.isArray(status.files) ? status.files : [];
    const changed = files.some(
      (file) => file.path === outputPath || basename(file.path) === outputFile,
    );

    if (!changed) {
      logger.step("commit", "No changes to commit; translation is already up to date", {
        outputFile,
      });
      return { committed: false, reason: "unchanged" };
    }

    await git.addConfig("user.name", BOT_NAME);
    await git.addConfig("user.email", BOT_EMAIL);
    await git.add(outputFile);
    await git.commit(message);
    logger.step("commit", "Translation committed", { outputFile });
    await git.push();
    logger.step("commit", "Translation pushed", { outputFile });

    return { committed: true, reason: "committed" };
  } catch (error) {
    if (isNothingToCommit(error)) {
      logger.step("commit", "Git reported no changes to commit", { outputFile });
      return { committed: false, reason: "nothing-to-commit" };
    }

    throw new ActionError({
      code: "GIT_FAILED",
      step: "commit",
      message: `Failed to commit/push ${outputFile}`,
      details: { outputFile, lang, gitMessage: error.message },
      cause: error,
    });
  }
}

module.exports = { commitTranslation, isNothingToCommit, BOT_NAME, BOT_EMAIL };
