/**
 * 干净的 WebSocket 测试组件
 * 基于用户提供的示例实现
 */

import React from 'react'
import { View, Text, Button, StyleSheet, ScrollView, TextInput } from 'react-native'
import { getDeviceCode } from '../utils/deviceInfo'

export const CleanWebSocketTest = () => {
  const [isConnected, setIsConnected] = React.useState(false)
  const [messages, setMessages] = React.useState<string[]>([])
  const [inputMessage, setInputMessage] = React.useState('')
  const [subscribedChannels, setSubscribedChannels] = React.useState<string[]>([])
  const wsRef = React.useRef<WebSocket | null>(null)
  const messagesRef = React.useRef<string[]>([])
  
  const getPhoneAndDeviceCode = async () => {
    const { useUserStore } = require('../stores/userStore')
    const phone = useUserStore.getState().user?.phone || ''
    const deviceCode = await getDeviceCode()
    return { phone, deviceCode }
  }
  
  const addMessage = React.useCallback((msg: string) => {
    messagesRef.current = [...messagesRef.current, msg]
    setMessages([...messagesRef.current])
  }, [])
  
  const connect = React.useCallback(async () => {
    const { phone, deviceCode } = await getPhoneAndDeviceCode()
    if (!phone) {
      alert('请先登录')
      return
    }
    if (!deviceCode) {
      alert('获取设备码失败')
      return
    }
    
    // 关闭旧连接
    if (wsRef.current) {
      wsRef.current.close()
    }
    
    // 清空状态
    messagesRef.current = []
    setMessages([])
    setSubscribedChannels([])
    
    const wsUrl = `ws://115.190.2.98:2333?deviceCode=${encodeURIComponent(deviceCode)}&phone=${encodeURIComponent(phone)}`
    console.log('🔌 [WS] 连接:', wsUrl)
    
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws
    
    ws.onopen = () => {
      console.log('✅ [WS] 连接成功')
      setIsConnected(true)
      addMessage('✅ 已连接')
      
      // 发送 ping
      ws.send(JSON.stringify({ type: "ping" }))
      console.log('📤 [WS] 发送 ping')
    }
    
    ws.onmessage = (event) => {
      console.log('📨 [WS] 收到消息:', event.data)
      
      try {
        const payload = JSON.parse(event.data)
        
        switch (payload.type) {
          case 'connected':
            addMessage(`✅ 连接确认 - ${payload.clientId?.substring(0, 15)}...`)
            break
          
          case 'pong':
            addMessage(`🏓 Pong - ${new Date(payload.timestamp).toLocaleTimeString()}`)
            break
          
          case 'subscribed':
            addMessage(`📢 已订阅: ${payload.channel}`)
            setSubscribedChannels(prev => [...prev, payload.channel])
            break
          
          case 'unsubscribed':
            addMessage(`📢 已取消订阅: ${payload.channel}`)
            setSubscribedChannels(prev => prev.filter(c => c !== payload.channel))
            break
          
          case 'message':
            addMessage(`💬 [${payload.channel}] ${payload.message}`)
            break
          
          case 'time':
            const timeStr = new Date(payload.timestamp).toLocaleTimeString('zh-CN')
            addMessage(`🕐 ${timeStr}`)
            break
          
          case 'error':
            addMessage(`❌ 错误: ${payload.message}`)
            break
          
          default:
            addMessage(`📦 ${JSON.stringify(payload)}`)
        }
      } catch (e) {
        console.error('❌ [WS] 解析失败:', e)
        addMessage(`📨 ${event.data}`)
      }
    }
    
    ws.onerror = () => {
      console.error('❌ [WS] 错误')
      ws.close()
    }
    
    ws.onclose = () => {
      console.log('🔌 [WS] 关闭')
      setIsConnected(false)
      wsRef.current = null
      addMessage('🔌 已关闭')
    }
  }, [addMessage])
  
  const disconnect = React.useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
    }
  }, [])
  
  const sendMessage = React.useCallback(() => {
    if (!wsRef.current || !isConnected) {
      alert('请先连接')
      return
    }
    
    if (!inputMessage.trim()) {
      alert('请输入消息')
      return
    }
    
    try {
      const payload = JSON.stringify({
        type: "publish",
        channel: "test",
        message: inputMessage
      })
      wsRef.current.send(payload)
      console.log('📤 [WS] 发送:', payload)
      addMessage(`📤 ${inputMessage}`)
      setInputMessage('')
    } catch (error) {
      console.error('发送失败:', error)
    }
  }, [isConnected, inputMessage, addMessage])
  
  const subscribe = React.useCallback((channel: string) => {
    if (!wsRef.current || !isConnected) {
      alert('请先连接')
      return
    }
    
    wsRef.current.send(JSON.stringify({ type: "subscribe", channel }))
    console.log('📤 [WS] 订阅:', channel)
  }, [isConnected])
  
  const unsubscribe = React.useCallback((channel: string) => {
    if (!wsRef.current || !isConnected) {
      return
    }
    
    wsRef.current.send(JSON.stringify({ type: "unsubscribe", channel }))
    console.log('📤 [WS] 取消订阅:', channel)
  }, [isConnected])
  
  const clearMessages = React.useCallback(() => {
    messagesRef.current = []
    setMessages([])
  }, [])
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>WebSocket 测试</Text>
      <Text style={styles.status}>
        状态: {isConnected ? '🟢 已连接' : '🔴 未连接'}
      </Text>
      <Text style={styles.channels}>
        已订阅: {subscribedChannels.join(', ') || '无'}
      </Text>
      
      <View style={styles.buttonGroup}>
        <Button
          title="连接"
          onPress={connect}
          disabled={isConnected}
        />
        <Button
          title="断开"
          onPress={disconnect}
          disabled={!isConnected}
        />
        <Button
          title="清空"
          onPress={clearMessages}
        />
      </View>
      
      <View style={styles.buttonGroup}>
        <Button
          title="订阅 time"
          onPress={() => subscribe('time')}
          disabled={!isConnected || subscribedChannels.includes('time')}
        />
        <Button
          title="取消订阅 time"
          onPress={() => unsubscribe('time')}
          disabled={!isConnected || !subscribedChannels.includes('time')}
        />
      </View>
      
      <View style={styles.buttonGroup}>
        <Button
          title="订阅 room-1"
          onPress={() => subscribe('room-1')}
          disabled={!isConnected || subscribedChannels.includes('room-1')}
        />
        <Button
          title="取消订阅 room-1"
          onPress={() => unsubscribe('room-1')}
          disabled={!isConnected || !subscribedChannels.includes('room-1')}
        />
      </View>
      
      <ScrollView style={styles.messageList}>
        {messages.map((msg, index) => (
          <Text key={index} style={styles.message}>{msg}</Text>
        ))}
      </ScrollView>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputMessage}
          onChangeText={setInputMessage}
          placeholder="输入消息..."
          editable={isConnected}
        />
        <Button
          title="发送"
          onPress={sendMessage}
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
    marginBottom: 10,
  },
  status: {
    fontSize: 14,
    marginBottom: 5,
  },
  channels: {
    fontSize: 12,
    color: '#666',
    marginBottom: 15,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  messageList: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 8,
    marginVertical: 15,
  },
  message: {
    paddingVertical: 4,
    fontSize: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
})

