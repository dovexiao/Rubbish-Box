#!/bin/bash
# eas-build-pre-install.sh

echo "=== 构建环境信息 ==="
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Current directory: $(pwd)"
echo "=== 网络配置检查 ==="

# 检查网络连通性
ping -c 3 8.8.8.8

echo "=== Android 构建环境检查 ==="
echo "JAVA_HOME: $JAVA_HOME"
echo "ANDROID_HOME: $ANDROID_HOME"
echo "ANDROID_SDK_ROOT: $ANDROID_SDK_ROOT"

echo "=== 构建配置完成 ==="


