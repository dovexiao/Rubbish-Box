/**
 * 姿势数据持久化服务
 * 使用 AsyncStorage 存储统计数据
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { PostureStatistics } from "../types/posture";

// 存储键
const STORAGE_KEYS = {
  STATISTICS: "@posture_statistics",
  LAST_DATE: "@posture_last_date",
  CONFIG: "@posture_config",
};

// 默认统计数据
const DEFAULT_STATISTICS: PostureStatistics = {
  good: 0,
  shouldersNotLevel: 0,
  headNotCentered: 0,
  headNotUp: 0,
  total: 0,
  rewardCount: 0,
  lastUpdateTime: Date.now(),
};

export class PostureStorageService {
  /**
   * 加载统计数据
   */
  async loadStatistics(): Promise<PostureStatistics> {
    try {
      const today = this.getToday();
      const lastDate = await AsyncStorage.getItem(STORAGE_KEYS.LAST_DATE);

      // 如果是新的一天，重置统计数据
      if (lastDate !== today) {
        await this.resetDailyStatistics();
        return { ...DEFAULT_STATISTICS };
      }

      // 加载现有数据
      const data = await AsyncStorage.getItem(STORAGE_KEYS.STATISTICS);
      if (data) {
        return JSON.parse(data);
      }

      return { ...DEFAULT_STATISTICS };
    } catch (error) {
      console.error("Failed to load statistics:", error);
      return { ...DEFAULT_STATISTICS };
    }
  }

  /**
   * 保存统计数据
   */
  async saveStatistics(stats: PostureStatistics): Promise<void> {
    try {
      const today = this.getToday();
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.STATISTICS, JSON.stringify(stats)],
        [STORAGE_KEYS.LAST_DATE, today],
      ]);
    } catch (error) {
      console.error("Failed to save statistics:", error);
    }
  }

  /**
   * 更新统计数据
   */
  async updateStatistics(
    updates: Partial<PostureStatistics>
  ): Promise<PostureStatistics> {
    const current = await this.loadStatistics();
    const updated: PostureStatistics = {
      ...current,
      ...updates,
      lastUpdateTime: Date.now(),
    };
    await this.saveStatistics(updated);
    return updated;
  }

  /**
   * 增加计数
   */
  async incrementCount(
    field: keyof Pick<
      PostureStatistics,
      "good" | "shouldersNotLevel" | "headNotCentered" | "headNotUp" | "total" | "rewardCount"
    >,
    amount = 1
  ): Promise<PostureStatistics> {
    const current = await this.loadStatistics();
    const updated: PostureStatistics = {
      ...current,
      [field]: (current[field] as number) + amount,
      lastUpdateTime: Date.now(),
    };
    await this.saveStatistics(updated);
    return updated;
  }

  /**
   * 重置每日统计数据
   */
  async resetDailyStatistics(): Promise<void> {
    try {
      const today = this.getToday();
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.STATISTICS, JSON.stringify(DEFAULT_STATISTICS)],
        [STORAGE_KEYS.LAST_DATE, today],
      ]);
    } catch (error) {
      console.error("Failed to reset daily statistics:", error);
    }
  }

  /**
   * 清除所有数据
   */
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.STATISTICS,
        STORAGE_KEYS.LAST_DATE,
        STORAGE_KEYS.CONFIG,
      ]);
    } catch (error) {
      console.error("Failed to clear storage:", error);
    }
  }

  /**
   * 获取今天的日期字符串
   */
  private getToday(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  }

  /**
   * 导出统计数据（用于调试）
   */
  async exportStatistics(): Promise<string> {
    try {
      const stats = await this.loadStatistics();
      return JSON.stringify(stats, null, 2);
    } catch (error) {
      console.error("Failed to export statistics:", error);
      return "{}";
    }
  }

  /**
   * 获取统计摘要
   */
  async getStatisticsSummary(): Promise<{
    totalDetections: number;
    goodPercentage: number;
    mostCommonIssue: string;
  }> {
    const stats = await this.loadStatistics();
    const total = stats.total || 1; // 避免除以0

    let mostCommonIssue = "无";
    let maxCount = 0;

    const issues: Record<string, number> = {
      肩膀不平: stats.shouldersNotLevel,
      头部不居中: stats.headNotCentered,
      头部未抬起: stats.headNotUp,
    };

    for (const [issue, count] of Object.entries(issues)) {
      if (count > maxCount) {
        maxCount = count;
        mostCommonIssue = issue;
      }
    }

    return {
      totalDetections: total,
      goodPercentage: Math.round((stats.good / total) * 100),
      mostCommonIssue,
    };
  }
}

// 导出单例
export const postureStorage = new PostureStorageService();

