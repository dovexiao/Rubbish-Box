import React from 'react'
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import SearchPage, { SearchResultItem } from '@/components/SearchPage'
import { post } from '@/services/api'
import {createStyles, rpx} from '../../utils/rpxStyleSheet';

/**
 * 书籍搜索结果
 */
interface BookSearchResult {
  id: number
  title: string
  cover_url: string | null
  introduction: string | null
  description: string | null
  created_at: string
  authors: Array<{
    id: number
    name: string
  }>
  categories: Array<{
    id: number
    name: string
  }>
}

/**
 * 小褐阅读搜索API
 */
const searchBooks = async (keyword: string): Promise<SearchResultItem[]> => {
  try {
    const response = await post('/AppStart/books/books/search/', {
      keyword,
      page: '1',
      page_size: '20',
    })

    const results: BookSearchResult[] = response.results || []

    return results.map((item) => ({
      // 先展开原始数据
      ...item,
      // 然后覆盖需要的字段，确保类型正确
      id: String(item.id),
      title: item.title,
      // 简介作为副标题
      subtitle: item.introduction || item.description || '',
      cover: item.cover_url || '',
      // 标签：分类 + 作者
      tags: [
        ...item.categories?.map(c => c.name) || [],
        ...item.authors?.map(a => a.name) || []
      ].filter(Boolean),
    }))
  } catch (error) {
    console.error('搜索书籍失败:', error)
    return []
  }
}

/**
 * 获取推荐搜索词
 */
const getRecommendations = async (): Promise<string[]> => {
  try {
    const response = await post('/AppStart/books/books/recommendations/')
    console.log('推荐词API返回:', response)
    // API返回格式: { data: ["书名1", "书名2", ...] }
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
 * 小褐阅读搜索页面
 */
export default function ReaderSearchScreen() {
  const router = useRouter()

  /**
   * 点击搜索结果，跳转到阅读页面
   */
  const handleItemPress = (item: SearchResultItem) => {
    const bookId = item.id
    
    if (!bookId) {
      console.error('书籍ID不存在', item)
      return
    }

    // 跳转到阅读页面
    router.push({
      pathname: '/reader/epub-new',
      params: {
        bookId: bookId,
        title: encodeURIComponent(item.title),
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

      {/* 书籍封面（小） */}
      {item.cover && (
        <Image
          source={{ uri: item.cover }}
          style={styles.simpleCover}
          resizeMode="cover"
        />
      )}

      {/* 书籍信息 */}
      <View style={styles.simpleInfo}>
        <Text style={styles.simpleTitle} numberOfLines={1}>
          {item.title}
        </Text>

        {/* 标签 */}
        {item.tags && item.tags.length > 0 && (
          <View style={styles.simpleTagsContainer}>
            <Text style={styles.simpleTagLabel}>
              {item.tags[0]}
            </Text>
          </View>
        )}

        {/* 简介 */}
        {item.subtitle && (
          <Text style={styles.simpleDesc} numberOfLines={1}>
            {item.subtitle}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  )

  /**
   * 详细视图渲染（点击搜索按钮后的四列书籍卡片）
   */
  const renderDetailItem = ({ item }: { item: SearchResultItem }) => (
    <TouchableOpacity
      style={styles.detailItem}
      onPress={() => handleItemPress(item)}
      activeOpacity={0.7}
    >
      {/* 书籍封面 */}
      {item.cover && (
        <View style={styles.detailImageContainer}>
          <Image
            source={{ uri: item.cover }}
            style={styles.detailImage}
            resizeMode="cover"
          />
        </View>
      )}

      {/* 书籍信息 */}
      <View style={styles.detailInfo}>
        <Text style={styles.detailTitle} numberOfLines={1}>
          {item.title}
        </Text>

        {/* 简介 */}
        {item.subtitle && (
          <Text style={styles.detailDesc} numberOfLines={2}>
            {item.subtitle}
          </Text>
        )}

        {/* 标签 */}
        {item.tags && item.tags.length > 0 && (
          <Text style={styles.detailTags} numberOfLines={1}>
            {item.tags.slice(0, 2).join(' | ')}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  )

  return (
    <SearchPage
      onSearch={searchBooks}
      renderSimpleItem={renderSimpleItem}
      renderDetailItem={renderDetailItem}
      onItemPress={handleItemPress}
      placeholder="搜索书籍、作者"
      onLoadRecommendations={getRecommendations}
    />
  )
}

const styles = createStyles({
  // 简单视图样式（实时搜索的列表形式）
  simpleItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#fff' as const,
    marginHorizontal: 6.25,
    marginBottom: 0.390625,
    // marginTop: 3.90625,
    paddingHorizontal: 4.6875,
    paddingVertical: 3.90625,
  },
  simpleIconContainer: {
    width: 9.375,
    alignItems: 'center' as const,
    marginRight: 3.125,
  },
  simpleCover: {
    width: 23.4375,
    height: 31.25,
    borderRadius: 1.5625,
    backgroundColor: '#F0F0F0' as const,
  },
  simpleInfo: {
    flex: 1,
    marginLeft: 4.6875,
    justifyContent: 'center' as const,
  },
  simpleTitle: {
    fontSize: 6.25,
    fontWeight: '600' as const,
    color: '#333' as const,
    lineHeight: 8.59375,
    marginBottom: 2.34375,
  },
  simpleTagsContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 2.34375,
  },
  simpleTagLabel: {
    fontSize: 4.6875,
    color: '#FF9800' as const,
    backgroundColor: '#FFF5E6' as const,
    paddingHorizontal: 3.125,
    paddingVertical: 0.78125,
    borderRadius: 1.5625,
  },
  simpleDesc: {
    fontSize: 4.6875,
    color: '#999' as const,
    lineHeight: 7.03125,
  },
  
  // 详细视图样式（四列书籍卡片）
  detailItem: {
    width: '23%' as const,
    backgroundColor: 'transparent' as const,
    marginHorizontal: '1%' as const,
    marginBottom: 6.25,
  },
  detailImageContainer: {
    position: 'relative' as const,
    width: '100%' as const,
    aspectRatio: 0.75, // 书籍封面比例（宽:高 = 3:4）
    borderRadius: 3.125,
    overflow: 'hidden' as const,
    backgroundColor: '#F5F5F5' as const,
    shadowColor: '#000' as const,
    shadowOffset: { width: 0, height: 0.78125 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5625,
    elevation: 3,
  },
  detailImage: {
    width: '100%' as const,
    height: '100%' as const,
    backgroundColor: '#E8E8E8' as const,
  },
  detailInfo: {
    paddingTop: 3.125,
    paddingHorizontal: 1.5625,
  },
  detailTitle: {
    fontSize: 5.46875,
    fontWeight: '600' as const,
    color: '#333' as const,
    lineHeight: 7.8125,
    marginBottom: 1.5625,
  },
  detailDesc: {
    fontSize: 4.296875,
    color: '#666' as const,
    lineHeight: 6.25,
    marginBottom: 1.5625,
  },
  detailTags: {
    fontSize: 3.90625,
    color: '#999' as const,
    lineHeight: 5.46875,
  },
})


