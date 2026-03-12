# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:
# 高德地图
-keep class com.amap.api.** { *; }
-keep class com.autonavi.** { *; }

# swiper
-keep class com.swmansion.reanimated.** { *; }
-keep class com.swmansion.gesturehandler.** { *; }

# 腾讯云 COS
-keep class com.tencent.cos.** { *; }
-keep class com.tencent.qcloud.** { *; }

# gson
-keep class com.google.gson.** { *; }
-keepattributes Signature
-keepattributes *Annotation*

# okhttp
-keep class okhttp3.** { *; }
-dontwarn okhttp3.**

# okio
-keep class okio.** { *; }
-dontwarn okio.**

# BLE PLX
-keep class com.polidea.rxandroidble.** { *; }

# RxJava
-keep class io.reactivex.** { *; }
-dontwarn io.reactivex.**

# Android BLE
-keep class android.bluetooth.** { *; }

# GATT callback
-keep class * extends android.bluetooth.BluetoothGattCallback { *; }