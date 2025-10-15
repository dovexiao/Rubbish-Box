import { useState, useEffect, useCallback } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

// 主题配置接口
export interface ReaderTheme {
  name: string
  bgColor: string
  textColor: string
  titleColor: string
  spineColor: string
  highlightColor: string
}

// 预定义主题
export const READER_THEMES: ReaderTheme[] = [
  {
    name: "默认",
    bgColor: "#f8f5e8",
    textColor: "#333333",
    titleColor: "#2c3e50",
    spineColor: "rgba(0, 0, 0, 0.1)",
    highlightColor: "#e67e22",
  },
  {
    name: "护眼",
    bgColor: "#e8f0e0",
    textColor: "#3a3a3a",
    titleColor: "#2c3e50",
    spineColor: "rgba(0, 0, 0, 0.05)",
    highlightColor: "#27ae60",
  },
  {
    name: "夜间",
    bgColor: "#1c1c1e",
    textColor: "#d1d1d6",
    titleColor: "#f1f1f1",
    spineColor: "rgba(255, 255, 255, 0.1)",
    highlightColor: "#f39c12",
  },
]

/**
 * 阅读器主题管理Hook
 * 100%还原UniApp的主题切换功能
 */
export const useReaderTheme = (bookId?: number) => {
  const [currentTheme, setCurrentTheme] = useState(0)
  const [fontSize, setFontSize] = useState(16)

  // 获取当前主题对象
  const theme = READER_THEMES[currentTheme] || READER_THEMES[0]

  // 保存阅读设置
  const saveReaderSettings = useCallback(async () => {
    try {
      const settings = {
        fontSize,
        theme: currentTheme,
      }
      const key = bookId ? `reader_settings_${bookId}` : "reader_settings_global"
      await AsyncStorage.setItem(key, JSON.stringify(settings))
      console.log("阅读设置保存成功")
    } catch (error) {
      console.error("保存阅读设置失败:", error)
    }
  }, [fontSize, currentTheme, bookId])

  // 加载阅读设置
  const loadReaderSettings = useCallback(async () => {
    try {
      const key = bookId ? `reader_settings_${bookId}` : "reader_settings_global"
      const settingsStr = await AsyncStorage.getItem(key)

      if (settingsStr) {
        const settings = JSON.parse(settingsStr)
        setFontSize(settings.fontSize || 16)
        setCurrentTheme(settings.theme || 0)
        console.log("阅读设置加载成功:", settings)
      }
    } catch (error) {
      console.error("加载阅读设置失败:", error)
    }
  }, [bookId])

  // 切换主题
  const changeTheme = useCallback((themeIndex: number) => {
    if (themeIndex >= 0 && themeIndex < READER_THEMES.length) {
      setCurrentTheme(themeIndex)
    }
  }, [])

  // 增加字体大小
  const increaseFontSize = useCallback(() => {
    setFontSize((prev) => {
      const newSize = Math.min(prev + 1, 24)
      return newSize
    })
  }, [])

  // 减小字体大小
  const decreaseFontSize = useCallback(() => {
    setFontSize((prev) => {
      const newSize = Math.max(prev - 1, 12)
      return newSize
    })
  }, [])

  // 设置字体大小
  const setFontSizeValue = useCallback((size: number) => {
    const clampedSize = Math.max(12, Math.min(24, size))
    setFontSize(clampedSize)
  }, [])

  // 初始化时加载设置
  useEffect(() => {
    loadReaderSettings()
  }, [loadReaderSettings])

  // 设置变化时自动保存
  useEffect(() => {
    const timer = setTimeout(() => {
      saveReaderSettings()
    }, 500) // 防抖保存

    return () => clearTimeout(timer)
  }, [fontSize, currentTheme, saveReaderSettings])

  return {
    // 主题相关
    currentTheme,
    theme,
    themes: READER_THEMES,
    changeTheme,

    // 字体相关
    fontSize,
    increaseFontSize,
    decreaseFontSize,
    setFontSize: setFontSizeValue,

    // 设置管理
    saveReaderSettings,
    loadReaderSettings,
  }
}

