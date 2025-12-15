import React, { memo, useState, useEffect, useRef } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { createStyles } from '../utils/rpxStyleSheet'

interface LazyScreenProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  delay?: number
  minHeight?: number
}

/**
 * 懒加载屏幕组件
 * 延迟渲染子组件，提升初始页面切换速度
 */
export const LazyScreen = memo(function LazyScreen({
  children,
  fallback,
  delay = 50,
  minHeight = 200,
}: LazyScreenProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    // 延迟加载，让页面切换更流畅
    timeoutRef.current = setTimeout(() => {
      setIsLoaded(true)
    }, delay)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [delay])

  if (!isLoaded) {
    return (
      <View style={[styles.container, { minHeight }]}>
        {fallback || (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#1890ff" />
          </View>
        )}
      </View>
    )
  }

  return <>{children}</>
})

const styles = createStyles({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export default LazyScreen
