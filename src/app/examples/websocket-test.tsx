import React from 'react'
import { View, StyleSheet } from 'react-native'
import { StatusBar } from '../../components/StatusBar'
import { NavBar } from '../../components/NavBar'
import { CleanWebSocketTest } from '../../components/CleanWebSocketTest'
import { router } from 'expo-router'

/**
 * WebSocket 测试页面
 */
export default function WebSocketTestScreen() {
  const goBack = () => {
    router.back()
  }

  return (
    <View style={styles.container}>
      <StatusBar theme="light" />
      <NavBar title="WS 测试" leftArrow={true} goBackDelta={1} onBackPress={goBack} />
      <View style={styles.content}>
        <CleanWebSocketTest />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
})

