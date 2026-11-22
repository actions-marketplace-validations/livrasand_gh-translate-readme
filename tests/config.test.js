"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const {
  resolveLanguage,
  resolveProvider,
  resolveLibreTranslateUrl,
  resolveLibreTranslateApiKey,
  resolveSourceLang,
  DEFAULT_LANG,
  DEFAULT_PROVIDER,
  DEFAULT_LIBRETRANSLATE_URL,
  DEFAULT_SOURCE_LANG,
} = require("../src/config");

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

describe("resolveProvider", () => {
  it("devuelve el proveedor por defecto (google) cuando no hay input", () => {
    assert.equal(resolveProvider(undefined), DEFAULT_PROVIDER);
    assert.equal(resolveProvider(""), DEFAULT_PROVIDER);
    assert.equal(resolveProvider("   "), DEFAULT_PROVIDER);
    assert.equal(resolveProvider(null), DEFAULT_PROVIDER);
  });

  it("acepta proveedores soportados insensible a mayúsculas", () => {
    assert.equal(resolveProvider("google"), "google");
    assert.equal(resolveProvider("GOOGLE"), "google");
    assert.equal(resolveProvider("libretranslate"), "libretranslate");
    assert.equal(resolveProvider("  LibreTranslate  "), "libretranslate");
  });

  it("rechaza proveedores no soportados", () => {
    for (const invalid of ["bing", "deepl", "custom", "123"]) {
      assert.throws(
        () => resolveProvider(invalid),
        (error) => {
          assert.equal(error.code, "INVALID_PROVIDER");
          assert.equal(error.step, "config");
          assert.match(error.message, /Supported providers/);
          assert.equal(error.details.received, invalid);
          return true;
        },
      );
    }
  });
});

describe("resolveLibreTranslateUrl", () => {
  it("devuelve url por defecto si no se especifica", () => {
    assert.equal(resolveLibreTranslateUrl(undefined), DEFAULT_LIBRETRANSLATE_URL);
    assert.equal(resolveLibreTranslateUrl(""), DEFAULT_LIBRETRANSLATE_URL);
    assert.equal(resolveLibreTranslateUrl("   "), DEFAULT_LIBRETRANSLATE_URL);
    assert.equal(resolveLibreTranslateUrl(null), DEFAULT_LIBRETRANSLATE_URL);
  });

  it("acepta URLs HTTP y HTTPS válidas y elimina barras finales", () => {
    assert.equal(resolveLibreTranslateUrl("http://localhost:5000/"), "http://localhost:5000");
    assert.equal(resolveLibreTranslateUrl("https://translate.example.com///"), "https://translate.example.com");
    assert.equal(resolveLibreTranslateUrl("http://libretranslate:5000"), "http://libretranslate:5000");
  });

  it("rechaza URLs no válidas o protocolos no HTTP", () => {
    for (const invalid of ["not-a-url", "ftp://example.com", "file:///etc/passwd"]) {
      assert.throws(
        () => resolveLibreTranslateUrl(invalid),
        (error) => {
          assert.equal(error.code, "INVALID_CONFIG");
          assert.equal(error.step, "config");
          assert.match(error.message, /valid HTTP or HTTPS URL/);
          assert.equal(error.details.received, invalid);
          return true;
        },
      );
    }
  });
});

describe("resolveLibreTranslateApiKey", () => {
  it("devuelve string vacío si no se proporciona o no es string", () => {
    assert.equal(resolveLibreTranslateApiKey(undefined), "");
    assert.equal(resolveLibreTranslateApiKey(null), "");
    assert.equal(resolveLibreTranslateApiKey(""), "");
    assert.equal(resolveLibreTranslateApiKey(123), "");
  });

  it("recorta espacios alrededor de la clave", () => {
    assert.equal(resolveLibreTranslateApiKey("  my-secret-key  "), "my-secret-key");
  });
});

describe("resolveSourceLang", () => {
  it("devuelve auto por defecto si no se especifica", () => {
    assert.equal(resolveSourceLang(undefined), DEFAULT_SOURCE_LANG);
    assert.equal(resolveSourceLang(""), DEFAULT_SOURCE_LANG);
    assert.equal(resolveSourceLang("   "), DEFAULT_SOURCE_LANG);
    assert.equal(resolveSourceLang(null), DEFAULT_SOURCE_LANG);
  });

  it("acepta auto insensible a mayúsculas", () => {
    assert.equal(resolveSourceLang("auto"), "auto");
    assert.equal(resolveSourceLang("AUTO"), "auto");
  });

  it("acepta códigos de idioma ISO válidos", () => {
    assert.equal(resolveSourceLang("en"), "en");
    assert.equal(resolveSourceLang("es"), "es");
    assert.equal(resolveSourceLang("fr"), "fr");
  });

  it("rechaza códigos inválidos", () => {
    assert.throws(
      () => resolveSourceLang("invalid_lang!"),
      (error) => {
        assert.equal(error.code, "INVALID_LANGUAGE");
        assert.equal(error.step, "config");
        assert.match(error.message, /Invalid SOURCE_LANG/);
        return true;
      },
    );
  });
});
