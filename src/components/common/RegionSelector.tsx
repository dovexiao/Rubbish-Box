import React, { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle, ComponentRef, useMemo } from "react"
import { Modal, View, Text, TouchableOpacity, FlatList, ActivityIndicator } from "react-native"
import { createStyles, rpx } from "../../utils/rpxStyleSheet"
// import { devError } from "@/services/WebSocketManager"
import { type RegionItem, getProvinces, getCities, getCounties } from "@/utils/areaDataManager"

// ListRenderItem<T> 是列表项函数类型定义， ListRenderItemInfo<T> 是列表项函数传参类型定义
// import { FlashList, useRecyclingState, ListRenderItem, ListRenderItemInfo } from "@shopify/flash-list"

export type RegionSelectorRef = {
  show: (province?: string, city?: string, district?: string) => void
  hide: () => void
}

interface RegionSelectorProps {
  onClose?: () => void
  onConfirm: (province: string, city: string, district: string) => void
}

// FlashList 的列表引用类型定义
// type ListUseRef = ComponentRef<typeof FlashList<RegionItem>> | null

// FlatList 的列表引用类型定义
type ListUseRef = ComponentRef<typeof FlatList<RegionItem>> | null

type ListRef = React.RefObject<ListUseRef>

// FlashList 的列表项传参类型定义
// type ListItemProps = ListRenderItemInfo<RegionItem>

// FlatList 的列表项传参类型定义
type ListItemProps = {
  item: RegionItem
  index: number
}

// type FlatRegionData = {
//   [key: string]: {
//     data: RegionItem[]
//     loading: boolean
//   }
// }

// 列表项高度
const ITEM_HEIGHT = rpx(35.1563) // 90

// 比较省/市/区数据是否相同
const isRegionItemEqual = (item1: RegionItem | null, item2: RegionItem | null) => {
  return item1?.value === item2?.value || item1?.text === item2?.text
}

/**
 * 省市区选择弹窗组件
 */
