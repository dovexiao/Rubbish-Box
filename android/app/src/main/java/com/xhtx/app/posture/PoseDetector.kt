package com.xhtx.app.posture

import android.content.Context
import android.graphics.Bitmap
import android.util.Log
import org.tensorflow.lite.Interpreter
import java.io.FileInputStream
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.MappedByteBuffer
import java.nio.channels.FileChannel

/**
 * 姿势检测器 - 使用 TensorFlow Lite MoveNet 模型
 */
class PoseDetector(private val context: Context) {
    companion object {
        private const val TAG = "PoseDetector"
        private const val MODEL_FILE = "pose_model.tflite"
        private const val INPUT_SIZE = 192 // MoveNet 输入尺寸
        private const val NUM_KEYPOINTS = 17 // MoveNet 关键点数量
        
        // MoveNet 关键点索引
        const val NOSE = 0
        const val LEFT_EYE = 1
        const val RIGHT_EYE = 2
        const val LEFT_EAR = 3
        const val RIGHT_EAR = 4
        const val LEFT_SHOULDER = 5
        const val RIGHT_SHOULDER = 6
        const val LEFT_ELBOW = 7
        const val RIGHT_ELBOW = 8
        const val LEFT_WRIST = 9
        const val RIGHT_WRIST = 10
        const val LEFT_HIP = 11
        const val RIGHT_HIP = 12
        const val LEFT_KNEE = 13
        const val RIGHT_KNEE = 14
        const val LEFT_ANKLE = 15
        const val RIGHT_ANKLE = 16
    }
    
    private var interpreter: Interpreter? = null
    // MoveNet 模型期望 UInt8 输入（0-255），不是 Float32
    private val inputBuffer = ByteBuffer.allocateDirect(INPUT_SIZE * INPUT_SIZE * 3)
        .apply { order(ByteOrder.nativeOrder()) }
    
    init {
        try {
            Log.d(TAG, "🚀 开始加载 TFLite 模型...")
            
            // 加载模型
            val model = loadModelFile()
            
            // 配置解释器（使用 CPU，多线程优化）
            val options = Interpreter.Options().apply {
                setNumThreads(4) // 使用4个线程
                setUseNNAPI(true) // 启用 NNAPI 硬件加速（如果设备支持）
            }
            
            // 创建解释器
            interpreter = Interpreter(model, options)
            
            Log.d(TAG, "✅ TFLite 模型加载成功（CPU模式 + NNAPI）")
        } catch (e: Exception) {
            Log.e(TAG, "❌ 模型加载失败:", e)
        }
    }
    
    /**
     * 从 assets 加载模型文件
     */
    private fun loadModelFile(): MappedByteBuffer {
        val assetFileDescriptor = context.assets.openFd(MODEL_FILE)
        val inputStream = FileInputStream(assetFileDescriptor.fileDescriptor)
        val fileChannel = inputStream.channel
        val startOffset = assetFileDescriptor.startOffset
        val declaredLength = assetFileDescriptor.declaredLength
        return fileChannel.map(FileChannel.MapMode.READ_ONLY, startOffset, declaredLength)
    }
    
    /**
     * 检测姿势关键点
     * 
     * @param rgbData RGB 字节数组 (192x192x3)
     * @return 关键点数组，每个关键点包含 [y, x, confidence]
     */
    fun detectPose(rgbData: ByteArray): Array<FloatArray> {
        if (interpreter == null) {
            Log.w(TAG, "⚠️ 解释器未初始化")
            return Array(NUM_KEYPOINTS) { FloatArray(3) }
        }
        
        // 检查输入数据大小
        val expectedSize = INPUT_SIZE * INPUT_SIZE * 3
        if (rgbData.size != expectedSize) {
            Log.e(TAG, "❌ 输入数据大小不匹配: 期望=$expectedSize, 实际=${rgbData.size}")
            return Array(NUM_KEYPOINTS) { FloatArray(3) }
        }
        
        try {
            // MoveNet 模型期望 UInt8 输入（0-255），直接使用 RGB 字节数组
            inputBuffer.clear()
            inputBuffer.put(rgbData)
            inputBuffer.flip()
            
            // 准备输出：MoveNet 输出 [1, 1, 17, 3] -> [y, x, confidence]
            val output = Array(1) { Array(1) { Array(NUM_KEYPOINTS) { FloatArray(3) } } }
            
            // 运行推理
            interpreter?.run(inputBuffer, output)
            
            // 提取关键点
            return output[0][0]
        } catch (e: Exception) {
            Log.e(TAG, "❌ 推理失败:", e)
            return Array(NUM_KEYPOINTS) { FloatArray(3) }
        }
    }
    
