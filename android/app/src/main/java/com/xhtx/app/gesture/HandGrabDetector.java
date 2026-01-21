package com.xhtx.app.gesture;

import android.content.Context;
import android.graphics.Bitmap;
import android.media.Image;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.google.mediapipe.framework.image.BitmapImageBuilder;
import com.google.mediapipe.framework.image.MPImage;
import com.google.mediapipe.tasks.components.containers.NormalizedLandmark;
import com.google.mediapipe.tasks.core.BaseOptions;
import com.google.mediapipe.tasks.vision.core.RunningMode;
import com.google.mediapipe.tasks.vision.handlandmarker.HandLandmarker;
import com.google.mediapipe.tasks.vision.handlandmarker.HandLandmarkerResult;

import java.nio.ByteBuffer;
import java.util.List;

/**
 * Hand "grab" (fist) detector based on MediaPipe HandLandmarker.
 *
 * Notes:
 * - This class only detects a single gesture ("grab"): fist/close hand.
 * - It is designed for low-res analysis frames (e.g. 256x256) on CPU.
 * - Model file must exist in Android assets: "hand_landmarker.task"
 */
public final class HandGrabDetector {
  private static final String TAG = "HandGrabDetector";
  private static final String MODEL_ASSET_PATH = "hand_landmarker.task";

  public interface Listener {
    void onGrabState(boolean isGrab);
  }

  private final Context appContext;
  private final Listener listener;

  // MediaPipe
  @Nullable private HandLandmarker handLandmarker;

  public HandGrabDetector(@NonNull Context context, @NonNull Listener listener) {
    this.appContext = context.getApplicationContext();
    this.listener = listener;
  }

  public void start() {
    if (handLandmarker != null) return;
    try {
      BaseOptions baseOptions = BaseOptions.builder()
          .setModelAssetPath(MODEL_ASSET_PATH)
          .build();

      HandLandmarker.HandLandmarkerOptions options = HandLandmarker.HandLandmarkerOptions.builder()
          .setBaseOptions(baseOptions)
          .setRunningMode(RunningMode.LIVE_STREAM)
          .setNumHands(1)
          .setMinHandDetectionConfidence(0.5f)
          .setMinHandPresenceConfidence(0.5f)
          .setMinTrackingConfidence(0.5f)
          .setResultListener(this::onResult)
          .setErrorListener(e -> Log.e(TAG, "HandLandmarker error", e))
          .build();

      handLandmarker = HandLandmarker.createFromOptions(appContext, options);
      Log.d(TAG, "✅ HandLandmarker initialized");
    } catch (Throwable t) {
      Log.e(TAG, "❌ Failed to init HandLandmarker. Ensure assets/" + MODEL_ASSET_PATH + " exists.", t);
      handLandmarker = null;
    }
  }

  public void stop() {
    try {
      if (handLandmarker != null) {
        handLandmarker.close();
      }
    } catch (Throwable ignored) {
    } finally {
      handLandmarker = null;
    }
  }

  /**
   * Process a YUV_420_888 frame. This method copies the pixels into a Bitmap internally,
   * so caller should close {@link Image} after return.
   */
  public void process(@NonNull Image image, long timestampMs) {
    HandLandmarker landmarker = handLandmarker;
    if (landmarker == null) return;

    // Convert to Bitmap (small resolution recommended).
    Bitmap bmp = yuv420888ToBitmap(image);
    if (bmp == null) return;

    MPImage mpImage = new BitmapImageBuilder(bmp).build();
    try {
      landmarker.detectAsync(mpImage, timestampMs);
    } catch (Throwable t) {
      Log.e(TAG, "detectAsync failed", t);
    }
  }

  private void onResult(@NonNull HandLandmarkerResult result, @NonNull MPImage input) {
    try {
      List<List<NormalizedLandmark>> hands = result.landmarks();
      if (hands == null || hands.isEmpty()) {
        listener.onGrabState(false);
        return;
      }
      boolean fist = isFist(hands.get(0));
      listener.onGrabState(fist);
    } catch (Throwable t) {
      Log.e(TAG, "onResult failed", t);
    }
  }

  /**
   * Heuristic fist detection using landmark distance ratios (rotation-invariant).
   *
   * Indices (MediaPipe Hands):
   * - wrist: 0
   * - MCPs: 5,9,13,17
   * - tips: 8,12,16,20
   */
  private static boolean isFist(@NonNull List<NormalizedLandmark> lm) {
    if (lm.size() < 21) return false;

    NormalizedLandmark wrist = lm.get(0);
    int[] mcps = new int[]{5, 9, 13, 17};
    int[] tips = new int[]{8, 12, 16, 20};

    int folded = 0;
    for (int i = 0; i < 4; i++) {
      float mcpDist = dist(lm.get(mcps[i]), wrist);
      float tipDist = dist(lm.get(tips[i]), wrist);
      if (mcpDist < 1e-6f) continue;
      float ratio = tipDist / mcpDist;
      // Fist: tip not far from MCP. Open hand: tip much further away.
      if (ratio < 1.35f) folded++;
    }

    // Require at least 3/4 fingers folded for a "grab".
    return folded >= 3;
  }

  private static float dist(@NonNull NormalizedLandmark a, @NonNull NormalizedLandmark b) {
    float dx = a.x() - b.x();
    float dy = a.y() - b.y();
    return (float) Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Minimal YUV_420_888 -> Bitmap conversion for analysis frames.
   * Designed for small images; not optimized for large resolutions.
   */
  @Nullable
  private static Bitmap yuv420888ToBitmap(@NonNull Image image) {
    try {
      int width = image.getWidth();
      int height = image.getHeight();

      Image.Plane[] planes = image.getPlanes();
      ByteBuffer yBuffer = planes[0].getBuffer();
      ByteBuffer uBuffer = planes[1].getBuffer();
      ByteBuffer vBuffer = planes[2].getBuffer();

      int yRowStride = planes[0].getRowStride();
      int uvRowStride = planes[1].getRowStride();
      int uvPixelStride = planes[1].getPixelStride();

      int[] out = new int[width * height];
      int outIndex = 0;

      for (int y = 0; y < height; y++) {
        int yRowOffset = y * yRowStride;
        int uvRowOffset = (y / 2) * uvRowStride;
        for (int x = 0; x < width; x++) {
          int yIndex = yRowOffset + x;
          int uvIndex = uvRowOffset + (x / 2) * uvPixelStride;

          int Y = yBuffer.get(yIndex) & 0xFF;
          int U = (uBuffer.get(uvIndex) & 0xFF) - 128;
          int V = (vBuffer.get(uvIndex) & 0xFF) - 128;

          // YUV -> RGB
          int r = (int) (Y + 1.370705f * V);
          int g = (int) (Y - 0.337633f * U - 0.698001f * V);
          int b = (int) (Y + 1.732446f * U);

          r = clamp255(r);
          g = clamp255(g);
          b = clamp255(b);

          out[outIndex++] = 0xFF000000 | (r << 16) | (g << 8) | b;
        }
      }

      Bitmap bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888);
      bitmap.setPixels(out, 0, width, 0, 0, width, height);
      return bitmap;
    } catch (Throwable t) {
      Log.e(TAG, "yuv420888ToBitmap failed", t);
      return null;
    }
  }

  private static int clamp255(int v) {
    if (v < 0) return 0;
    if (v > 255) return 255;
    return v;
  }
}

