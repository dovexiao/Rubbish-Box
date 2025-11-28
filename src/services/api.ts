import { router } from "expo-router"
import axios, { AxiosInstance, AxiosRequestConfig } from "axios"
import { Platform, Alert } from "react-native"

import { API_BASE_URL, API_TIMEOUT, DEFAULT_HEADERS, UPLOAD_API_URL } from "../config/api"
import { IS_DEV } from "../config/env"
import { getDeviceInfoForAPI } from "../utils/deviceInfo"
import { showError, showSuccess, showWarning } from "../utils/toast"
import { triggerNetworkError } from "../utils/networkEvents"
/**
 * 扩展AxiosRequestConfig类型，添加metadata字段
 */
declare module "axios" {
  interface AxiosRequestConfig {
    metadata?: {
      startTime: number
    }
    __retryCount?: number
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

// 重试配置
const RETRY_CONFIG = {
  MAX_RETRIES: 3, // 最大重试次数
  RETRY_DELAY: 1000, // 初始重试延迟（毫秒）
  RETRY_STATUS_CODES: [408, 500, 502, 503, 504], // 需要重试的HTTP状态码
  BACKOFF_MULTIPLIER: 2, // 指数退避倍数
}

// 检测是否是数据库连接错误
const isDatabaseConnectionError = (error: any): boolean => {
  const errorMessage = error?.response?.data || error?.message || ""
  const errorString = typeof errorMessage === "string" ? errorMessage : JSON.stringify(errorMessage)
  
  return (
    errorString.includes("Too many connections") ||
    errorString.includes("OperationalError") ||
    errorString.includes("Database connection failed") ||
    errorString.includes("Connection pool exhausted")
  )
}

// 延迟函数
const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * 验证网络连接是否真实可用
 * 通过请求百度首页来判断
 * @returns true表示网络可用，false表示网络不可用
 */
const verifyNetworkConnection = async (): Promise<boolean> => {
  try {
    safeLog("🌐 开始验证网络连接（请求百度）...")
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5秒超时
    
    const response = await fetch("https://www.baidu.com", {
      method: "HEAD",
      signal: controller.signal,
      cache: "no-cache",
    })
    
    clearTimeout(timeoutId)
    
    const isSuccess = response.status === 200
    safeLog(`🌐 网络验证结果: ${isSuccess ? "网络可用✅" : "网络不可用❌"} (状态码: ${response.status})`)
    
    return isSuccess
  } catch (error: any) {
    safeLog("🌐 网络验证失败（无法连接百度）:", error.message)
    return false
  }
}

// 创建axios实例
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: DEFAULT_HEADERS,
  // 确保数据正确序列化
  transformRequest: [
    (data, headers) => {
      // 如果数据已经是字符串（可能是重试时已经序列化的），直接返回
      if (typeof data === "string") {
        headers["Content-Type"] = "application/json"
        return data
      }
      // 如果数据是对象，确保正确序列化
      if (data && typeof data === "object" && !(data instanceof FormData)) {
        headers["Content-Type"] = "application/json"
        return JSON.stringify(data)
      }
      return data
    },
  ],
})

