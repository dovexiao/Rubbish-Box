/*
 * @Author: zdb zhiubo_1@163.com
 * @Date: 2025-09-30 13:30:13
 * @LastEditors: zdb zhiubo_1@163.com
 * @LastEditTime: 2025-10-08 10:49:32
 * @FilePath: /xhtx-app/xhtx/src/app/(tabs)/points-mall.tsx
 * @Description:
 */
import { View, Text, ImageBackground } from "react-native"
import { LinearGradient } from "expo-linear-gradient"

import { StatusBar } from "../../components/StatusBar"
import { Images } from "../../constants/Assets"
import { createStyles } from "../../utils/rpxStyleSheet"

export default function PointsMallScreen() {
  // 页面获得焦点时恢复沉浸式模式

  return (
    <LinearGradient
      colors={["#93abff", "#e4f4ff", "#cdedff", "#ffffff"]}
      locations={[-0.1128, 0.1494, 0.8474, 1.0586]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.pageContainer}
    >
      <ImageBackground source={Images.homeBg1} style={styles.backgroundImage} resizeMode="cover">
        {/* 自定义状态栏 */}
        <StatusBar theme="dark" backgroundColor="transparent" translucent={true} />

        {/* 主要内容 */}
        <View style={styles.mainContent}>
          <View style={styles.container}>
            <Text style={styles.title}>时间商城</Text>
            <Text style={styles.subtitle}>这里是时间商城页面</Text>
          </View>
        </View>
      </ImageBackground>
    </LinearGradient>
  )
}

const styles = createStyles({
  pageContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
    minWidth: "100%",
    minHeight: "100%",
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 20,
    borderRadius: 15,
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
  },
})
