#!/bin/bash

# React Native 构建脚本 - 用于上传蒲公英
# todo: ios applestore id && 打开下面的注释

version=$(date +%Y%m%d%H%M%S)

echo "构建版本号: $version"

case $1 in
  "dev:apk")
    echo "开始构建开发环境 Android APK..."
    
    # 清理构建目录
    npx rimraf android/app/build
    
    # 清理 Gradle 缓存
    cd android
    ./gradlew clean
    cd ..
    
    # 安装 Ruby 依赖
    cd android
    bundle install
    
    # 执行 fastlane 构建并上传蒲公英
    npx cross-env DEPLOY_VERSION=$version NODE_ENV=production DEPLOY_ENV=dev ENVFILE=.env.development bundle exec fastlane dev
    
    cd ..
    ;;
    
  "dev:ios")
    echo "开始构建开发环境 iOS..."
    
    # 清理 iOS 构建目录
    npx rimraf ios/build
    npx rimraf ios/DerivedData
    
    # 安装 CocoaPods 依赖
    cd ios
    pod install
    cd ..
    
    # 安装 Ruby 依赖
    cd ios
    bundle install
    
    # 执行 fastlane 构建并上传蒲公英
    npx cross-env DEPLOY_VERSION=$version NODE_ENV=production DEPLOY_ENV=dev ENVFILE=.env.development bundle exec fastlane dev
    
    cd ..
    ;;
    
  "real:apk")
    echo "开始构建生产环境 Android APK..."
    
    # 清理构建目录
    npx rimraf android/app/build
    
    # 清理 Gradle 缓存
    cd android
    ./gradlew clean
    cd ..
    
    # 安装 Ruby 依赖
    cd android
    bundle install
    
    # 执行 fastlane 构建并上传蒲公英
    npx cross-env DEPLOY_VERSION=$version NODE_ENV=production DEPLOY_ENV=real ENVFILE=.env.production bundle exec fastlane real
    
    cd ..
    ;;
    
  "real:ios")
    echo "开始构建生产环境 iOS..."
    
    # 清理 iOS 构建目录
    npx rimraf ios/build
    npx rimraf ios/DerivedData
    
    # 安装 CocoaPods 依赖
    cd ios
    pod install
    cd ..
    
    # 安装 Ruby 依赖
    cd ios
    bundle install
    
    # 执行 fastlane 构建并上传蒲公英
    npx cross-env DEPLOY_VERSION=$version NODE_ENV=production DEPLOY_ENV=real ENVFILE=.env.production bundle exec fastlane real
    
    cd ..
    ;;
    
  "staging:apk")
    echo "开始构建测试环境 Android APK..."
    
    # 清理构建目录
    npx rimraf android/app/build
    
    # 清理 Gradle 缓存
    cd android
    ./gradlew clean
    cd ..
    
    # 安装 Ruby 依赖
    cd android
    bundle install
    
    # 执行 fastlane 构建并上传蒲公英（使用 dev flavor）
    npx cross-env DEPLOY_VERSION=$version NODE_ENV=production DEPLOY_ENV=staging ENVFILE=.env.staging bundle exec fastlane staging
    
    cd ..
    ;;
    
  "staging:ios")
    echo "开始构建测试环境 iOS..."
    
    # 清理 iOS 构建目录
    npx rimraf ios/build
    npx rimraf ios/DerivedData
    
    # 安装 CocoaPods 依赖
    cd ios
    pod install
    cd ..
    
    # 安装 Ruby 依赖
    cd ios
    bundle install
    
    # 执行 fastlane 构建并上传蒲公英
    npx cross-env DEPLOY_VERSION=$version NODE_ENV=production DEPLOY_ENV=staging ENVFILE=.env.staging bundle exec fastlane staging
    
    cd ..
    ;;
    
  *)
    echo "用法: ./build.sh [dev:apk|dev:ios|real:apk|real:ios|staging:apk|staging:ios]"
    echo ""
    echo "示例:"
    echo "  ./build.sh dev:apk      # 构建开发环境 Android APK 并上传蒲公英"
    echo "  ./build.sh dev:ios      # 构建开发环境 iOS 并上传蒲公英"
    echo "  ./build.sh real:apk     # 构建生产环境 Android APK 并上传蒲公英"
    echo "  ./build.sh real:ios     # 构建生产环境 iOS 并上传蒲公英"
    echo "  ./build.sh staging:apk  # 构建测试环境 Android APK 并上传蒲公英"
    echo "  ./build.sh staging:ios  # 构建测试环境 iOS 并上传蒲公英"
    exit 1
    ;;
esac

echo "构建完成！"

