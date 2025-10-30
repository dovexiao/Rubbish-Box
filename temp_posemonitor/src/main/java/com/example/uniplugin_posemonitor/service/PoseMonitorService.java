package com.example.uniplugin_posemonitor.service;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.BroadcastReceiver;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.content.res.AssetFileDescriptor;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.PixelFormat;
import android.graphics.PorterDuff;
import android.graphics.PorterDuffXfermode;
import android.graphics.Paint;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.Binder;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.Vibrator;
import android.os.VibrationEffect;
import android.speech.tts.TextToSpeech;
import android.util.Log;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.SurfaceHolder;
import android.view.SurfaceView;
import android.view.View;
import android.view.WindowManager;
import android.widget.FrameLayout;
import android.widget.TextView;
import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;
import com.example.uniplugin_posemonitor.R;
import com.example.uniplugin_posemonitor.model.PoseData;
import com.example.uniplugin_posemonitor.PoseMonitorModule;
import com.example.uniplugin_posemonitor.view.PoseOverlayView;
import java.io.IOException;
import java.util.Date;
import java.util.Locale;
import java.text.SimpleDateFormat;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import android.media.Image;
import java.util.Map;
import java.util.HashMap;
import org.json.JSONObject;
import android.content.pm.PackageManager;
import android.Manifest;

public class PoseMonitorService extends Service {
    private static final String TAG = "PoseMonitorService";
    private static final int NOTIFICATION_ID = 1;
    private static final String CHANNEL_ID = "PoseMonitorChannel";
    private static final String PREF_NAME = "PoseMonitorPrefs";
    private static final String KEY_TOTAL_TIME = "total_correct_posture_time";
    private static final String KEY_LAST_DATE = "last_date";
    // 控制浮窗显示/隐藏的开关
    private static final boolean SHOW_FLOATING_WINDOW =  false;

    // 添加回调接口
    public interface PoseDetectionCallback {
        void onPoseDetected(PoseData poseData);
    }

    private static PoseDetectionCallback poseDetectionCallback;

    public static void setPoseDetectionCallback(PoseDetectionCallback callback) {
        poseDetectionCallback = callback;
    }

    // 添加Binder类用于绑定服务
    public class PoseMonitorBinder extends Binder {
        public PoseMonitorService getService() {
            return PoseMonitorService.this;
        }

        // 提供直接访问服务方法的接口
        public void setCallback(PoseDetectionCallback callback) {
            setPoseDetectionCallback(callback);
        }

        public boolean isMonitoring() {
            return PoseMonitorService.this.isMonitoring;
        }

        public void stopMonitoring() {
            PoseMonitorService.this.stopMonitoring();
        }
    }

    private PoseMonitorBinder binder = new PoseMonitorBinder();
    private boolean isBound = false;

    private CameraManager cameraManager;
    private PoseDetector poseDetector;
    private WindowManager windowManager;
    private View floatingView;
    private SurfaceView previewView;
    private PoseOverlayView overlayView;
    private boolean isGoodPosture = true;
    private long lastWarningTime = 0;
    private static final long WARNING_INTERVAL = 30000; // 30秒
    private static final long REST_INTERVAL = 45 * 60000; // 45分钟
    private long lastRestTime = 0;
    private Vibrator vibrator;
    private long correctPostureStartTime = 0;
    private long totalCorrectPostureTime = 0;
    private boolean isInCorrectPosture = false;
    private boolean isMonitoring = false;
    private String currentStatus = "unknown";
    private Bitmap bufferBitmap;
    private Canvas bufferCanvas;
    private boolean isDrawing = false;
    private final Object drawLock = new Object();
    private boolean isSurfaceReady = false;
    private boolean isShuttingDown = false;
    private boolean isPreviewAddedToWindow = false;
    private boolean isScreenOn = true;
    private BroadcastReceiver screenReceiver;
    private boolean drawEnabled = true;
    private PoseData pendingPoseData = null;

    // 添加一个MediaPlayer实例用于播放音频
    private MediaPlayer mediaPlayer;

    private Handler restHandler;
    private Runnable restRunnable;

    private ExecutorService poseProcessExecutor;
    private Handler mainHandler;
    private final Object processLock = new Object();
    private volatile boolean isProcessing = false;
    private String lastStatus = "unknown";
    private long statusStartTime = 0;
    private long lastUpdateTime = 0;
    private Map<String, Long> statusDurations = new HashMap<>();

    // 回调接口
    public interface StatusCallback {
        void onStatusUpdate(JSONObject status);
    }

    private StatusCallback callback;

    public void setStatusCallback(StatusCallback callback) {
        this.callback = callback;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();

        // 检查并请求必要的权限
        if (!checkRequiredPermissions()) {
            Log.e(TAG, "缺少必要权限，服务无法正常运行");
            stopSelf();
            return;
        }

        startForeground(NOTIFICATION_ID, createNotification());

        // 测试音频文件访问
        testAudioFiles();

        // 初始化震动服务
        vibrator = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);

        // 加载统计数据
        loadStatistics();

        // 初始化休息提醒定时器
        restHandler = new Handler(Looper.getMainLooper());
        restRunnable = new Runnable() {
            @Override
            public void run() {
                if (isMonitoring) {
                    // Log.d(TAG, "Rest interval reached, playing rest reminder");
                    playAudioResource("rest_reminder");
                    vibrate(800);
                    // 安排下一次提醒
                    restHandler.postDelayed(this, REST_INTERVAL);
                }
            }
        };

        // 初始化检测器和相机管理器
        try {
            // Log.d(TAG, "Initializing pose detector and camera manager");
            poseDetector = new PoseDetector(this);
            cameraManager = new CameraManager(this);

            // 设置姿态检测器到相机管理器
            cameraManager.setPoseDetector(poseDetector);
            // Log.d(TAG, "Pose detector and camera manager initialized");

            // 设置姿态检测回调
            poseDetector.setCallback(this::onPoseDetected);
            // Log.d(TAG, "Pose detection callback set");

            // 初始化窗口管理器
            windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);

