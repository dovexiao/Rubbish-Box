import React, { memo, useRef, useEffect } from 'react'
import { InteractionManager } from 'react-native'

interface PreloadScreenProps {
  children: React.ReactNode
  preloadDelay?: number
}

/**
 * 预加载屏幕组件
 * 使用InteractionManager确保在交互完成后才渲染
 */
export const PreloadScreen = memo(function PreloadScreen({
  children,
  preloadDelay = 0,
}: PreloadScreenProps) {
  const [isReady, setIsReady] = React.useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    // 等待所有交互完成后再渲染
    const task = InteractionManager.runAfterInteractions(() => {
      if (preloadDelay > 0) {
        timeoutRef.current = setTimeout(() => {
          setIsReady(true)
        }, preloadDelay)
      } else {
        setIsReady(true)
      }
    })

    return () => {
      task.cancel()
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [preloadDelay])

  if (!isReady) {
    return null
  }

  return <>{children}</>
})

export default PreloadScreen
