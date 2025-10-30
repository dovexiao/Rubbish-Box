package com.example.uniplugin_posemonitor.service;

import android.content.Context;
import android.content.pm.PackageManager;
import android.hardware.camera2.*;
import android.media.Image;
import android.media.ImageReader;
import android.os.Handler;
import android.os.HandlerThread;
import android.os.Looper;
import android.util.Log;
import android.view.Surface;
import android.view.SurfaceHolder;
import androidx.annotation.NonNull;
import androidx.core.content.ContextCompat;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Semaphore;
import java.util.concurrent.TimeUnit;

public class CameraManager {
    private static final String TAG = "CameraManager";
    private static final int PREVIEW_WIDTH = 640;
    private static final int PREVIEW_HEIGHT = 480;
    private static final int MAX_PREVIEW_WIDTH = 1920;
    private static final int MAX_PREVIEW_HEIGHT = 1080;
    private static final int MAX_RETRY_COUNT = 3;
    private static final long RETRY_DELAY_MS = 1000;

    private Context context;
    private CameraDevice cameraDevice;
    private CameraCaptureSession captureSession;
    private ImageReader imageReader;
    private HandlerThread backgroundThread;
    private Handler backgroundHandler;
    private PoseDetector poseDetector;
    private Surface previewSurface;
    private final Semaphore cameraOpenCloseLock = new Semaphore(1);
    private volatile boolean isProcessingImage = false;
    private int retryCount = 0;
    private boolean isCameraInitialized = false;

    public CameraManager(Context context) {
        this.context = context;
        startBackgroundThread();
        initializeImageReader();
        
        // 检查相机权限
        if (checkCameraPermission()) {
            openCamera();
        } else {
            Log.e(TAG, "相机权限未授予");
        }
    }

