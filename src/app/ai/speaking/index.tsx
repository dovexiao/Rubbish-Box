import {
  Image,
  ImageBackground,
  Modal,
  FlatList,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Dimensions,
} from "react-native"
import { useState } from "react"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"

import { StatusBar } from "../../../components/StatusBar"
import { NavBar } from "../../../components/NavBar"
import { createStyles, rpx } from "../../../utils/rpxStyleSheet"
import { Images } from "../../../constants/Assets"
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"

// 难度等级类型
type Level = "LV0" | "LV1" | "LV2" | "LV3"

// 练习方式类型
type PracticeMode = "speaking" | "listening"

// 话题数据类型
interface Topic {
  id: string
  icon: any // 图片资源
  titleZh: string
  titleEn: string
}

// 分类数据类型
interface Category {
  id: string
  title: string
  topics: Topic[]
  expanded: boolean
}

// 难度等级配置
const LEVELS = [
  {
    level: "L0" as Level,
    name: "预备级",
    description: "适合1-2年级，词汇量200以内，能用简单短语或短句进行简单日常交流",
  },
  {
    level: "L1" as Level,
    name: "初级",
    description: "适合5-6年级，词汇量700以内，能够进行日常交流，表达个人观点和感情",
  },
  {
    level: "L2" as Level,
    name: "中级",
    description: "适合3-4年级，词汇量400以内，能用简单短句口语进行简单基本交流",
  },
  {
    level: "L3" as Level,
    name: "高级",
    description: "适合初中生，词汇量1000以上，能够对话题进行讨论表达自如流畅",
  },
]

/**
 * AI练英语首页
 */
