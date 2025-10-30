import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { createStyles } from '../utils/rpxStyleSheet'

// 更新数据类型定义
interface UpdateData {
  newVersion?: string
  description?: string
  features?: string[]
  nativePluginChanges?: NativePluginChange[]
  downloadUrl?: string
  fileSize?: number
}

interface NativePluginChange {
  pluginName: string
  newVersion: string
  description: string
}

interface UpdateDialogProps {
  // 热更新相关
  hotUpdateVisible: boolean
  hotUpdateData?: UpdateData
  hotCanSkip?: boolean
  
  // 整包更新相关
  fullUpdateVisible: boolean
  fullUpdateData?: UpdateData
  fullCanSkip?: boolean
  
  // 下载进度
  downloadProgress?: number
  downloadedSize?: number
  totalSize?: number
  isUpdating?: boolean
  
  // 回调函数
  onConfirmHotUpdate: () => void
  onConfirmFullUpdate: () => void
  onSkipHotUpdate: () => void
  onSkipFullUpdate: () => void
}

/**
 * 更新对话框组件
 * 100%还原UniApp项目 /src/components/UpdateDialog.vue
 */
export function UpdateDialog({
  hotUpdateVisible,
  hotUpdateData,
  hotCanSkip = true,
  fullUpdateVisible,
  fullUpdateData,
  fullCanSkip = true,
  downloadProgress = 0,
  downloadedSize = 0,
  totalSize = 0,
  isUpdating = false,
  onConfirmHotUpdate,
  onConfirmFullUpdate,
  onSkipHotUpdate,
  onSkipFullUpdate,
}: UpdateDialogProps) {
  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (!bytes) return '未知大小'

    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }

    return `${size.toFixed(unitIndex === 0 ? 0 : 1)}${units[unitIndex]}`
  }

  // 获取插件显示名称
  const getPluginDisplayName = (pluginName: string) => {
    const pluginNames: Record<string, string> = {
      uniplugin_posemonitor: '坐姿监测',
      uniplugin_voice: '语音控制',
      uniplugin_camera: '相机增强',
      'react-native-gesture-handler': '手势处理',
      'react-native-reanimated': '动画引擎',
      'expo-updates': '热更新',
    }
    return pluginNames[pluginName] || pluginName
  }

  // 热更新弹窗
  const renderHotUpdateDialog = () => (
    <Modal
      visible={hotUpdateVisible}
      transparent
      animationType="fade"
      onRequestClose={hotCanSkip ? onSkipHotUpdate : undefined}
    >
      <View style={styles.overlay}>
        <View style={styles.hotUpdateDialog}>
          {/* 热更新头部 */}
          <LinearGradient
            colors={['#667eea', '#5ec6ff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hotHeader}
          >
            <Ionicons name="rocket" size={52} color="#fff" />
            <Text style={styles.hotDialogTitle}>发现新版本</Text>
            <Text style={styles.hotDialogVersion}>
              {hotUpdateData?.newVersion || 'v1.0.0'}
            </Text>
          </LinearGradient>

          <ScrollView style={styles.dialogContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.updateDescription}>
              {hotUpdateData?.description || '修复了一些问题，优化了用户体验'}
            </Text>

            {/* 更新内容 */}
            {hotUpdateData?.features && hotUpdateData.features.length > 0 && (
              <View style={styles.updateFeatures}>
                <Text style={styles.featuresTitle}>更新内容：</Text>
                <View style={styles.featureList}>
                  {hotUpdateData.features.map((feature, index) => (
                    <View key={index} style={styles.featureItem}>
                      <Ionicons name="checkmark" size={16} color="#52c41a" />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* 热更新进度条 */}
            {isUpdating && downloadProgress > 0 && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressInner,
                      styles.hotProgress,
                      { width: `${downloadProgress}%` },
                    ]}
                  />
                </View>
                <View style={styles.progressInfo}>
                  <Text style={styles.progressText}>{downloadProgress}%</Text>
                  <Text style={styles.downloadSize}>
                    {formatFileSize(downloadedSize)} / {formatFileSize(totalSize)}
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.dialogActions}>
            {hotCanSkip && (
              <TouchableOpacity style={styles.skipBtn} onPress={onSkipHotUpdate}>
                <Text style={styles.skipBtnText}>稍后提醒</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.updateBtn}
              onPress={onConfirmHotUpdate}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.updateBtnText}>立即更新</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )

  // 整包更新弹窗
  const renderFullUpdateDialog = () => (
    <Modal
      visible={fullUpdateVisible}
      transparent
      animationType="fade"
      onRequestClose={fullCanSkip ? onSkipFullUpdate : undefined}
    >
      <View style={styles.overlay}>
        <View style={styles.fullUpdateDialog}>
            {/* 背景图片 */}
            <Image
              source={require('../../assets/images/updateDlg-1.png')}
              style={styles.fullUpdateBg}
              resizeMode="cover"
            />
            <Image
              source={require('../../assets/images/updateDlg-2.png')}
              style={styles.fullUpdateDecor1}
              resizeMode="contain"
            />
            <Image
              source={require('../../assets/images/updateDlg-3.png')}
              style={styles.fullUpdateDecor2}
              resizeMode="contain"
            />

          <View style={styles.fullUpdateContent}>
            <Text style={styles.fullVersionText}>
              V{fullUpdateData?.newVersion || 'v1.0.0'}
            </Text>

            {/* 更新内容 */}
            {fullUpdateData?.features && fullUpdateData.features.length > 0 && (
              <View style={styles.fullUpdateFeatures}>
                <View style={styles.fullFeatureList}>
                  {fullUpdateData.features.map((feature, index) => (
                    <View key={index} style={styles.fullFeatureItem}>
                      <View style={styles.fullFeatureDot} />
                      <Text style={styles.fullFeatureText}>{feature}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* 原生插件变更信息 */}
            {fullUpdateData?.nativePluginChanges && fullUpdateData.nativePluginChanges.length > 0 && (
              <View style={styles.pluginChanges}>
                <Text style={styles.featuresTitle}>插件更新：</Text>
                <View style={styles.pluginList}>
                  {fullUpdateData.nativePluginChanges.map((plugin, index) => (
                    <View key={index} style={styles.pluginItem}>
                      <View style={styles.pluginHeader}>
                        <Ionicons name="puzzle" size={16} color="#1890ff" />
                        <Text style={styles.pluginName}>
                          {getPluginDisplayName(plugin.pluginName)}
                        </Text>
                        <Text style={styles.pluginVersion}>v{plugin.newVersion}</Text>
                      </View>
                      <Text style={styles.pluginDescription}>{plugin.description}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* 整包更新进度条 */}
            {isUpdating && downloadProgress > 0 && (
              <View style={styles.fullProgressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressInner,
                      styles.fullProgress,
                      { width: `${downloadProgress}%` },
                    ]}
                  />
                </View>
                <View style={styles.fullProgressInfo}>
                  <Text style={styles.fullProgressText}>
                    下载进度{downloadProgress}%
                  </Text>
                  <Text style={styles.fullProgressSize}>
                    {formatFileSize(downloadedSize)} / {formatFileSize(totalSize)}
                  </Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.fullDialogActions}>
            {fullCanSkip && (
              <TouchableOpacity style={styles.fullSkipBtn} onPress={onSkipFullUpdate}>
                <Text style={styles.fullSkipBtnText}>稍后安装</Text>
              </TouchableOpacity>
            )}
            {!isUpdating && (
              <TouchableOpacity
                style={styles.fullUpdateBtn}
                onPress={onConfirmFullUpdate}
              >
                <LinearGradient
                  colors={['#328EFF', '#3F67FF', '#4A62FF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.fullUpdateBtnGradient}
                >
                  <Text style={styles.fullUpdateBtnText}>立即更新</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  )

  return (
    <>
      {renderHotUpdateDialog()}
      {renderFullUpdateDialog()}
    </>
  )
}

const styles = createStyles({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    // 允许内容溢出显示
  },
  
  // 热更新弹窗样式
  hotUpdateDialog: {
    width: 300,
    minHeight: 200,
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  hotHeader: {
    paddingTop: 32,
    paddingBottom: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  hotDialogTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 12,
    marginBottom: 8,
    letterSpacing: 1,
  },
  hotDialogVersion: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.92,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  
  // 整包更新弹窗样式
  // 整包更新弹窗样式
  fullUpdateDialog: {
    width: 300,
    minHeight: 250,
    borderRadius: 12,
    position: 'relative',
    overflow: 'visible', // 按照UniApp方式，允许图片溢出显示
  },
  fullUpdateBg: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    borderRadius: 12,
    overflow: 'hidden',
    top: 0,
    left: 0,
  },
  fullUpdateDecor1: {
    width: 120,
    height: 120,
    position: 'absolute',
    top: -25, // 按照UniApp的定位值
    right: -8, // 按照UniApp的定位值
  },
  fullUpdateDecor2: {
    width: 90,
    height: 90,
    position: 'absolute',
    top: 20,
    left: 15,
  },
  fullUpdateContent: {
    paddingHorizontal: 20,
    paddingTop: 90,
    position: 'relative',
  },
  fullVersionText: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.8)',
  },
  
  // 通用内容样式
  dialogContent: {
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 10,
    maxHeight: 300,
  },
  updateDescription: {
    fontSize: 16,
    color: '#222',
    lineHeight: 24,
    marginBottom: 18,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  
  // 更新内容样式
  updateFeatures: {
    marginBottom: 16,
  },
  featuresTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  featureList: {
    marginBottom: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
  },
  featureText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginLeft: 10,
    flex: 1,
  },
  
  // 整包更新特殊样式
  fullUpdateFeatures: {
    marginTop: 12,
  },
  fullFeatureList: {
    marginBottom: 8,
  },
  fullFeatureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  fullFeatureDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1F6DFF',
    marginTop: 6,
    marginRight: 6,
  },
  fullFeatureText: {
    fontSize: 11,
    color: 'rgba(0, 0, 0, 0.7)',
    flex: 1,
  },
  
  // 插件变更样式
  pluginChanges: {
    marginBottom: 16,
  },
  pluginList: {
    marginTop: 8,
  },
  pluginItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  pluginHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  pluginName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  pluginVersion: {
    fontSize: 12,
    color: '#1890ff',
    backgroundColor: '#e6f7ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: '500',
  },
  pluginDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginLeft: 24,
  },
  
  // 进度条样式
  progressContainer: {
    marginTop: 16,
  },
  fullProgressContainer: {
    marginTop: 22,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#ecf2ff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressInner: {
    height: '100%',
    borderRadius: 16,
  },
  hotProgress: {
    backgroundColor: '#667eea',
  },
  fullProgress: {
    backgroundColor: '#328eff',
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fullProgressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  fullProgressText: {
    fontSize: 11,
    color: 'rgba(0, 0, 0, 0.4)',
  },
  downloadSize: {
    fontSize: 12,
    color: '#666',
  },
  fullProgressSize: {
    fontSize: 11,
    color: 'rgba(0, 0, 0, 0.4)',
  },
  
  // 按钮样式
  dialogActions: {
    flexDirection: 'row',
    paddingBottom: 22,
    paddingHorizontal: 20,
    gap: 12,
    justifyContent: 'center',
  },
  fullDialogActions: {
    paddingBottom: 22,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // 热更新按钮
  skipBtn: {
    minWidth: 110,
    paddingVertical: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 24,
    alignItems: 'center',
    marginRight: 12,
  },
  skipBtnText: {
    fontSize: 14,
    color: '#666',
  },
  updateBtn: {
    minWidth: 110,
    paddingVertical: 33.6,
    backgroundColor: '#1890ff',
    borderRadius: 24,
    alignItems: 'center',
  },
  updateBtnText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  
  // 整包更新按钮
  fullSkipBtn: {
    minWidth: 110,
    paddingVertical: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 12,
  },
  fullSkipBtnText: {
    fontSize: 14,
    color: '#666',
  },
  fullUpdateBtn: {
    width: 168, // 168rpx转换为px
    height: 27.34, // 27.34375rpx转换为px
    borderRadius: 12, // 15.625rpx转换为px
    overflow: 'hidden',
    shadowColor: '#0162FF',
    shadowOffset: { width: 0, height: 3 }, // 4.2rpx转换为px
    shadowOpacity: 0.41,
    shadowRadius: 5, // 6.6rpx转换为px
    elevation: 8,
    marginTop: 50, // 22rpx转换为px
  },
  fullUpdateBtnGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullUpdateBtnText: {
    fontSize: 9, // 11.8175rpx转换为px
    color: '#fff',
    fontWeight: 'bold',
  },
})