import {useCallback, useEffect, useRef} from 'react';
import {FlatList, NativeScrollEvent, NativeSyntheticEvent} from 'react-native';

export interface FlatListPlayOptions {
  canPlay?: boolean;
  overListLength?: number;
  timeout?: number;
  row?: boolean;
  size?: number;
  cycle?: number;
}

export function useFlatListAutoPlay<T>(
  list: T[],
  {
    canPlay = false,
    overListLength = 4,
    timeout = 2000,
    row = false,
    size,
    cycle,
  }: FlatListPlayOptions = {},
) {
  const flatListTiming = useRef<NodeJS.Timeout>();
  const flatListRef = useRef<FlatList>(null);
  const flatListIndex = useRef<number>(0);

  const updateIndex = useCallback(() => {
    flatListTiming.current = setTimeout(() => {
      if (
        flatListRef.current &&
        list.length > overListLength &&
        flatListIndex.current < list.length - 1 &&
        canPlay
      ) {
        flatListIndex.current++;
        /** TODO 对于循环的情况，这里并没有做到平滑切换，后续再优化 */
        if (cycle && flatListIndex.current >= cycle) {
          flatListIndex.current -= cycle;
          flatListRef.current.scrollToIndex({
            index: flatListIndex.current,
            animated: false,
          });
        }
        flatListRef.current.scrollToIndex({
          index: flatListIndex.current,
          animated: true,
        });
        updateIndex();
      }
    }, timeout);
  }, [timeout, list.length, overListLength, canPlay, cycle]);

  useEffect(() => {
    if (
      list.length > overListLength &&
      flatListIndex.current < list.length &&
      canPlay
    ) {
      updateIndex();
    } else {
      if (flatListTiming.current) {
        clearTimeout(flatListTiming.current);
      }
    }

    return () => {
      if (flatListTiming.current) {
        clearTimeout(flatListTiming.current);
      }
    };
  }, [canPlay, list.length, overListLength, updateIndex]);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!size) {
      return;
    }
    if (row) {
      const x = e.nativeEvent.contentOffset.x;
      const nowIndex = Math.floor(x / size);
      flatListIndex.current = nowIndex;
      return;
    }
    const y = e.nativeEvent.contentOffset.y;
    const nowIndex = Math.floor(y / size);
    flatListIndex.current = nowIndex;
  };

  return {
    flatListRef,
    handleScroll,
  };
}
