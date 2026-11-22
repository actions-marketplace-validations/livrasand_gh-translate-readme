"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { Buffer } = require("buffer");
const {
  resolveCountryCode,
  resolveLanguageDisplayName,
  buildBadgeSlug,
  buildBadgeUrl,
  buildBadgeMarkdown,
  createFlagBadgeClient,
} = require("../src/flags");
const { ActionError } = require("../src/errors");

describe("resolveCountryCode", () => {
  it("devuelve string vacío para inputs inválidos o vacíos", () => {
    assert.equal(resolveCountryCode(""), "");
    assert.equal(resolveCountryCode(null), "");
    assert.equal(resolveCountryCode(undefined), "");
    assert.equal(resolveCountryCode(123), "");
  });

  it("prioriza la bandera explícita recortando y en minúsculas", () => {
    assert.equal(resolveCountryCode("es", " MX "), "mx");
    assert.equal(resolveCountryCode("en", "ca"), "ca");
  });

  it("resuelve códigos mapeados conocidos", () => {
    assert.equal(resolveCountryCode("en"), "us");
    assert.equal(resolveCountryCode("es"), "es");
    assert.equal(resolveCountryCode("zh-CN"), "cn");
    assert.equal(resolveCountryCode("zh-TW"), "tw");
    assert.equal(resolveCountryCode("pt-BR"), "br");
    assert.equal(resolveCountryCode("hi"), "in");
  });

  it("extrae la región si viene como subtags de 2 letras", () => {
    assert.equal(resolveCountryCode("es-co"), "co");
    assert.equal(resolveCountryCode("fr-ca"), "ca");
  });

  it("usa el código de 2 letras como fallback directo", () => {
    assert.equal(resolveCountryCode("is"), "is");
  });

  it("devuelve vacío si no se puede resolver", () => {
    assert.equal(resolveCountryCode("unknown-language-tag"), "");
  });
});

describe("resolveLanguageDisplayName", () => {
  it("devuelve string vacío si lang es inválido", () => {
    assert.equal(resolveLanguageDisplayName(""), "");
    assert.equal(resolveLanguageDisplayName(null), "");
  });

  it("respeta el nombre explícito si se proporciona", () => {
    assert.equal(resolveLanguageDisplayName("es", "Castellano"), "Castellano");
  });

  it("resuelve el nombre en inglés usando Intl", () => {
    assert.equal(resolveLanguageDisplayName("es"), "Spanish");
    assert.equal(resolveLanguageDisplayName("fr"), "French");
    assert.equal(resolveLanguageDisplayName("de"), "German");
  });

  it("devuelve el código si Intl no reconoce la etiqueta", () => {
    assert.equal(resolveLanguageDisplayName("xyz123"), "xyz123");
  });
});

describe("buildBadgeSlug y URLs", () => {
  it("genera el slug con prefijo y caracteres sanitizados", () => {
    assert.equal(buildBadgeSlug("zh-CN"), "ghtr-zh-cn");
    assert.equal(buildBadgeSlug("es", { prefix: "flag" }), "flag-es");
  });

  it("construye la URL de custom-icon-badges", () => {
    const url = buildBadgeUrl({
      badgesUrl: "https://custom-icon-badges.demolab.com/",
      name: "Spanish",
      slug: "ghtr-es",
    });
    assert.equal(
      url,
      "https://custom-icon-badges.demolab.com/badge/Spanish-100%25-white.svg?logo=ghtr-es&labelColor=white&color=white"
    );
  });

  it("construye el markdown del badge", () => {
    const md = buildBadgeMarkdown({
      name: "Spanish",
      badgeUrl: "https://custom-icon-badges.demolab.com/badge/Spanish-100%25-white.svg?logo=ghtr-es&labelColor=white&color=white",
      code: "es",
    });
    assert.equal(
      md,
      "[![Spanish](https://custom-icon-badges.demolab.com/badge/Spanish-100%25-white.svg?logo=ghtr-es&labelColor=white&color=white)](README.es.md)"
    );
  });
});

