import { View, Text, ScrollView, TouchableOpacity, Clipboard } from "react-native"
import { Modal, Portal, Snackbar, Dialog, Button } from "react-native-paper"
import { useState, useEffect } from "react"
import { Ionicons } from "@expo/vector-icons"

import { createStyles, rpx } from "../../utils/rpxStyleSheet"
import { getAddressList, deleteAddress, type AddressItem } from "../../services/pointsMall"
import { AddAddressPopup } from "./AddAddressPopup"
import { EditAddressPopup } from "./EditAddressPopup"

interface AddressListPopupProps {
  visible: boolean
  onClose: () => void
  onSelect: (address: AddressItem) => void
}

/**
 * 地址列表弹窗组件
 * 100%还原UniApp项目 /src/pages/pointsMall/components/AddressListPopup.vue
 */
export function AddressListPopup({ visible, onClose, onSelect }: AddressListPopupProps) {
  const [addressList, setAddressList] = useState<AddressItem[]>([])
  const [showAddAddressPopup, setShowAddAddressPopup] = useState(false)
  const [showEditAddressPopup, setShowEditAddressPopup] = useState(false)
  const [editAddressData, setEditAddressData] = useState<AddressItem | null>(null)

  const [snackbarVisible, setSnackbarVisible] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState("")
  const [snackbarType, setSnackbarType] = useState<"success" | "error" | "info">("info")

  const [confirmDialogVisible, setConfirmDialogVisible] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<AddressItem | null>(null)

  const showSnackbar = (message: string, type: "success" | "error" | "info" = "info") => {
    setSnackbarMessage(message)
    setSnackbarType(type)
    setSnackbarVisible(true)
  }

  useEffect(() => {
    if (visible) {
      loadAddressList()
    }
  }, [visible])

  const loadAddressList = async () => {
    try {
      const result = await getAddressList()
      console.log("地址列表完整数据:", JSON.stringify(result, null, 2))
      setAddressList(result || [])
    } catch (error) {
      console.error("获取地址列表失败:", error)
      setAddressList([])
    }
  }

  const handleClose = () => {
    onClose()
  }

  const selectAddress = (address: AddressItem) => {
    onSelect(address)
    handleClose()
  }

  const copyAddress = (address: AddressItem) => {
    const addressText = `${address.receiver_name} ${address.phone} ${address.province_text}${address.city_text}${address.district_text}${address.detail_address}`

    try {
      Clipboard.setString(addressText)
      showSnackbar("地址已复制", "success")
    } catch (_error) {
      showSnackbar("复制失败", "error")
    }
  }

  const editAddress = (address: AddressItem) => {
    setEditAddressData(address)
    setShowEditAddressPopup(true)
  }

  const deleteAddressConfirm = (address: AddressItem) => {
    setDeleteTarget(address)
    setConfirmDialogVisible(true)
  }

  const deleteAddressAction = async () => {
    if (!deleteTarget) return

    try {
      await deleteAddress({ address_id: deleteTarget.id })
      showSnackbar("删除成功", "success")
      loadAddressList()
      setConfirmDialogVisible(false)
      setDeleteTarget(null)
    } catch (_error) {
      showSnackbar("删除失败", "error")
    }
  }

  const handleAddSuccess = () => {
    setShowAddAddressPopup(false)
    loadAddressList()
  }

  const handleEditSuccess = () => {
    setShowEditAddressPopup(false)
    setEditAddressData(null)
    loadAddressList()
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
            <Text style={styles.headerTitle}>收货地址</Text>
          </View>

          {/* 内容区域 */}
          <ScrollView style={styles.content}>
            {addressList.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>暂无收货地址</Text>
              </View>
            ) : (
              <View style={styles.addressList}>
                {addressList.map((address) => (
                  <TouchableOpacity
                    key={address.id}
                    style={styles.addressItem}
                    onPress={() => selectAddress(address)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.addressInfo}>
                      <View style={styles.namePhone}>
                        <Text style={styles.name}>{address.receiver_name}</Text>
                        <Text style={styles.phone}>{address.phone}</Text>
                      </View>
                      <Text style={styles.addressDetail}>
                        {address.province_text}
                        {address.city_text}
                        {address.district_text}
                        {address.detail_address}
                      </Text>
                    </View>

                    <View style={styles.addressActions}>
                      <TouchableOpacity
                        style={styles.actionItem}
                        onPress={(e) => {
                          e.stopPropagation()
                          copyAddress(address)
                        }}
                      >
                        <Ionicons name="copy-outline" size={rpx(9.765625)} color="#666" />
                        <Text style={styles.actionText}>复制</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionItem}
                        onPress={(e) => {
                          e.stopPropagation()
                          editAddress(address)
                        }}
                      >
                        <Ionicons name="create-outline" size={rpx(9.765625)} color="#666" />
                        <Text style={styles.actionText}>编辑</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionItem}
                        onPress={(e) => {
                          e.stopPropagation()
                          deleteAddressConfirm(address)
                        }}
                      >
                        <Ionicons name="trash-outline" size={rpx(9.765625)} color="#666" />
                        <Text style={styles.actionText}>删除</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>

          {/* 底部按钮 */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddAddressPopup(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.addButtonText}>新增地址</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 删除确认对话框 */}
      <Dialog
        visible={confirmDialogVisible}
        onDismiss={() => setConfirmDialogVisible(false)}
        style={styles.dialog}
      >
        <Dialog.Title>确认删除</Dialog.Title>
        <Dialog.Content>
          <Text>确定要删除这个收货地址吗？</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setConfirmDialogVisible(false)} textColor="#666">
            取消
          </Button>
          <Button onPress={deleteAddressAction} textColor="#FF4D4F">
            确定
          </Button>
        </Dialog.Actions>
      </Dialog>

      {/* Snackbar 提示 */}
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

      {/* 新增地址弹窗 */}
      <AddAddressPopup
        visible={showAddAddressPopup}
        onClose={() => setShowAddAddressPopup(false)}
        onSuccess={handleAddSuccess}
      />

      {/* 编辑地址弹窗 */}
      <EditAddressPopup
        visible={showEditAddressPopup}
        addressData={editAddressData}
        onClose={() => setShowEditAddressPopup(false)}
        onSuccess={handleEditSuccess}
      />
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
  emptyState: {
    justifyContent: "center",
    alignItems: "center",
    height: 100,
  },
  emptyText: {
    fontSize: 11.71875,
    color: "#999",
  },
  addressList: {},
  addressItem: {
    backgroundColor: "#fff",
    paddingTop: 17.1875,
    paddingHorizontal: 17.1875,
    position: "relative",
    marginTop: 3.125,
  },
  addressInfo: {
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  namePhone: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  name: {
    fontSize: 11.71875,
    fontWeight: "600",
    color: "#333",
    marginRight: 15,
  },
  phone: {
    fontSize: 11.71875,
    color: "#666",
  },
  addressDetail: {
    fontSize: 11.71875,
    color: "#666",
    lineHeight: 16,
  },
  addressActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    height: 25,
    gap: 12,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 9.765625,
    color: "#666",
  },
  footer: {
    backgroundColor: "#fff",
  },
  addButton: {
    backgroundColor: "#5C9DFF",
    height: 46.875,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    fontSize: 14.0625,
    fontWeight: "bold",
    color: "#fff",
  },
  dialog: {
    backgroundColor: "#fff",
    borderRadius: 12,
  },
})
