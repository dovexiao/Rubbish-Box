import { Modal, View, Text, TouchableOpacity, ScrollView, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { createStyles } from "../../utils/rpxStyleSheet"

interface CurrencyGuidePopupProps {
  visible: boolean
  onClose: () => void
}

/**
 * 货币指南弹窗
 */
export function CurrencyGuidePopup({ visible, onClose }: CurrencyGuidePopupProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.popupContainer}>
          <View style={styles.popup}>
            {/* 标题 */}
            <View style={styles.header}>
              <Text style={styles.title}>货币指南</Text>
            </View>

            {/* 内容 */}
            <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
              <View style={styles.content}>
              {/* 一、时间货币 */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>一、时间货币</Text>
                <Text style={styles.sectionText}>
                  时间货币为小褐同学回馈个人用户的权益奖励，时间货币不具有货币或现金价值，不可兑现，不可转让。用户可以通过学习时间和货币奖励活动等方式来获取时间货币，时间货币，具体以权益兑换页面展示为准。
                </Text>
              </View>

              {/* 二、时间货币领取规则 */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>二、时间货币领取规则</Text>
                <Text style={styles.sectionText}>
                  时间货币发放后，用户可前往"时间货币商城"查看。
                </Text>
              </View>

              {/* 三、时间货币获取方式 */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>三、时间货币获取方式</Text>
                <Text style={styles.sectionText}>
                  用户通过使用小褐同学学习系统进行学习，累计学习时间获取。累计时间每保持正确坐姿10分钟后将会获得1个时间货币。具体以"时间货币商城"页面提示为准。
                </Text>
                <Text style={styles.warningText}>温馨提示：</Text>
                <Text style={styles.sectionText}>
                  如遇系统繁忙、交易异常等情况，时间货币将延迟发放。
                </Text>
              </View>

              {/* 四、时间货币有效期 */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>四、时间货币有效期</Text>
                <Text style={styles.sectionText}>
                  用户获得的时间货币有效期为自获得当月起的12个自然月，有效期内未使用的时间货币到期将自动清零，不予补发。
                </Text>
                <Text style={styles.warningText}>温馨提示：</Text>
                <Text style={styles.sectionText}>
                  1、用户日常使用的时间货币，将优先使用即将过期的时间货币。
                </Text>
                <Text style={styles.sectionText}>
                  2、每月，用户可在"时间货币商城"-"时间货币"页查看当月月底即将过期的时间货币。
                </Text>
              </View>

              {/* 五、时间货币权益兑换 */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>五、时间货币权益兑换</Text>
                <Text style={styles.subTitle}>1、兑换规则</Text>
                <Text style={styles.sectionText}>
                  （1）用户可使用时间货币在相应页面或按照相应活动规则兑换权益，权益随机展示，兑换要求、使用规则等详情具体以页面展示为准。
                </Text>
                <Text style={styles.sectionText}>
                  （2）请用户理解，由于受限于库存数量，我们的权益兑完即止，先兑先得。
                </Text>
                <Text style={styles.subTitle}>2、权益说明</Text>
                <Text style={styles.sectionText}>
                  权益为实物商品的，用户在兑换/付费后，请在指定页面注意填写正确有效的收货信息。因用户填写信息不详、错误，或发生变更未能及时通知权益提供方，或无人收货等原因造成延迟送达、未能送达均由用户自行负责。
                </Text>
              </View>

              {/* 六、其他说明 */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>六、其他说明</Text>
                <Text style={styles.sectionText}>
                  1、如用户存在违规刷时间货币行为（包括但不限于虚假交易、炒信、恶意追款、拆单、套现），我们有权取消用户获得时间货币的资格，已领取的时间货币将被扣回。
                </Text>
                <Text style={styles.sectionText}>
                  2、为了进一步改善用户体验，我们将不时更新时间货币服务的内容，时间货币规则也可能会随之更新，我们会以公告、客户端通知、短信或弹窗等方式（统称"通知"）就更新内容向您进行告知，更新内容将在前述通知指定日期开始生效。若您不同意更新后内容，您有权停止使用相关服务；双方协商一致的，也可另行变更相关服务对应内容。您也可以随时在本页面查阅时间货币规则的最新版本。
                </Text>
                <Text style={styles.sectionText}>
                  3、本时间货币活动开展期间，如出现不可抗力等情况，例如发生自然灾害事件、遭受网络攻击或电信故障、停机维护、疫情、活动受法律法规、监管机构要求或政策指令需要停止等特殊或调整，活动主办方单方有保、中止或终止提供服务的，可免于承担责任。
                </Text>
              </View>
            </View>
          </ScrollView>
          </View>

          {/* 关闭按钮 */}
          {/* <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <View style={styles.closeIconWrapper}>
              <Ionicons name="close" size={24} color="#666" />
            </View>
          </TouchableOpacity> */}
        </View>
      </View>
    </Modal>
  )
}

const styles = createStyles({
  container: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    position: "relative" as const,
  },
  overlay: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1,
  },
  popupContainer: {
    width: 358.984375, // 919
    height: 345.3125, // 884
    justifyContent: "center" as const,
    alignItems: "center" as const,
    backgroundColor: "rgba(255, 250, 236, 1)",
    borderRadius: 12, // 30
    overflow: "hidden" as const,
    zIndex: 2,
    position: "relative" as const,
  },
  popup: {
    width: '100%' as const,
    height: '100%' as const,
  },
  header: {
    width: '100%' as const,
    paddingTop: 20.3125, // 52
    paddingBottom: 9.375, // 24
    alignItems: "center" as const,
  },
  title: {
    fontFamily: 'kingnam_bobo',
    fontSize: 12.5, // 32
    fontWeight: "400" as const,
    color: "#FF9000",
  },
  scrollContent: {
    flex: 1,
    width: '100%' as const,
  },
  content: {
    paddingHorizontal: 26.171875, // 67
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "600" as const,
    color: "#333",
    // marginBottom: 6,
    lineHeight: 16,
  },
  subTitle: {
    fontSize: 9,
    fontWeight: "600" as const,
    color: "#333",
    marginTop: 6,
    // marginBottom: 4,
    // lineHeight: 13,
  },
  sectionText: {
    fontSize: 8.6,
    color: "#666",
    lineHeight: 16,
    marginBottom: 4,
  },
  warningText: {
    fontSize: 8.6,
    color: "#FF9000",
    lineHeight: 16,
    // marginTop: 4,
    // marginBottom: 4,
  },
  closeButton: {
    marginTop: 6,
  },
  closeIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
})

