import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './styles';
import { PERMISSION_DENIED } from '@/constants';

export interface StatusErrorProps {
  error?: {
    code?: string | number;
    message?: string;
  } | null;
  onRetry?: () => void;
}

const StatusError: React.FC<StatusErrorProps> = ({ error, onRetry }) => {
  const code = error?.code;
  const codeStr =
    code !== undefined && code !== null && code !== ''
      ? String(code)
      : undefined;

  const isPermissionDenied = !!codeStr && codeStr === String(PERMISSION_DENIED);

  const title = isPermissionDenied ? '暂无权限' : '加载失败';

  const description = (() => {
    if (isPermissionDenied) {
      return '当前账号权限不足，无法访问此内容，请联系管理员或使用具有权限的账号登录。';
    }
    if (error?.message) {
      return error.message;
    }
    return '网络异常或服务繁忙，请稍后重试。';
  })();

  const displayText = codeStr ? `【${codeStr}】${description}` : description;

  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>{title}</Text>
      <Text style={styles.errorMessage}>{displayText}</Text>
      {onRetry && (
        <TouchableOpacity
          style={styles.errorRetryButton}
          activeOpacity={0.8}
          onPress={onRetry}
        >
          <Text style={styles.errorRetryText}>重试</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default StatusError;
