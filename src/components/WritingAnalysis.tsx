import { View, Text } from "react-native"
import Svg, {
  Polygon,
  Circle,
  Line,
  Text as SvgText,
  TSpan,
  Defs,
  RadialGradient,
  Stop,
} from "react-native-svg"

import { createStyles } from "../utils/rpxStyleSheet"

interface ScoreItem {
  name: string
  grade: string
  progress: string | number // 支持字符串（如 "80%"）或数字（如 80）
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

  // 雷达图配置 - 增大雷达图，减少空白
  const width = 194 // 194rpx，与容器一致
  const height = 169 // 169rpx，与容器一致
  const centerX = width / 2
  const centerY = height / 2
  const labelDistance = 12 // 减小标签距离
  const textMargin = 15 // 文字预留空间（两行文字+间距）
  // 计算最大半径：(容器最小边 / 2) - 标签距离 - 文字预留
  const maxRadius = Math.min(width, height) / 2 - labelDistance - textMargin

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
        // 处理 progress 可能是数字或字符串的情况
        const progressValue = item.progress || "0%"
        const progressStr = typeof progressValue === "string" ? progressValue : `${progressValue}%`
        const percentage = parseFloat(progressStr.replace("%", "")) / 100
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
          // 处理 progress 可能是数字或字符串的情况
          const progressValue = item.progress || "0%"
          const progressStr =
            typeof progressValue === "string" ? progressValue : `${progressValue}%`
          const percentage = parseFloat(progressStr.replace("%", "")) / 100
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
      const labelRadius = maxRadius + labelDistance // 使用计算好的标签距离
      const x = centerX + Math.cos(angle) * labelRadius
      const y = centerY + Math.sin(angle) * labelRadius

      // 处理百分比显示
      const progressValue = item.progress || "0%"
      const progressStr = typeof progressValue === "string" ? progressValue : `${progressValue}%`

      return (
        <SvgText
          key={`label-${index}`}
          x={x}
          y={y}
          fill="rgba(124, 210, 105, 1)"
          fontSize={9} // 调整字体大小
          fontWeight="bold"
          textAnchor="middle"
        >
          <TSpan x={x} dy={0} textAnchor="middle">
          {item.name}
          </TSpan>
          <TSpan x={x} dy={10} textAnchor="middle" fontSize={8}>
            {progressStr}
          </TSpan>
        </SvgText>
      )
    })
  }

  return (
    <View style={styles.container}>
      <Svg width={width} height={height}>
        {/* 定义渐变 */}
        <Defs>
          <RadialGradient id="gradient" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="rgba(146, 222, 255, 1)" stopOpacity={1} />
            <Stop offset="100%" stopColor="rgba(92, 255, 103, 1)" stopOpacity={1} />
          </RadialGradient>
        </Defs>

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
    width: 194, // 194rpx 恢复原尺寸
    height: 169, // 169rpx 恢复原尺寸
    justifyContent: "center",
    alignItems: "center",
    // borderWidth: 1,
    // borderColor: "#e0e0e0",
    borderRadius: 4,
  },
  emptyText: {
    fontSize: 12,
    color: "#999",
  },
})

export default WritingAnalysis
