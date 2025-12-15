/**
 * 姿势监控服务
 * 整合相机、AI检测、评估、音频提示和数据统计
 */

import {
  PostureStatus,
  PoseData,
  PostureStatistics,
  PostureMonitorConfig,
  PostureEventCallbacks,
} from "../types/posture";
import { postureEvaluator } from "./postureEvaluator";
import { audioService } from "./audioService";
import { postureStorage } from "./postureStorage";

// 默认配置
const DEFAULT_CONFIG: PostureMonitorConfig = {
  detectionInterval: 333, // 3fps
  updateInterval: 30000, // 30秒更新一次统计
  rewardThreshold: 600, // 10分钟 (600次 @ 1次/秒)
  enableAudio: true,
  enableVibration: true,
  minConfidence: 0.3,
};

export class PostureMonitorService {
  private config: PostureMonitorConfig;
  private callbacks: PostureEventCallbacks;
  private statistics: PostureStatistics;
  private isMonitoring = false;
  private lastStatus: PostureStatus = "detecting";
  private lastUpdateTime = 0;
  private lastDetectionTime = 0;
  private statusChangeTime = 0;

  constructor(
    config: Partial<PostureMonitorConfig> = {},
    callbacks: PostureEventCallbacks = {}
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.callbacks = callbacks;
    this.statistics = {
      good: 0,
      shouldersNotLevel: 0,
      headNotCentered: 0,
      headNotUp: 0,
      total: 0,
      rewardCount: 0,
      lastUpdateTime: Date.now(),
    };

    // 配置音频服务
    audioService.setAudioEnabled(this.config.enableAudio);
    audioService.setVibrationEnabled(this.config.enableVibration);
  }

