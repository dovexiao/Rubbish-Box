package com.xhtx.app;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.ReadableMap;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

public class NativeCameraModule extends ReactContextBaseJavaModule implements ActivityEventListener {
    private static final String TAG = "NativeCameraModule";
    private static final int CAMERA_REQUEST_CODE = 1001;
    private Promise mPickerPromise;
    
    // 使用静态变量存储 Promise，避免 Activity 重启导致的丢失
    private static Promise sStaticPromise;

    public NativeCameraModule(ReactApplicationContext reactContext) {
        super(reactContext);
        reactContext.addActivityEventListener(this);
        Log.d(TAG, "✅ NativeCameraModule 构造函数被调用");
    }
    
    /**
     * 提供静态方法供 NativeCameraActivity 回调结果
     * 注意：必须在主线程调用
     */
    public static void resolveWithPhotos(ArrayList<String> photoPaths) {
        Log.d(TAG, "✅ [resolveWithPhotos] ========== 静态回调开始 ==========");
        Log.d(TAG, "✅ [resolveWithPhotos] 时间戳: " + System.currentTimeMillis());
        Log.d(TAG, "✅ [resolveWithPhotos] 照片数量: " + (photoPaths != null ? photoPaths.size() : 0));
        Log.d(TAG, "✅ [resolveWithPhotos] 当前线程: " + Thread.currentThread().getName());
        Log.d(TAG, "✅ [resolveWithPhotos] sStaticPromise: " + (sStaticPromise != null ? "存在" : "null"));
        
        if (sStaticPromise == null) {
            Log.e(TAG, "❌ [resolveWithPhotos] sStaticPromise 为 null，无法返回结果");
            Log.e(TAG, "❌ [resolveWithPhotos] Promise 可能已经被 resolve/reject");
            return;
        }
        
        try {
            Log.d(TAG, "🔄 [resolveWithPhotos] 构建照片数组...");
            WritableArray photos = Arguments.createArray();
            for (int i = 0; i < photoPaths.size(); i++) {
                String path = photoPaths.get(i);
                WritableMap photo = Arguments.createMap();
                photo.putString("path", path);
                photo.putString("uri", Uri.fromFile(new java.io.File(path)).toString());
                photos.pushMap(photo);
                Log.d(TAG, String.format("📷 [resolveWithPhotos] 照片[%d]: %s", i, path));
            }
            
            Log.d(TAG, "✅ [resolveWithPhotos] 照片数组构建完成，大小: " + photos.size());
            Log.d(TAG, "✅ [resolveWithPhotos] 调用 sStaticPromise.resolve()...");
            
            sStaticPromise.resolve(photos);
            
            Log.d(TAG, "✅ [resolveWithPhotos] Promise.resolve() 调用成功");
            sStaticPromise = null;
            Log.d(TAG, "✅ [resolveWithPhotos] sStaticPromise 已清空");
            Log.d(TAG, "✅ [resolveWithPhotos] ========== 静态回调成功 ==========");
        } catch (Exception e) {
            Log.e(TAG, "❌ [resolveWithPhotos] resolve 失败: " + e.getMessage(), e);
            e.printStackTrace();
            
            if (sStaticPromise != null) {
                sStaticPromise.reject("E_RESOLVE_FAILED", "静态回调失败: " + e.getMessage());
                sStaticPromise = null;
                Log.d(TAG, "❌ [resolveWithPhotos] Promise 已 reject");
            }
            Log.d(TAG, "❌ [resolveWithPhotos] ========== 静态回调失败 ==========");
        }
    }
    
    public static void rejectWithError(String code, String message) {
        Log.d(TAG, "❌ [Static] rejectWithError: " + code + " - " + message + ", 线程: " + Thread.currentThread().getName());
        if (sStaticPromise != null) {
            try {
                sStaticPromise.reject(code, message);
                Log.d(TAG, "✅ [Static] Promise 已 rejected");
            } catch (Exception e) {
                Log.e(TAG, "❌ [Static] reject 失败", e);
            }
            sStaticPromise = null;
        } else {
            Log.e(TAG, "❌ [Static] sStaticPromise 为 null，无法 reject");
        }
    }

    @NonNull
    @Override
    public String getName() {
        return "NativeCameraModule";
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        constants.put("CAMERA_REQUEST_CODE", CAMERA_REQUEST_CODE);
        Log.d(TAG, "📋 getConstants() 被调用");
        return constants;
    }

