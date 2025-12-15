import React, { useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useDeviceStatusStore, selectIsBound, selectCanDragVideo, selectCanDisplayAnswer } from '../stores/deviceStatusStore'
import { useWebSocketStore } from '../stores/webSocketStore'
import { globalWebSocket } from '../services/globalWebSocket'

/**
 * 设备状态指示器组件
 * 显示当前设备状态和 WebSocket 连接状态
 * 
 * 使用示例：
 * ```tsx
 * <DeviceStatusIndicator />
 * ```
 */
export function DeviceStatusIndicator() {
  // WebSocket 连接状态
  const wsStatus = useWebSocketStore((state) => state.status)
  
  // 设备状态
  const deviceStatus = useDeviceStatusStore((state) => state.status)
  const isInitialized = useDeviceStatusStore((state) => state.isInitialized)
  const isBound = useDeviceStatusStore(selectIsBound)
  const canDragVideo = useDeviceStatusStore(selectCanDragVideo)
  const canDisplayAnswer = useDeviceStatusStore(selectCanDisplayAnswer)
  
  // 监听设备状态变化
  useEffect(() => {
    const unsubscribe = useDeviceStatusStore.subscribe(
      (state) => state.status,
      (newStatus, prevStatus) => {
        if (newStatus && prevStatus) {
          console.log('📱 设备状态变化:', {
            bound: `${prevStatus.bound} -> ${newStatus.bound}`,
            dragVideo: `${prevStatus.dragVideo} -> ${newStatus.dragVideo}`,
            displayAnswer: `${prevStatus.displayAnswer} -> ${newStatus.displayAnswer}`,
          })
        }
      }
    )
    
    return () => unsubscribe()
  }, [])
  
  // 获取连接状态颜色
  const getStatusColor = () => {
    switch (wsStatus) {
      case 'connected': return '#4CAF50'
      case 'connecting': return '#FF9800'
      case 'reconnecting': return '#FFC107'
      case 'disconnected': return '#9E9E9E'
      case 'failed': return '#F44336'
      default: return '#9E9E9E'
    }
  }
  
  // 获取连接状态图标
  const getStatusIcon = () => {
    switch (wsStatus) {
      case 'connected': return 'checkmark-circle'
      case 'connecting': return 'sync'
      case 'reconnecting': return 'refresh'
      case 'disconnected': return 'close-circle'
      case 'failed': return 'alert-circle'
      default: return 'help-circle'
    }
  }
  
  // 获取连接状态文本
  const getStatusText = () => {
    switch (wsStatus) {
      case 'connected': return '已连接'
      case 'connecting': return '连接中'
      case 'reconnecting': return '重连中'
      case 'disconnected': return '未连接'
      case 'failed': return '连接失败'
      default: return '未知'
    }
  }
  
  return (
    <View style={styles.container}>
      {/* WebSocket 连接状态 */}
      <View style={styles.section}>
        <View style={styles.statusRow}>
          <Ionicons 
            name={getStatusIcon() as any} 
            size={20} 
            color={getStatusColor()} 
          />
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
        </View>
      </View>
      
      {/* 设备状态 */}
      {isInitialized && deviceStatus ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>设备状态</Text>
          
          <View style={styles.statusItem}>
            <Ionicons 
              name={isBound ? 'checkmark-circle' : 'close-circle'} 
              size={18} 
              color={isBound ? '#4CAF50' : '#F44336'} 
            />
            <Text style={styles.statusLabel}>
              绑定状态: {isBound ? '已绑定' : '未绑定'}
            </Text>
          </View>
          
          <View style={styles.statusItem}>
            <Ionicons 
              name={canDragVideo ? 'checkmark-circle' : 'close-circle'} 
              size={18} 
              color={canDragVideo ? '#4CAF50' : '#F44336'} 
            />
            <Text style={styles.statusLabel}>
              拖拽视频: {canDragVideo ? '允许' : '禁止'}
            </Text>
          </View>
          
          <View style={styles.statusItem}>
            <Ionicons 
              name={canDisplayAnswer ? 'checkmark-circle' : 'close-circle'} 
              size={18} 
              color={canDisplayAnswer ? '#4CAF50' : '#F44336'} 
            />
            <Text style={styles.statusLabel}>
              显示答案: {canDisplayAnswer ? '显示' : '隐藏'}
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.emptyText}>
            {wsStatus === 'connected' ? '等待设备状态...' : '未连接服务器'}
          </Text>
        </View>
      )}
      
      {/* 调试按钮 */}
      {__DEV__ && (
        <View style={styles.debugSection}>
          <TouchableOpacity 
            style={styles.debugButton}
            onPress={() => {
              const stats = globalWebSocket.getStats()
              console.log('📊 WebSocket 统计:', stats)
              alert(`
发送: ${stats.sentMessages}
接收: ${stats.receivedMessages}
失败: ${stats.failedMessages}
重连: ${stats.reconnectCount}
              `.trim())
            }}
          >
            <Text style={styles.debugButtonText}>查看统计</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.debugButton, styles.debugButtonSecondary]}
            onPress={() => {
              globalWebSocket.reconnect()
            }}
          >
            <Text style={styles.debugButtonText}>重新连接</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 8,
  },
  debugSection: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  debugButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  debugButtonSecondary: {
    backgroundColor: '#FF9800',
  },
  debugButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
})
