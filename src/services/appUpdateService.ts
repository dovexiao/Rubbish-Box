import { post } from "./api"

/**
 * 原生插件变更信息
 */
export interface NativePluginChange {
  pluginName: string
  newVersion: string
  minAppVersion: string
  description: string
}

/**
 * 应用更新检查请求
 */
export interface UpdateCheckRequest {
  // 当前 App 的版本名称（字符串）
  appVersion: string
  // 当前 App 的版本代码（整数）
  versionCode: number
  // 客户端已安装的原生插件及其版本信息
  nativePlugins: Record<string, string>
}

/**
 * 应用更新检查响应
 */
export interface UpdateCheckResponse {
  needUpdate: boolean
  updateType: 'full' | 'hot'
  forceUpdate: boolean
  newVersion: string
  newVersionCode: number
  downloadUrl: string
  updateNotes: string
  fileSize: number
  nativePluginChanges?: NativePluginChange[]
}

/**
 * 检查应用更新
 * @param params 更新检测参数
 * @returns 更新检测结果
 */
export const checkAppUpdate = async (params: UpdateCheckRequest): Promise<UpdateCheckResponse> => {
  try {
    console.log("调用更新检测API:", params)
    
    const response = await post("/AppStart/AppUpdate/check_update/", params)
    
    console.log("更新检测API响应:", response)
    
    return response
  } catch (error) {
    console.error("更新检测API调用失败:", error)
    throw error
  }
}

export default {
  checkAppUpdate,
}
