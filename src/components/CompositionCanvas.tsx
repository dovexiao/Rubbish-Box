import { View, Text } from "react-native"
import { createStyles, rpx } from "../utils/rpxStyleSheet"

interface Props {
  id: string
  title: string
  score: number
  isChinese: boolean
  content: string[]
}

/**
 * 作文Canvas组件
 * 由于React Native不支持Canvas绘制，使用View + Text模拟网格纸效果
 * 还原UniApp项目 /src/pages/AI/components/CompositionCanvas.vue
 */
export function CompositionCanvas({ title, score, isChinese, content }: Props) {
  const GRID_SIZE = 16 // 每个格子大小 16rpx
  const LINE_GAP = 4 // 行间距 4rpx
  const GRID_COLUMNS = 13 // 固定13列
  const GRID_ROWS = 14 // 固定14行

  // 生成网格背景
  const renderGrid = () => {
    const rows = []
    for (let i = 0; i < GRID_ROWS; i++) {
      rows.push(
        <View key={i} style={styles.gridRow}>
          {Array.from({ length: GRID_COLUMNS }).map((_, j) => (
            <View
              key={j}
              style={[
                styles.gridCell,
                {
                  borderRightWidth: j < GRID_COLUMNS - 1 && isChinese ? 0.5 : 0,
                },
              ]}
            />
          ))}
        </View>
      )
    }
    return rows
  }

  // 渲染标题和分数
  const renderTitleAndScore = () => {
    if (title === "续") return null

    return (
      <View style={styles.titleRow}>
        <Text style={styles.titleText}>{title}</Text>
        {score > 0 && <Text style={styles.scoreText}>{score}</Text>}
      </View>
    )
  }

  // 渲染内容
  const renderContent = () => {
    const startRow = title !== "续" ? 1 : 0

    if (isChinese) {
      // 中文：每行13个字符
      return (
        <View style={[styles.contentContainer, { top: rpx(GRID_SIZE * startRow + LINE_GAP * startRow) }]}>
          {content.map((line, index) => (
            <View key={index} style={styles.chineseLineContainer}>
              {Array.from(line).map((char, charIndex) => (
                <Text key={charIndex} style={styles.chineseChar}>
                  {char}
                </Text>
              ))}
            </View>
          ))}
        </View>
      )
    } else {
      // 英文：每行显示完整文本
      return (
        <View style={[styles.contentContainer, { top: rpx(GRID_SIZE * startRow + LINE_GAP * startRow) }]}>
          {content.map((line, index) => (
            <View key={index} style={styles.englishLineContainer}>
              <Text style={styles.englishText}>{line}</Text>
            </View>
          ))}
        </View>
      )
    }
  }

  return (
    <View style={styles.compositionPreview}>
      <View style={styles.canvasContainer}>
        {/* 网格背景 */}
        <View style={styles.gridBackground}>{renderGrid()}</View>

        {/* 标题和分数 */}
        {renderTitleAndScore()}

        {/* 内容 */}
        {renderContent()}
      </View>
    </View>
  )
}

const styles = createStyles({
  compositionPreview: {
    width: 257.8125, // 257.8125rpx
    height: 318, // 318rpx
    backgroundColor: "#ffffff",
    shadowColor: "#228ae4",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 9.375,
    elevation: 4,
    borderRadius: 7.8125, // 7.8125rpx
    overflow: "hidden",
    position: "relative",
  },
  canvasContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  gridBackground: {
    position: "absolute",
    top: 16.8, // OUTER_PADDING 16.8rpx
    left: 0,
    right: 0,
    paddingHorizontal: 17, // 居中对齐
  },
  gridRow: {
    flexDirection: "row",
    height: 16, // GRID_SIZE 16rpx
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: "#D6D6D6",
    marginBottom: 4, // LINE_GAP 4rpx
  },
  gridCell: {
    width: 16, // GRID_SIZE 16rpx
    height: 16,
    borderLeftWidth: 0.5,
    borderColor: "#D6D6D6",
  },
  titleRow: {
    position: "absolute",
    top: 16.8, // OUTER_PADDING
    left: 0,
    right: 0,
    height: 16, // GRID_SIZE
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  titleText: {
    fontSize: 10, // 10rpx
    fontWeight: "bold",
    color: "#000000",
    textAlign: "center",
  },
  scoreText: {
    position: "absolute",
    right: 30, // 右侧位置
    fontSize: 24, // 24rpx
    fontWeight: "bold",
    color: "#FF0000",
  },
  contentContainer: {
    position: "absolute",
    left: 17, // 居中对齐
    right: 17,
    zIndex: 1,
  },
  chineseLineContainer: {
    flexDirection: "row",
    height: 16, // GRID_SIZE
    marginBottom: 4, // LINE_GAP
  },
  chineseChar: {
    width: 16, // GRID_SIZE
    height: 16,
    fontSize: 10, // 10rpx
    color: "#000000",
    textAlign: "center",
    lineHeight: 16, // 垂直居中
  },
  englishLineContainer: {
    height: 16, // GRID_SIZE
    marginBottom: 4, // LINE_GAP
    justifyContent: "center",
  },
  englishText: {
    fontSize: 8.5, // 8.5rpx
    color: "#000000",
    lineHeight: 16,
  },
})

export default CompositionCanvas