describe("createFlagBadgeClient", () => {
  it("falla si fetchClient no es una función", async () => {
    const client = createFlagBadgeClient({ fetchClient: null });
    await assert.rejects(
      () => client("es"),
      (err) => {
        assert.ok(err instanceof ActionError);
        assert.equal(err.code, "BADGE_FAILED");
        assert.equal(err.step, "badge");
        return true;
      }
    );
  });

  it("falla si no se puede resolver el código de país", async () => {
    const client = createFlagBadgeClient({ fetchClient: async () => ({}) });
    await assert.rejects(
      () => client("unknown-lang-12345"),
      (err) => {
        assert.ok(err instanceof ActionError);
        assert.equal(err.code, "FLAG_NOT_FOUND");
        assert.equal(err.step, "badge");
        return true;
      }
    );
  });

  it("maneja error de red al descargar de FlagCDN", async () => {
    const client = createFlagBadgeClient({
      fetchClient: async () => {
        throw new Error("DNS lookup failed");
      },
    });

    await assert.rejects(
      () => client("es"),
      (err) => {
        assert.ok(err instanceof ActionError);
        assert.equal(err.code, "FLAG_FETCH_FAILED");
        assert.match(err.message, /DNS lookup failed/);
        return true;
      }
    );
  });

  it("maneja respuesta no exitosa de FlagCDN (404)", async () => {
    const client = createFlagBadgeClient({
      fetchClient: async () => ({
        ok: false,
        status: 404,
      }),
    });

    await assert.rejects(
      () => client("es"),
      (err) => {
        assert.ok(err instanceof ActionError);
        assert.equal(err.code, "FLAG_NOT_FOUND");
        assert.equal(err.details.status, 404);
        return true;
      }
    );
  });

  it("sube el icono correctamente cuando es nuevo (status 200)", async () => {
    const requests = [];
    const client = createFlagBadgeClient({
      fetchClient: async (url, options) => {
        requests.push({ url, options });
        if (url.includes("flagcdn.com")) {
          return {
            ok: true,
            status: 200,
            text: async () => "<svg>flag-co</svg>",
          };
        }
        if (url.includes("custom-icon-badges")) {
          return {
            status: 200,
            json: async () => ({ type: "success", message: "Icon added" }),
          };
        }
        return { status: 404 };
      },
    });

    const result = await client("co", { flag: "co", langName: "Colombian Spanish" });

    assert.equal(result.code, "co");
    assert.equal(result.countryCode, "co");
    assert.equal(result.slug, "ghtr-co");
    assert.equal(result.name, "Colombian Spanish");
    assert.equal(result.uploaded, true);
    assert.equal(result.alreadyExisted, false);
    assert.match(result.badgeUrl, /logo=ghtr-co/);
    assert.match(result.markdown, /README\.co\.md/);

    // Verificar que se envió el payload adecuado
    const uploadCall = requests.find((r) => r.url.includes("custom-icon-badges"));
    assert.ok(uploadCall);
    const body = JSON.parse(uploadCall.options.body);
    assert.equal(body.slug, "ghtr-co");
    assert.equal(body.type, "svg+xml");
    assert.equal(body.data, Buffer.from("<svg>flag-co</svg>").toString("base64"));
  });

  it("soporta arrayBuffer en la respuesta de FlagCDN", async () => {
    const client = createFlagBadgeClient({
      fetchClient: async (url) => {
        if (url.includes("flagcdn.com")) {
          return {
            ok: true,
            status: 200,
            arrayBuffer: async () => Buffer.from("<svg>array-buffer-svg</svg>"),
          };
        }
        return { status: 200 };
      },
    });

    const result = await client("es");
    assert.equal(result.uploaded, true);
  });

  it("trata 409 (slug ya existe) como éxito utilizable", async () => {
    const client = createFlagBadgeClient({
      fetchClient: async (url) => {
        if (url.includes("flagcdn.com")) {
          return {
            ok: true,
            status: 200,
            text: async () => "<svg>flag</svg>",
          };
        }
        return {
          status: 409,
          json: async () => ({ type: "error", message: "This slug is already in use." }),
        };
      },
    });

    const result = await client("fr");
    assert.equal(result.uploaded, false);
    assert.equal(result.alreadyExisted, true);
    assert.equal(result.slug, "ghtr-fr");
  });

  it("maneja error de red al subir a custom-icon-badges", async () => {
    const client = createFlagBadgeClient({
      fetchClient: async (url) => {
        if (url.includes("flagcdn.com")) {
          return {
            ok: true,
            status: 200,
            text: async () => "<svg>flag</svg>",
          };
        }
        throw new Error("Connection refused");
      },
    });

    await assert.rejects(
      () => client("es"),
      (err) => {
        assert.ok(err instanceof ActionError);
        assert.equal(err.code, "ICON_UPLOAD_FAILED");
        assert.match(err.message, /Connection refused/);
        return true;
      }
    );
  });

  it("maneja error de servidor en custom-icon-badges (500)", async () => {
    const client = createFlagBadgeClient({
      fetchClient: async (url) => {
        if (url.includes("flagcdn.com")) {
          return {
            ok: true,
            status: 200,
            text: async () => "<svg>flag</svg>",
          };
        }
        return {
          status: 500,
          statusText: "Internal Server Error",
          json: async () => {
            throw new Error("Not JSON");
          },
        };
      },
    });

    await assert.rejects(
      () => client("es"),
      (err) => {
        assert.ok(err instanceof ActionError);
        assert.equal(err.code, "ICON_UPLOAD_FAILED");
        assert.match(err.message, /HTTP 500/);
        return true;
      }
    );
  });
});
