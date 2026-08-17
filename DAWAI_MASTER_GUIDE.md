# 🏥 DAWAI دوائي — وصية كلود للكلود التالي
> اقرأ هذا الملف كاملاً قبل أي شيء. لا تبتدع. لا تغير. اتبع ما هنا فقط.

---

## 📌 معلومات المشروع الثابتة

```
GitHub Repo   : https://github.com/ammar1994/dawai-mobile
Backend URL   : https://pharmacy-saas-backend.onrender.com
Mobile Base   : https://pharmacy-saas-backend.onrender.com/mobile
Platform      : Android (أولاً) + iOS (لاحقاً)
App ID        : com.dawaiapp  ← هذا هو الصحيح الآن
App Name AR   : دوائي
App Name EN   : Dawai
React Native  : 0.76.9
```

> ⚠️ لا تضع الـ Token هنا — احصل عليه من صاحب المشروع مباشرة.

---

## 🔍 كيف تفحص الـ Repo أول شيء

```bash
TOKEN="TOKEN_HERE"

# آخر 5 builds
curl -s -H "Authorization: token $TOKEN" \
  "https://api.github.com/repos/ammar1994/dawai-mobile/actions/runs?per_page=5" | \
  python3 -c "
import sys,json
d=json.load(sys.stdin)
for r in d.get('workflow_runs',[]):
    print(f\"#{r['run_number']} | {r['conclusion']} | {r['created_at'][:16]}\")
"

# آخر خطأ مسجّل
curl -s -H "Authorization: token $TOKEN" \
  "https://api.github.com/repos/ammar1994/dawai-mobile/contents/build-error.log" | \
  python3 -c "import sys,json,base64; d=json.load(sys.stdin); print(base64.b64decode(d['content']).decode('utf-8'))"

# قراءة أي ملف
curl -s -H "Authorization: token $TOKEN" \
  "https://api.github.com/repos/ammar1994/dawai-mobile/contents/PATH_HERE" | \
  python3 -c "import sys,json,base64; d=json.load(sys.stdin); print(base64.b64decode(d['content']).decode('utf-8'))"
```

---

## 📊 تاريخ الأخطاء الكاملة — #672 إلى #787

### المرحلة الأولى (~#672-710) ✅ محلولة
**السبب:** `Plugin with id 'com.facebook.react.rootproject' not found`
**الحل:** `pluginManagement { includeBuild(...) }` مرة واحدة فقط في settings.gradle

### المرحلة الثانية (~#710-726) ✅ محلولة
**السبب:** `StringIndexOutOfBoundsException` في `ReactSettingsExtension.kt`
**الحل:** ترقية RN من 0.76.5 إلى 0.76.9

### المرحلة الثالثة (~#726-740) ✅ محلولة
**السبب:** `android:editTextBackgroundMode` — خاصية غير موجودة في Public API
**الحل:** `attrs.xml` فارغة + `styles.xml` نظيفة فقط بـ AppTheme

### المرحلة الرابعة (~#740-760) ✅ محلولة
**السبب:** `applicationId` متضارب بين `com.dawai.pharmacy` و `com.dawaiapp`
**الحل:** `com.dawaiapp` في كل مكان، `google-services.json` محذوف

### المرحلة الخامسة (~#760-780) ✅ محلولة جزئياً
**السبب:** `processDebugGoogleServices FAILED`
**الحل:** حذف Firebase BOM + google-services classpath + google-services.json

### المرحلة السادسة (#781-787) ← الوضع الحالي ❌
**السبب:** `:app:compileDebugJavaWithJavac FAILED`
**تشخيص:** ثلاث مشاكل متداخلة (انظر القسم التالي)

---

## 🎯 المشاكل الثلاث الحالية — بالترتيب

### ❌ المشكلة الأولى (الأهم): AGP/Gradle Incompatible
```
Gradle:  8.10.2  (gradle-wrapper.properties)
AGP:     8.6.1   (android/build.gradle)

AGP 8.6.x يدعم Gradle 8.7 → 8.9 فقط
Gradle 8.10.2 يحتاج AGP 8.7.x أو أعلى
```
**الحل:** في `android/build.gradle` غيّر:
```gradle
classpath("com.android.tools.build:gradle:8.6.1")
```
إلى:
```gradle
classpath("com.android.tools.build:gradle:8.8.1")
```

### ❌ المشكلة الثانية: build-error.log أعمى
الـ workflow يلتقط فقط `tail -40` وهي Gradle stacktrace.
أخطاء javac الحقيقية (مثل `error: cannot find symbol`) تظهر في منتصف اللوج ولا تُلتقط.

