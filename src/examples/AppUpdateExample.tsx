/**
 * 应用更新使用示例
 */

import React from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { useAppUpdate } from '@/hooks/useAppUpdate';
import appUpdate from '@/utils/appUpdate';
import { fontSize, px } from '@/utils/ui';

export function AppUpdateExample() {
  // 方式一：使用 Hook（推荐）- 自动在应用启动时检查更新
  useAppUpdate();

  // 方式二：手动检查更新
  const handleManualCheck = () => {
    const updateManager = appUpdate();

    updateManager.onUpdateReady(() => {
      const updateInfo = updateManager.getUpdateInfo();

      if (updateInfo.hasUpdate) {
        const updateType =
          updateInfo.updateType === 'app' ? '应用更新' : '热更新';

        Alert.alert('发现新版本', `检测到新的${updateType}，是否立即更新？`, [
          {
            text: '稍后',
            style: 'cancel',
          },
          {
            text: '立即更新',
            onPress: () => {
              updateManager.applyUpdate();
            },
          },
        ]);
      } else {
        Alert.alert('提示', '当前已是最新版本');
      }
    });
  };

  return (
    <View style={{ padding: px(20) }}>
      <Text style={{ fontSize: fontSize(18), marginBottom: px(20) }}>
        应用更新示例
      </Text>

      <Button title="手动检查更新" onPress={handleManualCheck} />

      <Text
        style={{ marginTop: px(20), fontSize: fontSize(14), color: '#666' }}
      >
        提示：应用启动时会自动检查更新（延迟 2 秒）
      </Text>
    </View>
  );
}
