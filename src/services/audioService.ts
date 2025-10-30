/**
 * 音频播放服务
 * 管理姿势提示音频的播放
 */

import { Platform, Vibration } from "react-native";
import Sound from "react-native-sound";
import { AudioType } from "../types/posture";

// 音频文件映射
const AUDIO_FILES: Record<AudioType, string> = {
  good_posture: "good_posture.mp3",
  shoulders_not_level: "shoulders_not_level.mp3",
  head_not_centered: "head_not_centered.mp3",
  head_not_up: "head_not_up.mp3",
  adjust_posture: "adjust_posture.mp3",
  rest_reminder: "rest_reminder.mp3",
};

export class AudioService {
  private currentSound: Sound | null = null;
  private audioEnabled = true;
  private vibrationEnabled = true;
  private lastPlayTime = 0;
  private readonly MIN_PLAY_INTERVAL = 30000; // 30秒最小间隔

  constructor() {
    // 设置音频类别
    Sound.setCategory("Playback");
  }

  /**
   * 播放音频
   */
  async play(audioType: AudioType): Promise<void> {
    // 检查是否启用
    if (!this.audioEnabled) {
      return;
    }

    // 防止频繁播放
    const now = Date.now();
    if (now - this.lastPlayTime < this.MIN_PLAY_INTERVAL) {
      return;
    }

    try {
      // 停止当前音频
      this.stop();

      const fileName = AUDIO_FILES[audioType];
      if (!fileName) {
        console.warn(`Unknown audio type: ${audioType}`);
        return;
      }

      // 创建新音频对象
      this.currentSound = new Sound(
        fileName,
        Sound.MAIN_BUNDLE,
        (error) => {
          if (error) {
            console.error("Failed to load sound", error);
            return;
          }

          // 播放音频
          this.currentSound?.play((success) => {
            if (!success) {
              console.warn("Sound playback failed");
            }
            this.cleanup();
          });
        }
      );

      this.lastPlayTime = now;
    } catch (error) {
      console.error("Error playing audio:", error);
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


