import { useState } from "react"
import { View, Text, TouchableOpacity, ScrollView, Image, Alert } from "react-native"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"

import { StatusBar } from "../../components/StatusBar"
import { NavBar } from "../../components/NavBar"
import { createStyles, rpx } from "../../utils/rpxStyleSheet"

interface Badge {
  title: string
  image: string
  earned: boolean
}

/**
 * 成就徽章页面
 * 100%还原UniApp项目 /src/pages/my/badges.vue
 */
export default function BadgesScreen() {
  const router = useRouter()

  // 已获得勋章数量
  const earnedCount = 4

  // 当前激活（触摸）的勋章索引
  const [activeBadge, setActiveBadge] = useState(-1)

  // 所有徽章数据（包括已获得和未获得）
  const [allBadges] = useState<Badge[]>([
    // 前4个已获得
    {
      title: "累计学习30天",
      image: require("../../../assets/images/trophy-3d.png"),
      earned: true,
    },
    {
      title: "累计学习30天",
      image: require("../../../assets/images/trophy-3d.png"),
      earned: true,
    },
    {
      title: "累计学习30天",
      image: require("../../../assets/images/trophy-3d.png"),
      earned: true,
    },
    {
      title: "累计学习30天",
      image: require("../../../assets/images/trophy-3d.png"),
      earned: true,
    },
    // 后5个未获得
    {
      title: "累计学习60天",
      image: require("../../../assets/images/trophy-3d.png"),
      earned: false,
    },
    {
      title: "累计学习90天",
      image: require("../../../assets/images/trophy-3d.png"),
      earned: false,
    },
    {
      title: "累计学习120天",
      image: require("../../../assets/images/trophy-3d.png"),
      earned: false,
    },
    {
      title: "累计学习150天",
      image: require("../../../assets/images/trophy-3d.png"),
      earned: false,
    },
    {
      title: "累计学习180天",
      image: require("../../../assets/images/trophy-3d.png"),
      earned: false,
    },
  ])

  // 处理勋章点击
  const handleBadgeClick = (index: number) => {
    if (index < earnedCount) {
      // 已获得的勋章可以查看详情
      Alert.alert("提示", "查看勋章详情")
    } else {
      // 未获得的勋章显示获取条件
      Alert.alert("提示", "查看获取条件")
    }
  }

  return (
    <LinearGradient
      colors={["#93ABFF", "#E4F4FF", "#ECF8FF", "#FFFFFF"]}
      locations={[-0.1128, 0.1494, 0.8474, 1.0586]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.pageContainer}
    >
      <StatusBar theme="dark" />
      <NavBar title="成就徽章" leftArrow />

      <ScrollView style={styles.contentWrapper} showsVerticalScrollIndicator={false}>
        {/* 稀有徽章展示 */}
        <View style={styles.rareBadgeSection}>
          <View style={styles.rareBadgeDisplay}>
            <View style={styles.badge3d}>
              <Image
                source={require("../../../assets/images/trophy-3d.png")}
                style={styles.trophyImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.rareBadgeLabel}>
              <Text style={styles.labelText}>稀有</Text>
            </View>
            <Text style={styles.badgeName}>累计学习30天</Text>
          </View>
        </View>

        {/* 已获得徽章列表 */}
        <View style={styles.badgesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>共获得{earnedCount}枚勋章</Text>
          </View>

          <View style={styles.badgesGrid}>
            {allBadges.map((badge, index) => (
              <TouchableOpacity
                key={index}
                style={styles.badgeCard}
                onPressIn={() => setActiveBadge(index)}
                onPressOut={() => setActiveBadge(-1)}
                onPress={() => handleBadgeClick(index)}
                activeOpacity={1}
              >
                <View
                  style={[
                    styles.badgeContainer,
                    index < earnedCount ? styles.containerEarned : styles.containerNotEarned,
                    activeBadge === index && styles.containerActive,
                  ]}
                >
                  <Image
                    source={badge.image}
                    style={[
                      styles.badgeImage,
                      index < earnedCount ? styles.imageEarned : styles.imageNotEarned,
                    ]}
                    resizeMode="contain"
                  />
                </View>
                <Text
                  style={[
                    styles.badgeTitle,
                    index < earnedCount ? styles.titleEarned : styles.titleNotEarned,
                  ]}
                >
                  {badge.title}
                </Text>
              </TouchableOpacity>
            ))}
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
    padding: 12,
    flexDirection: "column",
    gap: 20,
  },
  // 稀有徽章展示区域
  rareBadgeSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    minHeight: 300,
    paddingVertical: 40,
    width: "55%",
  },
  rareBadgeDisplay: {
    flexDirection: "column",
    position: "relative",
    alignItems: "center",
    gap: 12,
  },
  badge3d: {
    position: "relative",
    width: 180,
    height: 180,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  trophyImage: {
    width: 150,
    height: 150,
  },
  rareBadgeLabel: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  labelText: {
    fontSize: 8.6,
    color: "#666",
  },
  badgeName: {
    fontSize: 9.375,
    color: "#333",
    fontWeight: "500",
    textAlign: "center",
    marginTop: 8,
  },
  // 已获得徽章区域
  badgesSection: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 8,
    padding: 6,
    marginRight: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3.90625 },
    shadowOpacity: 0.05,
    shadowRadius: 7.8125,
    elevation: 2,
  },
  sectionHeader: {
    marginBottom: 4,
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 9.375,
    color: "#333",
    fontWeight: "bold",
    textAlign: "center",
  },
  badgesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  badgeCard: {
    width: "33.33%",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    padding: 8,
  },
  badgeContainer: {
    width: 60,
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    position: "relative",
  },
  // 已获得徽章样式
  containerEarned: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  imageEarned: {
    width: 40,
    height: 40,
    opacity: 1,
  },
  titleEarned: {
    color: "#333",
  },
  // 未获得徽章样式
  containerNotEarned: {
    backgroundColor: "rgba(200, 200, 200, 0.3)",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  imageNotEarned: {
    width: 40,
    height: 40,
    opacity: 0.3,
  },
  titleNotEarned: {
    color: "#999",
  },
  // 触摸激活状态
  containerActive: {
    borderWidth: 2,
    borderColor: "#4891FF",
    shadowColor: "#4891FF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    transform: [{ scale: 1.05 }],
  },
  badgeImage: {
    width: 40,
    height: 40,
  },
  badgeTitle: {
    fontSize: 8.6,
    textAlign: "center",
    lineHeight: 1.2 * 8.6,
  },
})
