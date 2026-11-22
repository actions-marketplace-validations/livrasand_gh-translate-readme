"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { resolveLanguage, DEFAULT_LANG } = require("../src/config");

describe("resolveLanguage", () => {
  it("usa el idioma por defecto cuando no hay input", () => {
    assert.equal(resolveLanguage(undefined), DEFAULT_LANG);
    assert.equal(resolveLanguage(""), DEFAULT_LANG);
    assert.equal(resolveLanguage("   "), DEFAULT_LANG);
    assert.equal(resolveLanguage(null), DEFAULT_LANG);
  });

  it("acepta códigos ISO con y sin región", () => {
    for (const lang of ["en", "fr", "hi", "ar", "zh-CN", "pt-BR", "es-419"]) {
      assert.equal(resolveLanguage(lang), lang, `debería aceptar ${lang}`);
    }
  });

  it("recorta espacios alrededor del código", () => {
    assert.equal(resolveLanguage("  fr  "), "fr");
  });

  it("rechaza valores que podrían escapar del nombre de archivo", () => {
    const invalid = ["../etc/passwd", "en_US", "english", "zh CN", "zh-CN/../../x", "a", "..", "C:\\temp"];
    for (const lang of invalid) {
      assert.throws(
        () => resolveLanguage(lang),
        (error) => {
          assert.equal(error.code, "INVALID_LANGUAGE");
          assert.equal(error.step, "config");
          assert.match(error.message, /ISO code/);
          assert.equal(error.details.received, lang);
          return true;
        },
        `debería rechazar ${lang}`,
      );
    }
  });
});