    /**
     * 评估坐姿状态
     */
    fun evaluatePosture(keypoints: Array<FloatArray>): String {
        // 检查是否检测到人
        val avgConfidence = keypoints.map { it[2] }.average()
        if (avgConfidence < 0.3) {
            return "no_person"
        }
        
        // 获取关键点
        val leftShoulder = keypoints[LEFT_SHOULDER]
        val rightShoulder = keypoints[RIGHT_SHOULDER]
        val nose = keypoints[NOSE]
        val leftEye = keypoints[LEFT_EYE]
        val rightEye = keypoints[RIGHT_EYE]
        val leftHip = keypoints[LEFT_HIP]
        val rightHip = keypoints[RIGHT_HIP]
        
        // 检查关键点置信度
        if (leftShoulder[2] < 0.3 || rightShoulder[2] < 0.3) {
            return "detecting"
        }
        
        // 🎯 新增：检查距离是否过远
        if (isTooFarAway(keypoints)) {
            return "too_far"
        }
        
        // 1. 检查肩膀是否水平
        val shoulderYDiff = Math.abs(leftShoulder[0] - rightShoulder[0])
        if (shoulderYDiff > 0.05) { // 阈值可调整
            return "shoulders_not_level"
        }
        
        // 2. 检查头部是否居中
        val shoulderCenterX = (leftShoulder[1] + rightShoulder[1]) / 2
        val headCenterX = if (nose[2] > 0.3) {
            nose[1]
        } else {
            (leftEye[1] + rightEye[1]) / 2
        }
        val headOffsetX = Math.abs(headCenterX - shoulderCenterX)
        if (headOffsetX > 0.1) { // 阈值可调整
            return "head_not_centered"
        }
        
        // 3. 检查是否低头
        val shoulderCenterY = (leftShoulder[0] + rightShoulder[0]) / 2
        val headY = if (nose[2] > 0.3) {
            nose[0]
        } else {
            (leftEye[0] + rightEye[0]) / 2
        }
        val headShoulderDist = shoulderCenterY - headY
        if (headShoulderDist < 0.15) { // 阈值可调整
            return "head_not_up"
        }
        
        return "good"
    }
    
    /**
     * 判断人是否距离过远
     * 使用多个指标综合判断，避免误判
     */
    private fun isTooFarAway(keypoints: Array<FloatArray>): Boolean {
        val leftShoulder = keypoints[LEFT_SHOULDER]
        val rightShoulder = keypoints[RIGHT_SHOULDER]
        val nose = keypoints[NOSE]
        val leftHip = keypoints[LEFT_HIP]
        val rightHip = keypoints[RIGHT_HIP]
        
        // 指标1：肩宽（最可靠）
        // 正常学习距离（40-60cm），肩宽应该在 0.18-0.35 之间
        val shoulderWidth = kotlin.math.abs(leftShoulder[1] - rightShoulder[1])
        if (shoulderWidth < 0.15f) {
            Log.d(TAG, "⚠️ 距离判断：肩宽过小 ($shoulderWidth < 0.15)，距离过远")
            return true
        }
        
        // 指标2：上半身高度（头到髋部的距离）
        val hipY = (leftHip[0] + rightHip[0]) / 2f
        val torsoHeight = kotlin.math.abs(nose[0] - hipY)
        if (torsoHeight < 0.25f) {
            Log.d(TAG, "⚠️ 距离判断：上半身高度过小 ($torsoHeight < 0.25)，距离过远")
            return true
        }
        
        // 指标3：关键点平均置信度
        // 距离太远会导致关键点模糊
        val upperBodyKeypoints = listOf(
            nose, leftShoulder, rightShoulder, leftHip, rightHip
        )
        val avgConfidence = upperBodyKeypoints.map { it[2] }.average()
        if (avgConfidence < 0.5f) {
            Log.d(TAG, "⚠️ 距离判断：关键点置信度过低 ($avgConfidence < 0.5)，距离过远")
            return true
        }
        
        Log.d(TAG, "✅ 距离判断：正常 (肩宽=$shoulderWidth, 上半身高度=$torsoHeight, 置信度=$avgConfidence)")
        return false
    }
    
    /**
     * 释放资源
     */
    fun release() {
        interpreter?.close()
        interpreter = null
        Log.d(TAG, "🗑️ PoseDetector 已释放")
    }
}

