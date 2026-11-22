<!-- translate-readme:badges -->
[![Arabic](https://custom-icon-badges.demolab.com/badge/Arabic-100%25-white.svg?logo=ghtr-ar&labelColor=white&color=white)](README.ar.md) [![French](https://custom-icon-badges.demolab.com/badge/French-100%25-white.svg?logo=ghtr-fr&labelColor=white&color=white)](README.fr.md) [![हिंदी](https://custom-icon-badges.demolab.com/badge/%E0%A4%B9%E0%A4%BF%E0%A4%82%E0%A4%A6%E0%A5%80-100%25-white.svg?logo=ghtr-hi&labelColor=white&color=white)](README.hi.md) [![Chinese (China)](https://custom-icon-badges.demolab.com/badge/Chinese%20(China)-100%25-white.svg?logo=ghtr-zh-cn&labelColor=white&color=white)](README.zh-CN.md) [![Chinese (Taiwan)](https://custom-icon-badges.demolab.com/badge/Chinese%20(Taiwan)-100%25-white.svg?logo=ghtr-zh-tw&labelColor=white&color=white)](README.zh-TW.md)

# GitHub Translate Readme Action

**GitHub Action to translate Readme to any language**

This is a GitHub Action that automatically translate the readme in your repo to a specified language.

## Setup

1. **Add a workflow file** to your project (e.g. `.github/workflows/readme.yml`):
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

### Options

You can configure the action further with the following options:

- `LANG`: The language you want to translate your readme to (default: `zh-CN`).
- `PROVIDER`: The translation provider to use: `google` (default) or `libretranslate`.
- `LIBRETRANSLATE_URL`: The URL of your LibreTranslate API (default: `http://localhost:5000`).
- `LIBRETRANSLATE_API_KEY`: API key if your LibreTranslate instance requires authentication (optional).
- `SOURCE_LANG`: Source language code (default: `auto`).
- `IGNORE`: Comma-separated language codes to skip (e.g. `fr,es`). Use this when a language has been translated manually so the action does not overwrite it.
- `FLAG`: Country/flag code used for the language badge (e.g. `cn`, `fr`). Optional; defaults to a built-in mapping when omitted.
- `LANG_NAME`: Display name for the target language used in badges (optional).

### Using LibreTranslate (Self-Hosted in GitHub Actions)

To translate without third-party API limits or privacy concerns, you can run LibreTranslate as a Docker service container directly inside your GitHub Actions workflow:

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

## Supported Languages

- When using Google Translate (`PROVIDER: google`): https://cloud.google.com/translate/docs/languages
- When using LibreTranslate (`PROVIDER: libretranslate`): Standard ISO 639-1 language codes (e.g. `es`, `fr`, `de`, `zh`, `hi`, `ar`, etc.) supported by your LibreTranslate instance.

### Ignoring manually translated languages

If you translate a README manually, add its language code to `IGNORE` (for example `IGNORE: fr,es`) in the workflow step for that language, or disable the step entirely, so the action does not overwrite your work. The `IGNORE` check runs before any translation or file write.

### Development

Suggestions and contributions are always welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md)
for test commands, error codes and debugging tips. Run `npm ci && npm run verify` before
opening a pull request.