**الحل:** في `.github/workflows/build-apk.yml` في قسم "Save error to repo"، أضف بعد سطر `tail -40`:
```bash
echo "=== JAVA COMPILER ERRORS ==="
grep -E "error: |\.java:[0-9]+: error|\.kt:[0-9]+: error" /tmp/build.log | head -30 || true
```

### ⚠️ المشكلة الثالثة: AndroidManifest يشير لـ Firebase المحذوف
```xml
<!-- هذا السطر في AndroidManifest.xml لكن Firebase غير موجود في dependencies -->
<service android:name="com.google.firebase.messaging.FirebaseMessagingService" ...>
```
**الحل:** احذف هذا الـ `<service>` block كاملاً من `AndroidManifest.xml`

---

## ✅ الوضع الحالي للملفات (آخر فحص: 2026-08-17 بعد #787)

### `android/settings.gradle` ✅ صحيح — لا تعدّل
```gradle
pluginManagement { includeBuild("../node_modules/@react-native/gradle-plugin") }
plugins { id("com.facebook.react.settings") }
extensions.configure(com.facebook.react.ReactSettingsExtension) { ex -> ex.autolinkLibrariesFromCommand() }
rootProject.name = "DawaiApp"
include ":app"
```

### `android/build.gradle` ❌ يحتاج تعديل (AGP version فقط)
```gradle
buildscript {
    ext {
        buildToolsVersion = "35.0.0"
        minSdkVersion    = 24
        compileSdkVersion = 35
        targetSdkVersion = 35
        ndkVersion       = "27.1.12297006"
        kotlinVersion    = "1.9.24"
    }
    repositories { google(); mavenCentral() }
    dependencies {
        classpath("com.android.tools.build:gradle:8.8.1")  ← غيّر من 8.6.1
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:${kotlinVersion}")
    }
}

plugins {
    id("com.facebook.react.rootproject")
}
```

### `android/app/build.gradle` ✅ صحيح — لا تعدّل
```gradle
plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("com.facebook.react")
}

react { }

android {
    ndkVersion rootProject.ext.ndkVersion
    buildToolsVersion rootProject.ext.buildToolsVersion
    namespace "com.dawaiapp"
    compileSdk rootProject.ext.compileSdkVersion
    defaultConfig {
        applicationId "com.dawaiapp"
        minSdk         rootProject.ext.minSdkVersion
        targetSdk      rootProject.ext.targetSdkVersion
        versionCode    1
        versionName    "1.0.0"
    }
    ...
}

dependencies {
    implementation("com.facebook.react:react-android")
    implementation("com.facebook.react:hermes-android")
    implementation "org.jetbrains.kotlin:kotlin-stdlib:${rootProject.ext.kotlinVersion}"
    implementation "com.google.android.gms:play-services-maps:18.2.0"
    implementation "com.google.android.gms:play-services-location:21.2.0"
}

apply from: file("../../node_modules/react-native-vector-icons/fonts.gradle")
```

### `android/gradle/wrapper/gradle-wrapper.properties` ✅ صحيح — لا تعدّل
```
distributionUrl=https\://services.gradle.org/distributions/gradle-8.10.2-all.zip
```
> ملاحظة: Gradle 8.10.2 صحيح — المشكلة في AGP وليس Gradle

### `android/gradle.properties` ✅ صحيح — لا تعدّل
```
newArchEnabled=true
hermesEnabled=true
android.useAndroidX=true
android.enableJetifier=true
```

### `android/app/src/main/AndroidManifest.xml` ❌ يحتاج تعديل
احذف هذا الـ block كاملاً:
```xml
<!-- Firebase Messaging — احذف هذا -->
<service
    android:name="com.google.firebase.messaging.FirebaseMessagingService"
    android:exported="false">
    <intent-filter>
        <action android:name="com.google.firebase.MESSAGING_EVENT" />
    </intent-filter>
</service>
```

### `android/app/google-services.json` — غير موجود ✅ مقصود
لا تضفه حتى يكون لديك Firebase حقيقي

### `src/` ✅ مكتمل (19 شاشة + 7 services + 6 stores)

---

## 📋 قائمة التحقق قبل أي commit

```
[ ] applicationId = "com.dawaiapp" في app/build.gradle
[ ] namespace = "com.dawaiapp" في app/build.gradle
[ ] AGP = 8.8.1 (وليس 8.6.1) في android/build.gradle
[ ] لا يوجد classpath google-services في android/build.gradle
[ ] لا يوجد FirebaseMessagingService في AndroidManifest.xml
[ ] لا يوجد react-native.config.js في root
[ ] settings.gradle لا يحتوي includeBuild مكرر
[ ] build-error.log محدّث بآخر خطأ
```

