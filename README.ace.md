<!-- translate-readme:badges -->

[![Abjasio](https://custom-icon-badges.demolab.com/badge/Abjasio--white.svg?logo=ghtr-ab&labelColor=white&color=white)](README.ab.md) [![Achenés](https://custom-icon-badges.demolab.com/badge/Achen%C3%A9s--white.svg?logo=ghtr-ace&labelColor=white&color=white)](README.ace.md) [![Acholí](https://custom-icon-badges.demolab.com/badge/Achol%C3%AD--white.svg?logo=ghtr-ach&labelColor=white&color=white)](README.ach.md) [![Afrikaans](https://custom-icon-badges.demolab.com/badge/Afrikaans--white.svg?logo=ghtr-af&labelColor=white&color=white)](README.af.md) [![Alur](https://custom-icon-badges.demolab.com/badge/Alur--white.svg?logo=ghtr-alz&labelColor=white&color=white)](README.alz.md) [![Amárico](https://custom-icon-badges.demolab.com/badge/Am%C3%A1rico--white.svg?logo=ghtr-am&labelColor=white&color=white)](README.am.md) [![عربى](https://custom-icon-badges.demolab.com/badge/%D8%B9%D8%B1%D8%A8%D9%89--white.svg?logo=ghtr-ar&labelColor=white&color=white)](README.ar.md) [![Asamés](https://custom-icon-badges.demolab.com/badge/Asam%C3%A9s--white.svg?logo=ghtr-as&labelColor=white&color=white)](README.as.md) [![Française](https://custom-icon-badges.demolab.com/badge/Fran%C3%A7aise--white.svg?logo=ghtr-fr&labelColor=white&color=white)](README.fr.md) [![हिंदी](https://custom-icon-badges.demolab.com/badge/%E0%A4%B9%E0%A4%BF%E0%A4%82%E0%A4%A6%E0%A5%80--white.svg?logo=ghtr-hi&labelColor=white&color=white)](README.hi.md) [![Armenio](https://custom-icon-badges.demolab.com/badge/Armenio--white.svg?logo=ghtr-hy&labelColor=white&color=white)](README.hy.md) [![Albanés](https://custom-icon-badges.demolab.com/badge/Alban%C3%A9s--white.svg?logo=ghtr-sq&labelColor=white&color=white)](README.sq.md) [![简体中文](https://custom-icon-badges.demolab.com/badge/%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87--white.svg?logo=ghtr-zh-cn&labelColor=white&color=white)](README.zh-CN.md) [![繁体中文](https://custom-icon-badges.demolab.com/badge/%E7%B9%81%E4%BD%93%E4%B8%AD%E6%96%87--white.svg?logo=ghtr-zh-tw&labelColor=white&color=white)](README.zh-TW.md)

# GitHub Terjemahkan Tindakan Readme .

**GitHub Tindakan keu neuterjeumah Readme keu basa peu mantong .**

Nyoe nakeuh saboh GitHub Action nyang otomatis jiterjeumah readme lam repo droeneuh keu saboh basa nyang ka jiteuntèe.

## Pasang

1.  **Tambah file alur kerja .**keu proyek droeneuh (misal jih.`.github/workflows/readme.yml`):

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

## Konfigurasi

### Pilihan

Droeneuh jeuet neukonfigurasi tindakan nyan leubeh lanjot ngon opsi-opsi di miyup nyoe:

-   `LANG`: Bahasa nyang keuneuk neuterjeumah readme droeneuh keu (default:`zh-CN`).
-   `PROVIDER`: Peuseudia terjemahan nyang akan geungui:`google`(lalai) atawa`libretranslate`.
-   `LIBRETRANSLATE_URL`: URL API Terjemahan Libre droeneuh (default:`http://localhost:5000`).
-   `LIBRETRANSLATE_API_KEY`: Kunci API meunyo instansi LibreTranslate droeneuh peureulee otentikasi (hana peureulee).
-   `SOURCE_LANG`: Kode basa sumber (default:`auto`).
-   `IGNORE`: Kode-kode basa nyang geupisah ngon tanda koma keu geu-skip (misaljih.`fr,es`). Gunakan nyoe watee saboh basa ka geuterjeumah seucara manual supaya tindakan nyan hana geutuleh.
-   `FLAG`: Kode nanggroë/bendera nyang geungui keu lencana basa (misaljih.`cn`,`fr`). Hana wajeb; default keu saboh pemetaan nyang ka teupeugot meunyo geupeugadeh.
-   `LANG_NAME`: Tampilan nan keu basa target nyang geungui lam lencana (opsional).
-   `SHOW_PERCENTAGE`: Peuleumah persentase nyang ka geuterjeumah lam lencana basa ( ).`true`/`false`, lagena:`true`). Setel keu`false`keu peusöm.

### Meungui LibreTerjemahan (Geu-Host Keudroe lam Tindakan GitHub)

Keu neuterjeumah hana bataih API pihak keu lhee atawa masalah privasi, droeneuh jeuet neujak LibreTranslate seubagoe wadah layanan Docker langsong lam alur buet GitHub Actions droeneuh:

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

## Bahasa nyang geudukong

-   Bak geungui Google Terjemahan (`PROVIDER: google`):[https://awan.google.com/terjemahkan/dokumen/bahasa](https://cloud.google.com/translate/docs/languages)
-   Bak geungui LibreTerjemahan (`PROVIDER: libretranslate`): Kode-kode bahsa standar ISO 639-1 (misaljih.`es`,`fr`,`de`,`zh`,`hi`,`ar`, dan laen-laen) nyang geudukong le instansi LibreTranslate droeneuh.

### Meuabaikan basa nyang geuterjeumah manual

Meunyo neuterjeumah saboh README seucara manual, neutamah kode basa jih keu .`IGNORE`(miseujih`IGNORE: fr,es`) lam langkah alur buet keu basa nyan, atawa neupeu-aktif langkah nyan mandum, sampoe tindakan nyan hana jituleh buet droeneuh. Nyan`IGNORE`cek meujalan sigohlom terjemahan atawa tuleh file peu mantong.

### Peurkembangan

Saran dan kontribusi sabee kamoe teurimong! Kaloen[SUMBANGAN.md](./CONTRIBUTING.md)keu peurintah tes, kode kesalahan ngon tips debugging. Plueng`npm ci && npm run verify`seugolom
buka saboh permintaan tarik.

* * *

_✨ Teurimong geunaseh ka neukunjong**gh-neuterjeumah-meubaca**!_

<img src="https://visitor-badge.laobi.icu/badge?page_id=livrasand.gh-translate-readme&style=for-the-badge&color=00d4ff" alt="Views">
