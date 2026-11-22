"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { mapWithConcurrency, translateNodes } = require("../src/translator");
const { createLoggerSink } = require("./helpers");
const { createLogger } = require("../src/logger");

function makeNodes(values = ["uno", "dos", "tres"]) {
  return values.map((value, index) => ({
    node: { value },
    path: `root.children[${index}]`,
    index,
  }));
}

describe("mapWithConcurrency", () => {
  it("devuelve [] para una lista vacía", async () => {
    assert.deepEqual(await mapWithConcurrency([], 3, async () => 1), []);
  });

  it("respeta el límite de concurrencia y conserva el orden", async () => {
    let active = 0;
    let maxActive = 0;
    const result = await mapWithConcurrency([1, 2, 3, 4, 5], 2, async (value) => {
      active++;
      maxActive = Math.max(maxActive, active);
      await Promise.resolve();
      active--;
      return value * 10;
    });
    assert.deepEqual(result, [10, 20, 30, 40, 50]);
    assert.equal(maxActive, 2);
  });

  it("normaliza límites inválidos a 1", async () => {
    let active = 0;
    let maxActive = 0;
    await mapWithConcurrency([1, 2, 3], 0, async () => {
      active++;
      maxActive = Math.max(maxActive, active);
      await Promise.resolve();
      active--;
    });
    assert.equal(maxActive, 1);
  });

  it("propaga el primer error y no inicia más tareas", async () => {
    let started = 0;
    await assert.rejects(
      mapWithConcurrency([1, 2, 3, 4], 1, async (value) => {
        started++;
        if (value === 2) {
          throw new Error("boom");
        }
      }),
      /boom/,
    );
    assert.equal(started, 2);
  });
});

describe("translateNodes", () => {
  it("traduce cada nodo pasando el idioma y devuelve estadísticas", async () => {
    const nodes = makeNodes();
    const calls = [];
    const stats = await translateNodes({
      nodes,
      lang: "fr",
      translate: async (text, lang) => {
        calls.push([text, lang]);
        return { text: `FR:${text}` };
      },
      sleep: async () => {},
      logger: createLogger(createLoggerSink()),
      retries: 0,
    });

    assert.deepEqual(
      calls.map(([text]) => text),
      ["uno", "dos", "tres"],
    );
    assert.ok(calls.every(([, lang]) => lang === "fr"));
    assert.deepEqual(nodes.map((entry) => entry.node.value), ["FR:uno", "FR:dos", "FR:tres"]);
    assert.deepEqual(stats, { total: 3, succeeded: 3, failed: 0, retried: 0 });
  });

  it("reintenta antes de fallar y registra la recuperación", async () => {
    const nodes = makeNodes(["hola"]);
    const sink = createLoggerSink();
    let attempts = 0;
    const stats = await translateNodes({
      nodes,
      lang: "es",
      translate: async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error("timeout");
        }
        return { text: "hello" };
      },
      sleep: async () => {},
      logger: createLogger(sink),
      retries: 2,
    });

    assert.equal(attempts, 3);
    assert.equal(nodes[0].node.value, "hello");
    assert.deepEqual(stats, { total: 1, succeeded: 1, failed: 0, retried: 2 });
    assert.ok(sink.lines.some((line) => line.includes("Node recovered after 2 retries")));
  });

  it("lanza TRANSLATION_FAILED con ruta y texto original si agota los reintentos", async () => {
    const nodes = makeNodes(["texto original"]);
    await assert.rejects(
      translateNodes({
        nodes,
        lang: "de",
        translate: async () => {
          throw new Error("network down");
        },
        sleep: async () => {},
        logger: createLogger(createLoggerSink()),
        retries: 1,
      }),
      (error) => {
        assert.equal(error.code, "TRANSLATION_FAILED");
        assert.equal(error.step, "translate");
        assert.match(error.message, /#0/);
        assert.match(error.message, /network down/);
        assert.equal(error.details.path, "root.children[0]");
        assert.equal(error.details.text, "texto original");
        assert.equal(error.details.attempts, 2);
        return true;
      },
    );
  });

  it("considera inválida una respuesta sin texto no vacío", async () => {
    for (const response of [undefined, {}, { text: "" }, { text: "   " }]) {
      await assert.rejects(
        translateNodes({
          nodes: makeNodes(["hola"]),
          lang: "fr",
          translate: async () => response,
          sleep: async () => {},
          logger: createLogger(createLoggerSink()),
          retries: 0,
        }),
        (error) => {
          assert.equal(error.code, "TRANSLATION_FAILED");
          assert.match(error.message, /non-empty text|Could not translate/);
          return true;
        },
      );
    }
  });

  it("no llama a la API si no hay nodos", async () => {
    let called = false;
    const stats = await translateNodes({
      nodes: [],
      lang: "fr",
      translate: async () => {
        called = true;
        return { text: "x" };
      },
      sleep: async () => {},
      logger: createLogger(createLoggerSink()),
    });
    assert.equal(called, false);
    assert.equal(stats.total, 0);
  });
});
