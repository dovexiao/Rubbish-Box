import { View, Text, Image } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { createStyles, rpx } from "../../utils/rpxStyleSheet"
import { Images } from "../../constants/Assets"

export function KnowledgeExplorerCard() {
  return (
    <View style={styles.card}>
    
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitleBig}>知识探索者</Text>
        </View>
        <View style={styles.knowledgeContent}>
          <Text style={styles.knowledgeLabel}>本周共学习</Text>
          <View style={styles.timeRow}>
            <Text style={styles.timeValue}>1290</Text>
            <Text style={styles.timeUnit}>分钟</Text>
          </View>
          <View style={styles.compareRow}>
            <Text style={styles.compareText}>超过了</Text>
            <Text style={styles.compareHighlight}>76%</Text>
            <Text style={styles.compareText}>的优秀同学</Text>
          </View>
          <Text style={styles.legoText}>相当于拼完 21 套乐高积木，知识像积木一样越拼越完整</Text>
          <View style={styles.reportTag}>
            <View style={styles.reportDot} />
            <Text style={styles.reportTagText}>REPORT</Text>
          </View>
        </View>
        {/* 装饰图 */}
      <Image source={Images.weeklyReportKnowledgeExplorerCardBg} style={styles.knowledgeExplorerCardBg} resizeMode="contain" />
      <Image source={Images.weeklyReportBoy} style={styles.weeklyReportBoy} resizeMode="cover" />
    </View>
  )
}

const styles = createStyles({
  card: {
    height: 226.5625,
    width: 337.5,
    position: "relative" as const,
    paddingTop: 97.8125,
    paddingLeft: 10.9375,
    overFlow: "hidden" as const,
    borderRadius: 12,
 
  
  },
  cardGradient: {
    flex: 1,
    // padding: 16,
  },
  cardHeader: {
    // marginBottom: 8,
  },
  cardTitleBig: {
    fontSize: 19.5313,
    fontWeight: "bold" as const,
    color: "#020C1A",
    zIndex: 2,
    fontFamily: "kingnam_bobo",
  },
  knowledgeContent: {
    // marginTop: 8,
    zIndex: 10,
  },
  knowledgeLabel: {
    fontSize: 11.875,
       zIndex: 10,
    color: "#00000099",
    // marginBottom: 4,
  },
  timeRow: {
    flexDirection: "row" as const,
    alignItems: "baseline" as const,
       zIndex: 10,
    // marginBottom: 8,
  },
  timeValue: {
   fontSize: 19.5313,
    fontWeight: "bold" as const,
    color: "#1571FC",
  },
  timeUnit: {
    fontSize: 11.875,
    color: "#000000B2",
    // marginLeft: 4,
  },
  compareRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    // marginBottom: 12,
  },
  compareText: {
     fontSize: 11.875,
    color: "#000000B2",
  },
  compareHighlight: {
    fontSize: 16,
    fontWeight: "bold" as const,
    color: "#1571FC",
    marginHorizontal: 4,
  },
  legoText: {
    fontSize: 7.8125,
    color: "#1571FCCC",
    // maxWidth: 180,
    marginTop: 4,
    lineHeight: 16,
    fontWeight: "bold" as const,
  },
  reportTag: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginTop: 4, 
  },
  reportDot: {
    width: 3.2,
    height: 3.2,
    borderRadius: 3.2,
    backgroundColor: "#000000",
    // marginRight: 6,
  },
  reportTagText: {
    fontSize: 6.25,
    color: "#000000",
    // fontWeight: "bold" as const,
    marginLeft: 2,
  },
  boyImage: {
    position: "absolute" as const,
    right: 10,
    top: 20,
    width: 100,
    height: 140,
    zIndex: 1,
  },
  dogImage: {
    position: "absolute" as const,
    right: 20,
    bottom: 10,
    width: 50,
    height: 50,
    zIndex: 1,
  },
  knowledgeExplorerCardBg: {
    position: "absolute" as const,
    top: -2,
    left: 0,
    height: 233.5938,
    width: 337.5,
    zIndex: 1,
  },
  knowledgeExplorerCardBg2: {
    position: "absolute" as const,
  },
  knowledgeExplorerCardBg3: {
    position: "absolute" as const,
  },
  knowledgeExplorerCardBg4: {
    position: "absolute" as const,
  },
  weeklyReportBoy: {
    position: "absolute" as const,
    right: 17.1875,
    bottom: 5.8594,
    width: 125.7813,
    height: 146.875,
     zIndex: 10,
  }
})
