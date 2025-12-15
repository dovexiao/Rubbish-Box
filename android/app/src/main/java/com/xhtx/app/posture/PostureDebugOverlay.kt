package com.xhtx.app.posture

import android.content.Context
import android.graphics.*
import android.util.Log
import android.view.View
import android.view.WindowManager
import android.os.Build

/**
 * 坐姿检测调试浮窗
 * 显示相机画面和关键点标注
 */
class PostureDebugOverlay(private val context: Context) {
    private val TAG = "PostureDebugOverlay"
    private var overlayView: OverlayView? = null
    private val windowManager = context.getSystemService(Context.WINDOW_SERVICE) as WindowManager
    
    fun show() {
        try {
            if (overlayView != null) {
                Log.d(TAG, "调试浮窗已存在")
                return
            }
            
            // 检查悬浮窗权限
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                if (!android.provider.Settings.canDrawOverlays(context)) {
                    Log.e(TAG, "❌ 缺少悬浮窗权限 SYSTEM_ALERT_WINDOW")
                    Log.e(TAG, "请在设置中授予应用悬浮窗权限")
                    return
                }
            }
            
            overlayView = OverlayView(context)
            
            val params = WindowManager.LayoutParams(
                400, // 宽度
                500, // 高度
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                } else {
                    @Suppress("DEPRECATION")
                    WindowManager.LayoutParams.TYPE_SYSTEM_ALERT
                },
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,
                PixelFormat.TRANSLUCENT
            ).apply {
                gravity = android.view.Gravity.TOP or android.view.Gravity.RIGHT
                x = 20
                y = 100
            }
            
