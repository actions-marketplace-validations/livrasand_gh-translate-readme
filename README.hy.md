<!-- translate-readme:badges -->

[![Abjasio](https://custom-icon-badges.demolab.com/badge/Abjasio--white.svg?logo=ghtr-ab&labelColor=white&color=white)](README.ab.md) [![Achenés](https://custom-icon-badges.demolab.com/badge/Achen%C3%A9s--white.svg?logo=ghtr-ace&labelColor=white&color=white)](README.ace.md) [![Acholí](https://custom-icon-badges.demolab.com/badge/Achol%C3%AD--white.svg?logo=ghtr-ach&labelColor=white&color=white)](README.ach.md) [![Afrikaans](https://custom-icon-badges.demolab.com/badge/Afrikaans--white.svg?logo=ghtr-af&labelColor=white&color=white)](README.af.md) [![Alur](https://custom-icon-badges.demolab.com/badge/Alur--white.svg?logo=ghtr-alz&labelColor=white&color=white)](README.alz.md) [![Amárico](https://custom-icon-badges.demolab.com/badge/Am%C3%A1rico--white.svg?logo=ghtr-am&labelColor=white&color=white)](README.am.md) [![عربى](https://custom-icon-badges.demolab.com/badge/%D8%B9%D8%B1%D8%A8%D9%89--white.svg?logo=ghtr-ar&labelColor=white&color=white)](README.ar.md) [![Française](https://custom-icon-badges.demolab.com/badge/Fran%C3%A7aise--white.svg?logo=ghtr-fr&labelColor=white&color=white)](README.fr.md) [![हिंदी](https://custom-icon-badges.demolab.com/badge/%E0%A4%B9%E0%A4%BF%E0%A4%82%E0%A4%A6%E0%A5%80--white.svg?logo=ghtr-hi&labelColor=white&color=white)](README.hi.md) [![Albanés](https://custom-icon-badges.demolab.com/badge/Alban%C3%A9s--white.svg?logo=ghtr-sq&labelColor=white&color=white)](README.sq.md) [![简体中文](https://custom-icon-badges.demolab.com/badge/%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87--white.svg?logo=ghtr-zh-cn&labelColor=white&color=white)](README.zh-CN.md) [![繁体中文](https://custom-icon-badges.demolab.com/badge/%E7%B9%81%E4%BD%93%E4%B8%AD%E6%96%87--white.svg?logo=ghtr-zh-tw&labelColor=white&color=white)](README.zh-TW.md)

# GitHub Translate Readme գործողություն

**GitHub Action՝ Readme-ը ցանկացած լեզվով թարգմանելու համար**

Սա GitHub Գործողություն է, որն ավտոմատ կերպով թարգմանում է ձեր ռեպո-ի readme-ը նշված լեզվով:

## Կարգավորում

1.  **Ավելացրեք աշխատանքային հոսքի ֆայլ**ձեր նախագծին (օրինակ.`.github/workflows/readme.yml`):

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

## Կոնֆիգուրացիա

### Ընտրանքներ

Դուք կարող եք կարգավորել գործողությունը հետագա հետևյալ տարբերակներով.

-   `LANG`Լեզուն, որին ցանկանում եք թարգմանել ձեր readme-ը (կանխադրված՝`zh-CN`)
-   `PROVIDER`Օգտագործվող թարգմանության մատակարարը.`google`(կանխադրված) կամ`libretranslate`.
-   `LIBRETRANSLATE_URL`Ձեր LibreTranslate API-ի URL-ը (կանխադրված՝`http://localhost:5000`)
-   `LIBRETRANSLATE_API_KEY`API բանալի, եթե ձեր LibreTranslate օրինակը պահանջում է նույնականացում (ըստ ցանկության):
-   `SOURCE_LANG`Աղբյուրի լեզվի կոդը (լռելյայն՝`auto`)
-   `IGNORE`Ստորակետերով բաժանված լեզուների կոդեր, որոնք պետք է բաց թողնել (օր.`fr,es`) Օգտագործեք սա, երբ լեզուն թարգմանվել է ձեռքով, որպեսզի գործողությունը չվերագրի այն:
-   `FLAG`Երկրի/դրոշի կոդը, որն օգտագործվում է լեզվական նշանակի համար (օր.`cn`,`fr`) Ընտրովի; լռելյայն է ներկառուցված քարտեզագրում, երբ բաց թողնված է:
-   `LANG_NAME`Նշանակներում օգտագործվող թիրախային լեզվի անուն (ըստ ցանկության):
-   `SHOW_PERCENTAGE`Ցույց տալ թարգմանված տոկոսը լեզվական կրծքանշաններում (`true`/`false`, լռելյայն:`true`) Սահմանել`false`թաքցնել այն:

### LibreTranslate-ի օգտագործումը (ինքնատեղակայված GitHub Actions-ում)

Թարգմանելու համար առանց երրորդ կողմի API-ի սահմանափակումների կամ գաղտնիության հետ կապված մտահոգությունների, կարող եք գործարկել LibreTranslate-ը որպես Docker ծառայության կոնտեյներ անմիջապես ձեր GitHub Actions աշխատանքային հոսքի ներսում.

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

## Աջակցվող լեզուներ

-   Google Translate-ն օգտագործելիս (`PROVIDER: google`):<https://cloud.google.com/translate/docs/languages>
-   LibreTranslate-ն օգտագործելիս (`PROVIDER: libretranslate`Ստանդարտ ISO 639-1 լեզվական ծածկագրեր (օրինակ.`es`,`fr`,`de`,`zh`,`hi`,`ar`, և այլն) աջակցվում է ձեր LibreTranslate օրինակով:

### Ձեռքով թարգմանված լեզուների անտեսում

Եթե ​​դուք թարգմանում եք README-ը ձեռքով, ավելացրեք դրա լեզվի կոդը`IGNORE`(օրինակ`IGNORE: fr,es`) այդ լեզվի աշխատանքային հոսքի քայլում կամ ամբողջությամբ անջատեք քայլը, որպեսզի գործողությունը չվերագրի ձեր աշխատանքը: Այն`IGNORE`ստուգումը կատարվում է ցանկացած թարգմանությունից կամ ֆայլ գրելուց առաջ:

### Զարգացում

Առաջարկություններն ու ներդրումները միշտ ողջունելի են: Տես[ՆՇԱՆԱԿՈՒՄ.md](./CONTRIBUTING.md)փորձարկման հրամանների, սխալի կոդերի և վրիպազերծման խորհուրդների համար: Վազիր`npm ci && npm run verify`առաջ
ձգման հարցում բացելը.
