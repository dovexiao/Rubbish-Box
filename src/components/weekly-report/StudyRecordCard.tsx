import { View, Text, Image } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { createStyles } from "../../utils/rpxStyleSheet"
import { Images } from "../../constants/Assets"

export function StudyRecordCard() {
  return (
    <View style={styles.card}>
      <View style={styles.cardGradientContainer}>
      <LinearGradient
        colors={["#97DBFF", "#60B0FF"]}
        start={{ x: 1, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        {/* 左边：学习记录 */}
        <View style={styles.recordLeft}>
          <View style={styles.tagWrapper}>
            <Text style={styles.tagText}>#学习记录</Text>
          </View>
          <View style={styles.recordTextWrapper}>
            <Text style={styles.recordText}>这周你有</Text>
            <Text style={styles.recordHighlight}>7</Text>
            <Text style={styles.recordText}>天在小褐同学学习</Text>
          </View>
          <View style={styles.awardWrapper}>
            <Text style={styles.awardText}>在此奉上</Text>
          </View>
         
        </View>

        {/* 右边：学习时长 */}
        <View style={styles.recordRight}>
          <View style={styles.timeRecordContent}>
            <View style={styles.tagWrapper}>
              <Text style={styles.tagText}>#学习时长</Text>
            </View>
            <View style={styles.recordTextWrapper}>
              <Text style={styles.recordText}>这周你在周五学习了</Text>
              <Text style={styles.recordHighlightPink}>128</Text>
              <Text style={styles.recordText}>分钟</Text>
            </View>
            <Text style={styles.recordSubText}>学习是一个日积月累的过程</Text>
            <Text style={styles.recordSubText}>继续加油吧！</Text>
          </View>
        </View>
        </LinearGradient>
      </View>
      <View style={styles.polygonContainer}>
        <Image source={Images.Polygon164} style={styles.polygonImage} resizeMode="contain" />
        <Text style={styles.polygonText}>日积月累奖</Text>
        {/* <Text style={styles.polygonText}>小褐爱学全勤奖</Text> */}
      </View>
      <Image source={Images.weeklyReportCalendar} style={styles.calendarImage} resizeMode="contain" />
        <Image source={Images.weeklyReportClock} style={styles.clockImage} resizeMode="contain" />
    </View>
  )
}

const styles = createStyles({
  card: {
    borderRadius: 11.7188,
    overflow: "hidden" as const,
    backgroundColor: "#FFFFFFB2",
    height: 171.0938,
    width: 337.5,
    position: "relative" as const,
  },
  cardGradientContainer: {
    flex: 1,
    margin: 10.1563,
    borderRadius: 6.6406,
    overflow: "hidden" as const,
    borderWidth: 0.7813,
    borderColor: "#8CBFFF",
  },
  cardGradient: {
    flex: 1,
    padding: 10.1563,
  },
  recordLeft: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: "rgba(255,255,255,0.3)",
    paddingRight: 10,
    marginBottom: 10,
  },
  recordRight: {
    flex: 1,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.3)",
    flexDirection: "row" as const,
  },
  tagWrapper: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4.6875,
    alignSelf: "flex-start" as const,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 8.5938,
    color: "#FFB300",
    fontWeight: "bold" as const,
  },
  recordTextWrapper: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    flexWrap: "wrap" as const,
    // marginBottom: 8,
  },
  recordText: {
    fontSize: 8.5938,
    color: "#FFFFFF",
    fontWeight: "700" as const,
  },
  recordHighlight: {
    fontSize: 14.0625,
    fontWeight: "bold" as const,
    color: "#FCB715",
    marginHorizontal: 2,
  },
  recordHighlightPink: {
    fontSize: 16,
    fontWeight: "bold" as const,
    color: "#FF8D8D",
    marginHorizontal: 4,
  },
  awardWrapper: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  awardText: {
    fontSize: 12,
    color: "#FFFFFF",
    marginRight: 4,
  },
  awardBadge: {
    backgroundColor: "#76E362",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    transform: [{ rotate: "-5deg" }],
  },
  awardBadgeText: {
    fontSize: 11,
    color: "#FFFFFF",
    fontWeight: "bold" as const,
  },
  calendarImage: {
    position: "absolute" as const,
    left: 14.0625,
    bottom: 7.0313,
    width: 93.75,
    height: 78.125,
  },
  clockImage: {
    position: "absolute" as const,
    right: 10,
    bottom: 10,
    width: 50,
    height: 50,
  },
  timeRecordContent: {
    flex: 1,
    paddingLeft: 10,
  },
  recordSubText: {
    fontSize: 10,
    color: "rgba(255,255,255,0.8)",
    lineHeight: 14,
  },
  polygonImage: {
   position: "absolute" as const,
   left: 0,
   top: 0,
   width: 103.125,
   height: 38.2813,
   zIndex: 10,
  },
  polygonContainer: {
    position: "absolute" as const,
    left: 69.5313,
    top: 49.2188,
    width: 103.125,
    height: 38.2813,
    zIndex: 10,
  },
  polygonText: {
    position: "absolute" as const,
    left: 18,
    top: 13,
    width: 103.125,
    height: 38.2813,
    zIndex: 10,
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "bold" as const,
    transform: [{ rotate: "8.69deg"}],
  },
})
