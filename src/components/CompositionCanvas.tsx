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
  const GRID_COLUMNS = 13 // 恢复为13列，与UniApp原版保持一致
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
                  // 只在中文模式下显示边框
                  borderRightWidth: isChinese ? 0.5 : 0,
                },
              ]}
            />
          ))}
        </View>,
      )
    }
    return rows
  }

  // 渲染标题和分数
  const renderTitleAndScore = () => {
    if (title === "续") return null

    // 计算标题居中时的起始位置（左边需要空几个格子）
    const titleLength = title.length
    const emptyGridsLeft = Math.floor((GRID_COLUMNS - titleLength) / 2)
    const leftPadding = rpx(emptyGridsLeft * 16) // 手动转换 rpx，避免二次转换

    return (
      <View style={[styles.titleRow, { top: rpx(16.8) }]}>
        {/* 标题按格子显示，每个字符在单独的格子里 */}
        <View style={[styles.titleGridContainer, { paddingLeft: leftPadding }]}>
          {Array.from(title).map((char, charIndex) => (
            <View key={charIndex} style={styles.titleCharContainer}>
              <Text style={styles.titleChar}>{char}</Text>
            </View>
          ))}
        </View>
        {score > 0 && <Text style={styles.scoreText}>{score}</Text>}
      </View>
    )
  }

  // 渲染内容
  const renderContent = () => {
    const startRow = title !== "续" ? 1 : 0
    const contentTop = rpx(16.8 + 16 * startRow + 4 * startRow) // 手动计算并转换 rpx

    if (isChinese) {
      // 中文：每行13个字符
      return (
        <View
          style={[
            styles.contentContainer,
            { top: contentTop },
          ]}
        >
          {content.map((line, index) => (
            <View key={index} style={styles.chineseLineContainer}>
              {Array.from(line).map((char, charIndex) => (
                <View key={charIndex} style={styles.chineseCharContainer}>
                  <Text style={styles.chineseChar}>{char}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      )
    } else {
      // 英文：每行显示完整文本
      return (
        <View
          style={[
            styles.contentContainer,
            { top: contentTop },
          ]}
        >
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
    // shadowColor: "#228ae4",
    // shadowOffset: { width: 0, height: 0 },
    // shadowOpacity: 0.25,
    // shadowRadius: 9.375,
    // elevation: 4,
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
    left: "50%", // 水平居中
    marginLeft: -104, // 负的一半宽度 (208/2 = 104)
    width: 208, // 13列 × 16rpx = 208rpx
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
    left: "50%", // 水平居中，与网格背景对齐
    marginLeft: -104, // 负的一半宽度 (208/2 = 104)
    width: 208, // 13列 × 16rpx = 208rpx，与网格背景保持一致
    height: 16, // GRID_SIZE
    flexDirection: "row",
    alignItems: "center",
    zIndex: 1,
  },
  titleGridContainer: {
    flexDirection: "row",
    justifyContent: "flex-start", // 从左边开始排列，通过 paddingLeft 来实现居中对齐到格子
    alignItems: "center",
    flex: 1, // 占据剩余空间，让分数能正确显示
  },
  titleCharContainer: {
    width: 16, // 每个格子的宽度，正好对齐网格
    height: 16, // 每个格子的高度，正好对齐网格
    justifyContent: "center", // 垂直居中
    alignItems: "center", // 水平居中
  },
  titleChar: {
    fontSize: 10, // 字号适中，确保在格子内显示
    fontWeight: "bold",
    color: "#000000",
    includeFontPadding: false, // 移除额外的字体padding
    textAlign: "center",
    padding: 0, // 移除所有内边距
    margin: 0, // 移除所有外边距
  },
  scoreText: {
    position: "absolute",
    right: 10, // 调整右侧位置，适应新的标题行宽度
    fontSize: 24, // 24rpx
    fontWeight: "bold",
    color: "#FF0000",
  },
  contentContainer: {
    position: "absolute",
    left: "50%", // 水平居中，与网格背景对齐
    marginLeft: -104, // 负的一半宽度 (208/2 = 104)
    width: 208, // 13列 × 16rpx = 208rpx，与网格背景保持一致
    zIndex: 1,
  },
  chineseLineContainer: {
    flexDirection: "row",
    height: 16, // GRID_SIZE
    marginBottom: 4, // LINE_GAP
  },
  chineseCharContainer: {
    width: 16, // GRID_SIZE，正好对齐网格
    height: 16, // 正好对齐网格
    justifyContent: "center", // 垂直居中
    alignItems: "center", // 水平居中
  },
  chineseChar: {
    fontSize: 10, // 字号适中，确保在格子内显示
    color: "#000000",
    includeFontPadding: false, // 移除额外的字体padding
    textAlign: "center",
    padding: 0, // 移除所有内边距
    margin: 0, // 移除所有外边距
  },
  englishLineContainer: {
    height: 16, // GRID_SIZE
    marginBottom: 4, // LINE_GAP
    justifyContent: "center",
  },
  englishText: {
    fontSize: 9, // 增大字号
    color: "#000000",
    lineHeight: 16,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
})

export default CompositionCanvas
