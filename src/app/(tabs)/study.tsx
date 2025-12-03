import { Alert, Image, ImageBackground, Text, TouchableOpacity, View } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useState, useEffect } from "react"
import { InteractionManager } from "react-native"

import { StatusBar } from "../../components/StatusBar"
import { Images } from "../../constants/Assets"
import { createStyles, getScreenInfo, rpx } from "../../utils/rpxStyleSheet"
import { useRouter } from "expo-router"
import { showInfo } from "../../utils/toast"

/**
 * 学习首页
 * 100%还原UniApp项目 /src/pages/study/index.vue
 */
export default function StudyScreen() {
  const router = useRouter()
  const [isContentLoaded, setIsContentLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // 防抖函数实现
  const debounce = (func: (...args: any[]) => void, delay: number) => {
    let timeoutId: ReturnType<typeof setTimeout>
    return (...args: any[]) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func(...args), delay)
    }
  }
  // 模拟内容加载
  useEffect(() => {
    if (!isContentLoaded) {
      setIsLoading(true)
      InteractionManager.runAfterInteractions(() => {
        // 模拟加载时间
        setTimeout(() => {
          setIsContentLoaded(true)
          setIsLoading(false)
        }, 100)
      })
    }
  }, [isContentLoaded])

  // 跳转到小褐阅读页面
  const goToReader = () => {
    // console.log("跳转到阅读页面")
    // showInfo("阅读器暂时不可用，马上回来，请等待更新", 3000)
    router.push("/reader") // 暂时注释掉，等服务器开发好后再打开
  }

  // 跳转到同步课堂页面
  const goToSyncClassroom = () => {
    console.log("跳转到同步课堂")
    router.push("/sync-classroom")
  }

  // 处理原相机拍照点击事件
  const handleNativeCameraClick = debounce((type: "composition" | "question") => {
    console.log(`拍照类型: ${type}`)
    router.push(`/ai/camera?type=${type}`)
  }, 300)

  // 处理卡片点击事件
  const handleCardClick = debounce((type: string) => {
    console.log("点击了:", type)

    if (type === "错题集") {
      // 跳转到错题本页面
      console.log("跳转到错题本")
      router.push("/ai/error-book")
    } else {
      Alert.alert("提示", `${type}功能开发中`)
    }
  }, 300)

  // 跳转到作文收录页面
  const goToCompositionRecord = debounce(() => {
    console.log("跳转到作文收录")
    router.push("/ai/composition-record")
  }, 300)

  // 跳转到AI练口语页面
  // const goToAiSpeaking = debounce(() => {
  //   console.log("跳转到AI练口语")
  //   router.push("/ai/speaking")
  // }, 300)

  return (
    <LinearGradient
      colors={["#CDF7FF", "#CDF7FF", "#FDFEFF", "#BCD4FF"]}
      locations={[0, 0.2201, 0.6447, 0.889]}
      style={styles.pageContainer}
    >
      {/* 状态栏 */}
      <StatusBar theme="light" backgroundColor="transparent" translucent={true} />

      {/* 功能卡片区域 */}
      <View style={styles.mainContent}>
        {/* 内容区域 */}
        <>
          <View style={styles.leftColumn}>
          {/* AI批改大卡片 */}
          <View style={styles.cardShadowWrapper}>
           
            <ImageBackground
              source={Images.studyBg21} // AI卡片背景
              style={[styles.functionCardAi, { backgroundColor: "transparent" }]}
              resizeMode="stretch"
              imageStyle={styles.aiCardImageStyle}
            >
               <Image
                source={Images.studyBg22} // AI卡片顶部装饰
                style={styles.aiTopImage}
                resizeMode="contain"
              />
              <View style={styles.aiHeader}>
                <Text style={styles.aiTitle}>AI批改</Text>
                <Text style={styles.aiSubtitle}>一键批改作业练习</Text>
              </View>
              <View style={styles.aiButtonsContainer}>
                {/* 作业批改 */}
                <TouchableOpacity
                  style={styles.aiQuestionWrap}
                  onPress={() => handleNativeCameraClick("question")}
                >
                  <Image
                    source={Images.studyBg19}
                    style={styles.aiButtonIcon}
                    resizeMode="contain"
                  />
                  <View style={styles.aiButtonText}>
                    <Text style={styles.aiButtonTitle1}>作业批改</Text>
                    <Text style={styles.aiButtonSubtitle1}>快速智能AI批改</Text>
                  </View>
                </TouchableOpacity>

                {/* 错题本 */}
                <TouchableOpacity
                  style={styles.aiErrorBookWrap}
                  onPress={() => handleCardClick("错题集")}
                >
                  <Image
                    source={Images.studyBg17}
                    style={styles.aiButtonIcon2}
                    resizeMode="contain"
                  />
                  <View style={styles.aiButtonText}>
                    <Text style={styles.aiButtonTitle2}>错题本</Text>
                    <Text style={styles.aiButtonSubtitle2}>收集错题 重练巩固</Text>
                  </View>
                </TouchableOpacity>

                {/* 作文批改 */}
                <TouchableOpacity
                  style={styles.aiCompositionWrap}
                  onPress={() => handleNativeCameraClick("composition")}
                >
                  <Image
                    source={Images.studyBg18}
                    style={styles.aiButtonIcon2}
                    resizeMode="contain"
                  />
                  <View style={styles.aiButtonText}>
                    <Text style={styles.aiButtonTitle3}>作文批改</Text>
                    <Text style={styles.aiButtonSubtitle3}>原文点评AI分析</Text>
                  </View>
                </TouchableOpacity>

                {/* 作文收录 */}
                <TouchableOpacity
                  style={styles.aiCompositionRecordWrap}
                  onPress={goToCompositionRecord}
                >
                  <Image
                    source={Images.studyBg20}
                    style={styles.aiButtonIcon3}
                    resizeMode="contain"
                  />
                  <View style={styles.aiButtonText}>
                    <Text style={styles.aiButtonTitle4}>作文收录</Text>
                    <Text style={styles.aiButtonSubtitle4}>回顾成长历程</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </ImageBackground>
          </View>
        </View>

        <View style={styles.rightColumn}>
          {/* 小褐阅读卡片 */}
          <View style={styles.cardShadowWrapper}>
            <ImageBackground
              source={Images.studyBg23} // 阅读卡片背景
              style={[styles.functionCardReader, { backgroundColor: "transparent" }]}
              resizeMode="stretch"
              imageStyle={styles.readerCardImageStyle}
            >
              <Image
                source={Images.studyBg24} // 阅读卡片顶部装饰
                style={styles.readerTopImage}
                resizeMode="contain"
              />
              <View style={styles.readerContent}>
                <Text style={styles.readerTitle}>小褐阅读</Text>
                <Text style={styles.readerSubtitle}>领略作家眼里的世界</Text>
              </View>
              <TouchableOpacity style={styles.readerButton} onPress={goToReader}>
                <Text style={styles.readerButtonText}>立即阅读</Text>
                <Image
                  source={Images.studyPolygon} // 箭头图标
                  style={styles.readerArrow}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </ImageBackground>
          </View>

          {/* 同步课堂卡片 */}
          <View style={styles.cardShadowWrapper}>
            <ImageBackground
              source={Images.studyBg25} // 课堂卡片背景
              style={[styles.functionCardClassroom, { backgroundColor: "transparent" }]}
              resizeMode="stretch"
              imageStyle={styles.classroomCardImageStyle}
            >
              <Image
                source={Images.studyBg26} // 课堂卡片装饰
                style={styles.classroomImage}
                resizeMode="contain"
              />
              <View style={styles.classroomContent}>
                <Text style={styles.classroomTitle}>同步课堂</Text>
                <Text style={styles.classroomSubtitle}>重点知识系统学</Text>
              </View>
              <TouchableOpacity style={styles.classroomButton} onPress={goToSyncClassroom}>
                <Text style={styles.classroomButtonText}>立即学习</Text>
                <Image
                  source={Images.studyPolygon} // 箭头图标
                  style={styles.classroomArrow}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </ImageBackground>
          </View>

          {/* AI练口语卡片 */}
          {/* <View style={styles.cardShadowWrapper}>
            <ImageBackground
              source={Images.studyBg23} // 临时使用阅读卡片背景
              style={[styles.functionCardSpeaking, { backgroundColor: "transparent" }]}
              resizeMode="stretch"
              imageStyle={styles.speakingCardImageStyle}
            >
              <Image
                source={Images.studyBg24} // 临时使用装饰图
                style={styles.speakingTopImage}
                resizeMode="contain"
              />
              <View style={styles.speakingContent}>
                <Text style={styles.speakingTitle}>AI练口语</Text>
                <Text style={styles.speakingSubtitle}>趣味对话轻松练</Text>
              </View>
              <TouchableOpacity style={styles.speakingButton} onPress={goToAiSpeaking}>
                <Text style={styles.speakingButtonText}>立即练习</Text>
                <Image
                  source={Images.studyPolygon} // 箭头图标
                  style={styles.speakingArrow}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </ImageBackground>
          </View> */}
        </View>
        </>
      </View>
    </LinearGradient>
  )
}

