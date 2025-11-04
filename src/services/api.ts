import { router } from "expo-router"
import axios, { AxiosInstance, AxiosRequestConfig } from "axios"
import { Platform, Alert } from "react-native"

import { API_BASE_URL, API_TIMEOUT, DEFAULT_HEADERS, UPLOAD_API_URL } from "../config/api"
import { IS_DEV } from "../config/env"
import { getDeviceInfoForAPI } from "../utils/deviceInfo"
import { showError, showSuccess, showWarning } from "../utils/toast"
/**
 * 扩展AxiosRequestConfig类型，添加metadata字段
 */
declare module "axios" {
  interface AxiosRequestConfig {
    metadata?: {
      startTime: number
    }
  }
}

/**
 * 日志配置
 */
const LOG_CONFIG = {
  ENABLED: IS_DEV, // 只在开发环境打印日志
  SHOW_REQUEST: true,
  SHOW_RESPONSE: true,
  SHOW_ERROR: true,
  MAX_DATA_LENGTH: 1000, // 最大数据长度，超过则截断
}

/**
 * 格式化日志数据
 */
const formatLogData = (data: any): string => {
  if (!data) return "无"

  try {
    const jsonStr = JSON.stringify(data, null, 2)
    if (jsonStr.length > LOG_CONFIG.MAX_DATA_LENGTH) {
      return jsonStr.substring(0, LOG_CONFIG.MAX_DATA_LENGTH) + "... (数据过长，已截断)"
    }
    return jsonStr
  } catch {
    return String(data)
  }
}

/**
 * 安全的日志打印
 */
const safeLog = (message: string, ...args: any[]) => {
  if (LOG_CONFIG.ENABLED) {
    console.log(message, ...args)
  }
}

/**
 * API基础配置
 * 对应UniApp项目中的utils/http.ts和utils/request.ts
 */

// 创建axios实例
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: DEFAULT_HEADERS,
})

// 请求拦截器
apiClient.interceptors.request.use(
  async (config) => {
    // 添加请求开始时间
    config.metadata = { startTime: Date.now() }

    // 添加设备信息到请求参数中
    try {
      const deviceInfo = await getDeviceInfoForAPI()

      // 根据请求方法添加设备信息
      if (config.method?.toLowerCase() === "get") {
        // GET请求添加到params
        config.params = {
          ...config.params,
          ...deviceInfo,
        }
      } else {
        // POST/PUT等请求添加到data
        if (config.data && typeof config.data === "object") {
          config.data = {
            ...config.data,
            ...deviceInfo,
          }
        } else {
          config.data = {
            ...deviceInfo,
            ...config.data,
          }
        }
      }

      safeLog("📱 已添加设备信息:", deviceInfo.device_code)
    } catch (error) {
      safeLog("⚠️ 添加设备信息失败:", error)
    }

    // 打印请求详细信息
    if (LOG_CONFIG.ENABLED && LOG_CONFIG.SHOW_REQUEST) {
      safeLog("🚀 API请求开始 ===================================")
      safeLog("📍 请求URL:", (config.baseURL || "") + (config.url || ""))
      safeLog("📋 请求方法:", config.method?.toUpperCase())
      safeLog("📦 请求头:", formatLogData(config.headers))
      safeLog("📄 请求参数:", formatLogData(config.params))
      safeLog("📝 请求数据:", formatLogData(config.data))
      safeLog("⏱️ 超时时间:", config.timeout + "ms")
      safeLog("🕐 请求时间:", new Date().toLocaleTimeString())
      safeLog("===============================================")
    }

    // 检查是否是登录相关的API（这些API不需要token）
    const loginRelatedAPIs = [
      "/AppStart/Input_Code",
      "/AppStart/SignInPhoneid",
      "/AppStart/SignInPassword",
      "/AppStart/ResetPassword",
    ]

    const isLoginRelatedAPI = loginRelatedAPIs.some((api) => config.url?.includes(api))

    if (isLoginRelatedAPI) {
      safeLog("🔓 登录相关API，无需添加Token")
      return config
    }

    // 从存储中获取token
    try {
      const { useUserStore } = await import("../stores/userStore")
      const userStore = useUserStore.getState()
      const token = userStore.token || "" // 直接从 userStore.token 获取

      if (token && typeof token === "string") {
        config.headers.Authorization = `Bearer ${token}`
        safeLog("🔐 已添加Token:", token.substring(0, 20) + "...")
      } else {
        safeLog("⚠️ 未找到Token，继续发送请求但不添加Authorization头")
      }
    } catch (error) {
      safeLog("⚠️ 获取Token失败:", error)
      safeLog("⚠️ 继续发送请求但不添加Authorization头")
    }

    return config
  },
  (error) => {
    safeLog("❌ 请求拦截器错误:", error)
    return Promise.reject(error)
  },
)

