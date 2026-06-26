import { createStore } from 'jotai/vanilla';

export const appStore = createStore();
import { atom, PrimitiveAtom } from 'jotai';
// 和UI有关的全局数据存储在这里，和UI无关的全局数据存储在cache.ts文件中

export const bindDeviceSuccessStore = atom(undefined) as PrimitiveAtom<
  undefined | number
>;

// 非市电版本地锁，蓝牙操作状态
export const bluetoothOperationLockFallStatusStore = atom(
  'RISE',
) as PrimitiveAtom<'RISE' | 'DOWN'>;

export const tabBarHeightStore = atom(0) as PrimitiveAtom<number>;