            // 初始化悬浮窗（如果启用）
            if (SHOW_FLOATING_WINDOW) {
                initFloatingWindow();
                // Log.d(TAG, "Floating window initialized");
            } else {
                // 创建一个透明的SurfaceView用于摄像头预览
                previewView = new SurfaceView(this);

                // 设置SurfaceView的布局参数
                WindowManager.LayoutParams params = new WindowManager.LayoutParams(
                        640, 480, // 使用标准预览尺寸
                        WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
                        WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE
                                | WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE
                                | WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS
                                | WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
                        PixelFormat.TRANSLUCENT);
                params.gravity = Gravity.TOP | Gravity.START;
                params.x = 0;
                params.y = 0;
                params.alpha = 0.0f; // 完全透明

                // 将SurfaceView添加到窗口管理器
                try {
                    if (!isPreviewAddedToWindow) {
                    windowManager.addView(previewView, params);
                        isPreviewAddedToWindow = true;
                        // Log.d(TAG, "Transparent SurfaceView added to window manager");
                    }
                } catch (Exception e) {
                    // Log.e(TAG, "Error adding transparent SurfaceView to window manager", e);
                }

                // 设置Surface回调
                previewView.getHolder().addCallback(new SurfaceHolder.Callback() {
                    @Override
                    public void surfaceCreated(SurfaceHolder holder) {
                        // Log.d(TAG, "Surface created (transparent mode)");
                        isSurfaceReady = true;
                        if (holder != null && holder.getSurface() != null && cameraManager != null) {
                            cameraManager.setPreviewSurface(holder.getSurface());
                            // 延迟启动预览，确保Surface完全准备好
                            new Handler(Looper.getMainLooper()).postDelayed(() -> {
                                if (cameraManager != null) {
                                    cameraManager.startPreview();
                                    // Log.d(TAG, "Camera preview started in hidden mode");
                                }
                            }, 100);
                        }
                    }

                    @Override
                    public void surfaceChanged(SurfaceHolder holder, int format, int width, int height) {
                        // Log.d(TAG, "Surface changed (transparent mode): " + width + "x" + height);
                    }

                    @Override
                    public void surfaceDestroyed(SurfaceHolder holder) {
                        // Log.d(TAG, "Surface destroyed (transparent mode)");
                        isSurfaceReady = false;
                        stopCameraPreview();
                    }
                });
                // Log.d(TAG, "Transparent preview surface initialized");
            }

            // 启动监控
            startMonitoring();
            // Log.d(TAG, "Monitoring started");

            // 初始化线程池和Handler
            poseProcessExecutor = Executors.newSingleThreadExecutor();
            mainHandler = new Handler(Looper.getMainLooper());

            // 初始化状态时长统计
            statusDurations.put("good", 0L);
            statusDurations.put("shoulders_not_level", 0L);
            statusDurations.put("head_not_centered", 0L);
            statusDurations.put("head_not_up", 0L);
            statusDurations.put("detecting", 0L);
            statusDurations.put("total", 0L);

            // 初始化时间戳
            statusStartTime = System.currentTimeMillis();
            lastUpdateTime = statusStartTime;

