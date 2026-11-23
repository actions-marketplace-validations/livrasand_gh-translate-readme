<!-- translate-readme:badges -->

[![Abjasio](https://custom-icon-badges.demolab.com/badge/Abjasio--white.svg?logo=ghtr-ab&labelColor=white&color=white)](README.ab.md) [![Achenés](https://custom-icon-badges.demolab.com/badge/Achen%C3%A9s--white.svg?logo=ghtr-ace&labelColor=white&color=white)](README.ace.md) [![Acholí](https://custom-icon-badges.demolab.com/badge/Achol%C3%AD--white.svg?logo=ghtr-ach&labelColor=white&color=white)](README.ach.md) [![Afrikaans](https://custom-icon-badges.demolab.com/badge/Afrikaans--white.svg?logo=ghtr-af&labelColor=white&color=white)](README.af.md) [![Alur](https://custom-icon-badges.demolab.com/badge/Alur--white.svg?logo=ghtr-alz&labelColor=white&color=white)](README.alz.md) [![Amárico](https://custom-icon-badges.demolab.com/badge/Am%C3%A1rico--white.svg?logo=ghtr-am&labelColor=white&color=white)](README.am.md) [![عربى](https://custom-icon-badges.demolab.com/badge/%D8%B9%D8%B1%D8%A8%D9%89--white.svg?logo=ghtr-ar&labelColor=white&color=white)](README.ar.md) [![Asamés](https://custom-icon-badges.demolab.com/badge/Asam%C3%A9s--white.svg?logo=ghtr-as&labelColor=white&color=white)](README.as.md) [![Française](https://custom-icon-badges.demolab.com/badge/Fran%C3%A7aise--white.svg?logo=ghtr-fr&labelColor=white&color=white)](README.fr.md) [![हिंदी](https://custom-icon-badges.demolab.com/badge/%E0%A4%B9%E0%A4%BF%E0%A4%82%E0%A4%A6%E0%A5%80--white.svg?logo=ghtr-hi&labelColor=white&color=white)](README.hi.md) [![Armenio](https://custom-icon-badges.demolab.com/badge/Armenio--white.svg?logo=ghtr-hy&labelColor=white&color=white)](README.hy.md) [![Albanés](https://custom-icon-badges.demolab.com/badge/Alban%C3%A9s--white.svg?logo=ghtr-sq&labelColor=white&color=white)](README.sq.md) [![简体中文](https://custom-icon-badges.demolab.com/badge/%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87--white.svg?logo=ghtr-zh-cn&labelColor=white&color=white)](README.zh-CN.md) [![繁体中文](https://custom-icon-badges.demolab.com/badge/%E7%B9%81%E4%BD%93%E4%B8%AD%E6%96%87--white.svg?logo=ghtr-zh-tw&labelColor=white&color=white)](README.zh-TW.md)

# GitHub Translate Readme Action

**GitHub Action om Readme na enige taal te vertaal**

Dit is 'n GitHub-aksie wat die readme in u repo outomaties vertaal na 'n gespesifiseerde taal.

## Opstelling

1.  **Voeg 'n werkvloeilêer by**na jou projek (bv.`.github/workflows/readme.yml`):

```yaml
name: Translate README

on:
  push:
    branches:
      - main
      - master
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      # ISO Language Codes: https://cloud.google.com/translate/docs/languages
      - name: Adding README - Chinese Simplified
        uses: ./
        with:
          LANG: zh-CN
          LANG_NAME: 简体中文
          FLAG: cn
      - name: Adding README - Chinese Traditional
        uses: ./
        with:
          LANG: zh-TW
          LANG_NAME: 繁体中文
          FLAG: tw
      - name: Adding README - Hindi
        uses: ./
        with:
          LANG: hi
          LANG_NAME: हिंदी
          FLAG: in
      - name: Adding README - Arabic
        uses: ./
        with:
          LANG: ar
          LANG_NAME: عربى
          FLAG: sa
      - name: Adding README - French
        uses: ./
        with:
          LANG: fr
          LANG_NAME: Française
          FLAG: fr
```

## Konfigurasie

### Opsies

U kan die aksie verder instel met die volgende opsies:

-   `LANG`: Die taal waarna jy jou leesmy wil vertaal (verstek:`zh-CN`).
-   `PROVIDER`: Die vertaalverskaffer om te gebruik:`google`(verstek) of`libretranslate`.
-   `LIBRETRANSLATE_URL`: Die URL van jou LibreTranslate API (verstek:`http://localhost:5000`).
-   `LIBRETRANSLATE_API_KEY`: API-sleutel as jou LibreTranslate-instansie stawing vereis (opsioneel).
-   `SOURCE_LANG`: Brontaalkode (verstek:`auto`).
-   `IGNORE`: Komma-geskeide taalkodes om oor te slaan (bv.`fr,es`). Gebruik dit wanneer 'n taal met die hand vertaal is sodat die handeling dit nie oorskryf nie.
-   `FLAG`: Land-/vlagkode wat vir die taalkenteken gebruik word (bv.`cn`,`fr`). Opsioneel; verstek na 'n ingeboude kartering wanneer dit weggelaat word.
-   `LANG_NAME`: Vertoon naam vir die teikentaal wat in kentekens gebruik word (opsioneel).
-   `SHOW_PERCENTAGE`: Wys die vertaalde persentasie in taalkentekens (`true`/`false`, verstek:`true`). Stel op`false`om dit weg te steek.

### Gebruik LibreTranslate (self-huisves in GitHub-aksies)

Om te vertaal sonder derdeparty-API-limiete of privaatheidskwessies, kan jy LibreTranslate as 'n Docker-dienshouer direk binne jou GitHub Actions-werkvloei laat loop:

```yaml
name: Translate README

on:
  push:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    services:
      libretranslate:
        image: libretranslate/libretranslate:latest
        ports:
          - 5000:5000
        env:
          LT_LOAD_ONLY: en,es,fr,zh,hi,ar
    steps:
      - uses: actions/checkout@v4
      - name: Adding README - Spanish
        uses: dephraiim/translate-readme@main
        with:
          LANG: es
          PROVIDER: libretranslate
          LIBRETRANSLATE_URL: http://localhost:5000
```

## Ondersteunde tale

-   Wanneer jy Google Translate (`PROVIDER: google`):<https://cloud.google.com/translate/docs/languages>
-   Wanneer jy LibreTranslate (`PROVIDER: libretranslate`): Standaard ISO 639-1 taalkodes (bv.`es`,`fr`,`de`,`zh`,`hi`,`ar`, ens.) ondersteun deur jou LibreTranslate-instansie.

### Ignoreer handvertaalde tale

As jy 'n README handmatig vertaal, voeg sy taalkode by`IGNORE`(byvoorbeeld`IGNORE: fr,es`) in die werkvloeistap vir daardie taal, of deaktiveer die stap heeltemal, sodat die handeling nie jou werk oorskryf nie. Die`IGNORE`tjek loop voor enige vertaling of lêer skryf.

### Ontwikkeling

Voorstelle en bydraes is altyd welkom! Sien[BYDRAEND.md](./CONTRIBUTING.md)vir toetsopdragte, foutkodes en ontfoutingswenke. Hardloop`npm ci && npm run verify`voor
die opening van 'n trekversoek.
