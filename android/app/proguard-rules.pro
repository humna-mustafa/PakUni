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

# Google Sign In
-keep class com.google.android.gms.** { *; }
-keep class com.reactnativegooglesignin.** { *; }

# Supabase / libSQL
-keep class io.github.nickreactor.** { *; }
-keep class tech.turso.** { *; }

# Firebase
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.measurement.** { *; }

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
