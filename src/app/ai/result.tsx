import { useState, useEffect } from "react"
import { View, ScrollView, ActivityIndicator, Text } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useLocalSearchParams, useRouter } from "expo-router"

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
import { showError } from "../../utils/toast"
import { useActivityTracking } from "../../hooks/useActivityTracking"

/**
 * AI结果页面
 * 100%还原UniApp项目 /src/pages/AI/ai-result.vue
 * 根据类型显示题目批改结果或作文批改结果
 */
export default function AIResultScreen() {
  const params = useLocalSearchParams()
  const router = useRouter()
  const [type, setType] = useState("")
  const [data, setData] = useState<any>({})
  const [compositionInfo, setCompositionInfo] = useState<AiResponse>({})
  const [isLoading, setIsLoading] = useState(true)
  
  // 活动追踪 - 追踪AI批改结果查看
  const { startHomework, startComposition } = useActivityTracking({
    autoExitOnUnmount: true,
  })

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      
      try {
        // 从 AI 分析页面跳转过来（通过 batch_id）
        if (params.batch_id) {
          console.log("📦 通过 batch_id 查询结果:", params.batch_id)
          const correctionType = params.type as string
          setType(correctionType === "composition" ? "作文" : "题目")
          
          // 📊 启动活动追踪（如果从loading页面跳转过来，这里会覆盖之前的追踪，但保持类型一致）
          if (correctionType === "composition") {
            console.log("📊 [活动追踪] 查看作文批改结果")
            startComposition({
              compositionId: params.batch_id as string,
              compositionName: "AI作文批改结果",
            })
          } else {
            console.log("📊 [活动追踪] 查看作业批改结果")
            startHomework({
              homeworkId: params.batch_id as string,
              homeworkName: "AI作业批改结果",
            })
          }
          
          const res = await getCompositionCorrectionRecordDetails({ 
            batch_id: params.batch_id as string 
          })
          
          if (correctionType === "composition") {
             setCompositionInfo(res)
          } else {
             setData(res)
          }
        }
        // 是作文收录来的
        else if (params.id) {
          setType("作文")
          
          // 📊 启动作文追踪
          console.log("📊 [活动追踪] 查看作文批改结果（从收录）")
          startComposition({
            compositionId: params.id as string,
            compositionName: "AI作文批改结果",
          })
          
          const res = await getCompositionCorrectionRecordDetails({ id: Number(params.id) })
          setCompositionInfo(res)
        }
        // 等待一小段时间，让 React 完成初始渲染
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error: any) {
        console.error("加载数据失败:", error)
        const errorMessage = error?.message || "加载批改结果失败，请重试"
        
        // 显示错误提示
        showError(errorMessage)
        
        // 2秒后返回上一页
        setTimeout(() => {
          router.back()
        }, 2000)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, params.resData, params.cache_key, params.batch_id, params.type])

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

      {/* 加载状态 */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4891FF" />
          <Text style={styles.loadingText}>正在加载批改结果...</Text>
        </View>
      ) : (
        /* 滚动内容 */
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {type === "题目" && <QuestionResult data={data} />}
            {type === "作文" && <CompositionResult compositionInfo={compositionInfo} />}
          </View>
        </ScrollView>
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 10,
    color: "#666",
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
