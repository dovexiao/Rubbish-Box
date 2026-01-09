import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { createStyles, rpx } from '@/utils/rpxStyleSheet'
import { Ionicons } from '@expo/vector-icons'
export interface VideoHeaderProps {
  title: string
  onBack?: () => void
  showBackButton?: boolean
}

/**
 * 视频头部组件
 * 显示标题和返回按钮
 */
export const VideoHeader: React.FC<VideoHeaderProps> = ({
  title,
  onBack,
  showBackButton = true,
}) => {
  const router = useRouter()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }

  return (
    <View style={styles.container}>
      {showBackButton && (
          <TouchableOpacity style={styles.backButtonInner} onPress={handleBack}>
             <Ionicons name="chevron-back" size={rpx(18.625)} color="#fff" />
          </TouchableOpacity>
      )}
      <Text style={styles.title} numberOfLines={1}>
        {title}11111
      </Text>
    </View>
  )
}

const styles = createStyles({
  container: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    zIndex: 1001,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  backButton: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  backButtonInner: {
    width: 20,
    height: 30,
    borderRadius: 20,
    // backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  backText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '600' as const,
  },
  title: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#fff',
    flex: 1,
    marginLeft: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
})

export default VideoHeader

