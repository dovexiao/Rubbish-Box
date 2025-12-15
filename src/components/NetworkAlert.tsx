import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { openNetworkSettings } from '@/utils/network';

/**
 * 网络状态提示组件
 * 当网络断开时显示提示
 */
export function NetworkAlert() {
  const { isConnected, isFirstCheck } = useNetworkStatus();
  const [visible, setVisible] = useState(false);
  
  // 当网络状态变化时更新显示状态
  useEffect(() => {
    if (isFirstCheck) return;
    
    if (isConnected === false) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [isConnected, isFirstCheck]);
  
  // 如果不需要显示，返回null
  if (!visible) {
    return null;
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.alertBox}>
        <Text style={styles.alertText}>网络连接已断开</Text>
        <Text style={styles.subText}>请检查您的网络设置</Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setVisible(false)}
          >
            <Text style={styles.buttonText}>稍后</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={openNetworkSettings}
          >
            <Text style={[styles.buttonText, styles.primaryButtonText]}>
              设置
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  alertBox: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 400,
    alignItems: 'center',
  },
  alertText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    backgroundColor: '#f5f5f5',
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#4891FF',
  },
  buttonText: {
    fontWeight: 'bold',
    color: '#333',
  },
  primaryButtonText: {
    color: '#ffffff',
  },
});
