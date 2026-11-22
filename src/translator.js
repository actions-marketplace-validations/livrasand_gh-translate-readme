"use strict";

const { ActionError } = require("./errors");

/** Ejecuta `worker` con un máximo de `limit` tareas en paralelo y conserva el orden. */
async function mapWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  const size = Math.max(1, Math.min(Math.trunc(limit) || 1, items.length || 1));
  let cursor = 0;
  let failed = false;

  async function runner() {
    while (!failed && cursor < items.length) {
      const index = cursor++;
      try {
        results[index] = await worker(items[index], index);
      } catch (error) {
        failed = true;
        throw error;
      }
    }
  }

  await Promise.all(Array.from({ length: size }, runner));
  return results;
}

/** Traduce todos los nodos; un fallo se reporta con índice, ruta y texto original. */
async function translateNodes({
  nodes,
  lang,
  translate,
  sleep,
  logger,
  concurrency = 5,
  retries = 2,
}) {
  const stats = { total: nodes.length, succeeded: 0, failed: 0, retried: 0 };

  await mapWithConcurrency(nodes, concurrency, async (entry) => {
    const original = entry.node.value;
    let lastError;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const result = await translate(original, lang);
        if (!result || typeof result.text !== "string" || result.text.trim() === "") {
          throw new Error("Translation response did not contain non-empty text");
        }
        entry.node.value = result.text;
        stats.succeeded++;
        if (attempt > 0) {
          logger.step("translate", `Node recovered after ${attempt} retries`, {
            index: entry.index,
            path: entry.path,
          });
        }
        return;
      } catch (error) {
        lastError = error;
        if (attempt < retries) {
          stats.retried++;
          await sleep(100 * 2 ** attempt);
        }
      }
    }

    stats.failed++;
    throw new ActionError({
      code: "TRANSLATION_FAILED",
      step: "translate",
      message: `Could not translate text node #${entry.index} to "${lang}": ${lastError.message}`,
      details: {
        path: entry.path,
        index: entry.index,
        text: original,
        attempts: retries + 1,
      },
      cause: lastError,
    });
  });

  return stats;
}

module.exports = { mapWithConcurrency, translateNodes };
