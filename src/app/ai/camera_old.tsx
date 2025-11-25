import { useEffect, useState, useRef } from "react"
import { View, Text, NativeModules, ActivityIndicator, Alert } from "react-native"
import { useLocalSearchParams, router } from "expo-router"
import { showError } from "../../utils/toast"
import {
  stopPostureMonitorService,
  startPostureMonitorService,
  isPostureServiceRunning,
} from "../../modules/PostureMonitorModule"

const { NativeCameraModule } = NativeModules

interface PhotoInfo {
  path: string
  id: string
  timestamp: number
}

/**
 * 原生相机页面入口
 * 启动原生 Android Activity 进行拍照
 * 100%还原UniApp项目
 */
export default function NativeCameraScreen() {
  const params = useLocalSearchParams()
  const type =
    typeof params.type === "string"
      ? (params.type as "composition" | "question")
      : "question"
  const [isLoading, setIsLoading] = useState(true)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState("")
  const wasPostureRunningRef = useRef(false)

  // 页面挂载时启动原生相机（只执行一次）
  useEffect(() => {
    console.log("📷 NativeCameraScreen 组件挂载，准备启动原生相机")
    
    // 检查坐姿检测服务状态
    isPostureServiceRunning().then((isRunning) => {
      wasPostureRunningRef.current = isRunning
      if (isRunning) {
        console.log("⏸️ 检测到坐姿检测服务正在运行，暂停它")
        stopPostureMonitorService()
      }
    })

    const launchNativeCamera = async () => {
      try {
        if (!NativeCameraModule) {
          console.error("❌ NativeCameraModule 未找到！")
          Alert.alert("错误", "原生相机模块未找到，请重新编译App。")
          router.back()
          return
        }

        console.log("🟢 NativeCameraModule 存在，尝试调用 openCamera")
        
        // 调用原生相机（这会阻塞直到相机关闭）
        const photos: Array<{ path: string; uri: string }> = await NativeCameraModule.openCamera()
        console.log("✅ 原生相机返回照片:", photos)

        if (!photos || photos.length === 0) {
          console.log("❌ 未拍摄照片或用户取消")
          // 用户取消，返回上一页
          router.back()
          return
        }

        // 有照片，立即进行上传并跳转
        const photoPaths = photos.map(photo => photo.path)
        console.log("📸 照片路径列表:", photoPaths)
        
        setIsLoading(false)
        setUploadLoading(true)
        setUploadProgress("准备上传...")
        
        // 同步等待上传完成再跳转
        await uploadPhotos(photoPaths)
        
      } catch (e: any) {
        console.error("❌ 调用原生相机失败:", e)
        // 用户取消不显示错误提示
        if (e.code !== "E_PICKER_CANCELLED") {
          showError("启动相机失败: " + e.message)
        }
        router.back()
      } finally {
        // 恢复坐姿检测服务
        if (wasPostureRunningRef.current) {
          console.log("▶️ 恢复坐姿检测服务")
          startPostureMonitorService()
        }
      }
    }

    // 延迟启动，确保UI渲染和状态稳定
    const timer = setTimeout(launchNativeCamera, 100)

    return () => {
      clearTimeout(timer)
      // 在组件卸载时确保恢复坐姿检测服务
      if (wasPostureRunningRef.current) {
        console.log("🔄 组件卸载时恢复坐姿检测服务")
        startPostureMonitorService()
      }
    }
  }, []) // 空依赖数组，只在挂载时执行一次

  // 上传照片并跳转
  const uploadPhotos = async (paths: string[]): Promise<string> => {
    setUploadLoading(true)
    setUploadProgress("准备上传...")
    console.log("📤 提交照片进行AI批改:", paths)

    try {
      const { useUserStore } = require("../../stores/userStore")
      const { API_BASE_URL } = require("../../config/api")
      const axios = require("axios").default

      const userStore = useUserStore.getState()
      const token = userStore.token || ""
      const uploadUrl = `${API_BASE_URL}/AppStart/Protected/image_upload/`

      let batchId: string | null = null

      for (let i = 0; i < paths.length; i++) {
        const photoPath = paths[i]
        console.log(`📤 上传第 ${i + 1}/${paths.length} 张照片...`)
        setUploadProgress(`正在上传第 ${i + 1}/${paths.length} 张照片...`)

        const formData = new FormData()
        formData.append("images", {
          uri: `file://${photoPath}`,
          type: "image/jpeg",
          name: `photo_${i + 1}.jpg`,
        } as any)
        formData.append("type", "correct")
        if (batchId) {
          formData.append("batch_id", batchId)
        }

        const response = await axios.post(uploadUrl, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token ? `Bearer ${token}` : "",
          },
          timeout: 180000,
        })

        if (response.status === 200) {
          const data = response.data
          if (data.code === 200 || data.code === 201) {
            if (!batchId) {
              batchId = data.data.batch_id
              console.log("🎯 获取到 batch_id:", batchId)
            }
          } else {
            throw new Error(data.message || "上传失败")
          }
        } else {
          throw new Error(`HTTP错误: ${response.status}`)
        }
      }

      if (!batchId) {
        throw new Error("上传成功但未获取到批次ID")
      }

      console.log("✅ 所有照片上传完成，batch_id:", batchId)
      setUploadProgress("跳转中...")
      
      const targetUrl = `/ai/loading?imguuid=${batchId}&type=${type}`
      console.log("🔄 准备跳转到:", targetUrl)
      
      // 使用 replace 替换当前页面，直接跳转
      router.replace(targetUrl)
      console.log("✅ 跳转命令已执行")

      return batchId
    } catch (error) {
      console.error("❌ 上传照片失败:", error)
      setUploadLoading(false)
      showError("上传照片失败，请重试")
      throw error
    }
  }

  // 始终显示加载界面，防止白屏
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000",
      }}
    >
      <ActivityIndicator size="large" color="#fff" />
      <Text style={{ color: "#fff", marginTop: 10 }}>
        {uploadLoading ? uploadProgress : "正在启动相机..."}
      </Text>
    </View>
  )
}
