"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const {
  createLibreTranslateClient,
  normalizeLibreTranslateLang,
} = require("../src/libretranslate");

describe("normalizeLibreTranslateLang", () => {
  it("devuelve string vacío si no recibe un string", () => {
    assert.equal(normalizeLibreTranslateLang(null), "");
    assert.equal(normalizeLibreTranslateLang(undefined), "");
    assert.equal(normalizeLibreTranslateLang(123), "");
  });

  it("recorta espacios", () => {
    assert.equal(normalizeLibreTranslateLang("  es  "), "es");
  });

  it("normaliza códigos de chino compuesto a zh", () => {
    assert.equal(normalizeLibreTranslateLang("zh-CN"), "zh");
    assert.equal(normalizeLibreTranslateLang("zh-TW"), "zh");
    assert.equal(normalizeLibreTranslateLang("zh-Hans"), "zh");
  });

  it("mantiene intactos otros códigos válidos", () => {
    assert.equal(normalizeLibreTranslateLang("fr"), "fr");
    assert.equal(normalizeLibreTranslateLang("ar"), "ar");
    assert.equal(normalizeLibreTranslateLang("hi"), "hi");
    assert.equal(normalizeLibreTranslateLang("es-419"), "es-419");
  });
});

describe("createLibreTranslateClient", () => {
  it("traduce texto correctamente en el camino feliz", async () => {
    let capturedUrl;
    let capturedOptions;

    const fakeFetch = async (url, options) => {
      capturedUrl = url;
      capturedOptions = options;
      return {
        ok: true,
        status: 200,
        json: async () => ({ translatedText: "Hola Mundo" }),
      };
    };

    const client = createLibreTranslateClient({
      url: "http://localhost:5000/",
      fetchClient: fakeFetch,
    });

    const result = await client("Hello World", "es");

    assert.equal(capturedUrl, "http://localhost:5000/translate");
    assert.equal(capturedOptions.method, "POST");
    assert.equal(capturedOptions.headers["Content-Type"], "application/json");

    const body = JSON.parse(capturedOptions.body);
    assert.equal(body.q, "Hello World");
    assert.equal(body.source, "auto");
    assert.equal(body.target, "es");
    assert.equal(body.format, "text");
    assert.equal(result.text, "Hola Mundo");
  });

  it("envía api_key y sourceLang personalizado si se proporcionan", async () => {
    let capturedBody;

    const fakeFetch = async (url, options) => {
      capturedBody = JSON.parse(options.body);
      return {
        ok: true,
        status: 200,
        json: async () => ({ translatedText: "Bonjour" }),
      };
    };

    const client = createLibreTranslateClient({
      url: "https://translate.example.com",
      apiKey: "secret-key-123",
      sourceLang: "en",
      fetchClient: fakeFetch,
    });

    const result = await client("Hello", "fr");

    assert.equal(capturedBody.api_key, "secret-key-123");
    assert.equal(capturedBody.source, "en");
    assert.equal(capturedBody.target, "fr");
    assert.equal(result.text, "Bonjour");
  });

  it("falla si fetchClient no es una función", async () => {
    const client = createLibreTranslateClient({
      fetchClient: null,
    });

    await assert.rejects(
      async () => client("Hello", "es"),
      (error) => {
        assert.equal(error.code, "TRANSLATION_FAILED");
        assert.equal(error.step, "translate");
        assert.match(error.message, /Global fetch is not available/);
        return true;
      }
    );
  });

  it("envuelve errores de red de fetch", async () => {
    const fakeFetch = async () => {
      throw new Error("ECONNREFUSED");
    };

    const client = createLibreTranslateClient({
      url: "http://localhost:5000",
      fetchClient: fakeFetch,
    });

    await assert.rejects(
      async () => client("Hello", "es"),
      (error) => {
        assert.equal(error.code, "TRANSLATION_FAILED");
        assert.equal(error.step, "translate");
        assert.match(error.message, /Network error connecting to LibreTranslate/);
        assert.match(error.message, /ECONNREFUSED/);
        return true;
      }
    );
  });

  it("maneja fallo al parsear JSON", async () => {
    const fakeFetch = async () => ({
      ok: true,
      status: 200,
      json: async () => {
        throw new Error("Unexpected token");
      },
    });

    const client = createLibreTranslateClient({
      fetchClient: fakeFetch,
    });

    await assert.rejects(
      async () => client("Hello", "es"),
      (error) => {
        assert.equal(error.code, "TRANSLATION_FAILED");
        assert.equal(error.step, "translate");
        assert.match(error.message, /Failed to parse LibreTranslate response as JSON/);
        return true;
      }
    );
  });

  it("reporta error HTTP con mensaje devuelto por LibreTranslate", async () => {
    const fakeFetch = async () => ({
      ok: false,
      status: 400,
      json: async () => ({ error: "Target language not supported" }),
    });

    const client = createLibreTranslateClient({
      fetchClient: fakeFetch,
    });

    await assert.rejects(
      async () => client("Hello", "xx"),
      (error) => {
        assert.equal(error.code, "TRANSLATION_FAILED");
        assert.equal(error.step, "translate");
        assert.match(error.message, /LibreTranslate error: Target language not supported/);
        assert.equal(error.details.status, 400);
        return true;
      }
    );
  });

  it("reporta statusText cuando la respuesta de error no tiene error ni message", async () => {
    const fakeFetch = async () => ({
      ok: false,
      status: 502,
      statusText: "Bad Gateway",
      json: async () => ({}),
    });

    const client = createLibreTranslateClient({
      fetchClient: fakeFetch,
    });

    await assert.rejects(
      async () => client("Hello", "es"),
      (error) => {
        assert.equal(error.code, "TRANSLATION_FAILED");
        assert.match(error.message, /HTTP 502 Bad Gateway/);
        return true;
      }
    );
  });

  it("falla si la respuesta JSON no tiene translatedText", async () => {
    const fakeFetch = async () => ({
      ok: true,
      status: 200,
      json: async () => ({ other: "value" }),
    });

    const client = createLibreTranslateClient({
      fetchClient: fakeFetch,
    });

    await assert.rejects(
      async () => client("Hello", "es"),
      (error) => {
        assert.equal(error.code, "TRANSLATION_FAILED");
        assert.match(error.message, /missing translatedText property/);
        return true;
      }
    );
  });
});
