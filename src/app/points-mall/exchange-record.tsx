import { View, Text, Image, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useState, useCallback } from "react"
import { useFocusEffect } from "expo-router"

import { StatusBar } from "../../components/StatusBar"
import { NavBar } from "../../components/NavBar"
import { createStyles } from "../../utils/rpxStyleSheet"
import {
  getExchangeRecords,
  deleteExchangeRecord,
  type ExchangeRecordItem,
} from "../../services/pointsMall"

export default function ExchangeRecordScreen() {
  const [exchangeRecords, setExchangeRecords] = useState<ExchangeRecordItem[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [_totalPages, setTotalPages] = useState(1)
  const [hasNext, setHasNext] = useState(false)
  const perPage = 5

  // 加载兑换记录
  const loadExchangeRecords = useCallback(
    async (append: boolean = false) => {
      if (loading) return

      setLoading(true)
      try {
        const res = await getExchangeRecords({
          page: currentPage,
          per_page: perPage,
        })

        if (res) {
          if (append) {
            setExchangeRecords((prev) => [...prev, ...res.records])
          } else {
            setExchangeRecords(res.records)
          }

          setCurrentPage(res.current_page)
          setTotalPages(res.total_pages)
          setHasNext(res.has_next)
        }
      } catch (error) {
        console.error("获取兑换记录失败:", error)
        Alert.alert("提示", "获取数据失败")
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
      loadExchangeRecords(true)
    }
  }, [hasNext, loading, loadExchangeRecords])

  // 格式化日期
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
  }

  // 取消订单
  const cancelOrder = useCallback(
    (item: ExchangeRecordItem) => {
      Alert.alert("确认取消", "确定要取消订单？", [
        {
          text: "取消",
          style: "cancel",
        },
        {
          text: "确定",
          onPress: async () => {
            try {
              await deleteExchangeRecord({
                record_id: item.id,
              })

              setExchangeRecords((prev) => prev.filter((record) => record.id !== item.id))
              Alert.alert("提示", "订单已取消")
              setCurrentPage(1)
              loadExchangeRecords()
            } catch (error) {
              console.error("取消订单失败:", error)
              Alert.alert("提示", "取消失败，请重试")
            }
          },
        },
      ])
    },
    [loadExchangeRecords],
  )

  // 查看物流
  const trackOrder = useCallback((_item: ExchangeRecordItem) => {
    Alert.alert("提示", "查看物流功能开发中")
  }, [])

  // 页面获得焦点时加载数据
  useFocusEffect(
    useCallback(() => {
      loadExchangeRecords()
    }, []),
  )

  return (
    <LinearGradient
      colors={["#93abff", "#e4f4ff", "#cdedff", "#ffffff"]}
      locations={[-0.1128, 0.1494, 0.8474, 1.0586]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar theme="dark" backgroundColor="transparent" translucent={true} />
      <NavBar title="兑换记录" />

      <ScrollView
        style={styles.scrollContainer}
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent
          const paddingToBottom = 50
          if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
            onScrollToLower()
          }
        }}
        scrollEventThrottle={400}
      >
        <View style={styles.recordList}>
          {/* 空状态 */}
          {exchangeRecords.length === 0 && !loading && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>暂无兑换记录</Text>
            </View>
          )}

          {exchangeRecords.map((item) => (
            <View key={item.id} style={styles.recordItem}>
              <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="cover" />
              <View style={styles.itemContent}>
                <View style={styles.itemTopSection}>
                  <View style={styles.itemRow}>
                    <Text style={styles.itemName}>{item.product_name}</Text>
                    <Text style={styles.itemStatus}>{item.status_display}</Text>
                  </View>
                  <View style={styles.itemRow2}>
                    <View style={styles.itemPointsRow}>
                      <Image
                        source={require("../../../assets/images/balance-icon.png")}
                        style={styles.balanceIcon}
                        resizeMode="contain"
                      />
                      <Text style={styles.itemPoints}>{Math.abs(item.change_amount)}</Text>
                    </View>
                    <Text style={styles.itemLogisticsStatus}>{item.logistics_status_display}</Text>
                  </View>
                  <View style={styles.itemRow3}>
                    <Text style={styles.itemDate}>{formatDate(item.created_at)}</Text>
                  </View>
                </View>
                <View style={styles.itemRight}>
                  {item.logistics_status_display === "待发货" && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => cancelOrder(item)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.actionButtonText}>取消订单</Text>
                    </TouchableOpacity>
                  )}
                  {item.logistics_status_display === "运输中" && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => trackOrder(item)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.actionButtonText}>查看物流</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          ))}

          {/* 加载状态指示器 */}
          {loading && (
            <View style={styles.loadingIndicator}>
              <ActivityIndicator size="small" color="#1890ff" />
              <Text style={styles.loadingText}>加载中...</Text>
            </View>
          )}

          {/* 没有更多数据 */}
          {!hasNext && exchangeRecords.length >= perPage && !loading && (
            <View style={styles.noMore}>
              <Text style={styles.noMoreText}>没有更多数据了</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  )
}

const styles = createStyles({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  recordList: {
    marginHorizontal: 36.71875,
    color: "#000",
  },
  emptyState: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
  },
  recordItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(254, 255, 255, 0.8)",
    borderRadius: 7.84,
    paddingTop: 14.0625,
    paddingHorizontal: 16.40625,
    marginTop: 9.375,
  },
  itemImage: {
    width: 109.375,
    height: 109.375,
    borderRadius: 6.25,
    flexShrink: 0,
  },
  itemContent: {
    flex: 1,
    marginLeft: 10,
  },
  itemTopSection: {
    paddingBottom: 9.375,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemName: {
    fontSize: 13.28125,
    color: "#000",
  },
  itemStatus: {
    fontSize: 13.28125,
    color: "#000",
  },
  itemRow2: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 3,
  },
  itemPointsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  balanceIcon: {
    width: 15.6265,
    height: 15.6265,
  },
  itemPoints: {
    fontSize: 15.6265,
    paddingLeft: 2,
    fontWeight: "bold",
    color: "#2260FF",
  },
  itemLogisticsStatus: {
    fontSize: 13.28125,
    color: "#2260FF",
  },
  itemRow3: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 3,
  },
  itemDate: {
    fontSize: 11.7188,
    color: "rgba(0, 0, 0, 0.5)",
  },
  itemRight: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    height: 42.96875,
  },
  actionButton: {
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.3)",
    paddingVertical: 6.25,
    paddingHorizontal: 10.9375,
    backgroundColor: "transparent",
    borderRadius: 15.625,
  },
  actionButtonText: {
    fontSize: 12,
    color: "rgba(0, 0, 0, 0.8)",
  },
  loadingIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    marginVertical: 30,
    gap: 8,
  },
  loadingText: {
    fontSize: 11.7188,
    color: "#1890ff",
  },
  noMore: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    marginVertical: 30,
  },
  noMoreText: {
    fontSize: 12,
    color: "#999",
  },
})

