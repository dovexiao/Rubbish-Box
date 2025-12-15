/**
 * Native Camera Module 调试工具
 * 用于验证 RN 与原生模块的交互是否正常
 */
import { NativeModules } from "react-native"

/**
 * 检查 NativeCameraModule 是否正确注册
 * @returns 返回检查结果和详细信息
 */
export function checkNativeCameraModule() {
  const { NativeCameraModule } = NativeModules

  const result = {
    isRegistered: false,
    moduleName: "",
    availableMethods: [] as string[],
    error: "",
  }

  try {
    if (!NativeCameraModule) {
      result.error = "NativeCameraModule 未找到，请检查：\n" +
        "1. NativeCameraPackage 是否在 MainApplication.kt 中注册\n" +
        "2. 是否重新编译了 Android 项目\n" +
        "3. NativeCameraModule.getName() 是否返回 'NativeCameraModule'"
      return result
    }

    result.isRegistered = true
    result.moduleName = "NativeCameraModule"
    
    // 获取所有可用方法
    result.availableMethods = Object.keys(NativeCameraModule).filter(
      key => typeof NativeCameraModule[key] === "function"
    )

    console.log("✅ NativeCameraModule 注册成功")
    console.log("📋 可用方法:", result.availableMethods)
    
    return result
  } catch (error: any) {
    result.error = error.message || "未知错误"
    console.error("❌ NativeCameraModule 检查失败:", error)
    return result
  }
}

/**
 * 打印 NativeCameraModule 的详细信息
 */
export function printNativeCameraModuleInfo() {
  console.log("\n========== NativeCameraModule 调试信息 ==========")
  
  const result = checkNativeCameraModule()
  const { NativeCameraModule } = NativeModules
  
  console.log("模块注册状态:", result.isRegistered ? "✅ 已注册" : "❌ 未注册")
  console.log("模块名称:", result.moduleName || "N/A")
  console.log("模块对象:", NativeCameraModule ? "存在" : "不存在")
  
  // 详细检查模块对象
  if (NativeCameraModule) {
    console.log("模块类型:", typeof NativeCameraModule)
    const allKeys = Object.keys(NativeCameraModule)
    const allProps = Object.getOwnPropertyNames(NativeCameraModule)
    console.log("模块所有键:", allKeys)
    console.log("模块所有属性:", allProps)
    
    // 检查 openCamera 方法
    console.log("openCamera 是否存在:", 'openCamera' in NativeCameraModule)
    console.log("openCamera 类型:", typeof NativeCameraModule.openCamera)
  }
  
  console.log("可用方法:", result.availableMethods.length > 0 ? result.availableMethods.join(", ") : "无")
  
  if (result.error) {
    console.log("错误信息:", result.error)
  }
  
  // 检查所有已注册的原生模块
  const allModules = Object.keys(NativeModules)
  console.log("\n所有已注册的原生模块 (", allModules.length, "个):")
  if (allModules.length > 0) {
    allModules.slice(0, 20).forEach((moduleName, index) => {
      console.log(`  ${index + 1}. ${moduleName}`)
    })
    if (allModules.length > 20) {
      console.log(`  ... 还有 ${allModules.length - 20} 个模块`)
    }
  } else {
    console.log("  ⚠️ 警告：没有检测到任何原生模块，这是异常情况！")
  }
  
  console.log("==============================================\n")
  
  return result
}