---

## ⚠️ الأخطاء التي تكررت أكثر من 10 مرات — لا تكررها أبداً

| الخطأ | السبب | الحل الصحيح |
|---|---|---|
| `rootproject plugin not found` | `includeBuild` مكرر أو ترتيب خاطئ | `pluginManagement { includeBuild(...) }` مرة واحدة فقط |
| `editTextBackgroundMode` | خاصية داخل AAR | `attrs.xml` فارغة + `styles.xml` بـ AppTheme فقط |
| `processDebugGoogleServices FAILED` | Firebase BOM مع json وهمي | احذف Firebase كاملاً من dependencies |
| `applicationId` conflict | تغيير متكرر بين اسمين | `com.dawaiapp` دائماً وأبداً |
| autolinking فاشل | `react-native.config.js` موجود | احذفه — autolinking يعمل بدونه |
| `compileDebugJavaWithJavac` | AGP 8.6.1 غير متوافق مع Gradle 8.10.2 | AGP 8.8.1 |

---

## 🔧 كيف تعدّل ملفاً على GitHub مباشرة

```bash
TOKEN="TOKEN_HERE"

# 1. اقرأ SHA الملف أولاً
SHA=$(curl -s -H "Authorization: token $TOKEN" \
  "https://api.github.com/repos/ammar1994/dawai-mobile/contents/PATH" | \
  python3 -c "import sys,json; print(json.load(sys.stdin)['sha'])")

# 2. حضّر المحتوى الجديد بـ base64
CONTENT=$(cat NEW_FILE.txt | base64 -w 0)

# 3. ارفع التعديل
curl -s -X PUT -H "Authorization: token $TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.github.com/repos/ammar1994/dawai-mobile/contents/PATH" \
  -d "{\"message\":\"fix: description\",\"content\":\"$CONTENT\",\"sha\":\"$SHA\"}"
```

---

## 🚫 قواعد صارمة — لا تخالفها أبداً

1. **لا تغير Tech Stack** — المكتبات محددة في package.json
2. **لا تضيف مكتبة جديدة** — خاصةً في مرحلة البناء
3. **لا تستخدم `com.dawai.pharmacy`** — تم التخلي عنه نهائياً
4. **لا تضيف `react-native.config.js`** — يكسر autolinking
5. **لا تعدّل الكود TypeScript** إلا لإصلاح خطأ compile
6. **لا تكرر `includeBuild`** في settings.gradle
7. **افحص أولاً ثم عدّل** — دائماً اقرأ SHA قبل الكتابة
8. **لا تضف Firebase** حتى يكون هناك google-services.json حقيقي
9. **لا تخمّن** — إذا لم تجد الخطأ الحقيقي في build-error.log، أصلح الـ workflow أولاً

---

## 📌 الخطوات التالية — بالترتيب الصارم

### الخطوة 1: أصلح الـ workflow لالتقاط أخطاء javac
في `.github/workflows/build-apk.yml` قسم "Save error to repo"، أضف:
```bash
echo "=== JAVA COMPILER ERRORS ==="
grep -E "error: |\.java:[0-9]+: error|\.kt:[0-9]+: error" /tmp/build.log | head -30 || true
```

### الخطوة 2: أصلح AGP في `android/build.gradle`
```gradle
classpath("com.android.tools.build:gradle:8.8.1")
```

### الخطوة 3: احذف FirebaseMessagingService من AndroidManifest
احذف الـ `<service>` block الخاص بـ Firebase

### الخطوة 4: Commit وانتظر البناء
```bash
git commit -m "fix: AGP 8.8.1 + capture javac errors + remove Firebase manifest"
```

### الخطوة 5: اقرأ build-error.log الجديد
- إذا نجح ← APK جاهز 🎉
- إذا فشل ← ستجد الآن الخطأ الحقيقي في قسم "JAVA COMPILER ERRORS"

---

## 🔗 مشروع مرتبط

**Pharmacy SaaS Backend (multi-tenant):**
- Repo: `assa saas` (اسأل صاحب المشروع عن الـ URL الدقيق)
- Backend URL: `https://pharmacy-saas-backend.onrender.com`
- هذا التطبيق (دوائي) هو الـ mobile client لهذا الـ backend

---

*آخر تحديث: 2026-08-17 | بعد فحص #787 وتشخيص compileDebugJavaWithJavac*
*كتبه: Claude — بعد فحص كامل للـ repo + commits + workflow logs*
*إجمالي البنايات الفاشلة حتى الآن: 787*
