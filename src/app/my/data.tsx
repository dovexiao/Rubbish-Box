import { useState } from "react"
import { View, Text, ScrollView } from "react-native"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"

import { StatusBar } from "../../components/StatusBar"
import { NavBar } from "../../components/NavBar"
import { createStyles, rpx } from "../../utils/rpxStyleSheet"

/**
 * 学习数据页面
 * 100%还原UniApp项目 /src/pages/my/data.vue
 */
export default function MyDataScreen() {
  const router = useRouter()

  // 本周学习时长数据
  const [weeklyTimeData] = useState({
    categories: ["06-03", "06-04", "06-05", "06-06", "06-07", "06-08", "06-09"],
    data: [25, 45, 35, 82, 39, 124, 76],
  })

  // 答题难度分析数据
  const [difficultyData] = useState({
    categories: ["简单题", "一般题", "较难题"],
    correctRates: [100, 85, 98], // 正确率
    questionCounts: [0, 15, 23], // 题目数量
  })

  return (
    <LinearGradient
      colors={["#93ABFF", "#E4F4FF", "#ECF8FF", "#FFFFFF"]}
      locations={[-0.1128, 0.1494, 0.8474, 1.0586]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.pageContainer}
    >
      <StatusBar theme="dark" />
      <NavBar title="我的数据" leftArrow />

      <ScrollView style={styles.contentWrapper} showsVerticalScrollIndicator={false}>
        {/* 上部分：本周学习统计 & 当前掌握程度 */}
        <View style={styles.topSection}>
          {/* 本周学习统计 */}
          <View style={styles.studyStatsCard}>
            <Text style={styles.cardTitle}>本周共学习 469 分钟</Text>

            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>错题</Text>
                <View style={styles.statValueRow}>
                  <Text style={styles.statNumber}>30</Text>
                  <Ionicons
                    name="chevron-down"
                    size={rpx(12)}
                    color="#999"
                    style={styles.statIcon}
                  />
                </View>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statLabel}>阅读时长</Text>
                <View style={styles.statValueRow}>
                  <Text style={styles.statNumber}>6</Text>
                  <Text style={styles.statUnit}>时</Text>
                  <Text style={[styles.statNumber, styles.statNumberMargin]}>21</Text>
                  <Text style={styles.statUnit}>分</Text>
                  <Ionicons
                    name="chevron-up"
                    size={rpx(12)}
                    color="#999"
                    style={styles.statIcon}
                  />
                </View>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statLabel}>正确坐姿</Text>
                <View style={styles.statValueRow}>
                  <Text style={styles.statNumber}>12</Text>
                  <Text style={styles.statUnit}>时</Text>
                  <Ionicons
                    name="chevron-down"
                    size={rpx(12)}
                    color="#999"
                    style={styles.statIcon}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* 当前掌握程度 */}
          <View style={styles.masteryCard}>
            <Text style={styles.cardTitle}>当前掌握程度</Text>

            <View style={styles.masteryContent}>
              {/* 圆形进度图 - TODO: 使用图表组件 */}
              <View style={styles.progressCircle}>
                <View style={styles.progressPlaceholder}>
                  <Text style={styles.progressText}>40%</Text>
                </View>
              </View>

              <View style={styles.masteryDetails}>
                <View style={styles.detailItem}>
                  <View style={[styles.dot, styles.dotMastered]} />
                  <Text style={styles.detailLabel}>掌握考点：</Text>
                  <Text style={styles.detailValue}>9个</Text>
                </View>
                <View style={styles.detailItem}>
                  <View style={[styles.dot, styles.dotLearned]} />
                  <Text style={styles.detailLabel}>已学考点：</Text>
                  <Text style={styles.detailValue}>9个</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* 下部分：本周学习时长图表 & 答题难度分析 */}
        <View style={styles.bottomSection}>
          {/* 本周学习时长 */}
          <View style={styles.timeChartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.cardTitle}>本周学习时长</Text>
              <Text style={styles.chartUnit}>单位：分钟</Text>
            </View>
            {/* TODO: 使用WeeklyTimeChart组件 */}
            <View style={styles.chartPlaceholder}>
              <Text style={styles.chartPlaceholderText}>图表开发中</Text>
            </View>
          </View>

          {/* 答题难度分析 */}
          <View style={styles.difficultyChartCard}>
            <Text style={styles.cardTitle}>答题难度分析</Text>
            {/* TODO: 使用DifficultyChart组件 */}
            <View style={styles.chartPlaceholder}>
              <Text style={styles.chartPlaceholderText}>图表开发中</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  )
}

const styles = createStyles({
  pageContainer: {
    width: "100%",
    height: "100%",
    minWidth: 750,
    minHeight: "100%",
    overflowX: "hidden",
  },
  contentWrapper: {
    paddingHorizontal: 29,
    paddingVertical: 12,
    flexDirection: "column",
    gap: 12,
  },
  // 上部分
  topSection: {
    flexDirection: "row",
    gap: 12,
  },
  studyStatsCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3.90625 },
    shadowOpacity: 0.05,
    shadowRadius: 7.8125,
    elevation: 2,
  },
  masteryCard: {
    width: 334.375,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3.90625 },
    shadowOpacity: 0.05,
    shadowRadius: 7.8125,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 9.375,
    color: "#333",
    fontWeight: "bold",
    marginBottom: 6,
  },
  // 学习统计网格
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 40,
  },
  statItem: {
    flexDirection: "column",
    alignItems: "center",
    flex: 1,
  },
  statLabel: {
    fontSize: 8.6,
    color: "#666",
  },
  statValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginTop: 4,
  },
  statNumber: {
    fontSize: 9.375,
    color: "#333",
    fontWeight: "bold",
  },
  statNumberMargin: {
    marginLeft: 2,
  },
  statUnit: {
    fontSize: 8.6,
    color: "#666",
  },
  statIcon: {
    marginLeft: 2,
  },
  // 掌握程度
  masteryContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  progressCircle: {
    width: 100,
    height: 100,
    flexShrink: 0,
  },
  progressPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
  },
  progressText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
  },
  masteryDetails: {
    flexDirection: "column",
    gap: 6,
    flex: 1,
    marginLeft: 80,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotMastered: {
    backgroundColor: "#666",
  },
  dotLearned: {
    backgroundColor: "#ccc",
  },
  detailLabel: {
    fontSize: 8.6,
    color: "#666",
  },
  detailValue: {
    fontSize: 8.6,
    color: "#333",
  },
  // 下部分
  bottomSection: {
    flexDirection: "row",
    gap: 12,
  },
  timeChartCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 8,
    padding: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3.90625 },
    shadowOpacity: 0.05,
    shadowRadius: 7.8125,
    elevation: 2,
  },
  difficultyChartCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 8,
    padding: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3.90625 },
    shadowOpacity: 0.05,
    shadowRadius: 7.8125,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  chartUnit: {
    fontSize: 8.6,
    color: "#666",
  },
  chartPlaceholder: {
    height: 150,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
  },
  chartPlaceholderText: {
    fontSize: 12,
    color: "#999",
  },
})