    private boolean checkCameraPermission() {
        return ContextCompat.checkSelfPermission(context, 
            android.Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED;
    }

    private void initializeImageReader() {
        if (imageReader != null) {
            imageReader.close();
        }
        
        imageReader = ImageReader.newInstance(
                PREVIEW_WIDTH, PREVIEW_HEIGHT,
                android.graphics.ImageFormat.YUV_420_888, 2);
        
        // Log.d(TAG, "ImageReader initialized: " + PREVIEW_WIDTH + "x" + PREVIEW_HEIGHT);
        
        imageReader.setOnImageAvailableListener(new ImageReader.OnImageAvailableListener() {
            @Override
            public void onImageAvailable(ImageReader reader) {
                if (isProcessingImage) {
                    // Log.d(TAG, "跳过帧，上一帧还在处理中");
                    // 获取并立即关闭图像，避免缓冲区满
                    Image image = reader.acquireLatestImage();
                    if (image != null) {
                        image.close();
                    }
                    return;
                }
                
                Image image = null;
                try {
                    image = reader.acquireLatestImage();
                    if (image != null && poseDetector != null) {
                        isProcessingImage = true;
                        // Log.d(TAG, "处理图像: " + image.getWidth() + "x" + image.getHeight());
                        poseDetector.detectPose(image);
                    }
                } catch (Exception e) {
                    // Log.e(TAG, "处理图像时出错", e);
                } finally {
                    if (image != null) {
                        image.close();
                    }
                    isProcessingImage = false;
                }
            }
        }, backgroundHandler);
    }

    public void setPoseDetector(PoseDetector detector) {
        this.poseDetector = detector;
        // Log.d(TAG, "PoseDetector设置: " + (detector != null));
    }

    public void setPreviewSurface(Surface surface) {
        // Log.d(TAG, "设置预览Surface: " + surface);
        this.previewSurface = surface;
        
        // 如果相机未初始化，尝试重新打开
        if (!isCameraInitialized && checkCameraPermission()) {
            openCamera();
        } else if (cameraDevice != null) {
            createCameraPreviewSession();
        }
    }

    private void startBackgroundThread() {
        if (backgroundThread == null) {
        backgroundThread = new HandlerThread("CameraBackground");
        backgroundThread.start();
        backgroundHandler = new Handler(backgroundThread.getLooper());
            // Log.d(TAG, "后台线程已启动");
        }
    }

    private void stopBackgroundThread() {
        if (backgroundThread != null) {
            backgroundThread.quitSafely();
            try {
                backgroundThread.join();
                backgroundThread = null;
                backgroundHandler = null;
                Log.d(TAG, "后台线程已停止");
            } catch (InterruptedException e) {
                Log.e(TAG, "停止后台线程时出错", e);
            }
        }
    }

    private void createCameraPreviewSession() {
        try {
            if (cameraDevice == null || previewSurface == null || imageReader == null) {
                Log.e(TAG, "无法创建预览会话: 设备或Surface未准备好");
                return;
            }

            // 关闭现有会话
            if (captureSession != null) {
                try {
                captureSession.close();
                } catch (Exception e) {
                    Log.w(TAG, "关闭现有会话时出错", e);
                }
                captureSession = null;
            }

            List<Surface> surfaces = new ArrayList<>();
            surfaces.add(previewSurface);
            surfaces.add(imageReader.getSurface());
            
            // Log.d(TAG, "创建相机会话，Surface数量: " + surfaces.size());
            
            cameraDevice.createCaptureSession(surfaces, new CameraCaptureSession.StateCallback() {
                @Override
                public void onConfigured(@NonNull CameraCaptureSession session) {
                    // 检查相机设备是否仍然有效
                    if (cameraDevice == null) {
                        // Log.e(TAG, "相机已关闭，跳过会话配置");
                        try {
                            session.close();
                        } catch (Exception e) {
                            // Log.w(TAG, "关闭无效会话时出错", e);
                        }
                        return;
                    }

                    // 检查会话是否仍然有效
                    if (session == null) {
                        // Log.e(TAG, "相机会话为空");
                        return;
                    }
                    
                    captureSession = session;

                    // 使用延迟来避免竞态条件
                    new Handler(Looper.getMainLooper()).postDelayed(() -> {
                        try {
                            // 再次检查所有组件是否有效
                            if (cameraDevice == null || captureSession == null ||
                                    previewSurface == null || imageReader == null) {
                                // Log.e(TAG, "组件无效，跳过设置重复请求");
                                return;
                            }

                            // 检查会话是否仍然有效（通过尝试获取会话状态）
                            try {
                                // 尝试获取会话状态，如果会话已关闭会抛出异常
                                captureSession.getDevice();
                            } catch (IllegalStateException e) {
                                // Log.d(TAG, "相机会话已关闭，跳过设置重复请求");
                                return;
                            }

                        CaptureRequest.Builder builder = cameraDevice
                                .createCaptureRequest(CameraDevice.TEMPLATE_PREVIEW);
                        builder.addTarget(previewSurface);
                        builder.addTarget(imageReader.getSurface());
                        
                        // 设置自动对焦
                        builder.set(CaptureRequest.CONTROL_AF_MODE,
                                CaptureRequest.CONTROL_AF_MODE_CONTINUOUS_PICTURE);
                        
                        // 设置自动曝光
                        builder.set(CaptureRequest.CONTROL_AE_MODE,
                                CaptureRequest.CONTROL_AE_MODE_ON);
                        
                            // 设置重复请求
                            captureSession.setRepeatingRequest(builder.build(), null, backgroundHandler);
                        // Log.d(TAG, "相机预览已启动");
                        isCameraInitialized = true;

                        } catch (IllegalStateException e) {
                            // Log.e(TAG, "相机会话已关闭，无法设置重复请求", e);
                    } catch (CameraAccessException e) {
                        // Log.e(TAG, "设置重复请求失败", e);
                        } catch (Exception e) {
                            // Log.e(TAG, "设置重复请求时发生未知错误", e);
                    }
                    }, 100); // 延迟100ms避免竞态条件
                }

                @Override
                public void onConfigureFailed(@NonNull CameraCaptureSession session) {
                    // Log.e(TAG, "相机会话配置失败");
                    try {
                        if (session != null) {
                            session.close();
                        }
                    } catch (Exception e) {
                        // Log.w(TAG, "关闭失败的会话时出错", e);
                    }
                }
            }, backgroundHandler);
        } catch (CameraAccessException e) {
            // Log.e(TAG, "创建相机会话失败", e);
        } catch (Exception e) {
            // Log.e(TAG, "创建相机会话时发生未知错误", e);
        }
    }

    public void startPreview() {
        if (cameraDevice != null && previewSurface != null) {
            createCameraPreviewSession();
        }
    }

    public void stopPreview() {
        try {
            cameraOpenCloseLock.acquire();
            
            isCameraInitialized = false;
            
            // 关闭会话
            if (captureSession != null) {
                try {
                captureSession.close();
                } catch (Exception e) {
                    // Log.w(TAG, "关闭相机会话时出错", e);
                }
                captureSession = null;
            }
            
            // 关闭相机
            if (cameraDevice != null) {
                try {
                cameraDevice.close();
                } catch (Exception e) {
                    // Log.w(TAG, "关闭相机设备时出错", e);
                }
                cameraDevice = null;
            }
            
            // 关闭ImageReader
            if (imageReader != null) {
                try {
                imageReader.close();
                } catch (Exception e) {
                    // Log.w(TAG, "关闭ImageReader时出错", e);
                }
                imageReader = null;
            }
            
            // Log.d(TAG, "相机预览已停止");
        } catch (InterruptedException e) {
            // Log.e(TAG, "停止预览时被中断", e);
        } catch (Exception e) {
            // Log.e(TAG, "停止预览时发生未知错误", e);
        } finally {
            cameraOpenCloseLock.release();
        }
        
        stopBackgroundThread();
    }

    // 在 SurfaceView 的回调中插入日志
    public final SurfaceHolder.Callback surfaceCallback = new SurfaceHolder.Callback() {
        @Override
        public void surfaceCreated(SurfaceHolder holder) {
            // Log.d(TAG, "surfaceCreated: " + holder.getSurface());
            setPreviewSurface(holder.getSurface());
        }

        @Override
        public void surfaceChanged(SurfaceHolder holder, int format, int width, int height) {
            // Log.d(TAG, "surfaceChanged: format=" + format + ", width=" + width + ", height=" + height);
        }

        @Override
        public void surfaceDestroyed(SurfaceHolder holder) {
            // Log.d(TAG, "surfaceDestroyed");
        }
    };

    private final CameraDevice.StateCallback stateCallback = new CameraDevice.StateCallback() {
        @Override
        public void onOpened(@NonNull CameraDevice camera) {
            cameraOpenCloseLock.release();
            Log.d(TAG, "相机已打开");
            cameraDevice = camera;
            retryCount = 0; // 重置重试计数
            createCameraPreviewSession();
        }

        @Override
        public void onDisconnected(@NonNull CameraDevice camera) {
            cameraOpenCloseLock.release();
            Log.e(TAG, "相机断开连接");

            // 先关闭会话，再关闭相机
            if (captureSession != null) {
                try {
                    captureSession.close();
                } catch (Exception e) {
                    Log.w(TAG, "关闭断开连接的相机会话时出错", e);
                }
                captureSession = null;
            }

            try {
            camera.close();
            } catch (Exception e) {
                Log.w(TAG, "关闭断开连接的相机时出错", e);
            }
            cameraDevice = null;
            isCameraInitialized = false;
        }

        @Override
        public void onError(@NonNull CameraDevice camera, int error) {
            cameraOpenCloseLock.release();
            Log.e(TAG, "相机错误: " + error);

            // 先关闭会话，再关闭相机
            if (captureSession != null) {
                try {
                    captureSession.close();
                } catch (Exception e) {
                    // Log.w(TAG, "关闭错误相机的会话时出错", e);
                }
                captureSession = null;
            }

            try {
            camera.close();
            } catch (Exception e) {
                // Log.w(TAG, "关闭错误相机时出错", e);
            }
            cameraDevice = null;
            isCameraInitialized = false;
            
            // 根据错误类型决定是否重试
            if (error == CameraDevice.StateCallback.ERROR_CAMERA_DISABLED ||
                error == CameraDevice.StateCallback.ERROR_CAMERA_IN_USE) {
                retryOpenCamera();
            }
        }
    };

    private void retryOpenCamera() {
        if (retryCount < MAX_RETRY_COUNT) {
            retryCount++;
            // Log.d(TAG, "尝试重新打开相机，第 " + retryCount + " 次");
            
            // 延迟后重试
            if (backgroundHandler != null) {
                backgroundHandler.postDelayed(new Runnable() {
                    @Override
                    public void run() {
                        openCamera();
                    }
                }, RETRY_DELAY_MS * retryCount);
            }
        } else {
            // Log.e(TAG, "相机打开失败，已达到最大重试次数");
        }
    }

    public void openCamera() {
        try {
            if (!cameraOpenCloseLock.tryAcquire(2500, TimeUnit.MILLISECONDS)) {
                // throw new RuntimeException("相机锁定超时");
            }
            
            android.hardware.camera2.CameraManager sysCameraManager = (android.hardware.camera2.CameraManager) context
                    .getSystemService(Context.CAMERA_SERVICE);
            
            String[] cameraIds = sysCameraManager.getCameraIdList();
            if (cameraIds.length == 0) {
                // throw new RuntimeException("没有可用的摄像头");
            }

            String selectedCameraId = null;
            CameraAccessException lastException = null;

            // 先尝试前置摄像头
            for (String cameraId : cameraIds) {
                try {
                CameraCharacteristics characteristics = sysCameraManager.getCameraCharacteristics(cameraId);
                Integer facing = characteristics.get(CameraCharacteristics.LENS_FACING);
                if (facing != null && facing == CameraCharacteristics.LENS_FACING_FRONT) {
                        // Log.d(TAG, "尝试打开前置摄像头: " + cameraId);
                        sysCameraManager.openCamera(cameraId, stateCallback, backgroundHandler);
                        return; // 成功打开，直接返回
                    }
                } catch (CameraAccessException e) {
                    // Log.w(TAG, "无法打开前置摄像头 " + cameraId + ": " + e.getMessage());
                    lastException = e;
                }
            }

            // 如果前置摄像头失败，尝试后置摄像头
            for (String cameraId : cameraIds) {
                try {
                    CameraCharacteristics characteristics = sysCameraManager.getCameraCharacteristics(cameraId);
                    Integer facing = characteristics.get(CameraCharacteristics.LENS_FACING);
                    if (facing != null && facing == CameraCharacteristics.LENS_FACING_BACK) {
                        // Log.d(TAG, "尝试打开后置摄像头: " + cameraId);
            sysCameraManager.openCamera(cameraId, stateCallback, backgroundHandler);
                        return; // 成功打开，直接返回
                    }
                } catch (CameraAccessException e) {
                    // Log.w(TAG, "无法打开后置摄像头 " + cameraId + ": " + e.getMessage());
                    lastException = e;
                }
            }

            // 如果都失败了，尝试第一个可用的摄像头
            if (cameraIds.length > 0) {
                try {
                    // Log.d(TAG, "尝试打开默认摄像头: " + cameraIds[0]);
                    sysCameraManager.openCamera(cameraIds[0], stateCallback, backgroundHandler);
                    return;
                } catch (CameraAccessException e) {
                    // Log.e(TAG, "无法打开默认摄像头: " + e.getMessage());
                    lastException = e;
                }
            }
            
            // 所有尝试都失败了
            cameraOpenCloseLock.release();
            if (lastException != null) {
                handleCameraAccessException(lastException);
            } else {
                // Log.e(TAG, "无法打开任何摄像头");
            }
            
        } catch (SecurityException e) {
            Log.e(TAG, "没有相机权限", e);
            cameraOpenCloseLock.release();
        } catch (InterruptedException e) {
            Log.e(TAG, "打开相机时被中断", e);
            cameraOpenCloseLock.release();
        } catch (Exception e) {
            Log.e(TAG, "打开相机时出错", e);
            cameraOpenCloseLock.release();
        }
    }
    
    private void handleCameraAccessException(CameraAccessException e) {
        String message = e.getMessage();
        if (message != null) {
            if (message.contains("disabled by policy")) {
                Log.e(TAG, "相机被系统策略禁用，可能原因：\n" +
                          "1. 应用没有相机权限\n" +
                          "2. 设备管理策略禁用了相机\n" +
                          "3. 其他应用正在使用相机");
            } else if (message.contains("in use")) {
                Log.e(TAG, "相机正在被其他应用使用");
            } else if (message.contains("disconnected")) {
                Log.e(TAG, "相机已断开连接");
            } else {
                Log.e(TAG, "相机访问错误: " + message);
            }
        }
    }
    
    public boolean isCameraAvailable() {
        return cameraDevice != null && isCameraInitialized;
    }

    /**
     * 检查相机是否处于安全状态
     */
    public boolean isCameraInSafeState() {
        try {
            if (cameraDevice == null) {
                return false;
            }

            // 尝试获取相机设备状态，如果抛出异常说明设备已关闭
            cameraDevice.getId();
            return true;
        } catch (Exception e) {
            Log.w(TAG, "相机设备状态检查失败", e);
            return false;
        }
    }

    /**
     * 安全地关闭所有相机资源
     */
    public void safeClose() {
        Log.d(TAG, "安全关闭相机资源");

        // 停止预览
        stopPreview();

        // 停止后台线程
        stopBackgroundThread();

        // 重置状态
        isCameraInitialized = false;
        retryCount = 0;

        Log.d(TAG, "相机资源已安全关闭");
    }
}