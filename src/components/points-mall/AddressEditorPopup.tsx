import { View, Text, TextInput, ScrollView, TouchableOpacity } from "react-native"
import { Modal, Portal, Snackbar } from "react-native-paper"
import { useState, useCallback, useEffect } from "react"
import { Ionicons } from "@expo/vector-icons"

import { createStyles, rpx } from "../../utils/rpxStyleSheet"
import { addAddress, updateAddress, type AddressItem } from "../../services/pointsMall"
import CascadeSelector from "../CascadeSelector"
import api from "../../services/api"

interface AddressEditorPopupProps {
  visible: boolean
  onClose: () => void
  onSuccess: () => void
  address?: AddressItem | null
}

/**
 * 收货地址新增/编辑弹窗
 */
export function AddressEditorPopup({ visible, onClose, onSuccess, address }: AddressEditorPopupProps) {
  const [formData, setFormData] = useState({
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

  const initRegionData = useCallback(async () => {
    try {
      const response = await api.post("/AppStart/AddressView/get_provinces/")
      const provinces = (response || []).map((item: any) => ({
        value: item.value,
        label: item.text,
        children: [],
      }))
      setRegionOptions(provinces)
    } catch (error) {
      console.error("获取省份数据失败:", error)
      showSnackbar("获取省份数据失败", "error")
    }
  }, [])

  const loadRegionChildren = useCallback(async (parentValue: string, level: number) => {
    try {
      if (level === 0) {
        const cityRes: any = await api.post("/AppStart/AddressView/get_cities/", { province_code: parentValue })
        return (cityRes || []).map((item: any) => ({
          value: item.value,
          label: item.text,
          children: [],
        }))
      }
      if (level === 1) {
        const districtRes: any = await api.post("/AppStart/AddressView/get_counties/", { city_code: parentValue })
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

  const handleRegionSelect = useCallback((values: string[]) => {
    setSelectedRegionValues(values)
    if (values.length === 3) {
      setFormData(prev => ({
        ...prev,
        province: values[0] || "",
        city: values[1] || "",
        district: values[2] || "",
      }))
    }
  }, [])

  useEffect(() => {
    if (visible) {
      initRegionData()
      if (address) {
        setFormData({
          receiver_name: address.receiver_name || "",
          phone: address.phone || "",
          province: address.province || address.province_text || "",
          city: address.city || address.city_text || "",
          district: address.district || address.district_text || "",
          detail_address: address.detail_address || "",
        })
        const regionCodes = [address.province, address.city, address.district].filter(Boolean) as string[]
        setSelectedRegionValues(regionCodes)
      } else {
        resetForm()
      }
    }
  }, [visible, initRegionData, address])

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const resetForm = () => {
    setFormData({
      receiver_name: "",
      phone: "",
      province: "",
      city: "",
      district: "",
      detail_address: "",
    })
    setSelectedRegionValues([])
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
    if (!validateForm()) return
    try {
      if (address?.id) {
        await updateAddress({ address_id: address.id, ...formData } as any)
      } else {
        await addAddress(formData)
      }
      showSnackbar("保存成功", "success")
      setTimeout(() => {
        onSuccess()
        handleClose()
      }, 500)
    } catch (_error) {
      showSnackbar("保存失败，请重试", "error")
    }
  }

  return (
    <Portal>
      <Modal visible={visible} onDismiss={handleClose} contentContainerStyle={styles.modal}>
        <View style={styles.popup}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.backButton}>
              <Ionicons name="arrow-back" size={rpx(11.71875)} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{address ? "编辑收货地址" : "添加收货地址"}</Text>
          </View>

          <ScrollView style={styles.content}>
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

            <View style={styles.formCard}>
              <View style={[styles.formItem, styles.regionSelectorItem]}>
                <Text style={styles.formLabel}>地区</Text>
                <View style={styles.regionSelectorWrapper}>
                  <CascadeSelector
                    options={regionOptions}
                    selectedValues={selectedRegionValues}
                    onSelect={handleRegionSelect}
                    onLoadChildren={loadRegionChildren}
                    placeholder="点击选择"
                    title="选择地区"
                    style={styles.cascadeSelector}
                  />
                </View>
              </View>
            </View>

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
    alignItems: "center" as const,
    justifyContent: "center" as const,
    padding: 20,
  },
  popup: {
    backgroundColor: "#eee",
    borderRadius: 9.765625,
    width: 464.84375,
    height: 362.890625,
    overflow: "hidden" as const,
  },
  header: {
    flexDirection: "row" as const,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    height: 31.8125,
    position: "relative" as const,
    backgroundColor: "#fff" as const,
  },
  backButton: {
    position: "absolute" as const,
    left: 10,
    padding: 5,
  },
  headerTitle: {
    fontSize: 11.71875,
    fontWeight: "600" as const,
    color: "#333" as const,
  },
  content: {
    flex: 1,
  },
  formCard: {
    backgroundColor: "#fff" as const,
    marginTop: 3.125,
  },
  formItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 17.1875,
    paddingVertical: 17.1875,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0" as const,
  },
  detailAddressItem: {
    alignItems: "flex-start" as const,
  },
  regionSelectorItem: {
    alignItems: "center" as const,
  },
  formLabel: {
    flexShrink: 0,
    width: 70,
    fontSize: 11.71875,
    color: "#333" as const,
    lineHeight: 20,
  },
  formInput: {
    flex: 1,
    fontSize: 11.71875,
    color: "#333" as const,
    paddingLeft: 10,
    height: 30,
  },
  regionSelectorWrapper: {
    flex: 1,
    paddingLeft: 10,
  },
  cascadeSelector: {
    backgroundColor: "transparent" as const,
    borderWidth: 0,
    width: "100%",
    padding: 0,
    fontSize: 11.71875,
    color: "#333" as const,
  },
  formTextarea: {
    flex: 1,
    minHeight: 60,
    fontSize: 11.71875,
    color: "#333" as const,
    paddingLeft: 10,
    paddingTop: 4,
    lineHeight: 20,
    textAlignVertical: "top" as const,
  },
  footer: {
    backgroundColor: "#fff" as const,
  },
  saveButton: {
    backgroundColor: "#5C9DFF" as const,
    height: 46.875,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  saveButtonText: {
    fontSize: 14.0625,
    fontWeight: "bold" as const,
    color: "#fff" as const,
  },
})


