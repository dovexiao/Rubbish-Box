import React, { useState, useCallback, useEffect, useRef, useMemo } from "react"
import { View, Text, FlatList, TouchableOpacity, Clipboard, RefreshControl, ActivityIndicator } from "react-native"
import { createStyles, rpx } from "../../utils/rpxStyleSheet"
import { LinearGradient } from "expo-linear-gradient"
import { AddressItem, addAddress, updateAddress, deleteAddress, AddAddressParams, UpdateAddressParams, getAddressList, setAddressDefault } from "@/services/pointsMall"
import { Ionicons } from "@expo/vector-icons"
import AddressAddOrEditorPopup, { type AddressAddOrEditorPopupRef } from "./AddressAddOrEditorPopup"
import DeleteAddressDialog, { type DeleteAddressDialogRef } from "./DeleteAddressDialog"
import { showError, showSuccess } from "@/utils/toast"
import { devError } from "../../services/WebSocketManager"
import { useProductDetailStore } from "../../stores/points-mall/productDetailStore"

/**
 * 收货地址信息视图组件
 */

interface ShippingAddressProps {
  onPrevious?: () => void
}

const ShippingAddressView: React.FC<ShippingAddressProps> = ({ onPrevious }) => {
  const [addressList, setAddressList] = useState<AddressItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef<boolean>(false);
  const addressAddOrEditorPopupRef = useRef<AddressAddOrEditorPopupRef>(null);
  const deleteAddressDialogRef = useRef<DeleteAddressDialogRef>(null);

  // 加载地址列表
  const loadAddressList = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    const setDefaultAddress = useProductDetailStore.getState().setDefaultAddress;

    try {
      const result = await getAddressList();
      setAddressList(result ?? []);
      const defaultAddress = (result ?? []).find(item => item.is_default) ?? (result ?? [null])[0];
      setDefaultAddress(defaultAddress);
    } catch (error: unknown) {
      devError("获取地址列表失败:", error);
      setAddressList([]);
      setDefaultAddress(null);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  // 刷新方法
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAddressList();
    setRefreshing(false);
  }, [loadAddressList]);

  // 设置默认地址
  const updateDefaultAddress = useCallback(async (id: number) => {
    try {
      await setAddressDefault({ id: id.toString() });
      await loadAddressList();
      onPrevious?.();
    } catch (error: unknown) {
      devError("设置默认地址失败:", error);
    }
  }, [loadAddressList, onPrevious]);

  // 处理点击选择收货地址
  const handleSelectAddress = useCallback(async (address: AddressItem) => {
    await updateDefaultAddress(address.id);
  }, [updateDefaultAddress]);

  // 新增收货地址
  const handleAddAddress = useCallback(async (params: AddAddressParams) => {
    try {
      await addAddress(params);
      showSuccess("新增地址成功");
      await loadAddressList();
    } catch (error: unknown) {
      devError("新增地址失败:", error);
    }
  }, [loadAddressList]);

  // 修改收货地址
  const handleUpdateAddress = useCallback(async (params: UpdateAddressParams) => {
    try {
      await updateAddress(params);
      showSuccess("修改地址成功");
      await loadAddressList();
    } catch (error: unknown) {
      devError("修改地址失败:", error);
    }
  }, [loadAddressList]);

  // 删除收货地址
  const handleDeleteAddress = useCallback(async (addressId: number) => {
    try {
      await deleteAddress({ address_id: addressId });
      showSuccess("删除地址成功");
      await loadAddressList();
    } catch (error: unknown) {
      devError("删除地址失败:", error);
    }
  }, [loadAddressList]);

  // 复制地址
  const handleCopyAddress = useCallback((address: AddressItem) => {
    const addressText = `${address.receiver_name} ${address.phone} ${address.province}${address.city}${address.district}${address.detail_address}`;

    try {
      Clipboard.setString(addressText);
      showSuccess("地址已复制");
    } catch (error: unknown) {
      devError("复制地址失败:", error);
      showError("复制地址失败");
    }
  }, []);

  // 编辑地址
  const handleEditAddress = useCallback((address: AddressItem) => {
    addressAddOrEditorPopupRef.current?.show(address);
  }, []);

  // 删除地址
  const handleDeleteAddressClick = useCallback((addressId: number) => {
    deleteAddressDialogRef.current?.show(addressId);
  }, []);

  // 新增地址
  const handleAddNewAddress = useCallback(() => {
    addressAddOrEditorPopupRef.current?.show(null);
  }, []);

  // keyExtractor
  const keyExtractor = useCallback((item: AddressItem) => {
    return `address-${item.id}`;
  }, []);

  // renderItem
  const renderItem = useCallback(({ item }: { item: AddressItem }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => handleSelectAddress(item)}
      >
        <View style={styles.cardMain}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{item.receiver_name}</Text>
            <Text style={styles.phone}>{item.phone}</Text>
          </View>
          <Text style={styles.address} numberOfLines={2}>
            {item.province}
            {item.city}
            {item.district}
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
                e.stopPropagation();
                handleCopyAddress(item);
              }}>
              <Ionicons name="copy-outline" size={rpx(12.5)} color="#666" />
              <Text style={styles.actionText}>复制</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionItem}
              activeOpacity={0.8}
              onPress={(e) => {
                e.stopPropagation();
                handleEditAddress(item);
              }}>
              <Ionicons name="create-outline" size={rpx(12.5)} color="#666" />
              <Text style={styles.actionText}>编辑</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionItem}
              activeOpacity={0.8}
              onPress={(e) => {
                e.stopPropagation();
                handleDeleteAddressClick(item.id);
              }}>
              <Ionicons name="trash-outline" size={rpx(12.5)} color="#666" />
              <Text style={styles.actionText}>删除</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [handleSelectAddress, handleCopyAddress, handleEditAddress, handleDeleteAddressClick]);

  // refreshControl
  const refreshControl = useMemo(() => {
    return (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
    );
  }, [refreshing, handleRefresh]);

  // ListEmptyComponent
  const listEmptyComponent = useMemo(() => {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>暂无收货地址</Text>
      </View>
    );
  }, []);

  // ListFooterComponent
  const listFooterComponent = useMemo(() => {
    if (loading) {
      return (
        <View style={styles.footerState}>
          <ActivityIndicator size="small" color="#999" />
        </View>
      );
    }
    return addressList.length > 0 ? (
      <View style={styles.footerState}>
        <Text style={styles.footerText}>没有更多了</Text>
      </View>
    ) : null;
  }, [loading, addressList.length]);

  useEffect(() => {
    loadAddressList();
  }, [loadAddressList]);

  return (
    <>
      <View style={styles.headerContainer}>
        <Text style={styles.titleText}>收货地址</Text>
      </View>
      <View style={styles.container}>
        <FlatList
          data={addressList}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}
          // onEndReached={handleLoadMore} // 暂时不做加载更多方法，该属性注释，列表始终为空项或者没有更多，loadAddressList会一次性获取所有数据
          // onEndReachedThreshold={0.1}
          ListEmptyComponent={listEmptyComponent}
          ListFooterComponent={listFooterComponent}
        />
      </View>
      {/* 新增按钮 */}
      <TouchableOpacity
        style={styles.nextButton}
        activeOpacity={0.8}
        onPress={handleAddNewAddress}
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

      {/* 新增/编辑地址弹窗 */}
      <AddressAddOrEditorPopup
        ref={addressAddOrEditorPopupRef}
        onAddAddress={handleAddAddress}
        onUpdateAddress={handleUpdateAddress}
      />

      {/* 删除地址确认弹窗 */}
      <DeleteAddressDialog
        ref={deleteAddressDialogRef}
        onDeleteAddress={handleDeleteAddress}
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
    width: 78.125, // 200
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
  footerState: {
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingVertical: 15.625, // 40
  },
  footerText: {
    fontSize: 10.15625, // 26
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