const RegionSelector = forwardRef<RegionSelectorRef, RegionSelectorProps>(({
  onClose,
  onConfirm,
}, ref) => {
  // 内部维护可视状态
  const [visible, setVisible] = useState(false)

  // 展示用省/市/区数据
  const [provinces, setProvinces] = useState<RegionItem[]>([])
  const [cities, setCities] = useState<RegionItem[]>([])
  const [districts, setDistricts] = useState<RegionItem[]>([])

  // 当前选中省/市/区
  const [selectedProvince, setSelectedProvince] = useState<RegionItem | null>(null)
  const [selectedCity, setSelectedCity] = useState<RegionItem | null>(null)
  const [selectedDistrict, setSelectedDistrict] = useState<RegionItem | null>(null)

  // 新选中省/市/区
  const [newSelectedProvince, setNewSelectedProvince] = useState<RegionItem | null>(null)
  const [newSelectedCity, setNewSelectedCity] = useState<RegionItem | null>(null)
  const [newSelectedDistrict, setNewSelectedDistrict] = useState<RegionItem | null>(null)

  // 列表引用
  const provinceListRef = useRef<ListUseRef>(null)
  const cityListRef = useRef<ListUseRef>(null)
  const districtListRef = useRef<ListUseRef>(null)

  // 列表等待状态
  const [provinceLoading, setProvinceLoading] = useState(false)
  const [cityLoading, setCityLoading] = useState(false)
  const [districtLoading, setDistrictLoading] = useState(false)

  // 扁平化省市区县数据引用 （regigonValue 作为扁平索引）
  // const [flatRegionData, setFlatRegionData] = useState<FlatRegionData>({})

  // 加载省份数据
  // const loadProvinces = useCallback(() => {
  //   try {
  //     const data = getProvinces()
  //     setProvinces(data || [])
  //   } catch (error) {
  //     devError("加载省份数据失败:", error)
  //     // showError("加载省份数据失败，请重试")
  //     setProvinces([])
  //   } finally {
  //     setProvinceLoading(false)
  //   }
  // }, [])

  // 加载城市数据
  // const loadCities = useCallback((provinceCode: string) => {
  //   try {
  //     // 更新省份数据状态为正在加载
  //     setFlatRegionData(prev => ({
  //       ...prev,
  //       [provinceCode]: {
  //         data: [],
  //         loading: true,
  //       }
  //     }))
  //     // 加载城市数据
  //     const data = getCities(provinceCode)
  //     // setCities(data || [])
  //     // 更新城市数据状态为已加载
  //     setFlatRegionData(prev => ({
  //       ...prev,
  //       [provinceCode]: {
  //         data: data || [],
  //         loading: false,
  //       }
  //     }))
  //   } catch (error) {
  //     devError("加载城市数据失败:", error)
  //     // showError("加载城市数据失败，请重试")
  //     // setCities([])
  //     setFlatRegionData(prev => ({
  //       ...prev,
  //       [provinceCode]: {
  //         data: [],
  //         loading: false,
  //       }
  //     }))
  //   } finally {
  //     // setCityLoading(false)
  //   }
  // }, [])

  // 加载区县数据
  // const loadDistricts = useCallback((cityCode: string) => {
  //   try {
  //     // 更新城市数据状态为正在加载
  //     setFlatRegionData(prev => ({
  //       ...prev,
  //       [cityCode]: {
  //         data: [],
  //         loading: true,
  //       }
  //     }))
  //     // 加载区县数据
  //     const data = getCounties(cityCode)
  //     // setDistricts(data || [])
  //     // 更新区县数据状态为已加载
  //     setFlatRegionData(prev => ({
  //       ...prev,
  //       [cityCode]: {
  //         data: data || [],
  //         loading: false,
  //       }
  //     }))
  //   } catch (error) {
  //     devError("加载区县数据失败:", error)
  //     // showError("加载区县数据失败，请重试")
  //     // setDistricts([])
  //     setFlatRegionData(prev => ({
  //       ...prev,
  //       [cityCode]: {
  //         data: [],
  //         loading: false,
  //       }
  //     }))
  //   } finally {
  //     // setDistrictLoading(false)
  //   }
  // }, [])

  // show 方法：显示选择器并设置初始值
  const show = useCallback((provinceText?: string, cityText?: string, districtText?: string) => {
    setVisible(true)
    // 更新新选中省/市/区状态
    setNewSelectedProvince(provinceText ? { value: "", text: provinceText } : null)
    setNewSelectedCity(cityText ? { value: "", text: cityText } : null)
    setNewSelectedDistrict(districtText ? { value: "", text: districtText } : null)
    setProvinceLoading(true)
    setCityLoading(true)
    setDistrictLoading(true)
  }, [])

  // hide 方法：隐藏选择器并重置状态
  const hide = useCallback(() => {
    onClose?.()
    setVisible(false)
    // 延迟重置数据，避免关闭动画时闪烁
    setTimeout(() => {
      setProvinces([])
      setCities([])
      setDistricts([])
      setSelectedProvince(null)
      setSelectedCity(null)
      setSelectedDistrict(null)
      setNewSelectedProvince(null)
      setNewSelectedCity(null)
      setNewSelectedDistrict(null)
    }, 300)
  }, [onClose])

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    show,
    hide,
  }), [show, hide])

  // 处理确定按钮点击
  const handleConfirm = useCallback(() => {
    const provinceText = selectedProvince?.text || ""
    const cityText = selectedCity?.text || ""
    const districtText = selectedDistrict?.text || ""
    onConfirm(provinceText, cityText, districtText)
    hide()
  }, [onConfirm, hide, selectedProvince, selectedCity, selectedDistrict])

  // 初始化展示用省数据
  useEffect(() => {
    if (visible) {
      // loadProvinces()
      const data = getProvinces()
      setProvinces(data || [])
      setProvinceLoading(false)
      // if (data && data.length > 0) {
      //   const findIndex = data.findIndex(item => item.value === newSelectedProvince?.value || item.text === newSelectedProvince?.text)
      //   const targetIndex = findIndex !== -1 ? findIndex : 0
      //   provinceListRef.current?.scrollToIndex({ index: targetIndex, animated: true })
      //   setSelectedProvince(data[targetIndex])
      // }
    }
  }, [visible])

  // 初始化展示用省数据选中
  useEffect(() => {
    if (visible && provinces && provinces.length > 0) {
      const findIndex = provinces.findIndex(item => item.value === newSelectedProvince?.value || item.text === newSelectedProvince?.text)
      const targetIndex = findIndex !== -1 ? findIndex : 0
      provinceListRef.current?.scrollToIndex({ index: targetIndex, animated: true })
      setSelectedProvince(provinces[targetIndex])
    }
  }, [provinces])

  // 获取更新展示用市数据
  useEffect(() => {
    if (visible && selectedProvince?.value) {
      // const flatCities = flatRegionData[selectedProvince.value]
      // if (flatCities && flatCities.loading) {
      //   return;
      // }
      // if (flatCities && !flatCities.loading && flatCities.data) {
      //   setCities(flatCities.data || [])
      //   setCityLoading(false)
      //   return;
      // }
      // loadCities(selectedProvince.value)
      const data = getCities(selectedProvince.value)
      setCities(data || [])
      setCityLoading(false)
      // if (data && data.length > 0) {
      //   const findIndex = data.findIndex(item => item.value === newSelectedCity?.value || item.text === newSelectedCity?.text)
      //   const targetIndex = findIndex !== -1 ? findIndex : 0
      //   cityListRef.current?.scrollToIndex({ index: targetIndex, animated: true })
      //   setSelectedCity(data[targetIndex])
      // }  
    }
  }, [selectedProvince])

  // 更新展示用市数据选中
  useEffect(() => {
    if (visible && cities && cities.length > 0) {
      const findIndex = cities.findIndex(item => item.value === newSelectedCity?.value || item.text === newSelectedCity?.text)
      const targetIndex = findIndex !== -1 ? findIndex : 0
      cityListRef.current?.scrollToIndex({ index: targetIndex, animated: true })
      setSelectedCity(cities[targetIndex])
      setDistrictLoading(true)
      setDistricts([])
      setSelectedDistrict(null)
    }
  }, [cities])

  // 获取更新展示用区县数据
  useEffect(() => {
    if (visible && selectedCity?.value) {
      // const flatDistrict = flatRegionData[selectedCity.value]
      // if (flatDistrict && flatDistrict.loading) {
      //   return;
      // }
      // if (flatDistrict && !flatDistrict.loading && flatDistrict.data.length > 0) {
      //   setDistricts(flatDistrict.data)
      //   setDistrictLoading(false)
      //   return;
      // }
      // loadDistricts(selectedCity.value)
      const data = getCounties(selectedCity.value)
      setDistricts(data || [])
      setDistrictLoading(false)
      // if (data && data.length > 0) {
      //   const findIndex = data.findIndex(item => item.value === newSelectedDistrict?.value || item.text === newSelectedDistrict?.text)
      //   const targetIndex = findIndex !== -1 ? findIndex : 0
      //   districtListRef.current?.scrollToIndex({ index: targetIndex, animated: true })
      //   setSelectedDistrict(data[targetIndex])
      // }
    }
  }, [selectedCity])

  // 更新展示用区县数据选中
  useEffect(() => {
    if (visible && districts && districts.length > 0) {
      const findIndex = districts.findIndex(item => item.value === newSelectedDistrict?.value || item.text === newSelectedDistrict?.text)
      const targetIndex = findIndex !== -1 ? findIndex : 0
      districtListRef.current?.scrollToIndex({ index: targetIndex, animated: true })
      setSelectedDistrict(districts[targetIndex])
    }
  }, [districts])

  // 处理新选中区县
  useEffect(() => {
    if (!isRegionItemEqual(selectedDistrict, newSelectedDistrict)) {
      setSelectedDistrict(newSelectedDistrict)
    }
  }, [newSelectedDistrict])

  // 处理新选中市
  useEffect(() => {
    if (!isRegionItemEqual(selectedCity, newSelectedCity)) {
      setSelectedCity(newSelectedCity)
      setSelectedDistrict(null)
      setDistrictLoading(true)
      setDistricts([])
    }
  }, [newSelectedCity])

  // 处理新选中省份
  useEffect(() => {
    if (!isRegionItemEqual(selectedProvince, newSelectedProvince)) {
      setSelectedProvince(newSelectedProvince)
      setSelectedCity(null)
      // setSelectedDistrict(null)
      setCityLoading(true)
      // setDistrictLoading(true)
      setCities([])
      // setDistricts([])
    }
  }, [newSelectedProvince])

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={hide}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* 标题 */}
          <View style={styles.header}>
            <Text style={styles.title}>地区</Text>
          </View>

          {/* 三个列表容器 */}
          <View style={styles.listsContainer}>
            {/* 省份列表 */}
            <View style={styles.listWrapper}>
              <View style={styles.listContainer}>
                <List
                  listData={provinces}
                  listRef={provinceListRef}
                  loading={provinceLoading}
                  extraData={{ SelectedRegion: selectedProvince }}
                  onSelected={setNewSelectedProvince}
                  type="province"
                />
              </View>
            </View>

            {/* 城市列表 */}
            <View style={styles.listWrapper}>
              <View style={styles.listContainer}>
                <List
                  listData={cities}
                  listRef={cityListRef}
                  loading={cityLoading}
                  extraData={{ SelectedRegion: selectedCity }}
                  onSelected={setNewSelectedCity}
                  type="city"
                />
              </View>
            </View>

            {/* 区县列表 */}
            <View style={styles.listWrapper}>
              <View style={styles.listContainer}>
                <List
                  listData={districts}
                  listRef={districtListRef}
                  loading={districtLoading}
                  extraData={{ SelectedRegion: selectedDistrict }}
                  onSelected={setNewSelectedDistrict}
                  type="district"
                />
              </View>
            </View>
          </View>

          {/* 高亮指示器 */}
          <View style={styles.highlightIndicator} pointerEvents="none" />

          {/* 底部按钮 */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} activeOpacity={0.8} onPress={hide}>
              <Text style={styles.cancelButtonText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButton}
              activeOpacity={0.8}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmButtonText}>确定</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
})

