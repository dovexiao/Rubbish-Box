/**
 * 日志管理工具
 * 生产环境自动禁用console输出，提升性能
 */

const IS_DEV = __DEV__

/**
 * 日志级别
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

/**
 * 日志配置
 */
class LoggerConfig {
  // 生产环境默认只输出ERROR，开发环境输出所有
  private level: LogLevel = IS_DEV ? LogLevel.DEBUG : LogLevel.ERROR
  
  // 是否启用日志上报（可选）
  private enableReporting = false
  
  setLevel(level: LogLevel) {
    this.level = level
  }
  
  getLevel(): LogLevel {
    return this.level
  }
  
  setReporting(enabled: boolean) {
    this.enableReporting = enabled
  }
  
  isReportingEnabled(): boolean {
    return this.enableReporting
  }
}

const config = new LoggerConfig()

/**
 * 格式化日志消息
 */
function formatMessage(tag: string, ...args: any[]): string {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0]
  return `[${timestamp}] [${tag}] ${args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
  ).join(' ')}`
}

/**
 * 日志上报（可选功能）
 */
async function reportLog(level: string, tag: string, message: string) {
  if (!config.isReportingEnabled()) return
  
  try {
    // 这里可以实现日志上报到服务器
    // await fetch('/api/logs', {
    //   method: 'POST',
    //   body: JSON.stringify({ level, tag, message, timestamp: Date.now() })
    // })
  } catch (error) {
    // 上报失败不影响主流程
  }
}

/**
 * Logger类
 */
class Logger {
  private tag: string
  
  constructor(tag: string = 'App') {
    this.tag = tag
  }
  
  /**
   * DEBUG级别日志 - 仅开发环境
   */
  debug(...args: any[]) {
    if (config.getLevel() <= LogLevel.DEBUG) {
      const message = formatMessage(this.tag, ...args)
      console.log(message)
    }
  }
  
  /**
   * INFO级别日志
   */
  info(...args: any[]) {
    if (config.getLevel() <= LogLevel.INFO) {
      const message = formatMessage(this.tag, ...args)
      console.log(message)
    }
  }
  
  /**
   * WARN级别日志
   */
  warn(...args: any[]) {
    if (config.getLevel() <= LogLevel.WARN) {
      const message = formatMessage(this.tag, ...args)
      console.warn(message)
      reportLog('WARN', this.tag, message)
    }
  }
  
  /**
   * ERROR级别日志 - 始终输出并上报
   */
  error(...args: any[]) {
    if (config.getLevel() <= LogLevel.ERROR) {
      const message = formatMessage(this.tag, ...args)
      console.error(message)
      reportLog('ERROR', this.tag, message)
    }
  }
}

/**
 * 创建日志实例
 */
export function createLogger(tag: string): Logger {
  return new Logger(tag)
}

/**
 * 默认日志实例
 */
export const logger = new Logger('App')

/**
 * 全局日志配置
 */
export const loggerConfig = config

/**
 * 便捷方法
 */
export default {
  debug: (...args: any[]) => logger.debug(...args),
  info: (...args: any[]) => logger.info(...args),
  warn: (...args: any[]) => logger.warn(...args),
  error: (...args: any[]) => logger.error(...args),
  createLogger,
  config: loggerConfig,
  LogLevel,
}


