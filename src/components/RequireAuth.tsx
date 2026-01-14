import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { useAppNavigation } from '@/hooks/useAppNavigation';

interface RequireAuthProps {
  children: React.ReactNode;
}

/**
 * 需要登录的页面保护组件
 * 如果用户未登录，自动跳转到登录页面
 */
export const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const navigation = useAppNavigation();

  useEffect(() => {
    if (!isLoggedIn) {
      // 跳转到登录页面
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  }, [isLoggedIn, navigation]);

  // 如果未登录，显示加载中（实际会立即跳转）
  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#333333" />
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});

