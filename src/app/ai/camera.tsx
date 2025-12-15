import { useState, useRef, useEffect, useCallback } from "react"
import {
  View,
  Text as RNText,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar as RNStatusBar,
} from "react-native"
import { StatusBar } from "../../components/StatusBar"
import { CameraView, useCameraPermissions } from "expo-camera"
import { router, useLocalSearchParams, useFocusEffect } from "expo-router"

import { LoadingOverlay } from "../../components/LoadingOverlay"
import { NavBar } from "../../components/NavBar"
import { globalImmersive } from "../../utils/globalImmersive"
import { createStyles } from "../../utils/rpxStyleSheet"
import { showError, showWarning } from "../../utils/toast"
import { 
  stopPostureMonitorService, 
  startPostureMonitorService,
  isPostureServiceRunning 
} from "../../modules/PostureMonitorModule"

const Text = RNText

interface PhotoInfo {
  path: string
  id: string
  timestamp: number
}

/**
 * AI相机页面
 * 100%还原UniApp项目 /src/pages/AI/camera.nvue
 */
export default function CameraScreen() {
  const params = useLocalSearchParams()
  const type =
    typeof params.type === "string" ? (params.type as "composition" | "question") : "question"
  const [permission, requestPermission] = useCameraPermissions()
  const [photos, setPhotos] = useState<PhotoInfo[]>([])
  const [_isAnimating, _setIsAnimating] = useState(false)
  const [_isSubmitting, _setIsSubmitting] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState("")
  const [cameraKey, setCameraKey] = useState(0) // 用于强制重新挂载相机
  const cameraRef = useRef<CameraView>(null)
  const wasPostureRunningRef = useRef(false) // 记录进入页面前坐姿检测是否在运行

  const { width: screenWidth, height: screenHeight } = Dimensions.get("screen")

  // 相机页面强制隐藏状态栏 - 使用原生StatusBar API
  useEffect(() => {
    console.log("相机页面：强制隐藏状态栏")

    // 立即隐藏
    RNStatusBar.setHidden(true, "none")

    // 持续隐藏 - 使用定时器确保
    const interval = setInterval(() => {
      RNStatusBar.setHidden(true, "none")
    }, 500)

    return () => {
      clearInterval(interval)
    }
  }, [])

  // 页面获得焦点时恢复沉浸式模式并重置状态
  useFocusEffect(
    useCallback(() => {
      console.log("相机页面获得焦点，恢复沉浸式模式并重置状态")

      // 重置照片列表和提交状态
      setPhotos([])
      _setIsSubmitting(false)
      _setIsAnimating(false)

      // 强制重新挂载相机组件
      setCameraKey((prev) => prev + 1)
      console.log("🎥 相机组件将重新挂载")

      RNStatusBar.setHidden(true, "none")
      globalImmersive.forceRestore()

      // 使用短延迟确保权限对话框关闭后恢复
      const timer = setTimeout(() => {
        RNStatusBar.setHidden(true, "none")
        globalImmersive.forceRestore()
      }, 500)

      return () => clearTimeout(timer)
    }, []),
  )

  // 权限检查
  useEffect(() => {
    if (!permission?.granted) {
      requestPermission().then(() => {
        // 权限请求完成后立即恢复沉浸式模式
        RNStatusBar.setHidden(true, "none")
        globalImmersive.forceRestore()

        setTimeout(() => {
          RNStatusBar.setHidden(true, "none")
          globalImmersive.forceRestore()
        }, 300)

        setTimeout(() => {
          RNStatusBar.setHidden(true, "none")
          globalImmersive.forceRestore()
        }, 500)
      })
    }
  }, [permission])

  if (!permission) {
    return <View />
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>需要相机权限才能使用此功能</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>授权相机</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // 页面标题和提示文本
  const navTitle = type === "composition" ? "AI作文批改" : "AI作业批改"
  const tipPrefix = type === "composition" ? "把作文第" : "把作业第"
  const nextIndex = photos.length + 1
  const tipText =
    photos.length >= 6
      ? `${tipPrefix}6页对准屏幕中间，点击拍照`
      : `${tipPrefix}${nextIndex}页对准屏幕中间，点击拍照`

  // 返回上一页
  const goBack = () => {
    router.back()
  }

  // 生成照片ID
  const generatePhotoId = () => {
    return "photo_" + Date.now() + "_" + Math.random().toString(36).slice(2)
  }

  // 拍照
  const takePhoto = async () => {
    if (photos.length >= 6) {
      showWarning("最多拍摄6张照片")
      return
    }

    if (!cameraRef.current) return

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        base64: false,
      })

      if (photo) {
        const newPhoto: PhotoInfo = {
          path: photo.uri,
          id: generatePhotoId(),
          timestamp: Date.now(),
        }
        setPhotos((prev) => [...prev, newPhoto])
      }
    } catch (error) {
      console.error("拍照失败:", error)
      showError("拍照失败，请重试")
    }
  }

  // 删除照片
  const deletePhoto = (index: number) => {
    if (index < 0 || index >= photos.length) return
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  // 触摸拍照处理
  const handleTap = () => {
    takePhoto()
  }

  const handleTouchStart = () => {
    // 触摸开始
  }

  const handleTouchEnd = () => {
    // 触摸结束
  }

  // 提交照片进行AI批改
  const submitPhotos = async () => {
    if (photos.length === 0) {
      showWarning("请先拍摄照片")
      return
    }

    _setIsSubmitting(true)
    setUploadLoading(true)
    setUploadProgress("准备上传...")
    console.log("提交照片进行AI批改:", photos)

    try {
      // 上传照片并获取batch_id
      const batch_id = await uploadPhotos()

      setUploadProgress("上传完成")

      // 短暂延迟后跳转到AI加载页面
      setTimeout(() => {
        setUploadLoading(false)
        router.push(`/ai/loading?imguuid=${batch_id}&type=${type}`)
      }, 300)
    } catch (error) {
      console.error("上传照片失败:", error)
      setUploadLoading(false)
      showError("上传照片失败，请重试")
      _setIsSubmitting(false)
    }
  }

  // 上传照片 - 使用 axios 实现
  const uploadPhotos = async (): Promise<string> => {
    try {
      const { useUserStore } = require("../../stores/userStore")
      const { API_BASE_URL } = require("../../config/api")
      const axios = require("axios").default

      const userStore = useUserStore.getState()
      const token = userStore.token || "" // 直接从 userStore.token 获取
      const uploadUrl = `${API_BASE_URL}/AppStart/Protected/image_upload/`

      console.log("🔐 准备上传照片，Token状态:", token ? `有效(${token.length}字符)` : "无Token")

      let batchId: string | null = null
      const totalStartTime = Date.now() // 总上传开始时间

      // 逐个上传照片
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i]
        const uploadStartTime = Date.now() // 单张照片上传开始时间
        
        console.log(`📤 上传第 ${i + 1}/${photos.length} 张照片...`)
        setUploadProgress(`正在上传第 ${i + 1}/${photos.length} 张照片...`)

        // 创建 FormData
        const formData = new FormData()
        
        // 添加文件
        formData.append('images', {
          uri: photo.path,
          type: 'image/jpeg',
          name: `photo_${i + 1}.jpg`,
        } as any)
        
        // 添加参数
        formData.append('type', 'correct')
        if (batchId) {
          formData.append('batch_id', batchId)
        }

        console.log("📤 上传URL:", uploadUrl)
        console.log("🔑 Token:", token ? "存在 (长度:" + token.length + ")" : "不存在")
        console.log("📋 Authorization:", token ? `Bearer ${token.substring(0, 20)}...` : "空")

        // 使用 axios 上传
        const response = await axios.post(uploadUrl, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': token ? `Bearer ${token}` : "",
          },
          timeout: 180000, // 180秒超时
        })

        const uploadEndTime = Date.now() // 单张照片上传结束时间
        const uploadDuration = uploadEndTime - uploadStartTime // 计算耗时

        console.log("✅ 上传结果:", response.status, response.data)
        console.log(`⏱️ 第 ${i + 1} 张照片上传耗时: ${uploadDuration}ms (${(uploadDuration / 1000).toFixed(2)}秒)`)

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

      const totalEndTime = Date.now() // 总上传结束时间
      const totalDuration = totalEndTime - totalStartTime // 计算总耗时
      console.log(`✅ 全部 ${photos.length} 张照片上传完成`)
      console.log(`⏱️ 总耗时: ${totalDuration}ms (${(totalDuration / 1000).toFixed(2)}秒)`)
      console.log(`📊 平均每张耗时: ${(totalDuration / photos.length).toFixed(0)}ms (${(totalDuration / photos.length / 1000).toFixed(2)}秒)`)

      return batchId || ""
    } catch (error) {
      console.error("❌ 上传照片失败:", error)
      throw error
    }
  }

  return (
    <View style={styles.container}>
      {/* 相机页面不使用自定义StatusBar组件，完全依赖原生层控制 */}

      {/* 相机视图 - 使用key强制重新挂载 */}
      <CameraView
        key={cameraKey}
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        mode="picture"
      />

      {/* 覆盖层UI */}
      <View style={styles.overlay}>
      <StatusBar theme="dark" />
        {/* 使用NavBar组件 */}
        <NavBar title={navTitle} leftArrow={true} goBackDelta={1} onBackPress={goBack} />

        {/* 九宫格对齐线 */}
        <View style={[styles.gridOverlay, { width: screenWidth, height: screenHeight }]}>
          <View style={[styles.gridH, { left: screenWidth * 0.333, height: screenHeight }]} />
          <View style={[styles.gridH, { left: screenWidth * 0.666, height: screenHeight }]} />
          <View style={[styles.gridV, { top: screenHeight * 0.333, width: screenWidth }]} />
          <View style={[styles.gridV, { top: screenHeight * 0.666, width: screenWidth }]} />
        </View>

        {/* 拍照按钮 - 右侧 */}
        <View style={[styles.sideBtns, { top: screenHeight * 0.845 }]}>
          <TouchableOpacity
            style={[styles.iconBtn, _isAnimating && styles.btnAnimate]}
            onPress={handleTap}
            onPressIn={handleTouchStart}
            onPressOut={handleTouchEnd}
          />
        </View>

        {/* 动态提示 */}
        <View
          style={[
            styles.tipText,
            {
              left: screenWidth / 2,
              top: screenHeight * 0.14,
            },
          ]}
        >
          <Text style={styles.tipTextContent}>{tipText}</Text>
        </View>

        {/* 左下角缩略图列表 */}
        <View style={[styles.thumbsBar, { width: screenWidth }]}>
          {photos.map((photo, index) => (
            <View key={photo.id} style={styles.thumbWrapper}>
              <Image source={{ uri: photo.path }} style={styles.thumbImage} />
              <Text style={styles.thumbIndex}>{index + 1}</Text>
              <TouchableOpacity style={styles.thumbDelete} onPress={() => deletePhoto(index)}>
                <Text style={styles.thumbDeleteText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* 开始批改按钮 */}
        {photos.length > 0 && (
          <TouchableOpacity style={styles.startBtn} onPress={submitPhotos} disabled={uploadLoading}>
            <Text style={styles.startBtnText}>开始批改</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 上传Loading遮罩 */}
      <LoadingOverlay visible={uploadLoading} text={uploadProgress} color="#4891FF" />
    </View>
  )
}

const styles = createStyles({
  container: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "#000",
  },
  camera: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },

  overlay: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "box-none",
  },

  // 权限相关
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },

  permissionText: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },

  permissionButton: {
    backgroundColor: "#2979ff",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },

  permissionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  // 九宫格对齐线
  gridOverlay: {
    position: "absolute",
    left: 0,
    top: 0,
  },

  gridH: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    position: "absolute",
    width: 1,
  },

  gridV: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    position: "absolute",
    height: 1,
  },

  // 拍照按钮
  sideBtns: {
    position: "absolute",
    right: 34,
    zIndex: 200,
    flexDirection: "column",
    alignItems: "center",
    pointerEvents: "box-none",
  },

  iconBtn: {
    backgroundColor: "#d9d9d9",
    width: 39.06,
    height: 39.06,
    borderRadius: 19.53,
    pointerEvents: "auto",
  },

  btnAnimate: {
    transform: [{ scale: 0.8 }],
  },

  // 提示文本
  tipText: {
    position: "absolute",
    transform: [{ translateX: "-50%" }],
    backgroundColor: "#282828",
    borderRadius: 6.6,
    paddingVertical: 4,
    paddingHorizontal: 9,
    pointerEvents: "none",
  },

  tipTextContent: {
    color: "rgba(255, 255, 255, 1)",
    fontSize: 10.375,
    textAlign: "center",
    lineHeight: 16,
  },

  // 缩略图列表
  thumbsBar: {
    position: "absolute",
    bottom: 124,
    flexDirection: "row",
    alignItems: "flex-start",
    flexWrap: "wrap",
    pointerEvents: "box-none",
  },

  thumbWrapper: {
    position: "relative",
    width: 90.3125,
    marginLeft: 20,
    marginTop: 20,
    pointerEvents: "box-none",
  },

  thumbImage: {
    width: 85.625,
    height: 85.625,
    borderRadius: 6,
    marginTop: 6,
    shadowColor: "#00499D",
    shadowOffset: { width: 0, height: 1.6 },
    shadowOpacity: 0.25,
    shadowRadius: 3.2,
    elevation: 3,
  },

  thumbIndex: {
    position: "absolute",
    left: 0,
    top: 6,
    backgroundColor: "#1F79FF",
    borderTopLeftRadius: 6,
    borderBottomRightRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 7,
    color: "#fff",
    fontSize: 8.6,
    shadowColor: "#00499D",
    shadowOffset: { width: 0, height: 1.6 },
    shadowOpacity: 0.25,
    shadowRadius: 3.2,
    elevation: 3,
  },

  thumbDelete: {
    position: "absolute",
    right: 0,
    top: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "auto",
  },

  thumbDeleteText: {
    color: "#54A7FF",
    fontSize: 12,
    fontWeight: "bold",
    lineHeight: 16,
  },

  // 开始批改按钮
  startBtn: {
    position: "absolute",
    left: 29,
    bottom: 44,
    width: 87.5,
    height: 25.81875,
    borderRadius: 23.4375,
    backgroundColor: "#C2E0FF",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "auto",
  },

  startBtnText: {
    color: "#4A4A4A",
    fontSize: 12,
    fontWeight: "bold",
  },
})
