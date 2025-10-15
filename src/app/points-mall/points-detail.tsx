import { View, Text, ScrollView, ActivityIndicator } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useState, useCallback } from "react"
import { useFocusEffect } from "expo-router"

import { StatusBar } from "../../components/StatusBar"
import { NavBar } from "../../components/NavBar"
import { createStyles } from "../../utils/rpxStyleSheet"
import { getPoints, type PointsItem } from "../../services/pointsMall"

export default function PointsDetailScreen() {
  const [pointsList, setPointsList] = useState<PointsItem[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [_totalPages, setTotalPages] = useState(1)
  const [hasNext, setHasNext] = useState(false)
  const perPage = 20

  // 加载积分明细
  const loadGetPoints = useCallback(
    async (append: boolean = false) => {
      if (loading) return

      setLoading(true)
      try {
        const res = await getPoints({
          page: currentPage,
          per_page: perPage,
        })

        if (res) {
          if (append) {
            setPointsList((prev) => [...prev, ...res.points_list])
          } else {
            setPointsList(res.points_list)
          }

          setCurrentPage(res.current_page)
          setTotalPages(res.total_pages)
          setHasNext(res.has_next)
        }
      } catch (error) {
        console.error("获取积分明细失败:", error)
      } finally {
        setLoading(false)
      }
    },
    [loading, currentPage, perPage],
  )

  // 滚动到底部加载更多
  const onScrollToLower = useCallback(() => {
    if (hasNext && !loading) {
      setCurrentPage((prev) => prev + 1)
      loadGetPoints(true)
    }
  }, [hasNext, loading, loadGetPoints])

  // 页面获得焦点时加载数据
  useFocusEffect(
    useCallback(() => {
      loadGetPoints()
    }, []),
  )

  return (
    <View style={styles.container}>
      <StatusBar theme="dark" backgroundColor="transparent" translucent={true} />
      <NavBar title="时间货币明细" />

      <LinearGradient colors={["#f0f8ff", "#f0f8ff"]} style={styles.content}>
        <ScrollView
          style={styles.scrollView}
          onScroll={({ nativeEvent }) => {
            const { layoutMeasurement, contentOffset, contentSize } = nativeEvent
            const paddingToBottom = 50
            if (
              layoutMeasurement.height + contentOffset.y >=
              contentSize.height - paddingToBottom
            ) {
              onScrollToLower()
            }
          }}
          scrollEventThrottle={400}
        >
          <View style={styles.detailList}>
            {pointsList.map((item, index) => (
              <View key={index} style={styles.detailItem}>
                <View style={styles.itemLeft}>
                  <Text style={styles.itemDescription}>{item.type_display}</Text>
                  <Text style={styles.itemDate}>{item.created_at}</Text>
                </View>
                <Text style={styles.itemPoints}>{item.points}</Text>
              </View>
            ))}

            {/* 加载状态 */}
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#1890ff" />
                <Text style={styles.loadingText}>加载中...</Text>
              </View>
            )}

            {/* 没有更多数据 */}
            {!hasNext && pointsList.length > 0 && !loading && (
              <View style={styles.noMoreContainer}>
                <Text style={styles.noMoreText}>没有更多数据了</Text>
              </View>
            )}

            {/* 空状态 */}
            {pointsList.length === 0 && !loading && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>暂无积分明细</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  )
}

const styles = createStyles({
  container: {
    flex: 1,
    backgroundColor: "#f0f8ff",
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  detailList: {
    backgroundColor: "#fff",
    marginTop: 10,
    paddingHorizontal: 15,
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  itemLeft: {
    flexDirection: "column",
  },
  itemDescription: {
    fontSize: 16,
    color: "#333",
  },
  itemDate: {
    fontSize: 12,
    color: "#999",
    marginTop: 5,
  },
  itemPoints: {
    fontSize: 11.7188,
    fontWeight: "bold",
    color: "#333",
  },
  loadingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    gap: 8,
  },
  loadingText: {
    fontSize: 11.7188,
    color: "#999",
  },
  noMoreContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  noMoreText: {
    fontSize: 11.7188,
    color: "#999",
  },
  emptyContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
  },
})

