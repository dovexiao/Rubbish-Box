import React, { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { useActivityTracking, useCurrentActivity, useActivityHistory } from '../../hooks/useActivityTracking'
import { ActivityType, ActivityStatus } from '../../types/activity'

/**
 * 活动追踪测试页面
 * 
 * 用于测试和演示活动追踪功能
 */
export default function ActivityTrackingTestScreen() {
  const {
    startReading,
    updateReadingProgress,
    endReading,
    startVideo,
    updateVideoProgress,
    endVideo,
    startHomework,
    endHomework,
    startComposition,
    endComposition,
    startErrorBook,
    endErrorBook,
  } = useActivityTracking({
    throttleDelay: 1000, // 测试时使用较短的节流时间
    autoExitOnUnmount: false, // 测试时禁用自动退出
  })
  
  const currentActivity = useCurrentActivity()
  const activityHistory = useActivityHistory()
  
  const [readingProgress, setReadingProgress] = useState(0)
  const [videoProgress, setVideoProgress] = useState(0)
  
  // ==================== 测试阅读 ====================
  
  const handleStartReading = () => {
    startReading({
      bookId: 'test-book-123',
      bookName: '测试书籍',
      progress: 0,
      currentPage: 1,
      totalPages: 100,
    })
    setReadingProgress(0)
  }
  
  const handleUpdateReadingProgress = () => {
    const newProgress = Math.min(readingProgress + 10, 100)
    setReadingProgress(newProgress)
    updateReadingProgress(newProgress, {
      currentPage: Math.ceil(newProgress),
    })
  }
  
  const handleEndReading = () => {
    endReading()
    setReadingProgress(0)
  }
  
  // ==================== 测试视频 ====================
  
  const handleStartVideo = () => {
    startVideo({
      videoId: 'test-video-456',
      videoName: '测试视频',
      progress: 0,
      duration: 600, // 10分钟
      courseId: 'course-001',
      courseName: '数学课程',
    })
    setVideoProgress(0)
  }
  
  const handleUpdateVideoProgress = () => {
    const newProgress = Math.min(videoProgress + 60, 600) // 每次增加60秒
    setVideoProgress(newProgress)
    updateVideoProgress(newProgress, 600)
  }
  
  const handleEndVideo = () => {
    endVideo()
    setVideoProgress(0)
  }
  
  // ==================== 测试作业 ====================
  
  const handleStartHomework = () => {
    startHomework({
      homeworkId: 'homework-789',
      homeworkName: '数学作业',
      subject: '数学',
      questionCount: 10,
    })
  }
  
  const handleEndHomework = () => {
    endHomework()
  }
  
  // ==================== 测试作文 ====================
  
  const handleStartComposition = () => {
    startComposition({
      compositionId: 'composition-101',
      compositionName: '我的理想',
      wordCount: 500,
    })
  }
  
  const handleEndComposition = () => {
    endComposition()
  }
  
  // ==================== 测试错题本 ====================
  
  const handleStartErrorBook = () => {
    startErrorBook({
      subject: '数学',
      difficulty: '中等',
    })
  }
  
  const handleEndErrorBook = () => {
    endErrorBook()
  }
  
  // ==================== 渲染 ====================
  
  const getActivityStatusColor = (status?: ActivityStatus) => {
    switch (status) {
      case ActivityStatus.ENTER:
        return '#4CAF50'
      case ActivityStatus.UPDATE:
        return '#2196F3'
      case ActivityStatus.EXIT:
        return '#F44336'
      default:
        return '#999'
    }
  }
  
  const getActivityTypeLabel = (type?: ActivityType) => {
    switch (type) {
      case ActivityType.READING:
        return '阅读'
      case ActivityType.VIDEO:
        return '视频'
      case ActivityType.HOMEWORK:
        return '作业'
      case ActivityType.COMPOSITION:
        return '作文'
      case ActivityType.ERROR_BOOK:
        return '错题本'
      default:
        return '未知'
    }
  }
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>活动追踪测试</Text>
      
      {/* 当前活动 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>当前活动</Text>
        {currentActivity ? (
          <View style={styles.activityCard}>
            <View style={styles.activityHeader}>
              <Text style={styles.activityType}>{getActivityTypeLabel(currentActivity.type)}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getActivityStatusColor(currentActivity.status) }]}>
                <Text style={styles.statusText}>{currentActivity.status}</Text>
              </View>
            </View>
            <Text style={styles.activityDetail}>
              时间: {new Date(currentActivity.timestamp).toLocaleTimeString()}
            </Text>
            <Text style={styles.activityDetail}>
              数据: {JSON.stringify(currentActivity, null, 2)}
            </Text>
          </View>
        ) : (
          <Text style={styles.emptyText}>暂无活动</Text>
        )}
      </View>
      
      {/* 阅读测试 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>阅读测试</Text>
        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.button} onPress={handleStartReading}>
            <Text style={styles.buttonText}>开始阅读</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleUpdateReadingProgress}>
            <Text style={styles.buttonText}>更新进度 ({readingProgress}%)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleEndReading}>
            <Text style={styles.buttonText}>结束阅读</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* 视频测试 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>视频测试</Text>
        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.button} onPress={handleStartVideo}>
            <Text style={styles.buttonText}>开始视频</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleUpdateVideoProgress}>
            <Text style={styles.buttonText}>更新进度 ({Math.round(videoProgress)}s)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleEndVideo}>
            <Text style={styles.buttonText}>结束视频</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* 作业测试 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>作业测试</Text>
        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.button} onPress={handleStartHomework}>
            <Text style={styles.buttonText}>开始作业</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleEndHomework}>
            <Text style={styles.buttonText}>结束作业</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* 作文测试 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>作文测试</Text>
        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.button} onPress={handleStartComposition}>
            <Text style={styles.buttonText}>开始作文</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleEndComposition}>
            <Text style={styles.buttonText}>结束作文</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* 错题本测试 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>错题本测试</Text>
        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.button} onPress={handleStartErrorBook}>
            <Text style={styles.buttonText}>进入错题本</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleEndErrorBook}>
            <Text style={styles.buttonText}>退出错题本</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* 活动历史 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>活动历史 (最近 {activityHistory.length} 条)</Text>
        {activityHistory.length > 0 ? (
          activityHistory.slice(0, 5).map((activity, index) => (
            <View key={index} style={styles.historyItem}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyType}>{getActivityTypeLabel(activity.type)}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getActivityStatusColor(activity.status) }]}>
                  <Text style={styles.statusText}>{activity.status}</Text>
                </View>
              </View>
              <Text style={styles.historyTime}>
                {new Date(activity.timestamp).toLocaleTimeString()}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>暂无历史记录</Text>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  activityCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityType: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  activityDetail: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    padding: 20,
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  button: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  historyItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  historyType: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  historyTime: {
    fontSize: 12,
    color: '#666',
  },
})

