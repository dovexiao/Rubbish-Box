package com.xhtx.app;

import android.Manifest;
import android.app.Activity;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.provider.MediaStore;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.ImageFormat;
import android.graphics.Matrix;
import android.graphics.Rect;
import android.graphics.SurfaceTexture;
import android.graphics.YuvImage;
import android.hardware.camera2.CameraAccessException;
import android.hardware.camera2.CameraCaptureSession;
import android.hardware.camera2.CameraCharacteristics;
import android.hardware.camera2.CameraDevice;
import android.hardware.camera2.CameraManager;
import android.hardware.camera2.CameraMetadata;
import android.hardware.camera2.CaptureFailure;
import android.hardware.camera2.CaptureRequest;
import android.hardware.camera2.TotalCaptureResult;
import android.hardware.camera2.params.StreamConfigurationMap;
import android.media.Image;
import android.media.ImageReader;
import android.os.Bundle;
import android.os.Environment;
import android.os.Handler;
import android.os.HandlerThread;
import android.os.Looper;
import android.os.SystemClock;
import android.util.Log;
import android.util.Size;
import android.view.Surface;
import android.view.TextureView;
import android.view.View;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;

import com.xhtx.app.gesture.HandGrabDetector;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.text.SimpleDateFormat;
import java.io.FileOutputStream;
import java.nio.ByteBuffer;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Locale;

public class NativeCameraActivity extends Activity {
    private static final String TAG = "NativeCameraActivity";
    private static final int REQUEST_CAMERA_PERMISSION = 200;
    private static final int MAX_PHOTOS = 6;
    
    // Gesture auto-capture
    private static final int ANALYSIS_WIDTH = 256;
    private static final int ANALYSIS_HEIGHT = 256;
    private static final long GESTURE_PROCESS_INTERVAL_MS = 80; // ~12.5fps
    private static final long GRAB_EDGE_DEBOUNCE_MS = 300;
    private static final long GRAB_CONTINUOUS_INTERVAL_MS = 900;

    private TextureView textureView;
    private TextView tvTitle;
    private TextView tvHint;
    private Button btnCapture;
    private Button btnSubmit;
    private LinearLayout thumbnailContainer;

    private CameraDevice cameraDevice;
    private CameraCaptureSession captureSession;
    private CaptureRequest.Builder previewRequestBuilder;
    private Size previewSize = new Size(1280, 720);
    private ImageReader imageReader;
    private ImageReader analysisReader;

    private Handler backgroundHandler;
    private HandlerThread backgroundThread;

    private ArrayList<String> photoPaths = new ArrayList<>();
    private String cameraType;

    private HandGrabDetector handGrabDetector;
    private volatile boolean gestureEnabled = true;
    private volatile boolean isCapturing = false;
    private volatile boolean isGrabActive = false;
    private volatile long lastGestureProcessTime = 0;
    private volatile long lastGrabEdgeTime = 0;
    private volatile long lastAutoCaptureTime = 0;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // 设置全屏显示
        getWindow().setFlags(
            android.view.WindowManager.LayoutParams.FLAG_FULLSCREEN,
            android.view.WindowManager.LayoutParams.FLAG_FULLSCREEN
        );
        
        // 隐藏系统UI（状态栏、导航栏）
        getWindow().getDecorView().setSystemUiVisibility(
            android.view.View.SYSTEM_UI_FLAG_FULLSCREEN |
            android.view.View.SYSTEM_UI_FLAG_HIDE_NAVIGATION |
            android.view.View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY |
            android.view.View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN |
            android.view.View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION |
            android.view.View.SYSTEM_UI_FLAG_LAYOUT_STABLE
        );
        
        setContentView(R.layout.activity_native_camera);

        cameraType = getIntent().getStringExtra("type");
        // Optional: allow disabling gesture via intent extra (default true)
        if (getIntent() != null && getIntent().hasExtra("gestureEnabled")) {
            gestureEnabled = getIntent().getBooleanExtra("gestureEnabled", true);
        }

        initViews();
        updateUI();

