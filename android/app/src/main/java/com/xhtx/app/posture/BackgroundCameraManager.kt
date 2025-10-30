package com.xhtx.app.posture

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.graphics.ImageFormat
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Matrix
import android.hardware.camera2.*
import android.media.Image
import android.media.ImageReader
import android.os.Handler
import android.os.HandlerThread
import android.util.Log
import android.view.Surface
import androidx.core.app.ActivityCompat
import java.nio.ByteBuffer
import java.io.ByteArrayOutputStream

/**
 * 后台相机管理器
 * 使用 Camera2 API 在后台持续采集帧
 */
class BackgroundCameraManager(
    private val context: Context,
    private val onFrameCaptured: (imageData: ByteArray, width: Int, height: Int) -> Unit
) {
    companion object {
        private const val TAG = "BackgroundCameraManager"
        private const val IMAGE_WIDTH = 192
        private const val IMAGE_HEIGHT = 192
        private const val MAX_IMAGES = 2
    }

    private var cameraDevice: CameraDevice? = null
    private var captureSession: CameraCaptureSession? = null
    private var imageReader: ImageReader? = null
    
    private val cameraThread = HandlerThread("CameraThread").apply { start() }
    private val cameraHandler = Handler(cameraThread.looper)
    
    // 帧率控制：每秒只处理1帧（避免性能问题）
    private var lastProcessTime = 0L
    private val PROCESS_INTERVAL_MS = 10000L // 10秒处理一次（性能优化）
    
    private val cameraManager: CameraManager by lazy {
        context.getSystemService(Context.CAMERA_SERVICE) as CameraManager
    }

    fun startCamera() {
        if (ActivityCompat.checkSelfPermission(
                context,
                Manifest.permission.CAMERA
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            Log.e(TAG, "没有相机权限")
            return
        }

        try {
            val cameraId = getFrontCameraId() ?: run {
                Log.e(TAG, "未找到前置摄像头")
                return
            }

            Log.d(TAG, "开始打开相机: $cameraId")
            cameraManager.openCamera(cameraId, stateCallback, cameraHandler)
        } catch (e: Exception) {
            Log.e(TAG, "打开相机失败: ${e.message}", e)
        }
    }

    fun stopCamera() {
        try {
            captureSession?.close()
            captureSession = null
            
            cameraDevice?.close()
            cameraDevice = null
            
            imageReader?.close()
            imageReader = null
            
            Log.d(TAG, "相机已停止")
        } catch (e: Exception) {
            Log.e(TAG, "停止相机失败: ${e.message}", e)
        }
    }

    private fun getFrontCameraId(): String? {
        try {
            for (cameraId in cameraManager.cameraIdList) {
                val characteristics = cameraManager.getCameraCharacteristics(cameraId)
                val facing = characteristics.get(CameraCharacteristics.LENS_FACING)
                if (facing == CameraCharacteristics.LENS_FACING_FRONT) {
                    return cameraId
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "获取相机 ID 失败: ${e.message}", e)
        }
        return null
    }

    private val stateCallback = object : CameraDevice.StateCallback() {
        override fun onOpened(camera: CameraDevice) {
            Log.d(TAG, "相机已打开")
            cameraDevice = camera
            createCaptureSession()
        }

        override fun onDisconnected(camera: CameraDevice) {
            Log.d(TAG, "相机已断开")
            camera.close()
            cameraDevice = null
        }

        override fun onError(camera: CameraDevice, error: Int) {
            Log.e(TAG, "相机错误: $error")
            camera.close()
            cameraDevice = null
        }
    }

    private fun createCaptureSession() {
        try {
            // 创建 ImageReader
            imageReader = ImageReader.newInstance(
                IMAGE_WIDTH,
                IMAGE_HEIGHT,
                ImageFormat.YUV_420_888,
                MAX_IMAGES
            ).apply {
                setOnImageAvailableListener(imageAvailableListener, cameraHandler)
            }

            val surface = imageReader!!.surface
            
            // 创建 CaptureRequest
            val captureRequest = cameraDevice?.createCaptureRequest(
                CameraDevice.TEMPLATE_PREVIEW
            )?.apply {
                addTarget(surface)
                set(CaptureRequest.CONTROL_MODE, CameraMetadata.CONTROL_MODE_AUTO)
            }?.build() ?: return

            // 创建 CaptureSession
            cameraDevice?.createCaptureSession(
                listOf(surface),
                object : CameraCaptureSession.StateCallback() {
                    override fun onConfigured(session: CameraCaptureSession) {
                        Log.d(TAG, "CaptureSession 已配置")
                        captureSession = session
                        
                        try {
                            // 开始持续捕获
                            session.setRepeatingRequest(
                                captureRequest,
                                null,
                                cameraHandler
                            )
                            Log.d(TAG, "开始持续捕获帧")
                        } catch (e: Exception) {
                            Log.e(TAG, "开始捕获失败: ${e.message}", e)
                        }
                    }

                    override fun onConfigureFailed(session: CameraCaptureSession) {
                        Log.e(TAG, "CaptureSession 配置失败")
                    }
                },
                cameraHandler
            )
        } catch (e: Exception) {
            Log.e(TAG, "创建 CaptureSession 失败: ${e.message}", e)
        }
    }

    private val imageAvailableListener = ImageReader.OnImageAvailableListener { reader ->
        var image: Image? = null
        try {
            image = reader.acquireLatestImage()
            if (image != null) {
                // 帧率控制：只处理符合间隔的帧
                val currentTime = System.currentTimeMillis()
                if (currentTime - lastProcessTime < PROCESS_INTERVAL_MS) {
                    // 跳过此帧，避免过度处理
                    return@OnImageAvailableListener
                }
                lastProcessTime = currentTime
                
                Log.d(TAG, "📷 处理相机帧: ${image.width}x${image.height}")
                
                // 转换 YUV_420_888 到 RGB 字节数组
                val rgbData = yuv420ToRgb(image)
                
                // 缩放到模型期望的尺寸 (192x192)
                val scaledData = scaleImageData(
                    rgbData, 
                    image.width, 
                    image.height, 
                    IMAGE_WIDTH, 
                    IMAGE_HEIGHT
                )
                
                // 回调传递帧数据（使用缩放后的尺寸）
                onFrameCaptured(scaledData, IMAGE_WIDTH, IMAGE_HEIGHT)
            }
        } catch (e: Exception) {
            Log.e(TAG, "❌ 处理图像失败: ${e.message}", e)
        } finally {
            image?.close()
        }
    }

    private fun yuv420ToRgb(image: Image): ByteArray {
        val width = image.width
        val height = image.height
        val yPlane = image.planes[0]
        val uPlane = image.planes[1]
        val vPlane = image.planes[2]

        val yBuffer = yPlane.buffer
        val uBuffer = uPlane.buffer
        val vBuffer = vPlane.buffer

        val yRowStride = yPlane.rowStride
        val uvRowStride = uPlane.rowStride
        val uvPixelStride = uPlane.pixelStride

        val rgb = ByteArray(width * height * 3)

        // YUV420 转 RGB
        var rgbIndex = 0
        for (y in 0 until height) {
            for (x in 0 until width) {
                // 获取 Y 值
                val yIndex = y * yRowStride + x
                val Y = (yBuffer.get(yIndex).toInt() and 0xFF)

                // 获取 U, V 值 (UV 平面是交错的)
                val uvIndex = (y / 2) * uvRowStride + (x / 2) * uvPixelStride
                val U = (uBuffer.get(uvIndex).toInt() and 0xFF) - 128
                val V = (vBuffer.get(uvIndex).toInt() and 0xFF) - 128

                // YUV 转 RGB 公式
                var R = (Y + 1.370705f * V).toInt()
                var G = (Y - 0.337633f * U - 0.698001f * V).toInt()
                var B = (Y + 1.732446f * U).toInt()

                // 限制在 0-255
                R = R.coerceIn(0, 255)
                G = G.coerceIn(0, 255)
                B = B.coerceIn(0, 255)

                // 存储 RGB
                rgb[rgbIndex++] = R.toByte()
                rgb[rgbIndex++] = G.toByte()
                rgb[rgbIndex++] = B.toByte()
            }
        }

        return rgb
    }

    /**
     * 缩放 RGB 图像数据到目标尺寸
     */
    private fun scaleImageData(
        rgbData: ByteArray,
        srcWidth: Int,
        srcHeight: Int,
        targetWidth: Int,
        targetHeight: Int
    ): ByteArray {
        // 如果尺寸已经匹配，直接返回
        if (srcWidth == targetWidth && srcHeight == targetHeight) {
            return rgbData
        }

        // 创建 Bitmap
        val bitmap = Bitmap.createBitmap(srcWidth, srcHeight, Bitmap.Config.ARGB_8888)
        
        // 填充 RGB 数据到 Bitmap
        val pixels = IntArray(srcWidth * srcHeight)
        for (i in 0 until srcWidth * srcHeight) {
            val r = (rgbData[i * 3].toInt() and 0xFF)
            val g = (rgbData[i * 3 + 1].toInt() and 0xFF)
            val b = (rgbData[i * 3 + 2].toInt() and 0xFF)
            pixels[i] = (0xFF shl 24) or (r shl 16) or (g shl 8) or b
        }
        bitmap.setPixels(pixels, 0, srcWidth, 0, 0, srcWidth, srcHeight)

        // 缩放 Bitmap
        val scaledBitmap = Bitmap.createScaledBitmap(bitmap, targetWidth, targetHeight, true)

        // 转换回 RGB 字节数组
        val scaledRgbData = ByteArray(targetWidth * targetHeight * 3)
        val scaledPixels = IntArray(targetWidth * targetHeight)
        scaledBitmap.getPixels(scaledPixels, 0, targetWidth, 0, 0, targetWidth, targetHeight)

        for (i in scaledPixels.indices) {
            val pixel = scaledPixels[i]
            scaledRgbData[i * 3] = ((pixel shr 16) and 0xFF).toByte()
            scaledRgbData[i * 3 + 1] = ((pixel shr 8) and 0xFF).toByte()
            scaledRgbData[i * 3 + 2] = (pixel and 0xFF).toByte()
        }

        // 释放 Bitmap
        bitmap.recycle()
        scaledBitmap.recycle()

        return scaledRgbData
    }

    fun release() {
        stopCamera()
        cameraThread.quitSafely()
    }
}

