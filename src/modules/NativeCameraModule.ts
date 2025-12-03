/**
 * Native Camera Module
 * Android 原生相机模块的 TypeScript 接口定义
 */
import { NativeModules } from "react-native"

interface NativeCameraModuleInterface {
  /**
   * 打开原生相机
   * @param options 配置选项
   * @param options.type 拍照类型 "correct" | "composition" | "question"
   * @returns Promise<PhotoInfo[]> 返回拍摄的照片列表
   */
  openCamera(options: { type?: string }): Promise<PhotoInfo[]>
}

export interface PhotoInfo {
  /** 照片本地路径 */
  path: string
  /** 照片 URI */
  uri: string
}

const { NativeCameraModule } = NativeModules

if (!NativeCameraModule) {
  console.error(
    "❌ NativeCameraModule 未找到！请确保：\n" +
      "1. NativeCameraPackage 已在 MainApplication.kt 中注册\n" +
      "2. 已重新编译 Android 项目\n" +
      "3. 检查 NativeCameraModule.getName() 返回的名称是否为 'NativeCameraModule'"
  )
}

/**
 * 导出 Native Camera Module
 * 提供类型安全的原生相机调用接口
 */
export default NativeCameraModule as NativeCameraModuleInterface

