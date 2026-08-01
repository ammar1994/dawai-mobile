#!/bin/bash
# Run this ONCE in Codespace before building
echo "🔧 Setting up build environment..."

# 1. Copy valid gradle-wrapper.jar from node_modules
cp node_modules/react-native/template/android/gradle/wrapper/gradle-wrapper.jar \
   android/gradle/wrapper/gradle-wrapper.jar
echo "✅ gradle-wrapper.jar fixed"

# 2. Set Java 21
source /usr/local/sdkman/bin/sdkman-init.sh 2>/dev/null
sdk use java 21.0.5-tem 2>/dev/null
export JAVA_HOME="$SDKMAN_DIR/candidates/java/current"
export PATH="$JAVA_HOME/bin:$PATH"
java -version

# 3. Build
cd android
chmod +x gradlew
./gradlew assembleDebug --no-daemon 2>&1 | tee ../build.log | grep -E "BUILD|ERROR|Task :|Caused by"

# 4. Show APK
APK=$(find app/build/outputs/apk/debug -name "*.apk" 2>/dev/null | head -1)
[ -n "$APK" ] && echo "🎉 APK: $APK" && cp "$APK" ../DawaiApp.apk