const ListItem = ({ item, extraData }: { item: RegionItem, extraData: any }) => {
  const { SelectedRegion } = extraData || {}
  const isSelected = SelectedRegion?.value === item.value || SelectedRegion?.text === item.text
  // const [regionText, setRegionText] = useRecyclingState(item.text, [item.value])
  const regionText = useMemo(() => item.text, [item])

  return (
    <View key={item.value} style={styles.listItem}>
      <Text style={[styles.listItemText, isSelected && styles.selectedListItemText]} numberOfLines={2}>{regionText}</Text>
    </View>
  )
}

const List = ({ listData, listRef, loading, extraData, onSelected, type }: { listData: RegionItem[], listRef: ListRef, loading: boolean, extraData: any, onSelected: (item: RegionItem | null) => void, type: 'province' | 'city' | 'district' }) => {
  // 用户滑动行为标记
  const userScrollingRef = useRef(false)

  // 处理 onScrollBeginDrag （用户拖拽开始）
  const handleScrollBeginDrag = useCallback(
    () => {
      return () => {
        userScrollingRef.current = true;
      }
    }, [])

  // 处理 onScrollEndDrag （用户拖拽结束）
  const handleScrollEndDrag = useCallback(
    () => {
      return () => { }
    }, [])

  // 处理 onMomentumScrollBegin （惯性滚动/系统滑动）
  const handleMomentumScrollBegin = useCallback(
    () => {
      return () => { }
    }, [])

  // 处理 onMomentumScrollEnd （滚动结束）
  const handleScrollEnd = useCallback(
    () => {
      // 校准滚动位置到最近的 ITEM_HEIGHT 倍数
      const snapToItem = (offset: number): { snappedIndex: number, snappedOffset: number } => {
        // 计算最近的 ITEM_HEIGHT 倍数
        const contentOffset = offset
        const snappedIndex = Math.round(contentOffset / ITEM_HEIGHT)
        return { snappedIndex, snappedOffset: Math.round(snappedIndex * ITEM_HEIGHT) }
      }

      return (event: any) => {
        listRef.current?.setNativeProps({
          scrollEnabled: false,
        })

        const offsetY = event.nativeEvent.contentOffset.y
        const { snappedIndex: listItemIndex, snappedOffset } = snapToItem(offsetY)

        if (userScrollingRef.current) {
          const selectedItem = listData && listData.length > listItemIndex ? listData[listItemIndex] : null
          onSelected?.(selectedItem)
          // 重置用户滑动行为标记
          userScrollingRef.current = false;
        }

        // 如果偏移量有变化，进行校准
        if (Math.abs(offsetY - snappedOffset) > 0 && listData.length > listItemIndex) {
          listRef.current?.scrollToIndex({
            index: listItemIndex,
            animated: true,
          })
          return;
        }

        listRef.current?.setNativeProps({
          scrollEnabled: true,
        })
      }
    },
    [listData, onSelected, listRef],
  )

  const listKeyExtractor = useCallback((item: RegionItem) => {
    return `${item.value}-${item.text}`
  }, [])

  const renderListItem = useCallback(({ item, index }: ListItemProps) => {
    return <ListItem item={item} extraData={extraData} />
  }, [extraData])

  // 渲染空数据
  const renderEmpty = useCallback(() => {
    const isLoading = loading
    return (
      <View style={styles.listEmptyContainer}>
        {isLoading ?
          <ActivityIndicator size="large" color="#4891FF" /> :
          <Text style={styles.listEmptyText}>暂无数据</Text>}
      </View>
    )
  }, [loading])

  return (
    <FlatList
      ref={listRef}
      data={listData}
      renderItem={renderListItem}
      keyExtractor={listKeyExtractor}
      style={styles.list}
      initialScrollIndex={0}
      initialNumToRender={30}
      // maxItemsInRecyclePool={20}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContentContainer}
      ListEmptyComponent={renderEmpty()}
      onScrollBeginDrag={handleScrollBeginDrag()}
      onScrollEndDrag={handleScrollEndDrag()}
      onMomentumScrollBegin={handleMomentumScrollBegin()}
      onMomentumScrollEnd={handleScrollEnd()}
      getItemLayout={(data, index) => ({
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
        index,
      })}
      // drawDistance={250}
      fadingEdgeLength={rpx(15.625)} // 40
    // extraData={extraData}
    />
  )
}