    @ReactMethod
    public void openCamera(ReadableMap options, Promise promise) {
        Log.d(TAG, "🚀 [Native] openCamera() 被调用");
        Log.d(TAG, "📦 [Native] 参数: " + (options != null ? options.toString() : "null"));
        
        Activity currentActivity = getCurrentActivity();
        if (currentActivity == null) {
            Log.e(TAG, "❌ [Native] getCurrentActivity() 返回 null");
            promise.reject("E_ACTIVITY_DOES_NOT_EXIST", "Activity不存在");
            return;
        }

        Log.d(TAG, "✅ [Native] 当前 Activity: " + currentActivity.getClass().getSimpleName());
        
        // 同时使用实例变量和静态变量存储 Promise
        mPickerPromise = promise;
        sStaticPromise = promise;

        try {
            Intent intent = new Intent(currentActivity, NativeCameraActivity.class);
            if (options != null && options.hasKey("type")) {
                String type = options.getString("type");
                intent.putExtra("type", type);
                Log.d(TAG, "📸 [Native] 设置拍照类型: " + type);
            }
            
            // 🔥 关键修复：移除 FLAG_ACTIVITY_NEW_TASK
            // 使用 currentActivity.startActivityForResult 不需要也不应该加这个 flag
            // 加了这个 flag 会导致 Activity 在新栈启动，返回时可能导致 MainActivity 重启/重置
            // intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            
            Log.d(TAG, "🎬 [Native] 准备启动 NativeCameraActivity (使用静态回调模式)...");
            currentActivity.startActivityForResult(intent, CAMERA_REQUEST_CODE);
            Log.d(TAG, "✅ [Native] startActivityForResult 调用成功");
        } catch (Exception e) {
            Log.e(TAG, "❌ [Native] 启动相机失败: " + e.getMessage(), e);
            mPickerPromise.reject("E_FAILED_TO_SHOW_CAMERA", e);
            mPickerPromise = null;
            sStaticPromise = null;
        }
    }

    // 添加这两个方法以兼容 React Native 的事件发射器要求
    @ReactMethod
    public void addListener(String eventName) {
        // 保持方法存在，即使不使用事件
        Log.d(TAG, "📻 addListener: " + eventName);
    }

    @ReactMethod
    public void removeListeners(Integer count) {
        // 保持方法存在，即使不使用事件
        Log.d(TAG, "📻 removeListeners: " + count);
    }

    @Override
    public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
        Log.d(TAG, "📥 [onActivityResult] ========== 接收到结果 ==========");
        Log.d(TAG, "📥 [onActivityResult] 时间戳: " + System.currentTimeMillis());
        Log.d(TAG, "📥 [onActivityResult] requestCode: " + requestCode);
        Log.d(TAG, "📥 [onActivityResult] resultCode: " + resultCode + " (RESULT_OK=" + Activity.RESULT_OK + ", RESULT_CANCELED=" + Activity.RESULT_CANCELED + ")");
        Log.d(TAG, "📥 [onActivityResult] data: " + (data != null ? data.toString() : "null"));
        Log.d(TAG, "📥 [onActivityResult] Activity: " + (activity != null ? activity.getClass().getSimpleName() : "null"));
        Log.d(TAG, "📥 [onActivityResult] mPickerPromise: " + (mPickerPromise != null ? "存在" : "null"));
        Log.d(TAG, "📥 [onActivityResult] sStaticPromise: " + (sStaticPromise != null ? "存在" : "null"));
        
        if (requestCode == CAMERA_REQUEST_CODE) {
            // 🔥 关键修复：忽略 Expo/RN 在 Activity 启动时错误触发的 RESULT_CANCELED
            // 如果 data 为 null 且 resultCode 为 0，很可能是错误触发的回调，忽略它
            if (resultCode == Activity.RESULT_CANCELED && data == null) {
                Log.w(TAG, "⚠️ [Native] 检测到可能是 Expo/RN 错误触发的 onActivityResult，忽略此回调");
                Log.w(TAG, "⚠️ [Native] 将依赖静态回调方式处理结果");
                // 不要 reject Promise，等待静态回调
                return;
            }
            
            if (mPickerPromise != null) {
                if (resultCode == Activity.RESULT_CANCELED) {
                    Log.d(TAG, "🚫 [Native] 用户取消拍照");
                    mPickerPromise.reject("E_PICKER_CANCELLED", "用户取消");
                } else if (resultCode == Activity.RESULT_OK) {
                    Log.d(TAG, "✅ [Native] 拍照成功");
                    if (data != null) {
                        ArrayList<String> photoPaths = data.getStringArrayListExtra("photoPaths");
                        Log.d(TAG, "📸 [Native] 接收到 " + (photoPaths != null ? photoPaths.size() : 0) + " 张照片");
                        
                        if (photoPaths != null && photoPaths.size() > 0) {
                            WritableArray photos = Arguments.createArray();
                            for (String path : photoPaths) {
                                WritableMap photo = Arguments.createMap();
                                photo.putString("path", path);
                                photo.putString("uri", Uri.fromFile(new java.io.File(path)).toString());
                                photos.pushMap(photo);
                                Log.d(TAG, "📷 [Native] 照片路径: " + path);
                            }
                            Log.d(TAG, "✅ [Native] 准备 resolve Promise");
                            mPickerPromise.resolve(photos);
                        } else {
                            Log.e(TAG, "❌ [Native] 照片列表为空");
                            mPickerPromise.reject("E_NO_PHOTOS", "没有拍摄照片");
                        }
                    } else {
                        Log.e(TAG, "❌ [Native] Intent data 为 null");
                        mPickerPromise.reject("E_NO_DATA", "没有返回数据");
                    }
                }
                mPickerPromise = null;
            } else {
                Log.w(TAG, "⚠️ [Native] mPickerPromise 为 null，无法返回结果");
            }
        }
    }

    @Override
    public void onNewIntent(Intent intent) {
    }
}