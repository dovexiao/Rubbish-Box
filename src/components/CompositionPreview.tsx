import { View, Text, ScrollView } from "react-native"
import { createStyles } from "../utils/rpxStyleSheet"

interface Props {
  title: string
  score: number
  isChinese: boolean
  content: string[] // 每一行的内容
}

/**
 * 作文预览组件
 * 替代UniApp的Canvas实现，使用纯文本渲染
 * 精确复制UniApp的Canvas样式和布局
 */
export function CompositionPreview({ title, score, isChinese, content }: Props) {
  return (
    <View style={styles.compositionPreview}>
      <View style={styles.canvasContainer}>
        {/* 标题和分数 */}
        {title !== "续" && (
          <View style={styles.titleRow}>
            <Text style={styles.titleText}>{title}</Text>
            {score > 0 && <Text style={styles.scoreText}>{score}</Text>}
          </View>
        )}

        {/* 内容区域 */}
        <ScrollView
          style={styles.contentScroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {isChinese ? (
            // 中文作文：每行按格子显示
            content.map((line, index) => (
              <View key={index} style={styles.line}>
                {/* 使用网格布局显示每个字符 */}
                <View style={styles.gridRow}>
                  {Array.from(line).map((char, charIndex) => (
                    <View key={charIndex} style={styles.gridCell}>
                      <Text style={styles.chineseChar}>{char}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))
          ) : (
            // 英文作文：按行显示
            content.map((line, index) => (
              <Text key={index} style={styles.englishLine}>
                {line}
              </Text>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  )
}

const styles = createStyles({
  compositionPreview: {
    width: 257.8125, // UniApp canvas宽度
    height: 318, // UniApp canvas高度
    backgroundColor: "#ffffff",
    shadowColor: "#228ae4",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 9.375,
    elevation: 5,
    borderRadius: 7.8125, // UniApp: 7.8125rpx
    borderWidth: 3.516, // UniApp: border: 3.516rpx solid #bfdbff
    borderColor: "#bfdbff",
    overflow: "hidden",
  },
  canvasContainer: {
    flex: 1,
    padding: 16.8, // UniApp: OUTER_PADDING
  },

  // 标题行
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    height: 16, // 一行格子的高度
  },
  titleText: {
    fontSize: 10, // UniApp canvas fontSize
    fontWeight: "bold",
    color: "#000000",
    textAlign: "center",
    flex: 1,
  },
  scoreText: {
    fontSize: 24, // UniApp canvas scoreFontSize
    fontWeight: "bold",
    color: "#FF0000",
    position: "absolute",
    right: 0,
    top: -5,
  },

  // 内容区域
  contentScroll: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 10,
  },

  // 中文作文 - 网格布局
  line: {
    marginBottom: 4, // UniApp: LINE_GAP
  },
  gridRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  gridCell: {
    width: 16, // UniApp: GRID_SIZE
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  chineseChar: {
    fontSize: 10, // UniApp canvas fontSize
    color: "#000000",
    textAlign: "center",
  },

  // 英文作文
  englishLine: {
    fontSize: 8.5, // UniApp canvas englishFontSize
    color: "#000000",
    lineHeight: 20, // UniApp: gridSizePx + lineGapPx
    marginBottom: 4,
  },
})

export default CompositionPreview

