import { useState, useEffect } from "react"
import { View, ScrollView } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useLocalSearchParams } from "expo-router"

import { CompositionResult } from "../../components/CompositionResult"
import { NavBar } from "../../components/NavBar"
import { QuestionResult } from "../../components/QuestionResult"
import { StatusBar } from "../../components/StatusBar"
import {
  getQuestion,
  getCompositionCorrectionRecordDetails,
  type AiResponse,
} from "../../services/ai"
import { createStyles } from "../../utils/rpxStyleSheet"

/**
 * AI结果页面
 * 100%还原UniApp项目 /src/pages/AI/ai-result.vue
 * 根据类型显示题目批改结果或作文批改结果
 */
export default function AIResultScreen() {
  const params = useLocalSearchParams()
  const [type, setType] = useState("")
  const [data, setData] = useState<any>({})
  const [compositionInfo, setCompositionInfo] = useState<AiResponse>({})

  useEffect(() => {
    // 是作文收录来的
    if (params.id) {
      setType("作文")
      getCompositionCorrectionRecordDetails({ id: Number(params.id) }).then((res) => {
        if (res.ai_response) {
          setCompositionInfo(res.ai_response)
        }
      })
    }
    // 作文批改
    else if (params.resData) {
      const parsedData = JSON.parse(params.resData as string)
      setData(parsedData)
      setType(parsedData.select)
      if (parsedData.select === "作文" && parsedData.ai_response) {
        setCompositionInfo(parsedData.ai_response)
      }
    }
    // 题目批改
    else if (params.cache_key) {
      getQuestion({ cache_key: params.cache_key as string }).then((res) => {
        setType("题目")
        setData(res)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, params.resData, params.cache_key])

  return (
    <LinearGradient
      colors={["#93abff", "#e4f4ff", "#ecf8ff", "#ffffff"]}
      locations={[-0.1128, 0.1494, 0.8474, 1.0586]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.aiResult}
    >
      {/* 头部 */}
      <View style={styles.header}>
        <StatusBar theme="dark" backgroundColor="transparent" translucent={true} />
        <NavBar title={type === "作文" ? "作文批改" : "试题批改"} leftArrow goBackDelta={1} />
      </View>

      {/* 滚动内容 */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {type === "题目" && <QuestionResult data={data} />}
          {type === "作文" && <CompositionResult compositionInfo={compositionInfo} />}
        </View>
      </ScrollView>
    </LinearGradient>
  )
}

const styles = createStyles({
  aiResult: {
    width: "100%" as const,
    height: "100%" as const,
    flex: 1,
    flexDirection: "column" as const,
  },
  header: {
    flexShrink: 0,
  },
  scrollContent: {
    flex: 1,
    height: 0,
  },
  content: {
    paddingHorizontal: 15.625, // 20rpx转rpx
    paddingBottom: 15.625,
  },
})
