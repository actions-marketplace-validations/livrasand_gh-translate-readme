<!-- translate-readme:badges -->

[![Arabic](https://custom-icon-badges.demolab.com/badge/Arabic-100%25-white.svg?logo=ghtr-ar&labelColor=white&color=white)](README.ar.md) [![Française](https://custom-icon-badges.demolab.com/badge/Fran%C3%A7aise-100%25-white.svg?logo=ghtr-fr&labelColor=white&color=white)](README.fr.md) [![Hindi](https://custom-icon-badges.demolab.com/badge/Hindi-100%25-white.svg?logo=ghtr-hi&labelColor=white&color=white)](README.hi.md) [![Chinese (China)](https://custom-icon-badges.demolab.com/badge/Chinese%20(China)-100%25-white.svg?logo=ghtr-zh-cn&labelColor=white&color=white)](README.zh-CN.md) [![Chinese (Taiwan)](https://custom-icon-badges.demolab.com/badge/Chinese%20(Taiwan)-100%25-white.svg?logo=ghtr-zh-tw&labelColor=white&color=white)](README.zh-TW.md)

# GitHub 翻译自述文件操作

**GitHub Action 将自述文件翻译成任何语言**

这是一个 GitHub Action，可自动将存储库中的自述文件翻译为指定语言。

## 设置

1.  **添加工作流程文件**到您的项目（例如`.github/workflows/readme.yml`）：

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

## 配置

### 选项

您可以使用以下选项进一步配置操作：

-   `LANG`：您要将自述文件翻译成的语言（默认值：`zh-CN`）。
-   `PROVIDER`：要使用的翻译提供商：`google`（默认）或`libretranslate`。
-   `LIBRETRANSLATE_URL`：LibreTranslate API 的 URL（默认值：`http://localhost:5000`）。
-   `LIBRETRANSLATE_API_KEY`：API 密钥（如果您的 LibreTranslate 实例需要身份验证）（可选）。
-   `SOURCE_LANG`：源语言代码（默认：`auto`）。
-   `IGNORE`：要跳过的以逗号分隔的语言代码（例如`fr,es`）。当语言已手动翻译时使用此选项，这样操作就不会覆盖它。
-   `FLAG`：用于语言徽章的国家/国旗代码（例如`cn`,`fr`）。选修的;省略时默认为内置映射。
-   `LANG_NAME`：徽章中使用的目标语言的显示名称（可选）。
-   `SHOW_PERCENTAGE`：以语言徽章显示翻译百分比（`true`/`false`， 默认：`true`）。设置为`false`隐藏它。

### 使用 LibreTranslate（在 GitHub Actions 中自托管）

要在没有第三方 API 限制或隐私问题的情况下进行翻译，您可以直接在 GitHub Actions 工作流程中将 LibreTranslate 作为 Docker 服务容器运行：

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

## 支持的语言

-   使用谷歌翻译时（`PROVIDER: google`）：<https://cloud.google.com/translate/docs/languages>
-   使用 LibreTranslate 时（`PROVIDER: libretranslate`)：标准 ISO 639-1 语言代码（例如`es`,`fr`,`de`,`zh`,`hi`,`ar`等）由您的 LibreTranslate 实例支持。

### 忽略手动翻译的语言

如果您手动翻译 README，请将其语言代码添加到`IGNORE`（例如`IGNORE: fr,es`) 在该语言的工作流程步骤中，或完全禁用该步骤，以便该操作不会覆盖您的工作。这`IGNORE`检查在任何翻译或文件写入之前运行。

### 发展

随时欢迎提出建议和贡献！看[贡献.md](./CONTRIBUTING.md)有关测试命令、错误代码和调试提示。跑步`npm ci && npm run verify`之前
打开拉取请求。
