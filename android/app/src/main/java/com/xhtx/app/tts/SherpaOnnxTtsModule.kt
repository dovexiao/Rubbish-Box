package com.xhtx.app.tts

import android.content.Context
import android.os.Handler
import android.os.Looper
import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.k2fsa.sherpa.onnx.*
import kotlinx.coroutines.*
import java.io.File

/**
 * Sherpa-ONNX TTS 模块
 * 提供高质量的离线语音合成
 */
class SherpaOnnxTtsModule(reactContext: ReactApplicationContext) : 
    ReactContextBaseJavaModule(reactContext) {
    
    private val TAG = "SherpaOnnxTts"
    private var tts: OfflineTts? = null
    private var isInitialized = false
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    
    // 暂时注释掉自动初始化，避免崩溃（Sherpa-ONNX库版本不匹配问题）
    // init {
    //     // 在模块创建时自动初始化第一个可用模型
    //     autoInitialize()
    // }
    
    override fun getName(): String = "SherpaOnnxTts"
    
    /**
     * 自动初始化第一个可用的模型
     */
    private fun autoInitialize() {
        Thread {
            try {
                val assetManager = reactApplicationContext.assets
                val modelDirs = assetManager.list("models") ?: return@Thread
                
                // 找到第一个有效模型
                val firstModel = modelDirs.firstOrNull { modelDir ->
                    val files = assetManager.list("models/$modelDir") ?: arrayOf()
                    files.any { it.endsWith(".onnx") } && files.contains("tokens.txt")
                }
                
                if (firstModel != null) {
                    Log.i(TAG, "🚀 启动时自动初始化模型: $firstModel")
                    initializeInternal(firstModel)
                } else {
                    Log.w(TAG, "⚠️ 未找到可用的TTS模型")
                }
            } catch (e: Exception) {
                Log.e(TAG, "⚠️ 自动初始化失败: ${e.message}", e)
            }
        }.start()
    }
    
    /**
     * 检查Sherpa-ONNX是否可用
     */
    @ReactMethod
    fun isAvailable(promise: Promise) {
        try {
            // 检查AAR是否正确加载
            val available = try {
                Class.forName("com.k2fsa.sherpa.onnx.OfflineTts")
                true
            } catch (e: ClassNotFoundException) {
                Log.w(TAG, "Sherpa-ONNX AAR 未找到")
                false
            }
            promise.resolve(available)
        } catch (e: Exception) {
            promise.reject("CHECK_ERROR", e.message)
        }
    }
    
    /**
     * 获取可用的模型列表（从assets读取）
     */
    @ReactMethod
    fun getAvailableModels(promise: Promise) {
        try {
            val models = WritableNativeArray()
            val assetManager = reactApplicationContext.assets
            
            try {
                // 列出 assets/models 目录下的所有模型
                val modelDirs = assetManager.list("models") ?: arrayOf()
                
                for (modelDir in modelDirs) {
                    // 检查是否包含必需的文件
                    val files = assetManager.list("models/$modelDir") ?: arrayOf()
                    val hasModel = files.any { it.endsWith(".onnx") }
                    val hasTokens = files.contains("tokens.txt")
                    
                    if (hasModel && hasTokens) {
                        val modelInfo = WritableNativeMap().apply {
                            putString("id", modelDir)
                            putString("name", modelDir)
                            putString("voiceType", if (modelDir.contains("amy")) "female" else "male")
                            putString("language", "en-US")
                            putString("description", formatModelName(modelDir))
                            putString("quality", if (modelDir.contains("high")) "high" else "medium")
                            putBoolean("isDownloaded", true)
                        }
                        models.pushMap(modelInfo)
                    }
                }
                
                Log.i(TAG, "📋 找到 ${models.size()} 个可用模型")
            } catch (e: Exception) {
                Log.w(TAG, "读取models目录失败", e)
            }
            
            promise.resolve(models)
        } catch (e: Exception) {
            Log.e(TAG, "获取模型列表失败", e)
            promise.reject("GET_MODELS_ERROR", e.message)
        }
    }
    
    /**
     * 格式化模型名称
     */
    private fun formatModelName(modelName: String): String {
        return when {
            modelName.contains("amy") -> "Amy - Natural US English Female"
            modelName.contains("libritts") -> "LibriTTS - High Quality US English"
            modelName.contains("alan") -> "Alan - British English Male"
            else -> modelName
        }
    }
    
    /**
     * 初始化核心逻辑（可被自动初始化和手动初始化调用）
     */
    private fun initializeInternal(modelName: String) {
        Log.i(TAG, "🔧 初始化 Sherpa-ONNX: $modelName")
        
        // 1. 复制模型到文件系统
        val modelDir = File(reactApplicationContext.filesDir, "sherpa/$modelName")
        modelDir.mkdirs()
        
        val modelFile = File(modelDir, "model.onnx")
        val tokensFile = File(modelDir, "tokens.txt")
        val dataDir = File(modelDir, "espeak-ng-data")
        dataDir.mkdirs()
        
        if (!modelFile.exists()) {
            Log.i(TAG, "📦 复制模型文件...")
            copyAsset("models/$modelName/en_US-amy-low.onnx", modelFile)
            copyAsset("models/$modelName/tokens.txt", tokensFile)
            copyAssetDir("models/$modelName/espeak-ng-data", dataDir)
            Log.i(TAG, "✅ 文件复制完成")
        }
        
        // 2. 使用文件路径配置
        val config = OfflineTtsConfig(
            model = OfflineTtsModelConfig(
                vits = OfflineTtsVitsModelConfig(
                    model = modelFile.absolutePath,
                    tokens = tokensFile.absolutePath,
                    dataDir = dataDir.absolutePath,
                    noiseScale = 0.667f,
                    noiseScaleW = 0.8f,
                    lengthScale = 1.0f
                ),
                numThreads = 2,
                debug = false,
                provider = "cpu"
            ),
            ruleFsts = "",
            maxNumSentences = 1
        )
        
        Log.i(TAG, "🔨 创建TTS实例...")
        // 使用文件系统路径时，必须传null作为AssetManager
        tts = OfflineTts(null, config)
        
        val sampleRate = tts!!.sampleRate()
        Log.i(TAG, "✅ Sherpa-ONNX 初始化成功，采样率: $sampleRate Hz")
        
        isInitialized = true
    }
    
    /**
     * 初始化 Sherpa-ONNX TTS
     * 使用独立线程 + 文件系统路径避免React Native冲突
     */
    @ReactMethod
    fun initialize(modelName: String, promise: Promise) {
        // 使用独立的Thread，不使用协程或Handler
        Thread {
            try {
                initializeInternal(modelName)
                
                // 在主线程返回结果
                Handler(Looper.getMainLooper()).post {
                    promise.resolve(true)
                }
                
            } catch (e: Exception) {
                Log.e(TAG, "❌ 初始化失败: ${e.message}", e)
                e.printStackTrace()
                Handler(Looper.getMainLooper()).post {
                    promise.reject("INIT_ERROR", e.message ?: "Unknown error")
                }
            }
        }.start()
    }
    
    private fun copyAsset(assetPath: String, dest: File) {
        reactApplicationContext.assets.open(assetPath).use { input ->
            dest.outputStream().use { output ->
                input.copyTo(output)
            }
        }
    }
    
    private fun copyAssetDir(assetPath: String, destDir: File) {
        val assets = reactApplicationContext.assets
        val files = assets.list(assetPath) ?: return
        
        if (files.isEmpty()) {
            // 是文件
            copyAsset(assetPath, destDir)
        } else {
            // 是目录
            destDir.mkdirs()
            for (file in files) {
                val subAsset = "$assetPath/$file"
                val subDest = File(destDir, file)
                copyAssetDir(subAsset, subDest)
            }
        }
    }
    
    /**
     * 语音合成
     */
    @ReactMethod
    fun synthesize(text: String, options: ReadableMap?, promise: Promise) {
        scope.launch {
            try {
                if (!isInitialized || tts == null) {
                    promise.reject("NOT_INITIALIZED", "TTS 未初始化")
                    return@launch
                }
                
                Log.i(TAG, "🔊 合成文本: ${text.take(50)}...")
                
                // 解析选项
                val speed = options?.getDouble("speed")?.toFloat() ?: 1.0f
                val sid = options?.getInt("speakerId") ?: 0
                
                // 生成音频
                val audio = tts!!.generate(
                    text = text,
                    sid = sid,
                    speed = speed
                )
                
                if (audio.samples.isEmpty()) {
                    withContext(Dispatchers.Main) {
                        promise.reject("SYNTHESIS_ERROR", "生成音频为空")
                    }
                    return@launch
                }
                
                // 保存到临时文件
                val context = reactApplicationContext
                val outputFile = File(context.cacheDir, "sherpa_tts_${System.currentTimeMillis()}.wav")
                
                audio.save(outputFile.absolutePath)
                
                Log.i(TAG, "✅ 音频已保存: ${outputFile.absolutePath}, 采样数: ${audio.samples.size}")
                
                withContext(Dispatchers.Main) {
                    val result = WritableNativeMap().apply {
                        putString("audioPath", outputFile.absolutePath)
                        putInt("sampleRate", audio.sampleRate)
                        putInt("numSamples", audio.samples.size)
                    }
                    promise.resolve(result)
                }
                
            } catch (e: Exception) {
                Log.e(TAG, "❌ 合成失败", e)
                withContext(Dispatchers.Main) {
                    promise.reject("SYNTHESIS_ERROR", e.message)
                }
            }
        }
    }
    
    /**
     * 停止播放
     */
    @ReactMethod
    fun stop(promise: Promise) {
        try {
            // TODO: 实现停止逻辑
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("STOP_ERROR", e.message)
        }
    }
    
    /**
     * 清理资源
     */
    @ReactMethod
    fun cleanup(promise: Promise) {
        try {
            isInitialized = false
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("CLEANUP_ERROR", e.message)
        }
    }
    
    override fun onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy()
        scope.cancel()
        tts = null
    }
}

