import React, { useState, useEffect } from 'react'
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import SearchPage, { SearchResultItem } from '@/components/SearchPage'
import { post } from '@/services/api'

/**
 * 课程搜索结果
 */
interface CourseSearchResult {
  album_code: string
  course_name: string
  duration: string
  grade: string
  id: number
  imgurl: string
  series: string
  subject: string
  teacher: string
  version: string
  video_code: string
  volume: string
}

/**
 * 同步课程搜索API
 */
const searchSyncClassroom = async (keyword: string): Promise<SearchResultItem[]> => {
  try {
    const response = await post('/AppStart/ProgramResources/course_search/', {
      keyword,
      page: '1',
      page_size: '20',
    })

    const results: CourseSearchResult[] = response.results || []

    return results.map((item) => ({
      id: String(item.id),
      title: item.course_name,
      subtitle: `${item.teacher || ''}${item.teacher && item.duration ? ' · ' : ''}${item.duration || ''}`,
      cover: item.imgurl,
      tags: [item.subject, item.grade, item.version].filter(Boolean),
      // 保留原始数据
      ...item,
    }))
  } catch (error) {
    console.error('搜索同步课程失败:', error)
    return []
  }
}

/**
 * 获取推荐搜索词
 */
const getRecommendations = async (): Promise<string[]> => {
  try {
    const response = await post('/AppStart/ProgramResources/recommendations/')
    console.log('推荐词API返回:', response)
    // API返回格式: { data: ["小蝌蚪找妈妈", ...] }
    if (Array.isArray(response.data)) {
      return response.data
    }
    // 如果直接返回数组
    if (Array.isArray(response)) {
      return response
    }
    return []
  } catch (error) {
    console.error('获取推荐搜索词失败:', error)
    return []
  }
}

/**
 * 同步课程搜索页面
 */
export default function SyncClassroomSearchScreen() {
  const router = useRouter()

  /**
   * 点击搜索结果，跳转到视频播放页面
   */
  const handleItemPress = (item: SearchResultItem) => {
    // 从item中获取原始数据
    const videoCode = (item as any).video_code
    const duration = (item as any).duration || '0'
    
    if (!videoCode) {
      console.error('视频ID不存在', item)
      return
    }

    // 跳转到视频播放页面
    router.push({
      pathname: '/sync-classroom/video',
      params: {
        videoCode: videoCode,
        title: encodeURIComponent(item.title),
        Duration: '0', // 初始播放进度为0
        totalDuration: duration,
      },
    })
  }

  /**
   * 简单视图渲染（实时搜索时的列表形式）
   */
  const renderSimpleItem = ({ item }: { item: SearchResultItem }) => (
    <TouchableOpacity
      style={styles.simpleItem}
      onPress={() => handleItemPress(item)}
      activeOpacity={0.7}
    >
      {/* 左侧搜索图标 */}
      <View style={styles.simpleIconContainer}>
        <Ionicons name="search" size={16} color="#999" />
      </View>

      {/* 课程封面（小） */}
      {item.cover && (
        <Image
          source={{ uri: item.cover }}
          style={styles.simpleCover}
          resizeMode="cover"
        />
      )}

      {/* 课程信息 */}
      <View style={styles.simpleInfo}>
        <Text style={styles.simpleTitle} numberOfLines={2}>
          {item.title}
        </Text>

        {item.subtitle && (
          <Text style={styles.simpleSubtitle} numberOfLines={1}>
            {item.subtitle}
          </Text>
        )}

        {/* 标签 */}
        {item.tags && item.tags.length > 0 && (
          <View style={styles.simpleTagsContainer}>
            {item.tags.slice(0, 3).map((tag: string, index: number) => (
              <Text key={index} style={styles.simpleTag}>
                {tag}
              </Text>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  )

  /**
   * 详细视图渲染（点击搜索按钮后的两列视频卡片）
   */
  const renderDetailItem = ({ item }: { item: SearchResultItem }) => (
    <TouchableOpacity
      style={styles.detailItem}
      onPress={() => handleItemPress(item)}
      activeOpacity={0.7}
    >
      {/* 视频封面 */}
      {item.cover && (
        <View style={styles.detailImageContainer}>
          <Image
            source={{ uri: item.cover }}
            style={styles.detailImage}
            resizeMode="cover"
          />
          {/* 播放按钮 */}
          <View style={styles.playButton}>
            <Ionicons name="play" size={24} color="#fff" />
          </View>
        </View>
      )}

      {/* 视频信息 */}
      <View style={styles.detailInfo}>
        <Text style={styles.detailTitle} numberOfLines={2}>
          {item.title}
        </Text>

        {/* 标签 */}
        {item.tags && item.tags.length > 0 && (
          <View style={styles.detailTagsContainer}>
            {item.tags.slice(0, 2).map((tag: string, index: number) => (
              <Text key={index} style={styles.detailTag}>
                {tag}
              </Text>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  )

  /**
   * 旧的详细卡片（暂时保留，以防需要）
   */
  const renderOldDetailItem = ({ item }: { item: SearchResultItem }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleItemPress(item)}
      activeOpacity={0.7}
    >
      {/* 课程封面 */}
      {item.cover && (
        <Image
          source={{ uri: item.cover }}
          style={styles.courseCover}
          resizeMode="cover"
        />
      )}

      {/* 课程信息 */}
      <View style={styles.courseInfo}>
        <Text style={styles.courseTitle} numberOfLines={2}>
          {item.title}
        </Text>

        {item.subtitle && (
          <Text style={styles.courseDesc} numberOfLines={2}>
            {item.subtitle}
          </Text>
        )}

        {/* 标签 */}
        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.slice(0, 3).map((tag: string, index: number) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  )

  return (
    <SearchPage
      onSearch={searchSyncClassroom}
      renderSimpleItem={renderSimpleItem}
      renderDetailItem={renderDetailItem}
      onItemPress={handleItemPress}
      placeholder="搜索课程"
      onLoadRecommendations={getRecommendations}
    />
  )
}

const styles = StyleSheet.create({
  // 简单视图样式（实时搜索的列表形式 - 图一）
  simpleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  simpleIconContainer: {
    width: 24,
    alignItems: 'center',
    marginRight: 8,
  },
  simpleCover: {
    width: 60,
    height: 80,
    borderRadius: 4,
    backgroundColor: '#F0F0F0',
  },
  simpleInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  simpleTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    lineHeight: 21,
    marginBottom: 4,
  },
  simpleSubtitle: {
    fontSize: 12,
    color: '#999',
    marginBottom: 6,
  },
  simpleTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  simpleTag: {
    fontSize: 11,
    color: '#666',
    marginRight: 8,
    marginBottom: 2,
  },
  
  // 详细视图样式（四列视频卡片）
  detailItem: {
    width: '23%',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: '1%',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  detailImageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 4 / 3,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
  },
  detailImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E8E8E8',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -18 }, { translateY: -18 }],
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailInfo: {
    padding: 8,
  },
  detailTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
    lineHeight: 18,
    marginBottom: 6,
    height: 36,
  },
  detailTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailTag: {
    fontSize: 11,
    color: '#999',
    marginRight: 6,
    marginBottom: 2,
  },
  
  // 旧样式（保留）
  resultItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  courseCover: {
    width: 100,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  courseInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    lineHeight: 22,
    marginBottom: 6,
  },
  courseDesc: {
    fontSize: 13,
    color: '#999',
    lineHeight: 18,
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#1E90FF',
  },
})

