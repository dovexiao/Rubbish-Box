import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert } from "react-native"
import { Modal, Portal } from "react-native-paper"
import { useState } from "react"
import { Ionicons } from "@expo/vector-icons"

import { createStyles, rpx } from "../../utils/rpxStyleSheet"
import { addAddress } from "../../services/pointsMall"

interface AddAddressPopupProps {
  visible: boolean
  onClose: () => void
  onSuccess: () => void
}

/**
 * 添加地址弹窗组件（简化版）
 * 基于UniApp项目 /src/pages/pointsMall/components/AddAddressPopup.vue
 * 注意：由于React Native没有直接等价的级联地区选择器，此处简化为文本输入
 */
export function AddAddressPopup({ visible, onClose, onSuccess }: AddAddressPopupProps) {
  const [formData, setFormData] = useState({
    receiver_name: "",
    phone: "",
    province: "",
    city: "",
    district: "",
    detail_address: "",
  })

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
  }

  const validateForm = (): boolean => {
    if (!formData.receiver_name.trim()) {
      Alert.alert("提示", "请输入收货人姓名")
      return false
    }

    if (!formData.phone.trim()) {
      Alert.alert("提示", "请输入手机号")
      return false
    }

    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(formData.phone)) {
      Alert.alert("提示", "请输入正确的手机号")
      return false
    }

    if (!formData.province.trim() || !formData.city.trim() || !formData.district.trim()) {
      Alert.alert("提示", "请输入完整的地区信息")
      return false
    }

    if (!formData.detail_address.trim()) {
      Alert.alert("提示", "请输入详细地址")
      return false
    }

    return true
  }

  const saveAddress = async () => {
    if (!validateForm()) {
      return
    }

    try {
      await addAddress(formData)
      Alert.alert("成功", "保存成功")
      onSuccess()
      handleClose()
    } catch (_error) {
      Alert.alert("失败", "保存失败，请重试")
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
            <Text style={styles.headerTitle}>添加收货地址</Text>
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

            {/* 省份 */}
            <View style={styles.formCard}>
              <View style={styles.formItem}>
                <Text style={styles.formLabel}>省份</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.province}
                  onChangeText={(text) => setFormData({ ...formData, province: text })}
                  placeholder="如：广东省"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {/* 城市 */}
            <View style={styles.formCard}>
              <View style={styles.formItem}>
                <Text style={styles.formLabel}>城市</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.city}
                  onChangeText={(text) => setFormData({ ...formData, city: text })}
                  placeholder="如：深圳市"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {/* 区县 */}
            <View style={styles.formCard}>
              <View style={styles.formItem}>
                <Text style={styles.formLabel}>区县</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.district}
                  onChangeText={(text) => setFormData({ ...formData, district: text })}
                  placeholder="如：南山区"
                  placeholderTextColor="#999"
                />
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
