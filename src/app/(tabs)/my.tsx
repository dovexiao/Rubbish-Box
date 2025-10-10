import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { useRouter } from "expo-router"

export default function MyScreen() {
  const router = useRouter()

  const handleLogout = () => {
    // 简单的退出登录逻辑
    router.replace("/login")
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>我的</Text>
      <Text style={styles.subtitle}>这里是个人中心页面</Text>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>退出登录</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 40,
  },
  logoutButton: {
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
})
