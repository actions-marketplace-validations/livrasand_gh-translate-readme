<!-- translate-readme:badges -->

[![Abjasio](https://custom-icon-badges.demolab.com/badge/Abjasio--white.svg?logo=ghtr-ab&labelColor=white&color=white)](README.ab.md) [![Achenés](https://custom-icon-badges.demolab.com/badge/Achen%C3%A9s--white.svg?logo=ghtr-ace&labelColor=white&color=white)](README.ace.md) [![Acholí](https://custom-icon-badges.demolab.com/badge/Achol%C3%AD--white.svg?logo=ghtr-ach&labelColor=white&color=white)](README.ach.md) [![Afrikaans](https://custom-icon-badges.demolab.com/badge/Afrikaans--white.svg?logo=ghtr-af&labelColor=white&color=white)](README.af.md) [![Alur](https://custom-icon-badges.demolab.com/badge/Alur--white.svg?logo=ghtr-alz&labelColor=white&color=white)](README.alz.md) [![Amárico](https://custom-icon-badges.demolab.com/badge/Am%C3%A1rico--white.svg?logo=ghtr-am&labelColor=white&color=white)](README.am.md) [![عربى](https://custom-icon-badges.demolab.com/badge/%D8%B9%D8%B1%D8%A8%D9%89--white.svg?logo=ghtr-ar&labelColor=white&color=white)](README.ar.md) [![Asamés](https://custom-icon-badges.demolab.com/badge/Asam%C3%A9s--white.svg?logo=ghtr-as&labelColor=white&color=white)](README.as.md) [![Française](https://custom-icon-badges.demolab.com/badge/Fran%C3%A7aise--white.svg?logo=ghtr-fr&labelColor=white&color=white)](README.fr.md) [![हिंदी](https://custom-icon-badges.demolab.com/badge/%E0%A4%B9%E0%A4%BF%E0%A4%82%E0%A4%A6%E0%A5%80--white.svg?logo=ghtr-hi&labelColor=white&color=white)](README.hi.md) [![Armenio](https://custom-icon-badges.demolab.com/badge/Armenio--white.svg?logo=ghtr-hy&labelColor=white&color=white)](README.hy.md) [![Albanés](https://custom-icon-badges.demolab.com/badge/Alban%C3%A9s--white.svg?logo=ghtr-sq&labelColor=white&color=white)](README.sq.md) [![简体中文](https://custom-icon-badges.demolab.com/badge/%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87--white.svg?logo=ghtr-zh-cn&labelColor=white&color=white)](README.zh-CN.md) [![繁体中文](https://custom-icon-badges.demolab.com/badge/%E7%B9%81%E4%BD%93%E4%B8%AD%E6%96%87--white.svg?logo=ghtr-zh-tw&labelColor=white&color=white)](README.zh-TW.md)

# GitHub loko gin ma ki lwongo ni Readme Action

**Tic pa GitHub me loko Readme i leb mo keken**

Man obedo tic pa GitHub ma loko readme ma tye i repo ni i leb ma ki moko.

## Keto

1.  **Med karatac me tic**bot yub ni (e.g.`.github/workflows/readme.yml`):

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

## Kit ma ki yubu kwede

### Jami ma itwero yero

Itwero yubu tic ni anyim ki jami ma lubo ni:

-   `LANG`: Leb ma imito gonyo readme ni iye (ma ki keto:`zh-CN`).
-   `PROVIDER`: Lami loko leb me tic kwede:`google`(ma ki keto) onyo`libretranslate`.
-   `LIBRETRANSLATE_URL`: URL pa LibreTranslate API ni (ma ki keto:`http://localhost:5000`).
-   `LIBRETRANSLATE_API_KEY`: API key ka LibreTranslate ni mito ni ki moko (pe imito).
-   `SOURCE_LANG`: leb ma ki coyo kwede (ma ki keto con:`auto`).
-   `IGNORE`: Leb ma ki poko ki coc ma omyera ki kato (e.g.`fr,es`). Tii ki man ka leb mo ki loko ki cing wek gin ma ki tiimo ni pe olok iye.
-   `FLAG`: Namba me lobo/bandera ma ki tiyo kwede me nyutu leb (e.g.`cn`,`fr`). Obedo dic ku; loko i kom gin ma ki yubu iye ka ki kwanyo woko.
-   `LANG_NAME`: Nyut nying pi leb ma ki tiyo kwede i badge (pe imito).
-   `SHOW_PERCENTAGE`: Nyut wel ma ki gonyo i badge me leb (`true`/`false`, kit ma bino kwede:`true`). Ket me`false`me kanone.

### Tic ki LibreTranslate (ma ki gwoko piri keni i GitHub Actions)

Me gonyo leb labongo keto cik pa API pa ngat mukene onyo lok ma mako bedo piri keni, itwero tic ki LibreTranslate calo Docker service container ma tye i GitHub Actions workflow ni:

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

## leb ma ki cwako

-   Ka itye ka tic ki Google Translate (`PROVIDER: google`):<https://cloud.google.com/translate/docs/languages>
-   Ka itye ka tic ki LibreTranslate (`PROVIDER: libretranslate`): Standard ISO 639-1 leb ma ki coyo (e.g.`es`,`fr`,`de`,`zh`,`hi`,`ar`, ki mukene) ma ki miiyo kony ki bot LibreTranslate ni.

### Cayo leb ma ki gonyo ki cing

Ka i loko README ki cingi, med coc me leb ne i`IGNORE`(La por`IGNORE: fr,es`) i dul me tic pi leb meno, onyo juku dul ni weny, wek gin ma ki tiimo ni pe obal tic ni. Gin`IGNORE`nen ni tye ka wot ma peya ki loko leb mo kiken onyo coyo gin mo kiken.

### Dongo

Tam ki kony ma kimiyo ki jolo kare ducu! Nen[CONTRIBUTING.md](./CONTRIBUTING.md)pi cik me temo, namba me peko ki yoo me cobo peko. Ngwec`npm ci && npm run verify`ma peya
yabo lok me lwongo.

* * *

_✨ Wapyoyi pi bino**gh-gony-kwan**!_

<img src="https://visitor-badge.laobi.icu/badge?page_id=livrasand.gh-translate-readme&style=for-the-badge&color=00d4ff" alt="Views">
