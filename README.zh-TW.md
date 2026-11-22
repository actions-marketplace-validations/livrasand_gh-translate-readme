![Translated to 繁体中文](https://custom-icon-badges.demolab.com/badge/%E7%B9%81%E4%BD%93%E4%B8%AD%E6%96%87-100%25-white.svg?logo=ghtr-zh-TW&labelColor=white&color=white)

<!-- translate-readme:badges -->\n\n<!-- translate-readme:badges -->

# 翻譯自述文件操作

## 自述文件翻譯

-   [英語](README.md)
-   [簡體中文](README.zh-CN.md)
-   [繁體中文](README.zh-TW.md)
-   [印地語](README.hi.md)
-   [法語](README.fr.md)
-   [阿拉伯](README.ar.md)

**GitHub Action 將自述文件翻譯成任何語言**

這是一個 GitHub Action，可自動將儲存庫中的自述文件翻譯為指定語言。

_提交給[DEV：開源的 GitHub 行動！](https://dev.to/devteam/announcing-the-github-actions-hackathon-on-dev-3ljn)黑客松_

## 設定

1.  **新增工作流程文件**到您的專案（例如`.github/workflows/readme.yml`）：

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

## 配置

### 選項

您可以使用以下選項進一步配置操作：

-   `LANG`：您要將自述文件翻譯成的語言（預設值：`zh-CN`）。
-   `PROVIDER`：要使用的翻譯提供者：`google`（預設）或`libretranslate`。
-   `LIBRETRANSLATE_URL`：LibreTranslate API 的 URL（預設值：`http://localhost:5000`）。
-   `LIBRETRANSLATE_API_KEY`：API 金鑰（如果您的 LibreTranslate 實例需要驗證）（可選）。
-   `SOURCE_LANG`：原始語言代碼（預設：`auto`）。

### 使用 LibreTranslate（在 GitHub Actions 中自架）

若要在沒有第三方 API 限製或隱私問題的情況下進行翻譯，您可以直接在 GitHub Actions 工作流程中將 LibreTranslate 作為 Docker 服務容器執行：

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

## 支援的語言

-   使用谷歌翻譯時（`PROVIDER: google`）：<https://cloud.google.com/translate/docs/languages>
-   使用 LibreTranslate 時（`PROVIDER: libretranslate`)：標準 ISO 639-1 語言代碼（例如`es`,`fr`,`de`,`zh`,`hi`,`ar`等）由您的 LibreTranslate 實例支援。

### 問題

查看[這裡](https://github.com/dephraiim/translate-readme/issues/1)對於與此操作相關的問題。

### 發展

隨時歡迎提出建議和貢獻！看[貢獻.md](./CONTRIBUTING.md)有關測試命令、錯誤代碼和調試提示。跑步`npm ci && npm run verify`之前
打開拉取請求。

### 執照

[和](./LICENSE)
