/**
 * 讯飞TTS服务 - 调用原生TTS模块
 * 支持系统TTS引擎（包括科大讯飞离线引擎）
 * 提供更丰富的发音人选择和参数控制
 */

import { NativeModules, NativeEventEmitter, Platform } from 'react-native'

const { XfTts } = NativeModules

// TTS事件发射器
const ttsEmitter = Platform.OS === 'android' && XfTts ? new NativeEventEmitter(XfTts) : null

// 语音信息接口
export interface VoiceInfo {
  id: string
  name: string
  language: string
  country: string
  quality: number
  networkRequired?: boolean
  isEnglish?: boolean
  gender?: 'male' | 'female' | 'unknown'
}

// TTS播放选项
export interface TtsOptions {
  rate?: number      // 语速 0.1-2.0，默认1.0
  pitch?: number     // 音调 0.5-2.0，默认1.0
  language?: string  // 语言代码，如 'en-US', 'zh-CN'
}

// 回调函数类型
type TtsCallback = (utteranceId: string) => void

/**
 * 讯飞TTS服务类
 */
class XfTtsService {
  private static instance: XfTtsService
  private onStartCallback?: TtsCallback
  private onDoneCallback?: TtsCallback
  private onErrorCallback?: TtsCallback
  private isAvailable: boolean = false
  
  private constructor() {
    this.setupEventListeners()
    this.checkAvailability()
  }
  
  static getInstance(): XfTtsService {
    if (!XfTtsService.instance) {
      XfTtsService.instance = new XfTtsService()
    }
    return XfTtsService.instance
  }
  
  /**
   * 检查TTS是否可用
   */
  private checkAvailability() {
    this.isAvailable = Platform.OS === 'android' && !!XfTts
    if (!this.isAvailable) {
      console.warn('⚠️ XfTts模块不可用，当前平台:', Platform.OS)
    }
  }
  
  /**
   * 设置事件监听
   */
  private setupEventListeners() {
    if (!ttsEmitter) return
    
    ttsEmitter.addListener('ttsStart', (event: { utteranceId: string }) => {
      console.log('🔊 TTS开始播放:', event.utteranceId)
      this.onStartCallback?.(event.utteranceId)
    })
    
    ttsEmitter.addListener('ttsDone', (event: { utteranceId: string }) => {
      console.log('✓ TTS播放完成:', event.utteranceId)
      this.onDoneCallback?.(event.utteranceId)
    })
    
    ttsEmitter.addListener('ttsError', (event: { utteranceId: string }) => {
      console.error('❌ TTS播放错误:', event.utteranceId)
      this.onErrorCallback?.(event.utteranceId)
    })
  }
  
  /**
   * 获取所有可用的语音列表
   */
  async getVoices(): Promise<VoiceInfo[]> {
    if (!this.isAvailable) {
      console.warn('TTS不可用')
      return []
    }
    
    try {
      const voices = await XfTts.getVoices()
      return voices || []
    } catch (error) {
      console.error('获取语音列表失败:', error)
      return []
    }
  }
  
  /**
   * 获取推荐的英语发音人列表
   */
  async getRecommendedEnglishVoices(): Promise<VoiceInfo[]> {
    if (!this.isAvailable) {
      return []
    }
    
    try {
      const voices = await XfTts.getRecommendedEnglishVoices()
      return voices || []
    } catch (error) {
      console.error('获取英语语音列表失败:', error)
      return []
    }
  }
  
  /**
   * 设置发音人
   * @param voiceId 发音人ID
   */
  async setVoice(voiceId: string): Promise<boolean> {
    if (!this.isAvailable) {
      return false
    }
    
    try {
      await XfTts.setVoice(voiceId)
      console.log('✓ 设置发音人成功:', voiceId)
      return true
    } catch (error) {
      console.error('设置发音人失败:', error)
      return false
    }
  }
  
  /**
   * 设置语速
   * @param rate 0.1-2.0，1.0为正常
   */
  async setSpeechRate(rate: number): Promise<boolean> {
    if (!this.isAvailable) {
      return false
    }
    
    try {
      await XfTts.setSpeechRate(rate)
      return true
    } catch (error) {
      console.error('设置语速失败:', error)
      return false
    }
  }
  
  /**
   * 设置音调
   * @param pitch 0.5-2.0，1.0为正常
   */
  async setPitch(pitch: number): Promise<boolean> {
    if (!this.isAvailable) {
      return false
    }
    
    try {
      await XfTts.setPitch(pitch)
      return true
    } catch (error) {
      console.error('设置音调失败:', error)
      return false
    }
  }
  
  /**
   * 播放文本
   * @param text 要播放的文本
   * @param options 播放选项
   */
  async speak(text: string, options?: TtsOptions): Promise<string | null> {
    if (!this.isAvailable) {
      console.warn('TTS不可用，无法播放')
      return null
    }
    
    try {
      const utteranceId = await XfTts.speak(text, options || {})
      return utteranceId
    } catch (error) {
      console.error('TTS播放失败:', error)
      return null
    }
  }
  
  /**
   * 停止播放
   */
  async stop(): Promise<void> {
    if (!this.isAvailable) {
      return
    }
    
    try {
      await XfTts.stop()
    } catch (error) {
      console.error('停止TTS失败:', error)
    }
  }
  
  /**
   * 检查是否正在播放
   */
  async isSpeaking(): Promise<boolean> {
    if (!this.isAvailable) {
      return false
    }
    
    try {
      return await XfTts.isSpeaking()
    } catch (error) {
      return false
    }
  }
  
  /**
   * 设置回调函数
   */
  setCallbacks(callbacks: {
    onStart?: TtsCallback
    onDone?: TtsCallback
    onError?: TtsCallback
  }) {
    this.onStartCallback = callbacks.onStart
    this.onDoneCallback = callbacks.onDone
    this.onErrorCallback = callbacks.onError
  }
  
  /**
   * 检查模块是否可用
   */
  isModuleAvailable(): boolean {
    return this.isAvailable
  }
}

// 导出单例
export const xfTts = XfTtsService.getInstance()

// 预设的发音人配置（用于UI展示）
export const PRESET_VOICES = {
  // 系统默认英语语音
  'default-en-us': {
    id: 'default',
    name: '系统默认',
    description: '使用系统TTS默认英语语音',
    language: 'en-US',
  },
  // 以下是科大讯飞常见的发音人（需要安装对应语音包）
  'catherine': {
    id: 'catherine',
    name: 'Catherine',
    description: '英文女声 - 标准美式发音',
    language: 'en-US',
    gender: 'female',
  },
  'henry': {
    id: 'henry',
    name: 'Henry',
    description: '英文男声 - 标准美式发音',
    language: 'en-US',
    gender: 'male',
  },
}

