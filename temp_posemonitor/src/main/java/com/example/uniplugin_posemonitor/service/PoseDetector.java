package com.example.uniplugin_posemonitor.service;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.ImageFormat;
import android.graphics.Rect;
import android.graphics.YuvImage;
import android.media.Image;
import android.util.Log;
import org.tensorflow.lite.Interpreter;
import org.tensorflow.lite.support.common.FileUtil;
import org.tensorflow.lite.support.common.ops.NormalizeOp;
import org.tensorflow.lite.support.image.ImageProcessor;
import org.tensorflow.lite.support.image.TensorImage;
import org.tensorflow.lite.support.image.ops.ResizeOp;
import org.tensorflow.lite.support.tensorbuffer.TensorBuffer;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.MappedByteBuffer;
import com.example.uniplugin_posemonitor.model.PoseData;
import org.tensorflow.lite.DataType;
import java.util.Arrays;

public class PoseDetector {
    private static final String TAG = "PoseDetector";
    private static final String MODEL_FILE = "pose_model.tflite";
    private static final int INPUT_SIZE = 192; // 输入图像尺寸
    private static final int NUM_KEYPOINTS = 17; // 关键点数量
    private static final float MIN_CONFIDENCE = 0.5f; // 最小置信度阈值
    private static final int TARGET_FPS = 3; // 目标帧率
    private static final long FRAME_INTERVAL = 1000 / TARGET_FPS; // 帧间隔（毫秒）

    private Context context;
    private Interpreter interpreter;
    private ImageProcessor imageProcessor;
    private ImageProcessor imageProcessorFloat;
    private PoseDetectorCallback callback;
    private float[][][][] outputBuffer;
    private long lastFrameTime = 0;
    private TensorImage reusableTensorImage; // 重用的 TensorImage 对象
    private final Object processLock = new Object(); // 处理锁
    private DataType inputDataType; // 输入数据类型

    public interface PoseDetectorCallback {
        void onPoseDetected(PoseData poseData);
    }

