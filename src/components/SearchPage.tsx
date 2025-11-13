import React, { useState, useCallback, useEffect } from 'react'
import {
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Text,
  ActivityIndicator,
  Image,
  Keyboard,
  ScrollView,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { StatusBar } from '@/components/StatusBar'

/**
 * 搜索结果项的类型定义
 */
export interface SearchResultItem {
  id: string
  title: string
  subtitle?: string
  cover?: string
  tags?: string[]
  [key: string]: any // 允许其他自定义字段
}

/**
 * 搜索组件Props
 */
interface SearchPageProps {
  // 搜索API函数
  onSearch: (keyword: string) => Promise<SearchResultItem[]>
  // 渲染实时搜索结果项（简单视图）
  renderSimpleItem?: (item: SearchResultItem) => React.ReactNode
  // 渲染详细搜索结果项（点击搜索按钮后的卡片视图）
  renderDetailItem?: (item: SearchResultItem) => React.ReactNode
  // 点击搜索结果项的回调
  onItemPress: (item: SearchResultItem) => void
  // 占位符文本
  placeholder?: string
  // 初始关键词
  initialKeyword?: string
  // 推荐搜索词列表
  recommendations?: string[]
  // 获取推荐搜索词的函数
  onLoadRecommendations?: () => Promise<string[]>
}

/**
 * 通用搜索页面组件
 */
export default function SearchPage({
  onSearch,
  renderSimpleItem,
  renderDetailItem,
  onItemPress,
  placeholder = '搜索',
  initialKeyword = '',
  recommendations: initialRecommendations = [],
  onLoadRecommendations,
}: SearchPageProps) {
  const router = useRouter()
  const [keyword, setKeyword] = useState(initialKeyword)
  const [results, setResults] = useState<SearchResultItem[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [recommendations, setRecommendations] = useState<string[]>(initialRecommendations)
  const [isDetailView, setIsDetailView] = useState(false) // 是否显示详细卡片视图

  // 加载推荐搜索词
  useEffect(() => {
    if (onLoadRecommendations && recommendations.length === 0) {
      onLoadRecommendations()
        .then((data) => {
          console.log('推荐搜索词加载成功:', data)
          setRecommendations(data)
        })
        .catch((error) => {
          console.error('推荐搜索词加载失败:', error)
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 监听输入框变化，实时搜索
  useEffect(() => {
    if (keyword.trim() && !isDetailView) {
      const timer = setTimeout(async () => {
        setLoading(true)
        setSearched(true)
        try {
          const data = await onSearch(keyword.trim())
          setResults(data)
        } catch (error) {
          console.error('实时搜索失败:', error)
          setResults([])
        } finally {
          setLoading(false)
        }
      }, 300) // 防抖300ms

      return () => clearTimeout(timer)
    } else if (!keyword.trim()) {
      setResults([])
      setSearched(false)
      setIsDetailView(false)
    }
  }, [keyword, isDetailView, onSearch])

  /**
   * 点击搜索按钮（切换到详细卡片视图）
   */
  const handleSearch = useCallback(() => {
    if (!keyword.trim()) return

    Keyboard.dismiss()
    
    // 如果已经有搜索结果，直接切换视图
    if (results.length > 0) {
      setIsDetailView(true)
    } else {
      // 如果还没有结果（用户直接点搜索），则先搜索再切换
      setLoading(true)
      setSearched(true)
      onSearch(keyword.trim())
        .then((data) => {
          setResults(data)
          setIsDetailView(true)
        })
        .catch((error) => {
          console.error('搜索失败:', error)
          setResults([])
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [keyword, results.length, onSearch])

  /**
   * 清空搜索
   */
  const handleClear = useCallback(() => {
    setKeyword('')
    setResults([])
    setSearched(false)
    setIsDetailView(false)
  }, [])

  /**
   * 渲染默认搜索结果项（如果没有自定义renderItem）
   */
  const renderDefaultItem = useCallback(
    ({ item }: { item: SearchResultItem }) => (
      <TouchableOpacity
        style={styles.resultItem}
        onPress={() => onItemPress(item)}
        activeOpacity={0.7}
      >
        {item.cover && (
          <Image
            source={{ uri: item.cover }}
            style={styles.resultCover}
            resizeMode="cover"
          />
        )}
        <View style={styles.resultContent}>
          <Text style={styles.resultTitle} numberOfLines={1}>
            {item.title}
          </Text>
          {item.subtitle && (
            <Text style={styles.resultSubtitle} numberOfLines={2}>
              {item.subtitle}
            </Text>
          )}
          {item.tags && item.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {item.tags.slice(0, 2).map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </TouchableOpacity>
    ),
    [onItemPress]
  )

  return (
    <LinearGradient
      colors={['#E8F4F8', '#F0F8FA', '#FFFFFF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 0.3 }}
      style={styles.container}
    >
      <StatusBar theme="" backgroundColor="transparent" translucent={false} />
      {/* 搜索头部 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={48} color="#1E90FF" />
        </TouchableOpacity>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={placeholder}
            placeholderTextColor="#AAAAAA"
            value={keyword}
            onChangeText={setKeyword}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoFocus
          />
          {keyword.length > 0 && (
            <TouchableOpacity onPress={handleClear} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={18} color="#CCCCCC" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
          activeOpacity={0.8}
        >
          <Text style={styles.searchButtonText}>搜索</Text>
        </TouchableOpacity>
      </View>

      {/* 搜索结果列表 */}
      <View style={styles.content}>
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#1E90FF" />
            <Text style={styles.loadingText}>搜索中...</Text>
          </View>
        ) : !searched && recommendations.length > 0 ? (
          // 显示推荐搜索词
          <ScrollView style={styles.recommendContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.recommendTitle}>推荐搜索</Text>
            <View style={styles.recommendTags}>
              {recommendations.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.recommendTag}
                  onPress={async () => {
                    setKeyword(item)
                    setLoading(true)
                    setSearched(true)
                    try {
                      const data = await onSearch(item)
                      setResults(data)
                    } catch (error) {
                      console.error('搜索失败:', error)
                      setResults([])
                    } finally {
                      setLoading(false)
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.recommendTagText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        ) : searched && results.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>没有更多啦~</Text>
          </View>
        ) : isDetailView ? (
          // 详细卡片视图（点击搜索按钮后，四列布局）
          <FlatList
            key="detail-view"
            data={results}
            keyExtractor={(item) => item.id}
            renderItem={renderDetailItem || renderDefaultItem}
            numColumns={4}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={styles.columnWrapper}
          />
        ) : (
          // 简单列表视图（实时搜索，单列布局）
          <FlatList
            key="simple-view"
            data={results}
            keyExtractor={(item) => item.id}
            renderItem={renderSimpleItem || renderDefaultItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 58,
    paddingVertical: 10,
    marginTop: 90,
    backgroundColor: 'transparent',
  },
  backButton: {
    paddingRight: 8,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 38,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    padding: 0,
  },
  searchButton: {
    marginLeft: 30,
    paddingHorizontal: 28,
    paddingVertical: 9,
    backgroundColor: '#3B76FF',
    borderRadius: 12,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
  listContent: {
    paddingVertical: 12,
  },
  columnWrapper: {
    paddingHorizontal: 16,
    justifyContent: 'flex-start',
  },
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
  resultCover: {
    width: 80,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  resultContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  resultSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#FFF5E6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#FF9800',
  },
  recommendContainer: {
    flex: 1,
    paddingHorizontal: 58,
    paddingTop: 24,
  },
  recommendTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 18,
  },
  recommendTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  recommendTag: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 18,
    marginRight: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  recommendTagText: {
    fontSize: 14,
    color: '#555',
  },
})

