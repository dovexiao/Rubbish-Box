package com.xhtx.app;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.uimanager.events.RCTEventEmitter;

import java.util.Map;

/**
 * Exposes {@link NativeCameraView} to React Native as <NativeCameraPreview />.
 *
 * Props:
 * - gestureEnabled: boolean
 * - photoCount: number
 * - maxPhotos: number
 *
 * Events:
 * - onPhotoCaptured({ path, uri })
 *
 * Commands:
 * - takePhoto()
 */
public class NativeCameraViewManager extends SimpleViewManager<NativeCameraView> {
  public static final String REACT_CLASS = "NativeCameraPreview";

  private static final int COMMAND_TAKE_PHOTO = 1;

  @NonNull
  @Override
  public String getName() {
    return REACT_CLASS;
  }

  @NonNull
  @Override
  protected NativeCameraView createViewInstance(@NonNull ThemedReactContext reactContext) {
    return new NativeCameraView(reactContext);
  }

  @ReactProp(name = "gestureEnabled", defaultBoolean = true)
  public void setGestureEnabled(NativeCameraView view, boolean enabled) {
    view.setGestureEnabled(enabled);
  }

  @ReactProp(name = "photoCount", defaultInt = 0)
  public void setPhotoCount(NativeCameraView view, int count) {
    view.setPhotoCount(count);
  }

  @ReactProp(name = "maxPhotos", defaultInt = 6)
  public void setMaxPhotos(NativeCameraView view, int max) {
    view.setMaxPhotos(max);
  }

  /**
   * Android CameraCharacteristics.LENS_FACING_*:
   * - 0 = front
   * - 1 = back
   * Default is back (AI拍照用后置；手势检测用前置；坐姿监测进入页面时会停止)
   */
  @ReactProp(name = "cameraFacing", defaultInt = android.hardware.camera2.CameraCharacteristics.LENS_FACING_BACK)
  public void setCameraFacing(NativeCameraView view, int facing) {
    view.setCameraFacing(facing);
  }

  /**
   * Workaround for some vendor HALs that report LENS_FACING swapped.
   * When true, native selection will invert front/back.
   */
  @ReactProp(name = "swapLensFacing", defaultBoolean = false)
  public void setSwapLensFacing(NativeCameraView view, boolean enabled) {
    view.setSwapLensFacing(enabled);
  }

  @Nullable
  @Override
  public Map<String, Object> getExportedCustomDirectEventTypeConstants() {
    return MapBuilder.<String, Object>builder()
        .put("onPhotoCaptured", MapBuilder.of("registrationName", "onPhotoCaptured"))
        .build();
  }

  @Nullable
  @Override
  public Map<String, Integer> getCommandsMap() {
    return MapBuilder.of("takePhoto", COMMAND_TAKE_PHOTO);
  }

  /**
   * RN 新架构/新版本在 dispatchViewManagerCommand 传 number 时，会走这个重载。
   * 之前只实现 String 版本会导致 JS 命令“发出但原生完全不响应”。
   */
  @Override
  public void receiveCommand(@NonNull NativeCameraView root, int commandId, @Nullable ReadableArray args) {
    android.util.Log.d("NativeCameraViewManager", "📥 receiveCommand(int): " + commandId);
    if (commandId == COMMAND_TAKE_PHOTO) {
      android.util.Log.d("NativeCameraViewManager", "📸 Calling root.takePhoto() from int overload");
      root.takePhoto();
      return;
    }
    super.receiveCommand(root, commandId, args);
  }

  @Override
  public void receiveCommand(@NonNull NativeCameraView root, String commandId, @Nullable ReadableArray args) {
    android.util.Log.d("NativeCameraViewManager", "📥 receiveCommand: commandId=" + commandId);
    int id;
    try {
      id = Integer.parseInt(commandId);
    } catch (NumberFormatException ignored) {
      // In some RN versions commandId is the string name instead of numeric id.
      android.util.Log.d("NativeCameraViewManager", "📥 Command is string: " + commandId);
      if ("takePhoto".equals(commandId)) {
        android.util.Log.d("NativeCameraViewManager", "📸 Calling root.takePhoto() from string command");
        root.takePhoto();
      }
      return;
    }
    android.util.Log.d("NativeCameraViewManager", "📥 Command is int: " + id);
    if (id == COMMAND_TAKE_PHOTO) {
      android.util.Log.d("NativeCameraViewManager", "📸 Calling root.takePhoto() from int command");
      root.takePhoto();
    }
  }
}

