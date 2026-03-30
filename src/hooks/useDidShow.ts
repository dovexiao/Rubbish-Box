import { useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';

type DidShowCallback = () => void;

interface UseDidShowOptions {
  // true: 首次挂载若已聚焦也触发；false: 仅在失焦->聚焦切换时触发
  triggerOnMount?: boolean;
}

export function useDidShow(
  callback: DidShowCallback,
  options: UseDidShowOptions = { triggerOnMount: true },
) {
  const navigation = useNavigation() as any;
  const callbackRef = useRef(callback);
  const hasTriggeredOnceRef = useRef(false);

  // 始终使用最新回调，避免外部回调引用变化导致重复触发
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const onFocus = () => {
      if (!hasTriggeredOnceRef.current) {
        hasTriggeredOnceRef.current = true;
        if (options.triggerOnMount !== false) {
          callbackRef.current?.();
        }
        return;
      }
      callbackRef.current?.();
    };

    const unsubscribe = navigation?.addListener?.('focus', onFocus);

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [navigation, options.triggerOnMount]);
}
