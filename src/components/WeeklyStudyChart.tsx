import { View, Text } from "react-native"
import Svg, { Rect, Line, Text as SvgText, Polyline, Circle, Defs, LinearGradient, Stop } from "react-native-svg"
import { createStyles, rpx } from "../utils/rpxStyleSheet"
import { DailyStudyData } from "../services/my"

interface WeeklyStudyChartProps {
  weekData: DailyStudyData[]
}

/**
 * 本周学习时长图表组件
 * 基于设计稿 394 * 246 绘制
 */
export function WeeklyStudyChart({ weekData }: WeeklyStudyChartProps) {
  // 设计稿尺寸
  const designWidth = 394 // px
  const designHeight = 246 // px
  const scaleFactor = 750 / 1920 // 转换系数

  // 转换为rpx尺寸（所有尺寸都需要 * scaleFactor）
  const chartWidth = designWidth * scaleFactor // 153.90625 rpx
  const chartHeight = designHeight * scaleFactor // 96.09375 rpx

  // 根据设计图，计算各个元素的尺寸（设计稿px * scaleFactor）
  const rectWidth = 60 * scaleFactor // 背景矩形宽度，
  const equalWidth = (394 / weekData.length) * scaleFactor // 屏幕等宽矩形
  const paddingTop = 20 * scaleFactor // 顶部内边距
  const paddingBottom = 40 * scaleFactor // 底部内边距（用于日期标签，24px字体需要更多空间）
  const paddingLeft = 0 * scaleFactor // 左边距（设计图看起来没有左边距）
  const paddingRight = 0 * scaleFactor // 右边距

  // 实际图表绘制区域
  const chartAreaHeight = chartHeight - paddingTop - paddingBottom

  // 动态计算最大值：取数据最大值的1.2倍，至少为5
  const dataMax = Math.max(...weekData.map((d) => d.duration), 1)
  const maxValue = Math.max(Math.ceil(dataMax * 1.2), 5)

  // 计算折线点坐标（每个点位于矩形中心）
  const linePoints = weekData.map((item, index) => {
    const x = paddingLeft + equalWidth * index + equalWidth / 2
    const barHeight = (item.duration / maxValue) * chartAreaHeight
    const y = paddingTop + chartAreaHeight - barHeight
    return { x, y, duration: item.duration, index }
  })

  // 计算纵轴刻度（根据设计图，可能需要网格线）
  const yAxisTicks = [0, maxValue * 0.25, maxValue * 0.5, maxValue * 0.75, maxValue]

  // 从日期提取星期（如果接口没有提供weekday字段）
  const getWeekDay = (dateStr: string) => {
    // 尝试解析 MM/DD 格式的日期
    const [month, day] = dateStr.split('/').map(Number)
    if (month && day) {
      const year = new Date().getFullYear()
      const date = new Date(year, month - 1, day)
      const days = ["日", "一", "二", "三", "四", "五", "六"]
      return `周${days[date.getDay()]}`
    }
    return dateStr
  }

  const hasValidData =
    Array.isArray(weekData) &&
    weekData.length > 0 &&
    weekData.some((item) => item.duration > 0)

  // 最后一个点的索引
  const lastIndex = weekData.length - 1

  return (
    <View style={styles.container as any}>
      <Svg width={rpx(chartWidth)} height={rpx(chartHeight)}>
        {/* 定义渐变 */}
        <Defs>
          {/* 白色渐变（从顶向下：30% -> 80% -> 30%） */}
          <LinearGradient id="whiteGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.6} />
            <Stop offset="35%" stopColor="#FFFFFF" stopOpacity={1} />
            <Stop offset="65%" stopColor="#FFFFFF" stopOpacity={1} />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0.6} />
          </LinearGradient>
          {/* 折线渐变（从头到尾：#B2F1FF -> #3784FF） */}
          <LinearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#B2F1FF" />
            <Stop offset="100%" stopColor="#3784FF" />
          </LinearGradient>
        </Defs>

        {/* 白色背景矩形（每个折线点对应一个等宽矩形背景） */}
        {weekData.map((item, index) => {
          const x = paddingLeft + equalWidth * index + (equalWidth - rectWidth) / 2
          return (
            <Rect
              key={`bg-${index}`}
              x={rpx(x)}
              y={rpx(paddingTop)}
              width={rpx(rectWidth)}
              height={rpx(chartAreaHeight)}
              fill="url(#whiteGradient)"
            />
          )
        })}

        {/* 水平网格线 */}
        {/* {yAxisTicks.map((tick, index) => {
          if (index === 0) return null // 跳过底部基线
          const y = paddingTop + chartAreaHeight - (tick / maxValue) * chartAreaHeight
          return (
            <Line
              key={`grid-${index}`}
              x1={rpx(paddingLeft)}
              y1={rpx(y)}
              x2={rpx(chartWidth - paddingRight)}
              y2={rpx(y)}
              stroke="#F0F0F0"
              strokeWidth={rpx(1 * scaleFactor)}
              strokeDasharray={`${rpx(2 * scaleFactor)},${rpx(2 * scaleFactor)}`}
            />
          )
        })} */}

        {/* 折线图（渐变：从头到尾 #B2F1FF -> #3784FF） */}
        {linePoints.length > 1 && (
          <Polyline
            points={linePoints.map((point) => `${rpx(point.x)},${rpx(point.y)}`).join(" ")}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth={rpx(8 * scaleFactor)}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {/* 数据点和标签 */}
        {weekData.map((item, index) => {
          const point = linePoints[index]
          if (!point) return null

          const isLast = index === lastIndex
          // 学习时间文本：18px，普通 #00000066 字重400，高亮 #1571FC 字重500
          const durationFontSize = 18 * scaleFactor
          // 日期文本：24px，普通 #00000066 字重400，高亮 #0070F966 字重600
          const dateFontSize = 24 * scaleFactor
          const circleRadius = 10 * scaleFactor // 圆点半径10px

          return (
            <View key={index}>
              {/* 数值标签（学习时间） */}
              {typeof item.duration === 'number' && (
                <SvgText
                  x={rpx(point.x)}
                  y={rpx(point.y - (isLast ? 20 * scaleFactor : 20 * scaleFactor))}
                  fontSize={rpx(durationFontSize)}
                  fill={isLast ? "#1571FC" : "#00000066"}
                  fontWeight={isLast ? "500" : "400"}
                  textAnchor="middle"
                >
                  {item.duration}
                </SvgText>
              )}

              {/* 数据点圆点（最后一个高亮显示） */}
              {isLast && (
                <Circle
                  cx={rpx(point.x)}
                  cy={rpx(point.y)}
                  r={rpx(circleRadius)}
                  fill="#7ABDFF" // 背景色
                  stroke="#FFFFFF" // 边框颜色
                  strokeWidth={rpx(2.5 * scaleFactor)} // 边框宽度2.5px
                />
              )}

              {/* 日期标签 */}
              <SvgText
                x={rpx(point.x)}
                y={rpx(chartHeight - 8 * scaleFactor)}
                fontSize={rpx(dateFontSize)}
                fill={isLast ? "#0070F966" : "#00000066"}
                fontWeight={isLast ? "600" : "400"}
                textAnchor="middle"
              >
                {item.date || item.weekday || getWeekDay(item.date)}
              </SvgText>
            </View>
          )
        })}
      </Svg>
    </View>
  )
}

const styles = createStyles({
  container: {
    width: 153.90625, // 394
    height: 96.09375, // 246
    justifyContent: "center",
    alignItems: "center",
  },
})
