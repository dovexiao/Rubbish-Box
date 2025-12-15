import { useState } from "react"
import { View, Text, Image } from "react-native"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"

import { StatusBar } from "../../components/StatusBar"
import { NavBar } from "../../components/NavBar"
import { createStyles, rpx } from "../../utils/rpxStyleSheet"
import { useUserStore } from "../../stores/userStore"

/**
 * 个人信息编辑页面
 * 100%还原UniApp项目 /src/pages/my/edit.vue
 */
export default function MyEditScreen() {
  const router = useRouter()
  const userStore = useUserStore()

  const [user] = useState({
    avatar: (userStore as any).userInfo?.avatar || "/static/images/user-avatar.png",
    name: (userStore as any).userInfo?.nickname || "小褐同学",
    gender: (userStore as any).userInfo?.gender || "女",
    birthday: (userStore as any).userInfo?.birthday || "2024-1-1",
    grade: (userStore as any).userInfo?.grade || "三年级",
    location: (userStore as any).userInfo?.location || "浙江省 杭州市",
  })

  const leftInfo = [
    { label: "昵称", value: user.name },
    { label: "性别", value: user.gender },
    { label: "生日", value: user.birthday },
  ]

  const rightInfo = [
    { label: "年级", value: user.grade },
    { label: "所在地", value: user.location },
  ]

  return (
    <LinearGradient
      colors={["#93ABFF", "#E4F4FF", "#ECF8FF", "#FFFFFF"]}
      locations={[-0.1128, 0.1494, 0.8474, 1.0586]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.pageContainer}
    >
      <View style={styles.header}>
        <StatusBar theme="dark" />
        <NavBar title="编辑信息" leftArrow />
        <View style={styles.avatarArea}>
          <Image
            source={
              user.avatar.startsWith("/")
                ? require("../../../assets/images/user-avatar.png")
                : { uri: user.avatar }
            }
            style={styles.avatar}
            resizeMode="cover"
          />
        </View>
      </View>

      <View style={styles.infoCards}>
        {/* 左侧信息卡片 */}
        <View style={styles.infoCard}>
          {leftInfo.map((item) => (
            <View key={item.label} style={styles.infoRow}>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={styles.value}>{item.value}</Text>
            </View>
          ))}
        </View>

        {/* 右侧信息卡片 */}
        <View style={styles.infoCard}>
          {rightInfo.map((item) => (
            <View key={item.label} style={styles.infoRow}>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={styles.value}>{item.value}</Text>
            </View>
          ))}
        </View>
      </View>
    </LinearGradient>
  )
}

const styles = createStyles({
  pageContainer: {
    width: "100%",
    height: 468.75,
    minWidth: 750,
    minHeight: 468.75,
    padding: 0,
  },
  header: {
    width: "100%",
  },
  avatarArea: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 46.88,
  },
  avatar: {
    width: 48.13,
    height: 48.13,
    borderRadius: 24.065,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#E4F4FF",
  },
  infoCards: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 46.88,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 15.63,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3.13 },
    shadowOpacity: 0.03,
    shadowRadius: 6.25,
    elevation: 1,
    marginHorizontal: 15.63,
    paddingHorizontal: 31.25,
    paddingVertical: 23.44,
    minWidth: 234.38,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18.75,
  },
  label: {
    color: "#888",
    fontSize: 23.44,
  },
  value: {
    color: "#222",
    fontSize: 23.44,
  },
})
