import { View, Text, TextInput, ScrollView, TouchableOpacity } from "react-native"
import { Modal, Portal, Snackbar } from "react-native-paper"
import { useState, useEffect, useCallback } from "react"
import { Ionicons } from "@expo/vector-icons"

import { createStyles, rpx } from "../../utils/rpxStyleSheet"
import { updateAddress, type AddressItem } from "../../services/pointsMall"
import CascadeSelector from "../CascadeSelector"
import api from "../../services/api"

interface EditAddressPopupProps {
  visible: boolean
  addressData: AddressItem | null
  onClose: () => void
  onSuccess: () => void
}

/**
 * 编辑地址弹窗组件
 * 基于UniApp项目 /src/pages/pointsMall/components/EditAddressPopup.vue
 * 100%还原UniApp项目
 */
export function EditAddressPopup({
  visible,
  addressData,
  onClose,
  onSuccess,
}: EditAddressPopupProps) {
  const [formData, setFormData] = useState({
    id: 0,
    receiver_name: "",
    phone: "",
    province: "",
    city: "",
    district: "",
    detail_address: "",
  })

  const [selectedRegionValues, setSelectedRegionValues] = useState<string[]>([])
  const [regionOptions, setRegionOptions] = useState<any[]>([])

  const [snackbarVisible, setSnackbarVisible] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState("")
  const [snackbarType, setSnackbarType] = useState<"success" | "error" | "info">("info")

  const showSnackbar = (message: string, type: "success" | "error" | "info" = "info") => {
    setSnackbarMessage(message)
    setSnackbarType(type)
    setSnackbarVisible(true)
  }

  // 初始化地区数据
  const initRegionData = useCallback(async () => {
    try {
      const response = await api.post("/AppStart/AddressView/get_provinces/")
      const provinces = (response || []).map((item: any) => ({
        value: item.value,
        label: item.text,
        children: [], // 懒加载子级数据
      }))
      setRegionOptions(provinces)
    } catch (error) {
      console.error("获取省份数据失败:", error)
      showSnackbar("获取省份数据失败", "error")
    }
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
  const handleRegionSelect = useCallback((values: string[], labels: string[]) => {
    setSelectedRegionValues(values)
    
    // 更新表单数据（保存编码到 province/city/district）
    if (values.length === 3) {
      setFormData(prev => ({
        ...prev,
        province: values[0] || "", // 保存编码，而不是文本
        city: values[1] || "",
        district: values[2] || "",
      }))
    }
  }, [])

  // 为编辑模式加载完整的省市区数据（用于回显）
  const loadRegionDataForEdit = useCallback(async (provinceCode: string, cityCode: string, districtCode: string) => {
    try {
      console.log("开始加载回显数据，省市区编码:", { provinceCode, cityCode, districtCode })
      
      // 加载省份对应的城市列表
      const cities = await loadRegionChildren(provinceCode, 0)
      console.log("加载到城市数据:", cities.length, "个")
      
      if (cities.length === 0) {
        console.error("城市数据为空，省份编码:", provinceCode)
        return
      }
      
      // 加载城市对应的区县列表
      const districts = await loadRegionChildren(cityCode, 1)
      console.log("加载到区县数据:", districts.length, "个")
      
      if (districts.length === 0) {
        console.error("区县数据为空，城市编码:", cityCode)
        return
      }
      
      // 更新 regionOptions，确保选中的省市区都有对应的数据
      setRegionOptions((prevOptions) => {
        const newOptions = prevOptions.map((province) => {
          if (province.value === provinceCode) {
            return {
              ...province,
              children: cities.map((city: any) => {
                if (city.value === cityCode) {
                  return {
                    ...city,
                    children: districts,
                  }
                }
                return city
              }),
            }
          }
          return province
        })
        console.log("更新后的 regionOptions:", newOptions)
        return newOptions
      })
    } catch (error) {
      console.error("加载编辑地址的省市区数据失败:", error)
    }
  }, [loadRegionChildren])

  // 初始化地区数据
  useEffect(() => {
    if (visible) {
      initRegionData()
    }
  }, [visible, initRegionData])

  // 回显地址数据
  useEffect(() => {
    const initFormData = async () => {
      if (!addressData || !visible || regionOptions.length === 0) {
        return
      }

      console.log("开始初始化表单数据，地址数据:", addressData)
      
      // 尝试获取省市区编码（优先使用 _code 字段，如果不存在则使用默认字段）
      let provinceCode = addressData.province_code || addressData.province
      let cityCode = addressData.city_code || addressData.city
      let districtCode = addressData.district_code || addressData.district
      
      console.log("省市区编码/文本:", { provinceCode, cityCode, districtCode })
      
      // 如果 province 是文本而不是编码，需要通过文本查找编码
      if (provinceCode && !/^\d+$/.test(provinceCode)) {
        console.log("检测到省份是文本，需要查找编码:", provinceCode)
        const provinceItem = regionOptions.find(p => p.label === provinceCode || p.value === provinceCode)
        if (provinceItem) {
          console.log("找到省份编码:", provinceItem.value)
          provinceCode = provinceItem.value
        } else {
          console.error("未找到省份:", provinceCode)
        }
      }
      
      // 设置表单数据（保存编码）
      setFormData({
        id: addressData.id,
        receiver_name: addressData.receiver_name,
        phone: addressData.phone,
        province: provinceCode,
        city: cityCode,
        district: districtCode,
        detail_address: addressData.detail_address,
      })
      
      // 设置省市区回显
      if (provinceCode) {
        console.log("开始回显，省份编码:", provinceCode)
        
        try {
          // 加载城市数据
          const cities = await loadRegionChildren(provinceCode, 0)
          console.log("加载到城市数据:", cities.length, "个")
          
          if (cities.length > 0 && cityCode) {
            // 如果 city 是文本，查找编码
            let cityItem = cities.find(c => c.value === cityCode)
            if (!cityItem && !/^\d+$/.test(cityCode)) {
              console.log("检测到城市是文本，需要查找编码:", cityCode)
              cityItem = cities.find(c => c.label === cityCode)
              if (cityItem) {
                console.log("找到城市编码:", cityItem.value)
                cityCode = cityItem.value
              }
            }
            
            if (cityItem) {
              // 加载区县数据
              const districts = await loadRegionChildren(cityCode, 1)
              console.log("加载到区县数据:", districts.length, "个")
              
              if (districts.length > 0 && districtCode) {
                // 如果 district 是文本，查找编码
                let districtItem = districts.find(d => d.value === districtCode)
                if (!districtItem && !/^\d+$/.test(districtCode)) {
                  console.log("检测到区县是文本，需要查找编码:", districtCode)
                  districtItem = districts.find(d => d.label === districtCode)
                  if (districtItem) {
                    console.log("找到区县编码:", districtItem.value)
                    districtCode = districtItem.value
                  }
                }
                
                if (districtItem) {
                  // 更新表单数据为编码
                  setFormData(prev => ({
                    ...prev,
                    province: provinceCode,
                    city: cityCode,
                    district: districtCode,
                  }))
                  
                  // 更新 regionOptions
                  await loadRegionDataForEdit(provinceCode, cityCode, districtCode)
                  
                  // 设置选中值
                  setSelectedRegionValues([provinceCode, cityCode, districtCode])
                  console.log("回显完成，最终编码:", { provinceCode, cityCode, districtCode })
                }
              }
            }
          }
        } catch (error) {
          console.error("回显失败:", error)
        }
      }
    }

    initFormData()
  }, [addressData, visible, regionOptions.length, loadRegionDataForEdit, loadRegionChildren])

  const handleClose = () => {
    onClose()
  }

  const validateForm = (): boolean => {
    if (!formData.receiver_name.trim()) {
      showSnackbar("请输入收货人姓名", "info")
      return false
    }

    if (!formData.phone.trim()) {
      showSnackbar("请输入手机号", "info")
      return false
    }

    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(formData.phone)) {
      showSnackbar("请输入正确的手机号", "info")
      return false
    }

    if (!formData.province.trim() || !formData.city.trim() || !formData.district.trim()) {
      showSnackbar("请输入完整的地区信息", "info")
      return false
    }

    if (!formData.detail_address.trim()) {
      showSnackbar("请输入详细地址", "info")
      return false
    }

    return true
  }

  const saveAddress = async () => {
    if (!validateForm()) {
      return
    }

    try {
      await updateAddress(formData)
      showSnackbar("保存成功", "success")
      setTimeout(() => {
        onSuccess()
        handleClose()
      }, 1000)
    } catch (_error) {
      showSnackbar("保存失败，请重试", "error")
    }
  }

  return (
    <Portal>
      <Modal visible={visible} onDismiss={handleClose} contentContainerStyle={styles.modal}>
        <View style={styles.popup}>
          {/* 头部 */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.backButton}>
              <Ionicons name="arrow-back" size={rpx(11.71875)} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>编辑收货地址</Text>
          </View>

          {/* 内容区域 */}
          <ScrollView style={styles.content}>
            {/* 收货人 */}
            <View style={styles.formCard}>
              <View style={styles.formItem}>
                <Text style={styles.formLabel}>收货人</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.receiver_name}
                  onChangeText={(text) => setFormData({ ...formData, receiver_name: text })}
                  placeholder="收货人姓名"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {/* 手机号 */}
            <View style={styles.formCard}>
              <View style={styles.formItem}>
                <Text style={styles.formLabel}>手机号</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                  placeholder="收货人手机号"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                  maxLength={11}
                />
              </View>
            </View>

            {/* 地区选择 */}
            <View style={styles.formCard}>
              <View style={[styles.formItem, styles.regionSelectorItem]}>
                <Text style={styles.formLabel}>地区</Text>
                <View style={styles.regionSelectorWrapper}>
                  <CascadeSelector
                    options={regionOptions}
                    selectedValues={selectedRegionValues}
                    onSelect={handleRegionSelect}
                    onLoadChildren={loadRegionChildren}
                    placeholder="选择省/市/区"
                    title="选择地区"
                    style={styles.cascadeSelector}
                  />
                </View>
              </View>
            </View>

            {/* 详细地址 */}
            <View style={styles.formCard}>
              <View style={[styles.formItem, styles.detailAddressItem]}>
                <Text style={styles.formLabel}>详细地址</Text>
                <TextInput
                  style={styles.formTextarea}
                  value={formData.detail_address}
                  onChangeText={(text) => setFormData({ ...formData, detail_address: text })}
                  placeholder="如街道、门牌号、小区、乡镇、村等"
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={3}
                  maxLength={100}
                />
              </View>
            </View>
          </ScrollView>

          {/* 底部按钮 */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.saveButton} onPress={saveAddress} activeOpacity={0.8}>
              <Text style={styles.saveButtonText}>保存</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: "关闭",
          onPress: () => setSnackbarVisible(false),
        }}
        style={{
          backgroundColor:
            snackbarType === "success" ? "#52C41A" : snackbarType === "error" ? "#FF4D4F" : "#4891FF",
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </Portal>
  )
}

