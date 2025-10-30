/**
 * 姿势监控主界面
 * 展示如何集成相机和姿势检测
 */

import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Linking,
} from "react-native";
import { Camera, useCameraDevice, useCameraPermission } from "react-native-vision-camera";
import { usePostureMonitor } from "../hooks/usePostureMonitor";
import { PostureStatus, KeyPoint } from "../types/posture";

export const PostureMonitorScreen = () => {
  // 相机相关
  const device = useCameraDevice("front"); // 使用前置摄像头
  const { hasPermission, requestPermission } = useCameraPermission();
  const cameraRef = useRef<Camera>(null);
  
  // 注意：AI 检测现在在原生层进行，此页面仅用于测试
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isModelReady, setIsModelReady] = useState(false);
  
  // 姿势监控
  const {
    isMonitoring,
    currentStatus,
    statistics,
    startMonitoring,
    stopMonitoring,
    resetStatistics,
    getStatusText,
    processPoseData,
  } = usePostureMonitor({
    detectionInterval: 333,
    updateInterval: 30000,
    rewardThreshold: 600,
    enableAudio: true,
    enableVibration: true,
  });

  // 注意：AI 模型现在在原生层加载和使用
  useEffect(() => {
    console.log('📝 此测试页面已废弃，AI 检测现在由原生层处理');
    setIsModelReady(true); // 模拟模型就绪
  }, []);

  // AI 实时检测（使用 TensorFlow Lite）
  // TODO: 集成 vision-camera-resize-plugin 以获取真实相机帧
  // useEffect(() => {
  //   if (!isMonitoring || !useAI || !isModelReady) return;
  //
  //   const detectPose = async () => {
  //     try {
  //       // 从相机获取帧数据（需要集成 vision-camera-resize-plugin）
  //       // const resized = resize(frame, {
  //       //   scale: { width: 192, height: 192 },
  //       //   pixelFormat: 'rgb',
  //       //   dataType: 'uint8',
  //       // });
  //       
  //       // const keypoints = await detectionService.current.detectPose(resized, 192, 192);
  //       // processPoseData(keypoints);
  //     } catch (error) {
  //       console.error('❌ AI 检测失败:', error);
  //     }
  //   };
  //
  //   const interval = setInterval(detectPose, 1000);
  //   return () => clearInterval(interval);
  // }, [isMonitoring, useAI, isModelReady, processPoseData]);


  // 请求相机权限
  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);


  const handleStartStop = async () => {
    try {
      if (isMonitoring) {
        await stopMonitoring();
      } else {
        await startMonitoring();
      }
    } catch (error) {
      Alert.alert("错误", `操作失败: ${error}`);
    }
  };

  const handleReset = () => {
    Alert.alert("重置统计", "确定要重置统计数据吗？", [
      { text: "取消", style: "cancel" },
      {
        text: "确定",
        onPress: async () => {
          await resetStatistics();
          Alert.alert("成功", "统计数据已重置");
        },
      },
    ]);
  };

  const getStatusColor = (): string => {
    switch (currentStatus) {
      case "good":
        return "#4CAF50";
      case "shoulders_not_level":
      case "head_not_centered":
      case "head_not_up":
        return "#FF9800";
      case "no_person":
        return "#9E9E9E";
      default:
        return "#2196F3";
    }
  };

  // 权限未授予
  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionTitle}>📷 需要相机权限</Text>
          <Text style={styles.permissionText}>
            姿势监控功能需要使用前置摄像头来检测您的坐姿
          </Text>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={requestPermission}
          >
            <Text style={styles.buttonText}>授予权限</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => Linking.openSettings()}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              打开设置
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // 相机设备未找到
  if (!device) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>正在初始化相机...</Text>
      </View>
    );
  }

  // 模型加载中
  if (isModelLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>正在加载 AI 模型...</Text>
        <Text style={styles.loadingSubtext}>
          首次加载可能需要10-30秒
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 相机预览区域 */}
      <View style={styles.cameraContainer}>
        <Camera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          photo={isMonitoring} // 监控时启用拍照
          video={false}
          audio={false}
        />
        
        {/* AI 状态指示器 */}
        {isModelReady && (
          <View style={styles.aiIndicator}>
            <Text style={styles.aiIndicatorText}>
              🤖 AI 原生层检测
            </Text>
          </View>
        )}
        
        {/* 提示信息覆盖层 */}
        {!isMonitoring && (
          <View style={styles.hintOverlay}>
            <Text style={styles.hintText}>
              💡 点击"开始监控"按钮启动姿势检测
            </Text>
            <Text style={styles.hintSubtext}>
              {isModelReady ? '✅ AI 模型已就绪' : '⚠️ 模型未加载'}
            </Text>
          </View>
        )}

        {/* 状态覆盖层 */}
        <View
          style={[
            styles.statusOverlay,
            { backgroundColor: getStatusColor() },
          ]}
        >
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
      </View>

      {/* 统计信息 */}
      <ScrollView style={styles.statsContainer}>
        <View style={styles.statsGrid}>
          <StatCard
            label="良好坐姿"
            value={statistics.good}
            color="#4CAF50"
          />
          <StatCard
            label="总检测"
            value={statistics.total}
            color="#2196F3"
          />
          <StatCard
            label="肩膀倾斜"
            value={statistics.shouldersNotLevel}
            color="#FF9800"
          />
          <StatCard
            label="头部不居中"
            value={statistics.headNotCentered}
            color="#FF9800"
          />
          <StatCard
            label="头部未抬起"
            value={statistics.headNotUp}
            color="#FF9800"
          />
          <StatCard
            label="奖励进度"
            value={`${statistics.rewardCount}/600`}
            color="#9C27B0"
          />
        </View>

        {/* 统计百分比 */}
        {statistics.total > 0 && (
          <View style={styles.percentageContainer}>
            <Text style={styles.percentageText}>
              良好坐姿占比:{" "}
              {((statistics.good / statistics.total) * 100).toFixed(1)}%
            </Text>
          </View>
        )}
      </ScrollView>

      {/* 控制按钮 */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.primaryButton,
            isMonitoring && styles.stopButton,
          ]}
          onPress={handleStartStop}
        >
          <Text style={styles.buttonText}>
            {isMonitoring ? "停止监控" : "开始监控"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleReset}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            重置统计
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// 统计卡片组件
const StatCard = ({
  label,
  value,
  color,
}: {
  label: string;
  value: number | string;
  color: string;
}) => (
  <View style={styles.statCard}>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  permissionText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  cameraContainer: {
    height: 800,
    backgroundColor: "#000",
    position: "relative",
    overflow: "hidden",
  },
  hintOverlay: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 4,
    borderRadius: 8,
  },
  hintText: {
    color: "#FFF",
    fontSize: 8,
    textAlign: "center",
  },
  hintSubtext: {
    color: "#CCC",
    fontSize: 8,
    textAlign: "center",
    marginTop: 4,
  },
  aiIndicator: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(76, 175, 80, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  aiIndicatorText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  buttonRow: {
    flexDirection: "row",
  },
  statusOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "rgba(76, 175, 80, 0.9)",
  },
  statusText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    textAlign: "center",
  },
  statsContainer: {
    flex: 1,
    padding: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: "48%",
    backgroundColor: "#FFF",
    borderRadius: 2,
    padding: 6,
    marginBottom: 6,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 9,
    color: "#666",
    textAlign: "center",
  },
  percentageContainer: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 6,
    marginTop: 8,
    alignItems: "center",
  },
  percentageText: {
    fontSize: 8,
    fontWeight: "600",
    color: "#333",
  },
  controlsContainer: {
    padding: 6,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  button: {
    height: 26,
    borderRadius: 2,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 2,
  },
  primaryButton: {
    backgroundColor: "#2196F3",
  },
  stopButton: {
    backgroundColor: "#F44336",
  },
  secondaryButton: {
    backgroundColor: "#FFF",
    borderWidth: 2,
    borderColor: "#2196F3",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFF",
  },
  secondaryButtonText: {
    color: "#2196F3",
  },
});

