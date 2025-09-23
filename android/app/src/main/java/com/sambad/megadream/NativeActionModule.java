package com.sambad.supbetgame;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.sambad.supbetgame.MainActivity;


import java.util.HashMap;
import java.util.Map;

public class NativeActionModule extends ReactContextBaseJavaModule {

  private ReactApplicationContext reactContext;

  public NativeActionModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
  }

  @Override
  public String getName() {
    return "NativeActionManager";
  }

  @ReactMethod
  public void performNativeAction(String action, ReadableMap params) {
    // 获取 MainActivity 实例并调用方法
    if (getCurrentActivity() instanceof MainActivity) {
      MainActivity mainActivity = (MainActivity) getCurrentActivity();

      // 将 ReadableMap 转换为 Java Map
      Map<String, Object> paramMap = new HashMap<>();
      if (params != null) {
        ReadableMapKeySetIterator iterator = params.keySetIterator();
        while (iterator.hasNextKey()) {
          String key = iterator.nextKey();
          paramMap.put(key, params.getString(key)); // 根据实际类型调整
        }
      }

      // 调用 MainActivity 中的方法
      mainActivity.performNativeAction(action, paramMap);
    }
  }
}
