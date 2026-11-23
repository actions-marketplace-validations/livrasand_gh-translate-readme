<!-- translate-readme:badges -->

[![عربى](https://custom-icon-badges.demolab.com/badge/%D8%B9%D8%B1%D8%A8%D9%89--white.svg?logo=ghtr-ar&labelColor=white&color=white)](README.ar.md) [![Française](https://custom-icon-badges.demolab.com/badge/Fran%C3%A7aise--white.svg?logo=ghtr-fr&labelColor=white&color=white)](README.fr.md) [![हिंदी](https://custom-icon-badges.demolab.com/badge/%E0%A4%B9%E0%A4%BF%E0%A4%82%E0%A4%A6%E0%A5%80--white.svg?logo=ghtr-hi&labelColor=white&color=white)](README.hi.md) [![简体中文](https://custom-icon-badges.demolab.com/badge/%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87--white.svg?logo=ghtr-zh-cn&labelColor=white&color=white)](README.zh-CN.md) [![繁体中文](https://custom-icon-badges.demolab.com/badge/%E7%B9%81%E4%BD%93%E4%B8%AD%E6%96%87--white.svg?logo=ghtr-zh-tw&labelColor=white&color=white)](README.zh-TW.md)

# GitHub Аиҭагара Readme Аус

**GitHub Аус Readme иарбан бызшәазаалак ахь аиагаразы**

Ари GitHub Аусуп, автоматла шәрепо аҟны иҟоу readme иалкаау бызшәак ахь еиҭазго.

## Ақәыргылара

1.  **Аусуратә еишьҭагыла афаил ацҵатәуп**упроект ахь (е.г.`.github/workflows/readme.yml`):

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

## Аконфигурациа

### Авариантқәа

Уара иҟауҵар улшоит аус анаҩстәи аопциақәа рыла:

-   `LANG`: Readme ахьеиҭаугарц иуҭаху абызшәа (дефолт:`zh-CN`).
-   `PROVIDER`: Аиҭага аиқәыршәаҩ ахархәара:`google`(дефолт) мамзаргьы`libretranslate`.
-   `LIBRETRANSLATE_URL`: Уара у LibreTranslate API URL (дефолт:`http://localhost:5000`).
-   `LIBRETRANSLATE_API_KEY`: API цаԥха шә-LibreTranslate аҿырԥштәы аутентификациа аҭахызар (иаҭахым).
-   `SOURCE_LANG`: Ахыҵхырҭатә бызшәа акод (дефолт:`auto`).
-   `IGNORE`: Акоммала еиҟәыҭхоу абызшәа акодқәа рызхыҵра (е.г.`fr,es`). Абызшәа напыла ианеиҭагоу ахархәара аҭахуп, аус уи ақәымҩырц азы.
-   `FLAG`: Атәыла/абираҟ акод ахархәара змоу абызшәа азначок азы (е.г.`cn`,`fr`). Иҟоумҵар ҟало; еиҭаҵуеит иагәылоу ахсаала ахь, ианыҟам.
-   `LANG_NAME`: Адыргаҷқәа рҿы ахархәара змоу ахықәкытә бызшәа ахьӡ аарԥшра (иаҭахым).
-   `SHOW_PERCENTAGE`: Абызшәатә дыргақәа рҿы еиҭагоу апроцент аарԥшра (`true`/`false`, амҳәара:`true`). Ишьақәыргылатәуп`false`иҵәахырц.

### LibreTranslate ахархәара (GitHub аусқәа рҿы ахатә-хылаԥшра)

Ахԥатәи аган API аҳәаақәа мамзаргьы амаӡаратә гәҭыхақәа рыда аиҭагаразы, шәара ишәылшоит LibreTranslate аус арура Docker амаҵзуратә контеинер еиԥш ишиашоу GitHub Аусқәа русуратә еишьҭагыла аҩныҵҟа:

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

## Идгылоу абызшәақәа

-   Google Аиҭагара ахархәараан (`PROVIDER: google`):[https://аԥсҭҳәа.гугл.ком/аиҭагара/документқәа/абызшәақәа](https://cloud.google.com/translate/docs/languages)
-   LibreTranslate ахархәараан (`PROVIDER: libretranslate`): Астандарт ISO 639-1 абз акодқәа (е.г.`es`,`fr`,`de`,`zh`,`hi`,`ar`, уҳәа убас иҵегьы) шә LibreTranslate аҿырԥштәы иадгылоит.

### Напыла еиҭагоу абызшәақәа рызхьамԥшра

README напыла еиҭаугозар, уи абызшәа акод ацҵатәуп`IGNORE`(Ҿырԥштәыс иаагоуп`IGNORE: fr,es`) аусуратә еишьҭагыла ашьаҿаҿы уи абызшәазы, мамзаргьы ашьаҿа зынӡа иаҿыхтәуп, аус уусура ақәымҩырц азы. А`IGNORE`аиҭагара ма афаил аҩра аламҭалазы check аус ауеит.

### Арҿиара

Ажәалагалақәеи алагалақәеи еснагь ҳрыдыркылоит! Абара[АКОНТРИБУТИРОВАНИЕ.мд](./CONTRIBUTING.md)аԥышәаратә адҵақәа, агха акодқәеи ариашаратә абжьгарақәеи рзы. Аҩра`npm ci && npm run verify`Аԥхьа
аҭгара азыҳәара аартра.
