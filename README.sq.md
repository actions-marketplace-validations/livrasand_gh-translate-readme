<!-- translate-readme:badges -->

[![Abjasio](https://custom-icon-badges.demolab.com/badge/Abjasio--white.svg?logo=ghtr-ab&labelColor=white&color=white)](README.ab.md) [![Achenés](https://custom-icon-badges.demolab.com/badge/Achen%C3%A9s--white.svg?logo=ghtr-ace&labelColor=white&color=white)](README.ace.md) [![Acholí](https://custom-icon-badges.demolab.com/badge/Achol%C3%AD--white.svg?logo=ghtr-ach&labelColor=white&color=white)](README.ach.md) [![Afrikaans](https://custom-icon-badges.demolab.com/badge/Afrikaans--white.svg?logo=ghtr-af&labelColor=white&color=white)](README.af.md) [![Alur](https://custom-icon-badges.demolab.com/badge/Alur--white.svg?logo=ghtr-alz&labelColor=white&color=white)](README.alz.md) [![Amárico](https://custom-icon-badges.demolab.com/badge/Am%C3%A1rico--white.svg?logo=ghtr-am&labelColor=white&color=white)](README.am.md) [![عربى](https://custom-icon-badges.demolab.com/badge/%D8%B9%D8%B1%D8%A8%D9%89--white.svg?logo=ghtr-ar&labelColor=white&color=white)](README.ar.md) [![Asamés](https://custom-icon-badges.demolab.com/badge/Asam%C3%A9s--white.svg?logo=ghtr-as&labelColor=white&color=white)](README.as.md) [![Française](https://custom-icon-badges.demolab.com/badge/Fran%C3%A7aise--white.svg?logo=ghtr-fr&labelColor=white&color=white)](README.fr.md) [![हिंदी](https://custom-icon-badges.demolab.com/badge/%E0%A4%B9%E0%A4%BF%E0%A4%82%E0%A4%A6%E0%A5%80--white.svg?logo=ghtr-hi&labelColor=white&color=white)](README.hi.md) [![Armenio](https://custom-icon-badges.demolab.com/badge/Armenio--white.svg?logo=ghtr-hy&labelColor=white&color=white)](README.hy.md) [![Albanés](https://custom-icon-badges.demolab.com/badge/Alban%C3%A9s--white.svg?logo=ghtr-sq&labelColor=white&color=white)](README.sq.md) [![简体中文](https://custom-icon-badges.demolab.com/badge/%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87--white.svg?logo=ghtr-zh-cn&labelColor=white&color=white)](README.zh-CN.md) [![繁体中文](https://custom-icon-badges.demolab.com/badge/%E7%B9%81%E4%BD%93%E4%B8%AD%E6%96%87--white.svg?logo=ghtr-zh-tw&labelColor=white&color=white)](README.zh-TW.md)

# Veprimi Readme i GitHub Translate

**Veprimi GitHub për të përkthyer Readme në çdo gjuhë**

Ky është një Veprim GitHub që përkthen automatikisht readme-në në depon tuaj në një gjuhë të caktuar.

## Konfigurimi

1.  **Shtoni një skedar të rrjedhës së punës**në projektin tuaj (p.sh.`.github/workflows/readme.yml`):

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

## Konfigurimi

### Opsionet

Ju mund ta konfiguroni veprimin më tej me opsionet e mëposhtme:

-   `LANG`: Gjuha në të cilën dëshironi të përktheni readme-në tuaj (e parazgjedhur:`zh-CN`).
-   `PROVIDER`: Ofruesi i përkthimit për t'u përdorur:`google`(e parazgjedhur) ose`libretranslate`.
-   `LIBRETRANSLATE_URL`: URL-ja e API-së tuaj LibreTranslate (e parazgjedhur:`http://localhost:5000`).
-   `LIBRETRANSLATE_API_KEY`: Çelësi API nëse shembulli juaj LibreTranslate kërkon vërtetim (opsionale).
-   `SOURCE_LANG`: Kodi i gjuhës burimore (e parazgjedhur:`auto`).
-   `IGNORE`: Kodet e gjuhëve të ndara me presje për t'u kapërcyer (p.sh.`fr,es`). Përdoreni këtë kur një gjuhë është përkthyer manualisht në mënyrë që veprimi të mos e mbishkruajë atë.
-   `FLAG`: Kodi i shtetit/flamurit i përdorur për distinktivin e gjuhës (p.sh.`cn`,`fr`). Fakultative; parazgjedhur për një hartë të integruar kur hiqet.
-   `LANG_NAME`: Emri i shfaqur për gjuhën e synuar të përdorur në distinktivë (opsionale).
-   `SHOW_PERCENTAGE`: Shfaq përqindjen e përkthyer në distinktivët e gjuhës (`true`/`false`, e paracaktuar:`true`). Vendosur në`false`për ta fshehur.

### Përdorimi i LibreTranslate (i vetë-strehuar në Veprimet e GitHub)

Për të përkthyer pa kufizime API të palëve të treta ose shqetësime për privatësinë, mund të ekzekutoni LibreTranslate si një kontejner shërbimi Docker direkt brenda rrjedhës së punës suaj të GitHub Actions:

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

## Gjuhët e mbështetura

-   Kur përdorni Google Translate (`PROVIDER: google`):<https://cloud.google.com/translate/docs/languages>
-   Kur përdorni LibreTranslate (`PROVIDER: libretranslate`): Kodet standarde të gjuhëve ISO 639-1 (p.sh.`es`,`fr`,`de`,`zh`,`hi`,`ar`, etj.) të mbështetur nga shembulli juaj LibreTranslate.

### Injorimi i gjuhëve të përkthyera manualisht

Nëse e përktheni manualisht një README, shtoni kodin e tij të gjuhës`IGNORE`(për shembull`IGNORE: fr,es`) në hapin e rrjedhës së punës për atë gjuhë, ose çaktivizoni plotësisht hapin, në mënyrë që veprimi të mos e mbishkruajë punën tuaj. Të`IGNORE`kontrolli kryhet përpara çdo përkthimi ose shkrimi të skedarit.

### Zhvillimi

Sugjerimet dhe kontributet janë gjithmonë të mirëseardhura! Shihni[KONTRIBUUES.md](./CONTRIBUTING.md)për komandat e testimit, kodet e gabimit dhe këshilla për korrigjimin e gabimeve. Vraponi`npm ci && npm run verify`përpara
hapja e një kërkese për tërheqje.
