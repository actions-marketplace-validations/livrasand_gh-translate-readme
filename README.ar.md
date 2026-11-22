<!-- translate-readme:badges -->

[![عربى](https://custom-icon-badges.demolab.com/badge/%D8%B9%D8%B1%D8%A8%D9%89-100%25-white.svg?logo=ghtr-ar&labelColor=white&color=white)](README.ar.md) [![Française](https://custom-icon-badges.demolab.com/badge/Fran%C3%A7aise-100%25-white.svg?logo=ghtr-fr&labelColor=white&color=white)](README.fr.md) [![हिंदी](https://custom-icon-badges.demolab.com/badge/%E0%A4%B9%E0%A4%BF%E0%A4%82%E0%A4%A6%E0%A5%80-100%25-white.svg?logo=ghtr-hi&labelColor=white&color=white)](README.hi.md) [![简体中文](https://custom-icon-badges.demolab.com/badge/%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87--white.svg?logo=ghtr-zh-cn&labelColor=white&color=white)](README.zh-CN.md) [![繁体中文](https://custom-icon-badges.demolab.com/badge/%E7%B9%81%E4%BD%93%E4%B8%AD%E6%96%87-100%25-white.svg?logo=ghtr-zh-tw&labelColor=white&color=white)](README.zh-TW.md)

# جيثب ترجمة الإجراء التمهيدي

**إجراء GitHub لترجمة الملف التمهيدي إلى أي لغة**

هذا هو إجراء GitHub الذي يقوم تلقائيًا بترجمة الملف التمهيدي في الريبو الخاص بك إلى لغة محددة.

## يثبت

1.  **إضافة ملف سير العمل**لمشروعك (على سبيل المثال`.github/workflows/readme.yml`):

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

## إعدادات

### خيارات

يمكنك تكوين الإجراء بشكل أكبر باستخدام الخيارات التالية:

-   `LANG`: اللغة التي تريد ترجمة الملف التمهيدي إليها (الافتراضي:`zh-CN`).
-   `PROVIDER`: مزود الترجمة للاستخدام:`google`(الافتراضي) أو`libretranslate`.
-   `LIBRETRANSLATE_URL`: عنوان URL لواجهة برمجة تطبيقات LibreTranslate (الافتراضي:`http://localhost:5000`).
-   `LIBRETRANSLATE_API_KEY`: مفتاح API إذا كان مثيل LibreTranslate الخاص بك يتطلب المصادقة (اختياري).
-   `SOURCE_LANG`: كود اللغة المصدر (الافتراضي:`auto`).
-   `IGNORE`: رموز اللغة المفصولة بفواصل التي يجب تخطيها (على سبيل المثال:`fr,es`). استخدم هذا عندما تتم ترجمة لغة ما يدويًا حتى لا يحل الإجراء محلها.
-   `FLAG`: رمز البلد/العلم المستخدم لشارة اللغة (على سبيل المثال:`cn`,`fr`). خياري؛ الإعدادات الافتراضية للتعيين المضمن عند حذفها.
-   `LANG_NAME`: الاسم المعروض للغة الهدف المستخدمة في الشارات (اختياري).
-   `SHOW_PERCENTAGE`: إظهار النسبة المئوية المترجمة في شارات اللغة (`true`/`false`، تقصير:`true`). اضبط على`false`لإخفائه.

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

### تجاهل اللغات المترجمة يدوياً

إذا قمت بترجمة ملف README يدويًا، فأضف رمز اللغة الخاص به إلى`IGNORE`(على سبيل المثال`IGNORE: fr,es`) في خطوة سير العمل لتلك اللغة، أو قم بتعطيل الخطوة بالكامل، بحيث لا يقوم الإجراء بالكتابة فوق عملك. ال`IGNORE`يتم تشغيل الفحص قبل أي ترجمة أو كتابة ملف.

### تطوير

الاقتراحات والمساهمات هي دائما موضع ترحيب! يرى[المساهمة.md](./CONTRIBUTING.md)لأوامر الاختبار ورموز الأخطاء ونصائح التصحيح. يجري`npm ci && npm run verify`من قبل
فتح طلب سحب.
