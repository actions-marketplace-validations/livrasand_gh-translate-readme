![Translated to عربى](https://custom-icon-badges.demolab.com/badge/%D8%B9%D8%B1%D8%A8%D9%89-100%25-white.svg?logo=ghtr-ar&labelColor=white&color=white)

<!-- translate-readme:badges -->

[![Arabic](https://custom-icon-badges.demolab.com/badge/Arabic-white.svg?logo=ghtr-ar&labelColor=white&color=white)](README.ar.md) [![French](https://custom-icon-badges.demolab.com/badge/French-white.svg?logo=ghtr-fr&labelColor=white&color=white)](README.fr.md) [![Hindi](https://custom-icon-badges.demolab.com/badge/Hindi-white.svg?logo=ghtr-hi&labelColor=white&color=white)](README.hi.md) [![Chinese (China)](https://custom-icon-badges.demolab.com/badge/Chinese%20(China)-white.svg?logo=ghtr-zh-CN&labelColor=white&color=white)](README.zh-CN.md) [![Chinese (Taiwan)](https://custom-icon-badges.demolab.com/badge/Chinese%20(Taiwan)-white.svg?logo=ghtr-zh-TW&labelColor=white&color=white)](README.zh-TW.md)

# ترجمة الإجراء التمهيدي

## اقرأني الترجمة

-   [إنجليزي](README.md)
-   [الصينية المبسطة](README.zh-CN.md)
-   [الصينية التقليدية](README.zh-TW.md)
-   [الهندية](README.hi.md)
-   [الفرنسية](README.fr.md)
-   [عربى](README.ar.md)

**إجراء GitHub لترجمة الملف التمهيدي إلى أي لغة**

هذا هو إجراء GitHub الذي يقوم تلقائيًا بترجمة الملف التمهيدي في الريبو الخاص بك إلى لغة محددة.

_تقديم ل[DEV: إجراءات GitHub للمصدر المفتوح!](https://dev.to/devteam/announcing-the-github-actions-hackathon-on-dev-3ljn)hackathon_

## يثبت

1.  **إضافة ملف سير العمل**لمشروعك (على سبيل المثال`.github/workflows/readme.yml`):

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

## إعدادات

### خيارات

يمكنك تكوين الإجراء بشكل أكبر باستخدام الخيارات التالية:

-   `LANG`: اللغة التي تريد ترجمة الملف التمهيدي إليها (الافتراضي:`zh-CN`).
-   `PROVIDER`: مزود الترجمة المطلوب استخدامه:`google`(الافتراضي) أو`libretranslate`.
-   `LIBRETRANSLATE_URL`: عنوان URL لواجهة برمجة تطبيقات LibreTranslate (الافتراضي:`http://localhost:5000`).
-   `LIBRETRANSLATE_API_KEY`: مفتاح API إذا كان مثيل LibreTranslate الخاص بك يتطلب المصادقة (اختياري).
-   `SOURCE_LANG`: كود اللغة المصدر (الافتراضي:`auto`).

### استخدام LibreTranslate (الاستضافة الذاتية في إجراءات GitHub)

للترجمة دون حدود واجهة برمجة التطبيقات التابعة لجهات خارجية أو مخاوف تتعلق بالخصوصية، يمكنك تشغيل LibreTranslate كحاوية خدمة Docker مباشرة داخل سير عمل GitHub Actions:

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

## اللغات المدعومة

-   عند استخدام ترجمة جوجل (`PROVIDER: google`):<https://cloud.google.com/translate/docs/languages>
-   عند استخدام LibreTranslate (`PROVIDER: libretranslate`): رموز اللغة القياسية ISO 639-1 (على سبيل المثال.`es`,`fr`,`de`,`zh`,`hi`,`ar`، وما إلى ذلك) مدعومًا بمثيل LibreTranslate الخاص بك.

### مشاكل

يفحص[هنا](https://github.com/dephraiim/translate-readme/issues/1)للقضايا المتعلقة بهذا الإجراء.

### تطوير

الاقتراحات والمساهمات هي دائما موضع ترحيب! يرى[المساهمة.md](./CONTRIBUTING.md)لأوامر الاختبار ورموز الأخطاء ونصائح التصحيح. يجري`npm ci && npm run verify`من قبل
فتح طلب سحب.

### رخصة

[مع](./LICENSE)
