<!-- translate-readme:badges -->\n\n\n<!-- translate-readme:badges -->

# Translate Readme Action

## README Translation
- [English](README.md)
- [简体中文](README.zh-CN.md)
- [繁体中文](README.zh-TW.md)
- [हिंदी](README.hi.md)
- [Française](README.fr.md)
- [عربى](README.ar.md)

**GitHub Action to translate Readme to any language**

This is a GitHub Action that automatically translate the readme in your repo to a specified language.

_A submission for the [DEV: GitHub Actions For Open Source!](https://dev.to/devteam/announcing-the-github-actions-hackathon-on-dev-3ljn) hackathon_

## Setup

1. **Add a workflow file** to your project (e.g. `.github/workflows/readme.yml`):
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

### Options

You can configure the action further with the following options:

- `LANG`: The language you want to translate your readme to (default: `zh-CN`).
- `PROVIDER`: The translation provider to use: `google` (default) or `libretranslate`.
- `LIBRETRANSLATE_URL`: The URL of your LibreTranslate API (default: `http://localhost:5000`).
- `LIBRETRANSLATE_API_KEY`: API key if your LibreTranslate instance requires authentication (optional).
- `SOURCE_LANG`: Source language code (default: `auto`).

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

### Issues

Check [here](https://github.com/dephraiim/translate-readme/issues/1) for issues related to this action.

### Development

Suggestions and contributions are always welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md)
for test commands, error codes and debugging tips. Run `npm ci && npm run verify` before
opening a pull request.

### LICENSE

[MIT](./LICENSE)
