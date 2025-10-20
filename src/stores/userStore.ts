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
  user_id: string
  username: string
  profile_picture?: string | null
  area?: string | null
  birthday?: string
  city?: string
  district?: string
  educational_system?: string
  gender?: boolean // true男 false女
  grade?: string
  grade_stage?: string
  height?: number
  member_switch?: boolean
  phone?: string
  points?: number
  province?: string
  rank?: string
  rank_icon?: string | null
  rank_level?: number
  rank_required?: number
  school?: string
  study_days?: number
  total_duration?: number
  [key: string]: any
}

interface UserState {
  user: User | null
  token: string | null
  isLoggedIn: boolean
  isLoading: boolean
  error: string | null

  // 操作方法
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  setUserInfo: (data: { token: string; refreshToken?: string; userInfo?: any }) => void
  initializeFromStorage: () => void // 新增：从存储初始化
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  getUserInfo: () => Promise<User>
}

// 安全地获取存储值的辅助函数
const getStorageValue = (key: string): string | null => {
  try {
    return storage.getString(key) || null
  } catch (_error) {
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
    const { token, userInfo } = data
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
        } catch (_e) {
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
      // 使用统一的API配置
      const { post } = await import("../services/api")

      const response = await post("/AppStart/SignInPassword/", {
        phoneid: username,
        password: password,
        device_code: "mobile",
      })

      if (!response || typeof response !== 'object') {
        throw new Error("登录失败: 返回数据格式不正确")
      }

      const { token } = response
      
      if (!token) {
        throw new Error("登录失败: 未获取到token")
      }

      // 先设置token
      set({
        token,
        isLoggedIn: true,
        isLoading: false,
        showLoginPopup: false,
      })

      // 保存token到持久化存储
      storage.set(STORAGE_KEYS.TOKEN, token)
      
      try {
        // 登录成功后获取用户信息
        const { getUserInfo } = get()
        const userInfo = await getUserInfo()
        
        // 用户信息已在getUserInfo中保存到store和storage
        return
      } catch (userError) {
        console.warn("登录成功但获取用户信息失败:", userError)
        // 登录成功但获取用户信息失败，不影响登录状态
      }
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
      try {
        // 先尝试从存储中获取
      const storedUserInfo = storage.getString(STORAGE_KEYS.USER_INFO)
      if (storedUserInfo) {
          try {
        const parsedUser = JSON.parse(storedUserInfo)
            // 验证解析的用户信息是否符合User接口
            if (parsedUser && parsedUser.user_id && parsedUser.username) {
        set({ user: parsedUser, isLoggedIn: true })
        return parsedUser
            }
          } catch (e) {
            console.warn("Failed to parse stored user info:", e)
            // 解析失败继续尝试从服务器获取
          }
        }

        // 如果本地没有或解析失败，从服务器获取
        const { post: apiPost } = await import("../services/api")
        const response = await apiPost("/AppStart/UserInformation/user_information/", {}, { token })
        
        if (response && typeof response === 'object') {
          // 确保response符合User接口
          const userData: User = {
            ...response,
            // 确保必填字段存在
            user_id: response.user_id || '',
            username: response.username || '未知用户'
          }
          
          // 保存用户信息
          set({ user: userData, isLoggedIn: true })
          // 保存到存储
          storage.set(STORAGE_KEYS.USER_INFO, JSON.stringify(userData))
          return userData
        }
        throw new Error("获取用户信息失败: 返回数据格式不正确")
      } catch (error: any) {
        console.error("获取用户信息失败:", error)
        throw error
      }
    }

    // 如果没有token，抛出错误
    throw new Error("用户未登录")
  },

}))
