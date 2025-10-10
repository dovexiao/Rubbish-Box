import { create } from "zustand"

interface TabbarState {
  curIdx: number
  setCurIdx: (index: number) => void
}

/**
 * Tabbar状态管理
 * 用于管理底部导航栏的当前选中索引
 */
export const useTabbarStore = create<TabbarState>((set) => ({
  curIdx: 0,
  setCurIdx: (index: number) => set({ curIdx: index }),
}))