const styles = createStyles({
  modal: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  popup: {
    backgroundColor: "#eee",
    borderRadius: 9.765625,
    width: 464.84375,
    height: 362.890625,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 31.8125,
    position: "relative",
    backgroundColor: "#fff",
  },
  backButton: {
    position: "absolute",
    left: 10,
    padding: 5,
  },
  headerTitle: {
    fontSize: 11.71875,
    fontWeight: "600",
    color: "#333",
  },
  content: {
    flex: 1,
  },
  formCard: {
    backgroundColor: "#fff",
    marginTop: 3.125,
  },
  formItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 17.1875,
    paddingVertical: 17.1875,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  detailAddressItem: {
    alignItems: "flex-start",
  },
  regionSelectorItem: {
    alignItems: "center",
  },
  formLabel: {
    flexShrink: 0,
    width: 70,
    fontSize: 11.71875,
    color: "#333",
    lineHeight: 20,
  },
  formInput: {
    flex: 1,
    fontSize: 11.71875,
    color: "#333",
    paddingLeft: 10,
    height: 30,
  },
  regionSelectorWrapper: {
    flex: 1,
    paddingLeft: 10,
  },
  cascadeSelector: {
    backgroundColor: "transparent",
    borderWidth: 0,
    width: "100%",
    padding: 0,
    fontSize: 11.71875,
    color: "#333",
  },
  formTextarea: {
    flex: 1,
    minHeight: 60,
    fontSize: 11.71875,
    color: "#333",
    paddingLeft: 10,
    paddingTop: 4,
    lineHeight: 20,
    textAlignVertical: "top",
  },
  footer: {
    backgroundColor: "#fff",
  },
  saveButton: {
    backgroundColor: "#5C9DFF",
    height: 46.875,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 14.0625,
    fontWeight: "bold",
    color: "#fff",
  },
})
