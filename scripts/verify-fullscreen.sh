#!/bin/bash

# 全屏功能验证脚本
# 用于检查原生代码是否正确配置

echo "🔍 开始验证全屏功能配置..."
echo ""

# 定义颜色
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# 检查MainActivity.kt
echo "📱 检查 MainActivity.kt..."
if [ -f "android/app/src/main/java/com/xhtx/app/MainActivity.kt" ]; then
    if grep -q "setupFullscreen" "android/app/src/main/java/com/xhtx/app/MainActivity.kt"; then
        echo -e "${GREEN}✅ setupFullscreen() 方法存在${NC}"
    else
        echo -e "${RED}❌ setupFullscreen() 方法不存在${NC}"
        ERRORS=$((ERRORS + 1))
    fi
    
    if grep -q "WindowInsetsControllerCompat" "android/app/src/main/java/com/xhtx/app/MainActivity.kt"; then
        echo -e "${GREEN}✅ WindowInsetsControllerCompat 导入存在${NC}"
    else
        echo -e "${RED}❌ WindowInsetsControllerCompat 导入不存在${NC}"
        ERRORS=$((ERRORS + 1))
    fi
    
    if grep -q "onWindowFocusChanged" "android/app/src/main/java/com/xhtx/app/MainActivity.kt"; then
        echo -e "${GREEN}✅ onWindowFocusChanged 方法存在${NC}"
    else
        echo -e "${YELLOW}⚠️  onWindowFocusChanged 方法不存在（可选）${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${RED}❌ MainActivity.kt 文件不存在${NC}"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# 检查build.gradle
echo "📦 检查 build.gradle..."
if [ -f "android/app/build.gradle" ]; then
    if grep -q "androidx.core:core-ktx" "android/app/build.gradle"; then
        echo -e "${GREEN}✅ androidx.core:core-ktx 依赖存在${NC}"
    else
        echo -e "${RED}❌ androidx.core:core-ktx 依赖不存在${NC}"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${RED}❌ build.gradle 文件不存在${NC}"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# 检查配置插件
echo "🔌 检查配置插件..."
if [ -f "plugins/withFullscreen.js" ]; then
    echo -e "${GREEN}✅ withFullscreen.js 插件存在${NC}"
else
    echo -e "${YELLOW}⚠️  withFullscreen.js 插件不存在${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

if grep -q "withFullscreen" "app.json"; then
    echo -e "${GREEN}✅ 插件已在 app.json 中注册${NC}"
else
    echo -e "${YELLOW}⚠️  插件未在 app.json 中注册${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""

# 检查文档
echo "📄 检查文档..."
if [ -f "FULLSCREEN_GUIDE.md" ]; then
    echo -e "${GREEN}✅ FULLSCREEN_GUIDE.md 文档存在${NC}"
else
    echo -e "${YELLOW}⚠️  FULLSCREEN_GUIDE.md 文档不存在${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

if [ -f "NATIVE_CODE_PROTECTION.md" ]; then
    echo -e "${GREEN}✅ NATIVE_CODE_PROTECTION.md 文档存在${NC}"
else
    echo -e "${YELLOW}⚠️  NATIVE_CODE_PROTECTION.md 文档不存在${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 显示结果
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ 所有检查通过！全屏功能配置完整。${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  检查通过，但有 $WARNINGS 个警告。${NC}"
    echo ""
    echo "建议："
    echo "  - 配置插件可以在运行 expo prebuild 时自动恢复代码"
    echo "  - 文档提供了详细的配置说明和故障排除指南"
    exit 0
else
    echo -e "${RED}❌ 发现 $ERRORS 个错误和 $WARNINGS 个警告。${NC}"
    echo ""
    echo "解决方案："
    echo "  1. 查看 FULLSCREEN_GUIDE.md 获取完整的配置代码"
    echo "  2. 运行 npx expo prebuild 重新生成Android项目"
    echo "  3. 如果问题仍然存在，查看 NATIVE_CODE_PROTECTION.md"
    exit 1
fi

