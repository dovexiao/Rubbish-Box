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
import android.os.Build;
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
import java.util.Set;

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
  // NOTE: Some vendor HALs don't support tiny square YUV outputs.
  // We'll pick the nearest supported size at runtime (prefer ~320x240 or 640x360).
  private static final int ANALYSIS_TARGET_WIDTH = 320;
  private static final int ANALYSIS_TARGET_HEIGHT = 240;
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
  // Some vendor HALs report LENS_FACING swapped. When true, we invert facing selection.
  private volatile boolean swapLensFacing = false;
  private volatile boolean isCapturing = false;
  private volatile boolean isGrabActive = false;
  private volatile long lastGestureProcessTime = 0;
  private volatile long lastGrabEdgeTime = 0;
  private volatile long lastAutoCaptureTime = 0;
  private volatile long lastAnalysisDebugTime = 0;
  private volatile boolean gestureStartRequested = false;
  private volatile boolean mainPreviewStarted = false;
  private volatile boolean mainOpenRequested = false;
  private volatile boolean retryingMainAfterClosingGesture = false;
  private volatile boolean concurrentChecked = false;
  private volatile boolean concurrentSupported = false;
  @Nullable private String cachedMainCameraId = null;
  @Nullable private String cachedFrontCameraId = null;
  @Nullable private Size cachedAnalysisSize = null;
  @Nullable private Size cachedJpegSize = null;

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
      gestureStartRequested = true;
      maybeStartGestureCamera();
    } else {
      handGrabDetector.stop();
      sendDebugEvent("🤚 HandGrabDetector stopped (prop update)");
      gestureStartRequested = false;
      closeGestureCamera();
    }
  }

  /** Android CameraCharacteristics.LENS_FACING_*: 0=front, 1=back */
  public void setCameraFacing(int facing) {
    int newFacing = (facing == CameraCharacteristics.LENS_FACING_FRONT)
        ? CameraCharacteristics.LENS_FACING_FRONT
        : CameraCharacteristics.LENS_FACING_BACK;
    if (desiredLensFacing == newFacing) return;
    desiredLensFacing = newFacing;
    sendDebugEvent("📷 cameraFacing updated: " + (desiredLensFacing == CameraCharacteristics.LENS_FACING_BACK ? "back" : "front")
        + " (swapLensFacing=" + swapLensFacing + ")");
    // If already active, restart camera to apply.
    if (isActive) {
      closeCamera();
      if (textureView.isAvailable()) openCamera();
    }
  }

  /** If true, invert LENS_FACING selection (device HAL bug workaround). */
  public void setSwapLensFacing(boolean enabled) {
    if (swapLensFacing == enabled) return;
    swapLensFacing = enabled;
    sendDebugEvent("🔁 swapLensFacing updated: " + swapLensFacing);
    if (isActive) {
      closeCamera();
      if (textureView.isAvailable()) openCamera();
    }
  }

  private int mapFacing(int facing) {
    if (!swapLensFacing) return facing;
    if (facing == CameraCharacteristics.LENS_FACING_FRONT) return CameraCharacteristics.LENS_FACING_BACK;
    if (facing == CameraCharacteristics.LENS_FACING_BACK) return CameraCharacteristics.LENS_FACING_FRONT;
    return facing;
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
    mainPreviewStarted = false;
    mainOpenRequested = false;
    retryingMainAfterClosingGesture = false;
    concurrentChecked = false;
    concurrentSupported = false;
    cachedMainCameraId = null;
    cachedFrontCameraId = null;
    cachedAnalysisSize = null;
    cachedJpegSize = null;
    gestureStartRequested = gestureEnabled;
    startBackgroundThread();
    if (handGrabDetector == null) {
      handGrabDetector = new HandGrabDetector(getContext(), this::onGrabStateChanged);
    }
    if (gestureEnabled) {
      handGrabDetector.start();
      Log.d(TAG, "🤚 HandGrabDetector started");
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
    mainPreviewStarted = false;
    mainOpenRequested = false;
    retryingMainAfterClosingGesture = false;
    gestureStartRequested = false;
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
        sendDebugEvent("❌ openCamera: CameraManager is null");
        return;
      }

      String[] cameraIds = manager.getCameraIdList();
      Log.d(TAG, "📷 Available cameras: " + java.util.Arrays.toString(cameraIds));
      if (cameraIds.length == 0) {
        Log.e(TAG, "❌ No cameras available");
        sendDebugEvent("❌ openCamera: no cameras available");
        return;
      }

      // Pick camera by lens facing (best practice, avoid OEM-specific hardcoded IDs).
      int effectiveDesiredFacing = mapFacing(desiredLensFacing);
      String cameraId = null;
      for (String id : cameraIds) {
        CameraCharacteristics c = manager.getCameraCharacteristics(id);
        Integer facing = c.get(CameraCharacteristics.LENS_FACING);
        if (facing != null && facing == effectiveDesiredFacing) {
          cameraId = id;
          break;
        }
      }
      // Fallback: any camera
      if (cameraId == null) cameraId = cameraIds[0];

      cachedMainCameraId = cameraId;
      cachedFrontCameraId = findCameraIdByFacing(manager, mapFacing(CameraCharacteristics.LENS_FACING_FRONT));
      if (!concurrentChecked) {
        concurrentChecked = true;
        concurrentSupported = (cachedFrontCameraId != null)
            && !cachedFrontCameraId.equals(cachedMainCameraId)
            && isConcurrentPairSupported(manager, cachedMainCameraId, cachedFrontCameraId);
        sendDebugEvent("🧩 concurrent=" + (concurrentSupported ? "supported" : "not_supported")
            + " (main=" + cachedMainCameraId + ", front=" + (cachedFrontCameraId == null ? "null" : cachedFrontCameraId)
            + ", api=" + Build.VERSION.SDK_INT + ", swapLensFacing=" + swapLensFacing + ")");
      }

      Log.d(TAG, "📷 Using cameraId: " + cameraId + " (desiredFacing=" +
          (desiredLensFacing == CameraCharacteristics.LENS_FACING_BACK ? "back" : "front") + ")");
      sendDebugEvent("📷 Using cameraId: " + cameraId + " (desired=" +
          (desiredLensFacing == CameraCharacteristics.LENS_FACING_BACK ? "back" : "front") + ")");
      sendDebugEvent("📷 effectiveFacing(main)=" + (effectiveDesiredFacing == CameraCharacteristics.LENS_FACING_BACK ? "back" : "front")
          + " effectiveFacing(gestureFront)=" + (mapFacing(CameraCharacteristics.LENS_FACING_FRONT) == CameraCharacteristics.LENS_FACING_BACK ? "back" : "front"));

      CameraCharacteristics characteristics = manager.getCameraCharacteristics(cameraId);
      StreamConfigurationMap map = characteristics.get(CameraCharacteristics.SCALER_STREAM_CONFIGURATION_MAP);
      // Concurrency-friendly sizes:
      // - Preview: prefer ~1280x720 (or closest supported) instead of the maximum size.
      // - Capture: prefer JPEG at <=1920x1080 (or closest) with similar aspect ratio.
      if (map != null) {
        Size[] previewSizes = map.getOutputSizes(SurfaceTexture.class);
        Size chosenPreview = chooseClosestSize(previewSizes, 1280, 720, 1920, 1080);
        if (chosenPreview != null) previewSize = chosenPreview;

        Size[] jpegSizes = map.getOutputSizes(ImageFormat.JPEG);
        Size chosenJpeg = chooseJpegSize(jpegSizes, previewSize);
        cachedJpegSize = chosenJpeg;
      }
      if (cachedJpegSize == null) {
        cachedJpegSize = new Size(previewSize.getWidth(), previewSize.getHeight());
      }
      Log.d(TAG, "📷 Preview size: " + previewSize.getWidth() + "x" + previewSize.getHeight());
      Log.d(TAG, "📷 JPEG capture size: " + cachedJpegSize.getWidth() + "x" + cachedJpegSize.getHeight());
      sendDebugEvent("📷 sizes preview=" + previewSize.getWidth() + "x" + previewSize.getHeight()
          + " jpeg=" + cachedJpegSize.getWidth() + "x" + cachedJpegSize.getHeight());

      // Still capture reader (JPEG is much more concurrency-friendly than full-res YUV).
      photoReader = ImageReader.newInstance(cachedJpegSize.getWidth(), cachedJpegSize.getHeight(), ImageFormat.JPEG, 2);
      photoReader.setOnImageAvailableListener(onPhotoAvailableListener, backgroundHandler);

      Log.d(TAG, "📷 Opening camera...");
      mainOpenRequested = true;
      manager.openCamera(cameraId, stateCallback, backgroundHandler);
    } catch (SecurityException e) {
      Log.e(TAG, "❌ openCamera failed: No camera permission", e);
      sendDebugEvent("❌ openCamera: no permission");
    } catch (Exception e) {
      Log.e(TAG, "❌ openCamera failed", e);
      sendDebugEvent("❌ openCamera failed: " + e.getClass().getSimpleName());
    }
  }

  private final CameraDevice.StateCallback stateCallback = new CameraDevice.StateCallback() {
    @Override
    public void onOpened(@NonNull CameraDevice camera) {
      Log.d(TAG, "✅ Camera opened successfully");
      cameraDevice = camera;
      retryingMainAfterClosingGesture = false;
      sendDebugEvent("✅ Main camera opened");
      createPreviewSession();
    }

    @Override
    public void onDisconnected(@NonNull CameraDevice camera) {
      camera.close();
      cameraDevice = null;
      sendDebugEvent("⚠️ Main camera disconnected");
    }

    @Override
    public void onError(@NonNull CameraDevice camera, int error) {
      Log.e(TAG, "Camera error: " + error);
      sendDebugEvent("❌ Main camera error: " + error);
      camera.close();
      cameraDevice = null;

      // Safety: if gesture camera was opened first (or HAL resource race),
      // close gesture and retry opening the main camera once.
      if (!retryingMainAfterClosingGesture
          && (error == CameraDevice.StateCallback.ERROR_MAX_CAMERAS_IN_USE
          || error == CameraDevice.StateCallback.ERROR_CAMERA_IN_USE)
          && gestureCameraDevice != null) {
        retryingMainAfterClosingGesture = true;
        sendDebugEvent("🧩 Main blocked by concurrent use; closing gesture camera and retrying main");
        closeGestureCamera();
        if (backgroundHandler != null) {
          backgroundHandler.postDelayed(() -> {
            if (isActive && textureView.isAvailable()) {
              openCamera();
            }
          }, 250);
        }
      }
    }
  };

  private void createPreviewSession() {
    Log.d(TAG, "🎬 createPreviewSession() called");
    try {
      if (cameraDevice == null) {
        Log.e(TAG, "❌ cameraDevice is null");
        sendDebugEvent("❌ createPreviewSession: cameraDevice is null");
        return;
      }
      SurfaceTexture texture = textureView.getSurfaceTexture();
      if (texture == null) {
        Log.e(TAG, "❌ SurfaceTexture is null");
        sendDebugEvent("❌ createPreviewSession: SurfaceTexture is null");
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
          sendDebugEvent("✅ Main captureSession configured");
          startPreview();
        }

        @Override
        public void onConfigureFailed(@NonNull CameraCaptureSession session) {
          Log.e(TAG, "❌ CaptureSession configure failed");
          sendDebugEvent("❌ Main captureSession configure failed");
        }
      }, backgroundHandler);
    } catch (Exception e) {
      Log.e(TAG, "❌ createPreviewSession failed", e);
      sendDebugEvent("❌ createPreviewSession failed: " + e.getClass().getSimpleName());
    }
  }

  private void startPreview() {
    Log.d(TAG, "▶️ startPreview() called");
    try {
      if (captureSession == null || previewRequestBuilder == null) {
        Log.e(TAG, "❌ Cannot start preview: session or builder is null");
        sendDebugEvent("❌ startPreview: session/builder null");
        return;
      }
      captureSession.setRepeatingRequest(previewRequestBuilder.build(), null, backgroundHandler);
      Log.d(TAG, "✅ Preview started successfully");
      mainPreviewStarted = true;
      sendDebugEvent("✅ Preview started");
      maybeStartGestureCamera();
    } catch (Exception e) {
      Log.e(TAG, "❌ startPreview failed", e);
      sendDebugEvent("❌ startPreview failed: " + e.getClass().getSimpleName());
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
      // Always prefer FRONT for gesture.
      String cameraId = cachedFrontCameraId != null ? cachedFrontCameraId
          : findCameraIdByFacing(manager, mapFacing(CameraCharacteristics.LENS_FACING_FRONT));
      if (cameraId == null) {
        sendDebugEvent("❌ openGestureCamera: no front camera");
        return;
      }

      sendDebugEvent("🤚 Gesture cameraId: " + cameraId + " (desired=front)");

      // Pick a supported low-res YUV size for this camera.
      CameraCharacteristics c = manager.getCameraCharacteristics(cameraId);
      StreamConfigurationMap map = c.get(CameraCharacteristics.SCALER_STREAM_CONFIGURATION_MAP);
      Size analysisSize = null;
      if (map != null) {
        analysisSize = chooseClosestSize(map.getOutputSizes(ImageFormat.YUV_420_888), ANALYSIS_TARGET_WIDTH, ANALYSIS_TARGET_HEIGHT, 640, 480);
      }
      if (analysisSize == null) {
        analysisSize = new Size(640, 360);
      }
      cachedAnalysisSize = analysisSize;
      sendDebugEvent("🤚 Gesture analysis size: " + analysisSize.getWidth() + "x" + analysisSize.getHeight());

      analysisReader = ImageReader.newInstance(analysisSize.getWidth(), analysisSize.getHeight(), ImageFormat.YUV_420_888, 2);
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

  private void maybeStartGestureCamera() {
    if (!isActive) return;
    if (!gestureEnabled) return;
    if (!gestureStartRequested) return;
    // Important: on many devices, starting gesture(front) before main(back) can block the main camera -> black screen.
    if (!mainPreviewStarted) return;
    if (gestureCameraDevice != null || gestureCaptureSession != null) return;

    // Try regardless of concurrentSupported, but always report what framework says.
    if (concurrentChecked) {
      sendDebugEvent("🧩 maybeStartGestureCamera (framework concurrent=" + (concurrentSupported ? "supported" : "not_supported") + ")");
    }
    openGestureCamera();
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

      Log.d(TAG, "📷 Saving photo " + image.getWidth() + "x" + image.getHeight() + " format=" + image.getFormat());
      String path = saveJpegToAppStorage(image);
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
  private String saveJpegToAppStorage(@NonNull Image image) {
    File file = null;
    try {
      File storageDir = new File(getContext().getFilesDir(), "captured_photos");
      if (!storageDir.exists()) storageDir.mkdirs();
      file = new File(storageDir, "IMG_" + System.currentTimeMillis() + ".jpg");

      try (FileOutputStream fos = new FileOutputStream(file)) {
        ByteBuffer buffer = image.getPlanes()[0].getBuffer();
        byte[] bytes = new byte[buffer.remaining()];
        buffer.get(bytes);
        fos.write(bytes);
      }

      return file.getAbsolutePath();
    } catch (Exception e) {
      Log.e(TAG, "saveJpegToAppStorage failed", e);
      if (file != null && file.exists()) file.delete();
      return null;
    }
  }

  @Nullable
  private static String findCameraIdByFacing(@NonNull CameraManager manager, int facing) throws CameraAccessException {
    for (String id : manager.getCameraIdList()) {
      CameraCharacteristics c = manager.getCameraCharacteristics(id);
      Integer f = c.get(CameraCharacteristics.LENS_FACING);
      if (f != null && f == facing) return id;
    }
    return null;
  }

  private static boolean isConcurrentPairSupported(@NonNull CameraManager manager, @NonNull String idA, @NonNull String idB) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) return false;
    try {
      Set<Set<String>> groups = manager.getConcurrentCameraIds();
      if (groups == null) return false;
      for (Set<String> g : groups) {
        if (g != null && g.contains(idA) && g.contains(idB)) return true;
      }
      return false;
    } catch (Throwable t) {
      // Vendor implementations may throw; treat as unsupported but keep trying to open (we still attempt).
      return false;
    }
  }

  @Nullable
  private static Size chooseClosestSize(@Nullable Size[] sizes, int targetW, int targetH, int maxW, int maxH) {
    if (sizes == null || sizes.length == 0) return null;

    Size best = null;
    long bestScore = Long.MAX_VALUE;
    long targetArea = (long) targetW * (long) targetH;

    for (Size s : sizes) {
      if (s == null) continue;
      int w = s.getWidth();
      int h = s.getHeight();
      if (w <= 0 || h <= 0) continue;

      // Prefer sizes not exceeding the max (especially important under concurrency).
      boolean withinMax = (w <= maxW && h <= maxH);
      long area = (long) w * (long) h;
      long areaDiff = Math.abs(area - targetArea);
      long penalty = withinMax ? 0 : 10_000_000_000L; // big penalty if exceeds max
      long score = penalty + areaDiff;
      if (score < bestScore) {
        bestScore = score;
        best = s;
      }
    }
    return best;
  }

  @Nullable
  private static Size chooseJpegSize(@Nullable Size[] jpegSizes, @NonNull Size preview) {
    if (jpegSizes == null || jpegSizes.length == 0) return null;

    // Try to keep similar aspect ratio to reduce session configuration failures.
    double previewRatio = (double) preview.getWidth() / (double) preview.getHeight();
    Size best = null;
    long bestScore = Long.MAX_VALUE;

    for (Size s : jpegSizes) {
      if (s == null) continue;
      int w = s.getWidth();
      int h = s.getHeight();
      if (w <= 0 || h <= 0) continue;

      // Cap JPEG size for concurrency stability.
      boolean withinMax = (w <= 1920 && h <= 1080) || (w <= 1080 && h <= 1920);
      double ratio = (double) w / (double) h;
      double ratioDiff = Math.abs(ratio - previewRatio);

      long area = (long) w * (long) h;
      long targetArea = (long) Math.min(preview.getWidth(), 1920) * (long) Math.min(preview.getHeight(), 1080);
      long areaDiff = Math.abs(area - targetArea);

      long penalty = 0;
      // Strongly prefer matching ratio.
      if (ratioDiff > 0.05) penalty += 5_000_000_000L;
      // Prefer within max.
      if (!withinMax) penalty += 10_000_000_000L;

      long score = penalty + areaDiff;
      if (score < bestScore) {
        bestScore = score;
        best = s;
      }
    }
    return best;
  }

  private void closeGestureCamera() {
    try {
      if (gestureCaptureSession != null) {
        gestureCaptureSession.close();
        gestureCaptureSession = null;
      }
      if (gestureCameraDevice != null) {
        gestureCameraDevice.close();
        gestureCameraDevice = null;
      }
      if (analysisReader != null) {
        analysisReader.close();
        analysisReader = null;
      }
    } catch (Exception e) {
      Log.e(TAG, "closeGestureCamera failed", e);
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
      if (photoReader != null) {
        photoReader.close();
        photoReader = null;
      }
      closeGestureCamera();
    } catch (Exception e) {
      Log.e(TAG, "closeCamera failed", e);
    }
  }
}

