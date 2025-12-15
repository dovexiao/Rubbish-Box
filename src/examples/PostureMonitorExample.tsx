/**
 * 姿势监控功能 - 快速开始示例
 * 展示如何快速集成和使用姿势监控功能
 */

import React, { useEffect } from "react";
import { View, Text, Button, StyleSheet, Alert } from "react-native";
import { usePostureMonitor } from "../hooks/usePostureMonitor";
import { KeyPoint } from "../types/posture";

/**
 * 示例 1: 基础使用（不含相机）
 * 使用模拟数据测试功能
 */
export const BasicExample = () => {
  const {
    isMonitoring,
    currentStatus,
    statistics,
    startMonitoring,
    stopMonitoring,
    processPoseData,
    getStatusText,
  } = usePostureMonitor();

  // 模拟姿势数据生成器
  const generateMockPoseData = (): KeyPoint[] => {
    // 随机生成姿势状态
    const random = Math.random();
    
    if (random < 0.6) {
      // 60% 概率 - 良好坐姿
      return [
        { x: 0.5, y: 0.3, confidence: 0.9 },   // nose
        { x: 0.45, y: 0.28, confidence: 0.85 }, // left_eye
        { x: 0.55, y: 0.28, confidence: 0.85 }, // right_eye
        { x: 0.4, y: 0.32, confidence: 0.8 },   // left_ear
        { x: 0.6, y: 0.32, confidence: 0.8 },   // right_ear
        { x: 0.35, y: 0.5, confidence: 0.9 },   // left_shoulder
        { x: 0.65, y: 0.5, confidence: 0.9 },   // right_shoulder
        // ... 其他关键点（简化示例）
        ...Array(10).fill({ x: 0.5, y: 0.6, confidence: 0.7 }),
      ];
    } else if (random < 0.8) {
      // 20% 概率 - 肩膀不平
      return [
        { x: 0.5, y: 0.3, confidence: 0.9 },
        { x: 0.45, y: 0.28, confidence: 0.85 },
        { x: 0.55, y: 0.28, confidence: 0.85 },
        { x: 0.4, y: 0.32, confidence: 0.8 },
        { x: 0.6, y: 0.32, confidence: 0.8 },
        { x: 0.35, y: 0.45, confidence: 0.9 }, // 左肩较高
        { x: 0.65, y: 0.55, confidence: 0.9 }, // 右肩较低
        ...Array(10).fill({ x: 0.5, y: 0.6, confidence: 0.7 }),
      ];
    } else {
      // 20% 概率 - 头部不居中
      return [
        { x: 0.4, y: 0.3, confidence: 0.9 }, // 鼻子偏左
        { x: 0.35, y: 0.28, confidence: 0.85 },
        { x: 0.45, y: 0.28, confidence: 0.85 },
        { x: 0.3, y: 0.32, confidence: 0.8 },
        { x: 0.5, y: 0.32, confidence: 0.8 },
        { x: 0.35, y: 0.5, confidence: 0.9 },
        { x: 0.65, y: 0.5, confidence: 0.9 },
        ...Array(10).fill({ x: 0.5, y: 0.6, confidence: 0.7 }),
      ];
    }
  };

  // 模拟检测循环
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      const mockData = generateMockPoseData();
      processPoseData(mockData);
    }, 1000); // 每秒检测一次

    return () => clearInterval(interval);
  }, [isMonitoring, processPoseData]);

  const handleToggle = async () => {
    try {
      if (isMonitoring) {
        await stopMonitoring();
        Alert.alert("已停止", "姿势监控已停止");
      } else {
        await startMonitoring();
        Alert.alert("已开始", "姿势监控已开始（使用模拟数据）");
      }
    } catch (error) {
      Alert.alert("错误", String(error));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>姿势监控示例</Text>

      {/* 当前状态 */}
      <View style={styles.statusCard}>
        <Text style={styles.statusLabel}>当前状态</Text>
        <Text style={styles.statusText}>{getStatusText()}</Text>
        <Text style={styles.statusValue}>{currentStatus}</Text>
      </View>

      {/* 统计数据 */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{statistics.good}</Text>
          <Text style={styles.statLabel}>良好坐姿</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{statistics.total}</Text>
          <Text style={styles.statLabel}>总检测次数</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{statistics.rewardCount}</Text>
          <Text style={styles.statLabel}>奖励进度</Text>
        </View>
      </View>

      {/* 详细统计 */}
      <View style={styles.detailsContainer}>
        <Text style={styles.detailItem}>
          肩膀不平: {statistics.shouldersNotLevel}
        </Text>
        <Text style={styles.detailItem}>
          头部不居中: {statistics.headNotCentered}
        </Text>
        <Text style={styles.detailItem}>
          头部未抬起: {statistics.headNotUp}
        </Text>
      </View>

      {/* 控制按钮 */}
      <Button
        title={isMonitoring ? "停止监控" : "开始监控"}
        onPress={handleToggle}
      />

      <View style={styles.noteContainer}>
        <Text style={styles.noteText}>
          💡 这是一个使用模拟数据的示例
        </Text>
        <Text style={styles.noteText}>
          实际使用时需要集成相机和 AI 模型
        </Text>
      </View>
    </View>
  );
};

/**
 * 示例 2: 最小化使用
 * 只使用核心功能，不显示 UI
 */
export const MinimalExample = () => {
  const { startMonitoring, stopMonitoring, currentStatus } = usePostureMonitor(
    {
      enableAudio: true,
      enableVibration: true,
      rewardThreshold: 600,
    },
    {
      onStatusChanged: (status) => {
        console.log("状态改变:", status);
      },
      onRewardAchieved: (count) => {
        Alert.alert("🎉 奖励", `连续良好坐姿 ${count} 次！`);
      },
      onError: (error) => {
        console.error("错误:", error);
      },
    }
  );

  useEffect(() => {
    // 自动开始监控
    startMonitoring();
    return () => {
      stopMonitoring();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>最小化示例</Text>
      <Text style={styles.statusValue}>{currentStatus}</Text>
      <Text style={styles.noteText}>
        后台运行，查看控制台日志
      </Text>
    </View>
  );
};

/**
 * 示例 3: 自定义配置
 * 展示如何自定义各种参数
 */
export const CustomConfigExample = () => {
  const { isMonitoring, startMonitoring, updateConfig } = usePostureMonitor({
    detectionInterval: 500, // 2fps (更省电)
    updateInterval: 60000, // 1分钟更新一次
    rewardThreshold: 1200, // 20分钟获得奖励
    enableAudio: false, // 禁用音频
    enableVibration: true, // 仅震动
    minConfidence: 0.5, // 提高置信度阈值
  });

  const handleChangeConfig = () => {
    // 动态修改配置
    updateConfig({
      enableAudio: true,
      detectionInterval: 1000, // 降低到 1fps
    });
    Alert.alert("配置已更新");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>自定义配置示例</Text>
      <Button title="开始监控" onPress={startMonitoring} />
      <Button title="修改配置" onPress={handleChangeConfig} />
      <Text style={styles.noteText}>
        监控状态: {isMonitoring ? "运行中" : "已停止"}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F5F5F5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  statusCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  statusText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  statusValue: {
    fontSize: 14,
    color: "#999",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: "center",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2196F3",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  detailsContainer: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  detailItem: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
  },
  noteContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#FFF3CD",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#FFC107",
  },
  noteText: {
    fontSize: 14,
    color: "#856404",
    marginBottom: 4,
  },
});

// 导出所有示例
export default {
  BasicExample,
  MinimalExample,
  CustomConfigExample,
};


