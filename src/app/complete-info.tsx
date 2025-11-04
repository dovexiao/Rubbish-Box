import React, { useState, useEffect, useCallback } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter, useLocalSearchParams } from "expo-router"
import { StatusBar } from "../components/StatusBar"
import { NavBar } from "../components/NavBar"
import CascadeSelector from "../components/CascadeSelector"
import { createStyles, rpx } from "../utils/rpxStyleSheet"
import { Images } from "../constants/Assets"
import { useUserStore } from "../stores/userStore"
import api from "../services/api"
import { showSuccess, showError, showWarning } from "../utils/toast"

interface RegionItem {
  value: string
  label: string
  text: string
}

interface UserInfo {
  username: string
  region: string
  gender: string
  school: string
  grade: string
  height: string
  educational_system: string
  grade_stage: string
  province: string
  city: string
  district: string
}

/**
 * 新用户完善信息页面
 * 100%还原UniApp项目 /src/pages/complete-info/index.vue
 */
export default function CompleteInfoScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const userStore = useUserStore()
  const isEditMode = params.type === 'edit' // 是否为编辑模式
  
  const [userInfo, setUserInfo] = useState<UserInfo>({
    username: "",
    region: "",
    gender: "",
    school: "",
    grade: "",
    height: "",
    educational_system: "",
    grade_stage: "",
    province: "",
    city: "",
    district: "",
  })

  const [selectedRegionValues, setSelectedRegionValues] = useState<string[]>([])
  const [selectedGradeValues, setSelectedGradeValues] = useState<string[]>([])
  const [regionOptions, setRegionOptions] = useState<any[]>([])
  const [gradeOptions, setGradeOptions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isDataLoaded, setIsDataLoaded] = useState(false) // 防止重复加载

  // 性别选项
  const genderOptions = [
    { value: "0", label: "男" },
    { value: "1", label: "女" },
  ]

  // 学制选项
  const educationSystems = [
    { value: "5.4", label: "五四学制" },
    { value: "6.3", label: "六三学制" },
  ]

  // 年级类别
  const gradeCategories = [
    { value: "primary", label: "小学" },
    { value: "middle", label: "初中" },
  ]

  // 五四学制年级
  const primaryGrades54 = [
    { value: "1", label: "一年级", text: "一年级" },
    { value: "2", label: "二年级", text: "二年级" },
    { value: "3", label: "三年级", text: "三年级" },
    { value: "4", label: "四年级", text: "四年级" },
    { value: "5", label: "五年级", text: "五年级" },
  ]

  const middleGrades54 = [
    { value: "1", label: "初一", text: "初一" },
    { value: "2", label: "初二", text: "初二" },
    { value: "3", label: "初三", text: "初三" },
    { value: "4", label: "初四", text: "初四" },
  ]

  // 六三学制年级
  const primaryGrades63 = [
    { value: "1", label: "一年级", text: "一年级" },
    { value: "2", label: "二年级", text: "二年级" },
    { value: "3", label: "三年级", text: "三年级" },
    { value: "4", label: "四年级", text: "四年级" },
    { value: "5", label: "五年级", text: "五年级" },
    { value: "6", label: "六年级", text: "六年级" },
  ]

  const middleGrades63 = [
    { value: "1", label: "初一", text: "初一" },
    { value: "2", label: "初二", text: "初二" },
    { value: "3", label: "初三", text: "初三" },
  ]

  // 初始化地区数据 - 移除 useCallback 避免依赖问题
  const initRegionData = async () => {
    try {
      const response = await api.post("/AppStart/AddressView/get_provinces/")
      console.log('API返回的省份数据:', response)
      const provinces = (response || []).map((item: any) => ({
        value: item.value,
        label: item.text,
        children: [], // 懒加载子级数据
      }))
      setRegionOptions(provinces)
      console.log('设置后的regionOptions:', provinces)
    } catch (error) {
      console.error("获取省份数据失败:", error)
      showError("获取省份数据失败")
    }
  }

  // 初始化年级数据 - 移除 useCallback 避免依赖问题
  const initGradeData = () => {
    const gradeData = [
      {
        value: "5.4",
        label: "五四学制",
        children: [
          {
            value: "primary",
            label: "小学",
            children: primaryGrades54,
          },
          {
            value: "middle",
            label: "初中",
            children: middleGrades54,
          },
        ],
      },
      {
        value: "6.3",
        label: "六三学制",
        children: [
          {
            value: "primary",
            label: "小学",
            children: primaryGrades63,
          },
          {
            value: "middle",
            label: "初中",
            children: middleGrades63,
          },
        ],
      },
    ]
    setGradeOptions(gradeData)
  }

  // 懒加载地区子级数据
  const loadRegionChildren = useCallback(async (parentValue: string, level: number) => {
    try {
      if (level === 0) {
        // 加载城市数据
        const cityRes: any = await api.post("/AppStart/AddressView/get_cities/", {
          province_code: parentValue,
        })
        return (cityRes || []).map((item: any) => ({
          value: item.value,
          label: item.text,
          children: [], // 懒加载区县数据
        }))
      } else if (level === 1) {
        // 加载区县数据
        const districtRes: any = await api.post("/AppStart/AddressView/get_counties/", {
          city_code: parentValue,
        })
        return (districtRes || []).map((item: any) => ({
          value: item.value,
          label: item.text,
        }))
      }
      return []
    } catch (error) {
      console.error("加载地区子级数据失败:", error)
      return []
    }
  }, [])

  // 处理地区选择
  const handleRegionSelect = useCallback(async (values: string[], labels: string[]) => {
    setSelectedRegionValues(values)
    
    // 更新用户信息
    if (values.length === 3) {
      setUserInfo(prev => ({
        ...prev,
        province: labels[0] || "",
        city: labels[1] || "",
        district: labels[2] || "",
        region: labels.join(" - "),
      }))
    }
  }, [])

  // 处理年级选择
  const handleGradeSelect = useCallback((values: string[], labels: string[]) => {
    setSelectedGradeValues(values)
  }, [])

  // 加载编辑模式的用户数据
  const loadUserDataForEdit = async () => {
    try {
      const currentUserInfo = await userStore.getUserInfo()
      console.log('编辑模式：加载用户信息', currentUserInfo)
      
      // 设置基本信息
      // 性别处理：布尔值或数字转为字符串 (false/0 -> "0", true/1 -> "1")
      const genderValue = currentUserInfo.gender !== undefined && currentUserInfo.gender !== null
        ? (currentUserInfo.gender ? "1" : "0")
        : ""
      
      setUserInfo({
        username: currentUserInfo.username || "",
        region: "",
        gender: genderValue,
        school: currentUserInfo.school || "",
        grade: currentUserInfo.grade || "",
        height: currentUserInfo.height?.toString() || "",
        educational_system: currentUserInfo.educational_system || "",
        grade_stage: currentUserInfo.grade_stage || "",
        province: currentUserInfo.province || "",
        city: currentUserInfo.city || "",
        district: currentUserInfo.district || "",
      })
      
      console.log('性别回显值:', { 
        原始值: currentUserInfo.gender, 
        转换后: genderValue 
      })

      // 设置年级回显
      const systemValue = currentUserInfo.educational_system === "六三" ? "6.3" : "5.4"
      const stageValue = currentUserInfo.grade_stage === "小学" ? "primary" : "middle"
      
      // 年级映射
      const gradeMapping: { [key: string]: string } = {
        "一年级": "1",
        "二年级": "2",
        "三年级": "3",
        "四年级": "4",
        "五年级": "5",
        "六年级": "6",
        "初一": "1",
        "初二": "2",
        "初三": "3",
        "初四": "4",
      }
      const gradeValue = (currentUserInfo.grade && gradeMapping[currentUserInfo.grade]) || "1"
      
      setSelectedGradeValues([systemValue, stageValue, gradeValue])
      console.log('年级回显:', [systemValue, stageValue, gradeValue])

      // 设置地区回显
      if (currentUserInfo.province && currentUserInfo.city && currentUserInfo.district) {
        setSelectedRegionValues([
          currentUserInfo.province,
          currentUserInfo.city,
          currentUserInfo.district,
        ])
        console.log('地区回显:', [
          currentUserInfo.province,
          currentUserInfo.city,
          currentUserInfo.district,
        ])

        // 预加载城市和区县数据
        await loadRegionDataForEdit(
          currentUserInfo.province,
          currentUserInfo.city,
          currentUserInfo.district
        )
      }
    } catch (error) {
      console.error('加载用户信息失败:', error)
      showError('加载用户信息失败')
    }
  }

  // 预加载地区数据用于编辑模式回显
  const loadRegionDataForEdit = async (
    provinceCode: string,
    cityCode: string,
    districtCode: string
  ) => {
    try {
      // 加载城市数据
      const cityRes: any = await api.post("/AppStart/AddressView/get_cities/", {
        province_code: provinceCode,
      })
      const cities = (cityRes || []).map((item: any) => ({
        value: item.value,
        label: item.text,
        children: [],
      }))

      // 加载区县数据
      const districtRes: any = await api.post("/AppStart/AddressView/get_counties/", {
        city_code: cityCode,
      })
      const districts = (districtRes || []).map((item: any) => ({
        value: item.value,
        label: item.text,
      }))

      console.log('预加载地区数据完成:', { cities: cities.length, districts: districts.length })
    } catch (error) {
      console.error('预加载地区数据失败:', error)
    }
  }

  // 完善/更新信息
  const completeInfo = async () => {
    // 验证必填字段
    if (!userInfo.username || !userInfo.school || !userInfo.height || !userInfo.gender) {
      showWarning("请完善所有信息")
      return
    }

    if (selectedRegionValues.length < 3) {
      showWarning("请选择完整的地区信息")
      return
    }

    if (selectedGradeValues.length < 3) {
      showWarning("请选择完整的年级信息")
      return
    }

    try {
      setLoading(true)

      // 解析年级信息
      const [systemValue, stageValue, gradeValue] = selectedGradeValues
      const systemLabel = educationSystems.find(s => s.value === systemValue)?.label
      const stageLabel = gradeCategories.find(c => c.value === stageValue)?.label
      
      let gradeLabel = ""
      if (systemValue === "5.4") {
        if (stageValue === "primary") {
          gradeLabel = primaryGrades54.find(g => g.value === gradeValue)?.label || ""
        } else if (stageValue === "middle") {
          gradeLabel = middleGrades54.find(g => g.value === gradeValue)?.label || ""
        }
      } else if (systemValue === "6.3") {
        if (stageValue === "primary") {
          gradeLabel = primaryGrades63.find(g => g.value === gradeValue)?.label || ""
        } else if (stageValue === "middle") {
          gradeLabel = middleGrades63.find(g => g.value === gradeValue)?.label || ""
        }
      }

      // 提交数据 - 与UniApp完全一致
      await api.post("/AppStart/users/user_from/", {
        username: userInfo.username,
        grade: gradeLabel,
        GradeStage: stageLabel,
        EducationalSystem: systemLabel === "五四学制" ? "五四" : "六三",
        areaeconomize: selectedRegionValues[0],
        areamarket: selectedRegionValues[1],
        areadistinguish: selectedRegionValues[2],
        gender: userInfo.gender,
        school: userInfo.school,
        height: userInfo.height,
      })

      // 刷新用户信息
      await userStore.getUserInfo()

      showSuccess(isEditMode ? "信息更新成功" : "信息完善成功")
      setTimeout(() => {
        if (isEditMode) {
          router.back()
        } else {
          router.replace("/(tabs)")
        }
      }, 1000)
    } catch (error: any) {
      console.error("完善信息失败:", error)
      showError(error.message || "操作失败")
    } finally {
      setLoading(false)
    }
  }

  // 初始化 - 避免无限依赖循环
  useEffect(() => {
    // 使用 isDataLoaded 标记防止重复加载
    if (isDataLoaded) return

    const init = async () => {
      try {
        console.log('开始初始化，编辑模式:', isEditMode)
        
        // 1. 加载基础数据（省份、年级选项）
        await initRegionData()
        initGradeData()
        
        // 2. 如果是编辑模式，加载用户数据并回显
        if (isEditMode) {
          await loadUserDataForEdit()
        }
        
        setIsDataLoaded(true) // 标记数据已加载
        setIsInitialized(true)
        console.log('初始化完成')
      } catch (error) {
        console.error('初始化失败:', error)
        showError('初始化失败，请重试')
      }
    }
    
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // 空依赖数组，只在组件挂载时执行一次

  if (!isInitialized) {
    return (
      <LinearGradient
        colors={["#93ABFF", "#E4F4FF", "#CDEDFF", "#FFFFFF"]}
        locations={[-0.1128, 0.1494, 0.8474, 1.0586]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <StatusBar theme="dark" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1890ff" />
          <Text style={styles.loadingText}>正在加载...</Text>
        </View>
      </LinearGradient>
    )
  }

  return (
    <LinearGradient
      colors={["#93ABFF", "#E4F4FF", "#CDEDFF", "#FFFFFF"]}
      locations={[-0.1128, 0.1494, 0.8474, 1.0586]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar theme="dark" />
      <NavBar title={isEditMode ? "编辑信息" : "完善信息"} leftArrow />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.formWrapper}>
          {/* 第一行：昵称和性别 */}
          <View style={styles.inputRow}>
            {/* 昵称 */}
            <View style={styles.inputItemWrapper}>
              <Text style={styles.label}>昵称</Text>
              <TextInput
                style={styles.inputField}
                placeholder="给自己想个名字吧"
                value={userInfo.username}
                onChangeText={(text) => setUserInfo(prev => ({ ...prev, username: text }))}
                placeholderTextColor="#cecece"
              />
            </View>

            {/* 性别 */}
            <View style={styles.inputItemWrapper}>
              <Text style={styles.label}>性别</Text>
              <View style={styles.pickerContainer}>
                {genderOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.pickerOption,
                      userInfo.gender === option.value && styles.pickerOptionSelected,
                    ]}
                    onPress={() => setUserInfo(prev => ({ ...prev, gender: option.value }))}
                  >
                    <Text
                      style={[
                        styles.pickerOptionText,
                        userInfo.gender === option.value && styles.pickerOptionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* 第二行：学校和身高 */}
          <View style={styles.inputRow}>
            {/* 学校 */}
            <View style={styles.inputItemWrapper}>
              <Text style={styles.label}>学校</Text>
              <TextInput
                style={styles.inputField}
                placeholder="请输入你的学校"
                value={userInfo.school}
                onChangeText={(text) => setUserInfo(prev => ({ ...prev, school: text }))}
                placeholderTextColor="#cecece"
              />
            </View>

            {/* 身高 */}
            <View style={styles.inputItemWrapper}>
              <Text style={styles.label}>身高</Text>
              <TextInput
                style={styles.inputField}
                placeholder="输入你的身高"
                value={userInfo.height}
                onChangeText={(text) => setUserInfo(prev => ({ ...prev, height: text }))}
                keyboardType="numeric"
                placeholderTextColor="#cecece"
              />
            </View>
          </View>

          {/* 第三行：地区和年级 */}
          <View style={styles.inputRow}>
            {/* 地区选择 */}
            <View style={styles.inputItemWrapper}>
              <Text style={styles.label}>地区</Text>
              <CascadeSelector
                options={regionOptions}
                selectedValues={selectedRegionValues}
                onSelect={handleRegionSelect}
                onLoadChildren={loadRegionChildren}
                placeholder="选择你所在地区"
                title="选择地区"
                style={styles.cascadeSelector}
              />
            </View>

            {/* 年级选择 */}
            <View style={styles.inputItemWrapper}>
              <Text style={styles.label}>年级</Text>
              <CascadeSelector
                options={gradeOptions}
                selectedValues={selectedGradeValues}
                onSelect={handleGradeSelect}
                placeholder="选择你的年级"
                title="选择年级"
                style={styles.cascadeSelector}
              />
            </View>
          </View>

         
        </View>
 {/* 插图 */}
          <View style={styles.illustrationWrapper}>
            <Image source={Images.boyReading} style={styles.illustrationImage} resizeMode="contain" />
          </View>
        {/* 开始学习按钮 */}
        <TouchableOpacity
          style={[styles.startButton, loading && styles.startButtonDisabled]}
          onPress={completeInfo}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.startButtonText}>{isEditMode ? "保存" : "开始学习"}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  )
}

const styles = createStyles({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20, // 20rpx
    paddingBottom: 100, // 为按钮留出空间
  },
  formWrapper: {
    paddingLeft: 20, // 20rpx - 与UniApp一致
  },
  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16.625, // 16.625rpx - 与UniApp一致
    gap: 10, // 两个输入框之间的间距
  },
  inputItemWrapper: {
    flex: 1, // 自动适应宽度
    backgroundColor: "rgba(255, 255, 255, 0.71)", // 与UniApp一致
    height: 68.578125, // 68.578125rpx - 与UniApp一致
    borderRadius: 7.8125, // 7.8125rpx - 与UniApp一致
    flexDirection: "column",
    justifyContent: "space-between",
    padding: 5.8125, // 5.8125rpx - 与UniApp一致
  },
  label: {
    fontSize: 13.28125, // 13.28125rpx - 与UniApp一致
    color: "#797979", // 与UniApp一致
  },
  inputField: {
    backgroundColor: "transparent",
    borderWidth: 0,
    fontSize: 14.0625, // 14.0625rpx - 与UniApp一致
    color: "#333", // 与UniApp一致
    padding: 0,
  },
  pickerContainer: {
    flexDirection: "row",
    gap: 10,
  },
  pickerOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
  },
  pickerOptionSelected: {
    backgroundColor: "#1571fc",
  },
  pickerOptionText: {
    fontSize: 14,
    color: "#333",
  },
  pickerOptionTextSelected: {
    color: "#fff",
  },
  cascadeSelector: {
    backgroundColor: "transparent",
      borderWidth: 0,
    width: "100%",
    padding: 0,
    fontSize: 14.0625, // 14.0625rpx - 与UniApp一致
    color: "#333", // 与UniApp一致
  },
  illustrationWrapper: {
    position: "absolute",
    bottom: 7.8125, // 7.8125rpx - 与UniApp一致
    right: 11.71875, // 11.71875rpx - 与UniApp一致
    width: 181.25, // 181.25rpx - 与UniApp一致
    height: 210.9375, // 210.9375rpx - 与UniApp一致
    zIndex: 0,
  },
  illustrationImage: {
    width: "100%",
    height: "100%",
  },
  startButton: {
    backgroundColor: "#1571fc", // 与UniApp一致
    borderRadius: 11.71875, // 11.71875rpx - 与UniApp一致
    width: 271.875, // 271.875rpx - 与UniApp一致
    height: 37.5, // 37.5rpx - 与UniApp一致
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 45, // 45rpx - 与UniApp一致
    left: "50%",
    marginLeft: -135.9375, // 宽度的一半，实现居中
    zIndex: 3, // 与UniApp一致
  },
  startButtonDisabled: {
    backgroundColor: "#ccc",
  },
  startButtonText: {
    fontSize: 13.28125, // 13.28125rpx - 与UniApp一致
    fontWeight: "bold",
    color: "#fff",
  },
})
