import { useCallback, useRef } from 'react'
import { InteractionManager } from 'react-native'

/**
 * 快速导航Hook
 * 优化页面切换性能，提供跟手感体验
 */
export function useFastNavigation() {
  const navigationRef = useRef<any>(null)
  const isNavigating = useRef(false)

  // 设置导航引用
  const setNavigationRef = useCallback((ref: any) => {
    navigationRef.current = ref
  }, [])

  // 快速导航函数
  const fastNavigate = useCallback((routeName: string, params?: any) => {
    if (!navigationRef.current || isNavigating.current) {
      return
    }

    isNavigating.current = true

    // 立即导航
    navigationRef.current.navigate(routeName, params)

    // 使用InteractionManager确保导航完成
    InteractionManager.runAfterInteractions(() => {
      isNavigating.current = false
    })
  }, [])

  // 重置导航状态
  const resetNavigationState = useCallback(() => {
    isNavigating.current = false
  }, [])

  return {
    setNavigationRef,
    fastNavigate,
    resetNavigationState,
    isNavigating: isNavigating.current,
  }
}

export default useFastNavigation
