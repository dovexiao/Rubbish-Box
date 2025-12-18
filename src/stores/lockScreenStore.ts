import { create } from "zustand"

interface LockScreenState {
  /**
   * 是否处于锁屏状态
   */
  locked: boolean
  /**
   * 设置锁屏状态
   */
  setLocked: (locked: boolean) => void
}

/**
 * 全局锁屏状态管理
 * 用于控制 GlobalLockScreen 组件的显示/隐藏
 */
export const useLockScreenStore = create<LockScreenState>((set) => ({
  locked: false,
  setLocked: (locked: boolean) => set({ locked }),
}))

export const unlockLockScreen = () => {
  useLockScreenStore.getState().setLocked(false);
};

export const lockLockScreen = () => {
  useLockScreenStore.getState().setLocked(true);
};


