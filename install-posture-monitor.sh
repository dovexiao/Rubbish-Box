#!/bin/bash

# 姿势监控功能 - 依赖安装脚本
# 自动安装所有必需的依赖包

set -e

echo "🚀 开始安装姿势监控功能依赖..."
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 Node.js，请先安装 Node.js"
    exit 1
fi

echo "📦 安装核心依赖..."

# 相机库
echo "  ├─ react-native-vision-camera"
npm install react-native-vision-camera

# 音频播放
echo "  ├─ react-native-sound"
npm install react-native-sound

# 数据持久化
echo "  ├─ @react-native-async-storage/async-storage"
npm install @react-native-async-storage/async-storage

# 权限管理
echo "  ├─ react-native-permissions"
npm install react-native-permissions

echo ""
echo "✅ 核心依赖安装完成！"
echo ""

# 询问是否安装 TensorFlow Lite
read -p "是否安装 TensorFlow Lite? (AI 姿势检测，可选，有依赖冲突风险) [y/N]: " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📦 安装 TensorFlow Lite 依赖..."
    echo "⚠️  注意: TensorFlow Lite 可能与现有 AsyncStorage 版本冲突"
    echo "   使用 --legacy-peer-deps 绕过冲突..."
    npm install @tensorflow/tfjs @tensorflow/tfjs-react-native --legacy-peer-deps
    npm install expo-gl react-native-fs --legacy-peer-deps
    echo "✅ TensorFlow Lite 依赖安装完成！"
    echo "⚠️  如遇到运行时错误，请卸载: npm uninstall @tensorflow/tfjs-react-native"
fi

echo ""
echo "🍎 iOS Pod 安装..."
if [ -d "ios" ]; then
    cd ios
    if command -v pod &> /dev/null; then
        pod install
        echo "✅ iOS Pod 安装完成！"
    else
        echo "⚠️  警告: 未找到 CocoaPods，请手动运行: cd ios && pod install"
    fi
    cd ..
else
    echo "⚠️  警告: 未找到 ios 目录"
fi

echo ""
echo "🎉 所有依赖安装完成！"
echo ""
echo "📋 下一步："
echo "  1. 配置权限 (查看 POSTURE_MONITOR_SETUP.md)"
echo "  2. 复制音频文件到 assets/audio/"
echo "  3. 运行 npm run android 或 npm run ios"
echo ""
echo "📖 完整文档: POSTURE_MONITOR_SETUP.md"
echo ""

