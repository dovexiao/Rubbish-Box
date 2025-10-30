// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config")

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname)

// // 确保 expo-updates 正常工作
// config.resolver.platforms = ['ios', 'android', 'native', 'web']

// // 添加 .tflite 文件支持（用于 TensorFlow Lite 模型）
// config.resolver.assetExts.push('tflite')

module.exports = config
