import { useState, useEffect, useCallback } from "react"
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Image,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
} from "react-native"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"

import { StatusBar } from "../components/StatusBar"
import { NavBar } from "../components/NavBar"
import { createStyles } from "../utils/rpxStyleSheet"
import { figmaDesignTokens } from "../constants/figma-design-tokens"

// 辅助函数：获取颜色
const getColor = (key: string): string => {
  return figmaDesignTokens.colors[key] || key
}

interface RankingItem {
  id: string
  rank: number
  avatar: string
  name: string
  studyTime: number // 学习时长（分钟）
  rankLevel: "bronze" | "silver" | "gold" | "platinum" // 段位
}

type PageState = "loading" | "empty" | "success" | "error"
type FilterType = "all" | "city" // 全部/城市

// 段位配置
const RANK_LEVELS = {
  bronze: { name: "青铜", color: "#ff583e" },
  silver: { name: "白银", color: "#d08f04" },
  gold: { name: "黄金", color: "#f38a00" },
  platinum: { name: "铂金", color: "#39a05a" },
}

// 城市数据模拟
const PROVINCES = ["北京市", "天津市", "河北省", "山西省", "山东省"]
const CITIES: Record<string, string[]> = {
  "北京市": ["东城区", "西城区", "朝阳区", "海淀区"],
  "天津市": ["和平区", "河东区", "河西区", "南开区"],
  "河北省": ["石家庄市", "唐山市", "秦皇岛市", "邯郸市", "邢台市", "保定市", "张家口市", "承德市", "沧州市", "廊坊市", "衡水市", "燕郊"],
  "山西省": ["太原市", "大同市", "阳泉市", "长治市"],
  "山东省": ["济南市", "青岛市", "淄博市", "枣庄市"],
}

