import * as FileSystem from "expo-file-system"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Image } from "react-native"

const CACHE_DIR = `${FileSystem.cacheDirectory}home_bg/`
const CACHE_KEY = "home_bg_cache_info"
const CACHE_EXPIRY_DAYS = 7 // 缓存有效期7天

interface CacheInfo {
  url: string
  localPath: string
  timestamp: number
}

/**
 * 初始化缓存目录
 */
async function ensureCacheDir(): Promise<void> {
  const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR)
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true })
  }
}

/**
 * 从URL生成缓存文件名
 */
function getCacheFileName(url: string): string {
  // 从URL提取实际的文件扩展名
  let extension = 'jpg' // 默认扩展名

  try {
    // 解析URL路径部分
    const urlObj = new URL(url)
    const pathname = urlObj.pathname

    // 从路径中提取文件扩展名
    const lastDotIndex = pathname.lastIndexOf('.')
    if (lastDotIndex !== -1) {
      const ext = pathname.substring(lastDotIndex + 1).toLowerCase()
      // 验证扩展名是否为有效的图片格式
      const validExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp']
      if (validExtensions.includes(ext)) {
        extension = ext
      }
    }
  } catch (error) {
    console.warn('🖼️ [缓存文件名] 解析URL失败，使用默认扩展名:', error)
  }

  // 使用完整的URL进行hash，避免文件名冲突
  let hash = 0
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // 转换为32位整数
  }

  return `bg_${Math.abs(hash)}.${extension}`
}

/**
 * 检查缓存是否过期
 */
function isCacheExpired(timestamp: number): boolean {
  const now = Date.now()
  const expiryTime = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000
  return now - timestamp > expiryTime
}

/**
 * 获取缓存的背景图路径和URL
 */
export async function getCachedHomeBg(): Promise<{ localPath: string; url: string } | null> {
  try {
    console.log("🖼️ [缓存检查] 开始检查缓存")
    const cacheInfoStr = await AsyncStorage.getItem(CACHE_KEY)
    if (!cacheInfoStr) {
      console.log("🖼️ [缓存检查] AsyncStorage中没有缓存信息")
      return null
    }

    const cacheInfo: CacheInfo = JSON.parse(cacheInfoStr)
    console.log("🖼️ [缓存检查] 缓存信息:", { url: cacheInfo.url, localPath: cacheInfo.localPath, timestamp: new Date(cacheInfo.timestamp).toLocaleString() })
    
    // 检查缓存是否过期
    if (isCacheExpired(cacheInfo.timestamp)) {
      console.log("🖼️ [缓存检查] 背景图缓存已过期，清除缓存")
      await clearHomeBgCache()
      return null
    }

    // 检查文件是否存在
    console.log("🖼️ [缓存检查] 检查文件是否存在:", cacheInfo.localPath)
    const fileInfo = await FileSystem.getInfoAsync(cacheInfo.localPath)
    if (!fileInfo.exists) {
      console.log("🖼️ [缓存检查] 缓存文件不存在，清除缓存信息")
      await AsyncStorage.removeItem(CACHE_KEY)
      return null
    }

    console.log("🖼️ [缓存检查] 缓存有效，返回缓存信息")
    return {
      localPath: cacheInfo.localPath,
      url: cacheInfo.url,
    }
  } catch (error) {
    console.error("🖼️ [缓存检查] 获取缓存背景图失败:", error)
    return null
  }
}

/**
 * 下载并缓存背景图
 */
export async function downloadAndCacheHomeBg(url: string): Promise<string | null> {
  try {
    console.log("🖼️ 开始下载背景图:", url)

    await ensureCacheDir()

    const cacheFileName = getCacheFileName(url)
    const localPath = `${CACHE_DIR}${cacheFileName}`

    console.log("🖼️ 保存路径:", localPath)

    // 设置超时时间为30秒
    const downloadPromise = FileSystem.downloadAsync(url, localPath)
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("下载超时")), 30000)
    )

    // 下载图片（带超时）
    const downloadResult = await Promise.race([downloadPromise, timeoutPromise])

    if (downloadResult.status === 200) {
      // 保存缓存信息
      const cacheInfo: CacheInfo = {
        url,
        localPath: downloadResult.uri,
        timestamp: Date.now(),
      }
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cacheInfo))

      console.log("✅ 背景图下载并缓存成功，路径:", downloadResult.uri)
      return downloadResult.uri
    } else {
      console.error("❌ 背景图下载失败，状态码:", downloadResult.status)
      return null
    }
  } catch (error) {
    console.error("❌ 下载并缓存背景图失败:", error)
    return null
  }
}

/**
 * 预加载图片（使用 Image.prefetch）
 */
export async function prefetchHomeBg(url: string): Promise<boolean> {
  try {
    console.log("🖼️ 预加载背景图:", url)
    await Image.prefetch(url)
    console.log("✅ 背景图预加载成功")
    return true
  } catch (error) {
    console.error("❌ 背景图预加载失败:", error)
    return false
  }
}

/**
 * 清除背景图缓存
 */
export async function clearHomeBgCache(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CACHE_KEY)
    
    const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR)
    if (dirInfo.exists) {
      await FileSystem.deleteAsync(CACHE_DIR, { idempotent: true })
    }
    
    console.log("🗑️ 背景图缓存已清除")
  } catch (error) {
    console.error("清除背景图缓存失败:", error)
  }
}

/**
 * 获取背景图源（优先使用缓存，否则返回URL）
 */
export async function getHomeBgSource(url: string): Promise<{ uri: string } | null> {
  // 先检查缓存
  const cachedPath = await getCachedHomeBg()
  if (cachedPath) {
    console.log("🖼️ 使用缓存的背景图")
    return { uri: cachedPath.localPath }
  }

  // 如果没有缓存，返回网络URL
  console.log("🖼️ 使用网络背景图URL")
  return { uri: url }
}

