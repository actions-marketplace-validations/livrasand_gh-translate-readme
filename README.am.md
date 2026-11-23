<!-- translate-readme:badges -->

[![Abjasio](https://custom-icon-badges.demolab.com/badge/Abjasio--white.svg?logo=ghtr-ab&labelColor=white&color=white)](README.ab.md) [![Achenés](https://custom-icon-badges.demolab.com/badge/Achen%C3%A9s--white.svg?logo=ghtr-ace&labelColor=white&color=white)](README.ace.md) [![Acholí](https://custom-icon-badges.demolab.com/badge/Achol%C3%AD--white.svg?logo=ghtr-ach&labelColor=white&color=white)](README.ach.md) [![Afrikaans](https://custom-icon-badges.demolab.com/badge/Afrikaans--white.svg?logo=ghtr-af&labelColor=white&color=white)](README.af.md) [![Alur](https://custom-icon-badges.demolab.com/badge/Alur--white.svg?logo=ghtr-alz&labelColor=white&color=white)](README.alz.md) [![عربى](https://custom-icon-badges.demolab.com/badge/%D8%B9%D8%B1%D8%A8%D9%89--white.svg?logo=ghtr-ar&labelColor=white&color=white)](README.ar.md) [![Française](https://custom-icon-badges.demolab.com/badge/Fran%C3%A7aise--white.svg?logo=ghtr-fr&labelColor=white&color=white)](README.fr.md) [![हिंदी](https://custom-icon-badges.demolab.com/badge/%E0%A4%B9%E0%A4%BF%E0%A4%82%E0%A4%A6%E0%A5%80--white.svg?logo=ghtr-hi&labelColor=white&color=white)](README.hi.md) [![Albanés](https://custom-icon-badges.demolab.com/badge/Alban%C3%A9s--white.svg?logo=ghtr-sq&labelColor=white&color=white)](README.sq.md) [![简体中文](https://custom-icon-badges.demolab.com/badge/%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87--white.svg?logo=ghtr-zh-cn&labelColor=white&color=white)](README.zh-CN.md) [![繁体中文](https://custom-icon-badges.demolab.com/badge/%E7%B9%81%E4%BD%93%E4%B8%AD%E6%96%87--white.svg?logo=ghtr-zh-tw&labelColor=white&color=white)](README.zh-TW.md)

# GitHub ተርጉም Readme ድርጊት

**Readmeን ወደ ማንኛውም ቋንቋ ለመተርጎም GitHub Action**

ይህ በሪፖዎ ውስጥ ያለውን ንባብ በቀጥታ ወደተገለጸ ቋንቋ የሚተረጉም የ GitHub ድርጊት ነው።

## ማዋቀር

1.  **የስራ ፍሰት ፋይል ያክሉ**ወደ ፕሮጀክትዎ (ለምሳሌ፦`.github/workflows/readme.yml`)::

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

## ማዋቀር

### አማራጮች

እርምጃውን በሚከተሉት አማራጮች የበለጠ ማዋቀር ይችላሉ፡

-   `LANG`Readme ን ለመተርጎም የሚፈልጉት ቋንቋ (ነባሪ፡-`zh-CN`).
-   `PROVIDER`የትርጉም አቅራቢው ለመጠቀም፡-`google`(ነባሪ) ወይም`libretranslate`.
-   `LIBRETRANSLATE_URL`የLibreTranslate API URL (ነባሪ፡-`http://localhost:5000`).
-   `LIBRETRANSLATE_API_KEY`የLibreTranslate ምሳሌዎ ማረጋገጥ የሚፈልግ ከሆነ የኤፒአይ ቁልፍ (አማራጭ)።
-   `SOURCE_LANG`ምንጭ ቋንቋ ኮድ (ነባሪ፡-`auto`).
-   `IGNORE`ለመዝለል በነጠላ ሰረዝ የተለዩ የቋንቋ ኮዶች (ለምሳሌ፦`fr,es`). ድርጊቱ እንዳይተካ ቋንቋው በእጅ ሲተረጎም ይህን ተጠቀም።
-   `FLAG`ለቋንቋ ባጅ የሚያገለግል የሀገር/ባንዲራ ኮድ (ለምሳሌ፦`cn`,`fr`). አማራጭ; ሲቀር አብሮ በተሰራ የካርታ ስራ ነባሪዎች።
-   `LANG_NAME`: በባጆች ውስጥ ጥቅም ላይ የዋለውን የዒላማ ቋንቋ ስም አሳይ (አማራጭ)።
-   `SHOW_PERCENTAGE`በቋንቋ ባጆች ውስጥ የተተረጎመውን መቶኛ አሳይ (`true`/`false`ነባሪ፡`true`). አዘጋጅ ወደ`false`ለመደበቅ.

### LibreTranslate በመጠቀም (በ GitHub ድርጊቶች ውስጥ በራስ የተስተናገደ)

ያለ የሶስተኛ ወገን ኤፒአይ ገደቦች ወይም የግላዊነት ስጋቶች ለመተርጎም LibreTranslateን እንደ Docker አገልግሎት መያዣ በቀጥታ በ GitHub Actions የስራ ፍሰት ውስጥ ማስኬድ ይችላሉ።

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

## የሚደገፉ ቋንቋዎች

-   ጎግል ተርጓሚ ስትጠቀም (`PROVIDER: google`)::<https://cloud.google.com/translate/docs/languages>
-   LibreTranslate ሲጠቀሙ (`PROVIDER: libretranslate`): መደበኛ ISO 639-1 የቋንቋ ኮዶች (ለምሳሌ.`es`,`fr`,`de`,`zh`,`hi`,`ar`ወዘተ) በእርስዎ LibreTranslate ምሳሌ የተደገፈ።

### በእጅ የተተረጎሙ ቋንቋዎችን ችላ ማለት

READMEን በእጅ ከተረጎሙ የቋንቋ ኮድ ወደ ላይ ያክሉ`IGNORE`(ለምሳሌ`IGNORE: fr,es`) ለዚያ ቋንቋ የስራ ሂደት ደረጃ፣ ወይም እርምጃውን ሙሉ በሙሉ ያሰናክሉ፣ ስለዚህ ድርጊቱ ስራዎን እንዳይጽፍ። የ`IGNORE`ከየትኛውም ትርጉም ወይም ፋይል ከመፃፍ በፊት መሮጡን ያረጋግጡ።

### ልማት

የአስተያየት ጥቆማዎች እና አስተዋጾዎች ሁል ጊዜ እንኳን ደህና መጡ! ተመልከት[አስተዋጽዖ.md](./CONTRIBUTING.md)ለሙከራ ትዕዛዞች, የስህተት ኮዶች እና የማረም ምክሮች. ሩጡ`npm ci && npm run verify`በፊት
የመሳብ ጥያቄ በመክፈት ላይ።
