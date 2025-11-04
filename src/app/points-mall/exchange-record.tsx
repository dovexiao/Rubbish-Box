import { useState, useCallback, useEffect } from "react"
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"

import { StatusBar } from "../../components/StatusBar"
import { ConfirmDialog } from "../../components/ConfirmDialog"
import { createStyles } from "../../utils/rpxStyleSheet"
import { showError, showSuccess } from "../../utils/toast"
import {
  getExchangeRecords,
  deleteExchangeRecord,
  type ExchangeRecordItem,
  type ExchangeRecordsResponse,
} from "../../services/pointsMall"

export default function ExchangeRecordScreen() {
  const router = useRouter()
  const [records, setRecords] = useState<ExchangeRecordItem[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasNext, setHasNext] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancelingItem, setCancelingItem] = useState<ExchangeRecordItem | null>(null)
  const perPage = 10

  // 格式化日期
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")
    return `${month}月${day}日${hours}:${minutes}`
  }

  // 加载兑换记录
  const loadExchangeRecords = useCallback(async (append: boolean = false) => {
    if (loading) return
    setLoading(true)

    try {
      const res: ExchangeRecordsResponse = await getExchangeRecords({
        page: append ? (currentPage + 1).toString() : "1",
        per_page: perPage.toString(),
      })

      if (res && res.records) {
        if (append) {
          setRecords((prev) => [...prev, ...res.records])
          setCurrentPage((prev) => prev + 1)
        } else {
          setRecords(res.records)
          setCurrentPage(1)
        }
        setHasNext(res.has_next)
      }
    } catch (error) {
      console.error("获取兑换记录失败:", error)
      showError("获取数据失败，请重试")
    } finally {
      setLoading(false)
    }
  }, [loading, currentPage, perPage])

  // 取消订单
  const cancelOrder = useCallback((item: ExchangeRecordItem) => {
    setCancelingItem(item)
    setShowCancelDialog(true)
  }, [])

  // 确认取消订单
  const handleConfirmCancel = useCallback(async () => {
    if (!cancelingItem) return

    try {
      await deleteExchangeRecord({ record_id: cancelingItem.id })
      showSuccess("订单已取消")
      setShowCancelDialog(false)
      setCancelingItem(null)
      // 刷新列表
      loadExchangeRecords()
    } catch (error) {
      console.error("取消订单失败:", error)
      showError("取消失败，请重试")
    }
  }, [cancelingItem, loadExchangeRecords])

  // 关闭取消对话框
  const handleCloseCancelDialog = useCallback(() => {
    setShowCancelDialog(false)
    setCancelingItem(null)
  }, [])

  // 查看物流
  const trackOrder = useCallback((item: ExchangeRecordItem) => {
    showError("查看物流功能开发中")
  }, [])

  // 滚动加载更多
  const handleScroll = useCallback(
    ({ nativeEvent }: any) => {
      const { layoutMeasurement, contentOffset, contentSize } = nativeEvent
      const paddingToBottom = 100
      if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
        if (hasNext && !loading) {
          loadExchangeRecords(true)
        }
      }
    },
    [hasNext, loading, loadExchangeRecords],
  )

  // 初始加载
  useEffect(() => {
    loadExchangeRecords()
  }, [])

  return (
    <LinearGradient
      colors={["#93abff", "#e4f4ff", "#cdedff", "#ffffff"]}
      locations={[-0.1128, 0.1494, 0.8474, 1.0586]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* 自定义状态栏 */}
      <StatusBar theme="dark" backgroundColor="transparent" translucent={true} />

      {/* 顶部导航 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>兑换记录</Text>
        <View style={styles.placeholder} />
      </View>

      {/* 记录列表 */}
      <ScrollView
        style={styles.scrollContainer}
        onScroll={handleScroll}
        scrollEventThrottle={400}
      >
        <View style={styles.recordList}>
          {records.length === 0 && !loading && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>暂无兑换记录</Text>
            </View>
          )}

          {records.map((item) => (
            <View key={item.id} style={styles.recordItem}>
              <Image
                source={{ uri: item.image }}
                style={styles.itemImage}
                resizeMode="cover"
              />
              <View style={styles.itemContent}>
                <View style={styles.itemTop}>
                  <View style={styles.topRow}>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {item.product_name}
                    </Text>
                    <Text style={styles.itemStatus}>{item.status_display}</Text>
                  </View>
                  <View style={styles.middleRow}>
                    <View style={styles.pointsRow}>
                      <Image
                        source={require("../../../assets/images/coin.png")}
                        style={styles.pointsIcon}
                        resizeMode="contain"
                      />
                      <Text style={styles.pointsAmount}>
                        {Math.abs(item.change_amount)}
                      </Text>
                    </View>
                    <Text style={styles.logisticsStatus}>
                      {item.logistics_status_display}
                    </Text>
                  </View>
                  <View style={styles.dateRow}>
                    <Text style={styles.itemDate}>{formatDate(item.created_at)}</Text>
                  </View>
                </View>
                <View style={styles.itemBottom}>
                  {item.logistics_status_display === "待发货" && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => cancelOrder(item)}
                    >
                      <Text style={styles.actionButtonText}>取消订单</Text>
                    </TouchableOpacity>
                  )}
                  {item.logistics_status_display === "运输中" && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => trackOrder(item)}
                    >
                      <Text style={styles.actionButtonText}>查看物流</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          ))}

          {/* 加载状态 */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#666" />
              <Text style={styles.loadingText}>加载中...</Text>
            </View>
          )}

          {/* 没有更多数据 */}
          {!hasNext && records.length >= perPage && !loading && (
            <View style={styles.noMoreContainer}>
              <Text style={styles.noMoreText}>没有更多数据了</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 取消订单确认对话框 */}
      <ConfirmDialog
        visible={showCancelDialog}
        title="确认取消"
        message="确定要取消订单？"
        confirmText="确定"
        cancelText="取消"
        onConfirm={handleConfirmCancel}
        onCancel={handleCloseCancelDialog}
      />
    </LinearGradient>
  )
}

