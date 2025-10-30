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
import { saveMointorData } from '../services/app';

const BAD_POSTURE_REMINDER_INTERVAL_SECONDS = 30; // 不良姿势每30秒提醒一次
const HOUR_IN_SECONDS = 60 * 60; // 1小时 = 3600秒
const REWARD_INTERVAL_SECONDS = 10 * 60; // 10分钟 = 600秒
const DETECTION_INTERVAL_SECONDS = 10; // Native层每10秒发送一次状态

export function useGlobalPostureMonitor() {
  const postureStore = usePostureStore();
  const audioService = useRef<AudioService | null>(null);
  const storage = useRef<PostureStorageService | null>(null);
  
  const detectionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // 🔴 奖励计数器（独立于统计，用于奖励判断）
  const rewardAccumulatedSeconds = useRef(0);
  
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
   * 更新统计数据（简化逻辑：直接累加时间）
   */
  const updateStatistics = async (status: PostureStatus) => {
    const stats = statisticsRef.current;

    // 检查是否需要每日重置
    const today = new Date().setHours(0, 0, 0, 0);
    if (stats.dailyResetTime < today) {
      stats.good = 0;
      stats.shouldersNotLevel = 0;
      stats.headNotCentered = 0;
      stats.headNotUp = 0;
      stats.total = 0;
      stats.goodPostureDuration = 0;
      stats.badPostureDuration = 0;
      stats.totalDuration = 0;
      stats.dailyResetTime = today;
      rewardAccumulatedSeconds.current = 0; // 每日重置奖励计数
    }

    // 🔴 简化逻辑：根据状态直接累加时间（Native每10秒发送一次）
    switch (status) {
      case 'good':
        stats.good += DETECTION_INTERVAL_SECONDS; // 累加10秒
        rewardAccumulatedSeconds.current += DETECTION_INTERVAL_SECONDS; // 奖励计数器也累加
        postureStore.incrementGoodTime(DETECTION_INTERVAL_SECONDS);
        break;
      case 'shoulders_not_level':
        stats.shouldersNotLevel += DETECTION_INTERVAL_SECONDS;
        rewardAccumulatedSeconds.current += DETECTION_INTERVAL_SECONDS; // 所有有效状态都计入奖励
        postureStore.incrementShoulderTiltTime(DETECTION_INTERVAL_SECONDS);
        break;
      case 'head_not_centered':
        stats.headNotCentered += DETECTION_INTERVAL_SECONDS;
        rewardAccumulatedSeconds.current += DETECTION_INTERVAL_SECONDS; // 所有有效状态都计入奖励
        postureStore.incrementHeadTiltTime(DETECTION_INTERVAL_SECONDS);
        break;
      case 'head_not_up':
        stats.headNotUp += DETECTION_INTERVAL_SECONDS;
        rewardAccumulatedSeconds.current += DETECTION_INTERVAL_SECONDS; // 所有有效状态都计入奖励
        postureStore.incrementHeadDownTime(DETECTION_INTERVAL_SECONDS);
        break;
      case 'no_person':
      case 'detecting':
        // 检测不到人或检测中，不增加计数
        return; // 直接返回，不执行后续检查
    }

    // 🔴 计算总时长（所有状态的时间总和）
    stats.total = stats.good + stats.shouldersNotLevel + stats.headNotCentered + stats.headNotUp;
    stats.goodPostureDuration = stats.good;
    stats.badPostureDuration = stats.shouldersNotLevel + stats.headNotCentered + stats.headNotUp;
    stats.totalDuration = stats.total;

    console.log(`📊 累计时间: 总计=${stats.total}秒, 良好=${stats.good}秒, 奖励累计=${rewardAccumulatedSeconds.current}秒`);

    // 🔴 检查是否达到奖励阈值（600秒 = 10分钟）
    if (rewardAccumulatedSeconds.current >= REWARD_INTERVAL_SECONDS) {
      console.log(`✅ 达到奖励阈值: ${rewardAccumulatedSeconds.current}秒 >= ${REWARD_INTERVAL_SECONDS}秒`);
      handleReward();
      rewardAccumulatedSeconds.current = 0; // 🔴 重置奖励计数器，开始新一轮
    }

    // 🔴 检查是否达到1小时阈值（总时长 >= 3600秒）
    if (stats.total >= HOUR_IN_SECONDS) {
      console.log(`⏰ 达到1小时阈值(${HOUR_IN_SECONDS}秒)，上报学习时长并重置统计`);
      
      // 🔴 先调用接口上报学习时长（在重置之前）
      try {
        await saveMointorData({
          correct_sitting_posture_time: stats.good, // 坐姿正确时间（秒）
          head_tilt_time: stats.headNotCentered, // 头部倾斜时间（秒）
          lowering_the_head_time: stats.headNotUp, // 低头时间（秒）
          shoulder_tilt_time: stats.shouldersNotLevel, // 肩膀倾斜时间（秒）
        });
        console.log(`✅ 学习时长上报成功:`, {
          正确坐姿: stats.good + '秒',
          头部倾斜: stats.headNotCentered + '秒',
          低头: stats.headNotUp + '秒',
          肩膀倾斜: stats.shouldersNotLevel + '秒',
        });
      } catch (error) {
        console.error('❌ 学习时长上报失败:', error);
      }
      
      // 然后重置所有统计
      stats.good = 0;
      stats.shouldersNotLevel = 0;
      stats.headNotCentered = 0;
      stats.headNotUp = 0;
      stats.total = 0;
      stats.goodPostureDuration = 0;
      stats.badPostureDuration = 0;
      stats.totalDuration = 0;
      
      // 保存重置后的数据
      if (storage.current) {
        storage.current.saveStatistics(stats);
      }
    }

    // 每600秒（10分钟）保存一次统计数据
    if (storage.current && stats.total > 0 && stats.total % 600 === 0) {
      storage.current.saveStatistics(stats);
    }

    stats.lastUpdateTime = Date.now();
  };

  /**
   * 处理奖励（学习 UniApp）
   */
  const handleReward = async () => {
    const seconds = postureStore.rewardConfig.goodPostureCount;
    const minutes = Math.floor(seconds / 60);
    const points = postureStore.rewardConfig.rewardPoints;
    
    console.log(`🎉 触发奖励: 累计${seconds}秒(${minutes}分钟)，奖励${points}积分`);
    
    // 后台自动领取奖励
    const success = await postureStore.handlePostureReward();
    
    if (success) {
      // 使用 toast 显示奖励提示
      showInfo(`🎉 太棒了！累计学习 ${minutes} 分钟，获得 ${points} 积分`);
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

