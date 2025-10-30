/**
 * 全局坐姿监控 Hook
 * 用于在应用全局范围内启动和管理坐姿检测
 */

import { useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import { usePostureStore } from '../stores/postureStore';
import { AudioService } from '../services/audioService';
import { PostureStorageService } from '../services/postureStorage';
import { showWarning, showInfo } from '../utils/toast';
import type { PostureStatistics, PostureStatus } from '../types/posture';
import { 
  startPostureMonitorService, 
  stopPostureMonitorService,
  postureMonitorEmitter 
} from '../modules/PostureMonitorModule';

const BAD_POSTURE_REMINDER_INTERVAL_SECONDS = 30; // 不良姿势每30秒提醒一次

export function useGlobalPostureMonitor() {
  const postureStore = usePostureStore();
  const audioService = useRef<AudioService | null>(null);
  const storage = useRef<PostureStorageService | null>(null);
  
  const detectionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const statisticsRef = useRef<PostureStatistics>({
    good: 0,
    shouldersNotLevel: 0,
    headNotCentered: 0,
    headNotUp: 0,
    total: 0,
    rewardCount: 0,
    lastUpdateTime: Date.now(),
    totalDuration: 0,
    goodPostureDuration: 0,
    badPostureDuration: 0,
    dailyResetTime: new Date().setHours(0, 0, 0, 0),
  });
  /**
   * 启动监控
   */
  const startMonitoring = useCallback(async () => {
    if (detectionIntervalRef.current) {
      console.log('⚠️ 监控已在运行中');
      return;
    }

    console.log('🚀 启动全局坐姿监控...');

    try {
      // 懒加载初始化服务（避免应用启动时过早初始化）
      if (!audioService.current) {
        audioService.current = new AudioService();
      }
      if (!storage.current) {
        storage.current = new PostureStorageService();
      }

      // 加载统计数据
      const savedStats = await storage.current.loadStatistics();
      if (savedStats) {
        statisticsRef.current = savedStats;
        console.log('📊 已加载统计数据:', savedStats);
      }

      // 启动后台相机服务 (仅 Android)
      if (Platform.OS === 'android') {
        const serviceStarted = await startPostureMonitorService();
        if (serviceStarted) {
          console.log('✅ 后台相机服务已启动（原生层 AI 检测）');
          
          // 监听坐姿状态事件（原生层已完成 AI 检测）
          if (postureMonitorEmitter) {
            postureMonitorEmitter.addListener('onPostureStatus', (event: { status: string; timestamp: number }) => {
              console.log('📊 收到坐姿状态:', event.status);
              
              // 直接使用原生层检测的状态
              const status = event.status as PostureStatus;
              postureStore.setStatus(status);
              
              // 更新统计
              updateStatistics(status);
              
              // 音频提醒和弹窗
              handlePostureFeedback(event.status);
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
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }

    // 停止后台相机服务 (仅 Android)
    if (Platform.OS === 'android') {
      await stopPostureMonitorService();
      
      // 移除事件监听
      if (postureMonitorEmitter) {
        postureMonitorEmitter.removeAllListeners('onPostureStatus');
      }
    }

    // 保存统计数据
    if (storage.current) {
      await storage.current.saveStatistics(statisticsRef.current);
    }

    postureStore.stopMonitoring();
    console.log('🛑 全局坐姿监控已停止');
  }, [postureStore]);

  /**
   * 处理坐姿反馈（音频提醒和弹窗）
   */
  const handlePostureFeedback = (status: string) => {
    // 音频提醒和弹窗
    if (status !== 'good' && status !== 'no_person' && status !== 'detecting') {
      const badPostureDuration = statisticsRef.current.badPostureDuration;
      if (badPostureDuration > 0 && Math.floor(badPostureDuration) % BAD_POSTURE_REMINDER_INTERVAL_SECONDS === 0) {
        if (audioService.current) {
          audioService.current.play('adjust_posture');
        }
        
        let warningMessage = '';
        if (status === 'head_not_centered') {
          warningMessage = '检测到头部偏移，请调整坐姿保持头部居中';
        } else if (status === 'head_not_up') {
          warningMessage = '检测到低头，请抬起头部保持正确坐姿';
        } else if (status === 'shoulders_not_level') {
          warningMessage = '检测到肩膀倾斜，请调整坐姿保持肩膀水平';
        }
        showWarning(warningMessage);
      }
    }
    
    // 奖励处理
    if (status === 'good') {
      handleReward();
    }
  };

  /**
   * 检测并评估姿势（旧版，保留用于兼容）
   */
  const detectAndEvaluate = async () => {
    // 现在由后台服务处理，这个函数不再需要
    // 保留是为了避免其他地方的调用报错
  };

  /**
   * 更新统计数据
   */
  const updateStatistics = (status: PostureStatus) => {
    const now = Date.now();
    const stats = statisticsRef.current;

    // 检查是否需要每日重置
    const today = new Date().setHours(0, 0, 0, 0);
    if (stats.dailyResetTime < today) {
      stats.goodPostureDuration = 0;
      stats.badPostureDuration = 0;
      stats.totalDuration = 0;
      stats.dailyResetTime = today;
    }

    // 计算时间差（秒）
    const duration = (now - stats.lastUpdateTime) / 1000;
    stats.totalDuration += duration;

    if (status === 'good') {
      stats.goodPostureDuration += duration;
      postureStore.incrementGoodTime(duration);
    } else if (status !== 'no_person' && status !== 'detecting') {
      stats.badPostureDuration += duration;

      // 更新具体的不良姿势时间
      if (status === 'head_not_centered') {
        postureStore.incrementHeadTiltTime(duration);
      } else if (status === 'head_not_up') {
        postureStore.incrementHeadDownTime(duration);
      } else if (status === 'shoulders_not_level') {
        postureStore.incrementShoulderTiltTime(duration);
      }
    }

    stats.lastUpdateTime = now;

    // 每分钟保存一次统计数据
    if (storage.current && Math.floor(stats.totalDuration) % 60 === 0) {
      storage.current.saveStatistics(stats);
    }

    // 检查是否达到奖励阈值
    if (
      stats.goodPostureDuration > 0 &&
      stats.goodPostureDuration % postureStore.rewardConfig.goodPostureCount === 0
    ) {
      handleReward();
    }
  };

  /**
   * 处理奖励
   */
  const handleReward = async () => {
    const minutes = Math.floor(postureStore.rewardConfig.goodPostureCount / 60);
    const points = postureStore.rewardConfig.rewardPoints;
    
    // 后台自动领取奖励
    const success = await postureStore.handlePostureReward();
    
    if (success) {
      // 使用 toast 显示奖励提示
      showInfo(`🎉 太棒了！保持良好坐姿 ${minutes} 分钟，获得 ${points} 积分`);
    }
  };


  /**
   * 监听应用状态变化
   */
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      console.log(`App状态变化: ${AppState.currentState} -> ${nextAppState}`);

      if (nextAppState === 'active') {
        // 应用进入前台，恢复监控
        if (postureStore.isMonitoring) {
          console.log('📱 应用回到前台，恢复监控');
          startMonitoring();
        }
      } else if (nextAppState === 'background') {
        // 应用进入后台，暂停监控（节省资源）
        console.log('📱 应用进入后台，暂停监控');
        stopMonitoring();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [postureStore.isMonitoring]);

  /**
   * 组件卸载时清理
   */
  useEffect(() => {
    return () => {
      stopMonitoring();
    };
  }, []);

  return {
    startMonitoring,
    stopMonitoring,
    isMonitoring: postureStore.isMonitoring,
    currentStatus: postureStore.nowStatus,
    statistics: statisticsRef.current,
  };
}

