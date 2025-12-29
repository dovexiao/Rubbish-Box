import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

import { StatusBar } from "../../components/StatusBar"
import { NavBar } from "../../components/NavBar"
import { Loading } from "../../components/Loading"
import CustomSelector from "../../components/CustomSelector"
import { GradeSelector, type GradeSelection } from "../../components/GradeSelector"
import { createStyles, rpx } from "../../utils/rpxStyleSheet"
import { Images } from "../../constants/Assets"
import {
  getSubjectList,
  getVersionList,
  getCourseResource,
  getProgramResourcesHistory,
  type CourseResourceResponse,
  type GroupedCourseResource,
} from "../../services/classroom"
import { useUserStore } from "../../stores/userStore"
import { useThrottle } from "../../hooks/useThrottle"

/**
 * 同步课堂首页
 * 100%还原UniApp项目 /src/pages/sync-classroom/index.vue
 */
export default function SyncClassroomScreen() {
  const router = useRouter()
  const userStore = useUserStore()

  // 状态管理
  const [currentSubject, setCurrentSubject] = useState(0)
  const [selectedGrade, setSelectedGrade] = useState("") // 年级格式：初一-上册（不需要转换）
  const [selectedVersion, setSelectedVersion] = useState("")
  const [loading, setLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [subjects, setSubjects] = useState<string[]>([])
  const [versionOptions, setVersionOptions] = useState<string[]>([])
  
  // 保存之前选择的学科名称，用于年级切换时保持选择
  const previousSubjectNameRef = useRef<string | null>(null)
  const [courseResource, setCourseResource] = useState<CourseResourceResponse>({
    grouped_course_resources: [],
    rspname: "",
    introduction: "",
    cover_v: "",
    Referer_img: "",
    pagination: { total: 0, page: 1, page_size: 10, total_pages: 0 },
  })
  const [expandedCourses, setExpandedCourses] = useState<Set<number>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isGradeInitialized, setIsGradeInitialized] = useState(false) // 防止重复初始化
  
  // 年级选择弹窗状态
  const [showGradeSelector, setShowGradeSelector] = useState(false)
  const [gradeSelection, setGradeSelection] = useState<GradeSelection>({
    educationalSystem: "六三",
    gradeStage: "小学",
    grade: "一年级",
    semester: "上册",
  })

  // 年级选项
  const gradeOptions = [
    "一年级-上册",
    "一年级-下册",
    "二年级-上册",
    "二年级-下册",
    "三年级-上册",
    "三年级-下册",
    "四年级-上册",
    "四年级-下册",
    "五年级-上册",
    "五年级-下册",
    "六年级-上册",
    "六年级-下册",
    "七年级-上册",
    "七年级-下册",
    "八年级-上册",
    "八年级-下册",
    "九年级-上册",
    "九年级-下册",
  ]

  // 初始化用户年级
  const initUserGrade = async () => {
    // 防止重复初始化
    if (isGradeInitialized) {
      console.log('⏭️ 年级已初始化，跳过')
      return
    }
    
    try {
      // 调用新接口获取课程历史记录
      const history = await getProgramResourcesHistory()
      
      console.log('📚 获取课程历史记录:', history)
      
      // 直接使用接口返回的值，不需要转换
      const { user_grade, volume, educational_system, grade_stage } = history
      
      // 设置年级选择器的初始值
      setGradeSelection({
        educationalSystem: educational_system as "六三" | "五四",
        gradeStage: grade_stage as "小学" | "初中" | "高中",
        grade: user_grade,
        semester: volume,
      })
      
      // 直接设置年级，不需要转换
      setSelectedGrade(`${user_grade}-${volume}`)
      setIsGradeInitialized(true)
    } catch (error) {
      console.error('获取课程历史记录失败，使用默认年级:', error)
      setSelectedGrade("一年级-上册")
      setIsGradeInitialized(true)
    }
  }

  // 获取科目列表
  const fetchSubjectList = useCallback(async () => {
    try {
      setLoading(true)
      const [grade, volume] = selectedGrade.split("-")
      const response = await getSubjectList({ 
        grade, 
        volume,
        educational_system: gradeSelection.educationalSystem
      })

      if (Array.isArray(response)) {
        setSubjects(response)
        
        // 尝试匹配之前选择的学科
        let targetSubjectIndex = 0
        if (previousSubjectNameRef.current && response.length > 0) {
          const matchedIndex = response.findIndex(
            (subject) => subject === previousSubjectNameRef.current
          )
          if (matchedIndex !== -1) {
            targetSubjectIndex = matchedIndex
            console.log(`✅ 找到匹配的学科: ${previousSubjectNameRef.current}, 索引: ${matchedIndex}`)
          } else {
            console.log(`⚠️ 新年级不存在学科: ${previousSubjectNameRef.current}, 使用第一个学科`)
            previousSubjectNameRef.current = null // 清除不存在的学科引用
          }
        }
        setCurrentSubject(targetSubjectIndex)

        // 直接使用response而不是state，避免闭包问题
        if (response.length > 0) {
          // 使用匹配到的学科或第一个学科
          const subject = response[targetSubjectIndex]
          const versionResponse = await getVersionList({ 
            grade, 
            volume, 
            subject,
            educational_system: gradeSelection.educationalSystem
          })

          if (Array.isArray(versionResponse)) {
            setVersionOptions(versionResponse)
            setSelectedVersion(versionResponse[0] || "")

            // 获取课程资源
            if (versionResponse[0]) {
              const courseResponse = await getCourseResource({
                grade,
                semester: volume,
                subject,
                version: versionResponse[0],
                page: 1,
                page_size: 10,
                educational_system: gradeSelection.educationalSystem,
              })

              if (courseResponse && courseResponse.grouped_course_resources) {
                setCourseResource(courseResponse)
                setHasMore(courseResponse.pagination.page < courseResponse.pagination.total_pages)

                // 展开所有课程
                const newExpanded = new Set<number>()
                courseResponse.grouped_course_resources.forEach((group) => {
                  newExpanded.add(group.group_index)
                })
                setExpandedCourses(newExpanded)
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("获取科目列表失败:", error)
    } finally {
      setLoading(false)
    }
  }, [selectedGrade, gradeSelection.educationalSystem])

  // 获取版本列表（支持传入subjectIndex）
  const fetchVersionList = useCallback(
    async (subjectIndex?: number) => {
      try {
        setLoading(true) // 开始loading
        const [grade, volume] = selectedGrade.split("-")
        const subjectIdx = subjectIndex !== undefined ? subjectIndex : currentSubject
        const subject = subjects[subjectIdx]

        console.log("📚 获取版本列表:", { grade, volume, subject, subjectIdx })

        if (!grade || !volume || !subject) {
          console.log("⚠️ 参数不完整，跳过获取版本")
          setLoading(false)
          return
        }

        const response = await getVersionList({ 
          grade, 
          volume, 
          subject,
          educational_system: gradeSelection.educationalSystem
        })
        console.log("✅ 版本列表响应:", response)

        if (Array.isArray(response)) {
          setVersionOptions(response)
          setSelectedVersion(response[0] || "")

          if (response[0]) {
            // 直接获取课程资源，使用最新的参数
            const courseResponse = await getCourseResource({
              grade,
              semester: volume,
              subject,
              version: response[0],
              page: 1,
              page_size: 10,
              educational_system: gradeSelection.educationalSystem,
            })

            if (courseResponse && courseResponse.grouped_course_resources) {
              setCourseResource(courseResponse)
              setHasMore(courseResponse.pagination.page < courseResponse.pagination.total_pages)

              // 展开所有课程
              const newExpanded = new Set<number>()
              courseResponse.grouped_course_resources.forEach((group) => {
                newExpanded.add(group.group_index)
              })
              setExpandedCourses(newExpanded)
            }
          }
        }
    } catch (error) {
      console.error("获取版本列表失败:", error)
    } finally {
      setLoading(false) // 结束loading
    }
  },
  [selectedGrade, subjects, currentSubject, gradeSelection.educationalSystem],
)

  // 获取课程资源
  const fetchCourseResource = useCallback(
    async (isLoadMore = false) => {
      try {
        const [grade, semester] = selectedGrade.split("-")
        const subject = subjects[currentSubject] || ""
        const version = selectedVersion

        if (!grade || !semester || !subject || !version) return

        if (!isLoadMore) {
          setLoading(true)
        } else {
          setIsLoadingMore(true)
        }

        const response = await getCourseResource({
          grade,
          semester,
          subject,
          version,
          page: currentPage,
          page_size: 10,
          educational_system: gradeSelection.educationalSystem,
        })

        if (response && response.grouped_course_resources) {
          if (isLoadMore) {
            setCourseResource((prev) => ({
              ...response,
              grouped_course_resources: [
                ...prev.grouped_course_resources,
                ...response.grouped_course_resources,
              ],
            }))
          } else {
            setCourseResource(response)
          }

          setHasMore(response.pagination.page < response.pagination.total_pages)

          // 展开新加载的课程
          const newExpanded = new Set(expandedCourses)
          response.grouped_course_resources.forEach((group) => {
            newExpanded.add(group.group_index)
          })
          setExpandedCourses(newExpanded)
        }
    } catch (error) {
      console.error("获取课程资源失败:", error)
    } finally {
      setLoading(false)
      setIsLoadingMore(false)
    }
  },
  [selectedGrade, subjects, currentSubject, selectedVersion, currentPage, expandedCourses, gradeSelection.educationalSystem],
)

  // 重置分页
  const resetPagination = useCallback(() => {
    setCurrentPage(1)
    setHasMore(true)
    setCourseResource({
      grouped_course_resources: [],
      rspname: "",
      introduction: "",
      cover_v: "",
      Referer_img: "",
      pagination: { total: 0, page: 1, page_size: 10, total_pages: 0 },
    })
  }, [])

  // 切换学科
  const switchSubject = useCallback(
    async (index: number) => {
      console.log("🔄 切换学科到:", index, subjects[index])
      setCurrentSubject(index)
      
      // 保存当前选择的学科名称
      if (subjects[index]) {
        previousSubjectNameRef.current = subjects[index]
        console.log(`💾 更新保存的学科: ${previousSubjectNameRef.current}`)
      }
      
      resetPagination()
      // 清空当前数据，避免显示旧数据
      setCourseResource({
        grouped_course_resources: [],
        rspname: "",
        introduction: "",
        cover_v: "",
        Referer_img: "",
        pagination: { total: 0, page: 1, page_size: 10, total_pages: 0 },
      })
      // 传入新的index，避免使用旧的currentSubject
      await fetchVersionList(index)
    },
    [resetPagination, fetchVersionList, subjects],
  )

  // 选择年级（通过弹窗）
  const handleGradeConfirm = useCallback(
    async (selection: GradeSelection) => {
      console.log("📚 年级选择确认:", selection)
      
      // 在切换年级前，保存当前选择的学科名称
      if (subjects.length > 0 && currentSubject < subjects.length) {
        previousSubjectNameRef.current = subjects[currentSubject]
        console.log(`💾 保存当前学科: ${previousSubjectNameRef.current}`)
      }
      
      setGradeSelection(selection)
      
      // 直接使用选择的年级，不需要转换
      const gradeString = `${selection.grade}-${selection.semester}`
      console.log("📚 选择的年级:", gradeString)
      
      setSelectedGrade(gradeString)
      resetPagination()
      setSelectedVersion("")
      setVersionOptions([])
      await fetchSubjectList()
    },
    [resetPagination, fetchSubjectList, subjects, currentSubject],
  )
  
  // 旧的年级选择方法（保留兼容）
  const selectGrade = useCallback(
    async (grade: string) => {
      // 在切换年级前，保存当前选择的学科名称
      if (subjects.length > 0 && currentSubject < subjects.length) {
        previousSubjectNameRef.current = subjects[currentSubject]
        console.log(`💾 保存当前学科: ${previousSubjectNameRef.current}`)
      }
      
      setSelectedGrade(grade)
      resetPagination()
      setSelectedVersion("")
      setVersionOptions([])
      await fetchSubjectList()
    },
    [resetPagination, fetchSubjectList, subjects, currentSubject],
  )

  // 选择版本
  const selectVersion = useCallback(
    async (version: string) => {
      setSelectedVersion(version)
      setLoading(true)
      resetPagination()

      try {
        const [grade, volume] = selectedGrade.split("-")
        const subject = subjects[currentSubject]

        console.log("📦 选择版本:", { grade, volume, subject, version })

        const courseResponse = await getCourseResource({
          grade,
          semester: volume,
          subject,
          version,
          page: 1,
          page_size: 10,
          educational_system: gradeSelection.educationalSystem,
        })

        if (courseResponse && courseResponse.grouped_course_resources) {
          setCourseResource(courseResponse)
          setHasMore(courseResponse.pagination.page < courseResponse.pagination.total_pages)

          // 展开所有课程
          const newExpanded = new Set<number>()
          courseResponse.grouped_course_resources.forEach((group) => {
            newExpanded.add(group.group_index)
          })
          setExpandedCourses(newExpanded)
        }
    } catch (error) {
      console.error("获取课程资源失败:", error)
    } finally {
      setLoading(false)
    }
  },
  [selectedGrade, subjects, currentSubject, resetPagination, gradeSelection.educationalSystem],
)

  // 点击课程（展开/收起）
  const toggleCourse = useCallback((courseId: number) => {
    setExpandedCourses((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(courseId)) {
        newSet.delete(courseId)
      } else {
        newSet.add(courseId)
      }
      return newSet
    })
  }, [])

  // 播放视频
  const playVideo = useCallback(
    (point: any) => {
      router.push({
        pathname: "/sync-classroom/video",
        params: {
          videoCode: point.id,
          title: encodeURIComponent(point.title),
          Duration: point.record,
          totalDuration: point.duration,
          educational_system: gradeSelection.educationalSystem,
          grade_stage: gradeSelection.gradeStage,
        },
      })
    },
    [router, subjects, currentSubject, gradeSelection.educationalSystem, gradeSelection.gradeStage],
  )

  // 开始练习
  const startPractice = useCallback(
    (point: any) => {
      router.push({
        pathname: "/ai/error-book/practice",
        params: {
          mode: "multiple",
          type: "course",
          videoCode: point.id,
        },
      })
    },
    [router],
  )

  // 加载更多
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore) return
    setCurrentPage((prev) => prev + 1)
  }, [hasMore, isLoadingMore])

  // 节流处理搜索跳转
  const handleSearchPress = useThrottle(() => {
    router.push("/sync-classroom/search")
  }, 500)

  // 当前课程列表
  const currentCourses = useMemo(() => {
    return courseResource.grouped_course_resources.map((group) => ({
      id: group.group_index,
      title: group.group_title,
      description: `第${group.group_index}单元`,
      expanded: expandedCourses.has(group.group_index),
      knowledgePoints: group.lessons.map((lesson) => ({
        id: lesson.video_code,
        title: lesson.course_name,
        duration: lesson.duration,
        record: lesson.record,
        is_latest: lesson.is_latest,
      })),
    }))
  }, [courseResource.grouped_course_resources, expandedCourses])

  // 初始化 - 只在组件挂载时执行一次
  useEffect(() => {
    initUserGrade()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // 空依赖数组，只执行一次

  useEffect(() => {
    if (selectedGrade) {
      fetchSubjectList()
    }
  }, [selectedGrade])

  useEffect(() => {
    if (currentPage > 1) {
      fetchCourseResource(true)
    }
  }, [currentPage])

  return (
    <LinearGradient
      colors={["#9DDEFF", "#9DDEFF", "#DAECFF", "#FFFFFF"]}
      locations={[0, 0.4, 0.7, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.pageContainer}
    >
      <StatusBar theme="dark" backgroundColor="transparent" translucent={true} />
      <NavBar 
        title="同步课程" 
        leftArrow 
        onBackPress={() => router.navigate("/(tabs)/study")}
      />

      {/* 学科选择标签 */}
      <View style={styles.subjectTabs}>
        <View style={styles.subjectTabsLeft}>
          {subjects.map((subject, index) => (
            <TouchableOpacity
              key={index}
              style={styles.subjectTab}
              onPress={() => switchSubject(index)}
            >
              <Text
                style={[
                  styles.subjectTabText,
                  currentSubject === index && styles.subjectTabTextActive,
                ]}
              >
                {subject}
              </Text>
              {currentSubject === index && (
                <Image source={Images.tabsActive} style={styles.subjectTabIndicator} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.selectorsContainer}>
          {/* 版本选择 */}
          <CustomSelector
            options={versionOptions.map((version) => ({ label: version, value: version }))}
            selectedValue={selectedVersion}
            onSelect={(value) => selectVersion(value as string)}
            placeholder="选择版本"
            style={styles.versionSelector}
          />

          {/* 年级选择 - 新样式弹窗 */}
          <TouchableOpacity
            style={styles.gradeButton}
            onPress={() => setShowGradeSelector(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.gradeButtonText}>
              {selectedGrade || "选择年级"}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#666" />
          </TouchableOpacity>
          
           {/* 搜索 */}
         <TouchableOpacity
            onPress={handleSearchPress}
            activeOpacity={0.7}
            style={styles.searchContent}
          >
            <Ionicons name="search" size={18} color="#00000066" />
          </TouchableOpacity>
        </View>
       
      </View>

      {/* 主内容区 */}
      <View style={styles.mainContent}>
        {loading ? (
          <Loading text="正在加载课程数据..." />
        ) : (
          <>
            {/* 左侧课程信息 */}
            {currentCourses.length > 0 && (
              <View style={styles.coursesSection}>
                <View style={styles.courseBook}>
                  {courseResource.cover_v && (
                    <Image
                      source={{ uri: courseResource.cover_v }}
                      style={styles.bookCover}
                      resizeMode="contain"
                    />
                  )}
                  <View style={styles.bookInfo}>
                    <Text style={styles.bookTitle}>{courseResource.rspname}</Text>
                    <Text style={styles.bookDetail} numberOfLines={7}>
                      {courseResource.introduction}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* 右侧知识点列表 */}
            {currentCourses.length > 0 && courseResource.grouped_course_resources.length > 0 ? (
              <View style={styles.knowledgeSection}>
                <ScrollView
                  style={styles.knowledgeScroll}
                  showsVerticalScrollIndicator={false}
                  onScroll={({ nativeEvent }) => {
                    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent
                    const isCloseToBottom =
                      layoutMeasurement.height + contentOffset.y >= contentSize.height - 20
                    if (isCloseToBottom) {
                      loadMore()
                    }
                  }}
                  scrollEventThrottle={400}
                >
                  {currentCourses.map((course, index) => (
                    <View key={index} style={styles.knowledgeItem}>
                      <TouchableOpacity
                        style={styles.knowledgeHeader}
                        onPress={() => toggleCourse(course.id)}
                      >
                        <Text style={styles.knowledgeTitle}>
                          {course.description} ：{course.title}
                        </Text>
                        <Ionicons
                          name={course.expanded ? "chevron-down" : "chevron-forward"}
                          size={rpx(15.625)}
                          color="#666"
                        />
                      </TouchableOpacity>

                      {/* 展开的知识点详情 */}
                      {course.expanded && (
                        <View style={styles.knowledgeDetails}>
                          {course.knowledgePoints.map((point, pointIndex) => (
                            <TouchableOpacity
                              key={pointIndex}
                              style={[
                                point.is_latest
                                  ? styles.knowledgePointLatest
                                  : styles.knowledgePoint,
                              ]}
                              onPress={() => playVideo(point)}
                            >
                              {point.is_latest && (
                                <View style={styles.pointLatest}>
                                  <Text style={styles.pointLatestText}>上次学到</Text>
                                </View>
                              )}
                              <View style={styles.pointInfo}>
                                <Text
                                  style={[
                                    styles.pointTitle,
                                    point.is_latest && styles.pointTitleLatest,
                                  ]}
                                >
                                  {point.title}
                                </Text>
                              </View>
                              <View style={styles.pointActions}>
                                <TouchableOpacity
                                  style={styles.actionBtn}
                                  onPress={() => playVideo(point)}
                                >
                                  <Ionicons name="play" size={rpx(8)} color="#FAFAFA" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={styles.actionBtn}
                                  onPress={() => startPractice(point)}
                                >
                                  <Text style={styles.actionBtnIcon}>✎</Text>
                                </TouchableOpacity>
                              </View>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                  ))}

                  {isLoadingMore && (
                    <View style={styles.loadingMore}>
                      <ActivityIndicator size="small" color="#4891FF" />
                      <Text style={styles.loadingMoreText}>加载中...</Text>
                    </View>
                  )}

                  {!hasMore && currentCourses.length > 0 && (
                    <View style={styles.noMore}>
                      <Text style={styles.noMoreText}>没有更多数据了</Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>当前搜索无结果</Text>
              </View>
            )}
          </>
        )}
      </View>

      {/* 年级选择弹窗 */}
      <GradeSelector
        visible={showGradeSelector}
        onClose={() => setShowGradeSelector(false)}
        currentSelection={gradeSelection}
        onConfirm={handleGradeConfirm}
      />
    </LinearGradient>
  )
}

const styles = createStyles({
  pageContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  subjectTabs: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 23.4375, // 23.4375rpx
  },
  subjectTabsLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  subjectTab: {
    marginRight: 12, // 12rpx
    position: "relative",
  },
  subjectTabText: {
    fontSize: 12.5, // 12.5rpx
    fontWeight: "bold",
    color: "#8C8D92",
  },
  subjectTabTextActive: {
    fontSize: 14.0625, // 14.0625rpx
    color: "#1571FC",
  },
  subjectTabIndicator: {
    width: 25, // 25rpx
    height: 8,
    position: "absolute",
    bottom: -10, // -10rpx
    left: "50%",
    marginLeft: -12.5,
  },
  selectorsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  versionSelector: {
    marginRight: 0,
  },
  gradeSelector: {
    marginRight: 0,
  },
  gradeButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
  },
  gradeButtonText: {
    fontSize: 7.6,
    color: "#8C8D92",
  },
  selectorText: {
    fontSize: 7.6,
    color: "#6A94FF",
  },
  selectorIcon: {
    fontSize: 16,
    color: "#6A94FF",
  },
  mainContent: {
    flex: 1,
    flexDirection: "row",
    gap: 12, // 12rpx
    paddingHorizontal: 23.4375, // 23.4375rpx
    marginTop: 12, // 12rpx
    overflow: "hidden",
  },
  coursesSection: {
    width: 91.4, // 91.4rpx
    flexShrink: 0,
  },
  courseBook: {
    position: "relative",
  },
  bookCover: {
    width: 88.28125, // 88.28125rpx
    height: 120,
    borderRadius: 4, // 4rpx
    backgroundColor: "#f0f0f0",
    marginBottom: 8, // 8rpx
  },
  bookInfo: {
    maxWidth: 91.4, // 91.4rpx
    marginBottom: 8, // 8rpx
  },
  bookTitle: {
    fontSize: 13.28125, // 13.28125rpx
    color: "#243F7E",
    fontWeight: "bold",
    marginBottom: 8, // 8rpx
  },
  bookDetail: {
    fontSize: 10.156, // 10.156rpx
    color: "#8E8E8E",
    lineHeight: 13.2,
  },
  knowledgeSection: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: "#ffffff4d",
    borderRadius: 8.6, // 8.6rpx
    paddingHorizontal: 10.9375, // 10.9375rpx
    paddingVertical: 4.68, // 4.68rpx
  },
  knowledgeScroll: {
    flex: 1,
  },
  knowledgeItem: {
    marginBottom: 4, // 4rpx
  },
  knowledgeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10.9375, // 10.9375rpx
  },
  knowledgeTitle: {
    fontSize: 13.28, // 13.28rpx
    color: "#6F6F6F",
    fontWeight: "bold",
    flex: 1,
  },
  knowledgeDetails: {
    backgroundColor: "#ffffff66",
    borderRadius: 7.8125, // 7.8125rpx
  },
  knowledgePoint: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15.625, // 15.625rpx
    paddingHorizontal: 20.3125, // 20.3125rpx
  },
  knowledgePointLatest: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15.625, // 15.625rpx
    paddingHorizontal: 20.3125, // 20.3125rpx
    backgroundColor: "#c9e2ff",
    borderTopLeftRadius: 7.8125, // 7.8125rpx
    borderTopRightRadius: 7.8125, // 7.8125rpx
    position: "relative",
  },
  pointLatest: {
    position: "absolute",
    left: 0,
    top: 0,
    backgroundColor: "#5BAAFF",
    width: 50, // 50rpx
    height: 17.53125, // 17.53125rpx
    borderTopLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  pointLatestText: {
    fontSize: 9.375, // 9.375rpx
    color: "#fff",
  },
  pointInfo: {
    flex: 1,
  },
  pointTitle: {
    fontSize: 12.5, // 12.5rpx
    color: "#777777",
  },
  pointTitleLatest: {
    color: "#4E80F7",
  },
  pointActions: {
    flexDirection: "row",
    gap: 8, // 8rpx
  },
  actionBtn: {
    width: 15.625, // 15.625rpx
    height: 15.625, // 15.625rpx
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0000002e",
    borderRadius: 7.8125,
  },
  actionBtnIcon: {
    fontSize: 8,
    color: "#FAFAFA",
  },
  loadingMore: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20, // 20rpx
    gap: 10, // 10rpx
  },
  loadingMoreText: {
    fontSize: 8.6, // 8.6rpx
    color: "#666",
  },
  noMore: {
    alignItems: "center",
    paddingVertical: 10, // 10rpx
  },
  noMoreText: {
    fontSize: 8.6, // 8.6rpx
    color: "#999",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 13.28125, // 13.28125rpx
    color: "#999",
  },
  searchContent: {
   backgroundColor: 'rgba(255, 255, 255, 0.5)',
   padding: 4,
   borderRadius: '50%'             

  }
})