            windowManager.addView(overlayView, params)
            Log.d(TAG, "✅ 调试浮窗已显示")
        } catch (e: Exception) {
            Log.e(TAG, "❌ 显示浮窗失败: ${e.message}", e)
            e.printStackTrace()
        }
    }
    
    fun hide() {
        try {
            overlayView?.let {
                windowManager.removeView(it)
                overlayView = null
                Log.d(TAG, "✅ 调试浮窗已隐藏")
            }
        } catch (e: Exception) {
            Log.e(TAG, "❌ 隐藏浮窗失败: ${e.message}", e)
        }
    }
    
    fun updateFrame(bitmap: Bitmap?, keypoints: Array<FloatArray>?, status: String) {
        overlayView?.updateFrame(bitmap, keypoints, status)
    }
    
    private class OverlayView(context: Context) : View(context) {
        private var currentBitmap: Bitmap? = null
        private var currentKeypoints: Array<FloatArray>? = null
        private var currentStatus: String = "detecting"
        
        private val paint = Paint().apply {
            isAntiAlias = true
            style = Paint.Style.FILL
        }
        
        private val textPaint = Paint().apply {
            isAntiAlias = true
            color = Color.WHITE
            textSize = 24f
            typeface = Typeface.DEFAULT_BOLD
        }
        
        private val bgPaint = Paint().apply {
            color = Color.argb(180, 0, 0, 0)
            style = Paint.Style.FILL
        }
        
        fun updateFrame(bitmap: Bitmap?, keypoints: Array<FloatArray>?, status: String) {
            currentBitmap = bitmap
            currentKeypoints = keypoints
            currentStatus = status
            Log.d("OverlayView", "更新画面: bitmap=${bitmap != null}, keypoints=${keypoints?.size}, status=$status")
            postInvalidate()
        }
        
        override fun onDraw(canvas: Canvas) {
            super.onDraw(canvas)
            
            // 绘制背景
            canvas.drawRoundRect(
                0f, 0f, width.toFloat(), height.toFloat(),
                16f, 16f, bgPaint
            )
            
            // 绘制相机画面
            currentBitmap?.let { bitmap ->
                val srcRect = Rect(0, 0, bitmap.width, bitmap.height)
                val dstRect = Rect(20, 20, width - 20, height - 120)
                canvas.drawBitmap(bitmap, srcRect, dstRect, paint)
                
                // 绘制关键点
                currentKeypoints?.let { points ->
                    drawKeypoints(canvas, points, dstRect)
                }
            } ?: run {
                // 如果没有图像，显示提示
                textPaint.color = Color.WHITE
                textPaint.textSize = 18f
                val noImageText = "等待相机数据..."
                canvas.drawText(
                    noImageText,
                    width / 2f - textPaint.measureText(noImageText) / 2f,
                    height / 2f,
                    textPaint
                )
                textPaint.textSize = 24f
            }
            
            // 绘制状态文本
            val statusText = when (currentStatus) {
                "good" -> "✅ 良好"
                "shoulders_not_level" -> "⚠️ 肩膀倾斜"
                "head_not_centered" -> "⚠️ 头部偏斜"
                "head_not_up" -> "⚠️ 头部过低"
                "too_far" -> "⚠️ 距离过远"
                "no_person" -> "❌ 无人"
                else -> "🔍 检测中"
            }
            
            textPaint.color = when (currentStatus) {
                "good" -> Color.GREEN
                "no_person" -> Color.RED
                else -> Color.YELLOW
            }
            
            canvas.drawText(
                statusText,
                width / 2f - textPaint.measureText(statusText) / 2f,
                height - 60f,
                textPaint
            )
            
            // 绘制提示
            textPaint.color = Color.WHITE
            textPaint.textSize = 16f
            canvas.drawText(
                "调试模式",
                width / 2f - textPaint.measureText("调试模式") / 2f,
                height - 20f,
                textPaint
            )
            textPaint.textSize = 24f
        }
        
        private fun drawKeypoints(canvas: Canvas, keypoints: Array<FloatArray>, rect: Rect) {
            if (keypoints.size < 17) {
                Log.w("OverlayView", "关键点数量不足: ${keypoints.size}")
                return
            }
            
            // 关键点坐标是归一化的 [0,1]，需要映射到显示区域
            val scaleX = rect.width().toFloat()
            val scaleY = rect.height().toFloat()
            val offsetX = rect.left.toFloat()
            val offsetY = rect.top.toFloat()
            
            Log.d("OverlayView", "绘制关键点: rect=${rect}, scale=${scaleX}x${scaleY}")
            
            // 关键点索引定义（MoveNet Thunder模型）
            val keypointNames = arrayOf(
                "鼻子", "左眼", "右眼", "左耳", "右耳",
                "左肩", "右肩", "左肘", "右肘", "左腕", "右腕",
                "左髋", "右髋", "左膝", "右膝", "左踝", "右踝"
            )
            
            // 绘制关键点
            var visiblePoints = 0
            for (i in 0 until 17) {
                if (keypoints[i].size < 3) continue
                
                // MoveNet 输出格式: [y, x, confidence] (注意：y在前，x在后)
                val y = keypoints[i][0] * scaleY + offsetY
                val x = keypoints[i][1] * scaleX + offsetX
                val conf = keypoints[i][2]
                
                if (conf > 0.3) {
                    visiblePoints++
                    
                    // 根据置信度设置颜色
                    paint.color = when {
                        conf > 0.7 -> Color.GREEN
                        conf > 0.5 -> Color.YELLOW
                        else -> Color.RED
                    }
                    
                    // 绘制关键点
                    canvas.drawCircle(x, y, 8f, paint)
                    
                    // 重要关键点绘制外圈
                    if (i in listOf(5, 6, 11, 12)) { // 肩膀和髋部
                        paint.style = Paint.Style.STROKE
                        paint.strokeWidth = 3f
                        canvas.drawCircle(x, y, 14f, paint)
                        paint.style = Paint.Style.FILL
                    }
                }
            }
            
            if (visiblePoints == 0) {
                Log.w("OverlayView", "没有可见的关键点")
            } else {
                Log.d("OverlayView", "绘制了 $visiblePoints 个关键点")
            }
            
            // 绘制骨架连接
            paint.color = Color.argb(150, 255, 255, 255)
            paint.strokeWidth = 2f
            val connections = listOf(
                // 头部
                Pair(0, 1), Pair(0, 2), Pair(1, 3), Pair(2, 4),
                // 上半身
                Pair(5, 6), Pair(5, 7), Pair(7, 9),
                Pair(6, 8), Pair(8, 10),
                Pair(5, 11), Pair(6, 12), Pair(11, 12),
                // 下半身
                Pair(11, 13), Pair(13, 15),
                Pair(12, 14), Pair(14, 16)
            )
            
            for ((start, end) in connections) {
                if (start >= keypoints.size || end >= keypoints.size) continue
                if (keypoints[start].size < 3 || keypoints[end].size < 3) continue
                
                // MoveNet 输出格式: [y, x, confidence]
                val y1 = keypoints[start][0] * scaleY + offsetY
                val x1 = keypoints[start][1] * scaleX + offsetX
                val conf1 = keypoints[start][2]
                
                val y2 = keypoints[end][0] * scaleY + offsetY
                val x2 = keypoints[end][1] * scaleX + offsetX
                val conf2 = keypoints[end][2]
                
                if (conf1 > 0.3 && conf2 > 0.3) {
                    canvas.drawLine(x1, y1, x2, y2, paint)
                }
            }
        }
    }
}

