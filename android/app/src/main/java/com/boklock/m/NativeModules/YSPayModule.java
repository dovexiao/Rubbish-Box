package com.boklock.m.NativeModules;

import androidx.annotation.NonNull;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class YSPayModule extends ReactContextBaseJavaModule {
  private static final String MODULE_NAME = "YSPayModule";
  private final ReactApplicationContext reactContext;

  public YSPayModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
  }

  @NonNull
  @Override
  public String getName() {
    return MODULE_NAME;
  }

  @ReactMethod
  public void startPay(ReadableMap options, final Callback callback) {
    WritableMap resultMap = Arguments.createMap();

    Options opts = parseOptions(options);
    String env = opts.env;
    String payType = opts.payType;

    if (env == null || payType == null) {
      resultMap.putBoolean("success", false);
      resultMap.putString("message", payType == null ? "请选择支付方式" : "环境变量不能为null");
      callback.invoke(resultMap);
      return;
    }

    WritableMap callbackMap = Arguments.createMap();
    callbackMap.putBoolean("success", false);
    callbackMap.putString("code", "NOT_IMPLEMENTED");
    callbackMap.putString("message", "银盛支付SDK暂未接入");
    callback.invoke(callbackMap);
  }

  private void sendEvent(ReactContext reactContext, String eventName, WritableMap params) {
    reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, params);
  }

  private static class Options {
    private String env;
    private String payType;
  }

  private Options parseOptions(ReadableMap options) {
    Options opts = new Options();
    if (options == null) {
      opts.env = "dev";
      opts.payType = null;
      return opts;
    }
    try {
      opts.env = options.hasKey("env") ? options.getString("env") : "dev";
      opts.payType = options.hasKey("payType") ? options.getString("payType") : null;
    } catch (Exception e) {
      opts.env = "dev";
      opts.payType = null;
    }
    return opts;
  }
}
