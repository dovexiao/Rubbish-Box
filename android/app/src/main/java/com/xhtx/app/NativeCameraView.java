package com.xhtx.app;

import android.content.Context;
import android.graphics.ImageFormat;
import android.graphics.Rect;
import android.graphics.SurfaceTexture;
import android.graphics.YuvImage;
import android.hardware.camera2.CameraAccessException;
import android.hardware.camera2.CameraCaptureSession;
import android.hardware.camera2.CameraCharacteristics;
import android.hardware.camera2.CameraDevice;
import android.hardware.camera2.CameraManager;
import android.hardware.camera2.CameraMetadata;
import android.hardware.camera2.CaptureRequest;
import android.hardware.camera2.TotalCaptureResult;
import android.hardware.camera2.params.StreamConfigurationMap;
import android.media.Image;
import android.media.ImageReader;
import android.net.Uri;
import android.os.Handler;
import android.os.HandlerThread;
import android.os.SystemClock;
import android.util.Log;
import android.util.Size;
import android.view.Surface;
import android.view.TextureView;
import android.widget.FrameLayout;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.app.ActivityCompat;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.uimanager.events.RCTEventEmitter;
import com.xhtx.app.gesture.HandGrabDetector;

import java.io.File;
import java.io.FileOutputStream;
import java.nio.ByteBuffer;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Native camera preview view for embedding into RN UI without changing UI.
 *
 * - Preview: TextureView
 * - Still capture: full-res ImageReader
 * - Gesture analysis: low-res ImageReader + MediaPipe HandLandmarker ("grab"/fist) -> auto capture
 *
 * JS side:
 * - Use overlay UI as before
 * - Call command "takePhoto" for manual capture
 * - Listen to onPhotoCaptured event to append photo list
 */
public class NativeCameraView extends FrameLayout implements LifecycleEventListener {
  private static final String TAG = "NativeCameraView";

  // Gesture auto-capture analysis stream
  private static final int ANALYSIS_WIDTH = 256;
  private static final int ANALYSIS_HEIGHT = 256;
  private static final long GESTURE_PROCESS_INTERVAL_MS = 80; // ~12.5fps
  private static final long GRAB_EDGE_DEBOUNCE_MS = 300;
  private static final long GRAB_CONTINUOUS_INTERVAL_MS = 500; // 连续抓握间隔防抖 0.5s

  private ReactContext reactContext;
  private final TextureView textureView;

  private CameraDevice cameraDevice;
  private CameraCaptureSession captureSession;
  private CaptureRequest.Builder previewRequestBuilder;
  private Size previewSize = new Size(1280, 720);
  private ImageReader photoReader;
  // Gesture camera (front): analysis only
  private CameraDevice gestureCameraDevice;
  private CameraCaptureSession gestureCaptureSession;
  private CaptureRequest.Builder gestureRequestBuilder;
  private ImageReader analysisReader;

  private HandlerThread backgroundThread;
  private Handler backgroundHandler;

  private HandGrabDetector handGrabDetector;

  private volatile boolean isActive = false;
  private volatile boolean gestureEnabled = true;
  // Camera facing: default back for AI capture & gesture.
  // (Posture monitor uses front camera separately; AI module will stop it on entry.)
  private volatile int desiredLensFacing = CameraCharacteristics.LENS_FACING_BACK;
  private volatile boolean isCapturing = false;
  private volatile boolean isGrabActive = false;
  private volatile long lastGestureProcessTime = 0;
  private volatile long lastGrabEdgeTime = 0;
  private volatile long lastAutoCaptureTime = 0;
  private volatile long lastAnalysisDebugTime = 0;

  // Controlled from JS
  private volatile int photoCount = 0;
  private volatile int maxPhotos = 6;

  public NativeCameraView(@NonNull ReactContext context) {
    super(context);
    this.reactContext = context;

    textureView = new TextureView(context);
    textureView.setLayoutParams(new LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT));
    addView(textureView);

