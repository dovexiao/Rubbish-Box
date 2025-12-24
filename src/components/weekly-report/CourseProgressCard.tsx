import { View, Text, Image } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { createStyles } from "../../utils/rpxStyleSheet"
import { Images } from "../../constants/Assets"

export function CourseProgressCard() {
  return (
    <View style={styles.card}>
      <LinearGradient
        colors={["#FFFFFF", "#F0F7FF"]}
        style={styles.cardGradient}
      >
        <View style={styles.courseHeader}>
          <Text style={styles.cardTitleSmall}>已学完课程</Text>
          <Text style={styles.cardTitleNumber}>12</Text>
          <Text style={styles.cardTitleSmall}>节</Text>
        </View>
        
        <View style={styles.booksContainer}>
          <Image source={Images.weeklyReportCourse} style={[styles.bookImage, {left: 0, zIndex: 1}]} resizeMode="cover" />
          <Image source={Images.weeklyReportCourse} style={[styles.bookImage, {left: 20, zIndex: 2}]} resizeMode="cover" />
          <Image source={Images.weeklyReportCourse} style={[styles.bookImage, {left: 40, zIndex: 3}]} resizeMode="cover" />
          <View style={styles.playButton}>
            <View style={styles.playTriangle} />
          </View>
        </View>

        <View style={styles.courseInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>学习最多的科目：</Text>
            <View style={styles.subjectTag}>
              <Text style={styles.subjectTagText}>数学</Text>
            </View>
          </View>
          <Text style={styles.infoSubText}>观看了8节</Text>
        </View>
        
        {/* 装饰虫子 */}
        <Image source={Images.weeklyReportWorm} style={styles.wormImage} resizeMode="contain" />
      </LinearGradient>
    </View>
  )
}

const styles = createStyles({
  card: {
    borderRadius: 16,
    overflow: "hidden" as const,
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    flex: 1,
  },
  cardGradient: {
    flex: 1,
    padding: 16,
  },
  courseHeader: {
    flexDirection: "row" as const,
    alignItems: "baseline" as const,
    marginBottom: 16,
  },
  cardTitleSmall: {
    fontSize: 14,
    color: "#333",
    fontWeight: "bold" as const,
  },
  cardTitleNumber: {
    fontSize: 18,
    color: "#4086FF",
    fontWeight: "bold" as const,
    marginHorizontal: 4,
  },
  booksContainer: {
    height: 80,
    position: "relative" as const,
    marginBottom: 16,
  },
  bookImage: {
    width: 60,
    height: 80,
    borderRadius: 4,
    position: "absolute" as const,
    top: 0,
    borderWidth: 1,
    borderColor: "#fff",
  },
  playButton: {
    position: "absolute" as const,
    left: 30, // center relative to books
    top: 25,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    zIndex: 4,
  },
  playTriangle: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid" as const,
    borderLeftWidth: 8,
    borderRightWidth: 0,
    borderBottomWidth: 5,
    borderTopWidth: 5,
    borderLeftColor: "#666",
    borderRightColor: "transparent",
    borderBottomColor: "transparent",
    borderTopColor: "transparent",
    marginLeft: 2,
  },
  courseInfo: {
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 13,
    color: "#666",
  },
  subjectTag: {
    backgroundColor: "#F0E6FF",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  subjectTagText: {
    fontSize: 12,
    color: "#7B61FF",
    fontWeight: "bold" as const,
  },
  infoSubText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold" as const,
  },
  wormImage: {
    position: "absolute" as const,
    bottom: 10,
    right: 10,
    width: 40,
    height: 30,
  },
})
