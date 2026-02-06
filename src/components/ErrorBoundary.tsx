/**
 * 全局错误边界组件
 * 捕获 React 组件树中的 JavaScript 错误，并显示友好的错误UI
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from '@/libs/safeAreaContext';

interface Props {
  children: ReactNode;
  /**
   * 自定义错误UI渲染函数
   * 如果提供，将使用自定义UI而不是默认UI
   */
  fallback?: (
    error: Error,
    errorInfo: ErrorInfo,
    resetError: () => void,
  ) => ReactNode;
  /**
   * 错误发生时的回调
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /**
   * 导航到首页的函数（可选）
   * 如果提供，点击"返回首页"按钮时会调用此函数
   */
  onNavigateHome?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 记录错误信息
    console.error('❌ ErrorBoundary 捕获到错误:', error);
    console.error('错误堆栈:', errorInfo.componentStack);

    this.setState({
      errorInfo,
    });

    // 调用错误回调
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // 这里可以集成错误上报服务
    // 例如：Sentry、Bugsnag、Firebase Crashlytics 等
    // this.reportError(error, errorInfo);
  }

  /**
   * 重置错误状态，尝试重新渲染
   */
  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  /**
   * 返回首页
   */
  goHome = () => {
    this.resetError();
    // 调用导航函数（如果提供）
    if (this.props.onNavigateHome) {
      this.props.onNavigateHome();
    }
  };

  /**
   * 错误上报（可选）
   */
  // private reportError = (error: Error, errorInfo: ErrorInfo) => {
  //   // 集成错误上报服务
  //   // Sentry.captureException(error, { extra: errorInfo });
  // };

  render() {
    if (this.state.hasError && this.state.error) {
      // 如果提供了自定义 fallback，使用自定义UI
      if (this.props.fallback) {
        return this.props.fallback(
          this.state.error,
          this.state.errorInfo!,
          this.resetError,
        );
      }

      // 默认错误UI
      return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              {/* 错误图标 */}
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>⚠️</Text>
              </View>

              {/* 错误标题 */}
              <Text style={styles.title}>出现了一些问题</Text>
              <Text style={styles.subtitle}>
                应用遇到了一个错误，我们正在努力修复
              </Text>

              {/* 错误详情（开发环境显示） */}
              {__DEV__ && this.state.error && (
                <View style={styles.errorDetails}>
                  <Text style={styles.errorTitle}>错误信息:</Text>
                  <Text style={styles.errorMessage}>
                    {this.state.error.toString()}
                  </Text>
                  {this.state.errorInfo && (
                    <>
                      <Text style={styles.errorTitle}>组件堆栈:</Text>
                      <Text style={styles.errorStack}>
                        {this.state.errorInfo.componentStack}
                      </Text>
                    </>
                  )}
                </View>
              )}

              {/* 操作按钮 */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.primaryButton]}
                  onPress={this.resetError}
                >
                  <Text style={styles.primaryButtonText}>重试</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.secondaryButton]}
                  onPress={this.goHome}
                >
                  <Text style={styles.secondaryButtonText}>返回首页</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  icon: {
    fontSize: 64,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  errorDetails: {
    width: '100%',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    maxHeight: 300,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginTop: 12,
    marginBottom: 4,
  },
  errorMessage: {
    fontSize: 12,
    color: '#FF4444',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  errorStack: {
    fontSize: 11,
    color: '#666666',
    fontFamily: 'monospace',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  secondaryButtonText: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '500',
  },
});
