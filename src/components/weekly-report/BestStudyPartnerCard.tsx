import { View, Text, Image } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import Svg, { Rect, G, Text as SvgText } from "react-native-svg"
import { createStyles, rpx } from "../../utils/rpxStyleSheet"
import { Images } from "../../constants/Assets"

export function BestStudyPartnerCard() {
  // 柱状图数据
  const barChartData = [
    { day: "周一", date: "10.11", count: 10 },
    { day: "周二", date: "10.12", count: 52 },
    { day: "周三", date: "10.13", count: 36 },
    { day: "周四", date: "10.14", count: 35 },
    { day: "周五", date: "10.15", count: 59, isMax: true },
    { day: "周六", date: "10.16", count: 51 },
    { day: "周日", date: "10.17", count: 48 },
  ]

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={["#E3F1FF", "#F5FAFF"]}
        style={styles.cardGradient}
      >
        <View style={styles.chartHeader}>
          <Text style={styles.cardTitleBlue}>你的最佳学习搭子</Text>
          <Text style={styles.chartSubtitle}>本周共答了 67 道题</Text>
        </View>
        
        <View style={styles.barChartContainer}>
          {/* 使用 viewBox 确保缩放正确，增加底部空间给文字 */}
          <Svg width="100%" height="100%" viewBox="0 0 320 140">
            {barChartData.map((item, index) => {
              const barWidth = 24
              const maxHeight = 80 // 柱子最大高度区域
              const maxCount = 65 // 刻度上限略大于最大值59
              const height = (item.count / maxCount) * maxHeight
              // 调整间距和位置
              const x = 20 + index * 42 
              const y = 110 - height // 底部基线在 y=110
              
              return (
                <G key={index}>
                  {/* 柱子 - 上方圆角 */}
                  <Rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={height}
                    fill={item.isMax ? "#5B9BFF" : "#A6C8FF"}
                    rx={6} // 圆角半径
                    ry={6}
                  />
                  {/* 如果需要底部直角，可以用 Path 绘制，这里 Rect rx 对所有角生效，但在底部对其对齐的情况下视觉上可以接受。
                      为了完美还原底部直角，可以用一个遮罩或者 Path，或者简单的 Rect 覆盖底部圆角。
                      这里简单起见，我们叠加一个小的矩形填补底部圆角 (如果需要的话) */}
                  <Rect 
                     x={x} 
                     y={y + height - 6} 
                     width={barWidth} 
                     height={6} 
                     fill={item.isMax ? "#5B9BFF" : "#A6C8FF"} 
                  />

                  {/* 数值标签 */}
                  <SvgText
                    x={x + barWidth / 2}
                    y={y - 6}
                    fontSize="10"
                    fill="#999"
                    textAnchor="middle"
                  >
                    {item.count}
                  </SvgText>
                  
                  {/* 星期标签 */}
                  <SvgText
                    x={x + barWidth / 2}
                    y={124}
                    fontSize="10"
                    fill="#666"
                    textAnchor="middle"
                  >
                    {item.day}
                  </SvgText>
                  
                  {/* 日期标签 */}
                  <SvgText
                    x={x + barWidth / 2}
                    y={136}
                    fontSize="9"
                    fill="#999"
                    textAnchor="middle"
                  >
                    {item.date}
                  </SvgText>
                </G>
              )
            })}
          </Svg>
        </View>
        {/* 右上角装饰 */}
        <Image source={Images.weeklyReportMoon} style={styles.moonImage} resizeMode="contain" />
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
    height: 180,
  },
  cardGradient: {
    flex: 1,
    padding: 16,
  },
  chartHeader: {
    flexDirection: "row" as const,
    alignItems: "baseline" as const,
    marginBottom: 10,
  },
  cardTitleBlue: {
    fontSize: 16,
    fontWeight: "bold" as const,
    color: "#7B9CFF",
    marginRight: 8,
  },
  chartSubtitle: {
    fontSize: 12,
    color: "#666",
  },
  barChartContainer: {
    flex: 1,
    marginTop: 4,
  },
  moonImage: {
    position: "absolute" as const,
    top: 10,
    right: 10,
    width: 40,
    height: 40,
  },
})
