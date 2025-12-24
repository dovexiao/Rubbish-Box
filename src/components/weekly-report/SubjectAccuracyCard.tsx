import { View, Text } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import Svg, { Circle, G, Text as SvgText, Polyline } from "react-native-svg"
import { createStyles, rpx } from "../../utils/rpxStyleSheet"

export function SubjectAccuracyCard() {
  // 环形图数据与配置
  const pieData = [
    { label: "政治", value: 29, color: "#FF8D8D", percent: "29%" },
    { label: "英语", value: 9, color: "#76E362", percent: "9%" },
    { label: "语文", value: 20, color: "#7B9CFF", percent: "20%" },
    { label: "地理", value: 39, color: "#FFD66B", percent: "39%" },
  ]

  // 环形图计算辅助函数
  const renderPieChartWithLines = () => {
    // 增大视口宽度以容纳两侧的文字标签
    const width = 240 // 增加宽度
    const height = 160
    const cx = width / 2
    const cy = height / 2
    const radius = 35 // 圆环半径 rpx
    const strokeWidth = 12 // 圆环宽度
    
    // 计算总值，用于计算比例
    const total = pieData.reduce((acc, cur) => acc + cur.value, 0)
    // 留出一点空隙的总量（模拟圆角间隔）
    const gapAngle = 8 // 每一段之间的间隔角度
    
    let startAngle = -120 // 起始角度，根据设计图调整（大概在11点钟方向开始政治）

    return (
      <Svg width={rpx(width)} height={rpx(height)} viewBox={`0 0 ${width} ${height}`}>
        {/* 中心文字 */}
        <SvgText x={cx} y={cy - 5} fontSize="18" fontWeight="bold" fill="#4086FF" textAnchor="middle">72%</SvgText>
        <SvgText x={cx} y={cy + 12} fontSize="10" fill="#666" textAnchor="middle" fontWeight="bold">正确率</SvgText>

        {pieData.map((item, index) => {
          const percentage = item.value / total
          const sweepAngle = percentage * 360 - gapAngle // 减去间隔
          
          // --- 精确圆角间隔计算 ---
          const circumference = 2 * Math.PI * radius
          // 圆角长度约为 strokeWidth * PI / 2 (每个端点)，两端共 strokeWidth * PI
          // 但 strokeLinecap="round" 是以端点为圆心，半径为 strokeWidth/2 画圆。
          // 实际路径长度应该减去这个延伸，但 strokeDasharray 的计算是基于路径中心的。
          // 简单的近似：每个圆角占用的弧度大约是 (strokeWidth / 2) / radius 弧度。
          // 我们需要显示的实线长度 + 两个圆角 = 视觉上的长度。
          // strokeDasharray: [实线长度, 空隙长度]
          // 为了让中间确实空开 gapAngle，我们需要调整 strokeDasharray。
          
          // 弧长公式：L = R * θ (弧度)
          // 总需要的弧长（包含圆角）
          const totalArcLength = (sweepAngle / 360) * circumference
          
          // strokeDasharray 的第一个值是实线长度。当 strokeLinecap="round" 时，
          // 实际绘制的长度会在两端各延伸 strokeWidth / 2。
          // 所以实线长度应该 = totalArcLength - strokeWidth (近似)
          // 这是一个经验调整，确保视觉上的间隔清晰。
          
          // 更简单的做法：直接利用 gapAngle 作为空白，但因为圆角会延伸，
          // 所以 gapAngle 需要比视觉上的空白更大一些，或者 strokeDasharray 的实线部分更短。
          
          // 尝试新的计算：
          // gapAngle 是我们希望的视觉空白角度。
          // 每个圆角延伸的角度（半个笔触宽度的弧度转角度）
          const capAngle = ((strokeWidth / 2) / radius) * (180 / Math.PI) * 2 // 两端总共延伸的角度
          
          // 实际绘制的扫过角度（不含延伸） = 理论角度 - 间隔 - 圆角延伸补偿
          // 但这样会让圆弧变短。
          
          // 调整策略：保持 gapAngle 为较大值，让圆角填补一部分 gap，剩下的就是视觉 gap。
          const visualGapAngle = gapAngle // 我们希望看到的空白
          const actualGapAngle = visualGapAngle + capAngle // 实际路径需要的空白角度
          const actualSweepAngle = percentage * 360 - actualGapAngle
          
          const strokeLength = (actualSweepAngle / 360) * circumference
          const gapLength = circumference - strokeLength

          const strokeDasharray = `${strokeLength} ${gapLength}`
          
          const midAngle = startAngle + (percentage * 360) / 2 // 标签位置基于原始扇形中心
          
          const currentStartAngle = startAngle + capAngle / 2 // 起始位置补偿半个圆角
          startAngle += (percentage * 360) 

          // --- 计算引导线和文字位置 ---
          const angleRad = (midAngle * Math.PI) / 180
          // 圆环上的点
          const x1 = cx + (radius + strokeWidth/2) * Math.cos(angleRad)
          const y1 = cy + (radius + strokeWidth/2) * Math.sin(angleRad)
          
          // 拐点 (向外延伸)
          const x2 = cx + (radius + 20) * Math.cos(angleRad)
          const y2 = cy + (radius + 20) * Math.sin(angleRad)
          
          // 终点 (水平延伸)
          const isRightSide = Math.cos(angleRad) >= 0
          const x3 = isRightSide ? x2 + 15 : x2 - 15
          const y3 = y2

          // 文字位置
          const textX = isRightSide ? x3 + 2 : x3 - 2
          const textY = y3 + 3 //微调垂直对齐
          const textAnchor = isRightSide ? "start" : "end"

          return (
            <G key={index}>
              {/* 圆环片段 */}
              <Circle
                cx={cx}
                cy={cy}
                r={radius}
                stroke={item.color}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={strokeDasharray}
                strokeLinecap="round" // 圆角
                rotation={currentStartAngle}
                origin={`${cx}, ${cy}`}
              />
              
              {/* 引导线 */}
              <Polyline
                points={`${x1},${y1} ${x2},${y2} ${x3},${y3}`}
                fill="none"
                stroke={item.color}
                strokeWidth="1"
              />
              
              {/* 标签文字 */}
              <SvgText
                x={textX}
                y={textY}
                fontSize="10"
                fill={item.color}
                textAnchor={textAnchor}
              >
                {item.label + item.percent}
              </SvgText>
            </G>
          )
        })}
      </Svg>
    )
  }

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={["#FFFFFF", "#F0F7FF"]}
        style={styles.cardGradient}
      >
        <View style={styles.accuracyHeader}>
          <Text style={styles.cardTitleSmall}>全科正确率</Text>
          <Text style={styles.cardTitleNumber}>72%</Text>
        </View>
        <Text style={styles.accuracyDesc}>根据这周的错题发现"小数除法"比较薄弱哦~</Text>

        <View style={styles.pieContainer}>
          {/* 使用自定义的环形图渲染函数 */}
          {renderPieChartWithLines()}
        </View>
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
  accuracyHeader: {
    flexDirection: "row" as const,
    alignItems: "baseline" as const,
    marginBottom: 8,
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
  accuracyDesc: {
    fontSize: 11,
    color: "#7B9CFF",
    marginBottom: 10,
    lineHeight: 16,
  },
  pieContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
})
