/**
 * WebSocket 使用示例
 * 展示如何在 React Native 组件中使用 WebSocket
 */

import React, { useEffect } from 'react'
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native'
import { useWebSocket } from '../hooks/useWebSocket'
import { MessageType } from '../types/websocket'

/**
 * 示例 1: 基础使用
 */
export const BasicWebSocketExample = () => {
  const { 
    send, 
    isConnected, 
    lastMessage, 
    stats 
  } = useWebSocket({
    autoConnect: true,
    onMessage: (message) => {
      console.log('收到消息:', message)
    },
    onOpen: () => {
      console.log('WebSocket 连接成功')
    },
    onClose: () => {
      console.log('WebSocket 连接关闭')
    },
    onError: (error) => {
      console.error('WebSocket 错误:', error)
    }
  })

  const handleSendMessage = () => {
    send({ text: 'Hello, WebSocket!' })
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>基础 WebSocket 示例</Text>
      
      <View style={styles.statusContainer}>
        <Text>连接状态: {isConnected ? '已连接' : '未连接'}</Text>
        <Text>发送消息数: {stats.sentMessages}</Text>
        <Text>接收消息数: {stats.receivedMessages}</Text>
      </View>

      <Button 
        title="发送消息" 
        onPress={handleSendMessage}
        disabled={!isConnected}
      />

      {lastMessage && (
        <View style={styles.messageContainer}>
          <Text>最后一条消息:</Text>
          <Text>{JSON.stringify(lastMessage, null, 2)}</Text>
        </View>
      )}
    </View>
  )
}

/**
 * 示例 2: 聊天室
 */
export const ChatRoomExample = () => {
  const [messages, setMessages] = React.useState<any[]>([])
  
  const { send, isConnected } = useWebSocket({
    onMessage: (message) => {
      if (message.type === MessageType.MESSAGE) {
        setMessages(prev => [...prev, message.data])
      }
    }
  })

  const sendChatMessage = (text: string) => {
    send({ 
      type: 'chat',
      text,
      timestamp: Date.now()
    })
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>聊天室示例</Text>
      
      <ScrollView style={styles.chatContainer}>
        {messages.map((msg, index) => (
          <View key={index} style={styles.chatMessage}>
            <Text>{msg.text}</Text>
          </View>
        ))}
      </ScrollView>

      <Button 
        title="发送测试消息" 
        onPress={() => sendChatMessage('测试消息')}
        disabled={!isConnected}
      />
    </View>
  )
}

/**
 * 示例 3: 实时数据监控
 */
export const RealtimeMonitorExample = () => {
  const [data, setData] = React.useState<any>(null)
  
  const { isConnected, stats, lastMessage } = useWebSocket({
    onMessage: (message) => {
      if (message.type === MessageType.MESSAGE) {
        setData(message.data)
      }
    },
    onReconnecting: (info) => {
      console.log(`正在重连 (${info.attempt} 次)...`)
    },
    onReconnected: () => {
      console.log('重连成功！')
    }
  })

  return (
    <View style={styles.container}>
      <Text style={styles.title}>实时监控示例</Text>
      
      <View style={styles.statusContainer}>
        <Text>状态: {isConnected ? '🟢 在线' : '🔴 离线'}</Text>
        <Text>重连次数: {stats.reconnectCount}</Text>
        <Text>连接时长: {Math.floor(stats.connectionDuration / 1000)}秒</Text>
      </View>

      {data && (
        <View style={styles.dataContainer}>
          <Text>实时数据:</Text>
          <Text>{JSON.stringify(data, null, 2)}</Text>
        </View>
      )}
    </View>
  )
}

/**
 * 示例 4: 手动控制连接
 */
export const ManualControlExample = () => {
  const { 
    connect, 
    disconnect, 
    isConnected, 
    isConnecting,
    status 
  } = useWebSocket({
    autoConnect: false  // 禁用自动连接
  })

  return (
    <View style={styles.container}>
      <Text style={styles.title}>手动控制示例</Text>
      
      <Text>当前状态: {status}</Text>

      <View style={styles.buttonGroup}>
        <Button 
          title="连接" 
          onPress={connect}
          disabled={isConnected || isConnecting}
        />
        <Button 
          title="断开" 
          onPress={disconnect}
          disabled={!isConnected}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  statusContainer: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  messageContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
  },
  chatContainer: {
    flex: 1,
    marginBottom: 15,
  },
  chatMessage: {
    padding: 10,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  dataContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#fff3e0',
    borderRadius: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
})

