/**
 * 姿势检测相关类型定义
 */

// 关键点数据结构
export interface KeyPoint {
  x: number; // 归一化坐标 [0, 1]
  y: number; // 归一化坐标 [0, 1]
  confidence: number; // 置信度 [0, 1]
}

// MoveNet 17个关键点索引
export enum KeyPointIndex {
  NOSE = 0,
  LEFT_EYE = 1,
  RIGHT_EYE = 2,
  LEFT_EAR = 3,
  RIGHT_EAR = 4,
  LEFT_SHOULDER = 5,
  RIGHT_SHOULDER = 6,
  LEFT_ELBOW = 7,
  RIGHT_ELBOW = 8,
  LEFT_WRIST = 9,
  RIGHT_WRIST = 10,
  LEFT_HIP = 11,
  RIGHT_HIP = 12,
  LEFT_KNEE = 13,
  RIGHT_KNEE = 14,
  LEFT_ANKLE = 15,
  RIGHT_ANKLE = 16,
}

// 姿势状态
export type PostureStatus =
  | "good" // 良好坐姿
  | "shoulders_not_level" // 肩膀不水平
  | "head_not_centered" // 头部不居中
  | "head_not_up" // 头部未抬起
  | "too_far" // 距离过远
  | "no_person" // 未检测到人
  | "detecting"; // 检测中

// 姿势检测结果
export interface PoseData {
  keypoints: KeyPoint[];
  status: PostureStatus;
  confidence: number; // 整体置信度
  timestamp: number;
}

// 姿势统计数据
export interface PostureStatistics {
  good: number; // 良好坐姿次数
  shouldersNotLevel: number; // 肩膀不平次数
  headNotCentered: number; // 头部不居中次数
  headNotUp: number; // 头部未抬起次数
  total: number; // 总检测次数
  rewardCount: number; // 奖励计数（连续良好坐姿）
  lastUpdateTime: number; // 最后更新时间
  // 时长统计（秒）
  totalDuration: number; // 总使用时长
  goodPostureDuration: number; // 良好坐姿时长
  badPostureDuration: number; // 不良坐姿时长
  dailyResetTime: number; // 每日重置时间戳
}

// 配置选项
export interface PostureMonitorConfig {
  detectionInterval: number; // 检测间隔（毫秒）
  updateInterval: number; // UI 更新间隔（毫秒）
  rewardThreshold: number; // 奖励阈值（次数）
  enableAudio: boolean; // 启用音频提示
  enableVibration: boolean; // 启用震动
  minConfidence: number; // 最小置信度阈值
}

// 音频类型
export type AudioType =
  | "good_posture"
  | "shoulders_not_level"
  | "head_not_centered"
  | "head_not_up"
  | "adjust_posture"
  | "rest_reminder";

// 事件回调
export interface PostureEventCallbacks {
  onPoseDetected?: (data: PoseData) => void;
  onStatusChanged?: (status: PostureStatus) => void;
  onRewardAchieved?: (count: number) => void;
  onError?: (error: Error) => void;
}

