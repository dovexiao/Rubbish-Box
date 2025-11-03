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
      <View style={styles.emptyContainer as any}>
        <Text style={styles.emptyText}>暂无学习数据</Text>
      </View>
    )
  }

  // 图表配置
  const chartWidth = 160 // rpx
  const chartHeight = 100 // rpx
  const barWidth = 15 // rpx
  const leftMargin = 20 // 左边距，用于显示纵轴刻度
  const actualChartWidth = chartWidth - leftMargin // 实际图表宽度
  
  // 动态计算最大值：取数据最大值的1.2倍，至少为5
  const dataMax = Math.max(...weekData.map((d) => d.duration), 1)
  const maxValue = Math.max(Math.ceil(dataMax * 1.2), 5)
  
  const spacing = (actualChartWidth - barWidth * weekData.length) / (weekData.length + 1)
  
  // 计算纵轴刻度（5个刻度）
  const yAxisTicks = [0, maxValue * 0.25, maxValue * 0.5, maxValue * 0.75, maxValue]

  // 从日期提取星期（如果接口没有提供weekday字段）
  const getWeekDay = (dateStr: string) => {
    // 尝试解析 MM/DD 格式的日期
    const [month, day] = dateStr.split('/').map(Number)
    if (month && day) {
      const year = new Date().getFullYear()
      const date = new Date(year, month - 1, day)
      const days = ["日", "一", "二", "三", "四", "五", "六"]
      return days[date.getDay()]
    }
    return dateStr
  }

  return (
    <View style={styles.container as any}>
      <Svg width={rpx(chartWidth)} height={rpx(chartHeight)}>
        {/* 纵轴线 */}
        <Line
          x1={rpx(leftMargin)}
          y1={rpx(10)}
          x2={rpx(leftMargin)}
          y2={rpx(chartHeight - 20)}
          stroke="#E5E5E5"
          strokeWidth={1}
        />
        
        {/* 纵轴刻度、标签和网格线 */}
        {yAxisTicks.map((tick, index) => {
          const y = chartHeight - 20 - (tick / maxValue) * (chartHeight - 30)
          return (
            <View key={`tick-${index}`}>
              {/* 水平网格线（虚线效果） */}
              {index > 0 && (
                <Line
                  x1={rpx(leftMargin)}
                  y1={rpx(y)}
                  x2={rpx(chartWidth)}
                  y2={rpx(y)}
                  stroke="#F0F0F0"
                  strokeWidth={0.5}
                  strokeDasharray="2,2"
                />
              )}
              {/* 刻度线 */}
              <Line
                x1={rpx(leftMargin - 3)}
                y1={rpx(y)}
                x2={rpx(leftMargin)}
                y2={rpx(y)}
                stroke="#E5E5E5"
                strokeWidth={1}
              />
              {/* 刻度标签 */}
              <SvgText
                x={rpx(leftMargin - 5)}
                y={rpx(y)}
                fontSize={rpx(5)}
                fill="#999"
                textAnchor="end"
                alignmentBaseline="middle"
              >
                {Math.round(tick)}
              </SvgText>
            </View>
          )
        })}
        
        {/* 数据柱状图 */}
        {weekData.map((item, index) => {
          const barHeight = (item.duration / maxValue) * (chartHeight - 30)
          const x = leftMargin + spacing * (index + 1) + barWidth * index
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
                {item.weekday || getWeekDay(item.date)}
              </SvgText>
            </View>
          )
        })}

        {/* 底部基线 */}
        <Line
          x1={rpx(leftMargin)}
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
    alignItems: "flex-start", // 左对齐，因为有纵轴
    paddingLeft: 5, // 给纵轴标签留出空间
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

