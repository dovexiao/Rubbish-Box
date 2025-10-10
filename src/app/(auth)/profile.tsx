import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native"
import { useUserStore } from "../../stores/userStore"
import { StatusBar } from "../../components/StatusBar"
import { useRouter } from "expo-router"
import { Icons, Images } from "../../constants/Assets"

/**
 * 用户资料页面
 * 需要登录才能访问，放在(auth)组下
 */
export default function ProfileScreen() {
  const userStore = useUserStore()
  const router = useRouter()
  const [userInfo, setUserInfo] = useState<any>({})

  useEffect(() => {
    const loadUserInfo = async () => {
      const info = await userStore.getUserInfo()
      setUserInfo(info)
    }
    
    loadUserInfo()
  }, [])

  const handleLogout = () => {
    userStore.logout()
    router.replace("/login")
  }

  return (
    <View style={[styles.container, { backgroundColor: "#e4f4ff" }]}>
      <StatusBar theme="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Image 
            source={Icons.back}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>个人资料</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.avatarSection}>
          <Image
            source={
              userInfo.gender
                ? Images.userAvatarGirl
                : Images.userAvatarBoy
            }
            style={styles.avatar}
          />
          <Text style={styles.username}>{userInfo.username || "用户名"}</Text>
        </View>
        
        <View style={styles.infoCard}>
          <InfoItem label="年级" value={userInfo.grade || "未设置"} />
          <InfoItem label="学习天数" value={`${userInfo.study_days || 0}天`} />
          <InfoItem label="学习时长" value={`${userInfo.total_duration || 0}小时`} />
          <InfoItem label="学习等级" value={userInfo.rank || "初级学者"} />
        </View>
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>退出登录</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

// 信息项组件
function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 10,
  },
  backIcon: {
    width: 20,
    height: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  username: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  infoCard: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  infoLabel: {
    fontSize: 16,
    color: "#666",
  },
  infoValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  logoutButton: {
    backgroundColor: "#FF6B6B",
    borderRadius: 8,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
})
