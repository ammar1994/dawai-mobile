# 🤖 DAWAI MOBILE — دليل Claude الموحّد
> **اقرأ هذا الملف أولاً قبل أي تعديل. هذا هو المرجع الوحيد الصحيح.**

---

## 📋 معلومات المشروع

| المعلومة | القيمة |
|---------|--------|
| اسم التطبيق | DAWAI (دواي) — تطبيق صيدلية |
| React Native | **0.73.6** |
| React | **18.2.0** |
| Java | **17** |
| Node | **20** |
| compileSdk | **35** |
| targetSdk | **35** |
| minSdk | **24** |
| buildTools | **35.0.0** |
| NDK | **26.1.10909125** |
| Gradle Plugin | **8.6.1** |
| Kotlin | **1.9.25** |

---

## ⚠️ قواعد لا تُكسر أبداً

### 1. نظام الـ Autolinking (الأهم)
```
React Native 0.73.6 يستخدم النظام الجديد:
✅ settings.gradle  → autolinkLibrariesFromCommand()
✅ app/build.gradle → لا تضف applyNativeModulesAppBuildGradle
❌ لا تستخدم cli-platform-android في settings.gradle
❌ لا تستخدم applyNativeModulesSettingsGradle (قديم)
```

### 2. ملف settings.gradle الصحيح
```groovy
pluginManagement {
    includeBuild("../node_modules/@react-native/gradle-plugin")
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
plugins {
    id("com.facebook.react.settings")
}
extensions.configure(com.facebook.react.ReactSettingsExtension) { ex ->
    ex.autolinkLibrariesFromCommand()
}
rootProject.name = 'DawaiApp'
include ':app'
includeBuild('../node_modules/@react-native/gradle-plugin')
```

### 3. ملف android/build.gradle الصحيح
```groovy
buildscript {
    ext {
        buildToolsVersion = "35.0.0"
        minSdkVersion     = 24
        compileSdkVersion = 35
        targetSdkVersion  = 35
        ndkVersion        = "26.1.10909125"
        kotlinVersion     = "1.9.25"
    }
    repositories { google(); mavenCentral() }
    dependencies {
        classpath("com.android.tools.build:gradle:8.6.1")
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:1.9.25")
    }
}
plugins {
    id("com.facebook.react.rootproject")
}
allprojects {
    repositories {
        google()
        mavenCentral()
        maven { url 'https://www.jitpack.io' }
    }
}
```

### 4. ملف android/gradle.properties الصحيح
```properties
android.useAndroidX=true
android.enableJetifier=true
org.gradle.jvmargs=-Xmx4g -XX:MaxMetaspaceSize=512m
org.gradle.daemon=false
org.gradle.parallel=false
org.gradle.caching=false
reactNativeArchitectures=arm64-v8a
newArchEnabled=false
hermesEnabled=true
```

### 5. لا تلمس هذه الملفات إلا بضرورة
- `android/app/src/main/AndroidManifest.xml`
- `android/app/src/main/java/com/dawai/pharmacy/MainActivity.kt`
- `android/app/src/main/java/com/dawai/pharmacy/MainApplication.kt`

---

## 🔧 GitHub Actions Workflow الصحيح

```yaml
name: Build DAWAI APK

on:
  workflow_dispatch:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    timeout-minutes: 60

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-java@v5
        with:
          java-version: '17'
          distribution: temurin

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install deps
        run: npm install --legacy-peer-deps

      - uses: android-actions/setup-android@v3
        with:
          accept-android-sdk-licenses: true

      - name: Install SDK
        run: |
          sdkmanager "platforms;android-35" "build-tools;35.0.0" "ndk;26.1.10909125" "cmake;3.22.1"

      - name: Copy fonts
        run: |
          mkdir -p android/app/src/main/assets/fonts
          cp node_modules/react-native-vector-icons/Fonts/*.ttf android/app/src/main/assets/fonts/ 2>/dev/null || true

      - name: Create keystore
        run: |
          keytool -genkeypair -v -keystore android/app/debug.keystore -alias androiddebugkey -keyalg RSA -keysize 2048 -validity 10000 -storepass android -keypass android -dname "CN=Android Debug,O=Android,C=US"

      - name: local.properties
        run: echo "sdk.dir=$ANDROID_HOME" > android/local.properties

      - name: Build APK
        working-directory: android
        run: |
          chmod +x gradlew
          ./gradlew assembleDebug --no-daemon 2>&1 | tee /tmp/build.log
          EXIT=${PIPESTATUS[0]}
          [ $EXIT -ne 0 ] && tail -200 /tmp/build.log && exit $EXIT
        env:
          JAVA_TOOL_OPTIONS: "-Xmx4g -XX:MaxMetaspaceSize=512m"

      - name: Upload APK
        if: success()
        uses: actions/upload-artifact@v4
        with:
          name: DawaiApp-debug
          path: android/app/build/outputs/apk/debug/*.apk
          retention-days: 30

      - name: Upload log
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: build-log
          path: /tmp/build.log
```

