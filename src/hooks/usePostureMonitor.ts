/**
 * 姿势监控 Hook
 * 方便 React 组件使用姿势监控功能
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  PostureStatus,
  PoseData,
  PostureStatistics,
  PostureMonitorConfig,
  PostureEventCallbacks,
  KeyPoint,
} from "../types/posture";
import {
  PostureMonitorService,
  getPostureMonitorService,
} from "../services/postureMonitorService";
import { postureEvaluator } from "../services/postureEvaluator";

export interface UsePostureMonitorReturn {
  // 状态
  isMonitoring: boolean;
  currentStatus: PostureStatus;
  statistics: PostureStatistics;
  lastPoseData: PoseData | null;

  // 方法
  startMonitoring: () => Promise<void>;
  stopMonitoring: () => Promise<void>;
  processPoseData: (keypoints: KeyPoint[]) => Promise<void>;
  resetStatistics: () => Promise<void>;
  updateConfig: (config: Partial<PostureMonitorConfig>) => void;
  getStatusText: () => string;
}

export function usePostureMonitor(
  config?: Partial<PostureMonitorConfig>,
  callbacks?: PostureEventCallbacks
): UsePostureMonitorReturn {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<PostureStatus>("detecting");
  const [statistics, setStatistics] = useState<PostureStatistics>({
    good: 0,
    shouldersNotLevel: 0,
    headNotCentered: 0,
    headNotUp: 0,
    total: 0,
    rewardCount: 0,
    lastUpdateTime: Date.now(),
  });
  const [lastPoseData, setLastPoseData] = useState<PoseData | null>(null);

  const serviceRef = useRef<PostureMonitorService | null>(null);

  // 初始化服务
  useEffect(() => {
    const eventCallbacks: PostureEventCallbacks = {
      ...callbacks,
      onPoseDetected: (data) => {
        setLastPoseData(data);
        setCurrentStatus(data.status);
        callbacks?.onPoseDetected?.(data);
      },
      onStatusChanged: (status) => {
        setCurrentStatus(status);
        callbacks?.onStatusChanged?.(status);
      },
      onRewardAchieved: (count) => {
        callbacks?.onRewardAchieved?.(count);
      },
      onError: (error) => {
        console.error("Posture monitor error:", error);
        callbacks?.onError?.(error);
      },
    };

    serviceRef.current = new PostureMonitorService(config, eventCallbacks);

    return () => {
      if (serviceRef.current) {
        serviceRef.current.dispose();
        serviceRef.current = null;
      }
    };
  }, []);

  // 定期更新统计数据
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      if (serviceRef.current) {
        const stats = serviceRef.current.getStatistics();
        setStatistics(stats);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isMonitoring]);

  // 开始监控
  const startMonitoring = useCallback(async () => {
    if (!serviceRef.current) return;

    try {
      await serviceRef.current.startMonitoring();
      setIsMonitoring(true);
    } catch (error) {
      console.error("Failed to start monitoring:", error);
      throw error;
    }
  }, []);

  // 停止监控
  const stopMonitoring = useCallback(async () => {
    if (!serviceRef.current) return;

    try {
      await serviceRef.current.stopMonitoring();
      setIsMonitoring(false);
    } catch (error) {
      console.error("Failed to stop monitoring:", error);
      throw error;
    }
  }, []);

  // 处理姿势数据
  const processPoseData = useCallback(async (keypoints: KeyPoint[]) => {
    if (!serviceRef.current) return;

    const poseData: PoseData = {
      keypoints,
      status: "detecting",
      confidence: 0,
      timestamp: Date.now(),
    };

    await serviceRef.current.processPoseData(poseData);
  }, []);

  // 重置统计
  const resetStatistics = useCallback(async () => {
    if (!serviceRef.current) return;
    await serviceRef.current.resetStatistics();
    setStatistics(serviceRef.current.getStatistics());
  }, []);

  // 更新配置
  const updateConfig = useCallback((newConfig: Partial<PostureMonitorConfig>) => {
    if (!serviceRef.current) return;
    serviceRef.current.updateConfig(newConfig);
  }, []);

  // 获取状态文本
  const getStatusText = useCallback(() => {
    return postureEvaluator.getStatusText(currentStatus);
  }, [currentStatus]);

  return {
    isMonitoring,
    currentStatus,
    statistics,
    lastPoseData,
    startMonitoring,
    stopMonitoring,
    processPoseData,
    resetStatistics,
    updateConfig,
    getStatusText,
  };
}


