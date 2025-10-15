import { useState, useEffect } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Modal,
} from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import AsyncStorage from "@react-native-async-storage/async-storage"

import { StatusBar } from "../../components/StatusBar"
import { NavBar } from "../../components/NavBar"
import { createStyles, rpx } from "../../utils/rpxStyleSheet"

interface PhotoInfo {
  path: string
  id: string
  timestamp: number
}

/**
 * 照片管理页面
 * 100%还原UniApp项目 /src/pages/AI/photo-manager.vue
 * 多张照片上传管理，用于AI批改
 */
export default function PhotoManagerScreen() {
  const _router = useRouter()
  const params = useLocalSearchParams()

  const [photos, setPhotos] = useState<PhotoInfo[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [currentPreviewPhoto, setCurrentPreviewPhoto] = useState<PhotoInfo>({
    path: "",
    id: "",
    timestamp: 0,
  })
  const [previewIndex, setPreviewIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 生成照片ID
  const generatePhotoId = () => {
    return "photo_" + Date.now() + "_" + Math.random().toString(36).slice(2)
  }

  // 初始化照片列表
  useEffect(() => {
    const initPhotos = async () => {
      if (params.imagePath) {
        // 从拍照页面跳转过来，添加新照片
        const newPhoto: PhotoInfo = {
          path: params.imagePath as string,
          id: generatePhotoId(),
          timestamp: Date.now(),
        }

        // 从本地存储恢复之前的照片
        const savedPhotosStr = await AsyncStorage.getItem("temp_photos")
        const savedPhotos = savedPhotosStr ? JSON.parse(savedPhotosStr) : []
        const allPhotos = [...savedPhotos, newPhoto]
        setPhotos(allPhotos)

        // 保存到本地存储
        await AsyncStorage.setItem("temp_photos", JSON.stringify(allPhotos))
      } else {
        // 恢复之前保存的照片
        const savedPhotosStr = await AsyncStorage.getItem("temp_photos")
        if (savedPhotosStr) {
          setPhotos(JSON.parse(savedPhotosStr))
        }
      }
    }

    initPhotos()
  }, [params.imagePath])

  // 页面卸载时清空缓存（除非是正常提交）
  useEffect(() => {
    return () => {
      if (!isSubmitting) {
        AsyncStorage.removeItem("temp_photos")
      }
    }
  }, [isSubmitting])

  // 继续拍照
  const takeMorePhotos = async () => {
    // 保存当前照片到本地存储
    await AsyncStorage.setItem("temp_photos", JSON.stringify(photos))

    const permission = await ImagePicker.requestCameraPermissionsAsync()
    if (!permission.granted) {
      Alert.alert("提示", "需要相机权限才能拍照")
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: false,
    })

    if (!result.canceled && result.assets[0]) {
      const newPhoto: PhotoInfo = {
        path: result.assets[0].uri,
        id: generatePhotoId(),
        timestamp: Date.now(),
      }

      // 从本地存储恢复之前的照片并添加新照片
      const savedPhotosStr = await AsyncStorage.getItem("temp_photos")
      const savedPhotos = savedPhotosStr ? JSON.parse(savedPhotosStr) : []
      const allPhotos = [...savedPhotos, newPhoto]
      setPhotos(allPhotos)

      // 保存到本地存储
      await AsyncStorage.setItem("temp_photos", JSON.stringify(allPhotos))
    }
  }

  // 预览照片
  const previewPhoto = (photo: PhotoInfo, index: number) => {
    setCurrentPreviewPhoto(photo)
    setPreviewIndex(index)
    setShowPreview(true)
  }

  // 关闭预览
  const closePreview = () => {
    setShowPreview(false)
  }

  // 删除照片
  const deletePhoto = async (index: number) => {
    Alert.alert("确认删除", "确定要删除这张照片吗？", [
      { text: "取消", style: "cancel" },
      {
        text: "删除",
        style: "destructive",
        onPress: async () => {
          const newPhotos = photos.filter((_, i) => i !== index)
          setPhotos(newPhotos)
          await AsyncStorage.setItem("temp_photos", JSON.stringify(newPhotos))
          Alert.alert("提示", "已删除")
        },
      },
    ])
  }

  // 删除当前预览的照片
  const deleteCurrentPreview = () => {
    deletePhoto(previewIndex)
    closePreview()
  }

  // 重拍当前照片
  const retakeCurrentPhoto = async () => {
    // 删除当前照片
    const newPhotos = photos.filter((_, i) => i !== previewIndex)
    setPhotos(newPhotos)
    await AsyncStorage.setItem("temp_photos", JSON.stringify(newPhotos))

    closePreview()

    // 跳转到拍照页面
    takeMorePhotos()
  }

  // 清空所有照片
  const clearAllPhotos = () => {
    Alert.alert("确认清空", "确定要清空所有照片吗？此操作不可恢复。", [
      { text: "取消", style: "cancel" },
      {
        text: "清空",
        style: "destructive",
        onPress: async () => {
          setPhotos([])
          await AsyncStorage.removeItem("temp_photos")
          Alert.alert("提示", "已清空")
        },
      },
    ])
  }

  // 提交照片进行AI批改
  const submitPhotos = () => {
    if (photos.length === 0) {
      Alert.alert("提示", "请先拍摄照片")
      return
    }

    Alert.alert("确认提交", `确定要提交 ${photos.length} 张照片进行AI批改吗？`, [
      { text: "取消", style: "cancel" },
      {
        text: "确定",
        onPress: async () => {
          setIsSubmitting(true)
          await AsyncStorage.removeItem("temp_photos")
          // TODO: 上传照片并跳转到AI加载页面
          Alert.alert("提示", "上传功能开发中")
        },
      },
    ])
  }

  return (
    <LinearGradient
      colors={["#93ABFF", "#E4F4FF", "#ECF8FF", "#FFFFFF"]}
      locations={[-0.1128, 0.1494, 0.8474, 1.0586]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.photoManager}
    >
      <View style={styles.header}>
        <StatusBar theme="dark" />
        <NavBar title="照片管理" leftArrow />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 顶部提示 */}
        <View style={styles.tipSection}>
          <View style={styles.tipText}>
            <Text style={styles.tipIcon}>📷</Text>
            <Text style={styles.tipContent}>
              已拍摄 {photos.length} 张照片，最多可拍摄 9 张
            </Text>
          </View>
        </View>

        {/* 照片网格 */}
        <View style={styles.photoGrid}>
          {/* 已拍摄的照片 */}
          {photos.map((photo, index) => (
            <TouchableOpacity
              key={photo.id}
              style={styles.photoItem}
              onPress={() => previewPhoto(photo, index)}
              activeOpacity={0.8}
            >
              <Image source={{ uri: photo.path }} style={styles.photoImage} resizeMode="cover" />
              <View style={styles.photoOverlay}>
                <Text style={styles.photoIndex}>{index + 1}</Text>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={(e) => {
                    e.stopPropagation()
                    deletePhoto(index)
                  }}
                >
                  <Ionicons name="close" size={rpx(12)} color="#fff" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}

          {/* 添加照片按钮 */}
          {photos.length < 9 && (
            <TouchableOpacity
              style={styles.addPhotoBtn}
              onPress={takeMorePhotos}
              activeOpacity={0.8}
            >
              <Ionicons name="camera" size={rpx(40)} color="#999" />
              <Text style={styles.addText}>继续拍照</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 空状态 */}
        {photos.length === 0 && (
          <View style={styles.emptyState}>
            <Image
              source={require("../../../assets/images/camera.png")}
              style={styles.emptyIcon}
              resizeMode="contain"
            />
            <Text style={styles.emptyTitle}>还没有拍摄照片</Text>
            <Text style={styles.emptyDesc}>点击下方按钮开始拍照</Text>
            <TouchableOpacity
              style={[styles.btnPrimary, styles.emptyBtn]}
              onPress={takeMorePhotos}
              activeOpacity={0.8}
            >
              <Ionicons name="camera" size={rpx(15)} color="#fff" />
              <Text style={styles.btnPrimaryText}>开始拍照</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* 操作按钮区域 */}
      {photos.length > 0 && (
        <View style={styles.actionSection}>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.btnSecondary}
              onPress={clearAllPhotos}
              activeOpacity={0.8}
            >
              <Ionicons name="trash" size={rpx(15)} color="#666" />
              <Text style={styles.btnSecondaryText}>清空照片</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={submitPhotos}
              activeOpacity={0.8}
              disabled={isSubmitting}
            >
              <Ionicons name="checkmark" size={rpx(15)} color="#fff" />
              <Text style={styles.btnPrimaryText}>
                {isSubmitting ? "提交中..." : `提交批改 (${photos.length})`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 照片预览弹窗 */}
      <Modal
        visible={showPreview}
        transparent
        animationType="fade"
        onRequestClose={closePreview}
      >
        <TouchableOpacity
          style={styles.previewModal}
          activeOpacity={1}
          onPress={closePreview}
        >
          <View style={styles.previewContent} onStartShouldSetResponder={() => true}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>照片 {previewIndex + 1}</Text>
              <TouchableOpacity style={styles.previewClose} onPress={closePreview}>
                <Ionicons name="close" size={rpx(18)} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.previewImageContainer}>
              <Image
                source={{ uri: currentPreviewPhoto.path }}
                style={styles.previewImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.previewActions}>
              <TouchableOpacity
                style={[styles.previewBtn, styles.previewBtnDelete]}
                onPress={deleteCurrentPreview}
                activeOpacity={0.8}
              >
                <Ionicons name="trash" size={rpx(15)} color="#FF4D4D" />
                <Text style={styles.previewBtnDeleteText}>删除</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.previewBtn, styles.previewBtnRetake]}
                onPress={retakeCurrentPhoto}
                activeOpacity={0.8}
              >
                <Ionicons name="camera" size={rpx(15)} color="#fff" />
                <Text style={styles.previewBtnRetakeText}>重拍</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </LinearGradient>
  )
}

const styles = createStyles({
  photoManager: {
    width: "100%",
    height: "100%",
    minWidth: 750,
    minHeight: "100%",
    flexDirection: "column",
  },
  header: {
    flexShrink: 0,
  },
  content: {
    flex: 1,
    padding: 4,
  },
  // 提示区域
  tipSection: {
    marginBottom: 4,
  },
  tipText: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 6,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 6,
  },
  tipIcon: {
    marginRight: 8,
    fontSize: 14,
  },
  tipContent: {
    fontSize: 8.6,
    color: "#666",
  },
  // 照片网格
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 32,
  },
  photoItem: {
    position: "relative",
    width: "14.66%",
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#F5F5F5",
  },
  photoImage: {
    width: "100%",
    height: "100%",
  },
  photoOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 8,
  },
  photoIndex: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    color: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 10,
    fontWeight: "bold",
  },
  deleteBtn: {
    backgroundColor: "rgba(255, 0, 0, 0.8)",
    width: 24,
    height: 24,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  // 添加照片按钮
  addPhotoBtn: {
    width: "14.66%",
    aspectRatio: 1,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#ccc",
    borderRadius: 12,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  addText: {
    fontSize: 10,
    color: "#999",
    marginTop: 8,
  },
  // 操作按钮区域
  actionSection: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: 24,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 16,
  },
  btnSecondary: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  btnSecondaryText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#666",
  },
  btnPrimary: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    // Note: Use LinearGradient component for gradient background
    backgroundColor: "#4891FF",
  },
  btnPrimaryText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#fff",
  },
  // 空状态
  emptyState: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingVertical: 80,
    textAlign: "center",
  },
  emptyIcon: {
    width: 80,
    height: 80,
    marginBottom: 24,
    opacity: 0.3,
  },
  emptyTitle: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 12,
    color: "#999",
    marginBottom: 32,
  },
  emptyBtn: {
    width: 200,
  },
  // 预览弹窗
  previewModal: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
  previewContent: {
    width: "90%",
    maxWidth: 600,
    backgroundColor: "#000",
    borderRadius: 16,
    overflow: "hidden",
  },
  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  previewTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  previewClose: {
    width: 32,
    height: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  previewImageContainer: {
    width: "100%",
    height: 400,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  previewImage: {
    maxWidth: "100%",
    maxHeight: "100%",
  },
  previewActions: {
    flexDirection: "row",
    padding: 16,
    gap: 16,
  },
  previewBtn: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  previewBtnDelete: {
    backgroundColor: "rgba(255, 77, 77, 0.2)",
    borderWidth: 1,
    borderColor: "#FF4D4D",
  },
  previewBtnDeleteText: {
    fontSize: 12,
    color: "#FF4D4D",
  },
  previewBtnRetake: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  previewBtnRetakeText: {
    fontSize: 12,
    color: "#fff",
  },
})
