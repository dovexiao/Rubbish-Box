import { useState, useEffect } from "react"
import { View, Image, TouchableOpacity } from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"

import { createStyles } from "../../utils/rpxStyleSheet"
import { Images } from "../../constants/Assets"

/**
 * 照片旋转页面
 * 100%还原UniApp项目 /src/pages/AI/rotate.vue
 */
export default function RotateScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const [imageUrl, setImageUrl] = useState("")
  const [type, setType] = useState("")
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    if (params.imageUrl) {
      const decodedUrl = decodeURIComponent(params.imageUrl as string)
      setImageUrl(decodedUrl)
    }
    if (params.type) {
      setType(params.type as string)
    }
  }, [params])

  // 返回上一页
  const handleBack = () => {
    router.back()
  }

  // 旋转图片
  const handleRotate = () => {
    const newRotation = (rotation + 90) % 360
    setRotation(newRotation)
  }

  // 确认上传
  const handleUpload = () => {
    console.log("type:", type)
    console.log("imageUrl:", imageUrl)
    console.log("rotation:", rotation)

    // 跳转到照片管理页面
    router.push({
      pathname: "/ai/photo-manager",
      params: {
        imagePath: imageUrl,
        type: type,
        rotation: rotation.toString(),
      },
    })
  }

  // 计算图片宽度（旋转90度或270度时需要调整）
  const imageWidth = rotation === 90 || rotation === 270 ? 356.25 : 498.4375

  return (
    <View style={styles.page}>
      {/* 主体图片和按钮区 */}
      <View style={styles.mainContainer}>
        {/* 图片区 */}
        <View style={styles.imageArea}>
          <Image
            source={{ uri: imageUrl }}
            style={[
              styles.mainImage,
              {
                transform: [{ rotate: `${rotation}deg` }],
                width: imageWidth,
              },
            ]}
            resizeMode="contain"
          />
        </View>

        {/* 右侧按钮 */}
        <View style={styles.buttonContainer}>
          {/* 旋转按钮 */}
          <TouchableOpacity onPress={handleRotate} style={styles.iconButton}>
            <Image
              source={Images.rotate}
              style={styles.rotateIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* 返回按钮 */}
          <TouchableOpacity onPress={handleBack} style={styles.iconButton}>
            <Image
              source={Images.rotateBack}
              style={styles.backIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* 确认按钮 */}
          <TouchableOpacity onPress={handleUpload} style={styles.iconButton}>
            <Image
              source={Images.rotateConfirm}
              style={styles.confirmIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = createStyles({
  page: {
    backgroundColor: "#000000",
    width: "100%",
    height: "100%",
    overflow: "hidden",
  },
  mainContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    height: "100%",
    position: "relative",
  },
  imageArea: {
    width: "100%",
    height: "100%",
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 37.5, // 37.5rpx转rpx
    paddingBottom: 25, // 25rpx转rpx
  },
  mainImage: {
    margin: "auto",
  },
  buttonContainer: {
    position: "absolute",
    width: 63.28125, // 63.28125rpx
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    right: 0,
    height: "100%",
  },
  iconButton: {
    marginBottom: 20,
  },
  rotateIcon: {
    width: 23.4375, // 23.4375rpx
    height: 23.4375,
  },
  backIcon: {
    width: 26.5625, // 26.5625rpx
    height: 26.5625,
    marginTop: 35.9375, // 35.9375rpx
  },
  confirmIcon: {
    width: 26.5625, // 26.5625rpx
    height: 26.5625,
    marginTop: 18.75, // 18.75rpx
  },
})

