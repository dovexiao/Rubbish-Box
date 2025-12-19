import { useState, useEffect, useCallback } from "react"
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator } from "react-native"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"

import { StatusBar } from "../../components/StatusBar"
import { NavBar } from "../../components/NavBar"
import { createStyles, rpx } from "../../utils/rpxStyleSheet"
import { getCompositionCorrectionRecordList, type CompositionRecordDatum } from "../../services/ai"

/**
 * 作文收录页面
 * 100%还原UniApp项目 /src/pages/AI/composition-record.vue
 */
export default function CompositionRecordScreen() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [recordList, setRecordList] = useState<CompositionRecordDatum[]>([])
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({})

  // 格式化日期显示
  const formatDate = (dateString?: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return `${date.getMonth() + 1}.${date.getDate()}`
  }

  // 获取当前年月字符串
  const getCurrentYearMonth = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    return month < 10 ? `${year}-0${month}` : `${year}-${month}`
  }

  // 切换月份展开/收起状态
  const toggleMonth = (yearMonth: string | undefined) => {
    if (!yearMonth) return
    setExpandedMonths((prev) => ({
      ...prev,
      [yearMonth]: !prev[yearMonth],
    }))
  }

  // 获取作文收录记录
  const getCompositionRecords = useCallback(async () => {
    try {
      setLoading(true)
      const res = await getCompositionCorrectionRecordList()
      if (res) {
        setRecordList(res)

        // 默认展开当前月份，其他月份收起
        const currentYearMonth = getCurrentYearMonth()
        const initialExpanded: Record<string, boolean> = {}
        res.forEach((item) => {
          if (item.year_month) {
            initialExpanded[item.year_month] = item.year_month === currentYearMonth
          }
        })
        setExpandedMonths(initialExpanded)
      }
    } catch (error) {
      console.error("获取作文收录记录失败:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    getCompositionRecords()
  }, [getCompositionRecords])

  // 跳转到作文详情页面
  const goToDetail = (id: number | undefined) => {
    if (!id) return
    router.push(`/ai/result?id=${id}`)
  }

  return (
    <View style={styles.pageContainer}>
      <View style={styles.sticky}>
        <StatusBar theme="dark" />
        <NavBar title="作文收录" leftArrow style={styles.navbarMargin} />
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1571FC" />
          <Text style={styles.loadingText}>正在加载...</Text>
        </View>
      )}

      {!loading && recordList.length === 0 && (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={rpx(78.125)} color="#D9D9D9" />
          <Text style={styles.emptyText}>暂无作文记录</Text>
        </View>
      )}

      {!loading && recordList.length > 0 && (
        <ScrollView style={styles.recordListWrapper} showsVerticalScrollIndicator={false}>
          <View style={styles.recordList}>
            <View style={styles.recordListInner}>
              {recordList.map((group, index) => (
                <View key={index}>
                  <View style={styles.monthGroup}>
                    <TouchableOpacity
                      style={styles.monthHeader}
                      onPress={() => toggleMonth(group.year_month)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.monthTitle}>{group.year_month}</Text>
                      <View style={styles.monthToggle}>
                        <Text style={styles.toggleText}>共{group.records?.length || 0}条</Text>
                        <Ionicons
                          name={
                            expandedMonths[group.year_month || ""]
                              ? "chevron-down"
                              : "chevron-forward"
                          }
                          size={rpx(22)}
                          color="rgba(0, 0, 0, 0.7)"
                        />
                      </View>
                    </TouchableOpacity>

                    {expandedMonths[group.year_month || ""] && (
                      <>
                        {group.records && group.records.length > 0 ? (
                          <View style={styles.monthList}>
                            {group.records.map((item) => (
                              <TouchableOpacity
                                key={item.id}
                                style={styles.recordItem}
                                onPress={() => goToDetail(item.id)}
                                activeOpacity={0.8}
                              >
                                <Image
                                  source={{
                                    uri: item.cover_image || "/static/images/default-cover.png",
                                  }}
                                  style={styles.recordImage}
                                  resizeMode="cover"
                                />
                                <View style={styles.scoreBadge}>
                                  <Text style={styles.scoreText}>{item.rating}</Text>
                                  <Image 
                                    source={require("../../../assets/images/Frame 2090059169.png")} 
                                    style={styles.scoreLine}
                                    resizeMode="contain"
                                  />
                                </View>
                                <View style={styles.recordInfo}>
                                  <View style={styles.recordType}>
                                    <Text style={styles.recordTypeText}>
                                      作文批改·{item.composition_type || "未知类型"}
                                    </Text>
                                  </View>
                                  <Text style={styles.recordTime}>
                                    {formatDate(item.created_at)}
                                  </Text>
                                </View>
                              </TouchableOpacity>
                            ))}
                          </View>
                        ) : (
                          <View style={styles.emptyMonth}>
                            <Text style={styles.emptyMonthText}>本月暂无记录</Text>
                          </View>
                        )}
                      </>
                    )}
                  </View>
                  {index < recordList.length - 1 && <View style={styles.monthDivider} />}
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  )
}

const styles = createStyles({
  pageContainer: {
    minWidth: 750,
    minHeight: "100%",
    backgroundColor: "#E4F4FF",
    flex: 1,
  },
  sticky: {
    position: "relative",
    zIndex: 10,
    backgroundColor: "#E4F4FF",
  },
  navbarMargin: {
    marginBottom: 8,
  },
  // 加载状态
  loadingContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: 200,
  },
  loadingText: {
    fontSize: 12.5,
    color: "#333",
    marginTop: 10,
  },
  // 空状态
  emptyContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    // height: '100%',
  },
  emptyText: {
    color: "#999",
    fontSize: 10.9375,
  },
  // 记录列表
  recordListWrapper: {
    flex: 1,
  },
  recordList: {
    marginHorizontal: 29,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  recordListInner: {
    // Note: Use LinearGradient component for gradient background
    backgroundColor: "#B3C9FF",
    borderRadius: 11.81785,
    marginHorizontal: 12.5,
    marginVertical: 12.5,
    width: "100%",
    padding: 12.5,
    shadowColor: "#FFFFFF",
    shadowOffset: { width: -3.2, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 5.2,
    elevation: 3,
  },
  // 月份组
  monthGroup: {
    marginBottom: 0,
  },
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15.625,
  },
  monthTitle: {
    fontSize: 10.9375,
    color: "#000000",
  },
  monthToggle: {
    flexDirection: "row",
    alignItems: "center",
  },
  toggleText: {
    fontSize: 7,
    color: "rgba(0, 0, 0, 0.7)",
    marginRight: 4,
  },
  // 月份记录列表
  monthList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  recordItem: {
    position: "relative",
    width: 212.2,
    marginRight: 10,
    marginBottom: 30,
    borderRadius: 5.8,
    overflow: "hidden",
    backgroundColor: "#fff",
    borderWidth: 1.8,
    borderColor: "#DDF3FF",
    shadowColor: "#9CCDFB",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 2.4,
    elevation: 2,
  },
  recordImage: {
    width: 212.2,
    height: 212.2,
  },
  scoreBadge: {
    position: "absolute",
    top: 4,
    right: 8,
    alignItems: "center",
  },
  scoreText: {
    color: "#FF2828",
    fontSize: 11.7,
    fontWeight: "bold",
  },
  scoreLine: {
    width: 14, // 横线宽度
    height: 4.4, // 图片高度
    marginTop: -2, // 分数和横线之间的间距
  },
  recordInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 4.8,
    backgroundColor: "#DDF3FF",
  },
  recordType: {
    backgroundColor: "#F1FAFF",
    borderRadius: 2.6,
    paddingHorizontal: 3,
    paddingVertical: 1.4,
  },
  recordTypeText: {
    fontSize: 7.8,
    color: "#000000",
    fontWeight: "bold",
  },
  recordTime: {
    fontSize: 7,
    color: "rgba(0, 0, 0, 0.7)",
  },
  // 月份分割线
  monthDivider: {
    height: 2,
    backgroundColor: "#eee",
    marginVertical: 20,
    marginBottom: 30,
  },
  // 空月份
  emptyMonth: {
    width: "100%",
    height: 200,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyMonthText: {
    color: "#999",
    fontSize: 28,
  },
})