const styles = createStyles({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 45,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backBtn: {
    padding: 5,
  },
  title: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  placeholder: {
    width: 34,
  },
  scrollContainer: {
    flex: 1,
  },
  recordList: {
    paddingHorizontal: 15,
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 10,
    color: "#999",
  },
  recordItem: {
    flexDirection: "row",
    backgroundColor: "rgba(254, 255, 255, 0.8)",
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
  },
  itemImage: {
    width: 55,
    height: 55,
    borderRadius: 4,
    flexShrink: 0,
    marginRight: 8,
  },
  itemContent: {
    flex: 1,
  },
  itemTop: {
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
    paddingBottom: 6,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  itemName: {
    fontSize: 8.6,
    color: "#000",
    flex: 1,
    marginRight: 8,
  },
  itemStatus: {
    fontSize: 8.6,
    color: "#000",
  },
  middleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  pointsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  pointsIcon: {
    width: 10,
    height: 10,
    marginRight: 2,
  },
  pointsAmount: {
    fontSize: 10,
    fontWeight: "600",
    color: "#2260FF",
  },
  logisticsStatus: {
    fontSize: 8.6,
    color: "#2260FF",
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  itemDate: {
    fontSize: 7.5,
    color: "rgba(0, 0, 0, 0.5)",
  },
  itemBottom: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    height: 27,
  },
  actionButton: {
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.3)",
    paddingVertical: 4,
    paddingHorizontal: 7,
    borderRadius: 10,
    backgroundColor: "transparent",
  },
  actionButtonText: {
    fontSize: 8.6,
    color: "rgba(0, 0, 0, 0.8)",
    lineHeight: 10,
  },
  loadingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    gap: 8,
  },
  loadingText: {
    fontSize: 7.5,
    color: "#666",
  },
  noMoreContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
  },
  noMoreText: {
    fontSize: 7.5,
    color: "#999",
  },
})
