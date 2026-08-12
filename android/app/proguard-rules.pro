# React Native
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

# Firebase
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.firebase.**

# react-native-maps
-keep class com.airbnb.android.react.maps.** { *; }

# Notifee
-keep class app.notifee.** { *; }

# react-native-mmkv
-keep class com.tencent.mmkv.** { *; }

# Kotlin
-keep class kotlin.** { *; }
-dontwarn kotlin.**

# react-native-vector-icons
-keep class com.oblador.vectoricons.** { *; }

# Keep native modules
-keepclassmembers class * {
    @com.facebook.react.uimanager.annotations.ReactProp <methods>;
}