        if (checkPermissions()) {
            // Permissions granted, will start camera in onResume
        } else {
            requestPermissions();
        }
    }

    private void initViews() {
        textureView = findViewById(R.id.texture_view);
        tvTitle = findViewById(R.id.tv_title);
        tvHint = findViewById(R.id.tv_hint);
        btnCapture = findViewById(R.id.btn_capture);
        btnSubmit = findViewById(R.id.btn_submit);
        thumbnailContainer = findViewById(R.id.thumbnail_container);

        String title = "composition".equals(cameraType) ? "AI作文批改" : "AI作业批改";
        tvTitle.setText(title);

        textureView.setSurfaceTextureListener(surfaceTextureListener);

        btnCapture.setOnClickListener(v -> takePhoto());
        btnSubmit.setOnClickListener(v -> submitPhotos());
        findViewById(R.id.btn_back).setOnClickListener(v -> {
            Log.d(TAG, "🚫 用户点击返回按钮");
            setResult(RESULT_CANCELED);
            
            // 使用静态回调通知取消
            try {
                NativeCameraModule.rejectWithError("E_PICKER_CANCELLED", "用户取消");
            } catch (Exception e) {
                Log.e(TAG, "❌ 静态回调失败", e);
            }
            
            finish();
        });

        // 动态设置九宫格线位置（需要在 layout 完成后）
        textureView.post(() -> setupGridLines());
    }

    private void setupGridLines() {
        int screenWidth = textureView.getWidth();
        int screenHeight = textureView.getHeight();

        View gridV1 = findViewById(R.id.grid_line_v1);
        View gridV2 = findViewById(R.id.grid_line_v2);
        View gridH1 = findViewById(R.id.grid_line_h1);
        View gridH2 = findViewById(R.id.grid_line_h2);

        // 垂直线（33%, 66%）
        gridV1.setX(screenWidth * 0.333f);
        gridV2.setX(screenWidth * 0.666f);

        // 水平线（33%, 66%）
        gridH1.setY(screenHeight * 0.333f);
        gridH2.setY(screenHeight * 0.666f);
    }

    private void updateUI() {
        Log.d(TAG, "📍 updateUI() 被调用，线程: " + Thread.currentThread().getName());
        
        int photoCount = photoPaths.size();
        Log.d(TAG, "📊 photoPaths.size() = " + photoCount);
        
        String tipPrefix = "composition".equals(cameraType) ? "把作文第" : "把作业第";
        String hintText = tipPrefix + (photoCount + 1) + "页对准屏幕中间，点击拍照";
        Log.d(TAG, "📝 设置提示文本: " + hintText);
        tvHint.setText(hintText);

        boolean captureEnabled = photoCount < MAX_PHOTOS;
        Log.d(TAG, "🎯 设置拍照按钮enabled: " + captureEnabled);
        btnCapture.setEnabled(captureEnabled);
        
        int submitVisibility = photoCount > 0 ? View.VISIBLE : View.GONE;
        Log.d(TAG, "👁️ 设置提交按钮visibility: " + (submitVisibility == View.VISIBLE ? "VISIBLE" : "GONE"));
        btnSubmit.setVisibility(submitVisibility);
        
        Log.d(TAG, "✅ updateUI 完成: 照片数量=" + photoCount + ", 拍照按钮enabled=" + captureEnabled + ", 提交按钮visible=" + (submitVisibility == View.VISIBLE));
    }

    /**
     * 添加缩略图（在后台线程加载图片，避免主线程阻塞）
     */
    private void addThumbnail(String photoPath) {
        // 在主线程创建视图
        View thumbnailView = getLayoutInflater().inflate(R.layout.item_thumbnail, thumbnailContainer, false);
        ImageView ivThumbnail = thumbnailView.findViewById(R.id.iv_thumbnail);
        TextView tvIndex = thumbnailView.findViewById(R.id.tv_index);
        View btnDelete = thumbnailView.findViewById(R.id.btn_delete);

        tvIndex.setText(String.valueOf(photoPaths.size()));

        btnDelete.setOnClickListener(v -> {
            int index = thumbnailContainer.indexOfChild(thumbnailView);
            photoPaths.remove(index);
            thumbnailContainer.removeView(thumbnailView);
            updateAllThumbnailIndexes();
            updateUI();
        });

        thumbnailContainer.addView(thumbnailView);

        // 在后台线程加载缩略图图片（避免主线程 ANR）
        new Thread(() -> {
            try {
                Bitmap bitmap = decodeSampledBitmapFromFile(photoPath, 100, 100);
                if (bitmap != null) {
                    runOnUiThread(() -> {
                        ivThumbnail.setImageBitmap(bitmap);
                    });
                }
            } catch (Exception e) {
                Log.e(TAG, "Failed to load thumbnail", e);
            }
        }).start();

        updateUI();
    }

    /**
     * 降采样加载 Bitmap，避免内存溢出和 ANR
     */
    private Bitmap decodeSampledBitmapFromFile(String photoPath, int reqWidth, int reqHeight) {
        // 首先获取图片尺寸
        final BitmapFactory.Options options = new BitmapFactory.Options();
        options.inJustDecodeBounds = true;
        BitmapFactory.decodeFile(photoPath, options);

        // 计算采样率
        options.inSampleSize = calculateInSampleSize(options, reqWidth, reqHeight);

        // 实际加载图片
        options.inJustDecodeBounds = false;
        return BitmapFactory.decodeFile(photoPath, options);
    }

    /**
     * 计算图片采样率
     */
    private int calculateInSampleSize(BitmapFactory.Options options, int reqWidth, int reqHeight) {
        final int height = options.outHeight;
        final int width = options.outWidth;
        int inSampleSize = 1;

        if (height > reqHeight || width > reqWidth) {
            final int halfHeight = height / 2;
            final int halfWidth = width / 2;

            while ((halfHeight / inSampleSize) >= reqHeight && (halfWidth / inSampleSize) >= reqWidth) {
                inSampleSize *= 2;
            }
        }

        return inSampleSize;
    }

    private void updateAllThumbnailIndexes() {
        for (int i = 0; i < thumbnailContainer.getChildCount(); i++) {
            View thumbnailView = thumbnailContainer.getChildAt(i);
            TextView tvIndex = thumbnailView.findViewById(R.id.tv_index);
            tvIndex.setText(String.valueOf(i + 1));
        }
    }

    private void submitPhotos() {
        Log.d(TAG, "📤 [submitPhotos] 开始提交照片");
        Log.d(TAG, "📤 [submitPhotos] 照片数量: " + photoPaths.size());
        Log.d(TAG, "📤 [submitPhotos] 当前线程: " + Thread.currentThread().getName());
        
        if (photoPaths.isEmpty()) {
            Log.e(TAG, "❌ [submitPhotos] 照片列表为空，无法提交");
            return;
        }
        
        // 打印所有照片路径并验证文件
        Log.d(TAG, "📋 [submitPhotos] ========== 验证照片文件 ==========");
        for (int i = 0; i < photoPaths.size(); i++) {
            String path = photoPaths.get(i);
            File file = new File(path);
            boolean exists = file.exists();
            long size = exists ? file.length() : 0;
            Log.d(TAG, String.format("📷 [submitPhotos] 照片[%d]: %s", i, path));
            Log.d(TAG, String.format("   ├─ 文件存在: %s", exists ? "✅ 是" : "❌ 否"));
            Log.d(TAG, String.format("   └─ 文件大小: %d bytes (%.2f MB)", size, size / 1024.0 / 1024.0));
        }
        Log.d(TAG, "📋 [submitPhotos] ========================================");
        
        // 通过 Intent 返回照片路径给 RN
        Log.d(TAG, "🔄 [submitPhotos] 准备返回结果给 RN (通过 Intent)");
        Intent resultIntent = new Intent();
        resultIntent.putStringArrayListExtra("photoPaths", photoPaths);
        setResult(RESULT_OK, resultIntent);
        Log.d(TAG, "✅ [submitPhotos] setResult(RESULT_OK) 已调用");
        
        // ✅ 使用静态回调（更可靠，避免 onActivityResult 丢失）
        try {
            Log.d(TAG, "🔄 [submitPhotos] 调用静态回调 NativeCameraModule.resolveWithPhotos");
            NativeCameraModule.resolveWithPhotos(photoPaths);
            Log.d(TAG, "✅ [submitPhotos] 静态回调成功");
        } catch (Exception e) {
            Log.e(TAG, "❌ [submitPhotos] 静态回调失败", e);
            e.printStackTrace();
        }
        
        // 关闭 Activity
        Log.d(TAG, "🚪 [submitPhotos] 准备关闭 Activity");
        Log.d(TAG, "🚪 [submitPhotos] Activity hashCode: " + this.hashCode());
        Log.d(TAG, "🚪 [submitPhotos] Task ID: " + getTaskId());
        Log.d(TAG, "🚪 [submitPhotos] isFinishing: " + isFinishing());
        
            finish();
        
        Log.d(TAG, "✅ [submitPhotos] finish() 已调用");
        Log.d(TAG, "✅ [submitPhotos] isFinishing: " + isFinishing());
        Log.d(TAG, "📤 [submitPhotos] ========== 提交流程完成 ==========");
    }

    private boolean checkPermissions() {
        return ActivityCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED;
    }

    private void requestPermissions() {
        ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.CAMERA}, REQUEST_CAMERA_PERMISSION);
    }

    @Override
    protected void onResume() {
        super.onResume();
        
        // 确保持续全屏
        getWindow().getDecorView().setSystemUiVisibility(
            android.view.View.SYSTEM_UI_FLAG_FULLSCREEN |
            android.view.View.SYSTEM_UI_FLAG_HIDE_NAVIGATION |
            android.view.View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY |
            android.view.View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN |
            android.view.View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION |
            android.view.View.SYSTEM_UI_FLAG_LAYOUT_STABLE
        );
        
        startBackgroundThread();
        // Init gesture detector (safe even if disabled)
        if (handGrabDetector == null) {
            handGrabDetector = new HandGrabDetector(this, this::onGrabStateChanged);
        }
        if (gestureEnabled) {
            handGrabDetector.start();
        }
        if (textureView != null && textureView.isAvailable()) {
            openCamera();
        }
    }
    
    @Override
    protected void onPause() {
        closeCamera();
        stopBackgroundThread();
        if (handGrabDetector != null) {
            handGrabDetector.stop();
        }
        super.onPause();
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == REQUEST_CAMERA_PERMISSION) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                if (textureView.isAvailable()) {
                    openCamera();
                }
            } else {
                Toast.makeText(this, "需要相机权限", Toast.LENGTH_SHORT).show();
                
                // 权限被拒绝，通知 RN
                try {
                    NativeCameraModule.rejectWithError("E_PERMISSION_DENIED", "相机权限被拒绝");
                } catch (Exception e) {
                    Log.e(TAG, "❌ 静态回调失败", e);
                }
                
                finish();
            }
        }
    }

    private final TextureView.SurfaceTextureListener surfaceTextureListener = new TextureView.SurfaceTextureListener() {
        @Override
        public void onSurfaceTextureAvailable(@NonNull SurfaceTexture surface, int width, int height) {
            Log.d(TAG, "onSurfaceTextureAvailable");
            openCamera();
        }

        @Override
        public void onSurfaceTextureSizeChanged(@NonNull SurfaceTexture surface, int width, int height) {
            Log.d(TAG, "onSurfaceTextureSizeChanged: " + width + "x" + height);
            configureTransform();
        }

        @Override
        public boolean onSurfaceTextureDestroyed(@NonNull SurfaceTexture surface) {
            return true;
        }

        @Override
        public void onSurfaceTextureUpdated(@NonNull SurfaceTexture surface) {
        }
    };

    private void openCamera() {
        if (!checkPermissions()) {
            return;
        }

        CameraManager manager = (CameraManager) getSystemService(Context.CAMERA_SERVICE);
        try {
            String[] cameraIds = manager.getCameraIdList();
            Log.d(TAG, "Available cameras: " + cameraIds.length);
            for (int i = 0; i < cameraIds.length; i++) {
                Log.d(TAG, "  Camera[" + i + "]: " + cameraIds[i]);
            }
            
            if (cameraIds.length == 0) {
                Toast.makeText(this, "没有找到相机", Toast.LENGTH_SHORT).show();
                return;
            }

            // 🔥 关键修复：使用 Camera 100（后置相机），与 Camera2 应用保持一致
            // Camera2 应用使用的就是 Camera 100，已验证能稳定工作
            String cameraId = "100"; // 与 Camera2 应用一致
            
            // 验证相机是否存在
            boolean cameraExists = false;
            for (String id : cameraIds) {
                if (id.equals(cameraId)) {
                    cameraExists = true;
                    break;
                }
            }
            
            if (!cameraExists) {
                // 如果Camera 100不存在，使用第一个可用的相机
                cameraId = cameraIds[0];
                Log.w(TAG, "Camera 100 not found, using fallback: " + cameraId);
            } else {
                Log.d(TAG, "Using Camera 100 (与 Camera2 应用一致)");
            }

            CameraCharacteristics characteristics = manager.getCameraCharacteristics(cameraId);
            StreamConfigurationMap map = characteristics.get(CameraCharacteristics.SCALER_STREAM_CONFIGURATION_MAP);
            if (map != null) {
                Size[] sizes = map.getOutputSizes(SurfaceTexture.class);
                if (sizes != null && sizes.length > 0) {
                    // 记录所有支持的分辨率
                    Log.d(TAG, "Supported resolutions:");
                    for (Size size : sizes) {
                        Log.d(TAG, "  - " + size.getWidth() + "x" + size.getHeight());
                    }
                    
                    // 检测相机类型和特性
                    Integer hardwareLevel = characteristics.get(CameraCharacteristics.INFO_SUPPORTED_HARDWARE_LEVEL);
                    int[] capabilities = characteristics.get(CameraCharacteristics.REQUEST_AVAILABLE_CAPABILITIES);
                    Log.d(TAG, "Camera hardware level: " + hardwareLevel);
                    Log.d(TAG, "Camera capabilities: " + (capabilities != null ? capabilities.length : 0));
                    
                    // 🔥 关键修复：参考可工作的代码，使用 YUV 格式可以支持更高分辨率
                    // 选择最大分辨率（2592x1944）以获得最佳图片质量
                    Size bestSize = null;
                    Log.d(TAG, "Selecting maximum resolution for best quality");
                    
                    // 选择最大分辨率
                        for (Size size : sizes) {
                        if (bestSize == null || 
                            (size.getWidth() * size.getHeight() > bestSize.getWidth() * bestSize.getHeight())) {
                                bestSize = size;
                            }
                    }
                    
                    // 兜底：如果没选到，使用第一个
                    if (bestSize == null && sizes.length > 0) {
                        bestSize = sizes[0];
                    }
                    
                    previewSize = bestSize;
                    Log.d(TAG, "Selected preview size: " + previewSize.getWidth() + "x" + previewSize.getHeight());
                }
            }

            // 🔥 关键修复：使用 YUV_420_888 格式，性能更好，支持更高分辨率
            imageReader = ImageReader.newInstance(previewSize.getWidth(), previewSize.getHeight(),
                    android.graphics.ImageFormat.YUV_420_888, 2);
            imageReader.setOnImageAvailableListener(onImageAvailableListener, backgroundHandler);

            // Low-res analysis stream for gesture detection (does NOT save photos)
            analysisReader = ImageReader.newInstance(ANALYSIS_WIDTH, ANALYSIS_HEIGHT,
                    android.graphics.ImageFormat.YUV_420_888, 2);
            analysisReader.setOnImageAvailableListener(onAnalysisImageAvailableListener, backgroundHandler);

            manager.openCamera(cameraId, stateCallback, backgroundHandler);
        } catch (CameraAccessException e) {
            Log.e(TAG, "openCamera failed", e);
        }
    }

    private final CameraDevice.StateCallback stateCallback = new CameraDevice.StateCallback() {
        @Override
        public void onOpened(@NonNull CameraDevice camera) {
            Log.d(TAG, "Camera opened");
            cameraDevice = camera;
            createPreviewSession();
        }

        @Override
        public void onDisconnected(@NonNull CameraDevice camera) {
            Log.d(TAG, "Camera disconnected");
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

    /**
     * 配置 TextureView 的变换矩阵，防止预览画面变形
     * 使用简单的居中缩放，确保画面正确显示
     */
    private void configureTransform() {
        if (textureView == null || previewSize == null) {
            return;
        }
        
        int viewWidth = textureView.getWidth();
        int viewHeight = textureView.getHeight();
        
        if (viewWidth == 0 || viewHeight == 0) {
            return;
        }

        Log.d(TAG, "Configuring transform - View: " + viewWidth + "x" + viewHeight + 
                ", Preview: " + previewSize.getWidth() + "x" + previewSize.getHeight());

        // 横屏模式下，直接按比例缩放填充
        float previewAspect = (float) previewSize.getWidth() / previewSize.getHeight();
        float viewAspect = (float) viewWidth / viewHeight;
        
        float scaleX = 1f;
        float scaleY = 1f;
        
        if (previewAspect > viewAspect) {
            // 预览更宽，按高度缩放
            scaleY = viewAspect / previewAspect;
        } else {
            // 预览更高，按宽度缩放
            scaleX = previewAspect / viewAspect;
        }
        
        Log.d(TAG, "Scale factors - X: " + scaleX + ", Y: " + scaleY);
        
        Matrix matrix = new Matrix();
        matrix.setScale(scaleX, scaleY, viewWidth / 2f, viewHeight / 2f);
        
        textureView.setTransform(matrix);
        Log.d(TAG, "Transform configured successfully");
    }

    private void createPreviewSession() {
        try {
            SurfaceTexture texture = textureView.getSurfaceTexture();
            if (texture == null) {
                return;
            }

            texture.setDefaultBufferSize(previewSize.getWidth(), previewSize.getHeight());
            Surface previewSurface = new Surface(texture);

            previewRequestBuilder = cameraDevice.createCaptureRequest(CameraDevice.TEMPLATE_PREVIEW);
            previewRequestBuilder.addTarget(previewSurface);
            if (analysisReader != null) {
                previewRequestBuilder.addTarget(analysisReader.getSurface());
            }
            previewRequestBuilder.set(CaptureRequest.CONTROL_MODE, CameraMetadata.CONTROL_MODE_AUTO);

            List<Surface> outputs = new ArrayList<>();
            outputs.add(previewSurface);
            if (imageReader != null) outputs.add(imageReader.getSurface());
            if (analysisReader != null) outputs.add(analysisReader.getSurface());

            cameraDevice.createCaptureSession(outputs,
                    new CameraCaptureSession.StateCallback() {
                        @Override
                        public void onConfigured(@NonNull CameraCaptureSession session) {
                            if (cameraDevice == null) {
                            return;
                            }
                            Log.d(TAG, "CaptureSession configured");
                            captureSession = session;
                            try {
                                captureSession.setRepeatingRequest(previewRequestBuilder.build(), null, backgroundHandler);
                                // 配置 TextureView 变换，防止画面变形
                                runOnUiThread(() -> configureTransform());
                            } catch (CameraAccessException e) {
                                Log.e(TAG, "Failed to start preview", e);
                            }
                        }

                        @Override
                        public void onConfigureFailed(@NonNull CameraCaptureSession session) {
                            Log.e(TAG, "CaptureSession configure failed");
                        }
                    }, backgroundHandler);
        } catch (CameraAccessException e) {
            Log.e(TAG, "createPreviewSession failed", e);
        }
    }

    private void takePhoto() {
        if (cameraDevice == null || photoPaths.size() >= MAX_PHOTOS) {
            return;
        }
        if (isCapturing) {
            Log.d(TAG, "📸 takePhoto skipped: already capturing");
            return;
        }
        isCapturing = true;

        // 禁用拍照按钮，防止重复点击
        runOnUiThread(() -> {
            btnCapture.setEnabled(false);
            btnCapture.setAlpha(0.5f);
        });

        try {
            // 🔥 关键修复：参考可工作的代码，拍照前先停止预览
            Log.d(TAG, "📸 停止预览，准备拍照...");
            captureSession.stopRepeating();
            
            CaptureRequest.Builder captureBuilder = cameraDevice.createCaptureRequest(CameraDevice.TEMPLATE_STILL_CAPTURE);
            captureBuilder.addTarget(imageReader.getSurface());
            captureBuilder.set(CaptureRequest.CONTROL_MODE, CameraMetadata.CONTROL_MODE_AUTO);
            // 设置JPEG方向
            captureBuilder.set(CaptureRequest.JPEG_ORIENTATION, 0);

            captureSession.capture(captureBuilder.build(), new CameraCaptureSession.CaptureCallback() {
                @Override
                public void onCaptureCompleted(@NonNull CameraCaptureSession session, @NonNull CaptureRequest request, @NonNull TotalCaptureResult result) {
                    Log.d(TAG, "📸 Photo captured, restarting preview...");
                    
                    // 🔥 关键修复：拍照完成后，重新启动预览
                    startPreview();
                    isCapturing = false;
                    
                    new Handler(getMainLooper()).postDelayed(() -> {
                        if (photoPaths.size() < MAX_PHOTOS) {
                            btnCapture.setEnabled(true);
                            btnCapture.setAlpha(1.0f);
                            Log.d(TAG, "✅ 拍照按钮已重新启用");
                        }
                    }, 300);
                }
                
                @Override
                public void onCaptureFailed(@NonNull CameraCaptureSession session, @NonNull CaptureRequest request, @NonNull CaptureFailure failure) {
                    Log.e(TAG, "❌ 拍照失败: " + failure.getReason());
                    // 拍照失败，也要恢复预览
                    startPreview();
                    isCapturing = false;
                    runOnUiThread(() -> {
                        btnCapture.setEnabled(true);
                        btnCapture.setAlpha(1.0f);
                        Toast.makeText(NativeCameraActivity.this, "拍照失败，请重试", Toast.LENGTH_SHORT).show();
                    });
                }
            }, backgroundHandler);
        } catch (CameraAccessException e) {
            Log.e(TAG, "takePhoto failed", e);
            // 发生错误时重新启用按钮并恢复预览
            startPreview();
            isCapturing = false;
            runOnUiThread(() -> {
                btnCapture.setEnabled(true);
                btnCapture.setAlpha(1.0f);
            });
        }
    }
    
    /**
     * 启动预览
     */
    private void startPreview() {
        if (cameraDevice == null || captureSession == null || previewRequestBuilder == null) {
            Log.w(TAG, "startPreview: camera not ready");
            return;
        }
        
        try {
            captureSession.setRepeatingRequest(previewRequestBuilder.build(), null, backgroundHandler);
            Log.d(TAG, "✅ Preview restarted");
        } catch (CameraAccessException e) {
            Log.e(TAG, "Failed to restart preview", e);
        }
    }

    private final ImageReader.OnImageAvailableListener onAnalysisImageAvailableListener = reader -> {
        if (!gestureEnabled || handGrabDetector == null) return;

        Image image = null;
        try {
            image = reader.acquireLatestImage();
            if (image == null) return;

            long now = SystemClock.uptimeMillis();
            if (now - lastGestureProcessTime < GESTURE_PROCESS_INTERVAL_MS) {
                return;
            }
            lastGestureProcessTime = now;

            // Copy to Bitmap internally, so we can close Image immediately after return.
            handGrabDetector.process(image, now);
        } catch (Exception e) {
            Log.e(TAG, "onAnalysisImageAvailableListener failed", e);
        } finally {
            if (image != null) image.close();
        }
    };

    private void onGrabStateChanged(boolean isGrab) {
        // Called from MediaPipe result thread.
        long now = SystemClock.uptimeMillis();

        if (!isGrab) {
            isGrabActive = false;
            return;
        }

        // Grab detected
        if (!isGrabActive) {
            // Rising edge
            if (now - lastGrabEdgeTime >= GRAB_EDGE_DEBOUNCE_MS) {
                lastGrabEdgeTime = now;
                lastAutoCaptureTime = 0;
                triggerAutoCapture(now);
            }
            isGrabActive = true;
            return;
        }

        // Continuous hold -> continuous capture
        if (now - lastAutoCaptureTime >= GRAB_CONTINUOUS_INTERVAL_MS) {
            triggerAutoCapture(now);
        }
    }

    private void triggerAutoCapture(long now) {
        if (photoPaths.size() >= MAX_PHOTOS) return;
        if (isCapturing) return;

        lastAutoCaptureTime = now;
        runOnUiThread(() -> {
            try {
                Log.d(TAG, "🤏 Gesture grab -> auto capture");
                takePhoto();
            } catch (Exception e) {
                Log.e(TAG, "triggerAutoCapture failed", e);
            }
        });
    }

    private final ImageReader.OnImageAvailableListener onImageAvailableListener = reader -> {
        // 在新线程中处理图片保存，避免阻塞相机线程
        new Thread(() -> {
        Image image = null;
        try {
            image = reader.acquireLatestImage();
            if (image != null) {
                    Log.d(TAG, "📸 Image available, format: " + image.getFormat());
                    
                    // 检查照片数量限制
                    if (photoPaths.size() >= MAX_PHOTOS) {
                        Log.w(TAG, "Photo limit reached: " + MAX_PHOTOS);
                        runOnUiThread(() -> {
                            Toast.makeText(NativeCameraActivity.this, "最多只能拍摄" + MAX_PHOTOS + "张照片", Toast.LENGTH_SHORT).show();
                        });
                        return;
                    }

                    // 🔥 关键内存优化：直接将 Image 对象传递给 save 方法，避免中间 byte[] 分配
                    String photoPath = saveToAppStorage(image);
                    
                    if (photoPath != null) {
                        photoPaths.add(photoPath);
                        final int currentCount = photoPaths.size();
                        
                        Log.d(TAG, "📸 Photo saved to app storage: " + photoPath + " (total: " + currentCount + ")");
                        
                        // 异步更新UI和加载缩略图
                        runOnUiThread(() -> {
                            try {
                            updateUI();
                                addThumbnail(photoPath);
                            } catch (Exception e) {
                                Log.e(TAG, "❌ UI 更新异常", e);
                            }
                        });
                    } else {
                        Log.e(TAG, "Failed to save photo");
                        runOnUiThread(() -> {
                            Toast.makeText(NativeCameraActivity.this, "保存失败", Toast.LENGTH_SHORT).show();
                    });
                }
            }
        } finally {
            if (image != null) {
                image.close();
            }
        }
        }).start();
    };
    
    /**
     * 保存照片到应用私有目录 (内存优化版)
     * 直接从 Image -> YuvImage -> FileOutputStream，避免中间 byte[] 分配
     */
    private String saveToAppStorage(Image image) {
        File file = null;
        try {
            // 获取 YUV 数据
            ByteBuffer yBuffer = image.getPlanes()[0].getBuffer();
            ByteBuffer uBuffer = image.getPlanes()[1].getBuffer();
            ByteBuffer vBuffer = image.getPlanes()[2].getBuffer();

            int ySize = yBuffer.remaining();
            int uSize = uBuffer.remaining();
            int vSize = vBuffer.remaining();

            // 这里的 nv21 数组仍然需要分配，但我们省去了后面的 ByteArrayOutputStream
            // 如果要进一步优化，可以复用这个 buffer (ThreadLocal)
            byte[] nv21 = new byte[ySize + uSize + vSize];

            // Y
            yBuffer.get(nv21, 0, ySize);
            // U and V are swapped
            vBuffer.get(nv21, ySize, vSize);
            uBuffer.get(nv21, ySize + vSize, uSize);

            // 转换为 YuvImage
            YuvImage yuvImage = new YuvImage(
                    nv21,
                    ImageFormat.NV21,
                    image.getWidth(),
                    image.getHeight(),
                    null
            );

            // 创建文件
            File storageDir = new File(getFilesDir(), "captured_photos");
            if (!storageDir.exists()) {
                if (!storageDir.mkdirs()) {
                    Log.e(TAG, "❌ 无法创建目录: " + storageDir.getAbsolutePath());
                    storageDir = getCacheDir();
                }
            }
            
            String fileName = "IMG_" + System.currentTimeMillis() + ".jpg";
            file = new File(storageDir, fileName);
            
            // 直接压缩到文件流
            try (FileOutputStream fos = new FileOutputStream(file)) {
                yuvImage.compressToJpeg(
                        new Rect(0, 0, image.getWidth(), image.getHeight()),
                        90,  // JPEG 质量 90%
                        fos
                );
            }
            
            Log.d(TAG, "✅ 文件已保存: " + file.getAbsolutePath());
            return file.getAbsolutePath();
            
        } catch (Exception e) {
            Log.e(TAG, "❌ 保存文件失败", e);
            if (file != null && file.exists()) {
                file.delete();
            }
            return null;
        }
    }

    /**
     * 保存照片到应用私有目录
     * 不需要权限，RN可直接读取
     */
    private String saveToAppStorage(byte[] bytes) {
        try {
            // 🔥 关键修复：改用内部存储 getFilesDir()，避免 External Storage 的权限问题
            // 路径示例: /data/user/0/com.xhtx.app.dev/files/captured_photos/
            File storageDir = new File(getFilesDir(), "captured_photos");
            
            if (!storageDir.exists()) {
                if (!storageDir.mkdirs()) {
                    Log.e(TAG, "❌ 无法创建目录: " + storageDir.getAbsolutePath());
                    // 如果创建失败，尝试使用缓存目录
                    storageDir = getCacheDir();
                }
            }
            
            // 使用时间戳作为文件名
            String fileName = "IMG_" + System.currentTimeMillis() + ".jpg";
            File file = new File(storageDir, fileName);
            
            FileOutputStream fos = new FileOutputStream(file);
            fos.write(bytes);
            fos.close();
            
            Log.d(TAG, "✅ 文件已保存: " + file.getAbsolutePath());
            return file.getAbsolutePath();
        } catch (IOException e) {
            Log.e(TAG, "❌ 保存文件失败", e);
            return null;
        }
    }

    private void startBackgroundThread() {
        backgroundThread = new HandlerThread("CameraBackground");
        backgroundThread.start();
        backgroundHandler = new Handler(backgroundThread.getLooper());
    }

    private void stopBackgroundThread() {
        if (backgroundThread != null) {
            backgroundThread.quitSafely();
            try {
                backgroundThread.join();
                backgroundThread = null;
                backgroundHandler = null;
            } catch (InterruptedException e) {
                Log.e(TAG, "stopBackgroundThread interrupted", e);
            }
        }
    }

    private void closeCamera() {
        if (captureSession != null) {
            captureSession.close();
            captureSession = null;
        }
        if (cameraDevice != null) {
            cameraDevice.close();
            cameraDevice = null;
        }
        if (imageReader != null) {
            imageReader.close();
            imageReader = null;
        }
        if (analysisReader != null) {
            analysisReader.close();
            analysisReader = null;
        }
    }
}