<!-- translate-readme:badges -->

[![Arabic](https://custom-icon-badges.demolab.com/badge/Arabic-100%25-white.svg?logo=ghtr-ar&labelColor=white&color=white)](README.ar.md) [![Française](https://custom-icon-badges.demolab.com/badge/Fran%C3%A7aise-100%25-white.svg?logo=ghtr-fr&labelColor=white&color=white)](README.fr.md) [![Hindi](https://custom-icon-badges.demolab.com/badge/Hindi-100%25-white.svg?logo=ghtr-hi&labelColor=white&color=white)](README.hi.md) [![简体中文](https://custom-icon-badges.demolab.com/badge/%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87--white.svg?logo=ghtr-zh-cn&labelColor=white&color=white)](README.zh-CN.md) [![Chinese (Taiwan)](https://custom-icon-badges.demolab.com/badge/Chinese%20(Taiwan)--white.svg?logo=ghtr-zh-tw&labelColor=white&color=white)](README.zh-TW.md)

# GitHub 翻譯自述文件操作

**GitHub Action 將自述文件翻譯成任何語言**

這是一個 GitHub Action，可自動將儲存庫中的自述文件翻譯為指定語言。

## 設定

1.  **新增工作流程文件**到您的專案（例如`.github/workflows/readme.yml`）：

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

### 選項

您可以使用以下選項進一步配置操作：

-   `LANG`：您要將自述文件翻譯成的語言（預設值：`zh-CN`）。
-   `PROVIDER`：要使用的翻譯提供者：`google`（預設）或`libretranslate`。
-   `LIBRETRANSLATE_URL`：LibreTranslate API 的 URL（預設值：`http://localhost:5000`）。
-   `LIBRETRANSLATE_API_KEY`：API 金鑰（如果您的 LibreTranslate 實例需要驗證）（可選）。
-   `SOURCE_LANG`：原始語言代碼（預設：`auto`）。
-   `IGNORE`：要跳過的以逗號分隔的語言代碼（例如`fr,es`）。當語言已手動翻譯時使用此選項，這樣操作就不會覆寫它。
-   `FLAG`：用於語言徽章的國家/國旗代碼（例如`cn`,`fr`）。選修的;省略時預設為內建映射。
-   `LANG_NAME`：徽章中使用的目標語言的顯示名稱（可選）。
-   `SHOW_PERCENTAGE`：以語言徽章顯示翻譯百分比（`true`/`false`, 預設:`true`）。設定為`false`隱藏它。

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

### 忽略手動翻譯的語言

如果您手動翻譯 README，請將其語言程式碼新增至`IGNORE`（例如`IGNORE: fr,es`) 在該語言的工作流程步驟中，或完全停用該步驟，以便該操作不會覆寫您的工作。這`IGNORE`檢查在任何翻譯或文件寫入之前運行。

### 發展

隨時歡迎提出建議和貢獻！看[貢獻.md](./CONTRIBUTING.md)有關測試命令、錯誤代碼和調試提示。跑步`npm ci && npm run verify`之前
打開拉取請求。
