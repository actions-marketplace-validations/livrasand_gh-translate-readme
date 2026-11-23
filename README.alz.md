<!-- translate-readme:badges -->

[![Abjasio](https://custom-icon-badges.demolab.com/badge/Abjasio--white.svg?logo=ghtr-ab&labelColor=white&color=white)](README.ab.md) [![Achenés](https://custom-icon-badges.demolab.com/badge/Achen%C3%A9s--white.svg?logo=ghtr-ace&labelColor=white&color=white)](README.ace.md) [![Acholí](https://custom-icon-badges.demolab.com/badge/Achol%C3%AD--white.svg?logo=ghtr-ach&labelColor=white&color=white)](README.ach.md) [![Afrikaans](https://custom-icon-badges.demolab.com/badge/Afrikaans--white.svg?logo=ghtr-af&labelColor=white&color=white)](README.af.md) [![عربى](https://custom-icon-badges.demolab.com/badge/%D8%B9%D8%B1%D8%A8%D9%89--white.svg?logo=ghtr-ar&labelColor=white&color=white)](README.ar.md) [![Française](https://custom-icon-badges.demolab.com/badge/Fran%C3%A7aise--white.svg?logo=ghtr-fr&labelColor=white&color=white)](README.fr.md) [![हिंदी](https://custom-icon-badges.demolab.com/badge/%E0%A4%B9%E0%A4%BF%E0%A4%82%E0%A4%A6%E0%A5%80--white.svg?logo=ghtr-hi&labelColor=white&color=white)](README.hi.md) [![Albanés](https://custom-icon-badges.demolab.com/badge/Alban%C3%A9s--white.svg?logo=ghtr-sq&labelColor=white&color=white)](README.sq.md) [![简体中文](https://custom-icon-badges.demolab.com/badge/%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87--white.svg?logo=ghtr-zh-cn&labelColor=white&color=white)](README.zh-CN.md) [![繁体中文](https://custom-icon-badges.demolab.com/badge/%E7%B9%81%E4%BD%93%E4%B8%AD%E6%96%87--white.svg?logo=ghtr-zh-tw&labelColor=white&color=white)](README.zh-TW.md)

# GitHub loko Readme Action

**GitHub timo mi loko Readme i dhok moku ci**

Eni ubedo tic pa GitHub ma loko readme in repo peri ni dhok moko ma jukwanu.

## Kethi

1.  **Med fail mi tic**ni yub peri (e.g.`.github/workflows/readme.yml`):

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

## Yub

### Yore

Icopo ketho tic peri umedire ku lembe ma e:

-   `LANG`: Dho ma imito loko readme peri i iye (default:`zh-CN`).
-   `PROVIDER`: Jatel wi tic mi loko dhok:`google`(ma con) nyo`libretranslate`.
-   `LIBRETRANSLATE_URL`: URL pa LibreTranslate API peri (ma con:`http://localhost:5000`).
-   `LIBRETRANSLATE_API_KEY`: API key ka LibreTranslate peri mitu rwom (ma imito).
-   `SOURCE_LANG`: Code mi dhok ma jucaku kudu (default:`auto`).
-   `IGNORE`: Lembe ma jupoko ku comma ma jubi weko (e.g.`fr,es`). Ti ku lembe eni ka dhok moko udaru loko ku cing kara tic kud ulok iwie.
-   `FLAG`: Namba mi ngom/bendera ma jutiyo kudu pi badge mi dhok (e.g.`cn`,`fr`). Iromo weko; lokore ni mapping ma juketho i iye ka juweko.
-   `LANG_NAME`: Nyuth nying dhok ma jutiyo kudu i badge (ma imito).
-   `SHOW_PERCENTAGE`: Nyuth wel ma juloko i badge mi dhok (`true`/`false`, acaki:`true`). Keth ni`false`ni kano.

### Tiyu ku LibreTranslate (Self-Hosted in GitHub Actions)

Mi loko dhok manangu epe ku cik pa API pa ngati mukende nyo lembe mi bedo peri giri, icopo tiyo ku LibreTranslate calu Docker service container i GitHub Actions workflow peri:

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

## Dho ma jukonyo

-   Ka itiyo ku Google Translate (`PROVIDER: google`):<https://cloud.google.com/translate/docs/languages>
-   Ka itiyo ku LibreTranslate (`PROVIDER: libretranslate`): Standard ISO 639-1 language codes (e.g.`es`,`fr`,`de`,`zh`,`hi`,`ar`, etc.) ma jukonyo ku LibreTranslate peri.

### Weko dhok ma juloko ku cing

Ka i loko README ku cingi, med dhok pare i`IGNORE`(mi lanyuth`IGNORE: fr,es`) i step mi tic pi dhok meno, nyo juku step ne zo, wek tic ne kud ulok tic peri. Ku`IGNORE`nen runs ma podi ju loko ngo lembe moko cii nyo kyewo waraga moko cii.

### Dongo

Paru man kony ma jumiyu iwa jujolo kare ku kare! Neno[CONTRIBUTING.md](./CONTRIBUTING.md)pi lembe mi temo, namba mi lembe ma rac man yore mi timo lembe marac. Ringi`npm ci && npm run verify`mapodi
yabo kwac mi tingo.
