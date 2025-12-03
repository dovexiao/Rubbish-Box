import { useState, useEffect, useCallback } from "react"
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Image,
  ScrollView,
  FlatList,
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
import { post } from "../services/api"

// 辅助函数：获取颜色
const getColor = (key: string): string => {
  return figmaDesignTokens.colors[key] || key
}

// 接口类型定义
interface RankingRequest {
  /**
   * "" ｜ "710000",全国 ｜ 省的区号
   */
  areae_market: string
  /**
   * 页码，默认1
   */
  page: number
  /**
   * 每页数量，默认100
   */
  page_size: number
  [property: string]: any
}

interface CurrentUserProvince {
  /**
   * 邮编
   */
  postal_code: string
  /**
   * 省，中文
   */
  province: string
  [property: string]: any
}

interface CurrentUserRank {
  rank_description: string
  rank_icon: null
  rank_level: number
  /**
   * 段位名字
   */
  rank_name: string
  [property: string]: any
}

interface RankingListItem {
  /**
   * 头像
   */
  avatar: null | string
  is_current_user: boolean
  rank_description: string
  rank_icon: null
  rank_level: number
  /**
   * 段位
   */
  rank_name: string
  /**
   * 当前排行榜排名情况
   */
  ranking: number
  /**
   * 学习时长
   */
  total_duration: number
  /**
   * 用户名
   */
  username: string
  [property: string]: any
}

interface RankingData {
  /**
   * 当前用户头像
   */
  current_user_avatar: null | string
  /**
   * 当前用户名
   */
  current_user_name: string
  /**
   * 当前用户所在地区
   */
  current_user_province: CurrentUserProvince
  /**
   * 当前用户段位
   */
  current_user_rank: CurrentUserRank
  /**
   * 当前用户所在排名
   */
  current_user_ranking: number
  /**
   * 当前用户学习时长
   */
  current_user_total_duration: number
  ranking_list: RankingListItem[]
  total_users: number
  [property: string]: any
}

// 内部使用的数据结构
interface RankingItem {
  id: string
  rank: number
  avatar: string | null
  name: string
  studyTime: number // 学习时长（小时）
  rankLevel: "bronze" | "silver" | "gold" | "platinum" // 段位
  rankIcon: string | null // 段位图标URL
  isCurrentUser?: boolean
}

type PageState = "loading" | "empty" | "success" | "error"
type FilterType = "all" | "province" // 全国/省份

// 段位配置
const RANK_LEVELS = {
  bronze: { name: "青铜", color: "#ff583e" },
  silver: { name: "白银", color: "#d08f04" },
  gold: { name: "黄金", color: "#f38a00" },
  platinum: { name: "铂金", color: "#39a05a" },
}

// 段位映射（将接口返回的段位名称映射到内部使用的段位类型）
const mapRankLevel = (rankName: string): "bronze" | "silver" | "gold" | "platinum" => {
  if (rankName.includes("青铜")) return "bronze"
  if (rankName.includes("白银")) return "silver"
  if (rankName.includes("黄金")) return "gold"
  if (rankName.includes("铂金")) return "platinum"
  return "bronze" // 默认
}

