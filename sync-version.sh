#!/bin/bash

# 版本号同步脚本
# 使用方法: ./sync-version.sh 1.0.0

if [ $# -eq 0 ]; then
    echo "使用方法: ./sync-version.sh <version>"
    echo "示例: ./sync-version.sh 1.0.0"
    exit 1
fi

VERSION=$1
VERSION_CODE=$(echo $VERSION | sed 's/\.//g')

echo "设置版本号为: $VERSION"
echo "设置版本代码为: $VERSION_CODE"

# 更新 package.json
echo "更新 package.json..."
npm version $VERSION --no-git-tag-version

# 更新 app.json
echo "更新 app.json..."
node -e "
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('app.json', 'utf8'));
config.expo.version = '$VERSION';
config.expo.android = config.expo.android || {};
config.expo.android.versionCode = $VERSION_CODE;
config.expo.ios = config.expo.ios || {};
config.expo.ios.buildNumber = '$VERSION_CODE';
fs.writeFileSync('app.json', JSON.stringify(config, null, 2));
"

echo "✅ 版本号同步完成!"
echo "📱 用户版本号: $VERSION"
echo "🔢 Android版本代码: $VERSION_CODE"
echo "🔢 iOS构建号: $VERSION_CODE"
