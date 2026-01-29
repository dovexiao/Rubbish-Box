// eventCenter.ts
import EventEmitter from 'eventemitter3'

/**
 * 全局事件中心（Event Center）
 *
 * 用途：
 * - 用于跨页面 / 跨组件的一次性事件通知
 * ⚠️ 注意：
 * - 只用于「通知」，不要用来存状态
 * - 状态本体应放在 store / state / props 中
 * 事件命名建议：
 * - 使用动词 + 业务名：deviceReload / userLogout / orderPaid
 * - 避免过于宽泛的名字：update / change / refresh
 *
 * 使用示例：
 * 
 * 1️⃣ 发送事件（emit）
 * ```ts
 * import eventCenter from '@/utils/eventCenter'
 *
 * eventCenter.emit('deviceReload', { id: '123' })
 * ```
 * 2️⃣ 监听事件（on）
 *
 * ```ts
 * import { useEffect } from 'react'
 * import eventCenter from '@/utils/eventCenter'
 *
 * useEffect(() => {
 *   const handler = (payload) => {
 *     console.log('收到事件', payload)
 *   }
 *
 *   eventCenter.on('deviceReload', handler)
 *
 *   return () => {
 *     eventCenter.off('deviceReload', handler)
 *   }
 * }, [])
 * ```
 *
 * 3️⃣ 一次性监听（once）
 *
 * ```ts
 * eventCenter.once('loginSuccess', () => {
 *   console.log('只会触发一次')
 * })
 * ```
 */
const eventCenter = new EventEmitter()

export default eventCenter
