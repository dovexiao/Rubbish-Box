import React from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { StatusBar } from '../../components/StatusBar'
import { NavBar } from '../../components/NavBar'
import { DeviceStatusIndicator } from '../../components/DeviceStatusIndicator'
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
      <NavBar title="WebSocket 信息" leftArrow={true} goBackDelta={1} onBackPress={goBack} />
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <DeviceStatusIndicator />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
})

