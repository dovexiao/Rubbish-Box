/**
 * 全局坐姿监控 Hook
 * Native层统计时间，JS层只负责UI反馈和接口调用
 */

import { useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus, Platform, PermissionsAndroid, Alert } from 'react-native';
import { usePostureStore } from '../stores/postureStore';
import { AudioService } from '../services/audioService';
import { showWarning, showInfo } from '../utils/toast';
import type { PostureStatus } from '../types/posture';
import { usePathname } from 'expo-router';
import { 
  startPostureMonitorService, 
  stopPostureMonitorService,
  postureMonitorEmitter,
  type PostureStatusEvent,
  type PostureRewardEvent 
} from '../modules/PostureMonitorModule';
import { saveMointorData } from '../services/app';

const BAD_POSTURE_REMINDER_INTERVAL_SECONDS = 30; // 不良姿势每30秒提醒一次

export function useGlobalPostureMonitor() {
  const postureStore = usePostureStore();
  const audioService = useRef<AudioService | null>(null);
  const pathname = usePathname();
  const previousPathnameRef = useRef<string | null>(null); // 记录上一个路径
  const wasInAIModuleRef = useRef(false); // 记录是否之前在 AI 模块
  
  const isRouteSuppressed = useCallback(() => {
    // AI 模块内禁止自动启动/恢复坐姿检测
    // 包括: /ai/camera, /ai/loading, /ai/result, /ai/error-book 等所有 AI 相关页面
    if (!pathname) return false;
    return pathname.startsWith('/ai/');
  }, [pathname]);
  
  // 使用 ref 来避免 useEffect 依赖问题
  const startMonitoringRef = useRef<(() => Promise<void>) | null>(null);
  const stopMonitoringRef = useRef<(() => Promise<void>) | null>(null);
  
  /**
   * 启动监控
   */
  const startMonitoring = useCallback(async () => {
    if (isRouteSuppressed()) {
      console.log('📵 路由白名单命中（相机/拍照页面），跳过启动坐姿监控');
      return;
    }
    // 如果已经在监控中，不重复启动
    if (postureStore.isMonitoring) {
      console.log('⚠️ 坐姿监控已在运行中，跳过重复启动');
      return;
    }
    
    console.log('🚀 启动全局坐姿监控...');

    try {
      // 懒加载初始化音频服务
      if (!audioService.current) {
        audioService.current = new AudioService();
      }

      // 启动后台相机服务 (仅 Android)
      if (Platform.OS === 'android') {
        // 🔐 Android 15+ (API 35+) 需要先请求相机权限才能启动前台服务
        try {
          const cameraPermission = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
              title: '需要相机权限',
              message: '坐姿监控需要使用相机来检测您的姿势',
              buttonNeutral: '稍后询问',
              buttonNegative: '取消',
              buttonPositive: '允许',
            }
          );

          if (cameraPermission !== PermissionsAndroid.RESULTS.GRANTED) {
            console.warn('❌ 相机权限被拒绝，无法启动坐姿监控');
            Alert.alert(
              '权限被拒绝',
              '需要相机权限才能启动坐姿监控服务。请在设置中授予相机权限。',
              [{ text: '确定' }]
            );
            return;
          }

          console.log('✅ 相机权限已授予');
        } catch (error) {
          console.error('❌ 请求相机权限失败:', error);
          return;
        }

        // 启动服务，传入 false 禁用调试模式（不显示浮窗）
        const enableDebug = false; // 设置为 false 关闭浮窗
        const serviceStarted = await startPostureMonitorService(enableDebug);
        if (serviceStarted) {
          console.log(`✅ 后台相机服务已启动${enableDebug ? '（调试模式）' : ''}（Native层统计时间，每10秒检测一次）`);
          
          // 先移除旧的监听器，防止重复添加
          if (postureMonitorEmitter) {
            console.log('🧹 移除旧的事件监听器');
            postureMonitorEmitter.removeAllListeners('onPostureStatus');
            postureMonitorEmitter.removeAllListeners('onPostureReward');
            postureMonitorEmitter.removeAllListeners('onRestReminder');
          }
          
          // 监听坐姿状态事件（Native已完成统计）
          if (postureMonitorEmitter) {
            console.log('📡 添加新的事件监听器');
            postureMonitorEmitter.addListener('onPostureStatus', (event: PostureStatusEvent) => {
              console.log('📊 收到Native统计数据:', {
                status: event.status,
                type: event.type,
                reward: event.reward_accumulated_seconds,
                total: event.total
              });
              
              // 更新 store 状态
              postureStore.setStatus(event.status as PostureStatus);
              
              // 音频提醒和弹窗
              handlePostureFeedback(event);
              
              // 🎯 核心逻辑2：检查1小时上报
              if (event.type === 'updateTime') {
                handleHourlyReport(event);
              }
            });
            
            // 监听奖励事件
            postureMonitorEmitter.addListener('onPostureReward', (event: PostureRewardEvent) => {
              console.log('🎉 收到Native奖励通知:', event.message);
              handleReward(event);
            });
            
            // 监听45分钟休息提醒事件
            postureMonitorEmitter.addListener('onRestReminder', (event: any) => {
              console.log('⏰ 收到45分钟休息提醒:', event.message);
              handleRestReminder(event);
            });
          }
        } else {
          console.warn('⚠️ 后台相机服务启动失败');
        }
      }

      // 标记为监控中
      postureStore.startMonitoring();

      console.log('✅ 全局坐姿监控已启动');
    } catch (error) {
      console.error('❌ 启动监控失败:', error);
    }
  }, [postureStore]);

  /**
   * 停止监控
   */
  const stopMonitoring = useCallback(async () => {
    // 停止后台相机服务 (仅 Android)
    if (Platform.OS === 'android') {
      await stopPostureMonitorService();
      
      // 移除事件监听
      if (postureMonitorEmitter) {
        postureMonitorEmitter.removeAllListeners('onPostureStatus');
        postureMonitorEmitter.removeAllListeners('onPostureReward');
        postureMonitorEmitter.removeAllListeners('onRestReminder');
      }
    }

    postureStore.stopMonitoring();
    console.log('🛑 全局坐姿监控已停止');
  }, [postureStore]);

  /**
   * 处理坐姿反馈（音频提醒和弹窗）
   * ⚠️ Native 层每 30 秒更新一次，直接尝试播放，由 AudioService 内部的 MIN_PLAY_INTERVAL 控制间隔
   */
  const handlePostureFeedback = (event: PostureStatusEvent) => {
    const { status, head_not_up, shoulders_tilted, head_tilted } = event;
    
    console.log('🔔 处理坐姿反馈:', { 
      status, 
      head_not_up, 
      shoulders_tilted, 
      head_tilted
    });
    
    // 音频提醒和弹窗（Native 层每 30 秒更新一次，直接尝试播放）
    if (status !== 'good' && status !== 'no_person' && status !== 'detecting' && status !== 'too_far') {
      let currentStateDuration = 0;
      let audioType: 'adjust_posture' | 'head_not_up' | 'head_not_centered' | 'shoulders_not_level' = 'adjust_posture';
      let warningMessage = '';
      
      // 根据当前状态获取对应的持续时间和音频类型
      if (status === 'head_not_centered') {
        currentStateDuration = head_tilted;
        audioType = 'head_not_centered';
        warningMessage = '检测到头部偏移，请调整坐姿保持头部居中';
      } else if (status === 'head_not_up') {
        currentStateDuration = head_not_up;
        audioType = 'head_not_up';
        warningMessage = '检测到低头，请抬起头部保持正确坐姿';
      } else if (status === 'shoulders_not_level') {
        currentStateDuration = shoulders_tilted;
        audioType = 'shoulders_not_level';
        warningMessage = '检测到肩膀倾斜，请调整坐姿保持肩膀水平';
      }
      
      console.log('📊 音频提醒检查:', {
        当前状态: status,
        累计持续时间: currentStateDuration + '秒',
        音频类型: audioType
      });
      
      // Native 层每 30 秒更新一次，每次更新都尝试播放
      // AudioService 内部有 MIN_PLAY_INTERVAL (30秒) 限制，会自动控制播放间隔
      if (currentStateDuration > 0) {
        console.log('✅ 触发音频播放:', audioType);
        
        if (audioService.current) {
          console.log('🔊 调用 audioService.play():', audioType);
          audioService.current.play(audioType).catch(err => {
            console.error('❌ 音频播放失败:', err);
          });
        } else {
          console.warn('⚠️ audioService 未初始化');
        }
        
        // 🔇 暂时注释掉弹窗提示，只保留音频
        // showWarning(warningMessage);
      } else {
        console.log('⏭️ 持续时间为0，跳过');
      }
    } else {
      console.log('⏭️ 状态正常或检测中，无需提醒:', status);
    }
  };

  /**
   * 🎯 核心逻辑1：处理10分钟奖励（Native层触发）
   */
  const handleReward = async (event: PostureRewardEvent) => {
    const minutes = Math.floor(event.duration / 60);
    const points = postureStore.rewardConfig.rewardPoints;
    
    console.log(`🎉 Native触发奖励: ${event.message}`);
    
    // 🔇 注释掉音频播放：奖励是针对学习时长，不管当前是什么坐姿
    // 播放"坐姿正确"音频会与当前显示的状态不一致
    // if (audioService.current) {
    //   console.log('🔊 播放奖励音频');
    //   audioService.current.play('good_posture').catch(err => {
    //     console.error('❌ 奖励音频播放失败:', err);
    //   });
    // }
    
    // 后台自动领取奖励
    const success = await postureStore.handlePostureReward();
    
    if (success) {
      // 使用 toast 显示奖励提示（1.5秒）
      showInfo(`🎉 太棒了！累计学习10分钟，获得 ${points} 积分`, 2000);
    }
  };

  /**
   * 处理45分钟休息提醒
   */
  const handleRestReminder = async (event: any) => {
    console.log('⏰ 处理45分钟休息提醒');
    
    // 播放休息提醒音频
    if (audioService.current) {
      console.log('🔊 播放休息提醒音频');
      audioService.current.play('rest_reminder').catch(err => {
        console.error('❌ 休息提醒音频播放失败:', err);
      });
    }
    
    // 显示休息提醒弹窗
    showInfo('⏰ 您已持续学习45分钟，建议休息一下，保护视力！', 2000);
  };

  /**
   * 🎯 核心逻辑2：处理1小时数据上报（Native层触发）
   */
  const handleHourlyReport = async (event: PostureStatusEvent) => {
    console.log(`⏰ Native触发1小时上报:`, {
      正确坐姿: event.good + '秒',
      头部倾斜: event.head_tilted + '秒',
      低头: event.head_not_up + '秒',
      肩膀倾斜: event.shoulders_tilted + '秒',
    });
    
    try {
      await saveMointorData({
        correct_sitting_posture_time: event.good, // 坐姿正确时间（秒）
        head_tilt_time: event.head_tilted, // 头部倾斜时间（秒）
        lowering_the_head_time: event.head_not_up, // 低头时间（秒）
        shoulder_tilt_time: event.shoulders_tilted, // 肩膀倾斜时间（秒）
      });
      console.log(`✅ 学习时长上报成功`);
    } catch (error) {
      console.error('❌ 学习时长上报失败:', error);
    }
  };

  // 更新 refs
  useEffect(() => {
    startMonitoringRef.current = startMonitoring;
    stopMonitoringRef.current = stopMonitoring;
  }, [startMonitoring, stopMonitoring]);

  /**
   * 监听应用状态变化
   * 注意：坐姿检测是后台服务，应用进入后台时不应停止
   */
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      console.log(`App状态变化: ${AppState.currentState} -> ${nextAppState}`);

      if (nextAppState === 'active') {
        // 应用回到前台，确保监控正常运行
        if (postureStore.isMonitoring) {
          console.log('📱 应用回到前台，监控继续运行');
          // 不需要重新启动，Native后台服务会持续运行
        } else if (!isRouteSuppressed()) {
          // 如果当前不在相机/拍照页面且未在运行，可选择在此保活（按需）
          // startMonitoringRef.current?.();
        }
      } else if (nextAppState === 'background') {
        // 应用进入后台，但坐姿监控继续运行（这是后台服务的核心功能）
        console.log('📱 应用进入后台，坐姿监控继续在后台运行');
        // ⚠️ 不要停止监控！这是后台服务，应该继续运行
      }
    });

    return () => {
      subscription.remove();
    };
  }, [postureStore.isMonitoring]); // 只依赖 isMonitoring

  /**
   * 监听路由变化：当用户离开 AI 模块时，恢复坐姿服务
   */
  useEffect(() => {
    const currentInAI = pathname?.startsWith('/ai/') ?? false;
    const previousInAI = wasInAIModuleRef.current;
    
    // 检测：从 AI 模块离开（previousInAI=true, currentInAI=false）
    if (previousInAI && !currentInAI && previousPathnameRef.current) {
      console.log(`🔄 检测到从 AI 模块（${previousPathnameRef.current}）离开到（${pathname}），尝试恢复坐姿服务`);
      // 延迟 2 秒恢复，确保相机资源已释放
      setTimeout(() => {
        if (!postureStore.isMonitoring && !isRouteSuppressed()) {
          console.log('🔄 恢复坐姿服务...');
          startMonitoringRef.current?.();
        }
      }, 2000);
    }
    
    // 更新状态
    wasInAIModuleRef.current = currentInAI;
    previousPathnameRef.current = pathname;
  }, [pathname, postureStore.isMonitoring]);

  /**
   * 组件卸载时清理
   * 注意：由于这个Hook在 _layout.tsx 根组件中使用，
   * 只有在应用真正退出时才应该停止监控
   * 路由变化不应该触发停止
   */
  useEffect(() => {
    return () => {
      // 不自动停止，让 onAppExit 显式控制停止时机
      console.log('⚠️ useGlobalPostureMonitor 清理函数被调用（但不停止监控）');
      // stopMonitoringRef.current?.();
    };
  }, []); // 空依赖数组，只在卸载时执行一次

  return {
    startMonitoring,
    stopMonitoring,
    isMonitoring: postureStore.isMonitoring,
    currentStatus: postureStore.nowStatus,
  };
}
