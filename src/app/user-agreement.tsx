import { useState } from "react"
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { StatusBar } from "../components/StatusBar"
import { Ionicons } from "@expo/vector-icons"
import { createStyles, rpx } from "../utils/rpxStyleSheet"
import { router } from "expo-router"

/**
 * 用户协议页面
 * 展示小褐同学智能学习桌用户服务协议
 */
export default function UserAgreementScreen() {
  return (
    <LinearGradient
      colors={["#93abff", "#e4f4ff", "#cdedff", "#ffffff"]}
      locations={[-0.1128, 0.1494, 0.8474, 1.0586]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar theme="dark" backgroundColor="transparent" translucent={true} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.agreementCard}>
          <LinearGradient
            colors={["#92DEFF", "#FFFFFF"]}
            locations={[0, 0.3515]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.cardGradient}
          >
            {/* 头部导航 */}
            <View style={styles.header}>
              <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Ionicons name="chevron-back" size={rpx(24)} color="#4891FF" />
              </TouchableOpacity>
              <Text style={styles.title}>用户协议</Text>
            </View>

            {/* 协议内容 */}
            <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
              <Text style={styles.agreementTitle}>小褐同学智能学习桌用户服务协议</Text>

              <Text style={styles.updateTime}>更新时间：2024年12月</Text>

              <Text style={styles.sectionTitle}>1. 协议的范围</Text>
              <Text style={styles.content}>
                本协议是您与小褐同学智能学习桌（以下简称"我们"）之间关于您使用小褐同学智能学习桌产品及相关服务所订立的协议。
              </Text>

              <Text style={styles.sectionTitle}>2. 服务内容</Text>
              <Text style={styles.content}>
                小褐同学智能学习桌为用户提供智能学习辅导、学习数据分析、学习计划制定、护眼提醒等功能服务。我们有权根据业务发展需要对服务内容进行调整。
              </Text>

              <Text style={styles.sectionTitle}>3. 用户注册与账号</Text>
              <Text style={styles.content}>
                3.1 用户需要注册账号才能使用相关服务。注册时应提供真实、准确、完整的个人信息。
                {"\n\n"}
                3.2 用户有义务妥善保管账号和密码，因用户原因导致的账号安全问题由用户自行承担。
                {"\n\n"}
                3.3 禁止用户将账号转让、出借给他人使用。
              </Text>

              <Text style={styles.sectionTitle}>4. 用户行为规范</Text>
              <Text style={styles.content}>
                4.1 用户在使用服务时应遵守相关法律法规，不得从事违法违规活动。{"\n\n"}
                4.2 不得利用服务进行任何可能对网络服务正常运营造成不利影响的行为。{"\n\n"}
                4.3 不得传播违法、违规、不当信息内容。
              </Text>

              <Text style={styles.sectionTitle}>5. 隐私保护</Text>
              <Text style={styles.content}>
                我们重视用户隐私保护，具体的隐私保护措施请参见《隐私政策》。我们承诺按照相关法律法规和本协议约定保护用户个人信息安全。
              </Text>

              <Text style={styles.sectionTitle}>6. 知识产权</Text>
              <Text style={styles.content}>
                小褐同学智能学习桌的所有知识产权均归我们所有。用户仅获得使用权，不得进行复制、修改、传播等侵犯知识产权的行为。
              </Text>

              <Text style={styles.sectionTitle}>7. 免责声明</Text>
              <Text style={styles.content}>
                7.1 因不可抗力、网络故障、系统维护等原因导致的服务中断，我们不承担责任。{"\n\n"}
                7.2 用户因违反本协议导致的任何损失由用户自行承担。
              </Text>

              <Text style={styles.sectionTitle}>8. 协议修改</Text>
              <Text style={styles.content}>
                我们有权根据需要修改本协议，修改后的协议将在应用内公布。用户继续使用服务即视为同意修改后的协议。
              </Text>

              <Text style={styles.sectionTitle}>9. 联系我们</Text>
              <Text style={styles.content}>
                如您对本协议有任何疑问，可通过应用内客服或邮件联系我们。
              </Text>

              <View style={styles.bottomSpace} />
            </ScrollView>
          </LinearGradient>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  )
}

const styles = createStyles({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  agreementCard: {
    position: "relative",
    backgroundColor: "transparent",
    borderRadius: 11.71857,
    margin: 15.625,
    flex: 1,
    overflow: "hidden",
  },
  cardGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 15.625,
    justifyContent: "flex-start",
    borderRadius: 11.71857,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12.5,
    paddingTop: 6.25,
  },
  backButton: {
    padding: 3.125,
    marginRight: 6.25,
  },
  title: {
    fontSize: 14.0625,
    fontWeight: "600",
    color: "#4891FF",
  },
  contentContainer: {
    flex: 1,
  },
  agreementTitle: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 9.375,
  },
  updateTime: {
    fontSize: 9.375,
    color: "#666",
    textAlign: "center",
    marginBottom: 15.625,
  },
  sectionTitle: {
    fontSize: 10.9375,
    fontWeight: "600",
    color: "#333",
    marginTop: 12.5,
    marginBottom: 6.25,
  },
  content: {
    fontSize: 9.375,
    color: "#666",
    lineHeight: 14.0625,
    marginBottom: 9.375,
  },
  bottomSpace: {
    height: 25,
  },
})
