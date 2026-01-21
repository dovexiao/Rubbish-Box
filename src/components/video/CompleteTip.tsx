import React from 'react'
import { View, Text, TouchableOpacity, Modal } from 'react-native'
import { createStyles } from '@/utils/rpxStyleSheet'

export interface CompleteTipProps {
  visible: boolean
  onContinue: () => void
  onStartPractice: () => void
  onClose?: () => void
}

/**
 * 视频完成提示组件
 * 显示视频播放完成后的提示弹窗
 */
export const CompleteTip: React.FC<CompleteTipProps> = ({
  visible,
  onContinue,
  onStartPractice,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>🎉 视频播放完成</Text>
          <Text style={styles.message}>
            恭喜你完成了本课堂的学习！
          </Text>
          
          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.button, styles.continueButton]}
              onPress={onContinue}
              activeOpacity={0.8}
            >
              <Text style={styles.continueButtonText}>继续观看</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.practiceButton]}
              onPress={onStartPractice}
              activeOpacity={0.8}
            >
              <Text style={styles.practiceButtonText}>开始练习</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = createStyles({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  content: {
    width: 300,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center' as const,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#333',
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center' as const,
    marginBottom: 24,
  },
  buttons: {
    flexDirection: 'row' as const,
    gap: 12,
    width: '100%' as const,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  continueButton: {
    backgroundColor: '#f0f0f0',
  },
  practiceButton: {
    backgroundColor: '#4891FF',
  },
  continueButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500' as const,
  },
  practiceButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500' as const,
  },
})

export default CompleteTip

