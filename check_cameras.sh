#!/bin/bash
# 检查设备上的相机数量

echo "=== 检查设备相机信息 ==="
echo ""

echo "1. 系统特性（支持的相机类型）："
adb shell "pm list features | grep -i camera"
echo ""

echo "2. Video 设备节点："
adb shell "ls -la /dev/video*" 2>&1 | grep video
echo ""

echo "3. Video4Linux 设备名称："
adb shell "cat /sys/class/video4linux/video*/name" 2>&1
echo ""

echo "4. 相机服务状态："
adb shell "getprop | grep -i camera" | grep -E "init.svc|running"
echo ""

echo "5. 通过 Camera2 API 检查（需要应用运行）："
echo "   请在应用中查看日志：adb logcat | grep -E 'Camera|相机'"
echo ""

echo "=== 检查完成 ==="

