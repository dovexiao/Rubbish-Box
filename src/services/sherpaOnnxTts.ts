/**
 * Sherpa-ONNX TTS 服务
 * 提供高质量的离线语音合成
 */

import { NativeModules, NativeEventEmitter, Platform } from 'react-native'
import { Audio } from 'expo-av'

const { SherpaOnnxTts } = NativeModules

// 事件发射器
const sherpaEmitter = Platform.OS === 'android' && SherpaOnnxTts 
  ? new NativeEventEmitter(SherpaOnnxTts) 
  : null

// 模型信息接口
export interface SherpaModel {
  id: string
  name: string
  voiceType: 'male' | 'female'
  language: string
  description: string
  quality: 'low' | 'medium' | 'high'
  isDownloaded: boolean
}

// 合成选项
export interface SherpaSynthesizeOptions {
  speed?: number      // 语速 0.5-2.0，默认1.0
  speakerId?: number  // 说话人ID，默认0
}

// 合成结果
export interface SherpaSynthesizeResult {
  audioPath: string
  sampleRate: number
  numSamples: number
}

/**
 * Sherpa-ONNX TTS 服务类
 */
class SherpaOnnxTtsService {
  private static instance: SherpaOnnxTtsService
  private isInitialized: boolean = false
  private currentModel: string | null = null
  private isAvailable: boolean = false
  private currentSound: Audio.Sound | null = null
  
  private constructor() {
    this.checkAvailability()
    this.setupEventListeners()
  }
  
  static getInstance(): SherpaOnnxTtsService {
    if (!SherpaOnnxTtsService.instance) {
      SherpaOnnxTtsService.instance = new SherpaOnnxTtsService()
    }
    return SherpaOnnxTtsService.instance
  }
  
  /**
   * 检查模块是否可用
   */
  private checkAvailability() {
    this.isAvailable = Platform.OS === 'android' && !!SherpaOnnxTts
    if (!this.isAvailable) {
      console.warn('⚠️ Sherpa-ONNX 仅在 Android 上可用')
    }
  }
  
  /**
   * 设置事件监听
   */
  private setupEventListeners() {
    if (!sherpaEmitter) return
    
    sherpaEmitter.addListener('onSynthesisComplete', (result: SherpaSynthesizeResult) => {
      console.log('✓ Sherpa-ONNX 合成完成:', result.audioPath)
    })
  }
  
  /**
   * 获取可用的模型列表
   */
  async getAvailableModels(): Promise<SherpaModel[]> {
    if (!this.isAvailable) {
      return []
    }
    
    try {
      const models = await SherpaOnnxTts.getAvailableModels()
      return models || []
    } catch (error) {
      console.error('获取模型列表失败:', error)
      return []
    }
  }
  
  /**
   * 下载模型
   */
  async downloadModel(modelId: string): Promise<boolean> {
    if (!this.isAvailable) {
      return false
    }
    
    try {
      console.log('📥 开始下载模型:', modelId)
      await SherpaOnnxTts.downloadModel(modelId)
      console.log('✅ 模型下载完成:', modelId)
      return true
    } catch (error) {
      console.error('模型下载失败:', error)
      return false
    }
  }
  
  /**
   * 初始化指定模型
   */
  async initialize(modelName: string): Promise<boolean> {
    if (!this.isAvailable) {
      console.warn('Sherpa-ONNX 不可用')
      return false
    }
    
    try {
      console.log('🔧 初始化 Sherpa-ONNX:', modelName)
      await SherpaOnnxTts.initialize(modelName)
      this.isInitialized = true
      this.currentModel = modelName
      console.log('✅ Sherpa-ONNX 初始化成功')
      return true
    } catch (error) {
      console.error('Sherpa-ONNX 初始化失败:', error)
      this.isInitialized = false
      return false
    }
  }
  
  /**
   * 语音合成
   */
  async synthesize(
    text: string, 
    options?: SherpaSynthesizeOptions
  ): Promise<string | null> {
    if (!this.isAvailable || !this.isInitialized) {
      console.warn('Sherpa-ONNX 未初始化')
      return null
    }
    
    try {
      console.log('🔊 Sherpa-ONNX 合成:', text.substring(0, 50) + '...')
      
      const result: SherpaSynthesizeResult = await SherpaOnnxTts.synthesize(
        text,
        options || {}
      )
      
      return result.audioPath
    } catch (error) {
      console.error('Sherpa-ONNX 合成失败:', error)
      return null
    }
  }
  
  /**
   * 合成并播放
   */
  async speak(text: string, options?: SherpaSynthesizeOptions): Promise<void> {
    try {
      // 先合成音频
      const audioPath = await this.synthesize(text, options)
      
      if (!audioPath) {
        throw new Error('音频合成失败')
      }
      
      // 停止当前播放
      if (this.currentSound) {
        await this.currentSound.stopAsync()
        await this.currentSound.unloadAsync()
        this.currentSound = null
      }
      
      // 播放音频
      console.log('▶️ 播放音频:', audioPath)
      const { sound } = await Audio.Sound.createAsync(
        { uri: `file://${audioPath}` },
        { shouldPlay: true }
      )
      
      this.currentSound = sound
      
      // 监听播放完成
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          console.log('✓ 播放完成')
          sound.unloadAsync()
          this.currentSound = null
        }
      })
      
    } catch (error) {
      console.error('Sherpa-ONNX 播放失败:', error)
      throw error
    }
  }
  
  /**
   * 停止播放
   */
  async stop(): Promise<void> {
    if (this.currentSound) {
      try {
        await this.currentSound.stopAsync()
        await this.currentSound.unloadAsync()
        this.currentSound = null
      } catch (error) {
        console.error('停止播放失败:', error)
      }
    }
  }
  
  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    await this.stop()
    
    if (this.isAvailable && this.isInitialized) {
      try {
        await SherpaOnnxTts.cleanup()
        this.isInitialized = false
        this.currentModel = null
      } catch (error) {
        console.error('清理资源失败:', error)
      }
    }
  }
  
  /**
   * 检查是否可用
   */
  isModuleAvailable(): boolean {
    return this.isAvailable
  }
  
  /**
   * 获取当前模型
   */
  getCurrentModel(): string | null {
    return this.currentModel
  }
}

// 导出单例
export const sherpaOnnxTts = SherpaOnnxTtsService.getInstance()

// 预设的推荐模型
export const RECOMMENDED_MODELS = [
  {
    id: 'vits-piper-en_US-amy-low',
    name: 'Amy',
    description: '自然的美式英语女声',
    quality: 'medium',
    size: '60MB',
  },
]

