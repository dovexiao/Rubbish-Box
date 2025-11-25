import React, { useState, useRef, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native'
import { Camera, useCameraDevices } from 'react-native-vision-camera'
import { router } from 'expo-router'

/**
 * Vision Camera 测试组件
 * 验证Android 14相机兼容性
 */
export default function CameraTest() {
  const [hasPermission, setHasPermission] = useState(false)
  const [isActive, setIsActive] = useState(true)
  const [permissionStatus, setPermissionStatus] = useState('checking')
  const cameraRef = useRef<Camera>(null)
  const devices = useCameraDevices()

  console.log(`📱 Vision Camera 设备检测:`, {
    hasBackDevice: !!devices.back,
    hasFrontDevice: !!devices.front,
    hasExternalDevice: !!devices.external,
    backDevice: devices.back,
    frontDevice: devices.front,
    externalDevice: devices.external,
    allDevices: devices,
    hasPermission,
    permissionStatus,
    platform: Platform.OS,
    version: Platform.Version
  })

  // 强制选择可用设备
  const getAvailableDevice = () => {
    // 详细枚举所有可能设备
    const availableDevices = [
      devices.back,
      devices.front, 
      devices.external,
      ...Object.values(devices).filter(Boolean)
    ].filter(device => device)

    console.log('🔍 可用设备列表:', availableDevices)

    if (availableDevices.length > 0) {
      const selectedDevice = availableDevices[0]
      console.log('✅ 选择设备:', selectedDevice)
      return selectedDevice
    }

    console.log('❌ 没有可用相机设备')
    return null
  }

  const device = getAvailableDevice()

  // 请求相机权限
  useEffect(() => {
    const requestPermission = async () => {
      try {
        console.log('🔐 请求Vision Camera权限...')
        const status = await Camera.requestCameraPermission()
        console.log('📋 权限状态:', status)
        setPermissionStatus(status)
        setHasPermission(status === 'granted')
        
        if (status === 'denied') {
          console.log('❌ 权限被拒绝，需要引导用户到设置')
        }
      } catch (error) {
        console.error('❌ 请求权限失败:', error)
        setPermissionStatus('error')
      }
    }
    requestPermission()
  }, [])

  // 拍照测试
  const takePhoto = async () => {
    if (cameraRef.current) {
      try {
        console.log('📸 Vision Camera 开始拍照...')
        const photo = await cameraRef.current.takePhoto({
          qualityPrioritization: 'quality',
          flash: 'off',
          enableShutterSound: false,
        })
        console.log('✅ 拍照成功:', photo.path)
        
        // 连续拍照测试
        setTimeout(() => {
          console.log('🔄 准备第二次拍照...')
          takePhoto()
        }, 2000)
      } catch (error) {
        console.error('❌ 拍照失败:', error)
      }
    }
  }

  if (permissionStatus === 'checking') {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>检查相机权限...</Text>
      </View>
    )
  }

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>相机权限被拒绝: {permissionStatus}</Text>
        <Text style={styles.text}>请到系统设置中授予相机权限</Text>
      </View>
    )
  }

  if (!device) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>相机设备不可用</Text>
        <Text style={styles.text}>可用设备: {JSON.stringify(devices, null, 2)}</Text>
      </View>
    )
  }

  console.log('🎥 开始渲染Camera组件，设备:', device)

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isActive}
        photo={true}
        video={false}
        audio={false}
        onError={(error) => {
          console.error('❌ Camera组件错误:', error)
        }}
        onInitialized={() => {
          console.log('✅ Camera组件初始化完成')
        }}
      />
      
      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={takePhoto}>
          <Text style={styles.buttonText}>测试拍照</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>返回</Text>
        </TouchableOpacity>
      </View>
      
      {/* 状态显示 */}
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>
          状态: {hasPermission ? '有权限' : '无权限'} | 设备: {device ? '可用' : '不可用'}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  text: {
    color: 'white',
    textAlign: 'center',
    marginVertical: 10,
  },
  controls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: 'black',
    fontWeight: 'bold',
  },
  statusBar: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
  },
  statusText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 12,
  },
})
