import { useCallback } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { saveMointorData } from "../services/app"

interface PostureData {
  correct_sitting_posture_time: number // 坐姿正确时间
  head_tilt_time: number // 头部倾斜时间
  lowering_the_head_time: number // 低头时间
  shoulder_tilt_time: number // 肩膀倾斜时间
}

/**
 * 数据存储和同步Hook
 * 100%还原UniApp App.vue中的数据同步逻辑
 */
export const useDataSync = () => {
  // 保存监测数据到服务器（一小时存一次）
  const saveMonitorData = useCallback(async (data: PostureData) => {
    try {
      console.log("保存监测数据到服务器:", data)

      const response = await saveMointorData({
        correct_sitting_posture_time: data.correct_sitting_posture_time || 0,
        head_tilt_time: data.head_tilt_time || 0,
        lowering_the_head_time: data.lowering_the_head_time || 0,
        shoulder_tilt_time: data.shoulder_tilt_time || 0,
      })

      console.log("监测数据保存成功:", response)
      return true
    } catch (error) {
      console.error("保存监测数据失败:", error)
      return false
    }
  }, [])

  // 本地存储数据
  const setLocalData = useCallback(async (key: string, value: any) => {
    try {
      const jsonValue = JSON.stringify(value)
      await AsyncStorage.setItem(key, jsonValue)
      console.log(`本地数据保存成功: ${key}`)
      return true
    } catch (error) {
      console.error(`本地数据保存失败: ${key}`, error)
      return false
    }
  }, [])

  // 获取本地存储数据
  const getLocalData = useCallback(async <T>(key: string, defaultValue?: T): Promise<T | null> => {
    try {
      const jsonValue = await AsyncStorage.getItem(key)
      if (jsonValue != null) {
        const parsedValue = JSON.parse(jsonValue)
        console.log(`本地数据获取成功: ${key}`)
        return parsedValue
      }
      return defaultValue || null
    } catch (error) {
      console.error(`本地数据获取失败: ${key}`, error)
      return defaultValue || null
    }
  }, [])

  // 删除本地存储数据
  const removeLocalData = useCallback(async (key: string) => {
    try {
      await AsyncStorage.removeItem(key)
      console.log(`本地数据删除成功: ${key}`)
      return true
    } catch (error) {
      console.error(`本地数据删除失败: ${key}`, error)
      return false
    }
  }, [])

  // 清除所有本地数据
  const clearAllLocalData = useCallback(async () => {
    try {
      await AsyncStorage.clear()
      console.log("所有本地数据清除成功")
      return true
    } catch (error) {
      console.error("清除本地数据失败:", error)
      return false
    }
  }, [])

  // 获取所有本地存储的键
  const getAllLocalKeys = useCallback(async (): Promise<string[]> => {
    try {
      const keys = await AsyncStorage.getAllKeys()
      console.log("获取所有本地存储键:", keys)
      return keys
    } catch (error) {
      console.error("获取本地存储键失败:", error)
      return []
    }
  }, [])

  // 批量设置本地数据
  const setMultipleLocalData = useCallback(async (keyValuePairs: [string, any][]) => {
    try {
      const stringPairs: [string, string][] = keyValuePairs.map(([key, value]) => [
        key,
        JSON.stringify(value),
      ])
      await AsyncStorage.multiSet(stringPairs)
      console.log("批量本地数据保存成功")
      return true
    } catch (error) {
      console.error("批量本地数据保存失败:", error)
      return false
    }
  }, [])

  // 批量获取本地数据
  const getMultipleLocalData = useCallback(async (keys: string[]): Promise<Record<string, any>> => {
    try {
      const keyValuePairs = await AsyncStorage.multiGet(keys)
      const result: Record<string, any> = {}

      keyValuePairs.forEach(([key, value]) => {
        if (value != null) {
          try {
            result[key] = JSON.parse(value)
          } catch {
            result[key] = value
          }
        }
      })

      console.log("批量本地数据获取成功")
      return result
    } catch (error) {
      console.error("批量本地数据获取失败:", error)
      return {}
    }
  }, [])

  return {
    // 服务器数据同步
    saveMonitorData,

    // 本地数据存储
    setLocalData,
    getLocalData,
    removeLocalData,
    clearAllLocalData,
    getAllLocalKeys,
    setMultipleLocalData,
    getMultipleLocalData,
  }
}
