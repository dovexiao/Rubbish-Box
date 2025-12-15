import { useState, useRef, useCallback, useEffect } from "react"
import { View, Text, TouchableOpacity, Image, Dimensions, ScrollView, StatusBar as RNStatusBar } from "react-native"
import { CameraView, CameraType, useCameraPermissions } from "expo-camera"
import { useRouter, useFocusEffect } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import * as FileSystem from "expo-file-system"

import { StatusBar } from "../../../components/StatusBar"
import { NavBar } from "../../../components/NavBar"
import { LoadingOverlay } from "../../../components/LoadingOverlay"
import { globalImmersive } from "../../../utils/globalImmersive"
import { createStyles, rpx } from "../../../utils/rpxStyleSheet"
import { showError, showWarning } from "../../../utils/toast"

interface PhotoInfo {
  path: string
  id: string
  timestamp: number
}

/**
 * 错题拍照页面
 * 100%还原UniApp项目 /src/pages/AI/error-camera.nvue
 * 使用expo-camera实现拍照功能
 */
export default function ErrorCameraScreen() {
  const router = useRouter()
  const cameraRef = useRef<CameraView>(null)
  const [permission, requestPermission] = useCameraPermissions()
  const [facing, setFacing] = useState<CameraType>("back")
  const [photos, setPhotos] = useState<PhotoInfo[]>([])
  const [isAnimating, setIsAnimating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cameraKey, setCameraKey] = useState(0) // 用于强制重新挂载相机
  const [uploadLoading, setUploadLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState("")

  const { width: windowWidth, height: windowHeight } = Dimensions.get("screen")

  const tipText =
    photos.length >= 6
      ? "把错题第6页对准屏幕中间，点击拍照"
      : `把错题第${photos.length + 1}页对准屏幕中间，点击拍照`

  // 相机页面强制隐藏状态栏
  useEffect(() => {
    console.log("错题拍照页面：强制隐藏状态栏")
    RNStatusBar.setHidden(true, "none")

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
      console.log("错题拍照页面获得焦点，恢复沉浸式模式并重置状态")

      // 重置照片列表和提交状态
      setPhotos([])
      setIsSubmitting(false)
      setIsAnimating(false)

      // 强制重新挂载相机组件
      setCameraKey((prev) => prev + 1)
      console.log("🎥 相机组件将重新挂载")

      RNStatusBar.setHidden(true, "none")
      globalImmersive.forceRestore()

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
        RNStatusBar.setHidden(true, "none")
        globalImmersive.forceRestore()

        setTimeout(() => {
          RNStatusBar.setHidden(true, "none")
          globalImmersive.forceRestore()
        }, 300)
      })
    }
  }, [permission])

  // 拍照
  const takePicture = useCallback(async () => {
    if (!cameraRef.current || isAnimating || photos.length >= 6) return

    try {
      setIsAnimating(true)
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
      })

      if (photo) {
        const newPhoto: PhotoInfo = {
          path: photo.uri,
          id: Date.now().toString(),
          timestamp: Date.now(),
        }
        setPhotos((prev) => [...prev, newPhoto])
      }
    } catch (error) {
      console.error("拍照失败:", error)
      showError("拍照失败，请重试")
    } finally {
      setTimeout(() => setIsAnimating(false), 300)
    }
  }, [isAnimating, photos.length])

  // 删除照片
  const deletePhoto = useCallback((index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }, [])

  // 上传照片到服务器
  const uploadPhotos = async (): Promise<string> => {
    try {
      const { useUserStore } = require("../../../stores/userStore")
      const { API_BASE_URL } = require("../../../config/api")

      const userStore = useUserStore.getState()
      const token = userStore.token || ""
      const uploadUrl = `${API_BASE_URL}/AppStart/Protected/image_upload/`

      console.log("🔐 准备上传错题照片，Token状态:", token ? `有效(${token.length}字符)` : "无Token")

      let batchId: string | null = null

      // 逐个上传照片
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i]
        console.log(`📤 上传第 ${i + 1}/${photos.length} 张照片...`)
        setUploadProgress(`正在上传第 ${i + 1}/${photos.length} 张照片...`)

        const uploadResult = await FileSystem.uploadAsync(uploadUrl, photo.path, {
          fieldName: "images",
          httpMethod: "POST",
          uploadType: FileSystem.FileSystemUploadType.MULTIPART,
          parameters: {
            type: "correct",
            ...(batchId ? { batch_id: batchId } : {}),
          },
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        })

        console.log("✅ 上传结果:", uploadResult.status, uploadResult.body)

        if (uploadResult.status === 200) {
          const data = JSON.parse(uploadResult.body)
          if (data.code === 200 || data.code === 201) {
            if (!batchId) {
              batchId = data.data.batch_id
              console.log("🎯 获取到 batch_id:", batchId)
            }
          } else {
            throw new Error(data.message || "上传失败")
          }
        } else {
          throw new Error(`HTTP错误: ${uploadResult.status}`)
        }
      }

      return batchId || ""
    } catch (error) {
      console.error("❌ 上传照片失败:", error)
      throw error
    }
  }

  // 提交照片
  const submitPhotos = useCallback(async () => {
    if (photos.length === 0) {
      showWarning("请先拍照")
      return
    }

    if (isSubmitting) return

    setIsSubmitting(true)
    setUploadLoading(true)
    setUploadProgress("准备上传...")
    console.log("提交错题照片:", photos)

    try {
      // 上传照片并获取batch_id
      const imguuid = await uploadPhotos()

      setUploadProgress("上传完成")

      // 短暂延迟后跳转到错题选择页面
      setTimeout(() => {
        setUploadLoading(false)
      router.push({
        pathname: "/ai/error-book/selection",
        params: { imguuid },
      })
      }, 300)
    } catch (error: any) {
      console.error("上传照片失败:", error)
      setUploadLoading(false)
      showError(error.message || "上传失败")
      setIsSubmitting(false)
    }
  }, [photos, isSubmitting, router])

  // 返回
  const goHome = useCallback(() => {
    router.back()
  }, [router])

  if (!permission) {
    return <View style={styles.container} />
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>需要相机权限</Text>
          <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
            <Text style={styles.permissionBtnText}>授予权限</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <View style={[styles.indexContainer, { width: windowWidth, height: windowHeight }]}>
      <View style={[styles.indexContent, { width: windowWidth }]}>
        <CameraView
          key={cameraKey}
          ref={cameraRef}
          style={[styles.camera, { width: windowWidth, height: windowHeight }]}
          facing={facing}
        >
          {/* 覆盖层 */}
          <View style={styles.coverOverlay}>
            <StatusBar theme="dark" />
            {/* 使用NavBar组件 */}
            <NavBar title="拍照录入" leftArrow={true} onBackPress={goHome} />

            {/* 参考九宫格对齐线 */}
            <View style={[styles.gridOverlay, { width: windowWidth, height: windowHeight }]}>
              <View style={[styles.gridH, styles.gridH1, { left: windowWidth * 0.333, height: windowHeight }]} />
              <View style={[styles.gridH, styles.gridH2, { left: windowWidth * 0.666, height: windowHeight }]} />
              <View style={[styles.gridV, styles.gridV1, { top: windowHeight * 0.333, width: windowWidth }]} />
              <View style={[styles.gridV, styles.gridV2, { top: windowHeight * 0.666, width: windowWidth }]} />
            </View>

            {/* 拍照按钮 */}
            <View style={[styles.sideBtns, { left: windowWidth * 0.475 }]}>
              <TouchableOpacity
                style={[styles.iconBtn, isAnimating && styles.btnAnimate]}
                onPress={takePicture}
                activeOpacity={0.8}
              />
            </View>

            {/* 动态提示 */}
            <View style={[styles.tipText, { left: windowWidth / 2, top: windowHeight * 0.12 }]}>
              <Text style={styles.tipTextContent}>{tipText}</Text>
            </View>

            {/* 左下角缩略图列表 */}
            {photos.length > 0 && (
              <ScrollView
                horizontal
                style={[styles.thumbsBar, { width: windowWidth }]}
                showsHorizontalScrollIndicator={false}
              >
                {photos.map((photo, index) => (
                  <View key={photo.id} style={styles.thumbWrapper}>
                    <Image source={{ uri: photo.path }} style={styles.thumbImage} resizeMode="cover" />
                    <Text style={styles.thumbIndex}>{index + 1}</Text>
                    <TouchableOpacity
                      style={styles.thumbDelete}
                      onPress={() => deletePhoto(index)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.thumbDeleteText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}

            {/* 开始录入按钮 */}
            {photos.length > 0 && (
              <TouchableOpacity
                style={styles.startBtn}
                onPress={submitPhotos}
                activeOpacity={0.8}
                disabled={isSubmitting}
              >
                <Text style={styles.startBtnText}>{isSubmitting ? "上传中..." : "开始录入"}</Text>
              </TouchableOpacity>
            )}
          </View>
        </CameraView>
      </View>

      {/* 上传Loading遮罩 */}
      <LoadingOverlay visible={uploadLoading} text={uploadProgress} color="#4891FF" />
    </View>
  )
}

const styles = createStyles({
  indexContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  indexContent: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  permissionText: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 20,
  },
  permissionBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#4891FF",
    borderRadius: 8,
  },
  permissionBtnText: {
    fontSize: 12,
    color: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  // 覆盖层
  coverOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  // 顶部导航栏
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  backIconImg: {
    width: 16.4,
    height: 16.4,
  },
  navTitle: {
    color: "#2979FF",
    fontSize: 15.625,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  navRightPlaceholder: {
    width: 40,
    height: 40,
  },
  // 九宫格对齐线
  gridOverlay: {
    position: "absolute",
    left: 0,
    top: 0,
  },
  gridH: {
    position: "absolute",
    width: 1,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  gridH1: {},
  gridH2: {},
  gridV: {
    position: "absolute",
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  gridV1: {},
  gridV2: {},
  // 拍照按钮
  sideBtns: {
    position: "absolute",
    bottom: 44,
  },
  iconBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#fff",
    borderWidth: 5,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  btnAnimate: {
    transform: [{ scale: 0.9 }],
  },
  // 提示文字
  tipText: {
    position: "absolute",
    transform: [{ translateX: -98 }],
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    marginTop: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  tipTextContent: {
    color: "rgba(255, 255, 255, 1)",
    fontSize: 10.375,
    textAlign: "center",
  },
  // 缩略图列表
  thumbsBar: {
    position: "absolute",
    bottom: 124,
    left: 0,
    flexDirection: "row",
    paddingHorizontal: 29,
  },
  thumbWrapper: {
    position: "relative",
    width: 60,
    height: 80,
    marginRight: 10,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  thumbImage: {
    width: "100%",
    height: "100%",
  },
  thumbIndex: {
    position: "absolute",
    top: 4,
    left: 4,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    color: "#fff",
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  thumbDelete: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    backgroundColor: "rgba(255, 0, 0, 0.8)",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  thumbDeleteText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  // 开始录入按钮
  startBtn: {
    position: "absolute",
    left: 29,
    bottom: 44,
    backgroundColor: "#4891FF",
    borderRadius: 25,
    paddingHorizontal: 40,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  startBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
})
