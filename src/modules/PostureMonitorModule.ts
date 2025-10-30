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
  EVENT_FRAME_CAPTURED: string;
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

export default PostureMonitor;


