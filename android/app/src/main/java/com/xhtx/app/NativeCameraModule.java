package com.xhtx.app;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

import java.util.ArrayList;

public class NativeCameraModule extends ReactContextBaseJavaModule implements ActivityEventListener {
    private static final int CAMERA_REQUEST_CODE = 1001;
    private Promise mPickerPromise;

    public NativeCameraModule(ReactApplicationContext reactContext) {
        super(reactContext);
        reactContext.addActivityEventListener(this);
    }

    @Override
    public String getName() {
        return "NativeCameraModule";
    }

    @ReactMethod
    public void openCamera(Promise promise) {
        Activity currentActivity = getCurrentActivity();
        if (currentActivity == null) {
            promise.reject("E_ACTIVITY_DOES_NOT_EXIST", "Activity不存在");
            return;
        }

        mPickerPromise = promise;

        try {
            Intent intent = new Intent(currentActivity, NativeCameraActivity.class);
            currentActivity.startActivityForResult(intent, CAMERA_REQUEST_CODE);
        } catch (Exception e) {
            mPickerPromise.reject("E_FAILED_TO_SHOW_CAMERA", e);
            mPickerPromise = null;
        }
    }

    @Override
    public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
        if (requestCode == CAMERA_REQUEST_CODE) {
            if (mPickerPromise != null) {
                if (resultCode == Activity.RESULT_CANCELED) {
                    mPickerPromise.reject("E_PICKER_CANCELLED", "用户取消");
                } else if (resultCode == Activity.RESULT_OK) {
                    if (data != null) {
                        ArrayList<String> photoPaths = data.getStringArrayListExtra("photoPaths");
                        if (photoPaths != null && photoPaths.size() > 0) {
                            WritableArray photos = Arguments.createArray();
                            for (String path : photoPaths) {
                                WritableMap photo = Arguments.createMap();
                                photo.putString("path", path);
                                photo.putString("uri", Uri.fromFile(new java.io.File(path)).toString());
                                photos.pushMap(photo);
                            }
                            mPickerPromise.resolve(photos);
                        } else {
                            mPickerPromise.reject("E_NO_PHOTOS", "没有拍摄照片");
                        }
                    } else {
                        mPickerPromise.reject("E_NO_DATA", "没有返回数据");
                    }
                }
                mPickerPromise = null;
            }
        }
    }

    @Override
    public void onNewIntent(Intent intent) {
    }
}