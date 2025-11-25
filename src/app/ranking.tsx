import { useState, useEffect, useCallback } from "react"
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Image,
  ScrollView,
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

/**
 * 排行榜页面
 * 100%还原Figma设计
 * 包含：选择器、领奖台（前三名）、列表（第4名及以后）
 */

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

export default function RankingScreen() {
  const router = useRouter()
  const [state, setState] = useState<PageState>("loading")
  const [filterType, setFilterType] = useState<FilterType>("all")
  const [rankingList, setRankingList] = useState<RankingItem[]>([])
  const [topThree, setTopThree] = useState<RankingItem[]>([])
  const [refreshing, setRefreshing] = useState(false)

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

  // 渲染领奖台（前三名）
  const renderPodium = () => {
    if (topThree.length === 0) return null

    const podiumHeights = [355, 284, 228] // 根据Figma设计的高度

    return (
      <View style={styles.podiumContainer}>
        {/* 第二名 */}
        {topThree[1] && (
          <View style={[styles.podiumItem, { height: podiumHeights[1] }]}>
            <View style={styles.podiumBase}>
              <View style={styles.podiumNumberContainer}>
                <Text style={styles.podiumNumber}>2</Text>
              </View>
            </View>
            <View style={styles.podiumUserInfo}>
              <View style={[styles.podiumAvatar, { backgroundColor: "#fee1fb" }]}>
                <View style={styles.podiumAvatarBadge}>
                  <Text style={styles.podiumAvatarBadgeText}>2</Text>
                </View>
              </View>
              <Text style={styles.podiumUserName}>{topThree[1].name}</Text>
              <View style={styles.podiumStudyTime}>
                <Text style={styles.podiumStudyTimeValue}>{topThree[1].studyTime}</Text>
                <Text style={styles.podiumStudyTimeUnit}>分钟</Text>
              </View>
            </View>
          </View>
        )}

        {/* 第一名 */}
        {topThree[0] && (
          <View style={[styles.podiumItem, styles.podiumFirst, { height: podiumHeights[0] }]}>
            <View style={styles.podiumBase}>
              <View style={styles.podiumNumberContainer}>
                <Text style={styles.podiumNumber}>1</Text>
              </View>
            </View>
            <View style={styles.podiumUserInfo}>
              <View style={[styles.podiumAvatar, { backgroundColor: "#bfdcff" }]}>
                <View style={styles.podiumAvatarBadge}>
                  <Text style={styles.podiumAvatarBadgeText}>1</Text>
                </View>
              </View>
              <Text style={styles.podiumUserName}>{topThree[0].name}</Text>
              <View style={styles.podiumStudyTime}>
                <Text style={styles.podiumStudyTimeValue}>{topThree[0].studyTime}</Text>
                <Text style={styles.podiumStudyTimeUnit}>分钟</Text>
              </View>
            </View>
          </View>
        )}

        {/* 第三名 */}
        {topThree[2] && (
          <View style={[styles.podiumItem, { height: podiumHeights[2] }]}>
            <View style={styles.podiumBase}>
              <View style={styles.podiumNumberContainer}>
                <Text style={styles.podiumNumber}>3</Text>
              </View>
            </View>
            <View style={styles.podiumUserInfo}>
              <View style={[styles.podiumAvatar, { backgroundColor: "#fee1fb" }]}>
                <View style={styles.podiumAvatarBadge}>
                  <Text style={styles.podiumAvatarBadgeText}>3</Text>
                </View>
              </View>
              <Text style={styles.podiumUserName}>{topThree[2].name}</Text>
              <View style={styles.podiumStudyTime}>
                <Text style={styles.podiumStudyTimeValue}>{topThree[2].studyTime}</Text>
                <Text style={styles.podiumStudyTimeUnit}>分钟</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    )
  }

  // 渲染列表项（第4名及以后）
  const renderListItem = ({ item }: { item: RankingItem }) => {
    const rankLevel = RANK_LEVELS[item.rankLevel]

    return (
      <View style={[styles.listItem, item.rank === 9 && styles.listItemLast]}>
        <Text style={styles.listRank}>{item.rank}</Text>
        <View style={styles.listUserInfo}>
          <View style={styles.listAvatarContainer}>
            <View style={[styles.listAvatar, { backgroundColor: "#bfdcff" }]}>
              {item.avatar ? (
                <Image source={{ uri: item.avatar }} style={styles.listAvatarImage} />
              ) : (
                <Ionicons name="person" size={40} color={getColor("7")} />
              )}
            </View>
          </View>
          <View style={styles.listUserDetails}>
            <Text style={styles.listUserName}>{item.name}</Text>
            <View style={styles.listRankLevel}>
              <View style={[styles.rankLevelDot, { backgroundColor: rankLevel.color }]} />
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
          onPress={() => setFilterType("all")}
        >
          <Text style={[styles.filterText, filterType === "all" && styles.filterTextActive]}>
            全国
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterItem, filterType === "city" && styles.filterItemActive]}
          onPress={() => setFilterType("city")}
        >
          <Text style={[styles.filterText, filterType === "city" && styles.filterTextActive]}>
            城市
          </Text>
          <Ionicons
            name="chevron-down"
            size={20}
            color={filterType === "city" ? getColor("7") : getColor("60")}
            style={styles.filterIcon}
          />
        </TouchableOpacity>
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

  // 渲染内容
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
          <ScrollView
            style={styles.scrollView}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            {renderPodium()}
            {renderFilter()}
            <View style={styles.listContainer}>
              {rankingList.map((item) => (
                <View key={item.id}>{renderListItem({ item })}</View>
              ))}
            </View>
          </ScrollView>
        )
      default:
        return renderLoading()
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar theme="dark" />
      <LinearGradient
        colors={["#93abff", "#e4f4ff", "#cdedff", "#ffffff"]}
        style={styles.gradient}
      >
        <NavBar title="排行榜" onBackPress={() => router.back()} />
        {renderContent()}
      </LinearGradient>
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
  scrollView: {
    flex: 1,
  },
  // 领奖台样式
  podiumContainer: {
    flexDirection: "row" as const,
    justifyContent: "center" as const,
    alignItems: "flex-end" as const,
    paddingHorizontal: 40,
    paddingTop: 20,
    paddingBottom: 40,
  },
  podiumItem: {
    width: 251,
    alignItems: "center" as const,
  },
  podiumFirst: {
    marginHorizontal: 20,
  },
  podiumBase: {
    width: 251,
    height: 35,
    backgroundColor: "#ead9bd",
    borderRadius: 4,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  podiumNumberContainer: {
    width: 79,
    height: 42,
    backgroundColor: getColor("7"),
    borderRadius: 4,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  podiumNumber: {
    fontSize: 120,
    fontWeight: "600" as const,
    color: getColor("1"),
  },
  podiumUserInfo: {
    marginTop: 20,
    alignItems: "center" as const,
  },
  podiumAvatar: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginBottom: 16,
  },
  podiumAvatarBadge: {
    width: 78,
    height: 71,
    backgroundColor: getColor("7"),
    borderRadius: 39,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  podiumAvatarBadgeText: {
    fontSize: 32,
    fontWeight: "600" as const,
    color: getColor("1"),
  },
  podiumUserName: {
    fontSize: 26,
    fontWeight: "500" as const,
    color: getColor("7"),
    marginBottom: 8,
  },
  podiumStudyTime: {
    flexDirection: "row" as const,
    alignItems: "baseline" as const,
  },
  podiumStudyTimeValue: {
    fontSize: 28,
    fontWeight: "500" as const,
    color: getColor("69"),
  },
  podiumStudyTimeUnit: {
    fontSize: 20,
    color: getColor("69"),
    marginLeft: 4,
  },
  // 选择器样式
  filterContainer: {
    flexDirection: "row" as const,
    paddingHorizontal: 40,
    paddingVertical: 20,
    backgroundColor: getColor("1"),
    marginHorizontal: 40,
    marginBottom: 20,
    borderRadius: 8,
  },
  filterItem: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 16,
  },
  filterItemActive: {
    backgroundColor: getColor("2009"),
    borderRadius: 8,
  },
  filterText: {
    fontSize: 30,
    color: getColor("60"),
  },
  filterTextActive: {
    color: getColor("7"),
    fontWeight: "600" as const,
  },
  filterIcon: {
    marginLeft: 8,
  },
  // 列表样式
  listContainer: {
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  listItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: getColor("1"),
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  listItemLast: {
    backgroundColor: "#f1f7ff",
  },
  listRank: {
    width: 44,
    fontSize: 36,
    fontWeight: "500" as const,
    color: getColor("0"),
    textAlign: "center" as const,
  },
  listUserInfo: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginLeft: 20,
  },
  listAvatarContainer: {
    marginRight: 16,
  },
  listAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  listAvatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  listUserDetails: {
    flex: 1,
  },
  listUserName: {
    fontSize: 28,
    fontWeight: "500" as const,
    color: getColor("0"),
    marginBottom: 8,
  },
  listRankLevel: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  rankLevelDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  rankLevelText: {
    fontSize: 19,
    fontWeight: "500" as const,
  },
  listStudyTime: {
    alignItems: "flex-end" as const,
  },
  listStudyTimeLabel: {
    fontSize: 20,
    color: getColor("0"),
    marginBottom: 4,
  },
  listStudyTimeValue: {
    flexDirection: "row" as const,
    alignItems: "baseline" as const,
  },
  listStudyTimeNumber: {
    fontSize: 26,
    fontWeight: "500" as const,
    color: getColor("200"),
  },
  listStudyTimeUnit: {
    fontSize: 20,
    color: getColor("200"),
    marginLeft: 4,
  },
})
