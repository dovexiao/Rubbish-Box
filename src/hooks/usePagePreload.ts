import { useEffect, useState } from 'react'
import { InteractionManager } from 'react-native'

/**
 * 页面预加载Hook
 * 实现立即显示页面，然后异步加载内容的策略
 */
export function usePagePreload<T>(
  loadFunction: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // 立即显示页面，然后异步加载数据
    InteractionManager.runAfterInteractions(async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await loadFunction()
        setData(result)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    })
  }, dependencies)

  return { data, loading, error, refetch: () => {
    InteractionManager.runAfterInteractions(async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await loadFunction()
        setData(result)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    })
  }}
}

/**
 * 并行预加载多个数据源
 */
export function useParallelPreload<T extends Record<string, any>>(
  loadFunctions: T,
  dependencies: any[] = []
) {
  const [data, setData] = useState<Partial<T> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    InteractionManager.runAfterInteractions(async () => {
      try {
        setLoading(true)
        setError(null)
        
        // 并行执行所有加载函数
        const results = await Promise.allSettled(
          Object.entries(loadFunctions).map(async ([key, loadFn]) => ({
            key,
            data: await loadFn()
          }))
        )

        // 处理结果
        const successResults: any = {}
        const errors: any = {}

        results.forEach((result, index) => {
          const key = Object.keys(loadFunctions)[index]
          if (result.status === 'fulfilled') {
            successResults[key] = result.value.data
          } else {
            errors[key] = result.reason
          }
        })

        setData(successResults)
        
        // 如果有错误，记录但不阻止页面显示
        if (Object.keys(errors).length > 0) {
          console.warn('部分数据加载失败:', errors)
        }
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    })
  }, dependencies)

  return { data, loading, error }
}