export default function RankingScreen() {
  const router = useRouter()
  const [state, setState] = useState<PageState>("loading")
  const [filterType, setFilterType] = useState<FilterType>("all")
  const [rankingList, setRankingList] = useState<RankingItem[]>([])
  const [topThree, setTopThree] = useState<RankingItem[]>([])
  const [refreshing, setRefreshing] = useState(false)
  
  // 城市选择相关状态
  const [showCityPicker, setShowCityPicker] = useState(false)
  const [selectedProvince, setSelectedProvince] = useState("河北省")
  const [selectedCity, setSelectedCity] = useState("廊坊市")

  // 模拟API调用
  const fetchRankingData = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setState("loading")
      }

      // 模拟API请求
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // 模拟数据
      const mockData: RankingItem[] = [
        { id: "1", rank: 1, avatar: "", name: "小茗同学", studyTime: 4700, rankLevel: "gold" },
        { id: "2", rank: 2, avatar: "", name: "小茗同学", studyTime: 4700, rankLevel: "gold" },
        { id: "3", rank: 3, avatar: "", name: "小茗同学", studyTime: 4700, rankLevel: "gold" },
        { id: "4", rank: 4, avatar: "", name: "小茗同学", studyTime: 4700, rankLevel: "gold" },
        { id: "5", rank: 5, avatar: "", name: "小茗同学", studyTime: 4700, rankLevel: "gold" },
        { id: "6", rank: 6, avatar: "", name: "小茗同学", studyTime: 4700, rankLevel: "gold" },
        { id: "7", rank: 7, avatar: "", name: "小茗同学", studyTime: 4700, rankLevel: "gold" },
        { id: "8", rank: 8, avatar: "", name: "小茗同学", studyTime: 4700, rankLevel: "gold" },
        { id: "9", rank: 9, avatar: "", name: "小茗同学", studyTime: 200, rankLevel: "gold" },
      ]

      // 分离前三名和列表
      setTopThree(mockData.slice(0, 3))
      setRankingList(mockData.slice(3))
      setState("success")
    } catch (error: any) {
      setState("error")
    } finally {
      setRefreshing(false)
    }
  }, [])

  // 初始化加载
  useEffect(() => {
    fetchRankingData()
  }, [fetchRankingData])

  // 下拉刷新
  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchRankingData(true)
  }, [fetchRankingData])

  // 切换城市选择器
  const toggleCityPicker = () => {
    if (filterType !== "city") {
      setFilterType("city")
      setShowCityPicker(true)
    } else {
      setShowCityPicker(!showCityPicker)
    }
  }

  // 渲染领奖台（前三名）
  const renderPodium = () => {
    if (topThree.length === 0) return null

    return (
      <View style={styles.podiumWrapper}>
        {/* 顶部装饰：彩带/灯光 */}
        <Image 
          source={require("../../assets/images/ranking/spotlight.png")} 
          style={styles.podiumConfetti} 
          resizeMode="contain"
        />

        {/* 领奖台用户信息区域 - 绝对定位在台子上方 */}
        <View style={styles.podiumUsersContainer}>
          {/* 第二名 (左侧) */}
          {topThree[1] && (
            <View style={[styles.podiumUserItem, styles.podiumUserSecond]}>
              <View style={styles.avatarContainer}>
                 <Image source={require("../../assets/images/crown.png")} style={styles.crownSilver} resizeMode="contain" />
                <View style={[styles.podiumAvatar, { borderColor: "#e6e6e6" }]}>
                  <Image 
                    source={topThree[1].avatar ? { uri: topThree[1].avatar } : require("../../assets/images/user-avatar-boy.png")} 
                    style={styles.podiumAvatarImage} 
                  />
                </View>
              </View>
              <Text style={styles.podiumUserName}>{topThree[1].name}</Text>
              <Text style={styles.podiumStudyTimeText}>{topThree[1].studyTime} 分钟</Text>
            </View>
          )}

          {/* 第一名 (中间) */}
          {topThree[0] && (
            <View style={[styles.podiumUserItem, styles.podiumUserFirst]}>
              <View style={styles.avatarContainer}>
                <Image source={require("../../assets/images/crown.png")} style={styles.crownGold} resizeMode="contain" />
                <View style={[styles.podiumAvatar, { borderColor: "#ffd700", borderWidth: 3 }]}>
                  <Image 
                    source={topThree[0].avatar ? { uri: topThree[0].avatar } : require("../../assets/images/user-avatar-boy.png")} 
                    style={styles.podiumAvatarImage} 
                  />
                </View>
              </View>
              <Text style={styles.podiumUserNameFirst}>{topThree[0].name}</Text>
              <Text style={styles.podiumStudyTimeTextFirst}>{topThree[0].studyTime} 分钟</Text>
            </View>
          )}

          {/* 第三名 (右侧) */}
          {topThree[2] && (
            <View style={[styles.podiumUserItem, styles.podiumUserThird]}>
              <View style={styles.avatarContainer}>
                <Image source={require("../../assets/images/crown.png")} style={styles.crownBronze} resizeMode="contain" />
                <View style={[styles.podiumAvatar, { borderColor: "#f3bca8" }]}>
                  <Image 
                    source={topThree[2].avatar ? { uri: topThree[2].avatar } : require("../../assets/images/user-avatar-boy.png")} 
                    style={styles.podiumAvatarImage} 
                  />
                </View>
              </View>
              <Text style={styles.podiumUserName}>{topThree[2].name}</Text>
              <Text style={styles.podiumStudyTimeText}>{topThree[2].studyTime} 分钟</Text>
            </View>
          )}
        </View>

        {/* 领奖台底座图片 */}
        <Image 
          source={require("../../assets/images/ranking/podium.png")} 
          style={styles.podiumBaseImage} 
          resizeMode="contain"
        />
      </View>
    )
  }

  // 渲染列表项（第4名及以后）
  const renderListItem = ({ item, index }: { item: RankingItem, index: number }) => {
    const rankLevel = RANK_LEVELS[item.rankLevel]
    const isLastItem = index === rankingList.length - 1
    
    // 如果是最后一条（当前用户），rank 显示 "-"
    const rankText = item.rank === 9 ? "-" : item.rank
    
    return (
      <View style={[styles.listItem, isLastItem && styles.listItemLast]}>
        <Text style={styles.listRank}>{rankText}</Text>
        
        <View style={styles.listUserInfo}>
          <View style={[styles.listAvatar, { backgroundColor: "#bfdcff" }]}>
            <Image 
              source={item.avatar ? { uri: item.avatar } : require("../../assets/images/user-avatar-boy.png")} 
              style={styles.listAvatarImage} 
            />
          </View>
          
          <View style={styles.listUserDetails}>
            <Text style={styles.listUserName}>{item.name}</Text>
            <View style={styles.listRankLevel}>
              <Image source={require("../../assets/images/rank/gold.png")} style={styles.rankIcon} resizeMode="contain"/>
              <Text style={[styles.rankLevelText, { color: rankLevel.color }]}>
                {rankLevel.name}段位
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.listStudyTime}>
          <Text style={styles.listStudyTimeLabel}>学习时长</Text>
          <View style={styles.listStudyTimeValue}>
            <Text style={styles.listStudyTimeNumber}>{item.studyTime}</Text>
            <Text style={styles.listStudyTimeUnit}>分钟</Text>
          </View>
        </View>
      </View>
    )
  }

  // 渲染选择器区域
  const renderFilter = () => {
    return (
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterItem, filterType === "all" && styles.filterItemActive]}
          onPress={() => {
            setFilterType("all")
            setShowCityPicker(false)
          }}
        >
          <Text style={[styles.filterText, filterType === "all" && styles.filterTextActive]}>
            全国
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterItem, filterType === "city" && styles.filterItemActive]}
          onPress={toggleCityPicker}
        >
          <Text style={[styles.filterText, filterType === "city" && styles.filterTextActive]}>
            {selectedCity}
          </Text>
          <Ionicons
            name={showCityPicker ? "caret-up" : "caret-down"}
            size={12}
            color={filterType === "city" ? "#4080FF" : "#999"}
            style={styles.filterIcon}
          />
        </TouchableOpacity>
        
        {/* 城市选择弹窗 */}
        {showCityPicker && (
          <View style={styles.cityPickerContainer}>
            <View style={styles.cityPickerContent}>
              {/* 省份列表 */}
              <ScrollView style={styles.provinceList} showsVerticalScrollIndicator={false}>
                {PROVINCES.map(province => (
                  <TouchableOpacity 
                    key={province} 
                    style={[styles.pickerItem, selectedProvince === province && styles.pickerItemActive]}
                    onPress={() => setSelectedProvince(province)}
                  >
                    <Text style={[styles.pickerItemText, selectedProvince === province && styles.pickerItemTextActive]}>
                      {province}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              
              {/* 城市列表 */}
              <ScrollView style={styles.cityList} showsVerticalScrollIndicator={false}>
                {(CITIES[selectedProvince] || []).map(city => (
                  <TouchableOpacity 
                    key={city} 
                    style={[styles.pickerItem, selectedCity === city && styles.pickerItemActive]}
                    onPress={() => {
                      setSelectedCity(city)
                      setShowCityPicker(false)
                    }}
                  >
                    <Text style={[styles.pickerItemText, selectedCity === city && styles.pickerItemTextActive]}>
                      {city}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        )}
      </View>
    )
  }

  // 渲染加载状态
  const renderLoading = () => (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color={getColor("7")} />
    </View>
  )

  // 渲染空状态
  const renderEmpty = () => (
    <View style={styles.centerContainer}>
      <Ionicons name="trophy-outline" size={80} color={getColor("60")} />
      <Text style={styles.emptyText}>暂无排行榜数据</Text>
    </View>
  )

  // 渲染错误状态
  const renderError = () => (
    <View style={styles.centerContainer}>
      <Ionicons name="alert-circle-outline" size={80} color={getColor("55")} />
      <Text style={styles.errorText}>加载失败，请稍后重试</Text>
      <TouchableOpacity style={styles.retryButton} onPress={() => fetchRankingData()}>
        <Text style={styles.retryButtonText}>重试</Text>
      </TouchableOpacity>
    </View>
  )

  // 渲染内容 - 左右布局
  const renderContent = () => {
    switch (state) {
      case "loading":
        return renderLoading()
      case "empty":
        return renderEmpty()
      case "error":
        return renderError()
      case "success":
        return (
          <View style={styles.contentRow}>
            {/* 左侧：筛选 + 领奖台 */}
            <View style={styles.leftColumn}>
              {renderFilter()}
              {renderPodium()}
            </View>
            
            {/* 右侧：列表卡片 */}
            <View style={styles.rightColumn}>
              <View style={styles.listCard}>
                <ScrollView 
                  style={styles.listScrollView}
                  showsVerticalScrollIndicator={false}
                  refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                >
                  {rankingList.map((item, index) => (
                    <View key={item.id}>{renderListItem({ item, index })}</View>
                  ))}
                </ScrollView>
              </View>
            </View>
          </View>
        )
      default:
        return renderLoading()
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar theme="light" />
      <LinearGradient
        colors={["#D5E6FF", "#F0F7FF", "#F5F9FF"]}
        style={styles.gradient}
      >
        <NavBar title="排行榜" onBackPress={() => router.back()} />
        {renderContent()}
      </LinearGradient>
      
      {/* 点击外部关闭城市选择器 */}
      {showCityPicker && (
        <TouchableWithoutFeedback onPress={() => setShowCityPicker(false)}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      )}
    </View>
  )
}

const styles = createStyles({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  // 左右布局容器
  contentRow: {
    flex: 1,
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  leftColumn: {
    flex: 1, // 左侧占1份
    marginRight: 20,
    zIndex: 10, // 确保下拉菜单在最上层
  },
  rightColumn: {
    width: 360, // 右侧固定宽度，或者使用 flex: 0.8
    paddingTop: 20,
  },
  
  centerContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingHorizontal: 40,
  },
  emptyText: {
    marginTop: 20,
    fontSize: 28,
    color: getColor("60"),
  },
  errorText: {
    marginTop: 20,
    fontSize: 28,
    color: getColor("55"),
  },
  retryButton: {
    marginTop: 40,
    paddingHorizontal: 40,
    paddingVertical: 20,
    backgroundColor: getColor("7"),
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 28,
    color: getColor("1"),
  },
  
  // 选择器样式
  filterContainer: {
    flexDirection: "row" as const,
    alignSelf: "center" as const,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 4,
    marginTop: 20,
    marginBottom: 10,
    shadowColor: "#4080FF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: "relative" as const,
    zIndex: 20,
  },
  filterItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 16,
  },
  filterItemActive: {
    backgroundColor: "#E6F0FF",
  },
  filterText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500" as const,
  },
  filterTextActive: {
    color: "#4080FF",
    fontWeight: "600" as const,
  },
  filterIcon: {
    marginLeft: 4,
    marginTop: 2,
  },
  
  // 城市选择器弹窗
  cityPickerContainer: {
    position: "absolute" as const,
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    height: 240,
    zIndex: 100,
    overflow: "hidden" as const,
  },
  cityPickerContent: {
    flexDirection: "row" as const,
    height: "100%",
  },
  provinceList: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },
  cityList: {
    flex: 1,
    backgroundColor: "#fff",
  },
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center" as const,
  },
  pickerItemActive: {
    backgroundColor: "#fff",
  },
  pickerItemText: {
    fontSize: 14,
    color: "#666",
  },
  pickerItemTextActive: {
    color: "#4080FF",
    fontWeight: "600" as const,
  },
  overlay: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },

  // 领奖台区域
  podiumWrapper: {
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "flex-end" as const,
    position: "relative" as const,
    paddingBottom: 20,
  },
  podiumConfetti: {
    position: "absolute" as const,
    top: 0,
    width: "100%" as unknown as number,
    height: "80%" as unknown as number,
    zIndex: 0,
  },
  podiumBaseImage: {
    width: 340,
    height: 160,
    position: "absolute" as const,
    bottom: 0,
    zIndex: 1,
  },
  podiumUsersContainer: {
    flexDirection: "row" as const,
    justifyContent: "center" as const,
    alignItems: "flex-end" as const,
    width: "100%" as unknown as number,
    height: 300, // 控制整体高度
    marginBottom: 20, // 为底座留出空间
    zIndex: 2,
    paddingHorizontal: 20,
  },
  podiumUserItem: {
    alignItems: "center" as const,
    justifyContent: "flex-end" as const,
    paddingBottom: 10,
  },
  podiumUserSecond: {
    marginBottom: 110, // 调整以对齐左侧台阶
    marginRight: 10,
  },
  podiumUserFirst: {
    marginBottom: 150, // 调整以对齐中间最高台阶
    zIndex: 3,
  },
  podiumUserThird: {
    marginBottom: 80, // 调整以对齐右侧台阶
    marginLeft: 10,
  },
  avatarContainer: {
    alignItems: "center" as const,
    marginBottom: 8,
    position: "relative" as const,
  },
  podiumAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#fff",
    overflow: "hidden" as const,
    backgroundColor: "#fff",
  },
  podiumAvatarImage: {
    width: "100%" as unknown as number,
    height: "100%" as unknown as number,
  },
  crownGold: {
    width: 40,
    height: 32,
    position: "absolute" as const,
    top: -28,
    zIndex: 1,
    transform: [{ rotate: '-15deg' }]
  },
  crownSilver: {
    width: 30,
    height: 24,
    position: "absolute" as const,
    top: -20,
    left: -10,
    zIndex: 1,
    transform: [{ rotate: '-25deg' }],
    tintColor: "#C0C0C0"
  },
  crownBronze: {
    width: 28,
    height: 22,
    position: "absolute" as const,
    top: -18,
    left: -8,
    zIndex: 1,
    transform: [{ rotate: '-25deg' }],
    tintColor: "#CD7F32"
  },
  podiumUserName: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#333",
    marginBottom: 2,
  },
  podiumUserNameFirst: {
    fontSize: 16,
    fontWeight: "bold" as const,
    color: "#333",
    marginBottom: 2,
  },
  podiumStudyTimeText: {
    fontSize: 12,
    color: "#4080FF",
    fontWeight: "500" as const,
  },
  podiumStudyTimeTextFirst: {
    fontSize: 13,
    color: "#4080FF",
    fontWeight: "600" as const,
  },

  // 右侧列表卡片
  listCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 4,
    shadowColor: "#4080FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: "hidden" as const,
  },
  listScrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  listItemLast: {
    borderBottomWidth: 0,
    marginTop: 10,
    paddingTop: 20,
    borderTopWidth: 8,
    borderTopColor: "#F7F8FA", // 分隔条效果
  },
  listRank: {
    width: 30,
    fontSize: 20,
    fontWeight: "600" as const,
    color: "#666",
    textAlign: "center" as const,
    marginRight: 12,
  },
  listUserInfo: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  listAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F7FF",
    marginRight: 12,
    overflow: "hidden" as const,
  },
  listAvatarImage: {
    width: "100%" as unknown as number,
    height: "100%" as unknown as number,
  },
  listUserDetails: {
    flex: 1,
    justifyContent: "center" as const,
  },
  listUserName: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#333",
    marginBottom: 4,
  },
  listRankLevel: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "#FFF4E5",
    alignSelf: "flex-start" as const,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  rankIcon: {
    width: 10,
    height: 10,
    marginRight: 4,
  },
  rankLevelText: {
    fontSize: 9,
    fontWeight: "500" as const,
  },
  listStudyTime: {
    alignItems: "flex-end" as const,
  },
  listStudyTimeLabel: {
    fontSize: 10,
    color: "#999",
    marginBottom: 2,
  },
  listStudyTimeValue: {
    flexDirection: "row" as const,
    alignItems: "baseline" as const,
  },
  listStudyTimeNumber: {
    fontSize: 14,
    fontWeight: "bold" as const,
    color: "#4080FF",
  },
  listStudyTimeUnit: {
    fontSize: 10,
    color: "#4080FF",
    marginLeft: 2,
  },
})