    public PoseDetector(Context context) {
        this.context = context;

        try {
            // 初始化输出缓冲区
            outputBuffer = new float[1][1][NUM_KEYPOINTS][3];
            
            // 加载模型
            MappedByteBuffer modelBuffer = FileUtil.loadMappedFile(context, MODEL_FILE);
            Interpreter.Options options = new Interpreter.Options();
            options.setNumThreads(4); // 使用4个线程进行推理
            options.setUseNNAPI(false); // 禁用NNAPI，提高兼容性
            interpreter = new Interpreter(modelBuffer, options);

            // 获取输入张量信息
            int[] inputShape = interpreter.getInputTensor(0).shape();
            inputDataType = interpreter.getInputTensor(0).dataType();
            // Log.d(TAG, "模型输入形状: " + Arrays.toString(inputShape));
            // Log.d(TAG, "模型输入数据类型: " + inputDataType);
            
            // 根据输入数据类型创建不同的图像处理器
            if (inputDataType == DataType.UINT8) {
                // 对于 UINT8 输入，只需要调整大小，不需要归一化
                imageProcessor = new ImageProcessor.Builder()
                        .add(new ResizeOp(INPUT_SIZE, INPUT_SIZE, ResizeOp.ResizeMethod.BILINEAR))
                        .build();
                
                // 初始化可重用的 TensorImage，使用 UINT8 类型
                reusableTensorImage = new TensorImage(DataType.UINT8);
            } else {
                // 对于 FLOAT32 输入，需要归一化
                imageProcessor = new ImageProcessor.Builder()
                        .add(new ResizeOp(INPUT_SIZE, INPUT_SIZE, ResizeOp.ResizeMethod.BILINEAR))
                        .add(new NormalizeOp(0.0f, 255.0f)) // 归一化：将 [0, 255] 映射到 [0, 1]
                        .build();
                
                // 初始化可重用的 TensorImage，使用 FLOAT32 类型
                reusableTensorImage = new TensorImage(DataType.FLOAT32);
            }

            // Log.d(TAG, "PoseDetector initialized successfully");
        } catch (IOException e) {
            // Log.e(TAG, "加载模型失败: " + e.getMessage());
            e.printStackTrace();
        } catch (Exception e) {
            // Log.e(TAG, "初始化失败: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void setCallback(PoseDetectorCallback callback) {
        this.callback = callback;
    }

    public PoseData detectPose(Image image) {
        if (image == null) {
            // Log.e(TAG, "输入图像为空");
            return null;
        }

        if (callback == null) {
            // Log.w(TAG, "回调未设置，跳过姿态检测");
            return null;
        }

        if (interpreter == null) {
            // Log.e(TAG, "TensorFlow模型未初始化");
            return null;
        }

        // 帧率控制
        long currentTime = System.currentTimeMillis();
        if (currentTime - lastFrameTime < FRAME_INTERVAL) {
            // Log.d(TAG, "跳过帧，保持帧率: " + TARGET_FPS);
            return null;
        }
        lastFrameTime = currentTime;

        // 使用同步锁避免并发处理
        synchronized (processLock) {
            Bitmap bitmap = null;
            ByteArrayOutputStream out = null;
            try {
                // Log.d(TAG, "开始处理图像...");
                
                // 转换图像格式
                if (image.getFormat() != ImageFormat.YUV_420_888) {
                    // Log.e(TAG, "不支持的图像格式: " + image.getFormat());
                    return null;
                }
                
                // 获取图像数据
                Image.Plane[] planes = image.getPlanes();
                if (planes == null || planes.length < 3) {
                    // Log.e(TAG, "图像平面数据无效");
                    return null;
                }
                
                ByteBuffer yBuffer = planes[0].getBuffer();
                ByteBuffer uBuffer = planes[1].getBuffer();
                ByteBuffer vBuffer = planes[2].getBuffer();

                int ySize = yBuffer.remaining();
                int uSize = uBuffer.remaining();
                int vSize = vBuffer.remaining();

                // 创建NV21数据
                byte[] nv21 = new byte[ySize + uSize + vSize];

                // 复制Y数据
                yBuffer.get(nv21, 0, ySize);
                // 复制VU数据
                vBuffer.get(nv21, ySize, vSize);
                uBuffer.get(nv21, ySize + vSize, uSize);

                // 转换为Bitmap
                YuvImage yuvImage = new YuvImage(nv21, ImageFormat.NV21, 
                    image.getWidth(), image.getHeight(), null);
                out = new ByteArrayOutputStream();
                yuvImage.compressToJpeg(new Rect(0, 0, image.getWidth(), image.getHeight()), 
                    85, out); // 使用85%的质量，平衡质量和性能
                
                byte[] imageBytes = out.toByteArray();
                bitmap = BitmapFactory.decodeByteArray(imageBytes, 0, imageBytes.length);
                
                if (bitmap == null) {
                    // Log.e(TAG, "Bitmap创建失败");
                    return null;
                }
                
                // 确保 bitmap 是 ARGB_8888 格式
                if (bitmap.getConfig() != Bitmap.Config.ARGB_8888) {
                    Bitmap newBitmap = bitmap.copy(Bitmap.Config.ARGB_8888, false);
                    bitmap.recycle();
                    bitmap = newBitmap;
                }
                
                // 加载 Bitmap 到 TensorImage
                reusableTensorImage.load(bitmap);
                
                // 处理图像
                TensorImage processedImage = imageProcessor.process(reusableTensorImage);
                
                // 获取处理后的 ByteBuffer
                ByteBuffer inputBuffer = processedImage.getBuffer();
                inputBuffer.rewind(); // 重置 buffer 位置
                
                // 打印调试信息
                // Log.d(TAG, "输入缓冲区大小: " + inputBuffer.capacity() + " 字节");
                // Log.d(TAG, "期望的输入大小: " + (INPUT_SIZE * INPUT_SIZE * 3 * (inputDataType == DataType.UINT8 ? 1 : 4)) + " 字节");
                
                // 运行模型推理
                interpreter.run(inputBuffer, outputBuffer);
                
                // 处理输出并创建PoseData
                float[][] keypointsData = new float[NUM_KEYPOINTS][3];
                for (int i = 0; i < NUM_KEYPOINTS; i++) {
                    keypointsData[i][0] = outputBuffer[0][0][i][0]; // y
                    keypointsData[i][1] = outputBuffer[0][0][i][1]; // x
                    keypointsData[i][2] = outputBuffer[0][0][i][2]; // confidence
                }
                
                PoseData poseData = processPoseData(keypointsData);
                
                // 发送结果
                if (callback != null) {
                    callback.onPoseDetected(poseData);
                }
                
                // Log.d(TAG, "姿态检测完成，状态: " + poseData.getStatus());
                return poseData;
                
            } catch (Exception e) {
                // Log.e(TAG, "处理图像失败: " + e.getMessage());
                e.printStackTrace();
                return null;
            } finally {
                // 清理资源
                if (bitmap != null && !bitmap.isRecycled()) {
                    bitmap.recycle();
                }
                if (out != null) {
                    try {
                        out.close();
                    } catch (IOException e) {
                        // Log.e(TAG, "关闭输出流失败", e);
                    }
                }
            }
        }
    }

    private PoseData processPoseData(float[][] keypoints) {
        PoseData poseData = new PoseData();
        
        // 处理每个关键点
        for (int i = 0; i < NUM_KEYPOINTS; i++) {
            float y = keypoints[i][0];
            float x = keypoints[i][1];
            float confidence = keypoints[i][2];
            
            // 确保坐标在有效范围内
            x = Math.max(0, Math.min(1, x));
            y = Math.max(0, Math.min(1, y));
            
            poseData.setKeyPoint(i, x, y, confidence);
        }

        // 计算整体置信度
        float totalConfidence = 0;
        int validPoints = 0;
        for (int i = 0; i < NUM_KEYPOINTS; i++) {
            if (keypoints[i][2] > MIN_CONFIDENCE) {
                totalConfidence += keypoints[i][2];
                validPoints++;
            }
        }
        
        if (validPoints > 0) {
            poseData.setOverallConfidence(totalConfidence / validPoints);
        } else {
            poseData.setOverallConfidence(0);
        }

        // 更新姿态状态
        poseData.updateStatusH5Like();
        
        return poseData;
    }

    public void close() {
        synchronized (processLock) {
            if (interpreter != null) {
                try {
                    interpreter.close();
                } catch (Exception e) {
                    // Log.e(TAG, "关闭解释器失败", e);
                }
                interpreter = null;
            }
            
            // 清理 TensorImage
            reusableTensorImage = null;
        }
    }
}