    textureView.setSurfaceTextureListener(surfaceTextureListener);

    // Make sure we actually receive lifecycle callbacks.
    reactContext.addLifecycleEventListener(this);

    Log.d(TAG, "✅ NativeCameraView created");
  }

  @Override
  protected void onAttachedToWindow() {
    super.onAttachedToWindow();
    Log.d(TAG, "📎 onAttachedToWindow - initializing camera");
    // When view is attached, Activity is already resumed, so onHostResume won't fire.
    // Manually trigger initialization here.
    if (!isActive) {
      onHostResume();
    }
  }

  @Override
  protected void onDetachedFromWindow() {
    super.onDetachedFromWindow();
    Log.d(TAG, "📎 onDetachedFromWindow - releasing camera");
    try {
      reactContext.removeLifecycleEventListener(this);
    } catch (Exception ignored) {}
    onHostPause();
  }

  public void setGestureEnabled(boolean enabled) {
    gestureEnabled = enabled;
    // Allow toggling at runtime without re-creating the view.
    if (!isActive || handGrabDetector == null) return;
    if (enabled) {
      handGrabDetector.start();
      sendDebugEvent("🤚 HandGrabDetector started (prop update)");
    } else {
      handGrabDetector.stop();
      sendDebugEvent("🤚 HandGrabDetector stopped (prop update)");
    }
  }

  /** Android CameraCharacteristics.LENS_FACING_*: 0=front, 1=back */
  public void setCameraFacing(int facing) {
    int newFacing = (facing == CameraCharacteristics.LENS_FACING_FRONT)
        ? CameraCharacteristics.LENS_FACING_FRONT
        : CameraCharacteristics.LENS_FACING_BACK;
    if (desiredLensFacing == newFacing) return;
    desiredLensFacing = newFacing;
    sendDebugEvent("📷 cameraFacing updated: " + (desiredLensFacing == CameraCharacteristics.LENS_FACING_BACK ? "back" : "front"));
    // If already active, restart camera to apply.
    if (isActive) {
      closeCamera();
      if (textureView.isAvailable()) openCamera();
    }
  }

  public void setPhotoCount(int count) {
    photoCount = Math.max(0, count);
  }

  public void setMaxPhotos(int max) {
    maxPhotos = Math.max(1, max);
  }

  private void sendDebugEvent(String message) {
    try {
      WritableMap payload = Arguments.createMap();
      payload.putString("debug", message);
      reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(getId(), "onPhotoCaptured", payload);
    } catch (Exception e) {
      Log.e(TAG, "sendDebugEvent failed", e);
    }
  }

  public void takePhoto() {
    String status = "📸 takePhoto: isActive=" + isActive + ", isCapturing=" + isCapturing + 
               ", photoCount=" + photoCount + "/" + maxPhotos +
               ", cameraDevice=" + (cameraDevice != null) + 
               ", captureSession=" + (captureSession != null) +
               ", photoReader=" + (photoReader != null);
    Log.d(TAG, status);
    sendDebugEvent(status);

    if (!isActive) {
      Log.w(TAG, "⚠️ takePhoto: not active");
      sendDebugEvent("⚠️ takePhoto: not active");
      return;
    }
    if (isCapturing) {
      Log.w(TAG, "⚠️ takePhoto: already capturing");
      sendDebugEvent("⚠️ takePhoto: already capturing");
      return;
    }
    if (photoCount >= maxPhotos) {
      Log.w(TAG, "⚠️ takePhoto: max photos reached");
      sendDebugEvent("⚠️ takePhoto: max photos reached");
      return;
    }
    if (cameraDevice == null || captureSession == null || photoReader == null) {
      Log.w(TAG, "⚠️ takePhoto: camera not ready");
      sendDebugEvent("⚠️ takePhoto: camera not ready - device:" + (cameraDevice != null) + " session:" + (captureSession != null) + " reader:" + (photoReader != null));
      return;
    }

    Log.d(TAG, "📸 Starting capture...");
    isCapturing = true;
    try {
      // Stop repeating request then do still capture
      captureSession.stopRepeating();

      CaptureRequest.Builder captureBuilder = cameraDevice.createCaptureRequest(CameraDevice.TEMPLATE_STILL_CAPTURE);
      captureBuilder.addTarget(photoReader.getSurface());
      captureBuilder.set(CaptureRequest.CONTROL_MODE, CameraMetadata.CONTROL_MODE_AUTO);
      captureBuilder.set(CaptureRequest.JPEG_ORIENTATION, 0);

      captureSession.capture(captureBuilder.build(), new CameraCaptureSession.CaptureCallback() {
        @Override
        public void onCaptureCompleted(@NonNull CameraCaptureSession session,
                                       @NonNull CaptureRequest request,
                                       @NonNull TotalCaptureResult result) {
          startPreview();
          isCapturing = false;
        }

        @Override
        public void onCaptureFailed(@NonNull CameraCaptureSession session,
                                    @NonNull CaptureRequest request,
                                    @NonNull android.hardware.camera2.CaptureFailure failure) {
          Log.e(TAG, "Capture failed: " + failure.getReason());
          startPreview();
          isCapturing = false;
        }
      }, backgroundHandler);
    } catch (Exception e) {
      Log.e(TAG, "takePhoto failed", e);
      startPreview();
      isCapturing = false;
    }
  }

  @Override
  public void onHostResume() {
    Log.d(TAG, "🔄 onHostResume called, isActive=" + isActive);
    if (isActive) {
      Log.d(TAG, "⏭️ Already active, skipping");
      return;
    }
    isActive = true;
    startBackgroundThread();
    if (handGrabDetector == null) {
      handGrabDetector = new HandGrabDetector(getContext(), this::onGrabStateChanged);
    }
    if (gestureEnabled) {
      handGrabDetector.start();
      Log.d(TAG, "🤚 HandGrabDetector started");
    }
    // Gesture analysis camera does not depend on TextureView.
    if (gestureEnabled) {
      openGestureCamera();
    }
    if (textureView.isAvailable()) {
      Log.d(TAG, "📷 TextureView available, opening camera");
      openCamera();
    } else {
      Log.d(TAG, "⏳ TextureView not yet available, waiting for callback");
    }
  }

  @Override
  public void onHostPause() {
    isActive = false;
    closeCamera();
    stopBackgroundThread();
    if (handGrabDetector != null) {
      handGrabDetector.stop();
    }
  }

  @Override
  public void onHostDestroy() {
    onHostPause();
  }

  private final TextureView.SurfaceTextureListener surfaceTextureListener = new TextureView.SurfaceTextureListener() {
    @Override
    public void onSurfaceTextureAvailable(@NonNull SurfaceTexture surface, int width, int height) {
      Log.d(TAG, "🖼️ onSurfaceTextureAvailable: " + width + "x" + height + ", isActive=" + isActive);
      if (isActive) {
        openCamera();
      }
    }

    @Override
    public void onSurfaceTextureSizeChanged(@NonNull SurfaceTexture surface, int width, int height) {
      Log.d(TAG, "🖼️ onSurfaceTextureSizeChanged: " + width + "x" + height);
    }

    @Override
    public boolean onSurfaceTextureDestroyed(@NonNull SurfaceTexture surface) {
      Log.d(TAG, "🖼️ onSurfaceTextureDestroyed");
      return true;
    }

    @Override
    public void onSurfaceTextureUpdated(@NonNull SurfaceTexture surface) {}
  };

  private void startBackgroundThread() {
    if (backgroundThread != null) return;
    backgroundThread = new HandlerThread("NativeCameraViewThread");
    backgroundThread.start();
    backgroundHandler = new Handler(backgroundThread.getLooper());
  }

  private void stopBackgroundThread() {
    if (backgroundThread == null) return;
    try {
      backgroundThread.quitSafely();
      backgroundThread.join();
    } catch (InterruptedException ignored) {
    } finally {
      backgroundThread = null;
      backgroundHandler = null;
    }
  }

  private void openCamera() {
    Log.d(TAG, "📷 openCamera() called");
    try {
      CameraManager manager = (CameraManager) getContext().getSystemService(Context.CAMERA_SERVICE);
      if (manager == null) {
        Log.e(TAG, "❌ CameraManager is null");
        return;
      }

      String[] cameraIds = manager.getCameraIdList();
      Log.d(TAG, "📷 Available cameras: " + java.util.Arrays.toString(cameraIds));
      if (cameraIds.length == 0) {
        Log.e(TAG, "❌ No cameras available");
        return;
      }

      // Pick camera by lens facing (best practice, avoid OEM-specific hardcoded IDs).
      String cameraId = null;
      for (String id : cameraIds) {
        CameraCharacteristics c = manager.getCameraCharacteristics(id);
        Integer facing = c.get(CameraCharacteristics.LENS_FACING);
        if (facing != null && facing == desiredLensFacing) {
          cameraId = id;
          break;
        }
      }
      // Fallback: any camera
      if (cameraId == null) cameraId = cameraIds[0];
      Log.d(TAG, "📷 Using cameraId: " + cameraId + " (desiredFacing=" +
          (desiredLensFacing == CameraCharacteristics.LENS_FACING_BACK ? "back" : "front") + ")");
      sendDebugEvent("📷 Using cameraId: " + cameraId + " (desired=" +
          (desiredLensFacing == CameraCharacteristics.LENS_FACING_BACK ? "back" : "front") + ")");

      CameraCharacteristics characteristics = manager.getCameraCharacteristics(cameraId);
      StreamConfigurationMap map = characteristics.get(CameraCharacteristics.SCALER_STREAM_CONFIGURATION_MAP);
      if (map != null) {
        Size[] sizes = map.getOutputSizes(SurfaceTexture.class);
        if (sizes != null && sizes.length > 0) {
          Size best = sizes[0];
          for (Size s : sizes) {
            if (s.getWidth() * s.getHeight() > best.getWidth() * best.getHeight()) best = s;
          }
          previewSize = best;
        }
      }
      Log.d(TAG, "📷 Preview size: " + previewSize.getWidth() + "x" + previewSize.getHeight());

      // Full-res still capture reader (preview/back camera)
      photoReader = ImageReader.newInstance(previewSize.getWidth(), previewSize.getHeight(), ImageFormat.YUV_420_888, 2);
      photoReader.setOnImageAvailableListener(onPhotoAvailableListener, backgroundHandler);

      Log.d(TAG, "📷 Opening camera...");
      manager.openCamera(cameraId, stateCallback, backgroundHandler);
    } catch (SecurityException e) {
      Log.e(TAG, "❌ openCamera failed: No camera permission", e);
    } catch (Exception e) {
      Log.e(TAG, "❌ openCamera failed", e);
    }
  }

  private final CameraDevice.StateCallback stateCallback = new CameraDevice.StateCallback() {
    @Override
    public void onOpened(@NonNull CameraDevice camera) {
      Log.d(TAG, "✅ Camera opened successfully");
      cameraDevice = camera;
      createPreviewSession();
    }

    @Override
    public void onDisconnected(@NonNull CameraDevice camera) {
      camera.close();
      cameraDevice = null;
    }

    @Override
    public void onError(@NonNull CameraDevice camera, int error) {
      Log.e(TAG, "Camera error: " + error);
      camera.close();
      cameraDevice = null;
    }
  };

  private void createPreviewSession() {
    Log.d(TAG, "🎬 createPreviewSession() called");
    try {
      if (cameraDevice == null) {
        Log.e(TAG, "❌ cameraDevice is null");
        return;
      }
      SurfaceTexture texture = textureView.getSurfaceTexture();
      if (texture == null) {
        Log.e(TAG, "❌ SurfaceTexture is null");
        return;
      }

      texture.setDefaultBufferSize(previewSize.getWidth(), previewSize.getHeight());
      Surface previewSurface = new Surface(texture);

      previewRequestBuilder = cameraDevice.createCaptureRequest(CameraDevice.TEMPLATE_PREVIEW);
      previewRequestBuilder.addTarget(previewSurface);
      previewRequestBuilder.set(CaptureRequest.CONTROL_MODE, CameraMetadata.CONTROL_MODE_AUTO);

      List<Surface> outputs = new ArrayList<>();
      outputs.add(previewSurface);
      if (photoReader != null) outputs.add(photoReader.getSurface());

      Log.d(TAG, "🎬 Creating capture session with " + outputs.size() + " outputs");
      cameraDevice.createCaptureSession(outputs, new CameraCaptureSession.StateCallback() {
        @Override
        public void onConfigured(@NonNull CameraCaptureSession session) {
          Log.d(TAG, "✅ CaptureSession configured successfully");
          captureSession = session;
          startPreview();
        }

        @Override
        public void onConfigureFailed(@NonNull CameraCaptureSession session) {
          Log.e(TAG, "❌ CaptureSession configure failed");
        }
      }, backgroundHandler);
    } catch (Exception e) {
      Log.e(TAG, "❌ createPreviewSession failed", e);
    }
  }

  private void startPreview() {
    Log.d(TAG, "▶️ startPreview() called");
    try {
      if (captureSession == null || previewRequestBuilder == null) {
        Log.e(TAG, "❌ Cannot start preview: session or builder is null");
        return;
      }
      captureSession.setRepeatingRequest(previewRequestBuilder.build(), null, backgroundHandler);
      Log.d(TAG, "✅ Preview started successfully");
    } catch (Exception e) {
      Log.e(TAG, "❌ startPreview failed", e);
    }
  }

  private final ImageReader.OnImageAvailableListener onAnalysisAvailableListener = reader -> {
    if (!isActive || !gestureEnabled || handGrabDetector == null) return;
    Image image = null;
    try {
      image = reader.acquireLatestImage();
      if (image == null) return;

      long now = SystemClock.uptimeMillis();
      if (now - lastGestureProcessTime < GESTURE_PROCESS_INTERVAL_MS) return;
      lastGestureProcessTime = now;

      // Low-frequency debug heartbeat (helps confirm analysis frames are flowing without logcat).
      if (now - lastAnalysisDebugTime > 2000) {
        lastAnalysisDebugTime = now;
        sendDebugEvent("🧠 analysis frame ok (" + image.getWidth() + "x" + image.getHeight() + ")");
      }
      handGrabDetector.process(image, now);
    } catch (Exception e) {
      Log.e(TAG, "analysis frame failed", e);
    } finally {
      if (image != null) image.close();
    }
  };

  private void openGestureCamera() {
    if (!isActive || !gestureEnabled) return;
    if (gestureCameraDevice != null || gestureCaptureSession != null) return;
    try {
      CameraManager manager = (CameraManager) getContext().getSystemService(Context.CAMERA_SERVICE);
      if (manager == null) return;
      String[] cameraIds = manager.getCameraIdList();
      if (cameraIds.length == 0) return;

      // Always prefer FRONT for gesture.
      String cameraId = null;
      for (String id : cameraIds) {
        CameraCharacteristics c = manager.getCameraCharacteristics(id);
        Integer facing = c.get(CameraCharacteristics.LENS_FACING);
        if (facing != null && facing == CameraCharacteristics.LENS_FACING_FRONT) {
          cameraId = id;
          break;
        }
      }
      // Fallback: if no front camera, use first available.
      if (cameraId == null) cameraId = cameraIds[0];

      sendDebugEvent("🤚 Gesture cameraId: " + cameraId + " (desired=front)");

      analysisReader = ImageReader.newInstance(ANALYSIS_WIDTH, ANALYSIS_HEIGHT, ImageFormat.YUV_420_888, 2);
      analysisReader.setOnImageAvailableListener(onAnalysisAvailableListener, backgroundHandler);

      manager.openCamera(cameraId, gestureStateCallback, backgroundHandler);
    } catch (SecurityException e) {
      Log.e(TAG, "❌ openGestureCamera failed: No camera permission", e);
      sendDebugEvent("❌ openGestureCamera: no permission");
    } catch (Exception e) {
      Log.e(TAG, "❌ openGestureCamera failed", e);
      sendDebugEvent("❌ openGestureCamera failed: " + e.getClass().getSimpleName());
    }
  }

  private final CameraDevice.StateCallback gestureStateCallback = new CameraDevice.StateCallback() {
    @Override
    public void onOpened(@NonNull CameraDevice camera) {
      gestureCameraDevice = camera;
      sendDebugEvent("✅ Gesture camera opened");
      createGestureSession();
    }

    @Override
    public void onDisconnected(@NonNull CameraDevice camera) {
      camera.close();
      gestureCameraDevice = null;
      sendDebugEvent("⚠️ Gesture camera disconnected");
    }

    @Override
    public void onError(@NonNull CameraDevice camera, int error) {
      Log.e(TAG, "Gesture camera error: " + error);
      camera.close();
      gestureCameraDevice = null;
      sendDebugEvent("❌ Gesture camera error: " + error);
    }
  };

  private void createGestureSession() {
    try {
      if (gestureCameraDevice == null || analysisReader == null) return;
      Surface analysisSurface = analysisReader.getSurface();
      gestureRequestBuilder = gestureCameraDevice.createCaptureRequest(CameraDevice.TEMPLATE_PREVIEW);
      gestureRequestBuilder.addTarget(analysisSurface);
      gestureRequestBuilder.set(CaptureRequest.CONTROL_MODE, CameraMetadata.CONTROL_MODE_AUTO);

      List<Surface> outputs = new ArrayList<>();
      outputs.add(analysisSurface);
      gestureCameraDevice.createCaptureSession(outputs, new CameraCaptureSession.StateCallback() {
        @Override
        public void onConfigured(@NonNull CameraCaptureSession session) {
          gestureCaptureSession = session;
          try {
            gestureCaptureSession.setRepeatingRequest(gestureRequestBuilder.build(), null, backgroundHandler);
            sendDebugEvent("✅ Gesture analysis repeating started");
          } catch (Exception e) {
            Log.e(TAG, "start gesture repeating failed", e);
            sendDebugEvent("❌ Gesture repeating failed");
          }
        }

        @Override
        public void onConfigureFailed(@NonNull CameraCaptureSession session) {
          Log.e(TAG, "❌ Gesture CaptureSession configure failed");
          sendDebugEvent("❌ Gesture session configure failed");
        }
      }, backgroundHandler);
    } catch (Exception e) {
      Log.e(TAG, "createGestureSession failed", e);
      sendDebugEvent("❌ createGestureSession failed");
    }
  }

  private void onGrabStateChanged(boolean isGrab) {
    long now = SystemClock.uptimeMillis();

    if (!isGrab) {
      if (isGrabActive) {
        Log.d(TAG, "🤚 Grab released");
        sendDebugEvent("🤚 Grab released");
      }
      isGrabActive = false;
      return;
    }

    if (photoCount >= maxPhotos) return;

    if (!isGrabActive) {
      Log.d(TAG, "🤚 Grab detected!");
      sendDebugEvent("🤚 Grab detected!");
      if (now - lastGrabEdgeTime >= GRAB_EDGE_DEBOUNCE_MS) {
        lastGrabEdgeTime = now;
        lastAutoCaptureTime = 0;
        triggerAutoCapture(now);
      }
      isGrabActive = true;
      return;
    }

    if (now - lastAutoCaptureTime >= GRAB_CONTINUOUS_INTERVAL_MS) {
      Log.d(TAG, "🤚 Continuous grab - triggering capture");
      sendDebugEvent("🤚 Continuous grab - triggering capture");
      triggerAutoCapture(now);
    }
  }

  private void triggerAutoCapture(long now) {
    Log.d(TAG, "⚡ triggerAutoCapture called");
    if (!isActive) return;
    if (photoCount >= maxPhotos) return;
    if (isCapturing) return;
    lastAutoCaptureTime = now;
    takePhoto();
  }

  private final ImageReader.OnImageAvailableListener onPhotoAvailableListener = reader -> {
    Log.d(TAG, "📷 onPhotoAvailableListener triggered");
    Image image = null;
    try {
      image = reader.acquireLatestImage();
      if (image == null) {
        Log.w(TAG, "⚠️ No image available");
        return;
      }

      Log.d(TAG, "📷 Saving photo " + image.getWidth() + "x" + image.getHeight());
      String path = saveToAppStorage(image);
      if (path == null) {
        Log.e(TAG, "❌ Failed to save photo");
        return;
      }

      Log.d(TAG, "✅ Photo saved: " + path);
      WritableMap payload = Arguments.createMap();
      payload.putString("path", path);
      payload.putString("uri", Uri.fromFile(new File(path)).toString());

      Log.d(TAG, "📤 Sending onPhotoCaptured event to JS");
      reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(getId(), "onPhotoCaptured", payload);
    } catch (Exception e) {
      Log.e(TAG, "❌ photo save failed", e);
    } finally {
      if (image != null) image.close();
    }
  };

  @Nullable
  private String saveToAppStorage(@NonNull Image image) {
    File file = null;
    try {
      ByteBuffer yBuffer = image.getPlanes()[0].getBuffer();
      ByteBuffer uBuffer = image.getPlanes()[1].getBuffer();
      ByteBuffer vBuffer = image.getPlanes()[2].getBuffer();

      int ySize = yBuffer.remaining();
      int uSize = uBuffer.remaining();
      int vSize = vBuffer.remaining();

      byte[] nv21 = new byte[ySize + uSize + vSize];
      yBuffer.get(nv21, 0, ySize);
      vBuffer.get(nv21, ySize, vSize);
      uBuffer.get(nv21, ySize + vSize, uSize);

      YuvImage yuvImage = new YuvImage(nv21, ImageFormat.NV21, image.getWidth(), image.getHeight(), null);

      File storageDir = new File(getContext().getFilesDir(), "captured_photos");
      if (!storageDir.exists()) storageDir.mkdirs();
      file = new File(storageDir, "IMG_" + System.currentTimeMillis() + ".jpg");

      try (FileOutputStream fos = new FileOutputStream(file)) {
        yuvImage.compressToJpeg(new Rect(0, 0, image.getWidth(), image.getHeight()), 90, fos);
      }

      return file.getAbsolutePath();
    } catch (Exception e) {
      Log.e(TAG, "saveToAppStorage failed", e);
      if (file != null && file.exists()) file.delete();
      return null;
    }
  }

  private void closeCamera() {
    try {
      if (captureSession != null) {
        captureSession.close();
        captureSession = null;
      }
      if (cameraDevice != null) {
        cameraDevice.close();
        cameraDevice = null;
      }
      if (gestureCaptureSession != null) {
        gestureCaptureSession.close();
        gestureCaptureSession = null;
      }
      if (gestureCameraDevice != null) {
        gestureCameraDevice.close();
        gestureCameraDevice = null;
      }
      if (photoReader != null) {
        photoReader.close();
        photoReader = null;
      }
      if (analysisReader != null) {
        analysisReader.close();
        analysisReader = null;
      }
    } catch (Exception e) {
      Log.e(TAG, "closeCamera failed", e);
    }
  }
}

