package com.xhtx.app;

import android.Manifest;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Matrix;
import android.graphics.SurfaceTexture;
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
import android.os.Bundle;
import android.os.Environment;
import android.os.Handler;
import android.os.HandlerThread;
import android.os.Looper;
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

import java.io.File;
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

    private Handler backgroundHandler;
    private HandlerThread backgroundThread;

    private ArrayList<String> photoPaths = new ArrayList<>();
    private String cameraType;

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
            setResult(RESULT_CANCELED);
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
        int photoCount = photoPaths.size();
        String tipPrefix = "composition".equals(cameraType) ? "把作文第" : "把作业第";
        tvHint.setText(tipPrefix + (photoCount + 1) + "页对准屏幕中间，点击拍照");

        btnCapture.setEnabled(photoCount < MAX_PHOTOS);
        btnSubmit.setVisibility(photoCount > 0 ? View.VISIBLE : View.GONE);
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
        Intent resultIntent = new Intent();
        resultIntent.putStringArrayListExtra("photoPaths", photoPaths);
        setResult(RESULT_OK, resultIntent);
        
        // 延迟关闭Activity，给React Native足够时间处理跳转
        // 避免Activity立即关闭导致系统自动返回到MainActivity
        new Handler(Looper.getMainLooper()).postDelayed(() -> {
            finish();
        }, 500); // 延迟500ms关闭
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
        if (textureView != null && textureView.isAvailable()) {
            openCamera();
        }
    }
    
    @Override
    protected void onPause() {
        closeCamera();
        stopBackgroundThread();
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

            // 使用Camera 120（后置相机，性能更好，帧率30fps）
            // 原来使用的Camera 122（前置相机，只有5-10fps，在Android 14上资源释放有问题）
            String cameraId = "120"; // 直接指定使用性能更好的相机
            
            // 验证相机是否存在
            boolean cameraExists = false;
            for (String id : cameraIds) {
                if (id.equals(cameraId)) {
                    cameraExists = true;
                    break;
                }
            }
            
            if (!cameraExists) {
                // 如果Camera 120不存在，使用第一个可用的相机
                cameraId = cameraIds[0];
                Log.w(TAG, "Camera 120 not found, using fallback: " + cameraId);
            } else {
                Log.d(TAG, "Using Camera 120 (30fps, better performance)");
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
                    
                    // 判断是否为USB相机（通常hardware level为LIMITED或LEGACY）
                    boolean isUSBCamera = (hardwareLevel != null && 
                        (hardwareLevel == CameraCharacteristics.INFO_SUPPORTED_HARDWARE_LEVEL_LIMITED ||
                         hardwareLevel == CameraCharacteristics.INFO_SUPPORTED_HARDWARE_LEVEL_LEGACY));
                    
                    // 根据相机类型选择合适的分辨率
                    Size bestSize = null;
                    if (isUSBCamera || cameraId.equals("120") || cameraId.equals("122")) {
                        // USB相机或外接相机：使用1920x1080（平衡清晰度和性能）
                        Log.d(TAG, "Detected USB/External camera, selecting 1920x1080");
                        for (Size size : sizes) {
                            if (size.getWidth() == 1920 && size.getHeight() == 1080) {
                                bestSize = size;
                                break;
                            }
                        }
                        // 如果没有1920x1080，选择最接近的分辨率（限制在1920以内）
                        if (bestSize == null) {
                            int targetArea = 1920 * 1080;
                            int minDiff = Integer.MAX_VALUE;
                            for (Size size : sizes) {
                                if (size.getWidth() <= 1920 && size.getHeight() <= 1080) {
                                    int area = size.getWidth() * size.getHeight();
                                    int diff = Math.abs(area - targetArea);
                                    if (diff < minDiff) {
                                        minDiff = diff;
                                        bestSize = size;
                                    }
                                }
                            }
                            // 如果没有小于等于1920x1080的，选择最小的
                            if (bestSize == null) {
                                bestSize = sizes[0];
                                for (Size size : sizes) {
                                    if (size.getWidth() * size.getHeight() < bestSize.getWidth() * bestSize.getHeight()) {
                                        bestSize = size;
                                    }
                                }
                            }
                        }
                    } else {
                        // 普通相机：选择最大分辨率
                        Log.d(TAG, "Detected standard camera, selecting maximum resolution");
                        for (Size size : sizes) {
                            if (bestSize == null || size.getWidth() * size.getHeight() > bestSize.getWidth() * bestSize.getHeight()) {
                                bestSize = size;
                            }
                        }
                    }
                    
                    // 兜底：如果还没选到，使用中等分辨率
                    if (bestSize == null) {
                        bestSize = sizes[sizes.length / 2];
                    }
                    
                    previewSize = bestSize;
                    Log.d(TAG, "Selected preview size: " + previewSize.getWidth() + "x" + previewSize.getHeight());
                }
            }

            imageReader = ImageReader.newInstance(previewSize.getWidth(), previewSize.getHeight(),
                    android.graphics.ImageFormat.JPEG, 2);
            imageReader.setOnImageAvailableListener(onImageAvailableListener, backgroundHandler);

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
            previewRequestBuilder.set(CaptureRequest.CONTROL_MODE, CameraMetadata.CONTROL_MODE_AUTO);

            cameraDevice.createCaptureSession(Arrays.asList(previewSurface, imageReader.getSurface()),
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

        // 禁用拍照按钮，防止重复点击
        runOnUiThread(() -> {
            btnCapture.setEnabled(false);
            btnCapture.setAlpha(0.5f);
        });

        try {
            CaptureRequest.Builder captureBuilder = cameraDevice.createCaptureRequest(CameraDevice.TEMPLATE_STILL_CAPTURE);
            captureBuilder.addTarget(imageReader.getSurface());
            captureBuilder.set(CaptureRequest.CONTROL_MODE, CameraMetadata.CONTROL_MODE_AUTO);

            captureSession.capture(captureBuilder.build(), new CameraCaptureSession.CaptureCallback() {
                @Override
                public void onCaptureCompleted(@NonNull CameraCaptureSession session, @NonNull CaptureRequest request, @NonNull TotalCaptureResult result) {
                    Log.d(TAG, "Photo captured");
                    // Resume preview
                    try {
                        captureSession.setRepeatingRequest(previewRequestBuilder.build(), null, backgroundHandler);
                    } catch (CameraAccessException e) {
                        Log.e(TAG, "Failed to resume preview", e);
                    }
                    
                    // 延迟1秒后重新启用按钮（等待图片保存完成）
                    new Handler(getMainLooper()).postDelayed(() -> {
                        if (photoPaths.size() < MAX_PHOTOS) {
                            btnCapture.setEnabled(true);
                            btnCapture.setAlpha(1.0f);
                        }
                    }, 1000);
                }
            }, backgroundHandler);
        } catch (CameraAccessException e) {
            Log.e(TAG, "takePhoto failed", e);
            // 发生错误时重新启用按钮
            runOnUiThread(() -> {
                btnCapture.setEnabled(true);
                btnCapture.setAlpha(1.0f);
            });
        }
    }

    private final ImageReader.OnImageAvailableListener onImageAvailableListener = reader -> {
        Image image = null;
        try {
            image = reader.acquireLatestImage();
            if (image != null) {
                ByteBuffer buffer = image.getPlanes()[0].getBuffer();
                byte[] bytes = new byte[buffer.remaining()];
                buffer.get(bytes);

                String fileName = "IMG_" + new SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(new Date()) + ".jpg";
                File photoFile = new File(getExternalFilesDir(Environment.DIRECTORY_PICTURES), fileName);

                try (FileOutputStream output = new FileOutputStream(photoFile)) {
                    output.write(bytes);
                    String photoPath = photoFile.getAbsolutePath();
                    
                    // 检查照片数量限制，防止快速点击导致超过限制
                    if (photoPaths.size() < MAX_PHOTOS) {
                        photoPaths.add(photoPath);
                        final int currentCount = photoPaths.size();
                        
                        Log.d(TAG, "Photo saved: " + photoPath + " (total: " + currentCount + ")");
                        
                        // 异步更新UI和加载缩略图，避免阻塞
                        runOnUiThread(() -> {
                            // Toast.makeText(this, "拍照成功 (" + currentCount + "/" + MAX_PHOTOS + ")", Toast.LENGTH_SHORT).show();
                            updateUI();
                            addThumbnail(photoPath);  // addThumbnail内部会在后台线程加载图片
                        });
                    } else {
                        // 超过限制，删除刚保存的照片
                        photoFile.delete();
                        Log.w(TAG, "Photo limit reached, deleted: " + photoPath);
                        runOnUiThread(() -> {
                            Toast.makeText(this, "最多只能拍摄" + MAX_PHOTOS + "张照片", Toast.LENGTH_SHORT).show();
                        });
                    }
                } catch (Exception e) {
                    Log.e(TAG, "Failed to save photo", e);
                    runOnUiThread(() -> {
                        Toast.makeText(this, "保存照片失败", Toast.LENGTH_SHORT).show();
                    });
                }
            }
        } finally {
            if (image != null) {
                image.close();
            }
        }
    };

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
    }
}