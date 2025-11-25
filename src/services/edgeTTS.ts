/**
 * 免费 TTS 服务
 * 使用 Google Translate 的免费 TTS API（无需 API Key）
 * 音质自然，国内可用
 */

import * as FileSystem from 'expo-file-system'

interface EdgeTTSOptions {
  voice?: string // 语音名称（暂时不用）
  rate?: string // 语速（暂时不用）
  pitch?: string // 音调（暂时不用）
  volume?: string // 音量（暂时不用）
}

/**
 * TTS 服务类
 */
export class EdgeTTSService {
  private static instance: EdgeTTSService
  // 使用 Google Translate TTS（免费，无需 API Key）
  private baseUrl = 'https://translate.google.com/translate_tts'
  
  // 可用的英语语音（神经网络语音）
  public static readonly VOICES = {
    // 美式英语
    'en-US-AriaNeural': '美式英语-女声(Aria)-自然流畅',
    'en-US-GuyNeural': '美式英语-男声(Guy)-沉稳',
    'en-US-JennyNeural': '美式英语-女声(Jenny)-温柔',
    'en-US-ChristopherNeural': '美式英语-男声(Christopher)-专业',
    
    // 英式英语
    'en-GB-SoniaNeural': '英式英语-女声(Sonia)-优雅',
    'en-GB-RyanNeural': '英式英语-男声(Ryan)-绅士',
    
    // 澳洲英语
    'en-AU-NatashaNeural': '澳洲英语-女声(Natasha)-活泼',
    'en-AU-WilliamNeural': '澳洲英语-男声(William)-友好',
  }

  private constructor() {}

  static getInstance(): EdgeTTSService {
    if (!EdgeTTSService.instance) {
      EdgeTTSService.instance = new EdgeTTSService()
    }
    return EdgeTTSService.instance
  }

  /**
   * 生成 SSML 格式的文本
   */
  private generateSSML(text: string, options: EdgeTTSOptions): string {
    const {
      voice = 'en-US-JennyNeural', // 默认使用 Jenny（温柔女声）
      rate = '+0%', // 默认正常语速
      pitch = '+0Hz', // 默认正常音调
      volume = '+0%', // 默认正常音量
    } = options

    return `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'>
      <voice name='${voice}'>
        <prosody rate='${rate}' pitch='${pitch}' volume='${volume}'>
          ${this.escapeXml(text)}
        </prosody>
      </voice>
    </speak>`
  }

  /**
   * 转义 XML 特殊字符
   */
  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }

  /**
   * 生成随机请求 ID
   */
  private generateRequestId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  /**
   * 将文本转换为语音并保存到本地文件
   * @param text 要转换的文本
   * @param options TTS 选项
   * @returns 音频文件的本地路径
   */
  async textToSpeech(text: string, options: EdgeTTSOptions = {}): Promise<string> {
    try {
      console.log('🔊 TTS 请求:', {
        text: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
      })

      // 使用 Google Translate TTS（免费，无需 API Key）
      const params = new URLSearchParams({
        ie: 'UTF-8',
        tl: 'en',
        client: 'tw-ob',
        q: text,
      })

      const url = `${this.baseUrl}?${params.toString()}`
      console.log('📡 请求 URL:', url.substring(0, 100) + '...')

      // 添加超时控制
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10秒超时

      console.log('⏳ 开始请求...')
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://translate.google.com/',
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      console.log('✓ 收到响应:', response.status, response.statusText)

      if (!response.ok) {
        throw new Error(`TTS 服务错误: ${response.status} ${response.statusText}`)
      }

      console.log('⏳ 下载音频数据...')
      const arrayBuffer = await response.arrayBuffer()
      console.log('✓ 音频数据大小:', arrayBuffer.byteLength, 'bytes')
      
      // 保存音频到本地临时文件
      const fileName = `tts_${Date.now()}.mp3`
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`
      
      console.log('⏳ 转换为 base64...')
      const base64Audio = this.arrayBufferToBase64(arrayBuffer)
      
      console.log('⏳ 写入文件...')
      await FileSystem.writeAsStringAsync(fileUri, base64Audio, {
        encoding: FileSystem.EncodingType.Base64,
      })

      console.log('✅ TTS 音频已保存:', fileUri)
      return fileUri
    } catch (error) {
      console.error('❌ TTS 请求失败:', error)
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('请求超时，请检查网络连接')
        } else if (error.message.includes('Network request failed')) {
          throw new Error('网络连接失败，请检查网络设置')
        }
      }
      
      throw error
    }
  }

  /**
   * 将 ArrayBuffer 转换为 Base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  /**
   * 清理缓存的音频文件
   */
  async clearCache(): Promise<void> {
    try {
      const cacheDir = FileSystem.cacheDirectory
      if (!cacheDir) return

      const files = await FileSystem.readDirectoryAsync(cacheDir)
      const ttsFiles = files.filter((file) => file.startsWith('tts_'))

      for (const file of ttsFiles) {
        await FileSystem.deleteAsync(`${cacheDir}${file}`, { idempotent: true })
      }

      console.log(`🗑️ 已清理 ${ttsFiles.length} 个 TTS 缓存文件`)
    } catch (error) {
      console.error('清理 TTS 缓存失败:', error)
    }
  }
}

// 导出单例
export const edgeTTS = EdgeTTSService.getInstance()

