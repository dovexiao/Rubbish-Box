import React, { memo, useState, useEffect, useRef } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { createStyles } from '../utils/rpxStyleSheet'

interface FastScreenProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  preloadDelay?: number
  showLoading?: boolean
}

/**
 * 快速屏幕组件
 * 提供即时的页面切换体验
 */
export const FastScreen = memo(function FastScreen({
  children,
  fallback,
  preloadDelay = 0,
  showLoading = true,
}: FastScreenProps) {
  const [isReady, setIsReady] = useState(preloadDelay === 0)
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (preloadDelay > 0) {
      timeoutRef.current = setTimeout(() => {
        setIsReady(true)
      }, preloadDelay)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [preloadDelay])

  if (!isReady) {
    return (
      <View style={styles.container}>
        {fallback || (
          showLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#1890ff" />
            </View>
          ) : null
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

export default FastScreen
