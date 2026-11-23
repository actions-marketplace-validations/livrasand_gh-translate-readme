<!-- translate-readme:badges -->

[![Abjasio](https://custom-icon-badges.demolab.com/badge/Abjasio--white.svg?logo=ghtr-ab&labelColor=white&color=white)](README.ab.md) [![Achenés](https://custom-icon-badges.demolab.com/badge/Achen%C3%A9s--white.svg?logo=ghtr-ace&labelColor=white&color=white)](README.ace.md) [![Acholí](https://custom-icon-badges.demolab.com/badge/Achol%C3%AD--white.svg?logo=ghtr-ach&labelColor=white&color=white)](README.ach.md) [![Afrikaans](https://custom-icon-badges.demolab.com/badge/Afrikaans--white.svg?logo=ghtr-af&labelColor=white&color=white)](README.af.md) [![Alur](https://custom-icon-badges.demolab.com/badge/Alur--white.svg?logo=ghtr-alz&labelColor=white&color=white)](README.alz.md) [![Amárico](https://custom-icon-badges.demolab.com/badge/Am%C3%A1rico--white.svg?logo=ghtr-am&labelColor=white&color=white)](README.am.md) [![عربى](https://custom-icon-badges.demolab.com/badge/%D8%B9%D8%B1%D8%A8%D9%89--white.svg?logo=ghtr-ar&labelColor=white&color=white)](README.ar.md) [![Française](https://custom-icon-badges.demolab.com/badge/Fran%C3%A7aise--white.svg?logo=ghtr-fr&labelColor=white&color=white)](README.fr.md) [![हिंदी](https://custom-icon-badges.demolab.com/badge/%E0%A4%B9%E0%A4%BF%E0%A4%82%E0%A4%A6%E0%A5%80--white.svg?logo=ghtr-hi&labelColor=white&color=white)](README.hi.md) [![Armenio](https://custom-icon-badges.demolab.com/badge/Armenio--white.svg?logo=ghtr-hy&labelColor=white&color=white)](README.hy.md) [![Albanés](https://custom-icon-badges.demolab.com/badge/Alban%C3%A9s--white.svg?logo=ghtr-sq&labelColor=white&color=white)](README.sq.md) [![简体中文](https://custom-icon-badges.demolab.com/badge/%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87--white.svg?logo=ghtr-zh-cn&labelColor=white&color=white)](README.zh-CN.md) [![繁体中文](https://custom-icon-badges.demolab.com/badge/%E7%B9%81%E4%BD%93%E4%B8%AD%E6%96%87--white.svg?logo=ghtr-zh-tw&labelColor=white&color=white)](README.zh-TW.md)

# GitHub অনুবাদ Readme কাৰ্য্য

**GitHub Readme যিকোনো ভাষালৈ অনুবাদ কৰিবলৈ কাৰ্য্য**

এইটো এটা GitHub কাৰ্য্য যি আপোনাৰ repo ত readme স্বয়ংক্ৰিয়ভাৱে এটা ধাৰ্য্য কৰা ভাষালৈ অনুবাদ কৰে ।

## স্থাপন কৰা

1.  **এটা কাৰ্য্যপ্ৰবাহ নথিপত্ৰ যোগ কৰক**আপোনাৰ প্ৰকল্পলৈ (যেনে.`.github/workflows/readme.yml`): .

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

## বিন্যাস

### বিকল্পসমূহ

আপুনি নিম্নলিখিত বিকল্পসমূহৰ সৈতে কাৰ্য্যক আৰু বিন্যাস কৰিব পাৰিব:

-   `LANG`: আপুনি আপোনাৰ readme অনুবাদ কৰিব বিচৰা ভাষাটো (অবিকল্পিত:`zh-CN`).
-   `PROVIDER`: ব্যৱহাৰ কৰিবলৈ অনুবাদ প্ৰদানকাৰী:`google`(অবিকল্পিত) বা`libretranslate`.
-   `LIBRETRANSLATE_URL`: আপোনাৰ LibreTranslate API ৰ URL (অবিকল্পিত:`http://localhost:5000`).
-   `LIBRETRANSLATE_API_KEY`: API চাবি যদি আপোনাৰ LibreTranslate উদাহৰণৰ প্ৰমাণীকৰণৰ প্ৰয়োজন হয় (ঐচ্ছিক)।
-   `SOURCE_LANG`: উৎস ভাষা ক'ড (অবিকল্পিত:`auto`).
-   `IGNORE`: কমা-বিভাজিত ভাষা ক'ডসমূহ এৰি যাবলৈ (যেনে.`fr,es`). এইটো ব্যৱহাৰ কৰক যেতিয়া এটা ভাষা হস্তচালিতভাৱে অনুবাদ কৰা হৈছে যাতে কাৰ্য্যই ইয়াক অভাৰৰাইট নকৰে।
-   `FLAG`: ভাষাৰ বেজৰ বাবে ব্যৱহৃত দেশ/পতাকা ক'ড (যেনে-`cn`,`fr`). বৈকল্পিক; বাদ দিয়াৰ সময়ত এটা অন্তৰ্নিৰ্মিত মেপিংলৈ অবিকল্পিত হয়।
-   `LANG_NAME`: বেজত ব্যৱহৃত লক্ষ্য ভাষাৰ বাবে প্ৰদৰ্শন নাম (ঐচ্ছিক)।
-   `SHOW_PERCENTAGE`: অনুবাদ কৰা শতাংশ ভাষা বেজত দেখুৱাওক (`true`/`false`, ডিফল্ট:`true`). লে ছেট কৰক`false`লুকুৱাবলৈ।

### LibreTranslate ব্যৱহাৰ কৰা (GitHub কাৰ্য্যসমূহত স্ব-হ'ষ্ট কৰা)

তৃতীয়-পক্ষ API সীমা বা গোপনীয়তা উদ্বেগ অবিহনে অনুবাদ কৰিবলে, আপুনি LibreTranslateক এটা Docker সেৱা ধাৰক হিচাপে আপোনাৰ GitHub কাৰ্য্যসমূহ কাৰ্য্যপ্ৰবাহৰ ভিতৰত পোনপটীয়াকৈ চলাব পাৰিব:

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

## সমৰ্থিত ভাষাসমূহ

-   Google Translate ব্যৱহাৰ কৰাৰ সময়ত (`PROVIDER: google`): .[https://cloud.google.com/translate/docs/ভাষাসমূহ](https://cloud.google.com/translate/docs/languages)
-   LibreTranslate ব্যৱহাৰ কৰাৰ সময়ত (`PROVIDER: libretranslate`): প্ৰামাণিক ISO 639-1 ভাষা ক'ডসমূহ (যেনে.`es`,`fr`,`de`,`zh`,`hi`,`ar`, ইত্যাদি) আপোনাৰ LibreTranslate উদাহৰণৰ দ্বাৰা সমৰ্থিত ।

### হাতেৰে অনুবাদ কৰা ভাষাসমূহক আওকাণ কৰা

যদি আপুনি এটা README হস্তচালিতভাৱে অনুবাদ কৰে, ইয়াৰ ভাষা ক'ড যোগ কৰক`IGNORE`(উদাহৰণ স্বৰূপে`IGNORE: fr,es`) সেই ভাষাৰ বাবে কাৰ্য্যপ্ৰবাহ পদক্ষেপত, বা পদক্ষেপটো সম্পূৰ্ণৰূপে নিষ্ক্ৰিয় কৰক, যাতে কাৰ্য্যই আপোনাৰ কাম অভাৰৰাইট নকৰে। দ্য...`IGNORE`কোনো অনুবাদ বা ফাইল লিখাৰ আগতে পৰীক্ষা চলি থাকে।

### বিকাশ

পৰামৰ্শ আৰু অৱদান সদায় আদৰণীয়! চোৱা[CONTRIBUTING.md](./CONTRIBUTING.md)পৰীক্ষা আদেশ, ভুল ক'ড আৰু ডিবাগিং টিপছৰ বাবে। দৌৰা`npm ci && npm run verify`আগতে
এটা টানি অনুৰোধ খোলা।
