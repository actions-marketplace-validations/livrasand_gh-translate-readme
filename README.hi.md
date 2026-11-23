<!-- translate-readme:badges -->

[![Abjasio](https://custom-icon-badges.demolab.com/badge/Abjasio--white.svg?logo=ghtr-ab&labelColor=white&color=white)](README.ab.md) [![Achenés](https://custom-icon-badges.demolab.com/badge/Achen%C3%A9s--white.svg?logo=ghtr-ace&labelColor=white&color=white)](README.ace.md) [![Acholí](https://custom-icon-badges.demolab.com/badge/Achol%C3%AD--white.svg?logo=ghtr-ach&labelColor=white&color=white)](README.ach.md) [![Afrikaans](https://custom-icon-badges.demolab.com/badge/Afrikaans--white.svg?logo=ghtr-af&labelColor=white&color=white)](README.af.md) [![Alur](https://custom-icon-badges.demolab.com/badge/Alur--white.svg?logo=ghtr-alz&labelColor=white&color=white)](README.alz.md) [![Amárico](https://custom-icon-badges.demolab.com/badge/Am%C3%A1rico--white.svg?logo=ghtr-am&labelColor=white&color=white)](README.am.md) [![عربى](https://custom-icon-badges.demolab.com/badge/%D8%B9%D8%B1%D8%A8%D9%89--white.svg?logo=ghtr-ar&labelColor=white&color=white)](README.ar.md) [![Asamés](https://custom-icon-badges.demolab.com/badge/Asam%C3%A9s--white.svg?logo=ghtr-as&labelColor=white&color=white)](README.as.md) [![Française](https://custom-icon-badges.demolab.com/badge/Fran%C3%A7aise--white.svg?logo=ghtr-fr&labelColor=white&color=white)](README.fr.md) [![हिंदी](https://custom-icon-badges.demolab.com/badge/%E0%A4%B9%E0%A4%BF%E0%A4%82%E0%A4%A6%E0%A5%80--white.svg?logo=ghtr-hi&labelColor=white&color=white)](README.hi.md) [![Armenio](https://custom-icon-badges.demolab.com/badge/Armenio--white.svg?logo=ghtr-hy&labelColor=white&color=white)](README.hy.md) [![Albanés](https://custom-icon-badges.demolab.com/badge/Alban%C3%A9s--white.svg?logo=ghtr-sq&labelColor=white&color=white)](README.sq.md) [![简体中文](https://custom-icon-badges.demolab.com/badge/%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87--white.svg?logo=ghtr-zh-cn&labelColor=white&color=white)](README.zh-CN.md) [![繁体中文](https://custom-icon-badges.demolab.com/badge/%E7%B9%81%E4%BD%93%E4%B8%AD%E6%96%87--white.svg?logo=ghtr-zh-tw&labelColor=white&color=white)](README.zh-TW.md)

# GitHub ट्रांसलेट रीडमी एक्शन

**रीडमी को किसी भी भाषा में अनुवाद करने के लिए GitHub एक्शन**

यह एक GitHub क्रिया है जो स्वचालित रूप से आपके रेपो में रीडमी को एक निर्दिष्ट भाषा में अनुवादित करती है।

## स्थापित करना

1.  **वर्कफ़्लो फ़ाइल जोड़ें**आपके प्रोजेक्ट के लिए (उदा.`.github/workflows/readme.yml`):

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

## विन्यास

### विकल्प

आप निम्नलिखित विकल्पों के साथ कार्रवाई को आगे कॉन्फ़िगर कर सकते हैं:

-   `LANG`: वह भाषा जिसमें आप अपने रीडमी का अनुवाद करना चाहते हैं (डिफ़ॉल्ट:`zh-CN`).
-   `PROVIDER`: उपयोग करने के लिए अनुवाद प्रदाता:`google`(डिफ़ॉल्ट) या`libretranslate`.
-   `LIBRETRANSLATE_URL`: आपके लिब्रेट्रांसलेट एपीआई का यूआरएल (डिफ़ॉल्ट:`http://localhost:5000`).
-   `LIBRETRANSLATE_API_KEY`: एपीआई कुंजी यदि आपके लिबरट्रांसलेट इंस्टेंस को प्रमाणीकरण की आवश्यकता है (वैकल्पिक)।
-   `SOURCE_LANG`: स्रोत भाषा कोड (डिफ़ॉल्ट:`auto`).
-   `IGNORE`: अल्पविराम से अलग किए गए भाषा कोड को छोड़ना होगा (उदा.`fr,es`). इसका उपयोग तब करें जब किसी भाषा का मैन्युअल रूप से अनुवाद किया गया हो ताकि क्रिया उसे अधिलेखित न कर दे।
-   `FLAG`: भाषा बैज के लिए उपयोग किया जाने वाला देश/ध्वज कोड (उदा.`cn`,`fr`). वैकल्पिक; छोड़े जाने पर अंतर्निहित मैपिंग डिफ़ॉल्ट हो जाती है।
-   `LANG_NAME`: बैज में प्रयुक्त लक्ष्य भाषा के लिए प्रदर्शन नाम (वैकल्पिक)।
-   `SHOW_PERCENTAGE`: भाषा बैज में अनुवादित प्रतिशत दिखाएं (`true`/`false`, गलती करना:`true`). करने के लिए सेट`false`इसे छुपाने के लिए.

### लिबरट्रांसलेट का उपयोग करना (GitHub क्रियाओं में स्व-होस्ट किया गया)

तृतीय-पक्ष एपीआई सीमा या गोपनीयता संबंधी चिंताओं के बिना अनुवाद करने के लिए, आप लिबरट्रांसलेट को सीधे अपने GitHub एक्शन वर्कफ़्लो के अंदर डॉकर सेवा कंटेनर के रूप में चला सकते हैं:

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

## समर्थित भाषाएँ

-   Google अनुवाद का उपयोग करते समय (`PROVIDER: google`):[https://cloud.google.com/translate/docs/भाषाएँ](https://cloud.google.com/translate/docs/languages)
-   लिब्रेट्रांसलेट का उपयोग करते समय (`PROVIDER: libretranslate`): मानक आईएसओ 639-1 भाषा कोड (उदा.`es`,`fr`,`de`,`zh`,`hi`,`ar`, आदि) आपके लिबरट्रांसलेट उदाहरण द्वारा समर्थित है।

### मैन्युअल रूप से अनुवादित भाषाओं को अनदेखा करना

यदि आप किसी README का मैन्युअल रूप से अनुवाद करते हैं, तो उसका भाषा कोड इसमें जोड़ें`IGNORE`(उदाहरण के लिए`IGNORE: fr,es`) उस भाषा के लिए वर्कफ़्लो चरण में, या चरण को पूरी तरह से अक्षम कर दें, ताकि कार्रवाई आपके कार्य को अधिलेखित न कर दे।`IGNORE`किसी भी अनुवाद या फ़ाइल लिखने से पहले चेक चलता है।

### विकास

सुझावों और योगदानों का हमेशा स्वागत है! देखना[योगदान.एमडी](./CONTRIBUTING.md)परीक्षण आदेशों, त्रुटि कोड और डिबगिंग युक्तियों के लिए। दौड़ना`npm ci && npm run verify`पहले
एक पुल अनुरोध खोलना.