RegionSelector.displayName = 'RegionSelector'

const styles = createStyles({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  container: {
    width: 253.125, // 648
    height: 203.125, // 520
    paddingHorizontal: 10.9375, // 28
    backgroundColor: "#FFFFFF",
    borderRadius: 11.71875, // 30
    // justifyContent: "space-between" as const,
    gap: 10.9375, // 28
    overflow: "hidden" as const,
  },
  header: {
    height: 19.53125, // 50
    justifyContent: "center" as const,
    alignItems: "flex-start" as const,
    marginTop: 17.1875, // 44
  },
  title: {
    fontFamily: "PingFang SC",
    fontWeight: "bold" as const,
    fontSize: 12.5, // 32
    color: "#000000",
  },
  listsContainer: {
    // flex: 1, 
    flexDirection: "row" as const,
    width: "100%" as const,
    height: 105.46875, // 270
  },
  listWrapper: {
    flex: 1,
  },
  listContainer: {
    width: "100%" as const,
    height: "100%" as const,
  },
  list: {
    width: "100%" as const,
    height: "100%" as const,
  },
  listContentContainer: {
    paddingVertical: 35.15625, // 90
  },
  listItem: {
    height: 35.1563, // 90
    paddingHorizontal: 3.9063, // 10
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  listItemText: {
    fontFamily: "PingFang SC",
    fontWeight: "400" as const,
    fontSize: 12.5, // 32
    color: "#424242",
    textAlign: "center" as const,
  },
  selectedListItemText: {
    color: "#1571FC",
  },
  listEmptyContainer: {
    width: "100%" as const,
    minHeight: 35.1563, // 90
    paddingHorizontal: 3.9063, // 10
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  listEmptyText: {
    fontFamily: "PingFang SC",
    fontWeight: "400" as const,
    fontSize: 12.5, // 32
    color: "#424242",
    textAlign: "center" as const,
  },
  highlightIndicator: {
    position: "absolute" as const,
    top: 81.6406, // 212
    left: 10.9375, // 28
    width: 231.25, // 592
    height: 35.1563, // 90
    backgroundColor: "#0000000D",
    borderRadius: 7.8125, // 20
    zIndex: 1000,
  },
  footer: {
    height: 39.0625, // 100
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  cancelButton: {
    width: '50%' as const,
    height: '100%' as const,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  cancelButtonText: {
    fontFamily: "PingFang SC",
    fontWeight: "400" as const,
    fontSize: 12.5, // 32
    color: "#000000",
  },
  confirmButton: {
    width: '50%' as const,
    height: '100%' as const,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  confirmButtonText: {
    fontFamily: "PingFang SC",
    fontWeight: "400" as const,
    fontSize: 12.5, // 32
    color: "#1571FC",
  },
})

export default RegionSelector
