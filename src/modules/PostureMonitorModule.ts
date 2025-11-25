/**
 * 坐姿监控原生模块桥接
 * 用于启动和管理 Android 后台相机服务
 */

import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

const { PostureMonitorModule } = NativeModules;

interface PostureMonitorModuleType {
  startMonitoringService(): Promise<boolean>;
  stopMonitoringService(): Promise<boolean>;
  isServiceRunning(): Promise<boolean>;
  setCameraInUseByOtherApp(inUse: boolean): void;
  checkConcurrentCameraSupport(): Promise<ConcurrentCameraSupport>;
  EVENT_FRAME_CAPTURED: string;
}

// 并发相机支持检测结果
export interface ConcurrentCameraSupport {
  supported: boolean;           // 设备是否支持并发相机
  canUseConcurrently: boolean;  // 实际是否可以并发使用（综合判断）
  cameraCount: number;          // 设备相机数量
  concurrentSets: number;       // 并发相机集合数量
}

// Native层发送的坐姿状态事件数据结构
export interface PostureStatusEvent {
  status: string;
  timestamp: number;
  type: 'update' | 'updateTime';
  
  // 🎯 核心逻辑1：10分钟奖励计时器
  reward_accumulated_seconds: number;
  
  // 🎯 核心逻辑2：1小时上报统计
  good: number;
  shoulders_tilted: number;
  head_tilted: number;
  head_not_up: number;
  total: number;
}

// Native层发送的奖励事件数据结构
export interface PostureRewardEvent {
  message: string;
  duration: number;
  timestamp: number;
  type: 'reward';
}

const PostureMonitor: PostureMonitorModuleType | null = Platform.OS === 'android' ? PostureMonitorModule : null;

// 创建事件发射器
export const postureMonitorEmitter = Platform.OS === 'android' 
  ? new NativeEventEmitter(PostureMonitorModule)
  : null;

/**
 * 启动后台坐姿监控服务
 */
export async function startPostureMonitorService(): Promise<boolean> {
  if (!PostureMonitor) {
    console.warn('⚠️ PostureMonitorModule 仅支持 Android');
    return false;
  }

  try {
    const result = await PostureMonitor.startMonitoringService();
    console.log('✅ 后台坐姿监控服务已启动');
    return result;
  } catch (error) {
    console.error('❌ 启动后台服务失败:', error);
    return false;
  }
}

/**
 * 停止后台坐姿监控服务
 */
export async function stopPostureMonitorService(): Promise<boolean> {
  if (!PostureMonitor) {
    console.warn('⚠️ PostureMonitorModule 仅支持 Android');
    return false;
  }

  try {
    const result = await PostureMonitor.stopMonitoringService();
    console.log('✅ 后台坐姿监控服务已停止');
    return result;
  } catch (error) {
    console.error('❌ 停止后台服务失败:', error);
    return false;
  }
}

/**
 * 检查服务是否正在运行
 */
export async function isPostureServiceRunning(): Promise<boolean> {
  if (!PostureMonitor) {
    return false;
  }

  try {
    return await PostureMonitor.isServiceRunning();
  } catch (error) {
    console.error('❌ 检查服务状态失败:', error);
    return false;
  }
}

/**
 * 设置相机是否被其他应用占用（用于避免并发冲突）
 */
export function setCameraInUseByOtherApp(inUse: boolean): void {
  if (!PostureMonitor) {
    console.warn('⚠️ PostureMonitorModule 仅支持 Android');
    return;
  }

  try {
    PostureMonitor.setCameraInUseByOtherApp(inUse);
    console.log(inUse ? '📷 标记相机被其他应用占用' : '📷 清除相机占用标记');
  } catch (error) {
    console.error('❌ 设置相机占用状态失败:', error);
  }
}

/**
 * 检测设备是否支持并发相机访问
 */
export async function checkConcurrentCameraSupport(): Promise<ConcurrentCameraSupport> {
  if (!PostureMonitor) {
    console.warn('⚠️ PostureMonitorModule 仅支持 Android');
    return {
      supported: false,
      canUseConcurrently: false,
      cameraCount: 0,
      concurrentSets: 0,
    };
  }

  try {
    const result = await PostureMonitor.checkConcurrentCameraSupport();
    console.log('📷 相机并发支持检测结果:', result);
    return result;
  } catch (error) {
    console.error('❌ 检测并发相机支持失败:', error);
    return {
      supported: false,
      canUseConcurrently: false,
      cameraCount: 0,
      concurrentSets: 0,
    };
  }
}

export default PostureMonitor;


