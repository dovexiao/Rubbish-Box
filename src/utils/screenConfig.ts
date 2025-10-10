import * as ScreenOrientation from 'expo-screen-orientation';
import { Platform } from 'react-native';
import { ImmersiveMode } from 'react-native-immersive-mode';

/**
 * 屏幕配置工具
 * 处理全屏、导航栏和屏幕方向设置
 */

/**
 * 锁定屏幕为横屏模式
 */
export const lockToLandscape = async () => {
  try {
    await ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.LANDSCAPE
    );
    console.log('屏幕已锁定为横屏模式');
  } catch (error) {
    console.error('锁定屏幕方向失败:', error);
  }
};

/**
 * 解锁屏幕方向
 */
export const unlockScreenOrientation = async () => {
  try {
    await ScreenOrientation.unlockAsync();
    console.log('屏幕方向已解锁');
  } catch (error) {
    console.error('解锁屏幕方向失败:', error);
  }
};

/**
 * 启用全屏模式并隐藏系统导航栏
 */
export const enableFullscreen = () => {
  if (Platform.OS === 'android') {
    try {
      ImmersiveMode.setFullScreen(true);
      console.log('Android全屏模式已启用');
    } catch (error) {
      console.error('启用全屏模式失败:', error);
    }
  } else if (Platform.OS === 'ios') {
    // iOS不需要特殊处理，通过Info.plist配置
    console.log('iOS平台通过Info.plist配置全屏模式');
  }
};

/**
 * 禁用全屏模式并显示系统导航栏
 */
export const disableFullscreen = () => {
  if (Platform.OS === 'android') {
    try {
      ImmersiveMode.setFullScreen(false);
      console.log('Android全屏模式已禁用');
    } catch (error) {
      console.error('禁用全屏模式失败:', error);
    }
  }
};

/**
 * 初始化屏幕配置
 * 应用启动时调用
 */
export const initScreenConfig = async () => {
  try {
    // 锁定横屏
    await lockToLandscape();
    
    // 启用全屏模式
    enableFullscreen();
    
    console.log('屏幕配置初始化完成');
  } catch (error) {
    console.error('屏幕配置初始化失败:', error);
  }
};
