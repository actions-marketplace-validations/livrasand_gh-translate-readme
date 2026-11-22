<!-- translate-readme:badges -->

[![Arabic](https://custom-icon-badges.demolab.com/badge/Arabic-100%25-white.svg?logo=ghtr-ar&labelColor=white&color=white)](README.ar.md) [![French](https://custom-icon-badges.demolab.com/badge/French-100%25-white.svg?logo=ghtr-fr&labelColor=white&color=white)](README.fr.md) [![Hindi](https://custom-icon-badges.demolab.com/badge/Hindi-100%25-white.svg?logo=ghtr-hi&labelColor=white&color=white)](README.hi.md) [![Chinese (China)](https://custom-icon-badges.demolab.com/badge/Chinese%20(China)-100%25-white.svg?logo=ghtr-zh-CN&labelColor=white&color=white)](README.zh-CN.md) [![Chinese (Taiwan)](https://custom-icon-badges.demolab.com/badge/Chinese%20(Taiwan)-100%25-white.svg?logo=ghtr-zh-TW&labelColor=white&color=white)](README.zh-TW.md)

# Traduire l’action Lisez-moi

## Traduction du fichier README

-   [Anglais](README.md)
-   [Chinois simplifié](README.zh-CN.md)
-   [Chinois traditionnel](README.zh-TW.md)
-   [hindi](README.hi.md)
-   [Française](README.fr.md)
-   [arabe](README.ar.md)

**GitHub Action pour traduire Readme dans n'importe quelle langue**

Il s'agit d'une action GitHub qui traduit automatiquement le fichier Lisez-moi de votre dépôt dans une langue spécifiée.

_Une soumission pour le[DEV : Actions GitHub pour l'Open Source !](https://dev.to/devteam/announcing-the-github-actions-hackathon-on-dev-3ljn)hackathon_

## Installation

1.  **Ajouter un fichier de workflow**à votre projet (par ex.`.github/workflows/readme.yml`) :

```yaml
name: Translate README

on:
  push:
    branches:
      - main
      - master
jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      # ISO Language Codes: https://cloud.google.com/translate/docs/languages  
      - name: Adding README - Chinese Simplified
        uses: dephraiim/translate-readme@main
        with:
          LANG: zh-CN
      - name: Adding README - French
        uses: dephraiim/translate-readme@main
        with:
          LANG: fr
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

### Problèmes

Vérifier[ici](https://github.com/dephraiim/translate-readme/issues/1)pour les problèmes liés à cette action.

### Développement

Les suggestions et contributions sont toujours les bienvenues ! Voir[CONTRIBUER.md](./CONTRIBUTING.md)pour les commandes de test, les codes d’erreur et les conseils de débogage. Courir`npm ci && npm run verify`avant
ouvrir une pull request.

### LICENCE

[AVEC](./LICENSE)