            // 注册屏幕开关广播，控制相机停启
            registerScreenReceiver();
        } catch (Exception e) {
            // Log.e(TAG, "Error in onCreate", e);
            stopSelf();
        }
    }

    private void registerScreenReceiver() {
        try {
            if (screenReceiver != null) return;
            screenReceiver = new BroadcastReceiver() {
                @Override
                public void onReceive(Context context, Intent intent) {
                    if (intent == null || intent.getAction() == null) return;
                    String action = intent.getAction();
                    // Log.d(TAG, "Screen receiver action: " + action);
                    if (Intent.ACTION_SCREEN_OFF.equals(action)) {
                        // 仅记录屏灭，不主动关闭相机；等待亮屏后自动恢复
                        isScreenOn = false;
                        drawEnabled = false; // 暂停浮层绘制，避免 lockCanvas 报错
                    } else if (Intent.ACTION_SCREEN_ON.equals(action) || Intent.ACTION_USER_PRESENT.equals(action)) {
                        isScreenOn = true;
                        drawEnabled = true;
                        // 确保预览视图已附着
                        ensurePreviewAttached();
                        scheduleRestartPreview(0);
                    }
                }
            };

            IntentFilter f = new IntentFilter();
            f.addAction(Intent.ACTION_SCREEN_OFF);
            f.addAction(Intent.ACTION_SCREEN_ON);
            f.addAction(Intent.ACTION_USER_PRESENT);
            registerReceiver(screenReceiver, f);
        } catch (Exception e) {
            // Log.w(TAG, "Failed to register screen receiver", e);
        }
    }

    private boolean isViewAttached(View v) {
        return v != null && v.getWindowToken() != null;
    }

    private void ensurePreviewAttached() {
        try {
            if (SHOW_FLOATING_WINDOW) {
                if (floatingView == null || !isViewAttached(floatingView) || previewView == null) {
                    initFloatingWindow();
                }
            } else {
                if (previewView == null) {
                    previewView = new SurfaceView(this);
                    WindowManager.LayoutParams params = new WindowManager.LayoutParams(
                            640, 480,
                            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
                            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE
                                    | WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE
                                    | WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS
                                    | WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
                            PixelFormat.TRANSLUCENT);
                    params.gravity = Gravity.TOP | Gravity.START;
                    params.x = 0; params.y = 0; params.alpha = 0.0f;
                    if (!isPreviewAddedToWindow && windowManager != null) {
                        windowManager.addView(previewView, params);
                        isPreviewAddedToWindow = true;
                    }
                    previewView.getHolder().addCallback(new SurfaceHolder.Callback() {
                        @Override public void surfaceCreated(SurfaceHolder holder) { isSurfaceReady = true; }
                        @Override public void surfaceChanged(SurfaceHolder holder, int format, int width, int height) {}
                        @Override public void surfaceDestroyed(SurfaceHolder holder) { isSurfaceReady = false; }
                    });
                } else if (!isViewAttached(previewView) && windowManager != null && !isPreviewAddedToWindow) {
                    // 视图存在但未附着，重新添加
                    WindowManager.LayoutParams params = new WindowManager.LayoutParams(
                            640, 480,
                            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
                            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE
                                    | WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE
                                    | WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS
                                    | WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
                            PixelFormat.TRANSLUCENT);
                    params.gravity = Gravity.TOP | Gravity.START;
                    params.x = 0; params.y = 0; params.alpha = 0.0f;
                    windowManager.addView(previewView, params);
                    isPreviewAddedToWindow = true;
                }
            }
        } catch (Exception ignore) {}
    }

    private void unregisterScreenReceiver() {
        try {
            if (screenReceiver != null) {
                unregisterReceiver(screenReceiver);
                screenReceiver = null;
            }
        } catch (Exception e) {
            // Log.w(TAG, "Failed to unregister screen receiver", e);
        }
    }

    private void scheduleRestartPreview(long delayMs) {
        if (!isScreenOn || isShuttingDown) return;
        new Handler(Looper.getMainLooper()).postDelayed(() -> {
            if (!isScreenOn || isShuttingDown) return;
            if (!isSurfaceReady || previewView == null || previewView.getHolder() == null || previewView.getHolder().getSurface() == null || !previewView.getHolder().getSurface().isValid()) {
                ensurePreviewAttached();
                scheduleRestartPreview(500);
                return;
            }
            try {
                if (cameraManager == null) {
                    cameraManager = new CameraManager(this);
                    if (poseDetector == null) poseDetector = new PoseDetector(this);
                    cameraManager.setPoseDetector(poseDetector);
                }
                cameraManager.setPreviewSurface(previewView.getHolder().getSurface());
                cameraManager.startPreview();
            } catch (Exception e) {
                scheduleRestartPreview(800);
            }
        }, delayMs);
    }

    // 检查必要权限
    private boolean checkRequiredPermissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            // Android 14+ 需要检查前台服务相机权限
            if (checkSelfPermission(Manifest.permission.FOREGROUND_SERVICE_CAMERA) != PackageManager.PERMISSION_GRANTED) {
                // Log.e(TAG, "缺少 FOREGROUND_SERVICE_CAMERA 权限");
                return false;
            }

            // 检查相机权限
            if (checkSelfPermission(Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
                // Log.e(TAG, "缺少 CAMERA 权限");
                return false;
            }
        } else {
            // Android 13及以下版本只需要相机权限
            if (checkSelfPermission(Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
                // Log.e(TAG, "缺少 CAMERA 权限");
                return false;
            }
        }

        return true;
    }

    private void initFloatingWindow() {
        // Log.d(TAG, "Initializing floating window");
        LayoutInflater inflater = LayoutInflater.from(this);
        floatingView = inflater.inflate(R.layout.floating_window, null);

        // 设置预览视图
        previewView = new SurfaceView(this);

        // 设置Surface回调
        previewView.getHolder().addCallback(new SurfaceHolder.Callback() {
            @Override
            public void surfaceCreated(SurfaceHolder holder) {
                // Log.d(TAG, "Surface created (floating window mode)");
                isSurfaceReady = true;
                if (holder != null && holder.getSurface() != null && cameraManager != null) {
                    cameraManager.setPreviewSurface(holder.getSurface());
                    // 延迟启动预览，确保Surface完全准备好
                    new Handler(Looper.getMainLooper()).postDelayed(() -> {
                        if (cameraManager != null) {
                            cameraManager.startPreview();
                            // Log.d(TAG, "Camera preview started in floating window mode");
                        }
                    }, 100);
                }
            }

            @Override
            public void surfaceChanged(SurfaceHolder holder, int format, int width, int height) {
                // Log.d(TAG, "Surface changed (floating window mode): " + width + "x" + height);
                if (overlayView != null) {
                    overlayView.setPreviewSize(width, height);
                }
            }

            @Override
            public void surfaceDestroyed(SurfaceHolder holder) {
                // Log.d(TAG, "Surface destroyed (floating window mode)");
                isSurfaceReady = false;
                stopCameraPreview();
            }
        });

        // 创建OverlayView
        overlayView = new PoseOverlayView(this);
        overlayView.setBackgroundColor(Color.TRANSPARENT);

        // 设置OverlayView的布局参数
        FrameLayout.LayoutParams overlayParams = new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT);
        overlayView.setLayoutParams(overlayParams);

        // 将预览视图和OverlayView添加到悬浮窗
        FrameLayout previewContainer = floatingView.findViewById(R.id.preview_container);
        if (previewContainer != null) {
            previewContainer.addView(previewView);
            previewContainer.addView(overlayView);
        } else {
            // Log.e(TAG, "Preview container not found in layout");
        }

        WindowManager.LayoutParams params = new WindowManager.LayoutParams(
                WindowManager.LayoutParams.WRAP_CONTENT,
                WindowManager.LayoutParams.WRAP_CONTENT,
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
                PixelFormat.TRANSLUCENT);
        params.gravity = Gravity.TOP | Gravity.CENTER_HORIZONTAL;
        params.y = 100;

        try {
            windowManager.addView(floatingView, params);
            floatingView.setVisibility(View.VISIBLE);
            // Log.d(TAG, "Floating window added and set to VISIBLE");

            // 立即更新悬浮窗状态
            updateFloatingWindow();
        } catch (Exception e) {
            // Log.e(TAG, "Error adding floating window", e);
        }
    }

    // 其他方法保持不变...
    private void initBuffer(int width, int height) {
        if (width <= 0 || height <= 0) {
            // Log.e(TAG, "Invalid buffer dimensions: " + width + "x" + height);
            return;
        }

        if (bufferBitmap != null) {
            bufferBitmap.recycle();
        }
        try {
            bufferBitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888);
            bufferCanvas = new Canvas(bufferBitmap);
            // Log.d(TAG, "Buffer initialized: " + width + "x" + height);
        } catch (Exception e) {
            // Log.e(TAG, "Error creating buffer", e);
        }
    }

    private void vibrate(long milliseconds) {
        if (vibrator != null && vibrator.hasVibrator()) {
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    // 使用最大振幅 (255) 来获得最强震动
                    vibrator.vibrate(VibrationEffect.createOneShot(milliseconds, 255));
                } else {
                    vibrator.vibrate(milliseconds);
                }
            } catch (Exception e) {
                // Log.e(TAG, "Error vibrating", e);
            }
        }
    }

    private void onPoseDetected(PoseData poseData) {
        // 前置摄像头镜像处理
        poseData.mirrorKeypoints();
        // H5风格多条件组合+多帧判定
        poseData.updateStatusH5Like();
        String currentStatus = poseData.getStatus();
        // Log.d(TAG, "Pose detected, status: " + currentStatus + ", isPersonDetected: " + poseData.isPersonDetected());

        // 首先回调给 Module
        if (poseDetectionCallback != null) {
            poseDetectionCallback.onPoseDetected(poseData);
        } else {
            // Log.e(TAG, "poseDetectionCallback is null");
        }

        // 获取当前姿态是否良好
        boolean currentFrameIsGoodPosture = poseData.isGoodPosture();
        // Log.d(TAG, "Current frame is good posture: " + currentFrameIsGoodPosture);

        long currentTime = System.currentTimeMillis();

        // 轻量级统计：只在状态变化时更新
        if (currentFrameIsGoodPosture != isInCorrectPosture) {
            // Log.d(TAG, "Posture state changed from " + isInCorrectPosture + " to " + currentFrameIsGoodPosture);
            if (currentFrameIsGoodPosture) {
                correctPostureStartTime = currentTime;
            } else {
                if (correctPostureStartTime > 0) {
                    totalCorrectPostureTime += (currentTime - correctPostureStartTime);
                    // Log.d(TAG, "Added " + (currentTime - correctPostureStartTime) + "ms to total correct posture time");
                    saveStatistics(); // 只在累计时间时保存
                }
            }
            isInCorrectPosture = currentFrameIsGoodPosture;
        }

        // 3. 姿态语音和震动反馈
        if (currentTime - lastWarningTime > WARNING_INTERVAL) {
            // Log.d(TAG, "Warning interval reached, checking posture, status: " + currentStatus + ", isPersonDetected: "
            //         + poseData.isPersonDetected());

            // 首先检查是否检测到人
            if (poseData.isPersonDetected()) {
                if (currentFrameIsGoodPosture) {
                    if (!isGoodPosture) {
                        // Log.d(TAG, "Posture improved, playing good posture audio");
                        playAudioResource("good_posture");
                        isGoodPosture = true;
                        lastWarningTime = currentTime;
                    }
                } else {
                    // Log.d(TAG, "Bad posture detected, playing specific audio for: " + currentStatus);
                    if (currentStatus.equals("shoulders_not_level")) {
                        playAudioResource("shoulders_not_level");
                    } else if (currentStatus.equals("head_not_centered")) {
                        playAudioResource("head_not_centered");
                    } else if (currentStatus.equals("head_not_up")) {
                        playAudioResource("head_not_up");
                    } else {
                        playAudioResource("adjust_posture");
                    }
                    vibrate(500);
                    isGoodPosture = false;
                    lastWarningTime = currentTime;
                }
            } else {
                // 检测不到人时，不播放任何音频，不震动
                // Log.d(TAG, "未检测到人，跳过音频播放和震动");
            }
        }

        // 更新UI显示
        this.currentStatus = currentStatus;
        if (isShuttingDown) return;
        if (SHOW_FLOATING_WINDOW) {
            updateFloatingWindow();
            if (overlayView != null) {
                overlayView.setPoseData(poseData);
            }
            drawPoseKeypoints(poseData);
        }
    }

    private void drawPoseKeypoints(PoseData poseData) {
        if (isShuttingDown) return;
        if (previewView == null || previewView.getHolder() == null) {
            // Log.e(TAG, "Preview view or holder is null");
            return;
        }

        SurfaceHolder holder = previewView.getHolder();
        if (holder == null || holder.getSurface() == null || !holder.getSurface().isValid() || !isSurfaceReady) {
            // Log.e(TAG, "Surface is not valid");
            return;
        }

        // 确保在UI线程中执行
        new Handler(Looper.getMainLooper()).post(() -> {
            synchronized (drawLock) {
                if (isDrawing) {
                    // Log.d(TAG, "Skip drawing, previous frame still processing");
                    return;
                }
                isDrawing = true;
            }

            try {
                if (isShuttingDown) return;
                if (previewView == null) return;
                int width = previewView.getWidth();
                int height = previewView.getHeight();

                if (width <= 0 || height <= 0) {
                    // Log.e(TAG, "Invalid preview dimensions: " + width + "x" + height);
                    return;
                }

                // Log.d(TAG, "drawPoseKeypoints called, size: " + width + "x" + height);
                poseData.setPreviewSize(width, height);

                // 初始化或更新缓冲区
                if (bufferBitmap == null || bufferBitmap.getWidth() != width || bufferBitmap.getHeight() != height) {
                    initBuffer(width, height);
                }

                if (bufferBitmap == null || bufferCanvas == null) {
                    // Log.e(TAG, "Buffer not initialized");
                    return;
                }

                // 清除缓冲区
                bufferCanvas.drawColor(Color.TRANSPARENT, PorterDuff.Mode.CLEAR);

                // 在缓冲区上绘制
                Paint paint = new Paint();
                paint.setColor(Color.RED);
                paint.setStyle(Paint.Style.FILL);

                // 1. 绘制所有关键点
                for (int i = 0; i < PoseData.NUM_KEYPOINTS; i++) {
                    PoseData.KeyPoint kp = poseData.getKeyPoint(i);
                    if (kp != null && kp.confidence > 0.1f) {
                        float x = kp.x * width;
                        float y = kp.y * height;
                        bufferCanvas.drawCircle(x, y, 10f, paint);
                    }
                }

                // 2. 绘制骨架连线
                paint.setColor(Color.YELLOW);
                paint.setStrokeWidth(5f);
                drawSkeleton(bufferCanvas, poseData, paint);

                // 3. 高亮肩膀连线
                PoseData.KeyPoint leftShoulder = poseData.getKeyPoint(PoseData.LEFT_SHOULDER);
                PoseData.KeyPoint rightShoulder = poseData.getKeyPoint(PoseData.RIGHT_SHOULDER);
                if (leftShoulder != null && rightShoulder != null &&
                        leftShoulder.confidence > 0.1f && rightShoulder.confidence > 0.1f) {
                    paint.setColor(Color.RED);
                    paint.setStrokeWidth(6f);
                    float x1 = leftShoulder.x * width;
                    float y1 = leftShoulder.y * height;
                    float x2 = rightShoulder.x * width;
                    float y2 = rightShoulder.y * height;
                    bufferCanvas.drawLine(x1, y1, x2, y2, paint);
                }

                // 4. 高亮头部连线
                PoseData.KeyPoint nose = poseData.getKeyPoint(PoseData.NOSE);
                if (nose != null && leftShoulder != null && rightShoulder != null &&
                        nose.confidence > 0.1f) {
                    paint.setColor(Color.BLUE);
                    paint.setStrokeWidth(6f);
                    float xNose = nose.x * width;
                    float yNose = nose.y * height;
                    float xShoulderMid = (leftShoulder.x + rightShoulder.x) / 2 * width;
                    float yShoulderMid = (leftShoulder.y + rightShoulder.y) / 2 * height;
                    bufferCanvas.drawLine(xNose, yNose, xShoulderMid, yShoulderMid, paint);
                }

                // 将缓冲区内容复制到Surface
                Canvas surfaceCanvas = null;
                try {
                    if (isShuttingDown) return;
                    if (holder == null || holder.getSurface() == null || !holder.getSurface().isValid()) return;
                    surfaceCanvas = holder.lockCanvas();
                    if (surfaceCanvas != null) {
                        surfaceCanvas.drawBitmap(bufferBitmap, 0, 0, null);
                    }
                } catch (IllegalArgumentException e) {
                    // Log.e(TAG, "IllegalArgumentException locking canvas, skip frame", e);
                    return;
                } catch (Exception e) {
                    // Log.e(TAG, "Error drawing to surface", e);
                } finally {
                    if (surfaceCanvas != null) {
                        try {
                            holder.unlockCanvasAndPost(surfaceCanvas);
                        } catch (Exception e) {
                            // Log.e(TAG, "Error posting canvas", e);
                        }
                    }
                }
            } catch (Exception e) {
                // Log.e(TAG, "Error in drawPoseKeypoints", e);
            } finally {
                synchronized (drawLock) {
                    isDrawing = false;
                }
            }
        });
    }

    private void drawSkeleton(Canvas canvas, PoseData poseData, Paint paint) {
        // 定义骨架连接关系
        int[][] connections = {
                // 头部连接
                { PoseData.NOSE, PoseData.LEFT_EYE },
                { PoseData.NOSE, PoseData.RIGHT_EYE },
                { PoseData.LEFT_EYE, PoseData.LEFT_EAR },
                { PoseData.RIGHT_EYE, PoseData.RIGHT_EAR },

                // 躯干连接
                { PoseData.LEFT_SHOULDER, PoseData.RIGHT_SHOULDER },
                { PoseData.LEFT_SHOULDER, PoseData.LEFT_HIP },
                { PoseData.RIGHT_SHOULDER, PoseData.RIGHT_HIP },
                { PoseData.LEFT_HIP, PoseData.RIGHT_HIP },

                // 左臂连接
                { PoseData.LEFT_SHOULDER, PoseData.LEFT_ELBOW },
                { PoseData.LEFT_ELBOW, PoseData.LEFT_WRIST },

                // 右臂连接
                { PoseData.RIGHT_SHOULDER, PoseData.RIGHT_ELBOW },
                { PoseData.RIGHT_ELBOW, PoseData.RIGHT_WRIST },

                // 左腿连接
                { PoseData.LEFT_HIP, PoseData.LEFT_KNEE },
                { PoseData.LEFT_KNEE, PoseData.LEFT_ANKLE },

                // 右腿连接
                { PoseData.RIGHT_HIP, PoseData.RIGHT_KNEE },
                { PoseData.RIGHT_KNEE, PoseData.RIGHT_ANKLE }
        };

        int width = canvas.getWidth();
        int height = canvas.getHeight();

        // 绘制所有骨架连接
        for (int[] connection : connections) {
            PoseData.KeyPoint point1 = poseData.getKeyPoint(connection[0]);
            PoseData.KeyPoint point2 = poseData.getKeyPoint(connection[1]);

            if (point1 != null && point2 != null &&
                    point1.confidence > 0.1f && point2.confidence > 0.1f) {
                float x1 = point1.x * width;
                float y1 = point1.y * height;
                float x2 = point2.x * width;
                float y2 = point2.y * height;
                canvas.drawLine(x1, y1, x2, y2, paint);
            }
        }
    }

    private void updateFloatingWindow() {
        if (floatingView == null) {
            return;
        }

        // Log.d(TAG, "Updating floating window, status: " + currentStatus);
        Handler mainHandler = new Handler(Looper.getMainLooper());
        mainHandler.post(() -> {
            TextView textView = floatingView.findViewById(R.id.status_text);
            TextView statsView = floatingView.findViewById(R.id.stats_text);
            if (textView != null) {
                // Log.d(TAG, "Updating status text to: " + currentStatus);
                switch (currentStatus) {
                    case "good":
                        textView.setText("坐姿正确，继续保持");
                        textView.setBackgroundResource(R.drawable.good_posture_bg);
                        break;
                    case "shoulders_not_level":
                        textView.setText("请保持肩膀放松，不要耸肩");
                        textView.setBackgroundResource(R.drawable.bad_posture_bg);
                        break;
                    case "head_not_centered":
                        textView.setText("请保持头部居中，不要歪头");
                        textView.setBackgroundResource(R.drawable.bad_posture_bg);
                        break;
                    case "head_not_up":
                        textView.setText("请抬头挺胸，保持正确坐姿");
                        textView.setBackgroundResource(R.drawable.bad_posture_bg);
                        break;
                    case "no_person":
                        textView.setText("未检测到人，请确保人在画面中");
                        textView.setBackgroundResource(R.drawable.bad_posture_bg);
                        break;
                    case "detecting":
                        textView.setText("正在检测坐姿...");
                        textView.setBackgroundResource(R.drawable.bad_posture_bg);
                        break;
                    default:
                        textView.setText("请调整坐姿，保持正确姿势");
                        textView.setBackgroundResource(R.drawable.bad_posture_bg);
                        break;
                }
                textView.setVisibility(View.VISIBLE);
                textView.bringToFront();
            } else {
                // Log.e(TAG, "Status text view is null");
            }

            // 更新统计信息
            if (statsView != null) {
                long currentTime = System.currentTimeMillis();
                if (isInCorrectPosture) {
                    totalCorrectPostureTime += (currentTime - correctPostureStartTime);
                    correctPostureStartTime = currentTime;
                    // 定期保存统计数据
                    saveStatistics();
                }

                long totalMinutes = totalCorrectPostureTime / (60 * 1000);
                long hours = totalMinutes / 60;
                long minutes = totalMinutes % 60;

                String statsText = String.format("今日正确坐姿: %d小时%d分钟", hours, minutes);
                statsView.setText(statsText);
                statsView.setVisibility(View.VISIBLE);
                statsView.bringToFront();
            } else {
                // Log.e(TAG, "Stats text view is null");
            }

            floatingView.setVisibility(View.VISIBLE);
            // Log.d(TAG, "Floating window updated and set to VISIBLE");
        });
    }

    public void playAudioResource(String audioId) {
        if (mediaPlayer != null) {
            try {
                if (mediaPlayer.isPlaying()) {
                    mediaPlayer.stop();
                }
            } catch (Exception e) {
                Log.e(TAG, "Error stopping MediaPlayer", e);
            }
            mediaPlayer.release();
            mediaPlayer = null;
        }

        final String audioFileName; // 将变量声明为final
        // 根据audioId查找对应的文件名
        switch (audioId) {
            case "rest_reminder": // 休息提醒语音
                audioFileName = "rest_reminder.mp3";
                break;
            case "good_posture":
                audioFileName = "good_posture.mp3";
                break;
            case "shoulders_not_level":
                audioFileName = "shoulders_not_level.mp3";
                break;
            case "head_not_centered":
                audioFileName = "head_not_centered.mp3";
                break;
            case "head_not_up":
                audioFileName = "head_not_up.mp3";
                break;
            case "adjust_posture":
                audioFileName = "adjust_posture.mp3";
                break;
            default:
                Log.w(TAG, "Unknown audioId: " + audioId + ". No audio file found.");
                return;
        }

        if (audioFileName != null) {
            // Log.d(TAG, "Playing audio file: " + audioFileName);
            try {
                AssetFileDescriptor afd = getAssets().openFd(audioFileName);
                mediaPlayer = new MediaPlayer();
                mediaPlayer.setDataSource(afd.getFileDescriptor(), afd.getStartOffset(), afd.getLength());
                afd.close();

                mediaPlayer.prepare();
                mediaPlayer.setOnCompletionListener(mp -> {
                    mp.release();
                    mediaPlayer = null;
                    // Log.d(TAG, "Audio playback completed: " + audioFileName);
                });
                mediaPlayer.setOnErrorListener((mp, what, extra) -> {
                    // Log.e(TAG, "MediaPlayer error: what=" + what + ", extra=" + extra);
                    mp.release();
                    mediaPlayer = null;
                    return true;
                });

                mediaPlayer.start();
                // Log.d(TAG, "Started playing: " + audioFileName);

            } catch (Exception e) {
                // Log.e(TAG, "Error playing audio: " + audioFileName, e);
                if (mediaPlayer != null) {
                    mediaPlayer.release();
                    mediaPlayer = null;
                }
            }
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Log.d(TAG, "Service onStartCommand called");
        if (!isMonitoring) {
            startMonitoring();
        }
        // 保持常驻（进程存活时），亮屏可自动恢复
        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        Log.d(TAG, "PoseMonitorService onDestroy");
        isShuttingDown = true;

        // 停止监控
        stopMonitoring();

        // 停止休息提醒
        if (restHandler != null && restRunnable != null) {
            restHandler.removeCallbacks(restRunnable);
        }

        // 关闭线程池
        if (poseProcessExecutor != null) {
            poseProcessExecutor.shutdown();
            try {
                if (!poseProcessExecutor.awaitTermination(1000, TimeUnit.MILLISECONDS)) {
                    poseProcessExecutor.shutdownNow();
                }
            } catch (InterruptedException e) {
                poseProcessExecutor.shutdownNow();
            }
        }

        // 释放相机资源
        if (cameraManager != null) {
            try {
                cameraManager.safeClose();
                cameraManager = null;
                Log.d(TAG, "相机资源已释放");
            } catch (Exception e) {
                Log.e(TAG, "释放相机资源时出错", e);
            }
        }

        // 释放检测器资源
        if (poseDetector != null) {
            try {
                poseDetector.close();
                poseDetector = null;
                Log.d(TAG, "检测器资源已释放");
            } catch (Exception e) {
                Log.e(TAG, "释放检测器资源时出错", e);
            }
        }

        // 移除悬浮窗
        if (floatingView != null && windowManager != null) {
            try {
                if (floatingView.getWindowToken() != null) {
                windowManager.removeView(floatingView);
                }
                floatingView = null;
                Log.d(TAG, "悬浮窗已移除");
            } catch (Exception e) {
                Log.e(TAG, "移除悬浮窗时出错", e);
            }
        }

        // 移除透明预览窗口
        if (previewView != null && windowManager != null) {
            try {
                if (previewView.getWindowToken() != null) {
                windowManager.removeView(previewView);
                }
                previewView = null;
                Log.d(TAG, "预览窗口已移除");
            } catch (Exception e) {
                Log.e(TAG, "移除预览窗口时出错", e);
            }
        }

        // 释放MediaPlayer
        if (mediaPlayer != null) {
            try {
                if (mediaPlayer.isPlaying()) {
                    mediaPlayer.stop();
                }
                mediaPlayer.release();
                mediaPlayer = null;
                Log.d(TAG, "MediaPlayer已释放");
            } catch (Exception e) {
                Log.e(TAG, "释放MediaPlayer时出错", e);
            }
        }

        // 保存统计数据
        saveStatistics();

        // 清除回调
        poseDetectionCallback = null;

        // 重置绑定状态
        isBound = false;

        // 注销屏幕广播
        unregisterScreenReceiver();

        Log.d(TAG, "服务销毁完成");
    }

    private void stopMonitoring() {
        isMonitoring = false;

        // 停止相机预览
        if (cameraManager != null) {
            try {
                // 使用安全关闭方法
                cameraManager.safeClose();
                Log.d(TAG, "相机预览已安全停止");
            } catch (Exception e) {
                Log.e(TAG, "停止相机预览时出错", e);
            }
        }

        Log.d(TAG, "监控已停止");

        // 检查是否需要停止服务
        stopServiceIfNeeded();
    }

    private void stopServiceIfNeeded() {
        // 只有在没有绑定客户端时才停止服务
        if (!isBound) {
            Log.d(TAG, "No bound clients, stopping service");
            stopSelf();
        } else {
            Log.d(TAG, "Service still bound, keeping service alive");
        }
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        Log.d(TAG, "Service bound");
        isBound = true;
        return binder;
    }

    @Override
    public boolean onUnbind(Intent intent) {
        Log.d(TAG, "Service unbound");
        isBound = false;
        // 保持前台服务存活，等待亮屏/用户回到前台后自动恢复
        return false; // 不允许重新绑定时调用onRebind
    }

    private void startMonitoring() {
        if (!isMonitoring) {
            isMonitoring = true;
            // 启动休息提醒定时器
            restHandler.postDelayed(restRunnable, REST_INTERVAL);
            Log.d(TAG, "Started pose monitoring and rest reminder timer");
        }
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Pose Monitor Service",
                    NotificationManager.IMPORTANCE_LOW);
            channel.setDescription("Background service for pose monitoring");
            NotificationManager manager = getSystemService(NotificationManager.class);
            manager.createNotificationChannel(channel);
        }
    }

    private Notification createNotification() {
        Intent notificationIntent = new Intent(this, PoseMonitorModule.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(
                this, 0, notificationIntent, PendingIntent.FLAG_IMMUTABLE);

        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("姿态监测")
                .setContentText("正在监测您的坐姿...")
                .setSmallIcon(android.R.drawable.ic_dialog_info)
                .setContentIntent(pendingIntent)
                .build();
    }

    private void startCameraPreview(SurfaceHolder holder) {
        try {
            // Log.d(TAG, "Starting camera preview");

            // 检查相机管理器是否有效
            if (cameraManager == null) {
                // Log.e(TAG, "Camera manager is null");
                return;
            }

            // 检查相机是否处于安全状态
            if (!cameraManager.isCameraInSafeState()) {
                // Log.w(TAG, "Camera is not in safe state, reinitializing...");
                // 重新初始化相机
                if (cameraManager != null) {
                    cameraManager.safeClose();
                }
                cameraManager = new CameraManager(this);
                cameraManager.setPoseDetector(poseDetector);
            }

            cameraManager.startPreview();
            // 设置Surface
            if (holder != null && holder.getSurface() != null) {
                cameraManager.setPreviewSurface(holder.getSurface());
            }
        } catch (Exception e) {
            // Log.e(TAG, "Error starting camera preview", e);
        }
    }

    private void stopCameraPreview() {
        try {
            // Log.d(TAG, "Stopping camera preview");
            if (cameraManager != null) {
                cameraManager.safeClose();
            }
        } catch (Exception e) {
            // Log.e(TAG, "Error stopping camera preview", e);
        }
    }

    private void loadStatistics() {
        SharedPreferences prefs = getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
        String lastDate = prefs.getString(KEY_LAST_DATE, "");
        String today = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(new Date());

        if (!today.equals(lastDate)) {
            // 如果是新的一天，重置统计数据
            totalCorrectPostureTime = 0;
            prefs.edit()
                    .putString(KEY_LAST_DATE, today)
                    .putLong(KEY_TOTAL_TIME, 0)
                    .apply();
        } else {
            // 加载当天的统计数据
            totalCorrectPostureTime = prefs.getLong(KEY_TOTAL_TIME, 0);
        }
    }

    private void saveStatistics() {
        SharedPreferences prefs = getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
        String today = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(new Date());

        prefs.edit()
                .putString(KEY_LAST_DATE, today)
                .putLong(KEY_TOTAL_TIME, totalCorrectPostureTime)
                .apply();
    }

    private void testAudioFiles() {
        Log.d(TAG, "Testing audio files access...");
        String[] audioFiles = {
                "rest_reminder.mp3",
                "good_posture.mp3",
                "shoulders_not_level.mp3",
                "head_not_centered.mp3",
                "head_not_up.mp3",
                "adjust_posture.mp3"
        };

        for (String audioFile : audioFiles) {
            try {
                AssetFileDescriptor afd = getAssets().openFd(audioFile);
                // Log.d(TAG, "Successfully accessed: " + audioFile);
                afd.close();
            } catch (IOException e) {
                // Log.e(TAG, "Failed to access: " + audioFile, e);
            }
        }
    }

    private void processImageAsync(Image image) {
        if (isProcessing) {
            // Log.d(TAG, "跳过处理，上一帧还在处理中");
            return;
        }

        poseProcessExecutor.execute(() -> {
            synchronized (processLock) {
                if (isProcessing) {
                    return;
                }
                isProcessing = true;
            }

            try {
                // 在工作线程中处理图像
                PoseData poseData = poseDetector.detectPose(image);

                // 在主线程中更新UI和回调
                mainHandler.post(() -> {
                    if (poseData != null) {
                        processPostureData(poseData);
                    }
                });
            } catch (Exception e) {
                Log.e(TAG, "处理姿态数据出错", e);
            } finally {
                synchronized (processLock) {
                    isProcessing = false;
                }
            }
        });
    }

    private void processPostureData(PoseData poseData) {
        if (poseData == null)
            return;

        String status = poseData.getStatus();
        long currentTime = System.currentTimeMillis();

        // 更新状态时长统计
        if (!status.equals(lastStatus)) {
            long duration = currentTime - statusStartTime;
            // Log.d(TAG, String.format("状态变化: %s -> %s, 持续时间: %d毫秒", lastStatus, status, duration));

            // 更新上一个状态的累计时长
            if (lastStatus != null && !lastStatus.equals("detecting")) {
                Long currentDuration = statusDurations.get(lastStatus);
                if (currentDuration != null) {
                    statusDurations.put(lastStatus, currentDuration + duration);
                }
            }
            statusDurations.put("total", statusDurations.get("total") + duration);

            // 播放对应的语音提示（只有在检测到人时才播放）
            if (!status.equals("no_person")) {
                playStatusAudio(status);
            } else {
                // Log.d(TAG, "未检测到人，跳过语音播放");
            }

            // 状态变化时立即发送更新
            sendStatusUpdate(status);
            lastUpdateTime = currentTime;
            statusStartTime = currentTime;
            lastStatus = status;
        }
    }

    private void sendStatusUpdate(String status) {
        try {
            JSONObject result = new JSONObject();
            result.put("status", status);
            result.put("isMonitoring", true);

            // 添加所有状态的累计时长
            for (Map.Entry<String, Long> entry : statusDurations.entrySet()) {
                result.put(entry.getKey(), entry.getValue() / 1000); // 转换为秒
            }

            // 发送状态更新
            if (callback != null) {
                callback.onStatusUpdate(result);
            }
        } catch (Exception e) {
            // Log.e(TAG, "发送状态更新失败: " + e.getMessage());
        }
    }

    private void playStatusAudio(String status) {
        // 检查是否检测到人，如果没有检测到人则不播放任何音频
        if (status.equals("no_person")) {
            // Log.d(TAG, "未检测到人，跳过状态音频播放");
            return;
        }

        String audioId = null;
        switch (status) {
            case "good":
                audioId = "good_posture";
                break;
            case "shoulders_not_level":
                audioId = "shoulders_not_level";
                break;
            case "head_not_centered":
                audioId = "head_not_centered";
                break;
            case "head_not_up":
                audioId = "head_not_up";
                break;
            case "detecting":
                // 检测中状态不播放语音
                return;
            case "no_person":
                // 未检测到人状态不播放语音
                return;
        }

        if (audioId != null) {
            playAudio(audioId);
        }
    }

    private void playAudio(String audioId) {
        // 停止当前正在播放的音频
        if (mediaPlayer != null) {
            try {
                if (mediaPlayer.isPlaying()) {
                    mediaPlayer.stop();
                }
            } catch (Exception e) {
                Log.e(TAG, "停止音频失败: " + e.getMessage());
            }
            mediaPlayer.release();
            mediaPlayer = null;
        }

        try {
            AssetFileDescriptor afd = getAssets().openFd(audioId + ".mp3");
            mediaPlayer = new MediaPlayer();
            mediaPlayer.setDataSource(afd.getFileDescriptor(), afd.getStartOffset(), afd.getLength());
            afd.close();

            mediaPlayer.setOnPreparedListener(mp -> {
                Log.d(TAG, "音频准备完成，开始播放: " + audioId);
                mp.start();
            });

            mediaPlayer.setOnCompletionListener(mp -> {
                // Log.d(TAG, "音频播放完成: " + audioId);
                mp.release();
                mediaPlayer = null;
            });

            mediaPlayer.setOnErrorListener((mp, what, extra) -> {
                // Log.e(TAG, "音频播放错误: what=" + what + ", extra=" + extra);
                mp.release();
                mediaPlayer = null;
                return true;
            });

            mediaPlayer.prepareAsync();
        } catch (Exception e) {
            // Log.e(TAG, "播放音频失败: " + e.getMessage());
            if (mediaPlayer != null) {
                mediaPlayer.release();
                mediaPlayer = null;
            }
        }
    }
}