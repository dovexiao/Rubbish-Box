import { initScreenConfig } from './screenConfig';
import { getString, STORAGE_KEYS } from './storage';
import { checkNetworkConnection } from './network';

/**
 * 应用初始化工具
 * 处理应用启动时的初始化流程
 */

/**
 * 初始化配置
 */
interface InitOptions {
  onProgress?: (progress: number, message: string) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

/**
 * 应用初始化函数
 * 按顺序执行各项初始化任务
 */
export const initializeApp = async (options?: InitOptions): Promise<void> => {
  try {
    const { onProgress, onComplete, onError } = options || {};
    
    // 初始化进度
    const updateProgress = (progress: number, message: string) => {
      console.log(`初始化进度: ${progress}%, ${message}`);
      onProgress?.(progress, message);
    };
    
    // 1. 检查网络连接
    updateProgress(10, '检查网络连接');
    const isConnected = await checkNetworkConnection();
    console.log('网络连接状态:', isConnected ? '已连接' : '未连接');
    
    // 2. 初始化屏幕配置
    updateProgress(30, '初始化屏幕配置');
    await initScreenConfig();
    
    // 3. 检查用户登录状态
    updateProgress(50, '检查登录状态');
    const token = getString(STORAGE_KEYS.TOKEN);
    const isLoggedIn = !!token;
    console.log('用户登录状态:', isLoggedIn ? '已登录' : '未登录');
    
    // 4. 加载应用配置
    updateProgress(70, '加载应用配置');
    // 可以在这里加载其他配置
    
    // 5. 初始化完成
    updateProgress(100, '初始化完成');
    onComplete?.();
    
    return {
      isConnected,
      isLoggedIn,
    };
  } catch (error) {
    console.error('应用初始化失败:', error);
    options?.onError?.(error as Error);
    throw error;
  }
};

/**
 * 应用启动时检查更新
 */
export const checkForUpdates = async (): Promise<void> => {
  // 这里可以实现检查应用更新的逻辑
  console.log('检查应用更新');
};

export default {
  initializeApp,
  checkForUpdates,
};