export default function RankingScreen() {
  const router = useRouter()
  const [state, setState] = useState<PageState>("loading")
  const [filterType, setFilterType] = useState<FilterType>("all")
  const [rankingList, setRankingList] = useState<RankingItem[]>([])
  const [topThree, setTopThree] = useState<RankingItem[]>([])
  const [currentUser, setCurrentUser] = useState<RankingItem | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [userProvince, setUserProvince] = useState<string>("") // 用户所在省份（中文名）
  const [userProvinceCode, setUserProvinceCode] = useState<string>("") // 用户所在省份区号（postal_code）
  
  // 城市选择相关状态（已注释，暂时不使用）
  // const [showCityPicker, setShowCityPicker] = useState(false)
  // const [selectedProvince, setSelectedProvince] = useState("河北省")
  // const [selectedCity, setSelectedCity] = useState("廊坊市")

  // 获取排行榜数据
  const fetchRankingData = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setState("loading")
      }

      // 构建请求参数
      const params: RankingRequest = {
        areae_market: filterType === "all" ? "" : userProvinceCode, // 全国传空字符串，省份传区号（postal_code）
        page: 1, // 页码，默认1
        page_size: 100, // 每页数量，默认100
      }

      // 调用接口（POST请求）
      const data: RankingData = await post<RankingData>("/AppStart/UserRanking/details_ranking/", params)

      // 保存用户省份信息（只在第一次加载时保存）
      if (data.current_user_province?.province && !userProvince) {
        setUserProvince(data.current_user_province.province)
        setUserProvinceCode(data.current_user_province.postal_code)
      }

      // 转换数据格式
      const allRankingItems: RankingItem[] = data.ranking_list.map((item, index) => ({
        id: `ranking_${item.ranking}_${index}`,
        rank: item.ranking,
        avatar: item.avatar,
        name: item.username,
        studyTime: item.total_duration,
        rankLevel: mapRankLevel(item.rank_name),
        rankIcon: item.rank_icon,
        isCurrentUser: item.is_current_user,
      }))

      // 分离前三名和列表
      const topThreeItems = allRankingItems.filter(item => item.rank <= 3).sort((a, b) => a.rank - b.rank)
      setTopThree(topThreeItems)

      // 找到当前用户
      const currentUserItem = allRankingItems.find(item => item.isCurrentUser) || 
        (data.current_user_ranking > 0 ? {
          id: "current_user",
          rank: data.current_user_ranking,
          avatar: data.current_user_avatar,
          name: data.current_user_name,
          studyTime: data.current_user_total_duration,
          rankLevel: mapRankLevel(data.current_user_rank?.rank_name || ""),
          rankIcon: data.current_user_rank?.rank_icon,
          isCurrentUser: true,
        } : null)

      if (currentUserItem) {
        setCurrentUser(currentUserItem as RankingItem)
        // 从列表中移除当前用户
        setRankingList(allRankingItems.filter(item => !item.isCurrentUser && item.rank > 3))
      } else {
        setCurrentUser(null)
        setRankingList(allRankingItems.filter(item => item.rank > 3))
      }

      // 判断是否有数据
      if (allRankingItems.length === 0) {
        setState("empty")
      } else {
        setState("success")
      }
    } catch (error: any) {
      console.error("获取排行榜数据失败:", error)
      setState("error")
    } finally {
      setRefreshing(false)
    }
  }, [filterType, userProvince])

  // 初始化加载
  useEffect(() => {
    fetchRankingData()
  }, [])

  // 当筛选类型改变时重新加载数据
  useEffect(() => {
    if (userProvinceCode || filterType === "all") {
      fetchRankingData()
    }
  }, [filterType, userProvinceCode])

  // 下拉刷新
  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchRankingData(true)
  }, [fetchRankingData])

  // 切换筛选类型（全国/省份）
  const toggleFilter = () => {
    setFilterType(filterType === "all" ? "province" : "all")
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
                 <Image source={require("../../assets/ranking-image/little-2.png")} style={styles.crownSilver} resizeMode="contain" />
                <View style={[styles.podiumAvatar, { borderColor: "#FF9E55" }]}>
                  <Image
                    source={topThree[1].avatar ? { uri: topThree[1].avatar } : require("../../assets/images/user-avatar-boy.png")} 
                    style={styles.podiumAvatarImage} 
                  />
                </View>
              </View>
              <Text style={styles.podiumUserName} numberOfLines={1} ellipsizeMode="tail">{topThree[1].name}</Text>
              <Text style={styles.podiumStudyTimeText}>{topThree[1].studyTime} 小时</Text>
            </View>
          )}

          {/* 第一名 (中间) */}
          {topThree[0] && (
            <View style={[styles.podiumUserItem, styles.podiumUserFirst]}>
              <View style={styles.avatarContainer}>
                <Image source={require("../../assets/ranking-image/little-1.png")} style={styles.crownGold} resizeMode="contain" />
                <View style={[styles.podiumAvatar1, { borderColor: "#FF9E55", borderWidth: 3 }]}>
                  <Image 
                    source={topThree[0].avatar ? { uri: topThree[0].avatar } : require("../../assets/images/user-avatar-boy.png")} 
                    style={styles.podiumAvatarImage} 
                  />
                </View>
              </View>
              <Text style={styles.podiumUserNameFirst} numberOfLines={1} ellipsizeMode="tail">{topThree[0].name}</Text>
              <Text style={styles.podiumStudyTimeTextFirst}>{topThree[0].studyTime} 小时</Text>
            </View>
          )}

          {/* 第三名 (右侧) */}
          {topThree[2] && (
            <View style={[styles.podiumUserItem, styles.podiumUserThird]}>
              <View style={styles.avatarContainer}>
                <Image source={require("../../assets/ranking-image/little-3.png")} style={styles.crownBronze} resizeMode="contain" />
                <View style={[styles.podiumAvatar, { borderColor: "#FF9E55" }]}>
                  <Image 
                    source={topThree[2].avatar ? { uri: topThree[2].avatar } : require("../../assets/images/user-avatar-boy.png")} 
                    style={styles.podiumAvatarImage} 
                  />
                </View>
              </View>
              <Text style={styles.podiumUserName} numberOfLines={1} ellipsizeMode="tail">{topThree[2].name}</Text>
              <Text style={styles.podiumStudyTimeText}>{topThree[2].studyTime} 小时</Text>
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

  // 渲染列表项（第4名及以后，不包括当前用户）
  const renderListItem = ({ item, index }: { item: RankingItem, index: number }) => {
    const rankLevel = RANK_LEVELS[item.rankLevel]
    
    return (
      <View style={styles.listItem}>
        <Text style={styles.listRank}>{item.rank}</Text>
        
        <View style={styles.listUserInfo}>
          <View style={[styles.listAvatar, { backgroundColor: "#bfdcff" }]}>
            <Image 
              source={item.avatar ? { uri: item.avatar } : require("../../assets/images/user-avatar-boy.png")} 
              style={styles.listAvatarImage} 
            />
          </View>
          
          <View style={styles.listUserDetails}>
            <Text style={styles.listUserName} numberOfLines={1} ellipsizeMode="tail">{item.name}</Text>
            <Image 
              source={item.rankIcon ? { uri: item.rankIcon } : require("../../assets/images/rank/gold.png")} 
              style={styles.rankIconLarge} 
              resizeMode="contain"
            />
          </View>
        </View>
        
        <View style={styles.listStudyTime}>
          <Text style={styles.listStudyTimeLabel}>学习时长</Text>
          <View style={styles.listStudyTimeValue}>
            <Text style={styles.listStudyTimeNumber}>{item.studyTime}</Text>
            <Text style={styles.listStudyTimeUnit}>小时</Text>
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
          onPress={() => setFilterType("all")}
        >
          <Text style={[styles.filterText, filterType === "all" && styles.filterTextActive]}>
            全国
          </Text>
        </TouchableOpacity>
        {userProvince && (
          <TouchableOpacity
            style={[styles.filterItem, filterType === "province" && styles.filterItemActive]}
            onPress={() => setFilterType("province")}
          >
            <Text style={[styles.filterText, filterType === "province" && styles.filterTextActive]}>
              {userProvince}
            </Text>
          </TouchableOpacity>
        )}
        
        {/* 城市选择弹窗（已注释，暂时不使用） */}
        {/* {showCityPicker && (
          <View style={styles.cityPickerContainer}>
            <View style={styles.cityPickerContent}>
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
        )} */}
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
                <FlatList
                  data={rankingList}
                  renderItem={({ item, index }) => renderListItem({ item, index })}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                  contentContainerStyle={styles.listContentContainer}
                />
                {/* 当前用户固定在底部 */}
                {currentUser && (
                  <View style={styles.currentUserFixed}>
                    <View style={styles.listItem}>
                      <Text style={styles.listRank}>-</Text>
                      
                      <View style={styles.listUserInfo}>
                        <View style={[styles.listAvatar, { backgroundColor: "#bfdcff" }]}>
                          <Image 
                            source={currentUser.avatar ? { uri: currentUser.avatar } : require("../../assets/images/user-avatar-boy.png")} 
                            style={styles.listAvatarImage} 
                          />
                        </View>
                        
                        <View style={styles.listUserDetails}>
                          <Text style={styles.listUserName} numberOfLines={1} ellipsizeMode="tail">{currentUser.name}</Text>
                          <Image 
                            source={currentUser.rankIcon ? { uri: currentUser.rankIcon } : require("../../assets/images/rank/gold.png")} 
                            style={styles.rankIconLarge} 
                            resizeMode="contain"
                          />
                        </View>
                      </View>
                      
                      <View style={styles.listStudyTime}>
                        <Text style={styles.listStudyTimeLabel}>学习时长</Text>
                        <View style={styles.listStudyTimeValue}>
                          <Text style={styles.listStudyTimeNumber}>{currentUser.studyTime}</Text>
                          <Text style={styles.listStudyTimeUnit}>小时</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                )}
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
      
      {/* 点击外部关闭城市选择器（已注释，暂时不使用） */}
      {/* {showCityPicker && (
        <TouchableWithoutFeedback onPress={() => setShowCityPicker(false)}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      )} */}
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
    flexDirection: "row" as const,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  leftColumn: {
    flex: 1, // 左侧占1份
    marginRight: 50,
    zIndex: 10, // 确保下拉菜单在最上层
  },
  rightColumn: {
    width: 282.8125, // 右侧固定宽度，或者使用 flex: 0.8
    marginRight: 20,
    
    // paddingTop: 20,
  },
  
  centerContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingHorizontal: 80,
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
   background: '#FFFFFF57',
    borderRadius: 16.4,
    padding: 3,
    height: 28.9,
    // marginTop: 30,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#FFFFFF78",
    position: "relative" as const,
    zIndex: 20,
  },
  filterItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 16,
    paddingVertical: 0,
    borderRadius: 15.625,
  },
  filterItemActive: {
    backgroundColor: "#F2F7FF",
  },
  filterText: {
    fontSize: 11.875,
    color: "#5F83F7",
    fontWeight: "600" as const,
  },
  filterTextActive: {
    color: "#5F83F7",
    fontWeight: "600" as const,
  },
  filterIcon: {
    marginLeft: 4,
    marginTop: 2,
  },
  
  // 城市选择器弹窗
  cityPickerContainer: {
    position: "absolute" as const,
    top: 30,
    // left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    height: 240,
    width: 184.375,
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
    top: -108,
    left: "50%" as unknown as number,
    transform: [{ translateX: -151.95 }], // 宽度的一半，实现水平居中
    width: 303.9,
    height: 253.125,
    zIndex: 0,
  },
  podiumBaseImage: {
    width: 295.3125,
    height: 138.671875,
    position: "absolute" as const,
    bottom: 30,
    zIndex: 1,
    left: "50%" as unknown as number,
    transform: [{ translateX: -147.65625 }], // 295.3125 / 2
  },
  podiumUsersContainer: {
    flexDirection: "row" as const,
    justifyContent: "center" as const,
    alignItems: "flex-end" as const,
    alignSelf: "center" as const,
    width: 303.9, // 与顶部装饰图片宽度一致
    height: 300, // 控制整体高度
    marginBottom: 20, // 为底座留出空间
    zIndex: 2,
    paddingHorizontal: 0, // 移除左右padding，确保完全居中
  },
  podiumUserItem: {
    alignItems: "center" as const,
    justifyContent: "flex-end" as const,
    paddingBottom: 10,
  },
  podiumUserSecond: {
    marginBottom: 120, // 调整以对齐左侧台阶
    marginRight: 10,
    width: 80, // 固定宽度确保居中
  },
  podiumUserFirst: {
    marginBottom: 140, // 调整以对齐中间最高台阶
    zIndex: 3,
    width: 100, // 固定宽度确保居中
  },
  podiumUserThird: {
    marginBottom: 128, // 调整以对齐右侧台阶
    marginLeft: 10,
    width: 80, // 固定宽度确保居中
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
   podiumAvatar1: {
    width: 72.65625,
    height:72.65625,
    borderRadius: 36.328125,
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
    width: 25,
    height: 20.3125,
    position: "absolute" as const,
     top: -4,
    left: -2,
    zIndex: 1,
    transform: [{ rotate: '-10deg' }]
  },
  crownSilver: {
    width: 25,
    height: 20.3125,
    position: "absolute" as const,
     top: -8,
    left: -2,
    zIndex: 1,
    transform: [{ rotate: '-10deg' }],
 
  },
  crownBronze: {
    width: 25,
    height: 20.3125,
    position: "absolute" as const,
     top: -8,
    left: -2,
    zIndex: 1,
    transform: [{ rotate: '-10deg' }],

  },
  podiumUserName: {
    fontSize: 10.9375,
    fontWeight: "600" as const,
   color: "#4080FF",
    marginBottom: 2,
  },
  podiumUserNameFirst: {
    fontSize: 10.9375,
    fontWeight: "600" as const,
     color: "#4080FF",
    marginBottom: 2,
  },
  podiumStudyTimeText: {
     fontSize: 10.9375,
    color: "#4080FF",
    fontWeight: "500" as const,
  },
  podiumStudyTimeTextFirst: {
    fontSize: 10.9375,
    color: "#4080FF",
    fontWeight: "600" as const,
  },

  // 右侧列表卡片
  listCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    // padding: 0,
    shadowColor: "#4080FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: "hidden" as const,
    marginBottom: 30,
    // marginTop: 30,
  },
  listContentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 70, // 为底部固定的当前用户留出空间
  },
  currentUserFixed: {
    position: "absolute" as const,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
  },
  listItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingVertical: 12.4375,
    paddingHorizontal: 4,
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
    width: 20,
    fontSize: 11.75,
    fontWeight: "600" as const,
    color: "#666",
    textAlign: "center" as const,
    marginRight: 6,
  },
  listUserInfo: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  listAvatar: {
    width: 39.0625,
    height: 39.0625,
    borderRadius: 19.53125,
    backgroundColor: "#BFDCFF",
    marginRight: 4,
    overflow: "hidden" as const,
  },
  listAvatarImage: {
    width: "100%" as unknown as number,
    height: "100%" as unknown as number,
  },
  listUserDetails: {
    flex: 1,
    // justifyContent: "center" as const,
  },
  listUserName: {
    fontSize: 10.9375,
    fontWeight: "600" as const,
    color: "#000",
    marginBottom: 4,
  },
  rankIconLarge: {
    height: 18.75, // 根据需要调整高度
    width: 53.125, // 设定一个较大的宽度以适应长条形图标
    alignSelf: "flex-start" as const,
    // borderWidth: 1,
    // borderColor: "#4080FF",
   
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
