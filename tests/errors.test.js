"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { ActionError, wrapError, formatError } = require("../src/errors");

describe("errores contextualizados", () => {
  it("wrapError conserva un ActionError intacto", () => {
    const original = new ActionError({ code: "X", step: "read", message: "boom" });
    assert.equal(wrapError(original, { code: "Y", step: "write" }), original);
  });

  it("wrapError guarda el error original como cause", () => {
    const cause = new TypeError("bad input");
    const wrapped = wrapError(cause, { code: "W", step: "write", details: { file: "x.md" } });
    assert.equal(wrapped.code, "W");
    assert.equal(wrapped.step, "write");
    assert.equal(wrapped.cause, cause);
    assert.deepEqual(wrapped.details, { file: "x.md", errorType: "TypeError" });
  });

  it("formatError incluye código, paso, detalles y causa", () => {
    const error = new ActionError({
      code: "GIT_FAILED",
      step: "commit",
      message: "No se pudo hacer push",
      details: { outputFile: "README.fr.md" },
      cause: new Error("permission denied"),
    });
    assert.equal(
      formatError(error),
      '[GIT_FAILED@commit] No se pudo hacer push | {"outputFile":"README.fr.md"} | cause: permission denied',
    );
  });

  it("formatError también funciona con errores nativos", () => {
    assert.match(formatError(new Error("boom")), /^\[UNEXPECTED_ERROR@unknown\] boom/);
  });

  it("toJSON expone la información útil para logs estructurados", () => {
    const json = new ActionError({ code: "C", step: "s", message: "m", cause: new Error("why") }).toJSON();
    assert.equal(json.code, "C");
    assert.equal(json.cause, "why");
  });
});
