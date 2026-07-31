#!/bin/bash
# ============================================================
#  DAWAI — دوائي | Auto APK Builder for GitHub Codespace
#  React Native CLI 0.73.6 — بدون Expo
#  شغّل: bash build-apk.sh
# ============================================================

set -e
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

log()  { echo -e "${GREEN}✅ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
info() { echo -e "${CYAN}ℹ️  $1${NC}"; }
err()  { echo -e "${RED}❌ $1${NC}"; exit 1; }
step() { echo -e "\n${BOLD}${CYAN}━━━ $1 ━━━${NC}"; }

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_NAME="DawaiApp"
APP_PACKAGE="com.dawai.pharmacy"
ANDROID_DIR="$PROJECT_DIR/android"
JAVA_VERSION="17"
ANDROID_SDK_ROOT="$HOME/android-sdk"
CMDLINE_TOOLS_URL="https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip"

echo -e "${BOLD}"
echo "  ██████╗  █████╗ ██╗    ██╗ █████╗ ██╗"
echo "  ██╔══██╗██╔══██╗██║    ██║██╔══██╗██║"
echo "  ██║  ██║███████║██║ █╗ ██║███████║██║"
echo "  ██║  ██║██╔══██║██║███╗██║██╔══██║██║"
echo "  ██████╔╝██║  ██║╚███╔███╔╝██║  ██║██║"
echo "  ╚═════╝ ╚═╝  ╚═╝ ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝"
echo -e "  دوائي — APK Builder${NC}"
echo ""

# ────────────────────────────────────────────────────────────
step "1/7 — فحص البيئة"
# ────────────────────────────────────────────────────────────

# Node
node --version &>/dev/null || err "Node.js غير مثبّت"
NODE_V=$(node --version); log "Node.js $NODE_V"

# Java 17
if ! java -version 2>&1 | grep -q "17\|21"; then
  warn "جاري تثبيت Java 17..."
  sudo apt-get update -qq
  sudo apt-get install -y -qq openjdk-17-jdk
fi
export JAVA_HOME=$(dirname $(dirname $(readlink -f $(which java))))
log "Java: $JAVA_HOME"

# ────────────────────────────────────────────────────────────
step "2/7 — تثبيت Android SDK"
# ────────────────────────────────────────────────────────────

if [ ! -d "$ANDROID_SDK_ROOT/cmdline-tools/latest/bin" ]; then
  info "جاري تنزيل Android Command Line Tools..."
  mkdir -p "$ANDROID_SDK_ROOT/cmdline-tools"
  wget -q --show-progress "$CMDLINE_TOOLS_URL" -O /tmp/cmdline-tools.zip
  unzip -q /tmp/cmdline-tools.zip -d /tmp/cmdline-unzip
  mv /tmp/cmdline-unzip/cmdline-tools "$ANDROID_SDK_ROOT/cmdline-tools/latest"
  rm -rf /tmp/cmdline-tools.zip /tmp/cmdline-unzip
  log "Android CLI Tools مثبّتة"
else
  log "Android CLI Tools موجودة"
fi

export ANDROID_HOME="$ANDROID_SDK_ROOT"
export PATH="$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:$ANDROID_SDK_ROOT/platform-tools:$ANDROID_SDK_ROOT/build-tools/34.0.0:$PATH"

# قبول الرخص
yes | sdkmanager --sdk_root="$ANDROID_SDK_ROOT" --licenses &>/dev/null || true

# تثبيت المكونات المطلوبة
info "جاري تثبيت Android SDK components..."
sdkmanager --sdk_root="$ANDROID_SDK_ROOT" \
  "platform-tools" \
  "platforms;android-34" \
  "build-tools;34.0.0" \
  --verbose 2>&1 | grep -E "Download|Installing|done" || true

log "Android SDK جاهز"

# ────────────────────────────────────────────────────────────
step "3/7 — npm install"
# ────────────────────────────────────────────────────────────

cd "$PROJECT_DIR"
if [ ! -d "node_modules" ]; then
  info "جاري تثبيت packages..."
  npm install --legacy-peer-deps 2>&1 | tail -5
  log "node_modules جاهز"
else
  log "node_modules موجود — تخطّي"
fi

# ────────────────────────────────────────────────────────────
step "4/7 — إنشاء مجلد android"
# ────────────────────────────────────────────────────────────

if [ -d "$ANDROID_DIR" ]; then
  warn "مجلد android موجود مسبقاً — سيُستخدم كما هو"
else
  info "جاري توليد مجلد android من template..."

  # توليد مشروع مؤقت لاستخراج android/
  TEMP_DIR="/tmp/rn_temp_$$"
  npx --yes react-native@0.73.6 init TempDawai \
    --version 0.73.6 \
    --directory "$TEMP_DIR" \
    --skip-install \
    --title "Dawai" \
    2>&1 | tail -10

  cp -r "$TEMP_DIR/android" "$ANDROID_DIR"
  rm -rf "$TEMP_DIR"
  log "مجلد android تم إنشاؤه"
fi

# ────────────────────────────────────────────────────────────
step "5/7 — تهيئة android/app"
# ────────────────────────────────────────────────────────────

# تعديل applicationId في build.gradle
GRADLE_FILE="$ANDROID_DIR/app/build.gradle"
if grep -q "com.tempdawai\|com.dawai" "$GRADLE_FILE" 2>/dev/null; then
  sed -i "s/applicationId \".*\"/applicationId \"$APP_PACKAGE\"/" "$GRADLE_FILE"
fi

# تعديل اسم التطبيق
STRINGS_FILE="$ANDROID_DIR/app/src/main/res/values/strings.xml"
if [ -f "$STRINGS_FILE" ]; then
  sed -i "s|<string name=\"app_name\">.*</string>|<string name=\"app_name\">دوائي DAWAI</string>|" "$STRINGS_FILE"
fi

# تعديل MainActivity package
MAIN_ACTIVITY=$(find "$ANDROID_DIR" -name "MainActivity.kt" -o -name "MainActivity.java" 2>/dev/null | head -1)
if [ -n "$MAIN_ACTIVITY" ]; then
  sed -i "s/^package .*/package $APP_PACKAGE/" "$MAIN_ACTIVITY"
fi

MAIN_APPLICATION=$(find "$ANDROID_DIR" -name "MainApplication.kt" -o -name "MainApplication.java" 2>/dev/null | head -1)
if [ -n "$MAIN_APPLICATION" ]; then
  sed -i "s/^package .*/package $APP_PACKAGE/" "$MAIN_APPLICATION"
fi

# تحديث AndroidManifest.xml
MANIFEST="$ANDROID_DIR/app/src/main/AndroidManifest.xml"
if [ -f "$MANIFEST" ]; then
  sed -i "s/package=\"[^\"]*\"/package=\"$APP_PACKAGE\"/" "$MANIFEST"
  # إضافة permissions مطلوبة
  if ! grep -q "ACCESS_FINE_LOCATION" "$MANIFEST"; then
    sed -i '/<uses-permission android:name="android.permission.INTERNET"/a \    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />\n    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />\n    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />\n    <uses-permission android:name="android.permission.VIBRATE" />\n    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />' "$MANIFEST"
  fi
fi

# ضبط gradle.properties
cat > "$ANDROID_DIR/gradle.properties" << 'EOF'
android.useAndroidX=true
android.enableJetifier=true
FLIPPER_VERSION=0.182.0
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=512m
org.gradle.daemon=true
org.gradle.parallel=true
org.gradle.caching=true
reactNativeArchitectures=arm64-v8a
newArchEnabled=false
hermesEnabled=true
EOF

# ضبط local.properties
echo "sdk.dir=$ANDROID_SDK_ROOT" > "$ANDROID_DIR/local.properties"

log "إعدادات android جاهزة ✓"
log "  applicationId: $APP_PACKAGE"
log "  targetSdk: 34"

# ────────────────────────────────────────────────────────────
step "6/7 — توليد Keystore وتوقيع release"
# ────────────────────────────────────────────────────────────

KEYSTORE_FILE="$ANDROID_DIR/app/dawai-release.keystore"

if [ ! -f "$KEYSTORE_FILE" ]; then
  info "توليد Release Keystore..."
  keytool -genkeypair \
    -v \
    -keystore "$KEYSTORE_FILE" \
    -alias dawai-key \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -storepass "dawai2024secure" \
    -keypass "dawai2024secure" \
    -dname "CN=Dawai Pharmacy, OU=Mobile, O=Dawai, L=Damascus, S=Damascus, C=SY" \
    2>&1 | tail -3
  log "Keystore تم توليده"
else
  log "Keystore موجود مسبقاً"
fi

# إضافة signing config إلى build.gradle إذا غير موجود
if ! grep -q "dawai-release.keystore" "$GRADLE_FILE" 2>/dev/null; then
cat >> "$GRADLE_FILE" << 'EOF'

// DAWAI Release Signing
android {
  signingConfigs {
    release {
      storeFile file('dawai-release.keystore')
      storePassword 'dawai2024secure'
      keyAlias 'dawai-key'
      keyPassword 'dawai2024secure'
    }
  }
  buildTypes {
    release {
      signingConfig signingConfigs.release
      minifyEnabled false
      proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
  }
}
EOF
fi

# ────────────────────────────────────────────────────────────
step "7/7 — بناء APK"
# ────────────────────────────────────────────────────────────

export JAVA_HOME=$(dirname $(dirname $(readlink -f $(which java))))
export ANDROID_HOME="$ANDROID_SDK_ROOT"
export PATH="$JAVA_HOME/bin:$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:$ANDROID_SDK_ROOT/platform-tools:$PATH"

info "جاري بناء APK... (قد يستغرق 5-10 دقائق)"
cd "$ANDROID_DIR"
chmod +x gradlew

# محاولة build
./gradlew assembleRelease \
  --no-daemon \
  --stacktrace \
  2>&1 | tee /tmp/dawai_build.log | grep -E "BUILD|error:|Error|warning:|FAILURE|SUCCESSFUL|Task :" || true

BUILD_EXIT=${PIPESTATUS[0]}

# ────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ $BUILD_EXIT -eq 0 ]; then
  APK_PATH=$(find "$ANDROID_DIR/app/build/outputs/apk" -name "*.apk" | head -1)
  APK_SIZE=$(du -h "$APK_PATH" 2>/dev/null | cut -f1)
  echo -e "${GREEN}${BOLD}"
  echo "  🎉 تم بناء APK بنجاح!"
  echo ""
  echo "  📦 الملف: $APK_PATH"
  echo "  📏 الحجم: $APK_SIZE"
  echo -e "${NC}"
  echo -e "  لتحميل الملف من Codespace:"
  echo -e "  ${CYAN}انقر يمين على الملف في Explorer → Download${NC}"
else
  echo -e "${RED}${BOLD}  ❌ فشل البناء${NC}"
  echo ""
  echo -e "  ${YELLOW}آخر 30 سطر من الـ log:${NC}"
  tail -30 /tmp/dawai_build.log
  echo ""
  echo -e "  ${CYAN}الـ log الكامل: /tmp/dawai_build.log${NC}"
fi
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
