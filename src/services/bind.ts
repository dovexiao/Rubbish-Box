import { post } from "./api"
import { getDeviceInfoForAPI } from "../utils/deviceInfo"
import axios from "axios"
import {  DEFAULT_HEADERS } from "../config/api"
export const API_TIMEOUT = 10000
/**
 * 绑定服务相关API
 */

// ==================== 类型定义 ====================

/**
 * 绑定请求参数
 */
export interface BindDeviceRequest {
  device_code: string
  device_id: string
  device_name: string
  system_name: string
  system_version: string
  app_version: string
  platform: string
  brand: string
  model: string
  is_emulator: boolean
  screen_width: number
  screen_height: number
  ip_address: string
  network_type: string
  is_connected: boolean
  phone: string
}

/**
 * 绑定响应数据
 */
export interface BindDeviceResponse {
  bindCode: string
  deviceType: string
  deviceTypeName: string
  qrCode: string // Base64编码的二维码图片
  expiresIn: number // 过期时间（秒）
}

// ==================== API接口 ====================

/**
 * 获取绑定二维码响应（包含绑定状态）
 */
export interface GetBindQRCodeResponse {
  bound: boolean
  data: BindDeviceResponse
}

/**
 * 获取绑定二维码
 */
export async function getBindQRCode(): Promise<GetBindQRCodeResponse> {
  // 获取设备信息
  const deviceInfo = await getDeviceInfoForAPI()
  console.log("📌 getBindQRCode: deviceInfo", deviceInfo)
  
  // 从 userStore 获取用户手机号
  const { useUserStore } = await import("../stores/userStore")
  const phone = useUserStore.getState().user?.phone || ""
  console.log("📌 从 userStore 获取到的手机号:", phone)
  
  const requestData: BindDeviceRequest = {
    device_code: deviceInfo.device_code,
    device_id: deviceInfo.device_id,
    device_name: deviceInfo.device_name,
    system_name: deviceInfo.system_name,
    system_version: deviceInfo.system_version,
    app_version: deviceInfo.app_version,
    platform: deviceInfo.platform,
    brand: deviceInfo.brand,
    model: deviceInfo.model,
    is_emulator: deviceInfo.is_emulator,
    screen_width: deviceInfo.screen_width,
    screen_height: deviceInfo.screen_height,
    ip_address: deviceInfo.ip_address || "192.168.1.100",
    network_type: deviceInfo.network_type || "wifi",
    is_connected: deviceInfo.is_connected !== false,
    phone: phone,
  }

  
  try {
    const url = "https://fast.xiaohetx.cn/api/device/bind"
    console.log("📌 getBindQRCode: request URL", url)
      console.log("📌 getBindQRCode: headers", DEFAULT_HEADERS)
        console.log("📌 getBindQRCode: requestData", requestData)
    // 使用完整的 URL + axios，避免 baseURL 拼接
    const res = await axios.post<{ success: boolean; bound: boolean; data: BindDeviceResponse; message?: string }>(
      url,
      requestData,
      {
        timeout: API_TIMEOUT,
        headers: DEFAULT_HEADERS,
        validateStatus: () => true, // 手动处理错误状态码
      },
    )
    console.log("📌 getBindQRCode: response status", res.status, res.statusText)
    console.log("📌 getBindQRCode: response data", res.data)

    if (res.status < 200 || res.status >= 300) {
      throw new Error(`请求失败，HTTP ${res.status} ${res.statusText}`)
    }

    const data = res.data

    if (!data?.success) {
      throw new Error(data?.message || "获取绑定二维码失败")
    }

    return {
      bound: data.bound ?? true, // 默认为 true，如果接口返回 false 表示已绑定
      data: data.data
    }
  } catch (err: any) {
    const resp = err?.response
    console.log("❌ getBindQRCode error", {
      url: resp?.config?.url,
      message: err?.message,
      status: resp?.status,
      statusText: resp?.statusText,
      data: resp?.data,
      stack: err?.stack,
    })
    throw err
  }
}

/**
 * 检查绑定状态
 * @param bindCode 绑定码
 */
export async function checkBindStatus(bindCode: string): Promise<{ 
  success: boolean
  bound: boolean 
  message?: string 
}> {
  console.log("📌 checkBindStatus: bindCode", bindCode)
  try {
    const url = "https://fast.xiaohetx.cn/api/device/bind/status"
    console.log("📌 checkBindStatus: request URL", url)
    const res = await axios.post<{ success: boolean; bound: boolean; message?: string }>(
      url,
      { bindCode },
      {
        timeout: API_TIMEOUT,
        headers: DEFAULT_HEADERS,
        validateStatus: () => true,
      },
    )
    console.log("📌 checkBindStatus: response status", res.status, res.statusText)
    console.log("📌 checkBindStatus: response data", res.data)

    if (res.status < 200 || res.status >= 300) {
      throw new Error(`请求失败，HTTP ${res.status} ${res.statusText}`)
    }

    return res.data
  } catch (err: any) {
    const resp = err?.response
    console.log("❌ checkBindStatus error", {
      message: err?.message,
      status: resp?.status,
      statusText: resp?.statusText,
      data: resp?.data,
      stack: err?.stack,
    })
    throw err
  }
}

