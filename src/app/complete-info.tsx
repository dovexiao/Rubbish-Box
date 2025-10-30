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
import { useRouter } from "expo-router"
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
  const userStore = useUserStore()
  
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

  // 初始化地区数据
  const initRegionData = useCallback(async () => {
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
  }, [])

  // 初始化年级数据
  const initGradeData = useCallback(() => {
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
  }, [])

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

  // 完善信息
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
      const res = await api.post("/AppStart/users/user_from/", {
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

      showSuccess("信息完善成功")
      setTimeout(() => {
        router.replace("/(tabs)")
      }, 1000)
    } catch (error: any) {
      console.error("完善信息失败:", error)
      showError(error.message || "完善信息失败")
    } finally {
      setLoading(false)
    }
  }

  // 初始化
  useEffect(() => {
    const init = async () => {
      await initRegionData()
      initGradeData()
      setIsInitialized(true)
    }
    init()
  }, [initRegionData, initGradeData])

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
      <NavBar title="完善信息" leftArrow />

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
            <Text style={styles.startButtonText}>开始学习</Text>
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