export default function AiSpeakingScreen() {
  const router = useRouter()

  // 当前选中的难度等级
  const [currentLevel, setCurrentLevel] = useState<Level>("LV2")

  // 难度选择弹窗显示状态
  const [levelModalVisible, setLevelModalVisible] = useState(false)

  // 练习方式选择弹窗显示状态
  const [practiceModeModalVisible, setPracticeModeModalVisible] = useState(false)

  // 当前选中的练习方式
  const [selectedPracticeMode, setSelectedPracticeMode] = useState<PracticeMode>("speaking")

  // 分类数据（使用临时图片）
  const [categories, setCategories] = useState<Category[]>([
    {
      id: "1",
      title: "饮食与健康",
      expanded: true,
      topics: [
        { id: "1-1", icon: Images.studyBg17, titleZh: "一日三餐", titleEn: "Three meals a day" },
        { id: "1-2", icon: Images.studyBg18, titleZh: "餐厅点餐", titleEn: "In a restaurant" },
        { id: "1-3", icon: Images.studyBg19, titleZh: "最喜欢的餐馆", titleEn: "My favorite restaurant" },
        { id: "1-4", icon: Images.studyBg20, titleZh: "医院看病", titleEn: "In the hospital" },
        { id: "1-5", icon: Images.studyBg17, titleZh: "各地美食", titleEn: "Different food in China" },
        { id: "1-6", icon: Images.studyBg18, titleZh: "餐厅点餐", titleEn: "In a restaurant" },
      ],
    },
    {
      id: "2",
      title: "生活与学习",
      expanded: false,
      topics: [
        { id: "2-1", icon: Images.studyBg19, titleZh: "一日三餐", titleEn: "Three meals a day" },
        { id: "2-2", icon: Images.studyBg20, titleZh: "餐厅点餐", titleEn: "In a restaurant" },
        { id: "2-3", icon: Images.studyBg17, titleZh: "最喜欢的餐馆", titleEn: "My favorite restaurant" },
      ],
    },
    {
      id: "3",
      title: "情感表达",
      expanded: false,
      topics: [
        { id: "3-1", icon: Images.studyBg18, titleZh: "快乐时光", titleEn: "Happy moments" },
        { id: "3-2", icon: Images.studyBg19, titleZh: "感谢与道歉", titleEn: "Thanks and apology" },
      ],
    },
    {
      id: "4",
      title: "文艺与体育",
      expanded: false,
      topics: [
        { id: "4-1", icon: Images.studyBg20, titleZh: "运动健身", titleEn: "Sports and fitness" },
        { id: "4-2", icon: Images.studyBg17, titleZh: "音乐欣赏", titleEn: "Music appreciation" },
      ],
    },
  ])

  // 切换分类展开/收起
  const toggleCategory = (categoryId: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId ? { ...cat, expanded: !cat.expanded } : cat
      )
    )
  }

  // 选择难度等级
  const selectLevel = (level: Level) => {
    setCurrentLevel(level)
    setLevelModalVisible(false)
  }

  // 选择练习方式
  const selectPracticeMode = (mode: PracticeMode) => {
    setSelectedPracticeMode(mode)
  }

  // 开始练习
  const startPractice = () => {
    console.log("开始练习:", selectedPracticeMode)
    setPracticeModeModalVisible(false)
    router.push({
      pathname: "/ai/speaking/practice",
      params: {
        mode: selectedPracticeMode,
        level: currentLevel,
        // TODO: 传递选中的话题信息
      }
    })
  }

  // 点击话题卡片
  const handleTopicClick = (topic: Topic) => {
    console.log("点击话题:", topic.titleZh)
    setPracticeModeModalVisible(true)
  }

  // 获取当前难度等级名称
  const getCurrentLevelName = () => {
    const level = LEVELS.find((l) => l.level === currentLevel)
    return level ? `${level.level}${level.name}` : "LV2中级"
  }

  return (
    <LinearGradient
      colors={["#CDF7FF", "#E5F5FF", "#FDFEFF", "#E5F5FF"]}
      locations={[0, 0.3, 0.7, 1]}
      style={styles.container}
    >
      {/* 状态栏 */}
      <StatusBar theme="light" backgroundColor="transparent" translucent={true} />

      {/* 顶部导航栏 */}
      <NavBar
        title="AI练英语"
        rightContent={
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={() => setLevelModalVisible(true)}
              activeOpacity={0.8}
            >
              {/* 外层：边框和阴影 */}
              <View style={styles.levelButtonBorder}>
                {/* 内层：背景渐变 */}
                <View style={styles.levelButtonInnerWrapper}>
                  <LinearGradient
                    colors={["rgba(255, 255, 255, 0.14)", "#FFFFFF"]}
                    start={{ x: 0.2, y: 0.8 }}
                    end={{ x: 0.8, y: 0.2 }}
                    style={styles.levelButtonInner}
                  >
                    <Text style={styles.levelButtonText}>{getCurrentLevelName()}</Text>
                    <Ionicons name="swap-horizontal" size={rpx(10.9)} color="#3074F7" />
                  </LinearGradient>
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.timeButton}>
              <Image source={Images.aiSpeaking1} style={styles.timeIcon} />
            </TouchableOpacity>
          </View>
        }
      />

      {/* 主要内容 */}
      <View style={styles.mainContent}>
        {/* 左侧：3D角色 */}
        <View style={styles.leftSide}>
          <ImageBackground
            source={Images.aiSpeaking2}
            style={styles.chatBubble}
            resizeMode="contain"
          >
            <Text style={styles.chatText}>快来选择你感兴趣的来练习吧</Text>
          </ImageBackground>
          <Image source={Images.aiSpeaking3} style={styles.characterImage} />
        </View>

        {/* 右侧：分类和话题列表 */}
        <LinearGradient
          colors={["rgba(255, 255, 255, 0.36)", "rgba(255, 255, 255, 0.1584)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.9, y: 0.1 }}
          style={styles.rightSide}
        >
          <FlatList
            data={categories}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item: category }) => (
              <View style={styles.categorySection}>
                {/* 分类标题 */}
                <TouchableOpacity
                  style={styles.categoryHeader}
                  onPress={() => toggleCategory(category.id)}
                >
                <Text style={styles.categoryTitle}>{category.title}</Text>
                {category.expanded ? (
                  <MaterialCommunityIcons name="triangle" size={rpx(12)} color="#1571FC80" style={[styles.categoryArrow, { transform: [{ rotate: "180deg" }] }]} />
                ) : (
                  <MaterialCommunityIcons name="triangle" size={rpx(12)} color="#1571FC80" style={styles.categoryArrow} />
                )}
                </TouchableOpacity>

                {/* 话题卡片列表 */}
                {category.expanded && (
                  <View style={styles.topicsGrid}>
                    {category.topics.map((topic) => (
                      <TouchableOpacity
                        key={topic.id}
                        style={styles.topicCard}
                        onPress={() => handleTopicClick(topic)}
                      >
                        <View style={styles.topicIconContainer}>
                          <Image source={topic.icon} style={styles.topicIcon} />
                        </View>
                        <View style={styles.topicTextContainer}>
                          <Text style={styles.topicTitleZh}>{topic.titleZh}</Text>
                          <Text style={styles.topicTitleEn}>{topic.titleEn}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}
          />
        </LinearGradient>
      </View>

      {/* 难度选择弹窗 */}
      <Modal
        visible={levelModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLevelModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.levelModal}>
              <Text style={styles.modalTitle}>难度选择</Text>
              <View style={styles.levelList}>
                {LEVELS.map((level) => (
                  <TouchableOpacity
                    key={level.level}
                    style={[
                      styles.levelItem,
                      currentLevel === level.level && styles.levelItemSelected,
                    ]}
                    onPress={() => selectLevel(level.level)}
                  >
                    <Text
                      style={[
                        styles.levelCode,
                        currentLevel === level.level && styles.levelCodeSelected,
                      ]}
                    >
                      {level.level}
                    </Text>
                    <View style={styles.levelInfo}>
                      <Text
                        style={[
                          styles.levelName,
                          currentLevel === level.level && styles.levelNameSelected,
                        ]}
                      >
                        {level.name}
                      </Text>
                      <Text
                        style={[
                          styles.levelDescription,
                          currentLevel === level.level && styles.levelDescriptionSelected,
                        ]}
                      >
                        {level.description}
                      </Text>
                    </View>
                    {currentLevel === level.level && (
                      <View style={styles.checkMark}>
                        <Ionicons name="checkmark" size={rpx(10)} color="#FFFFFF" weight="bold" />
                      </View>
                    )}  
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableWithoutFeedback>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setLevelModalVisible(false)}
          >
            <Ionicons name="close-circle-outline" size={rpx(20)} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </Modal>

      {/* 练习方式选择弹窗 */}
      <Modal
        visible={practiceModeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPracticeModeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.practiceModeModal}>
              <Text style={styles.modalTitle}>选择练习方式</Text>
              <View style={styles.practiceModeCards}>
                {/* 练口语卡片 */}
                <TouchableOpacity
                  style={[
                    styles.practiceModeCard,
                    styles.speakingCard,
                    selectedPracticeMode === "speaking" && styles.practiceModeCardSelected,
                  ]}
                  onPress={() => selectPracticeMode("speaking")}
                >
                  <Text style={styles.practiceModeTitle}>练口语</Text>
                  <Image source={Images.studyBg17} style={styles.practiceModeIcon} />
                  {selectedPracticeMode === "speaking" && (
                    <View style={styles.practiceModeCheckMark}>
                      <Text style={styles.checkMarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* 练听力卡片 */}
                <TouchableOpacity
                  style={[
                    styles.practiceModeCard,
                    styles.listeningCard,
                    selectedPracticeMode === "listening" && styles.practiceModeCardSelected,
                  ]}
                  onPress={() => selectPracticeMode("listening")}
                >
                  <Text style={styles.practiceModeTitle}>练听力</Text>
                  <Image source={Images.studyBg18} style={styles.practiceModeIcon} />
                  {selectedPracticeMode === "listening" && (
                    <View style={styles.practiceModeCheckMark}>
                      <Text style={styles.checkMarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* 开始练习按钮 */}
              <TouchableOpacity style={styles.startButton} onPress={startPractice}>
                <Text style={styles.startButtonText}>开始练习</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setPracticeModeModalVisible(false)}
          >
            <Ionicons name="close-circle-outline" size={rpx(20)} color="#8E9AAF" />
          </TouchableOpacity>
        </View>
      </Modal>
    </LinearGradient>
  )
}

const styles = createStyles({
  container: {
    flex: 1,
  },

  // ==================== 顶部导航栏右侧内容 ====================
  headerRight: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginRight: 20,
  },

  // 外层：边框和阴影
  levelButtonBorder: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)", // 渐变边框的中间色
    marginRight: 6,
    overflow: "hidden" as const, // 确保圆角生效
    backgroundColor: "transparent", // 确保边框可见
    // 内阴影效果 (box-shadow: 9px -5px 11.8px 0px #FFFFFF1A inset)
    shadowColor: "rgba(255, 255, 255, 0.1)", // #FFFFFF1A
    shadowOffset: { width: 9, height: -5 },
    shadowOpacity: 1,
    shadowRadius: 11.8,
    elevation: 0, // Android不使用elevation，使用shadow
     borderRadius: 20,
  },

  // 内层包装器：确保圆角裁剪
  levelButtonInnerWrapper: {
    borderRadius: 19, // 20 - 1，减去边框宽度
    overflow: "hidden" as const,
  },

  // 内层：背景渐变
  levelButtonInner: {
    borderRadius: 19, // 与外层包装器保持一致
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  levelButtonText: {
    fontSize: 10.4,
    color: "#5482FF",
    fontWeight: "500" as const,
    marginRight: 5,
  },

  levelArrow: {
    width: 12,
    height: 12,
  },

  timeButton: {
   
  },

  timeIcon: {
    width:15,
    height: 15,
  },

  // ==================== 主要内容 ====================
  mainContent: {
    flex: 1,
    flexDirection: "row" as const,
    paddingHorizontal: 15,
  },

  // 左侧：3D角色
  leftSide: {
    width: 200,
    alignItems: "center" as const,
    marginTop: 20,
  },

  chatBubble: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
    width: 144.53125,
    height: 44.92,
  },

  chatText: {
    fontSize: 9.375,
    color: "#2675FF",
    marginBottom: 6,
    textAlign: "center" as const,
  },

  characterImage: {
    width: 103.0,
    height: 250,
    resizeMode: "contain" as const,
  },

  // 右侧：分类和话题列表
  rightSide: {
    flex: 1,
    marginLeft: 15,
    marginRight: 0,
    borderRadius: 10.15,
    padding: 10.9375,
    overflow: "hidden" as const,
    borderWidth: 1,
    borderColor: "#FFFFFF99",

  },

  categorySection: {
    marginBottom: 20,
  },

  categoryHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    marginBottom: 12,
  },

  categoryTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#5482FF",
  },

  categoryArrow: {
    width: 16,
    height: 16,
    transform: [{ rotate: "90deg" }],
  },

  categoryArrowExpanded: {
    transform: [{ rotate: "270deg" }],
  },

  // 话题卡片网格
  topicsGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    justifyContent: "space-between" as const,
  },

  topicCard: {
    width: "31%", // 一行三个，每个占约31%，留出间距
    aspectRatio: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 12,
    marginBottom: 10,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    shadowColor: "#8FB5FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },

  topicIconContainer: {
    width: 55,
    height: 55,
    borderRadius: 12,
    backgroundColor: "#FFF8E6",
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 10,
  },

  topicIcon: {
    width: 30,
    height: 30,
    resizeMode: "contain" as const,
  },

  topicTextContainer: {
    alignItems: "center" as const,
  },

  topicTitleZh: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#1C2A33",
    marginBottom: 2,
  },

  topicTitleEn: {
    fontSize: 10,
    color: "#8E9AAF",
    textAlign: "center" as const,
  },

  // ==================== 弹窗通用样式 ====================
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },

  modalTitle: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: "#1571FC",
    textAlign: "center" as const,
    marginBottom: 7.2,
  },

  closeButton: {
    // width: 18,
    // height: 18,
    // borderRadius: 9,
    // backgroundColor: "#FFFFFF",
    // alignItems: "center" as const,
    // justifyContent: "center" as const,
    marginTop: 5,
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.2,
    // shadowRadius: 4,
    // elevation: 5,
  },

  closeButtonText: {
    fontSize: 24,
    color: "#8E9AAF",
    fontWeight: "400" as const,
  },

  // ==================== 难度选择弹窗 ====================
  levelModal: {
    width: 243.75,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20.3125,
    paddingTop: 16,
  },

  levelList: {
    gap:7.2,
  },

  levelItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "#D3E8FF",
    borderRadius: 7.8,
    padding: 6.4,
    paddingLeft: 12,
    position: "relative" as const,
  },

  levelItemSelected: {
    backgroundColor: "#3A4DFF",
  },

  levelCode: {
    fontSize: 18.75,
    fontWeight: "700" as const,
    color: "#2897FF",
    marginRight: 16,
    fontStyle: "italic" as const,
  },

  levelCodeSelected: {
    color: "#FFFFFFCC",
  },

  levelInfo: {
    flex: 1,
  },

  levelName: {
    fontSize: 9.6,
    fontWeight: "600" as const,
    color: "#00000099",
  },

  levelNameSelected: {
    color: "#FFFFFF",
  },

  levelDescription: {
    fontSize: 8.6,
    color: "#00000099",
    lineHeight: 14,
  },

  levelDescriptionSelected: {
    color: "#FFFFFF",
  },

  checkMark: {
    position: "absolute" as const,
    top: 0,
    right: 0,
    width: 20,
    height: 20,
    backgroundColor: "#FFFFFF4D", // 30% 透明度
    borderTopRightRadius: 3,
    borderBottomLeftRadius: 14,
    borderWidth: 1,
    borderColor: "#FFFFFF33", // 20% 透明度
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },

  checkMarkText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700" as const,
  },

  // ==================== 练习方式选择弹窗 ====================
  practiceModeModal: {
    width: 257.8125,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 18.75,
    paddingTop: 12,
  },

  practiceModeCards: {
    flexDirection: "row" as const,
    gap: 10,
    marginBottom: 10,
    marginTop: 6,
  },

  practiceModeCard: {
    width: "48%",
    height: 100,
    aspectRatio: 1,
    borderRadius: 15,
    padding: 20,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    position: "relative" as const,
  },

  speakingCard: {
    backgroundColor: "#E8F3FF",
  },

  listeningCard: {
    backgroundColor: "#F3EDFF",
  },

  practiceModeCardSelected: {
    borderWidth: 3,
    borderColor: "#5482FF",
  },

  practiceModeTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#1C2A33",
    marginBottom: 15,
  },

  practiceModeIcon: {
    width: 80,
    height: 80,
    resizeMode: "contain" as const,
  },

  practiceModeCheckMark: {
    position: "absolute" as const,
    right: 12,
    bottom: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#5482FF",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },

  // 开始练习按钮
  startButton: {
    backgroundColor: "#5482FF",
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },

  startButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
})

