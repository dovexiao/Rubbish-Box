/**
 * 数据存储使用示例
 */

import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Switch } from 'react-native';
import { storageUtil, StorageKeys, tokenStorage, userStorage } from '@/utils/storage';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import {
  useSmartStorage,
  useSmartStorageString,
  useSmartStorageBoolean,
  useSmartStorageObject,
} from '@/hooks/useSmartStorage';

interface UserSettings {
  theme: 'light' | 'dark';
  notifications: boolean;
  fontSize: number;
}

export function StorageExample() {
  // 示例 1: 使用 useLocalStorage Hook
  const [username, setUsername] = useLocalStorage<string>('username', '');

  // 示例 2: 使用 useSmartStorage（支持跨组件同步）
  const [smartValue, setSmartValue] = useSmartStorageString('smart_string', '');

  // 示例 3: 使用 useSmartStorageBoolean
  const [isDarkMode, setIsDarkMode] = useSmartStorageBoolean('isDarkMode', false);

  // 示例 4: 使用 useSmartStorageObject（自动合并）
  const [settings, setSettings] = useSmartStorageObject<UserSettings>(
    'userSettings',
    {
      theme: 'light',
      notifications: true,
      fontSize: 14,
    },
  );

  // 示例 5: 直接使用工具类
  const [manualValue, setManualValue] = useState('');

  const handleSaveToken = () => {
    tokenStorage.set('example-token-12345'); // MMKV 是同步的
    alert('Token 已保存');
  };

  const handleGetToken = () => {
    const token = tokenStorage.get(); // MMKV 是同步的
    alert(token ? `Token: ${token}` : '未找到 Token');
  };

  const handleSaveUser = () => {
    userStorage.set({
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
    }); // MMKV 是同步的
    alert('用户信息已保存');
  };

  const handleGetUser = () => {
    const user = userStorage.get(); // MMKV 是同步的
    alert(user ? JSON.stringify(user, null, 2) : '未找到用户信息');
  };

  const handleSaveManual = () => {
    storageUtil.setItem('manual_key', manualValue); // MMKV 是同步的
    alert('已保存');
  };

  const handleGetManual = () => {
    const value = storageUtil.getItem('manual_key'); // MMKV 是同步的
    alert(value || '未找到值');
  };

  const handleClearAll = () => {
    storageUtil.clear(); // MMKV 是同步的
    alert('所有数据已清空');
  };

  const handleGetAllKeys = () => {
    const keys = storageUtil.getAllKeys(); // MMKV 是同步的
    alert(`所有键: ${keys.join(', ')}`);
  };

  const handleUpdateSettingsPartial = () => {
    // 自动合并对象更新
    setSettings({ theme: 'dark' }); // 只更新 theme，其他字段保持不变
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>数据存储示例（MMKV）</Text>

      {/* useLocalStorage 示例 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. useLocalStorage Hook</Text>
        <TextInput
          style={styles.input}
          placeholder="用户名"
          value={username || ''}
          onChangeText={setUsername} // MMKV 是同步的，无需 await
        />
        <Text>当前用户名: {username || '未设置'}</Text>
      </View>

      {/* useSmartStorage 示例 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          2. useSmartStorage（支持跨组件同步）
        </Text>
        <TextInput
          style={styles.input}
          placeholder="智能存储值"
          value={smartValue || ''}
          onChangeText={setSmartValue} // MMKV 是同步的，无需 await
        />
        <Text>当前值: {smartValue || '未设置'}</Text>
        <Text style={styles.hint}>
          提示：在其他组件中使用相同的 key 会自动同步
        </Text>
      </View>

      {/* 布尔值存储 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. 布尔值存储</Text>
        <View style={styles.row}>
          <Text>深色模式: </Text>
          <Switch
            value={isDarkMode || false}
            onValueChange={setIsDarkMode} // MMKV 是同步的，无需 await
          />
        </View>
      </View>

      {/* 对象存储（自动合并） */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>4. 对象存储（自动合并）</Text>
        <Text>主题: {settings?.theme || 'light'}</Text>
        <Text>通知: {settings?.notifications ? '开启' : '关闭'}</Text>
        <Text>字体大小: {settings?.fontSize || 14}</Text>
        <Button
          title="只更新主题（自动合并）"
          onPress={handleUpdateSettingsPartial}
        />
        <Text style={styles.hint}>
          提示：更新对象时自动合并，不会覆盖其他字段
        </Text>
      </View>

      {/* Token 管理 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>5. Token 管理（字符串直接存储）</Text>
        <View style={styles.buttonRow}>
          <Button title="保存 Token" onPress={handleSaveToken} />
          <Button title="获取 Token" onPress={handleGetToken} />
          <Button title="删除 Token" onPress={() => tokenStorage.remove()} />
        </View>
      </View>

      {/* 用户信息管理 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>6. 用户信息管理</Text>
        <View style={styles.buttonRow}>
          <Button title="保存用户" onPress={handleSaveUser} />
          <Button title="获取用户" onPress={handleGetUser} />
          <Button title="删除用户" onPress={() => userStorage.remove()} />
        </View>
      </View>

      {/* 手动操作 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>7. 手动操作</Text>
        <TextInput
          style={styles.input}
          placeholder="输入要保存的值"
          value={manualValue}
          onChangeText={setManualValue}
        />
        <View style={styles.buttonRow}>
          <Button title="保存" onPress={handleSaveManual} />
          <Button title="获取" onPress={handleGetManual} />
        </View>
      </View>

      {/* 工具方法 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>8. 工具方法</Text>
        <View style={styles.buttonRow}>
          <Button title="获取所有键" onPress={handleGetAllKeys} />
          <Button title="清空所有" onPress={handleClearAll} color="red" />
        </View>
        <Text style={styles.info}>
          存储大小: {storageUtil.getSize()} 字节
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  hint: {
    marginTop: 5,
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  info: {
    marginTop: 10,
    fontSize: 12,
    color: '#666',
  },
});
