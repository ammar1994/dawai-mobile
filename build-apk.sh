#!/bin/bash
# =====================================================================
# build-apk.sh — بناء APK لتطبيق دوائي DAWAI
# يعمل في GitHub Codespace أو أي بيئة Linux مع Java 17
# =====================================================================
set -e

CYAN='\033[0;36m'; GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; NC='\033[0m'
info()  { echo -e "${CYAN}[INFO]${NC}  $*"; }
ok()    { echo -e "${GREEN}[✓]${NC}    $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
ANDROID_DIR="$PROJECT_DIR/android"

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   🏗  DAWAI Pharmacy APK Builder         ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════╝${NC}"
echo ""

# ── 1. Java Check ─────────────────────────────────────────────────────
info "فحص Java..."
if ! command -v java &>/dev/null; then
  warn "Java غير موجود — جاري التثبيت..."
  sudo apt-get update -qq && sudo apt-get install -y -qq openjdk-17-jdk
fi

JAVA_VER=$(java -version 2>&1 | head -1 | grep -oP '\d+' | head -1)
if [ "$JAVA_VER" -lt 17 ]; then
  warn "Java $JAVA_VER — يُنصح بـ Java 17. جاري التثبيت..."
  sudo apt-get install -y -qq openjdk-17-jdk
  export JAVA_HOME=$(dirname $(dirname $(readlink -f $(which java))))
fi
ok "Java $(java -version 2>&1 | head -1)"

# ── 2. Android SDK ────────────────────────────────────────────────────
info "فحص Android SDK..."
if [ -z "$ANDROID_HOME" ]; then
  if [ -d "$HOME/Android/Sdk" ]; then
    export ANDROID_HOME="$HOME/Android/Sdk"
  elif [ -d "/opt/android-sdk" ]; then
    export ANDROID_HOME="/opt/android-sdk"
  else
    warn "ANDROID_HOME غير محدد — سيستخدم Gradle الـ local Maven cache"
  fi
fi
[ -n "$ANDROID_HOME" ] && ok "ANDROID_HOME=$ANDROID_HOME" || warn "سيستخدم Gradle الـ cache المحلي"

# ── 3. Node / npm ─────────────────────────────────────────────────────
info "تثبيت حزم Node..."
cd "$PROJECT_DIR"
if command -v yarn &>/dev/null; then
  yarn install --frozen-lockfile 2>/dev/null || yarn install
else
  npm ci 2>/dev/null || npm install
fi
ok "Node packages جاهزة"

# ── 4. Gradle Wrapper Jar ────────────────────────────────────────────
info "التحقق من gradle-wrapper.jar..."
WRAPPER_JAR="$ANDROID_DIR/gradle/wrapper/gradle-wrapper.jar"
if [ ! -f "$WRAPPER_JAR" ]; then
  info "تنزيل gradle-wrapper.jar..."
  curl -fsSL "https://raw.githubusercontent.com/gradle/gradle/v8.6.0/gradle/wrapper/gradle-wrapper.jar" \
    -o "$WRAPPER_JAR" 2>/dev/null || \
  wget -q "https://raw.githubusercontent.com/gradle/gradle/v8.6.0/gradle/wrapper/gradle-wrapper.jar" \
    -O "$WRAPPER_JAR"
fi
ok "gradle-wrapper.jar موجود"

# ── 5. Debug Keystore ─────────────────────────────────────────────────
KEYSTORE="$ANDROID_DIR/app/debug.keystore"
if [ ! -f "$KEYSTORE" ]; then
  info "إنشاء debug.keystore..."
  keytool -genkeypair -v \
    -keystore "$KEYSTORE" \
    -alias androiddebugkey \
    -keyalg RSA -keysize 2048 -validity 10000 \
    -storepass android -keypass android \
    -dname "CN=Android Debug,O=Android,C=US" 2>/dev/null
  ok "debug.keystore أُنشئ"
else
  ok "debug.keystore موجود"
fi

# ── 6. Build ──────────────────────────────────────────────────────────
info "بناء APK (debug)..."
cd "$ANDROID_DIR"
chmod +x gradlew

# Increase Gradle memory
export GRADLE_OPTS="-Xmx4g -XX:MaxMetaspaceSize=512m -Dorg.gradle.daemon=false"

./gradlew assembleDebug \
  --no-daemon \
  --stacktrace \
  2>&1 | tee "$PROJECT_DIR/build.log" | grep -E "(BUILD|ERROR|FAILURE|APK|Task :)" || true

# ── 7. Result ─────────────────────────────────────────────────────────
APK=$(find "$ANDROID_DIR/app/build/outputs/apk/debug" -name "*.apk" 2>/dev/null | head -1)

if [ -n "$APK" ] && [ -f "$APK" ]; then
  SIZE=$(du -sh "$APK" | cut -f1)
  DEST="$PROJECT_DIR/DawaiApp-debug.apk"
  cp "$APK" "$DEST"
  echo ""
  echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║   ✅  APK جاهز للتثبيت!                 ║${NC}"
  echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
  echo -e "  📦 الحجم: ${GREEN}${SIZE}${NC}"
  echo -e "  📂 المسار: ${GREEN}${DEST}${NC}"
  echo ""
else
  error "البناء فشل — راجع build.log للتفاصيل"
fi
