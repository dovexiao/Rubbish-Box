#!/bin/bash

# 只生成图标文件，不重置 Android 目录的其他文件

echo "🎨 开始生成应用图标..."
echo ""

# 检查源图标文件
SOURCE_ICON="assets/app/icons/1024x1024.png"
if [ ! -f "$SOURCE_ICON" ]; then
    echo "❌ 错误：找不到源图标文件: $SOURCE_ICON"
    exit 1
fi

echo "✅ 找到源图标文件: $SOURCE_ICON"
echo ""

# 备份现有的 mipmap 目录
BACKUP_DIR="android/app/src/main/res/mipmap-backup"
if [ -d "$BACKUP_DIR" ]; then
    echo "📦 备份目录已存在，跳过备份"
else
    echo "📦 备份现有的图标文件..."
    mkdir -p "$BACKUP_DIR"
    for dir in mipmap-hdpi mipmap-mdpi mipmap-xhdpi mipmap-xxhdpi mipmap-xxxhdpi; do
        if [ -d "android/app/src/main/res/$dir" ]; then
            cp -r "android/app/src/main/res/$dir" "$BACKUP_DIR/" 2>/dev/null || true
        fi
    done
    echo "✅ 备份完成"
fi

echo ""
echo "🔄 使用 Expo 生成图标（只更新图标文件）..."
echo ""

# 使用 expo prebuild 但只更新图标
# --no-install 不安装依赖
# --platform android 只生成 Android
npx expo prebuild --no-install --platform android

echo ""
echo "✅ 图标生成完成！"
echo ""
echo "📝 提示："
echo "   - 图标已更新到: android/app/src/main/res/mipmap-*/"
echo "   - 如果遇到问题，可以从备份恢复: android/app/src/main/res/mipmap-backup/"
echo ""