const styles = createStyles({
  // 页面容器 - 对应UniApp的.page-container
  pageContainer: {
    flex: 1,
    width: "100%",
    minHeight: "100%",
  },

  // 主要内容区域 - 对应UniApp的flex items-center mx-31.25rpx mt-20rpx
  mainContent: {
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    marginHorizontal: 31.25,
    marginTop: 66.875, // 20rpx + StatusBar高度，确保顶部对齐
    flex: 1,
  },

  // 左列
  leftColumn: {
    // flex: 1,
  },

  // 右列
  rightColumn: {
    flexDirection: "column" as const,
    marginLeft: 18.75,
  },

  // 卡片阴影包装器 - 专门用于Android阴影效果
  cardShadowWrapper: {
    // Android阴影效果
    // elevation: 8,
    shadowColor: "#AAC9FF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 10.05,
    borderRadius: 15.625,
    backgroundColor: "transparent",
    position: "relative" as const,
    overflow: "visible" as const, // 允许装饰图片溢出
    // borderWidth: 1,  // 删除调试边框
    // borderColor: "red",
  },

  // AI批改大卡片 - 对应.function-card-ai
  functionCardAi: {
    width: 359,
    height: 256.25,
    borderRadius: 15.625,
    backgroundColor: "transparent", // 透明背景
    
  },

  // AI卡片背景图片样式
  aiCardImageStyle: {
    borderRadius: 15.625,
    width: 359,
    height: 256.25,
    overflow: "hidden" as const, // 在这里设置圆角裁剪
    
  },

  // AI卡片顶部图片
  aiTopImage: {
    width: 119.53125,
    height: 100.39, // 控制高度，避免过度遮挡
    position: "absolute" as const,
    top: -8, // 向上溢出，部分在卡片外
    right: 0, // 向右溢出，部分在卡片外
    zIndex: 10, // 确保在错题本背景之上
  },

  // AI卡片头部内容
  aiHeader: {
    paddingLeft: 17.1875,
    paddingTop: 18.7,
  },

  // AI标题
  aiTitle: {
    color: "#1C2A33",
    fontSize: 17.1875,
    fontFamily: "Kingnam-Bobo", // 需要添加字体
    fontWeight: "600" as const,
  },

  // AI副标题
  aiSubtitle: {
    color: "#1C2A33",
    fontSize: 10.9375,
  },

  // AI按钮容器
  aiButtonsContainer: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    marginTop: 46.875,
    marginHorizontal: 17.1875,
  },

  // AI按钮通用文本容器
  aiButtonText: {
    marginLeft: 8,
    flexDirection: "column" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },

  // 作业批改按钮 - 对应.ai-question-warp
  aiQuestionWrap: {
    backgroundColor: "#E8EAFF",
    shadowColor: "#8FB5FF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 9.375,
    elevation: 3,
    width: 148.4375,
    height: 64.0625,
    borderRadius: 6.484375,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 10,
  },

  // 错题本按钮 - 对应.ai-error-book-warp
  aiErrorBookWrap: {
    backgroundColor: "#E1F7FF",
    shadowColor: "#8FB5FF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 9.375,
    elevation: 3,
    width: 148.4375,
    height: 64.0625,
    borderRadius: 6.484375,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },

  // 作文批改按钮 - 对应.ai-composition-warp
  aiCompositionWrap: {
    backgroundColor: "#DDECFF",
    shadowColor: "#8FB5FF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 9.375,
    elevation: 3,
    width: 148.4375,
    height: 64.0625,
    borderRadius: 6.484375,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 10,
  },

  // 作文收录按钮 - 对应.ai-composition-record-warp
  aiCompositionRecordWrap: {
    backgroundColor: "#D9FFE6",
    shadowColor: "#8FB5FF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 9.375,
    elevation: 3,
    width: 148.4375,
    height: 64.0625,
    borderRadius: 6.484375,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 10,
  },

  // AI按钮图标
  aiButtonIcon: {
    width: 38.6875,
  },

  aiButtonIcon2: {
    width: 38.3125,
    marginLeft: 7,
  },

  aiButtonIcon3: {
    width: 46.875,
    marginLeft: 7,
  },

  // AI按钮文字样式
  aiButtonTitle1: {
    color: "#7165FF",
    fontSize: 8.71,
    fontFamily: "Kingnam-Bobo",
    fontWeight: "600" as const,
  },

  aiButtonSubtitle1: {
    color: "#7165FF",
    fontSize: 8.71,
  },

  aiButtonTitle2: {
    color: "#00ACFC",
    fontSize: 8.71,
    fontFamily: "Kingnam-Bobo",
    fontWeight: "600" as const,
  },

  aiButtonSubtitle2: {
    color: "#00ACFC",
    fontSize: 8.71,
  },

  aiButtonTitle3: {
    color: "#5482FF",
    fontSize: 8.71,
    fontFamily: "Kingnam-Bobo",
    fontWeight: "600" as const,
  },

  aiButtonSubtitle3: {
    color: "#5482FF",
    fontSize: 8.71,
  },

  aiButtonTitle4: {
    color: "#38D005",
    fontSize: 8.71,
    fontFamily: "Kingnam-Bobo",
    fontWeight: "600" as const,
  },

  aiButtonSubtitle4: {
    color: "#38D005",
    fontSize: 8.71,
  },

  // 小褐阅读卡片 - 对应.function-card-reader
  functionCardReader: {
    width: 310.9375,
    height: 120.3125,
    borderRadius: 15.625,
    backgroundColor: "transparent", // 透明背景
    marginTop: 0, // 和AI卡片顶部对齐
  },

  // 阅读卡片背景图片样式
  readerCardImageStyle: {
    borderRadius: 15.625,
    width: 310.9375,
    height: 120.3125,
    overflow: "hidden" as const, // 在这里设置圆角裁剪
  },

  // 阅读卡片顶部图片
  readerTopImage: {
    width: 115.2343,
    height: 109.7656, // 根据卡片高度调整
    position: "absolute" as const,
    top: -10, // 稍微向上溢出多一点
    right: -5, // 稍微向右溢出
    zIndex: 10,
  },

  // 阅读卡片内容
  readerContent: {
    paddingLeft: 12.5,
    paddingTop: 10.7,
  },

  readerTitle: {
    color: "#1C2A33",
    fontSize: 17.1875,
    fontFamily: "Kingnam-Bobo",
    fontWeight: "600" as const,
  },

  readerSubtitle: {
    color: "#1C2A33",
    fontSize: 10.9375,
  },

  // 阅读按钮
  readerButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginTop: 32.8125,
    justifyContent: "center" as const,
    marginHorizontal: 12.5,
    backgroundColor: "#FFBF0F",
    borderRadius: 6.25,
    width: 67.1875,
    height: 23.4375,
  },

  readerButtonText: {
    fontSize: 10.9375,
    marginRight: 4,
  },

  readerArrow: {
    width: 7.375,
  },

  // 同步课堂卡片 - 对应.function-card-classroom
  functionCardClassroom: {
    width: 310.9375,
    height: 120.3125,
    borderRadius: 15.625,
    backgroundColor: "transparent", // 透明背景
    marginTop: 15.625,
  },

  // 课堂卡片背景图片样式
  classroomCardImageStyle: {
    borderRadius: 15.625,
    width: 310.9375,
    height: 120.3125,
    overflow: "hidden" as const, // 在这里设置圆角裁剪
  },

  // 课堂卡片图片
  classroomImage: {
    width: 112.5,
    height: 90.015, // 根据卡片高度调整
    position: "absolute" as const,
    right: -10.15625,
    top: -8,
  },

  // 课堂卡片内容
  classroomContent: {
    paddingRight: 12.5,
    paddingTop: 10.7,
    marginHorizontal: 12.5,
  },

  classroomTitle: {
    color: "#1C2A33",
    fontSize: 17.1875,
    fontFamily: "Kingnam-Bobo",
    fontWeight: "600" as const,
  },

  classroomSubtitle: {
    color: "#1C2A33",
    fontSize: 10.9375,
  },

  // 课堂按钮
  classroomButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginTop: 32.8125,
    justifyContent: "center" as const,
    marginHorizontal: 12.5,
    backgroundColor: "#54B2FF",
    borderRadius: 6.25,
    width: 67.1875,
    height: 23.4375,
  },

  classroomButtonText: {
    fontSize: 10.9375,
    marginRight: 4,
  },

  classroomArrow: {
    width: 7.375,
  },

  // AI练口语卡片
  functionCardSpeaking: {
    width: 310.9375,
    height: 120.3125,
    borderRadius: 15.625,
    backgroundColor: "transparent",
    marginTop: 15.625,
  },

  speakingCardImageStyle: {
    borderRadius: 15.625,
    width: 310.9375,
    height: 120.3125,
    overflow: "hidden" as const,
  },

  speakingTopImage: {
    width: 106.25,
    position: "absolute" as const,
    top: -8,
    right: -8,
  },

  speakingContent: {
    paddingLeft: 12.5,
    paddingTop: 10.7,
  },

  speakingTitle: {
    color: "#1C2A33",
    fontSize: 17.1875,
    fontFamily: "Kingnam-Bobo",
    fontWeight: "600" as const,
  },

  speakingSubtitle: {
    color: "#1C2A33",
    fontSize: 10.9375,
  },

  speakingButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginTop: 32.8125,
    justifyContent: "center" as const,
    marginHorizontal: 12.5,
    backgroundColor: "#6C63FF",
    borderRadius: 6.25,
    width: 67.1875,
    height: 23.4375,
  },

  speakingButtonText: {
    fontSize: 10.9375,
    marginRight: 4,
    color: "#FFFFFF",
  },

  speakingArrow: {
    width: 7.375,
  },
})