// 响应拦截器
apiClient.interceptors.response.use(
  async (response) => {
    // 计算请求耗时
    const duration = response.config.metadata?.startTime
      ? Date.now() - response.config.metadata.startTime
      : 0

    // 打印响应详细信息
    if (LOG_CONFIG.ENABLED && LOG_CONFIG.SHOW_RESPONSE) {
      safeLog("✅ API响应成功 ===================================")
      safeLog("📍 响应URL:", response.config.url)
      safeLog("📊 响应状态:", response.status, response.statusText)
      safeLog("📋 响应头:", formatLogData(response.headers))
      safeLog("📄 响应数据:", formatLogData(response.data))
      safeLog("⏱️ 请求耗时:", duration + "ms")
      safeLog("🕐 响应时间:", new Date().toLocaleTimeString())
      safeLog("===============================================")
    }

    // 处理响应数据
    const res = response.data

    // 根据API的返回格式进行处理
    if (res.code === 201 || res.code === 200) {
      safeLog("✅ 请求成功，返回数据:", formatLogData(res.data))
      return res.data
    }

    // 处理HTTP 401状态码
    if (response.status === 401) {
      safeLog("🔐 未授权，需要重新登录")
      // 处理未授权情况
      try {
        const { useUserStore } = await import("../stores/userStore")
        const userStore = useUserStore.getState()
        userStore.logout()
        safeLog("🔐 用户未授权，已清除token")

        // 使用登录弹窗替代页面跳转
        const { showLoginModal } = await import("../utils/loginUtils")
        showLoginModal({
          onSuccess: () => {
            safeLog("🔐 用户重新登录成功")
          },
          onCancel: () => {
            safeLog("🔐 用户取消登录")
          },
        })
      } catch (error) {
        safeLog("⚠️ 处理未授权错误:", error)
      }
      return Promise.reject(new Error("登录已失效，请重新登录"))
    }

    // 处理其他HTTP状态码错误
    if (response.status !== 200 && response.status !== 201) {
      safeLog("⚠️ HTTP状态码错误:", response.status, response.statusText)
      return Promise.reject(new Error(`HTTP ${response.status}: ${response.statusText}`))
    }

    // 处理业务状态码错误
    safeLog("⚠️ 业务错误:", res.code, res.message)
    // 显示美观的错误提示
    showError(res.message || "请求失败")
    return Promise.reject(new Error(res.message || "请求失败"))
  },
  (error) => {
    // 计算请求耗时
    const duration = error.config?.metadata?.startTime
      ? Date.now() - error.config.metadata.startTime
      : 0

    // 特殊处理401未授权错误
    if (error.response?.status === 401) {
      safeLog("🔐 检测到401未授权错误，需要重新登录")

      // 处理未授权情况
      try {
        import("../stores/userStore")
          .then(async ({ useUserStore }) => {
            const userStore = useUserStore.getState()
            userStore.logout()
            safeLog("🔐 已清除本地token")

            // 使用登录弹窗替代页面跳转
            const { showLoginModal } = await import("../utils/loginUtils")
            showLoginModal({
              onSuccess: () => {
                safeLog("🔐 用户重新登录成功")
              },
              onCancel: () => {
                safeLog("🔐 用户取消登录")
              },
            })
          })
          .catch((e) => {
            safeLog("⚠️ 清除token失败:", e)
          })
      } catch (e) {
        safeLog("⚠️ 处理未授权错误:", e)
      }
      return Promise.reject(new Error("登录已失效，请重新登录"))
    }

    // 打印错误详细信息
    if (LOG_CONFIG.ENABLED && LOG_CONFIG.SHOW_ERROR) {
      safeLog("❌ API请求失败 ===================================")
      safeLog("📍 错误URL:", error.config?.url || "未知")
      safeLog("📊 错误状态:", error.response?.status || "网络错误")
      safeLog("📋 错误信息:", error.message)
      safeLog("📄 错误响应:", formatLogData(error.response?.data))
      safeLog("📄 错误响应类型:", typeof error.response?.data)
      safeLog("⏱️ 请求耗时:", duration + "ms")
      safeLog("🕐 错误时间:", new Date().toLocaleTimeString())
      safeLog("🔍 完整错误:", error)
      safeLog("===============================================")
    }

    // 尝试解析错误响应
    let errorData = error.response?.data
    let errorMessage = ""

    // 如果响应数据是字符串，尝试解析为JSON
    if (typeof errorData === "string") {
      try {
        errorData = JSON.parse(errorData)
        safeLog("✅ 成功解析错误响应为JSON:", errorData)
      } catch (e) {
        safeLog("⚠️ 错误响应不是有效的JSON，原始数据:", errorData)
      }
    }

    // 提取错误消息
    if (errorData?.message) {
      errorMessage = errorData.message
    } else if (errorData?.msg) {
      errorMessage = errorData.msg
    } else if (errorData?.error) {
      errorMessage = errorData.error
    } else if (typeof errorData === "string") {
      errorMessage = errorData
    } else if (error.message) {
      errorMessage = error.message
    } else {
      errorMessage = "网络请求失败，请检查网络连接"
    }

    // 显示错误消息
    showError(errorMessage)

    // 创建一个新的 Error 对象，使用解析后的错误消息
    const newError: any = new Error(errorMessage)
    
    // 保留原始错误的一些有用信息
    newError.response = error.response
    newError.status = error.response?.status
    newError.data = errorData
    newError.originalError = error

    safeLog("✅ 已创建新的错误对象，消息:", errorMessage)

    return Promise.reject(newError)
  },
)

/**
 * 通用请求方法
 */
export const request = async <T = any>(config: AxiosRequestConfig): Promise<T> => {
  try {
    const response = await apiClient(config)
    return response as T
  } catch (error) {
    return Promise.reject(error)
  }
}

/**
 * GET请求
 */
export const get = <T = any>(url: string, params?: any): Promise<T> => {
  return request<T>({
    method: "GET",
    url,
    params,
  })
}

/**
 * POST请求
 */
export const post = <T = any>(url: string, data?: any): Promise<T> => {
  return request<T>({
    method: "POST",
    url,
    data,
  })
}

/**
 * PUT请求
 */
export const put = <T = any>(url: string, data?: any): Promise<T> => {
  return request<T>({
    method: "PUT",
    url,
    data,
  })
}

/**
 * DELETE请求
 */
export const del = <T = any>(url: string, params?: any): Promise<T> => {
  return request<T>({
    method: "DELETE",
    url,
    params,
  })
}

/**
 * 文件上传请求
 */
export const upload = <T = any>(file: FormData): Promise<T> => {
  return request<T>({
    method: "POST",
    url: UPLOAD_API_URL,
    data: file,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
}

export default {
  request,
  get,
  post,
  put,
  del,
  upload,
}
