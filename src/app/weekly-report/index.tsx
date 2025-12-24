import { View, ScrollView } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { StatusBar } from "../../components/StatusBar"
import { NavBar } from "../../components/NavBar"
import { createStyles } from "../../utils/rpxStyleSheet"
import { KnowledgeExplorerCard } from "../../components/weekly-report/KnowledgeExplorerCard"
import { StudyRecordCard } from "../../components/weekly-report/StudyRecordCard"
import { BestStudyPartnerCard } from "../../components/weekly-report/BestStudyPartnerCard"
import { CourseProgressCard } from "../../components/weekly-report/CourseProgressCard"
import { SubjectAccuracyCard } from "../../components/weekly-report/SubjectAccuracyCard"

/**
 * 学习周报页面
 */
export default function WeeklyReportScreen() {
  return (
    <LinearGradient
      colors={["#7E9AFF", "#75AEFF", "#B5F0FF", "#C4DDFF"]}
      locations={[-0.1128, 0.1494, 0.8474, 1.0586]}
      start={{ x: 1, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.pageContainer}
    >
      <StatusBar theme="light" backgroundColor="transparent" translucent />
      <NavBar title="学习周报" leftArrow />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* 主要内容区域 - 左右布局 */}
        <View style={styles.mainContainer}>
          {/* 左侧列 */}
          <View style={styles.leftColumn}>
            <View style={styles.leftColumnItem1}>
                {/* 1. 知识探索者卡片 */}
                <KnowledgeExplorerCard />
            </View>
         
            <View style={styles.leftColumnItem2}>
               {/* 2. 学习记录卡片 */}
               <StudyRecordCard />
            </View>
          </View>

          {/* 右侧列 */}
          <View style={styles.rightColumn}>
            <View style={styles.rightColumnItem1}>
               {/* 3. 最佳学习搭子（柱状图） */}
                <BestStudyPartnerCard />
            </View>
            <View style={styles.rightColumnItem2}>
               {/* 4. 已学完课程 */}
               <CourseProgressCard />
            </View>
            <View style={styles.rightColumnItem3}>
               {/* 5. 全科正确率 */}
               <SubjectAccuracyCard />
            </View>
         
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  )
}

const styles = createStyles({
  pageContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  
 
  },
  scrollContent: {
    paddingHorizontal: 33.5938, // 33.5938rpx
    // borderWidth: 1,
    // borderColor: 'red',
    // paddingBottom: 30,
  },
  mainContainer: {
    flexDirection: "row" as const,
    gap: 14.0625,
  },
  leftColumn: {
    // gap: 16,
    width: 337.5,
  
  },
  leftColumnItem1: {
      width: 337.5,
      // marginTop: 71.875, // 186.25rpx
  },
  leftColumnItem2: {
    width: 337.5,
    marginTop: 4.8,
  },
  rightColumn: {
    gap: 16,
  },
  rightColumnItem1: {
    marginTop: 71.875, // 186.25rpx
    width: 335.9375,
  },
  rightColumnItem2: {
    // marginTop: 71.875, // 186.25rpx
  },
  rightColumnItem3: {
    // marginTop: 71.875, // 186.25rpx
  },
  bottomRow: {
    flexDirection: "row" as const,
    gap: 16,
    height: 220,
  },
 
})
