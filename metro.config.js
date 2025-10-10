// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config")

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname)

// 自定义服务器配置
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      res.setHeader("Access-Control-Allow-Origin", "*")
      middleware(req, res, next)
    }
  },
  port: 8081,
  host: "0.0.0.0",
}

module.exports = config