// 请求拦截器
apiClient.interceptors.request.use(
  async (config) => {
    // 添加请求开始时间
    config.metadata = { startTime: Date.now() }
    
    // 如果是重试请求且 data 是字符串，说明已经被序列化过
    // 需要先解析回对象，以便添加设备信息
    if (config.data && typeof config.data === "string") {
      try {
        config.data = JSON.parse(config.data)
        safeLog("🔄 请求拦截器：已解析序列化的数据（可能是重试请求）")
      } catch (e) {
        safeLog("⚠️ 请求拦截器：无法解析数据，保持原始字符串")
        // 如果解析失败，直接返回，不添加设备信息
        return config
      }
    }

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
        // POST/PUT等请求添加到data（此时 data 应该是对象）
        if (config.data && typeof config.data === "object" && !(config.data instanceof FormData)) {
          config.data = {
            ...config.data,
            ...deviceInfo,
          }
        } else {
          config.data = {
            ...deviceInfo,
            ...(config.data || {}),
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
      // 检查数据格式，避免错误序列化
      if (config.data && typeof config.data === "string") {
        safeLog("⚠️ 警告：请求数据是字符串类型，可能已被错误序列化")
        try {
          const parsed = JSON.parse(config.data)
          safeLog("📝 请求数据（解析后）:", formatLogData(parsed))
        } catch {
          safeLog("📝 请求数据（原始字符串）:", config.data.substring(0, 200))
        }
      } else {
        safeLog("📝 请求数据:", formatLogData(config.data))
      }
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
  async (error) => {
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

    // 检测数据库连接错误
    if (isDatabaseConnectionError(error)) {
      safeLog("🔴 检测到数据库连接错误（Too many connections）")
      
      // 获取重试次数
      const retryCount = error.config.__retryCount || 0
      
      if (retryCount < RETRY_CONFIG.MAX_RETRIES) {
        // 计算重试延迟（指数退避）
        const retryDelay = RETRY_CONFIG.RETRY_DELAY * Math.pow(RETRY_CONFIG.BACKOFF_MULTIPLIER, retryCount)
        
        safeLog(`🔄 服务器繁忙，${retryDelay}ms后进行第${retryCount + 1}次重试...`)
        
        // 增加重试计数
        error.config.__retryCount = retryCount + 1
        
        // 如果 data 是字符串（已被序列化），需要确保它保持字符串格式
        if (error.config.data && typeof error.config.data === "string") {
          if (!error.config.headers) {
            error.config.headers = {}
          }
          error.config.headers["Content-Type"] = "application/json"
        }
        
        // 延迟后重试
        await delay(retryDelay)
        
        safeLog(`♻️ 开始第${retryCount + 1}次重试请求: ${error.config.url}`)
        return apiClient(error.config)
      } else {
        safeLog("❌ 已达到最大重试次数，停止重试")
        showError("服务器繁忙，请稍后再试")
        
        const newError: any = new Error("服务器繁忙，请稍后再试")
        newError.response = error.response
        newError.status = error.response?.status
        newError.isDatabaseError = true
        return Promise.reject(newError)
      }
    }

    // 检测其他可重试的错误（网络超时、服务器错误等）
    const status = error.response?.status
    const retryCount = error.config.__retryCount || 0
    
    if (
      retryCount < RETRY_CONFIG.MAX_RETRIES &&
      (RETRY_CONFIG.RETRY_STATUS_CODES.includes(status) || error.code === "ECONNABORTED")
    ) {
      const retryDelay = RETRY_CONFIG.RETRY_DELAY * Math.pow(RETRY_CONFIG.BACKOFF_MULTIPLIER, retryCount)
      
      safeLog(`🔄 请求失败（状态码: ${status || "超时"}），${retryDelay}ms后进行第${retryCount + 1}次重试...`)
      
      error.config.__retryCount = retryCount + 1
      
      // 如果 data 是字符串（已被序列化），需要确保它保持字符串格式
      // transformRequest 会正确处理字符串
      if (error.config.data && typeof error.config.data === "string") {
        // 确保 Content-Type 正确
        if (!error.config.headers) {
          error.config.headers = {}
        }
        error.config.headers["Content-Type"] = "application/json"
      }
      
      await delay(retryDelay)
      
      safeLog(`♻️ 开始第${retryCount + 1}次重试请求: ${error.config.url}`)
      return apiClient(error.config)
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
      safeLog("🔢 重试次数:", retryCount)
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

    // 检测是否为网络错误
    const isNetworkError = 
      !error.response || // 没有响应（网络不可达）
      error.message === "Network Error" || // axios 网络错误
      error.code === "ERR_NETWORK" || // 网络错误代码
      error.code === "ECONNABORTED" || // 连接中止/超时
      error.message.includes("timeout") || // 超时错误
      error.message.includes("网络")  // 包含"网络"关键字

    // 如果是网络错误，先验证网络是否真的不可用
    if (isNetworkError) {
      safeLog("🌐 检测到疑似网络错误，开始验证网络连接...")
      
      // 异步验证网络并触发弹窗（不阻塞当前错误处理）
      verifyNetworkConnection().then((isConnected) => {
        if (!isConnected) {
          // 网络真的不可用，触发网络错误弹窗
          safeLog("🌐 网络验证失败，触发网络弹窗")
          triggerNetworkError()
        } else {
          // 网络可用，但API请求失败，说明是服务器问题，显示toast
          safeLog("🌐 网络可用，API服务器问题，显示错误提示")
          showError(errorMessage)
        }
      })
    } else {
      // 非网络错误才显示 toast
      showError(errorMessage)
    }

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
