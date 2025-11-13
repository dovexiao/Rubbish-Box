/**
 * 音频播放服务
 * 管理姿势提示音频的播放
 */

import { Platform, Vibration } from "react-native";
import Sound from "react-native-sound";
import { AudioType } from "../types/posture";

// 音频文件映射
// ⚠️ Android raw 资源不要包含扩展名！
const AUDIO_FILES: Record<AudioType, string> = {
  good_posture: "good_posture",
  shoulders_not_level: "shoulders_not_level",
  head_not_centered: "head_not_centered",
  head_not_up: "head_not_up",
  adjust_posture: "adjust_posture",
  rest_reminder: "rest_reminder",
};

export class AudioService {
  private currentSound: Sound | null = null;
  private audioEnabled = true;
  private vibrationEnabled = true;
  private lastPlayTime = 0;
  private readonly MIN_PLAY_INTERVAL = 30000; // 30秒最小间隔（避免过于频繁）

  constructor() {
    // 设置音频类别和模式
    // Android 上使用 'Playback' 模式，iOS 上使用 'Ambient'
    if (Platform.OS === 'android') {
      Sound.setCategory('Playback', true); // 第二个参数 true 表示混音模式
    } else {
      Sound.setCategory('Playback');
    }
    
    // 启用 Sound 库
    Sound.setMode('Default');
    
    console.log('🔊 AudioService 初始化完成, Platform:', Platform.OS);
  }

  /**
   * 播放音频
   */
  async play(audioType: AudioType): Promise<void> {
    console.log('🎵 AudioService.play() 调用:', audioType);
    
    // 检查是否启用
    if (!this.audioEnabled) {
      console.log('⚠️ 音频已禁用');
      return;
    }

    // 防止频繁播放
    const now = Date.now();
    if (now - this.lastPlayTime < this.MIN_PLAY_INTERVAL) {
      console.log(`⚠️ 音频播放间隔过短 (${now - this.lastPlayTime}ms < ${this.MIN_PLAY_INTERVAL}ms)`);
      return;
    }

    try {
      // 停止当前音频
      this.stop();

      const fileName = AUDIO_FILES[audioType];
      if (!fileName) {
        console.warn(`❌ 未知音频类型: ${audioType}`);
        return;
      }

      console.log('📂 加载音频文件:', fileName, 'from', Sound.MAIN_BUNDLE);

      // 创建新音频对象
      this.currentSound = new Sound(
        fileName,
        Sound.MAIN_BUNDLE,
        (error) => {
          if (error) {
            console.error("❌ 音频加载失败:", error);
            console.error("❌ 错误详情:", JSON.stringify(error));
            return;
          }

          console.log('✅ 音频加载成功');
          console.log('📊 音频信息:', {
            duration: this.currentSound?.getDuration(),
            numberOfChannels: this.currentSound?.getNumberOfChannels(),
            volume: this.currentSound?.getVolume(),
            isLoaded: this.currentSound?.isLoaded(),
          });

          // 设置音量为最大
          this.currentSound?.setVolume(1.0);
          
          console.log('🔊 开始播放音频...');

          // 播放音频
          this.currentSound?.play((success) => {
            if (!success) {
              console.warn("⚠️ 音频播放失败，success=false");
            } else {
              console.log("✅ 音频播放完成，success=true");
            }
            this.cleanup();
          });
        }
      );

      this.lastPlayTime = now;
    } catch (error) {
      console.error("❌ 播放音频异常:", error);
      this.cleanup();
    }
  }

  /**
   * 停止当前音频
   */
  stop(): void {
    if (this.currentSound) {
      this.currentSound.stop(() => {
        this.cleanup();
      });
    }
  }

  /**
   * 清理音频资源
   */
  private cleanup(): void {
    if (this.currentSound) {
      this.currentSound.release();
      this.currentSound = null;
    }
  }

  /**
   * 震动
   */
  vibrate(duration = 500): void {
    if (!this.vibrationEnabled) {
      return;
    }

    try {
      if (Platform.OS === "android") {
        Vibration.vibrate(duration);
      } else {
        // iOS 不支持自定义震动时长
        Vibration.vibrate();
      }
    } catch (error) {
      console.error("Vibration error:", error);
    }
  }

  /**
   * 设置音频启用状态
   */
  setAudioEnabled(enabled: boolean): void {
    this.audioEnabled = enabled;
    if (!enabled) {
      this.stop();
    }
  }

  /**
   * 设置震动启用状态
   */
  setVibrationEnabled(enabled: boolean): void {
    this.vibrationEnabled = enabled;
  }

  /**
   * 获取音频启用状态
   */
  isAudioEnabled(): boolean {
    return this.audioEnabled;
  }

  /**
   * 获取震动启用状态
   */
  isVibrationEnabled(): boolean {
    return this.vibrationEnabled;
  }

  /**
   * 释放所有资源
   */
  dispose(): void {
    this.stop();
  }
}

// 导出单例
export const audioService = new AudioService();


