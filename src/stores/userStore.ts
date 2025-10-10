import { create } from "zustand"
import { MMKV } from "react-native-mmkv"

// 存储实例
const storage = new MMKV()

// 存储键
const STORAGE_KEYS = {
  USER_INFO: "user_info",
  TOKEN: "token",
}

// 用户信息接口
interface User {
  id?: string
  username: string
  avatar?: string
  nickname?: string
  grade?: string
  points?: number
  rank?: string
  total_duration?: number
  rank_required?: number
  study_days?: number
  gender?: number // 0男 1女
  [key: string]: any
}

interface UserState {
  user: User | null
  token: string | null
  isLoggedIn: boolean
  isLoading: boolean
  showLoginPopup: boolean
  error: string | null

  // 操作方法
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  setUserInfo: (data: { token: string; refreshToken?: string; userInfo?: any }) => void
  initializeFromStorage: () => void // 新增：从存储初始化
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  getUserInfo: () => Promise<User>
  showLoginModal: () => void
  closeLoginPopup: () => void
}

// 安全地获取存储值的辅助函数
const getStorageValue = (key: string): string | null => {
  try {
    return storage.getString(key) || null
  } catch (error) {
    // 在服务端渲染时返回null
    return null
  }
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  token: null, // 初始化为null，在useEffect中异步加载
  isLoggedIn: false, // 初始化为false，在useEffect中异步设置
  isLoading: false,
  showLoginPopup: false,
  error: null,

  setUser: (user) => {
    set({ user, isLoggedIn: !!user })
    if (user) {
      storage.set(STORAGE_KEYS.USER_INFO, JSON.stringify(user))
    } else {
      storage.delete(STORAGE_KEYS.USER_INFO)
    }
  },

  setToken: (token) => {
    set({ token, isLoggedIn: !!token })
    if (token) {
      storage.set(STORAGE_KEYS.TOKEN, token)
    } else {
      storage.delete(STORAGE_KEYS.TOKEN)
    }
  },

  setUserInfo: (data) => {
    const { token, refreshToken, userInfo } = data
    set({
      token,
      user: userInfo || null,
      isLoggedIn: !!token,
    })

    // 保存到存储
    if (token) {
      storage.set(STORAGE_KEYS.TOKEN, token)
    }
    if (userInfo) {
      storage.set(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo))
    }
  },

  initializeFromStorage: () => {
    try {
      const storedToken = getStorageValue(STORAGE_KEYS.TOKEN)
      const storedUserInfo = getStorageValue(STORAGE_KEYS.USER_INFO)

      let user = null
      if (storedUserInfo) {
        try {
          user = JSON.parse(storedUserInfo)
        } catch (e) {
          console.warn("Failed to parse stored user info")
        }
      }

      set({
        token: storedToken,
        user,
        isLoggedIn: !!storedToken,
      })
    } catch (error) {
      console.warn("Failed to initialize from storage:", error)
    }
  },

  login: async (username, password) => {
    set({ isLoading: true, error: null })

    try {
      // 模拟登录API调用
      const mockResponse = {
        user: {
          id: "user123",
          username: username,
          avatar: "/static/images/user-avatar-boy.png",
          grade: "三年级",
          rank: "初级学者",
          total_duration: 50,
          rank_required: 100,
          study_days: 15,
          gender: 0,
        },
        token: "mock-token-" + Date.now(),
      }

      set({
        user: mockResponse.user,
        token: mockResponse.token,
        isLoggedIn: true,
        isLoading: false,
        showLoginPopup: false,
      })

      // 保存token到持久化存储
      storage.set(STORAGE_KEYS.TOKEN, mockResponse.token)
      // 保存用户信息
      storage.set(STORAGE_KEYS.USER_INFO, JSON.stringify(mockResponse.user))
    } catch (error: any) {
      set({
        error: error.message || "登录失败",
        isLoading: false,
      })
      throw error
    }
  },

  logout: () => {
    set({
      user: null,
      token: null,
      isLoggedIn: false,
    })

    // 清除存储的token和用户信息
    storage.delete(STORAGE_KEYS.TOKEN)
    storage.delete(STORAGE_KEYS.USER_INFO)
  },

  getUserInfo: async () => {
    const { user, token } = get()

    // 如果已有用户信息，直接返回
    if (user) return user

    // 如果有token但没有用户信息，尝试从存储中获取
    if (token) {
      const storedUserInfo = storage.getString(STORAGE_KEYS.USER_INFO)
      if (storedUserInfo) {
        const parsedUser = JSON.parse(storedUserInfo)
        set({ user: parsedUser, isLoggedIn: true })
        return parsedUser
      }
    }

    // 模拟用户信息
    const mockUser = {
      username: "测试用户",
      grade: "三年级",
      rank: "初级学者",
      total_duration: 50,
      rank_required: 100,
      study_days: 15,
      gender: 0,
    }

    set({ user: mockUser, isLoggedIn: true })
    return mockUser
  },

  showLoginModal: () => set({ showLoginPopup: true }),
  closeLoginPopup: () => set({ showLoginPopup: false }),
}))