---

## 📦 المكتبات — الإصدارات الثابتة

### dependencies (package.json)
```json
{
  "@notifee/react-native": "^7.8.2",
  "@react-native-async-storage/async-storage": "^1.23.1",
  "@react-native-community/geolocation": "^3.2.1",
  "@react-native-community/netinfo": "^11.3.1",
  "@react-native/gradle-plugin": "^0.73.4",
  "@react-navigation/bottom-tabs": "^6.5.20",
  "@react-navigation/native": "^6.1.17",
  "@react-navigation/native-stack": "^6.9.26",
  "axios": "^1.7.2",
  "date-fns": "^3.6.0",
  "react": "18.2.0",
  "react-native": "0.73.6",
  "react-native-fast-image": "^8.6.3",
  "react-native-gesture-handler": "^2.14.1",
  "react-native-linear-gradient": "^2.8.3",
  "react-native-permissions": "^4.1.5",
  "react-native-safe-area-context": "^4.10.1",
  "react-native-screens": "^3.29.0",
  "react-native-splash-screen": "^3.3.0",
  "react-native-toast-message": "^2.2.0",
  "react-native-vector-icons": "^10.1.0",
  "zustand": "^4.5.4"
}
```

---

## 🚨 أخطاء شائعة وحلولها

### خطأ: `cannot find symbol class XxxPackage`
**السبب:** تعارض في autolinking — settings.gradle يستخدم الطريقة القديمة  
**الحل:** استبدل settings.gradle بالنسخة الصحيحة أعلاه

### خطأ: `package com.xxx does not exist`
**السبب:** نفس السبب أعلاه — native modules غير مضافة كـ subprojects  
**الحل:** نفس الحل + تأكد أن app/build.gradle لا يحتوي على `applyNativeModulesAppBuildGradle`

### خطأ: `SDK location not found`
**الحل:** أضف خطوة `echo "sdk.dir=$ANDROID_HOME" > android/local.properties`

### خطأ: `ndk.dir is deprecated`
**الحل:** احذف أي سطر `ndk.dir` من local.properties — ndkVersion في build.gradle يكفي

### خطأ: YAML syntax في workflow
**الحل:** لا تضع كود Python أو Bash متعدد الأسطر داخل قيم YAML مباشرة — استخدم `|` بشكل صحيح

### خطأ: `buildToolsVersion` لا يطابق SDK المثبّت
**الحل:** تأكد أن `build.gradle` و `sdkmanager` يستخدمان نفس الإصدار (35.0.0)

---

## 📁 هيكل الملفات المهمة

```
dawai-mobile/
├── android/
│   ├── build.gradle          ← compileSdk/targetSdk/ndkVersion
│   ├── settings.gradle       ← autolinkLibrariesFromCommand ✅
│   ├── gradle.properties     ← JVM args, newArch=false
│   ├── local.properties      ← sdk.dir فقط (لا ndk.dir)
│   └── app/
│       └── build.gradle      ← namespace, signingConfig, NO applyNativeModules
├── .github/workflows/
│   └── build-apk.yml         ← الـ workflow الموحّد
├── package.json              ← المكتبات — لا تغيّر الإصدارات بدون سبب
└── CLAUDE_GUIDE.md           ← هذا الملف — اقرأه أولاً دائماً
```

---

## ✅ قائمة تحقق قبل أي تعديل

- [ ] قرأت هذا الملف كاملاً
- [ ] settings.gradle يستخدم `autolinkLibrariesFromCommand()`
- [ ] لا يوجد `applyNativeModulesAppBuildGradle` في app/build.gradle
- [ ] لا يوجد `ndk.dir` في local.properties
- [ ] الـ workflow يثبّت `platforms;android-35` و `build-tools;35.0.0`
- [ ] Java version هو 17
- [ ] Node version هو 20

---

*آخر تحديث: تم بواسطة Claude — يرجى تحديث هذا الملف عند أي تغيير جوهري*
