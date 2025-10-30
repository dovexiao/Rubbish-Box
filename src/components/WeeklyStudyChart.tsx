import { View, Text } from "react-native"
import Svg, { Rect, Line, Text as SvgText } from "react-native-svg"
import { createStyles, rpx } from "../utils/rpxStyleSheet"
import { DailyStudyData } from "../services/my"

interface WeeklyStudyChartProps {
  weekData: DailyStudyData[]
}

/**
 * 本周学习时长图表组件
 * 100%还原UniApp项目中的 WeeklyStudyChart 组件
 */
export function WeeklyStudyChart({ weekData }: WeeklyStudyChartProps) {
  // 如果没有数据，显示空状态
  if (!weekData || weekData.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>暂无学习数据</Text>
      </View>
    )
  }

  // 图表配置
  const chartWidth = 160 // rpx
  const chartHeight = 100 // rpx
  const barWidth = 15 // rpx
  const maxValue = Math.max(...weekData.map((d) => d.duration), 60) // 最小60分钟
  const spacing = (chartWidth - barWidth * weekData.length) / (weekData.length + 1)

  // 从日期提取星期
  const getWeekDay = (dateStr: string) => {
    const date = new Date(dateStr)
    const days = ["日", "一", "二", "三", "四", "五", "六"]
    return days[date.getDay()]
  }

  return (
    <View style={styles.container}>
      <Svg width={rpx(chartWidth)} height={rpx(chartHeight)}>
        {weekData.map((item, index) => {
          const barHeight = (item.duration / maxValue) * (chartHeight - 30)
          const x = spacing * (index + 1) + barWidth * index
          const y = chartHeight - 20 - barHeight

          return (
            <View key={index}>
              {/* 柱状图 */}
              <Rect
                x={rpx(x)}
                y={rpx(y)}
                width={rpx(barWidth)}
                height={rpx(barHeight)}
                fill="#4891FF"
                rx={rpx(3)}
              />

              {/* 数值标签 */}
              {item.duration > 0 && (
                <SvgText
                  x={rpx(x + barWidth / 2)}
                  y={rpx(y - 5)}
                  fontSize={rpx(6)}
                  fill="#666"
                  textAnchor="middle"
                >
                  {item.duration}
                </SvgText>
              )}

              {/* 星期标签 */}
              <SvgText
                x={rpx(x + barWidth / 2)}
                y={rpx(chartHeight - 5)}
                fontSize={rpx(7)}
                fill="#999"
                textAnchor="middle"
              >
                {getWeekDay(item.date)}
              </SvgText>
            </View>
          )
        })}

        {/* 底部基线 */}
        <Line
          x1={rpx(0)}
          y1={rpx(chartHeight - 20)}
          x2={rpx(chartWidth)}
          y2={rpx(chartHeight - 20)}
          stroke="#E5E5E5"
          strokeWidth={1}
        />
      </Svg>
    </View>
  )
}

const styles = createStyles({
  container: {
    width: "100%",
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
  },
  emptyText: {
    fontSize: 9,
    color: "#999",
  },
})

