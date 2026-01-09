/**
 * 视频时间工具函数
 */

/**
 * 格式化时间为 HH:MM:SS
 * @param seconds 秒数
 * @returns 格式化后的时间字符串
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "00:00:00"

  const totalSeconds = Math.floor(seconds)
  const hours = Math.floor(totalSeconds / 3600)
  const mins = Math.floor((totalSeconds % 3600) / 60)
  const secs = totalSeconds % 60

  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

/**
 * 将时间格式"HH:MM:SS"转换为秒数
 * @param timeStr 时间字符串
 * @returns 秒数
 */
export function parseTimeToSeconds(timeStr: string): number {
  if (!/^\d{2}:\d{2}:\d{2}$/.test(timeStr)) return 0

  const [hours, minutes, seconds] = timeStr.split(":").map(Number)

  if (isNaN(hours) || isNaN(minutes) || isNaN(seconds) || minutes >= 60 || seconds >= 60) return 0

  return Math.floor(hours * 3600 + minutes * 60 + seconds)
}

