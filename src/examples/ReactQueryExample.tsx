/**
 * React Query 使用示例
 */

import React, { useState } from 'react';
import { View, Text, Button, TextInput, ActivityIndicator, StyleSheet } from 'react-native';
import { useUserInfo, useLogin } from '@/hooks/useUser';
import { useVersionCheck } from '@/hooks/useVersion';
import { Platform } from 'react-native';

export function ReactQueryExample() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // 示例 1: 使用 useQuery 获取用户信息
  const {
    data: userInfo,
    isLoading: isLoadingUser,
    error: userError,
    refetch: refetchUser,
  } = useUserInfo({
    enabled: true, // 自动获取
    onSuccess: (data) => {
      console.log('User info loaded:', data);
    },
  });

  // 示例 2: 使用 useMutation 登录
  const loginMutation = useLogin();

  // 示例 3: 使用 useQuery 检查版本
  const {
    data: versionInfo,
    isLoading: isLoadingVersion,
  } = useVersionCheck(Platform.OS === 'ios' ? 'ios' : 'android', {
    enabled: false, // 手动触发
    refetchInterval: 5 * 60 * 1000, // 每 5 分钟检查一次
  });

  const handleLogin = () => {
    loginMutation.mutate(
      { username, password },
      {
        onSuccess: (data) => {
          console.log('Login success:', data);
          // 登录成功后，用户信息会自动更新（因为 useLogin 中 invalidateQueries）
        },
        onError: (error) => {
          console.error('Login failed:', error);
        },
      },
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>React Query 示例</Text>

      {/* 用户信息展示 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. 用户信息 (useQuery)</Text>
        {isLoadingUser ? (
          <ActivityIndicator />
        ) : userError ? (
          <Text style={styles.error}>错误: {userError.message}</Text>
        ) : userInfo ? (
          <View>
            <Text>ID: {userInfo.id}</Text>
            <Text>姓名: {userInfo.name}</Text>
          </View>
        ) : null}
        <Button title="刷新用户信息" onPress={() => refetchUser()} />
      </View>

      {/* 登录表单 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. 登录 (useMutation)</Text>
        <TextInput
          style={styles.input}
          placeholder="用户名"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="密码"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Button
          title={loginMutation.isPending ? '登录中...' : '登录'}
          onPress={handleLogin}
          disabled={loginMutation.isPending}
        />
        {loginMutation.isError && (
          <Text style={styles.error}>登录失败: {loginMutation.error?.message}</Text>
        )}
        {loginMutation.isSuccess && <Text style={styles.success}>登录成功！</Text>}
      </View>

      {/* 版本检查 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. 版本检查 (useQuery)</Text>
        {isLoadingVersion ? (
          <ActivityIndicator />
        ) : versionInfo ? (
          <Text>最新版本: {versionInfo.version}</Text>
        ) : (
          <Text>未检查版本</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  error: {
    color: 'red',
    marginTop: 5,
  },
  success: {
    color: 'green',
    marginTop: 5,
  },
});