  /**
   * 开始监控
   */
  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      console.warn("Posture monitoring already started");
      return;
    }

    try {
      // 加载历史统计数据
      this.statistics = await postureStorage.loadStatistics();
      this.isMonitoring = true;
      this.lastUpdateTime = Date.now();
      this.lastDetectionTime = Date.now();
      this.statusChangeTime = Date.now();

      console.log("Posture monitoring started");
    } catch (error) {
      console.error("Failed to start monitoring:", error);
      this.callbacks.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * 停止监控
   */
  async stopMonitoring(): Promise<void> {
    if (!this.isMonitoring) {
      return;
    }

    try {
      // 保存统计数据
      await postureStorage.saveStatistics(this.statistics);
      
      this.isMonitoring = false;
      audioService.stop();

      console.log("Posture monitoring stopped");
    } catch (error) {
      console.error("Failed to stop monitoring:", error);
    }
  }

  /**
   * 处理检测到的姿势数据
   * 这是外部（如相机 Frame Processor）调用的核心方法
   */
  async processPoseData(poseData: PoseData): Promise<void> {
    if (!this.isMonitoring) {
      return;
    }

    const now = Date.now();

    // 帧率控制
    if (now - this.lastDetectionTime < this.config.detectionInterval) {
      return;
    }
    this.lastDetectionTime = now;

    try {
      // 评估姿势
      const status = postureEvaluator.evaluate(poseData.keypoints);
      const confidence = postureEvaluator.calculateConfidence(poseData.keypoints);

      const enrichedData: PoseData = {
        ...poseData,
        status,
        confidence,
        timestamp: now,
      };

      // 触发检测回调
      this.callbacks.onPoseDetected?.(enrichedData);

      // 每秒更新一次统计
      if (now - this.statusChangeTime >= 1000) {
        await this.updateStatistics(status);
        this.statusChangeTime = now;
      }

      // 状态变化处理
      if (status !== this.lastStatus) {
        await this.handleStatusChange(status, this.lastStatus);
        this.lastStatus = status;
      }

      // 定期保存统计数据
      if (now - this.lastUpdateTime >= this.config.updateInterval) {
        await postureStorage.saveStatistics(this.statistics);
        this.lastUpdateTime = now;
      }
    } catch (error) {
      console.error("Error processing pose data:", error);
      this.callbacks.onError?.(error as Error);
    }
  }

  /**
   * 更新统计数据
   */
  private async updateStatistics(status: PostureStatus): Promise<void> {
    // 跳过 detecting 和 no_person 状态
    if (status === "detecting" || status === "no_person") {
      return;
    }

    // 更新对应计数
    switch (status) {
      case "good":
        this.statistics.good++;
        this.statistics.rewardCount++;
        break;
      case "shoulders_not_level":
        this.statistics.shouldersNotLevel++;
        this.statistics.rewardCount++;
        break;
      case "head_not_centered":
        this.statistics.headNotCentered++;
        this.statistics.rewardCount++;
        break;
      case "head_not_up":
        this.statistics.headNotUp++;
        this.statistics.rewardCount++;
        break;
    }

    this.statistics.total++;
    this.statistics.lastUpdateTime = Date.now();

    // 检查是否达到奖励阈值
    if (this.statistics.rewardCount >= this.config.rewardThreshold) {
      this.handleRewardAchieved();
    }
  }

  /**
   * 处理状态变化
   */
  private async handleStatusChange(
    newStatus: PostureStatus,
    oldStatus: PostureStatus
  ): Promise<void> {
    console.log(`Posture status changed: ${oldStatus} -> ${newStatus}`);

    // 触发状态变化回调
    this.callbacks.onStatusChanged?.(newStatus);

    // 跳过 no_person 和 detecting 状态的音频提示
    if (newStatus === "no_person" || newStatus === "detecting") {
      return;
    }

    // 播放对应的音频提示
    const audioType = postureEvaluator.getAudioType(newStatus);
    if (audioType) {
      await audioService.play(audioType as any);
    }

    // 不良姿势时震动提示
    if (newStatus !== "good") {
      audioService.vibrate(500);
    }
  }

  /**
   * 处理奖励达成
   */
  private handleRewardAchieved(): void {
    console.log(
      `Reward achieved! Count: ${this.statistics.rewardCount}`
    );

    // 触发奖励回调
    this.callbacks.onRewardAchieved?.(this.statistics.rewardCount);

    // 播放奖励音频
    audioService.play("good_posture");
    audioService.vibrate(800);

    // 重置奖励计数
    this.statistics.rewardCount = 0;
  }

  /**
   * 获取当前统计数据
   */
  getStatistics(): PostureStatistics {
    return { ...this.statistics };
  }

  /**
   * 重置统计数据
   */
  async resetStatistics(): Promise<void> {
    this.statistics = {
      good: 0,
      shouldersNotLevel: 0,
      headNotCentered: 0,
      headNotUp: 0,
      total: 0,
      rewardCount: 0,
      lastUpdateTime: Date.now(),
    };
    await postureStorage.saveStatistics(this.statistics);
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<PostureMonitorConfig>): void {
    this.config = { ...this.config, ...config };
    
    // 更新音频服务配置
    if (config.enableAudio !== undefined) {
      audioService.setAudioEnabled(config.enableAudio);
    }
    if (config.enableVibration !== undefined) {
      audioService.setVibrationEnabled(config.enableVibration);
    }
  }

  /**
   * 获取当前配置
   */
  getConfig(): PostureMonitorConfig {
    return { ...this.config };
  }

  /**
   * 手动触发音频测试
   */
  async testAudio(audioType: string): Promise<void> {
    await audioService.play(audioType as any);
  }

  /**
   * 检查监控状态
   */
  isMonitoringActive(): boolean {
    return this.isMonitoring;
  }

  /**
   * 释放资源
   */
  dispose(): void {
    this.stopMonitoring();
    audioService.dispose();
  }
}

// 创建默认实例
let defaultInstance: PostureMonitorService | null = null;

/**
 * 获取默认实例
 */
export function getPostureMonitorService(): PostureMonitorService {
  if (!defaultInstance) {
    defaultInstance = new PostureMonitorService();
  }
  return defaultInstance;
}

/**
 * 重置默认实例
 */
export function resetPostureMonitorService(): void {
  if (defaultInstance) {
    defaultInstance.dispose();
    defaultInstance = null;
  }
}

