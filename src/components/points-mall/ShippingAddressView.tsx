import React, { useState } from "react"
import { View, Text, ScrollView, TouchableOpacity, Clipboard } from "react-native"
import { createStyles, rpx } from "../../utils/rpxStyleSheet"
import { LinearGradient } from "expo-linear-gradient"
import { AddressItem } from "@/services/pointsMall"
import { Ionicons } from "@expo/vector-icons"
import AddressAddOrEditorPopup from "./AddressAddOrEditorPopup"

/**
 * 收货地址信息视图组件
 */

interface ShippingAddressProps {
  addressList: AddressItem[]
  onSelectAddress: (address: AddressItem) => void
  onRefresh?: () => void
}

const ShippingAddressView: React.FC<ShippingAddressProps> = ({ addressList, onSelectAddress, onRefresh }) => {
  const [addVisible, setAddVisible] = useState(false)
  const [snackbarVisible, setSnackbarVisible] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState("")
  const [snackbarType, setSnackbarType] = useState<"success" | "error" | "info">("info")
  const [address, setAddress] = useState<AddressItem | null>(null)

  const showSnackbar = (message: string, type: "success" | "error" | "info" = "info") => {
    setSnackbarMessage(message)
    setSnackbarType(type)
    setSnackbarVisible(true)
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

  return (
    <>
      <View style={styles.headerContainer}>
        <Text style={styles.titleText}>收货地址</Text>
      </View>
      <View style={styles.container}>
        <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
          {addressList.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => onSelectAddress(item)}
            >
              <View style={styles.cardMain}>
                <View style={styles.nameRow}>
                  <Text style={styles.name} numberOfLines={1}>{item.receiver_name}</Text>
                  <Text style={styles.phone}>{item.phone}</Text>
                </View>
                <Text style={styles.address} numberOfLines={2}>
                  {item.province_text}
                  {item.city_text}
                  {item.district_text}
                  {item.detail_address}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.cardFooter}>
                <View style={styles.footerActions}>
                  <TouchableOpacity
                    style={styles.actionItem}
                    activeOpacity={0.8}
                    onPress={(e) => {
                      e.stopPropagation()
                      copyAddress(item)
                    }}>
                    <Ionicons name="copy-outline" size={rpx(12.5)} color="#666" />
                    <Text style={styles.actionText}>复制</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionItem}
                    activeOpacity={0.8}
                    onPress={(e) => {
                      e.stopPropagation()
                      // 启动新增编辑地址弹窗, 并赋值地址
                      setAddVisible(true)
                      setAddress(item)
                    }}>
                    <Ionicons name="create-outline" size={rpx(12.5)} color="#666" />
                    <Text style={styles.actionText}>编辑</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionItem}
                    activeOpacity={0.8}
                    onPress={(e) => {
                      e.stopPropagation()
                      // 弹出删除弹窗确认框
                    }}>
                    <Ionicons name="trash-outline" size={rpx(12.5)} color="#666" />
                    <Text style={styles.actionText}>删除</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
          {addressList.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>暂无收货地址</Text>
            </View>
          )}
        </ScrollView>
      </View>
      {/* 下一步按钮 */}
      <TouchableOpacity
        style={styles.nextButton}
        activeOpacity={0.8}
        onPress={() => {
          setAddVisible(true);
          setAddress(null);
        }}
      >
        <LinearGradient
          colors={['#FFDCBC', '#FFBB7B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.nextButtonGradient}
        >
          <Text style={styles.nextButtonText}>新增地址</Text>
        </LinearGradient>
      </TouchableOpacity>

      <AddressAddOrEditorPopup
        visible={addVisible}
        address={address}
        onClose={() => setAddVisible(false)}
        onSuccess={() => {
          setAddVisible(false)
          onRefresh?.()
        }}
      />
    </>
  )
}

const styles = createStyles({
  container: {
    width: '100%' as const,
    height: '100%' as const,
    padding: 14.0625, // 36
    paddingTop: 39.84375, // 102
    gap: 7.8125, // 20
    backgroundColor: "#F5F5F5" as const,
  },
  scrollArea: {
    width: "100%" as const,
    flex: 1,
  },
  card: {
    width: '100%' as const,
    backgroundColor: "#FFFFFF" as const,
    borderRadius: 7.8125, // 20
    paddingHorizontal: 9.375, // 24
    paddingVertical: 6.25, // 16
    marginBottom: 4.6875, // 12
  },
  cardMain: {
    width: '100%' as const,
    marginTop: 9.375, // 24
    paddingHorizontal: 6.25, // 16
    gap: 4.6875, // 12
  },
  nameRow: {
    width: '100%' as const,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 11.71875, // 30
  },
  name: {
    maxWidth: 265.625, // 680
    fontFamily: "PingFang SC",
    fontWeight: "400" as const,
    fontSize: 12.5, // 32
    color: "#000000",
  },
  phone: {
    width: 66.4063, // 170
    fontFamily: "PingFang SC",
    fontWeight: "400" as const,
    fontSize: 11.7188, // 30
    color: "#000000CC",
  },
  address: {
    fontFamily: "PingFang SC",
    fontWeight: "400" as const,
    fontSize: 11.71875, // 30
    color: "#000000CC",
    lineHeight: 18.75, // 48
  },
  divider: {
    width: "100%" as const,
    height: 0.5859375, // 1.5 * 750 / 1920
    backgroundColor: "#0000001A",
    marginVertical: 4.6875, // 12
  },
  cardFooter: {
    // marginTop: 11.71875, // 30
    width: "100%" as const,
    flexDirection: "row" as const,
    justifyContent: "flex-end" as const,
    paddingHorizontal: 6.25, // 16
  },
  footerActions: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 14.0625, // 36
  },
  actionItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 3.90625, // 10
  },
  actionText: {
    fontFamily: "PingFang SC",
    fontWeight: "400" as const,
    fontSize: 10.15635, // 26
    color: "#545454",
  },
  emptyState: {
    justifyContent: "center" as const,
    alignItems: "center" as const,
    height: 100,
  },
  emptyText: {
    fontSize: 11.71875,
    color: "#999",
  },
  headerContainer: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    width: '100%' as const,
    height: 38.2813, // 98
    flexDirection: "row" as const,
    // backgroundColor: "#FFFFFF" as const,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    zIndex: 1
  },
  titleText: {
    fontFamily: "PingFang SC",
    fontWeight: "400" as const,
    fontSize: 11.7188, // 30
    color: "#000000",
  },
  nextButton: {
    position: "absolute" as const,
    bottom: 0, // 28
    left: 0, // 276.5
    right: 0,
    width: '100%' as const,
    height: 39.4531, // 101
    backgroundColor: "#FF8C00",
    overflow: "hidden" as const,
  },
  nextButtonGradient: {
    width: "100%" as const,
    height: "100%" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  nextButtonText: {
    fontFamily: "PingFang SC",
    fontWeight: "bold" as const,
    fontSize: 12.5, // 32
    color: "#743A14",
  },
})

export default ShippingAddressView