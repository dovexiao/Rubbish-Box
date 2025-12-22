import React from "react"
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { createStyles } from "../utils/rpxStyleSheet"

interface PrivacyPolicyModalProps {
  visible: boolean
  onCancel?: () => void
}

/**
 * 隐私政策弹窗组件
 * 原封不动地把隐私政策页面的内容块放到弹窗里
 */
export const PrivacyPolicyModal = React.memo(function PrivacyPolicyModal({
  visible,
  onCancel,
}: PrivacyPolicyModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          {/* 关闭按钮 */}
          <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>

          {/* 原封不动的隐私政策内容块 */}
          <View style={styles.policyCard}>
            <LinearGradient
              colors={["#92DEFF", "#FFFFFF"]}
              locations={[0, 0.3515]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.cardGradient}
            >
              {/* 头部导航 */}
              <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={onCancel}>
                  <Ionicons name="chevron-back" size={24} color="#4891FF" />
                </TouchableOpacity>
                <Text style={styles.title}>隐私政策</Text>
              </View>

              {/* 隐私政策内容 */}
              <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
                <Text style={styles.policyTitle}>小褐同学智能学习桌隐私保护政策</Text>

                <Text style={styles.updateTime}>更新时间：2025年12月</Text>

                <Text style={styles.intro}>
                  小褐同学智能学习桌（以下简称"我们"）深知个人信息对您的重要性，并会尽全力保护您的个人信息安全可靠。我们致力于维持您对我们的信任，恪守以下原则，保护您的个人信息：权责一致原则、目的明确原则、选择同意原则、最少够用原则、确保安全原则、主体参与原则、公开透明原则等。
                </Text>

                <Text style={styles.sectionTitle}>1. 我们收集的信息</Text>
                <Text style={styles.content}>
                  1.1 账户信息：包括您的手机号码、昵称等注册信息。{"\n\n"}
                  1.2 设备信息：包括设备型号、操作系统版本、设备标识符等。{"\n\n"}
                  1.3 学习数据：包括学习时长、学习内容、学习进度等。{"\n\n"}
                  1.4 使用信息：包括应用使用情况、功能使用偏好等。
                </Text>

                <Text style={styles.sectionTitle}>2. 信息收集方式</Text>
                <Text style={styles.content}>
                  2.1 您主动提供：注册账户、使用服务时主动提供的信息。{"\n\n"}
                  2.2 自动收集：在您使用服务过程中自动收集的技术信息。{"\n\n"}
                  2.3 第三方获取：从合法的第三方获取您已同意共享的信息。
                </Text>

                <Text style={styles.sectionTitle}>3. 信息使用目的</Text>
                <Text style={styles.content}>
                  3.1 提供基础服务功能，如学习辅导、数据分析等。{"\n\n"}
                  3.2 改善和优化产品功能，提升用户体验。{"\n\n"}
                  3.3 保障账户和服务安全。{"\n\n"}
                  3.4 遵守法律法规要求。
                </Text>

                <Text style={styles.sectionTitle}>4. 信息共享与披露</Text>
                <Text style={styles.content}>
                  4.1 我们不会向第三方出售、出租、共享或交易您的个人信息。{"\n\n"}
                  4.2 以下情况除外：{"\n"}- 获得您的明确同意{"\n"}- 法律法规要求{"\n"}-
                  保护用户或公众的重大利益{"\n"}- 与我们的关联公司共享（仅限于实现服务功能）
                </Text>

                <Text style={styles.sectionTitle}>5. 信息存储</Text>
                <Text style={styles.content}>
                  5.1 存储地点：您的个人信息将存储在中华人民共和国境内。{"\n\n"}
                  5.2
                  存储期限：在您使用服务期间及之后的合理期限内存储，具体期限根据业务需要和法律要求确定。
                  {"\n\n"}
                  5.3 存储安全：我们采用行业标准的安全措施保护您的个人信息。
                </Text>

                <Text style={styles.sectionTitle}>6. 您的权利</Text>
                <Text style={styles.content}>
                  6.1 访问权：您有权了解我们收集、使用您个人信息的情况。{"\n\n"}
                  6.2 更正权：您有权要求我们更正或补充您的个人信息。{"\n\n"}
                  6.3 删除权：在特定情况下，您有权要求我们删除您的个人信息。{"\n\n"}
                  6.4 撤回同意：您有权撤回对个人信息处理的同意。
                </Text>

                <Text style={styles.sectionTitle}>7. 儿童隐私保护</Text>
                <Text style={styles.content}>
                  我们非常重视儿童个人信息的保护。如果您是14周岁以下的儿童，建议您请您的父母或监护人仔细阅读本隐私政策，并在征得您的父母或监护人同意后使用我们的服务或向我们提供信息。
                </Text>

                <Text style={styles.sectionTitle}>8. 隐私政策更新</Text>
                <Text style={styles.content}>
                  我们可能会根据服务变更以及法律法规要求更新本隐私政策。更新后的隐私政策将在应用内发布，请您定期查看。
                </Text>

                <Text style={styles.sectionTitle}>9. 联系我们</Text>
                <Text style={styles.content}>
                  如果您对本隐私政策有任何疑问、意见或建议，请通过应用内客服或邮件与我们联系。我们将在15个工作日内回复您的请求。
                </Text>

                <View style={styles.bottomSpace} />
              </ScrollView>
            </LinearGradient>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  )
})

const styles = createStyles({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingHorizontal: 40,
  },
  keyboardView: {
    flex: 1,
    justifyContent: "center" as const,
    width: "100%" as any,
  },
  closeButton: {
    position: "absolute" as const,
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    zIndex: 10,
  },
  // 原封不动的隐私政策页面样式
  policyCard: {
    position: "relative" as const,
    backgroundColor: "transparent",
    borderRadius: 11.71857,
    margin: 15.625,
    flex: 1,
    overflow: "hidden" as const,
  },
  cardGradient: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 15.625,
    justifyContent: "flex-start" as const,
    borderRadius: 11.71857,
  },
  header: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 12.5,
    paddingTop: 6.25,
  },
  backButton: {
    padding: 3.125,
    marginRight: 6.25,
  },
  title: {
    fontSize: 14.0625,
    fontWeight: "600" as const,
    color: "#4891FF",
  },
  contentContainer: {
    flex: 1,
  },
  policyTitle: {
    fontSize: 12.5,
    fontWeight: "600" as const,
    color: "#333",
    textAlign: "center" as const,
    marginBottom: 9.375,
  },
  updateTime: {
    fontSize: 9.375,
    color: "#666",
    textAlign: "center" as const,
    marginBottom: 15.625,
  },
  intro: {
    fontSize: 9.375,
    color: "#666",
    lineHeight: 14.0625,
    marginBottom: 15.625,
    textAlign: "justify" as const,
  },
  sectionTitle: {
    fontSize: 10.9375,
    fontWeight: "600" as const,
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
