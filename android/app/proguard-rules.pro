# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# ==========================================
# React Native ProGuard Rules
# ==========================================

# Keep React Native classes
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

# Hermes engine
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }

# React Native Vector Icons
-keep class com.oblador.vectoricons.** { *; }

# React Native Gesture Handler
-keep class com.swmansion.gesturehandler.** { *; }
-keep class com.swmansion.gesturehandler.react.** { *; }

# React Native Screens
-keep class com.swmansion.rnscreens.** { *; }

# React Native Safe Area Context
-keep class com.th3rdwave.safeareacontext.** { *; }

# React Native Config
-keep class com.lugg.RNCConfig.** { *; }

# React Native Async Storage
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# React Native Linear Gradient
-keep class com.BV.LinearGradient.** { *; }

# React Native Device Info
-keep class com.learnium.RNDeviceInfo.** { *; }

# React Native Share
-keep class cl.json.** { *; }

# React Native View Shot
-keep class fr.greweb.reactnativeviewshot.** { *; }

# React Native FS
-keep class com.rnfs.** { *; }

# React Native Haptic Feedback
-keep class com.mkuczera.RNReactNativeHapticFeedbackPackage { *; }

# React Native Reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep interface com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.core.** { *; }
-dontwarn com.swmansion.reanimated.**

# Google Sign In
-keep class com.google.android.gms.** { *; }
-keep class com.reactnativegooglesignin.** { *; }

# ==========================================
# CRITICAL: Keep BuildConfig for react-native-config
# R8/ProGuard obfuscates class names, but react-native-config
# uses Java reflection to read BuildConfig fields (SUPABASE_URL etc.)
# Without this rule, Config.* returns undefined in release builds!
# ==========================================
-keep class com.pakuni.BuildConfig { *; }
-keepclassmembers class com.pakuni.BuildConfig { *; }

# react-native-config native module
-keep class com.lugg.RNCConfig.** { *; }
-keep class com.lugg.ReactNativeConfig.** { *; }

# OkHttp - Keep classes (not just suppress warnings)
-keep class okhttp3.** { *; }
-keep class okio.** { *; }

# react-native-url-polyfill
-keep class com.nickreactor.** { *; }

# Supabase / libSQL
-keep class io.github.nickreactor.** { *; }
-keep class tech.turso.** { *; }

# Firebase App Indexing
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.measurement.** { *; }

# ==========================================
# Google Play Core (In-App Review & Updates)
# ==========================================
-keep class com.google.android.play.core.** { *; }
-keep class com.google.android.play.core.review.** { *; }
-keep class com.google.android.play.core.appupdate.** { *; }
-keep class com.google.android.play.core.tasks.** { *; }
-dontwarn com.google.android.play.core.**

# ==========================================
# General Android ProGuard Rules
# ==========================================

# Keep native methods
-keepclassmembers class * {
    native <methods>;
}

# Keep Parcelable classes
-keepclassmembers class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator *;
}

# Keep Serializable classes
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# Keep R classes
-keepclassmembers class **.R$* {
    public static <fields>;
}

# Keep annotations
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes SourceFile,LineNumberTable
-keepattributes Exceptions

# ==========================================
# OkHttp / Networking
# ==========================================
-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn javax.annotation.**
-dontwarn org.conscrypt.**
-keepnames class okhttp3.internal.publicsuffix.PublicSuffixDatabase

# ==========================================
# Suppress Warnings
# ==========================================
-dontwarn com.facebook.react.**
-dontwarn com.facebook.hermes.**
-dontwarn org.slf4j.**
-dontwarn com.yalantis.ucrop**
-dontwarn com.squareup.okhttp.**
