import { View, Text } from "react-native"
import Svg, { Polygon, Circle, Line, Text as SvgText } from "react-native-svg"
import { createStyles } from "../utils/rpxStyleSheet"

interface ScoreItem {
  name: string
  grade: string
  progress: string
  description: string
  color: string
}

interface Props {
  scoreItems: ScoreItem[]
}

/**
 * 写作能力分析雷达图组件
 * 还原UniApp项目 /src/pages/AI/components/WritingAnalysis.vue
 */
export function WritingAnalysis({ scoreItems }: Props) {
  if (!scoreItems || scoreItems.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>暂无数据</Text>
      </View>
    )
  }

  // 雷达图配置
  const width = 194
  const height = 169
  const centerX = width / 2
  const centerY = height / 2
  const maxRadius = Math.min(width, height) * 0.35

  // 计算雷达图的各个点位置
  const angleStep = (Math.PI * 2) / scoreItems.length

  // 生成网格层级
  const renderGridLevels = () => {
    const levels = [0.25, 0.5, 0.75, 1.0]
    const colors = [
      "rgba(40, 242, 91, 0.07)",
      "rgba(40, 242, 91, 0.1)",
      "rgba(40, 242, 91, 0.3)",
      "rgba(40, 242, 91, 0.6)",
    ]

    return levels.map((level, index) => {
      const radius = maxRadius * level
      const points = scoreItems
        .map((_, i) => {
          const angle = angleStep * i - Math.PI / 2
          const x = centerX + Math.cos(angle) * radius
          const y = centerY + Math.sin(angle) * radius
          return `${x},${y}`
        })
        .join(" ")

      return (
        <Polygon
          key={`level-${index}`}
          points={points}
          fill={colors[index]}
          stroke="rgba(124, 210, 105, 1)"
          strokeWidth={0.5}
        />
      )
    })
  }

  // 渲染轴线
  const renderAxisLines = () => {
    return scoreItems.map((_, index) => {
      const angle = angleStep * index - Math.PI / 2
      const x = centerX + Math.cos(angle) * maxRadius
      const y = centerY + Math.sin(angle) * maxRadius

      return (
        <Line
          key={`axis-${index}`}
          x1={centerX}
          y1={centerY}
          x2={x}
          y2={y}
          stroke="rgba(124, 210, 105, 1)"
          strokeWidth={0.5}
        />
      )
    })
  }

  // 渲染数据区域
  const renderDataArea = () => {
    const points = scoreItems
      .map((item, index) => {
        const angle = angleStep * index - Math.PI / 2
        const percentage = parseFloat(item.progress.replace("%", "")) / 100
        const radius = maxRadius * percentage
        const x = centerX + Math.cos(angle) * radius
        const y = centerY + Math.sin(angle) * radius
        return `${x},${y}`
      })
      .join(" ")

    return (
      <>
        <Polygon
          points={points}
          fill="url(#gradient)"
          fillOpacity={0.6}
          stroke="rgba(107, 227, 155, 1)"
          strokeWidth={1}
        />
        {/* 数据点 */}
        {scoreItems.map((item, index) => {
          const angle = angleStep * index - Math.PI / 2
          const percentage = parseFloat(item.progress.replace("%", "")) / 100
          const radius = maxRadius * percentage
          const x = centerX + Math.cos(angle) * radius
          const y = centerY + Math.sin(angle) * radius

          return (
            <Circle
              key={`point-${index}`}
              cx={x}
              cy={y}
              r={4}
              fill="rgba(96, 141, 255, 1)"
              stroke="#fff"
              strokeWidth={1}
            />
          )
        })}
      </>
    )
  }

  // 渲染标签
  const renderLabels = () => {
    return scoreItems.map((item, index) => {
      const angle = angleStep * index - Math.PI / 2
      const labelRadius = maxRadius + 20
      const x = centerX + Math.cos(angle) * labelRadius
      const y = centerY + Math.sin(angle) * labelRadius

      // 根据位置调整对齐方式
      let textAnchor: "start" | "middle" | "end" = "middle"
      if (x < centerX - 10) {
        textAnchor = "end"
      } else if (x > centerX + 10) {
        textAnchor = "start"
      }

      return (
        <SvgText
          key={`label-${index}`}
          x={x}
          y={y}
          fill="rgba(124, 210, 105, 1)"
          fontSize={10}
          fontWeight="bold"
          textAnchor={textAnchor}
        >
          {item.name}
          <SvgText x={x} dy={12} fill="rgba(124, 210, 105, 1)" fontSize={10} fontWeight="bold">
            {item.progress}
          </SvgText>
        </SvgText>
      )
    })
  }

  return (
    <View style={styles.container}>
      <Svg width={width} height={height}>
        {/* 定义渐变 */}
        <defs>
          <radialGradient id="gradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(146, 222, 255, 1)" stopOpacity={1} />
            <stop offset="100%" stopColor="rgba(92, 255, 103, 1)" stopOpacity={1} />
          </radialGradient>
        </defs>

        {/* 网格层级 */}
        {renderGridLevels()}

        {/* 轴线 */}
        {renderAxisLines()}

        {/* 数据区域 */}
        {renderDataArea()}

        {/* 标签 */}
        {renderLabels()}
      </Svg>
    </View>
  )
}

const styles = createStyles({
  container: {
    width: 194, // 194rpx
    height: 169, // 169rpx
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 12,
    color: "#999",
  },
})

export default WritingAnalysis
