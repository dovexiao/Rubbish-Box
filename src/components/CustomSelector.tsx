import React, { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  Animated,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native"
import { createStyles, rpx } from "../utils/rpxStyleSheet"
import { Ionicons } from "@expo/vector-icons"

interface SelectorOption {
  label: string
  value: string | number
}

interface CustomSelectorProps {
  options: SelectorOption[]
  selectedValue: string | number
  onSelect: (value: string | number) => void
  placeholder?: string
  disabled?: boolean
  style?: any
}

const { width: screenWidth } = Dimensions.get("window")

const CustomSelector: React.FC<CustomSelectorProps> = ({
  options,
  selectedValue,
  onSelect,
  placeholder = "请选择",
  disabled = false,
  style,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState<SelectorOption | null>(null)
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0, width: 0, centerX: 0 })
  const selectorRef = useRef<TouchableOpacity>(null)
  const fadeAnim = useRef(new Animated.Value(0)).current

  // 找到当前选中的选项
  useEffect(() => {
    const option = options.find((opt) => opt.value === selectedValue)
    setSelectedOption(option || null)
  }, [selectedValue, options])

  // 获取下拉菜单位置
  const measureDropdownPosition = () => {
    if (selectorRef.current) {
      selectorRef.current.measure((x, y, width, height, pageX, pageY) => {
        const screenHeight = Dimensions.get("window").height
        const dropdownHeight = 400 // 最大高度400rpx
        const maxY = screenHeight - dropdownHeight - 20 // 留出20rpx边距

        setDropdownPosition({
          x: pageX,
          y: Math.min(pageY + height, maxY),
          width: width,
          centerX: pageX + width / 2, // 计算选择器中心点
        })
      })
    }
  }

  // 打开下拉菜单
  const openDropdown = () => {
    if (disabled) return
    measureDropdownPosition()
    setIsOpen(true)
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start()
  }

  // 关闭下拉菜单
  const closeDropdown = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsOpen(false)
    })
  }

  // 选择选项
  const handleSelect = (option: SelectorOption) => {
    onSelect(option.value)
    closeDropdown()
  }

  return (
    <>
      <TouchableOpacity
        ref={selectorRef}
        style={[styles.selector, style, disabled && styles.disabled]}
        onPress={openDropdown}
        activeOpacity={0.7}
      >
        <View style={createStylesBase.selectorGradient}>
          <Text 
            style={[createStylesBase.selectorText, !selectedOption && styles.placeholderText]}
            numberOfLines={1}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </Text>
          <View style={styles.arrowContainer}>
            <Ionicons
              name={isOpen ? "chevron-down" : "chevron-forward"}
              size={rpx(7.625)}
              color="#8C8D92"
            />
          </View>
        </View>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="none"
        onRequestClose={closeDropdown}
      >
        <TouchableWithoutFeedback onPress={closeDropdown}>
          <View style={styles.modalOverlay}>
            <Animated.View
              style={[
                styles.dropdown,
                {
                  opacity: fadeAnim,
                  left: dropdownPosition.centerX - ((dropdownPosition.width || 240) + 48) / 2, // 居中对齐
                  top: dropdownPosition.y,
                  width: (dropdownPosition.width || 240) + 48, // 左右各增加24rpx
                },
              ]}
            >
              <ScrollView
                style={styles.optionsScroll}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
              >
                {options.map((option, index) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.option,
                      index === options.length - 1 && styles.lastOption,
                      option.value === selectedValue && styles.selectedOption,
                    ]}
                    onPress={() => handleSelect(option)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        option.value === selectedValue && styles.selectedOptionText,
                      ]}
                    >
                      {option.label}
                    </Text>
                    {option.value === selectedValue && <View style={styles.selectedIndicator} />}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  )
}

const createStylesBase = createStyles({
    selectorGradient: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
    selectorText: {
    fontSize: 7.6,
    color: "#8C8D92",
  
  },
})

const styles = StyleSheet.create({
  selector: {
    alignSelf: "flex-start", // 允许容器自适应内容宽度
  },
  // selectorGradient: {
  //   flexDirection: "row",
  //   alignItems: "center",
  //   paddingHorizontal: 12, // 12rpx
  //   paddingVertical: 6, // 6rpx
  //   paddingRight: 12, // 确保右侧有足够padding
  //   backgroundColor: "rgba(255, 255, 255, 0.3)",
  //   borderRadius: 24, // 24rpx
  // },
  // selectorText: {
  //   fontSize: 20, // 20rpx
  //   color: "#8C8D92",
  //   fontWeight: "500",
  //   marginRight: 8, // 8rpx
  // },
  placeholderText: {
    color: "#999999",
  },
  arrowContainer: {
    width: 20, // 再增加宽度
    height: 20, // 设置高度
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0, // 防止箭头容器被压缩
  },
  disabled: {
    opacity: 0.6,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
  },
  dropdown: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 12, // 12rpx
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4, // 4rpx
    },
    shadowOpacity: 0.1,
    shadowRadius: 8, // 8rpx
    elevation: 4,
    minWidth: 160, // 160rpx
    maxHeight: 400, // 400rpx - 限制最大高度
    zIndex: 1000,
    overflow: "hidden", // 确保内容不会溢出
  },
  optionsScroll: {
    maxHeight: 380, // 380rpx - 给滚动区域留出边距
  },
  option: {
    paddingHorizontal: 16, // 16rpx
    paddingVertical: 12, // 12rpx
    borderBottomWidth: 1, // 1rpx
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  selectedOption: {
    backgroundColor: "rgba(72, 145, 255, 0.1)",
  },
  optionText: {
    fontSize: 20, // 20rpx
    color: "#333333",
    flex: 1,
  },
  selectedOptionText: {
    color: "#4891FF",
    fontWeight: "600",
  },
  selectedIndicator: {
    width: 4, // 4rpx
    height: 20, // 20rpx
    backgroundColor: "#4891FF",
    borderRadius: 2, // 2rpx
    marginLeft: 12, // 12rpx
  },
})

export default CustomSelector
