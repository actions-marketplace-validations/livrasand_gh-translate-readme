<!-- translate-readme:badges -->

[![Abjasio](https://custom-icon-badges.demolab.com/badge/Abjasio--white.svg?logo=ghtr-ab&labelColor=white&color=white)](README.ab.md) [![Achenés](https://custom-icon-badges.demolab.com/badge/Achen%C3%A9s--white.svg?logo=ghtr-ace&labelColor=white&color=white)](README.ace.md) [![Acholí](https://custom-icon-badges.demolab.com/badge/Achol%C3%AD--white.svg?logo=ghtr-ach&labelColor=white&color=white)](README.ach.md) [![Afrikaans](https://custom-icon-badges.demolab.com/badge/Afrikaans--white.svg?logo=ghtr-af&labelColor=white&color=white)](README.af.md) [![Alur](https://custom-icon-badges.demolab.com/badge/Alur--white.svg?logo=ghtr-alz&labelColor=white&color=white)](README.alz.md) [![Amárico](https://custom-icon-badges.demolab.com/badge/Am%C3%A1rico--white.svg?logo=ghtr-am&labelColor=white&color=white)](README.am.md) [![عربى](https://custom-icon-badges.demolab.com/badge/%D8%B9%D8%B1%D8%A8%D9%89--white.svg?logo=ghtr-ar&labelColor=white&color=white)](README.ar.md) [![Asamés](https://custom-icon-badges.demolab.com/badge/Asam%C3%A9s--white.svg?logo=ghtr-as&labelColor=white&color=white)](README.as.md) [![Française](https://custom-icon-badges.demolab.com/badge/Fran%C3%A7aise--white.svg?logo=ghtr-fr&labelColor=white&color=white)](README.fr.md) [![हिंदी](https://custom-icon-badges.demolab.com/badge/%E0%A4%B9%E0%A4%BF%E0%A4%82%E0%A4%A6%E0%A5%80--white.svg?logo=ghtr-hi&labelColor=white&color=white)](README.hi.md) [![Armenio](https://custom-icon-badges.demolab.com/badge/Armenio--white.svg?logo=ghtr-hy&labelColor=white&color=white)](README.hy.md) [![Albanés](https://custom-icon-badges.demolab.com/badge/Alban%C3%A9s--white.svg?logo=ghtr-sq&labelColor=white&color=white)](README.sq.md) [![简体中文](https://custom-icon-badges.demolab.com/badge/%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87--white.svg?logo=ghtr-zh-cn&labelColor=white&color=white)](README.zh-CN.md) [![繁体中文](https://custom-icon-badges.demolab.com/badge/%E7%B9%81%E4%BD%93%E4%B8%AD%E6%96%87--white.svg?logo=ghtr-zh-tw&labelColor=white&color=white)](README.zh-TW.md)

# Action Lisez-moi de traduction GitHub

**GitHub Action pour traduire Readme dans n'importe quelle langue**

Il s'agit d'une action GitHub qui traduit automatiquement le fichier Lisez-moi de votre dépôt dans une langue spécifiée.

## Installation

1.  **Ajouter un fichier de workflow**à votre projet (par ex.`.github/workflows/readme.yml`) :

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

## Configuration

### Possibilités

Vous pouvez configurer davantage l'action avec les options suivantes :

-   `LANG`: La langue dans laquelle vous souhaitez traduire votre fichier Lisez-moi (par défaut :`zh-CN`).
-   `PROVIDER`: Le fournisseur de traduction à utiliser :`google`(par défaut) ou`libretranslate`.
-   `LIBRETRANSLATE_URL`: L'URL de votre API LibreTranslate (par défaut :`http://localhost:5000`).
-   `LIBRETRANSLATE_API_KEY`: Clé API si votre instance LibreTranslate nécessite une authentification (facultatif).
-   `SOURCE_LANG`: Code de langue source (par défaut :`auto`).
-   `IGNORE`: Codes de langue séparés par des virgules à ignorer (par ex.`fr,es`). Utilisez-le lorsqu'une langue a été traduite manuellement afin que l'action ne l'écrase pas.
-   `FLAG`: Code pays/drapeau utilisé pour le badge de langue (par ex.`cn`,`fr`). Facultatif; par défaut, un mappage intégré est utilisé lorsqu'il est omis.
-   `LANG_NAME`: Nom d'affichage de la langue cible utilisée dans les badges (facultatif).
-   `SHOW_PERCENTAGE`: Afficher le pourcentage traduit dans les badges de langue (`true`/`false`, défaut:`true`). Régler sur`false`pour le cacher.

### Utilisation de LibreTranslate (auto-hébergé dans les actions GitHub)

Pour traduire sans limites d'API tierces ni problèmes de confidentialité, vous pouvez exécuter LibreTranslate en tant que conteneur de service Docker directement dans votre flux de travail GitHub Actions :

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

## Langues prises en charge

-   Lorsque vous utilisez Google Translate (`PROVIDER: google`) :[https://cloud.google.com/translate/docs/langues](https://cloud.google.com/translate/docs/languages)
-   Lorsque vous utilisez LibreTranslate (`PROVIDER: libretranslate`) : Codes de langue standard ISO 639-1 (par ex.`es`,`fr`,`de`,`zh`,`hi`,`ar`, etc.) pris en charge par votre instance LibreTranslate.

### Ignorer les langues traduites manuellement

Si vous traduisez un README manuellement, ajoutez son code de langue à`IGNORE`(Par exemple`IGNORE: fr,es`) dans l'étape du flux de travail pour cette langue, ou désactivez entièrement l'étape afin que l'action n'écrase pas votre travail. Le`IGNORE`la vérification s'exécute avant toute traduction ou écriture de fichier.

### Développement

Les suggestions et contributions sont toujours les bienvenues ! Voir[CONTRIBUER.md](./CONTRIBUTING.md)pour les commandes de test, les codes d’erreur et les conseils de débogage. Courir`npm ci && npm run verify`avant
ouvrir une pull request.

* * *

_✨ Merci de votre visite**gh-translate-lisez-moi**!_

<img src="https://visitor-badge.laobi.icu/badge?page_id=livrasand.gh-translate-readme&style=for-the-badge&color=00d4ff" alt="Views">
