import React, { useState, useEffect, useCallback, useRef } from "react"
import { Modal, View, Text, TouchableOpacity, FlatList, StyleSheet } from "react-native"
import { createStyles, rpx } from "../../utils/rpxStyleSheet"
import { getProvinces, getCities, getCounties } from "../../services/pointsMall"
import { showError } from "../../utils/toast"

interface RegionOption {
  value: string
  text: string
}

interface RegionSelectorProps {
  visible: boolean
  onClose: () => void
  onConfirm: (province: string, city: string, district: string) => void
  province?: string
  city?: string
  district?: string
}

/**
 * 省市区选择弹窗组件
 */
const RegionSelector: React.FC<RegionSelectorProps> = ({
  visible,
  onClose,
  onConfirm,
  province = "",
  city = "",
  district = "",
}) => {
  const [provinces, setProvinces] = useState<RegionOption[]>([])
  const [cities, setCities] = useState<RegionOption[]>([])
  const [districts, setDistricts] = useState<RegionOption[]>([])

  const [selectedProvince, setSelectedProvince] = useState<string>(province || '')
  const [selectedCity, setSelectedCity] = useState<string>(city || '')
  const [selectedDistrict, setSelectedDistrict] = useState<string>(district || '')

  const [loading, setLoading] = useState(false)

  const provinceListRef = useRef<FlatList>(null)
  const cityListRef = useRef<FlatList>(null)
  const districtListRef = useRef<FlatList>(null)

  // 列表项高度
  const ITEM_HEIGHT = rpx(35.1563)

  // 校准滚动位置到最近的 ITEM_HEIGHT 倍数
  const snapToItem = useCallback((offset: number): number => {
    const contentOffset = offset
    // 计算最近的 ITEM_HEIGHT 倍数
    return Math.round(contentOffset / ITEM_HEIGHT) * ITEM_HEIGHT
  }, [])

  // 处理滚动结束校准
  const handleScrollEnd = useCallback(
    (listRef: React.RefObject<FlatList | null>, type: 'province' | 'city' | 'district') => {
      return (event: any) => {
        const offsetY = event.nativeEvent.contentOffset.y
        const snappedOffset = snapToItem(offsetY)
        
        // 如果偏移量有变化，进行校准
        if (Math.abs(offsetY - snappedOffset) > 0.1) {
          listRef.current?.scrollToOffset({
            offset: snappedOffset,
            animated: true,
          })
        }
      }
    },
    [],
  )

  // 加载省份数据
  const loadProvinces = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getProvinces()
      setProvinces(data || [])
      return data
    } catch (error) {
      console.error("加载省份数据失败:", error)
      showError("加载省份数据失败，请重试")
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  // 加载城市数据
  const loadCities = useCallback(async (provinceCode: string) => {
    try {
      setLoading(true)
      const data = await getCities({ province_code: provinceCode })
      setCities(data || [])
      return data
    } catch (error) {
      console.error("加载城市数据失败:", error)
      showError("加载城市数据失败，请重试")
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  // 加载区县数据
  const loadDistricts = useCallback(async (cityCode: string) => {
    try {
      setLoading(true)
      const data = await getCounties({ city_code: cityCode })
      setDistricts(data || [])
      return data
    } catch (error) {
      console.error("加载区县数据失败:", error)
      showError("加载区县数据失败，请重试")
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  // 选择省份
  const handleSelectProvince = useCallback(
    (item: RegionOption) => {
      setSelectedProvince(item.text || '')
      setSelectedCity('')
      setSelectedDistrict('')
      setCities([])
      setDistricts([])
      loadCities(item.value)
    },
    [],
  )

  // 选择城市
  const handleSelectCity = useCallback(
    (item: RegionOption) => {
      setSelectedCity(item.text || '')
      setSelectedDistrict('')
      setDistricts([])
      loadDistricts(item.value)
    },
    [loadDistricts],
  )

  // 选择区县
  const handleSelectDistrict = useCallback((item: RegionOption) => {
    setSelectedDistrict(item.text || '')
  }, [])

  // 确认选择
  const handleConfirm = useCallback(() => {
    onConfirm(selectedProvince, selectedCity, selectedDistrict)
    onClose()
  }, [selectedProvince, selectedCity, selectedDistrict])

  // 初始化数据
  useEffect(() => {
    if (visible) {
      console.log("地区选择器初始化数据", province, city, district)
      loadProvinces().then((provinceData) => {
        console.log("加载省份数据", provinceData)
        // 如果有初始值，加载对应的城市和区县数据
        if (province) {
          const provinceItem = provinceData.find(p => p.text === province)
          console.log("匹配到的省份数据", provinceItem)
          if (provinceItem) {
            console.log("有省份数据，加载城市数据", provinceItem)
            setSelectedProvince(provinceItem.text)
            setTimeout(() => {
              provinceListRef.current?.scrollToIndex({ index: provinceData.findIndex(p => p.text === provinceItem.text) })
            }, 100)
            loadCities(provinceItem.value).then((cityData) => {
              console.log("加载城市数据", cityData)
              if (city) {
                const cityItem = cityData.find(c => c.text === city)
                console.log("匹配到的城市数据", cityItem)
                if (cityItem) {
                  console.log("有城市数据，加载区县数据", cityItem)
                  setSelectedCity(cityItem.text)
                  setTimeout(() => {
                    cityListRef.current?.scrollToIndex({ index: cityData.findIndex(c => c.text === cityItem.text) })
                  }, 100)
                  loadDistricts(cityItem.value).then((districtData) => {
                    console.log("加载区县数据", districtData)
                    if (district) {
                      const districtItem = districtData.find(d => d.text === district)
                      if (districtItem) {
                        setSelectedDistrict(districtItem.text)
                        setTimeout(() => {
                          districtListRef.current?.scrollToIndex({ index: districtData.findIndex(d => d.text === districtItem.text) })
                        }, 100)
                      }
                    }
                  })
                }
              }
            })
            
          }
        }
      })
    } else {
      // 关闭时重置状态
      setSelectedProvince('')
      setSelectedCity('')
      setSelectedDistrict('')
      setProvinces([])
      setCities([])
      setDistricts([])
    }
  }, [visible])

  // 渲染省份列表项
  const renderProvinceItem = useCallback(
    ({ item }: { item: RegionOption }) => {
      const isSelected = selectedProvince === item.text
      return (
        <TouchableOpacity
          style={styles.listItem}
          activeOpacity={0.7}
          onPress={() => handleSelectProvince(item)}
        >
          <Text style={[styles.listItemText, isSelected && styles.selectedListItemText]} numberOfLines={2}>{item.text}</Text>
        </TouchableOpacity>
      )
    },
    [selectedProvince],
  )

  // 渲染城市列表项
  const renderCityItem = useCallback(
    ({ item }: { item: RegionOption }) => {
      const isSelected = selectedCity === item.text
      return (
        <TouchableOpacity
          style={styles.listItem}
          activeOpacity={0.7}
          onPress={() => handleSelectCity(item)}
        >
          <Text style={[styles.listItemText, isSelected && styles.selectedListItemText]} numberOfLines={2}>{item.text}</Text>
        </TouchableOpacity>
      )
    },
    [selectedCity],
  )

  // 渲染区县列表项
  const renderDistrictItem = useCallback(
    ({ item }: { item: RegionOption }) => {
      const isSelected = selectedDistrict === item.text
      return (
        <TouchableOpacity
          style={styles.listItem}
          activeOpacity={0.7}
          onPress={() => handleSelectDistrict(item)}
        >
          <Text style={[styles.listItemText, isSelected && styles.selectedListItemText]} numberOfLines={2}>{item.text}</Text>
        </TouchableOpacity>
      )
    },
    [selectedDistrict],
  )

  // 渲染空数据
  const renderEmpty = useCallback(() => {
    return (
      <View style={styles.listEmptyContainer}>
        <Text style={styles.listEmptyText}>暂无数据</Text>
      </View>
    )
  }, [])

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
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
                <FlatList
                  ref={provinceListRef}
                  data={provinces}
                  renderItem={renderProvinceItem}
                  keyExtractor={(item) => item.value}
                  style={styles.list}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.listContentContainer}
                  ListEmptyComponent={renderEmpty}
                  onMomentumScrollEnd={handleScrollEnd(provinceListRef, 'province')}
                  // onScrollEndDrag={handleScrollEnd(provinceListRef, 'province')}
                  getItemLayout={(data, index) => ({
                    length: ITEM_HEIGHT,
                    offset: ITEM_HEIGHT * index,
                    index,
                  })}
                  fadingEdgeLength={10}
                />
              </View>
            </View>

            {/* 城市列表 */}
            <View style={styles.listWrapper}>
              <View style={styles.listContainer}>
                <FlatList
                  ref={cityListRef}
                  data={cities}
                  renderItem={renderCityItem}
                  keyExtractor={(item) => item.value}
                  style={styles.list}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.listContentContainer}
                  ListEmptyComponent={renderEmpty}
                  onMomentumScrollEnd={handleScrollEnd(cityListRef, 'city')}
                  // onScrollEndDrag={handleScrollEnd(cityListRef, 'city')}
                  getItemLayout={(data, index) => ({
                    length: ITEM_HEIGHT,
                    offset: ITEM_HEIGHT * index,
                    index,
                  })}
                  fadingEdgeLength={10}
                />
              </View>
            </View>

            {/* 区县列表 */}
            <View style={styles.listWrapper}>
              <View style={styles.listContainer}>
                <FlatList
                  ref={districtListRef}
                  data={districts}
                  renderItem={renderDistrictItem}
                  keyExtractor={(item) => item.value}
                  style={styles.list}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.listContentContainer}
                  ListEmptyComponent={renderEmpty}
                  onMomentumScrollEnd={handleScrollEnd(districtListRef, 'district')}
                  // onScrollEndDrag={handleScrollEnd(districtListRef, 'district')}
                  getItemLayout={(data, index) => ({
                    length: ITEM_HEIGHT,
                    offset: ITEM_HEIGHT * index,
                    index,
                  })}
                  fadingEdgeLength={20}
                />
              </View>
            </View>
          </View>

          {/* 高亮指示器 */}
          <View style={styles.highlightIndicator} pointerEvents="none" />

          {/* 底部按钮 */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} activeOpacity={0.8} onPress={onClose}>
              <Text style={styles.cancelButtonText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton} activeOpacity={0.8} onPress={handleConfirm}>
              <Text style={styles.confirmButtonText}>确定</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = createStyles({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  container: {
    width: 253.125, // 648 * 750 / 1920
    height: 203.125, // 520 * 750 / 1920
    paddingHorizontal: 10.9375, // 28 * 750 / 1920
    backgroundColor: "#FFFFFF",
    borderRadius: 11.71875, // 30 * 750 / 1920
    gap: 23.0469, // 59 * 750 / 1920
    overflow: "hidden" as const,
  },
  header: {
    // height: 58.59375, // 150 * 750 / 1920
    justifyContent: "center" as const,
    alignItems: "flex-start" as const,
    marginTop: 17.1875, // 44 * 750 / 1920
  },
  title: {
    fontFamily: "PingFang SC",
    fontWeight: "bold" as const,
    fontSize: 12.5, // 32 * 750 / 1920
    color: "#000000",
  },
  listsContainer: {
    // flex: 1, 
    flexDirection: "row" as const,
    width: "100%" as const,
    height: 82.8125, // 212 * 750 / 1920
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
    // borderWidth: 1,
    // borderColor: "green",
  },
  listContentContainer: {
    paddingVertical: 23.8281, // 61
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

