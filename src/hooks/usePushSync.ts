import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import {
  cacheGet,
  getStorage,
  getMobPushDeviceInfo,
  jumpToPage,
} from '@/utils';

// 全局隔离单薄标记内存缓存区 (安全规避 global 未声明或 lint 警告)
let __has_home_pushed_synced_session = false;
let __has_app_active_push_synced = false;

/**
 * 推送同步、深链接唤起、前后台恢复拦截的统一隔离处理 Hook。
 * 把推送逻辑从 App.tsx 主渲染中摘除，互不影响。
 */
export const usePushSync = ({
  privacyReady,
  currentRouteName,
}: {
  privacyReady: boolean;
  currentRouteName: string;
}) => {
  const getPushInfoRunningRef = useRef<boolean>(false);
  const lastPushSyncAtRef = useRef<number>(0);
  const activeSyncLastAtRef = useRef<number>(0);

  // 1. 封装独立执行、带高频阻断及并发保护的统一推送处理流
  const triggerPushSync = async (source: string) => {
    const now = Date.now();
    if (getPushInfoRunningRef.current) return;

    // 如果距上次只过了几秒钟，跳过重复上报
    if (now - lastPushSyncAtRef.current < 8000) {
      return;
    }

    getPushInfoRunningRef.current = true;
    lastPushSyncAtRef.current = now;

    try {
      const [agree, token, pushRes] = await Promise.all([
        cacheGet({ key: 'agreePrivacy' }).catch(() => false),
        cacheGet({ key: 'token' }).catch(() => undefined),
        getStorage({ key: 'pushEnabled' }).catch(
          () => ({ data: undefined } as any),
        ),
      ]);

      const enabled =
        (typeof pushRes === 'boolean' ? pushRes : pushRes?.data) === true;
      const loggedIn = !!token;

      if (!(agree && enabled && loggedIn)) {
        return;
      }

      // 静默延迟 500ms 执行，绝不抢主线程 UI / 业务资源
      setTimeout(() => {
        void getMobPushDeviceInfo().catch(e => {
          if (__DEV__) {
            console.warn(
              `[push-flow][${source}] 提取/同步 RegistrationID 失败:`,
              e,
            );
          }
        });
      }, 500);
    } catch (e) {
      if (__DEV__) {
        console.warn(`[push-flow][${source}] 鉴权异常:`, e);
      }
    } finally {
      getPushInfoRunningRef.current = false;
    }
  };

  // 2. 绑定点击推送系统通栏弹窗从而跳入指定页面的回调能力
  useEffect(() => {
    let jumpListener: { remove?: () => void } | null = null;
    let isCancelled = false;

    const setupJumpListener = async () => {
      try {
        const [agree, token, pushRes] = await Promise.all([
          cacheGet({ key: 'agreePrivacy' }).catch(() => false),
          cacheGet({ key: 'token' }).catch(() => undefined),
          getStorage({ key: 'pushEnabled' }).catch(
            () => ({ data: undefined } as any),
          ),
        ]);

        if (isCancelled) return;

        const enabled =
          (typeof pushRes === 'boolean' ? pushRes : pushRes?.data) === true;
        const loggedIn = !!token;

        if (agree && enabled && loggedIn && privacyReady) {
          jumpListener = await jumpToPage();
        }
      } catch (error) {
        console.error('设置消息跳转监听失败:', error);
      }
    };

    if (privacyReady) {
      setupJumpListener();
    }

    return () => {
      isCancelled = true;
      if (jumpListener?.remove) {
        jumpListener.remove();
      }
    };
  }, [privacyReady]);

  // 3. 切回首页时自动补全一次上报 (应用级别单次冷启限制，只触发一次)
  useEffect(() => {
    // 兼容应用里的名称 Index
    if (currentRouteName === 'Index') {
      try {
        // 利用闭包内存变量标记，避免用户一切标签页就去同步，也避免任何 TS 问题
        if (!__has_home_pushed_synced_session) {
          __has_home_pushed_synced_session = true;
          void triggerPushSync('RouteFocusSync');
        }
      } catch {}
    }
  }, [currentRouteName]);

  // 4. 当应用被放在后台较长时间又回到前台，需要恢复长连接并在有必要时上报
  useEffect(() => {
    const handleActiveSync = () => {
      const now = Date.now();
      // 防止系统高频抛变动事件
      if (now - activeSyncLastAtRef.current < 2000) return;
      activeSyncLastAtRef.current = now;

      try {
        // 利用另外一个独立单次标记，保证前后台恢复的同步也不会非常无意义爆发
        if (!__has_app_active_push_synced) {
          __has_app_active_push_synced = true;
          void triggerPushSync('AppActiveSync');
        }
      } catch {}
    };

    const sub = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        if (nextAppState === 'active') {
          handleActiveSync();
        }
      },
    );

    return () => {
      sub.remove();
    };
  }, []);
};
