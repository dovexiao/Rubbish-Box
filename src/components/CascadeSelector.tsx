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
import { Ionicons } from "@expo/vector-icons"
import { rpx } from "../utils/rpxStyleSheet"

interface CascadeOption {
  label: string
  value: string
  children?: CascadeOption[]
}

interface CascadeSelectorProps {
  options: CascadeOption[]
  selectedValues: string[]
  onSelect: (values: string[], labels: string[]) => void
  onLoadChildren?: (parentValue: string, level: number) => Promise<CascadeOption[]>
  placeholder?: string
  disabled?: boolean
  style?: any
  title?: string
}

const { width: screenWidth } = Dimensions.get("window")

const CascadeSelector: React.FC<CascadeSelectorProps> = ({
  options,
  selectedValues,
  onSelect,
  onLoadChildren,
  placeholder = "请选择",
  disabled = false,
  style,
  title = "请选择",
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [currentLevel, setCurrentLevel] = useState(0)
  const [currentOptions, setCurrentOptions] = useState<CascadeOption[]>(options)
  const [tempValues, setTempValues] = useState<string[]>(selectedValues)
  const [tempLabels, setTempLabels] = useState<string[]>([])
  const selectorRef = useRef<View>(null)
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(0)).current

  // 初始化临时标签
  useEffect(() => {
    const labels: string[] = []
    let currentOpts = options
    
    for (let i = 0; i < selectedValues.length; i++) {
      const option = currentOpts.find(opt => opt.value === selectedValues[i])
      if (option) {
        labels.push(option.label)
        currentOpts = option.children || []
      } else {
        break
      }
    }
    setTempLabels(labels)
  }, [selectedValues, options])

  // 获取下拉菜单位置
  const measureDropdownPosition = () => {
    if (selectorRef.current) {
      selectorRef.current.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
        const screenHeight = Dimensions.get("window").height
        const dropdownHeight = 400
        const maxY = screenHeight - dropdownHeight - 20

        // 这里可以设置位置，但三级联动选择器通常使用全屏模态
      })
    }
  }

  // 打开选择器
  const openSelector = () => {
    if (disabled) return
    measureDropdownPosition()
    setIsOpen(true)
    setCurrentLevel(0)
    setCurrentOptions(options)
    setTempValues(selectedValues)
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start()
  }

  // 关闭选择器
  const closeSelector = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsOpen(false)
    })
  }

  // 选择选项
  const handleSelect = async (option: CascadeOption, level: number) => {
    const newValues = [...tempValues]
    const newLabels = [...tempLabels]
    
    // 更新当前级别的值
    newValues[level] = option.value
    newLabels[level] = option.label
    
    // 清除后续级别的值
    for (let i = level + 1; i < newValues.length; i++) {
      newValues[i] = ""
      newLabels[i] = ""
    }
    
    setTempValues(newValues)
    setTempLabels(newLabels)

    // 如果有下一级，进入下一级
    if (option.children && option.children.length > 0) {
      setCurrentLevel(level + 1)
      setCurrentOptions(option.children)
    } else if (onLoadChildren) {
      // 如果没有子级数据但有懒加载回调，尝试加载子级数据
      try {
        const children = await onLoadChildren(option.value, level)
        if (children && children.length > 0) {
          // 更新选项的子级数据
          option.children = children
          setCurrentLevel(level + 1)
          setCurrentOptions(children)
        }
      } catch (error) {
        console.error("加载子级数据失败:", error)
      }
    }
  }

  // 返回上一级
  const goBack = () => {
    if (currentLevel > 0) {
      setCurrentLevel(currentLevel - 1)
      // 重新计算当前级别的选项
      let currentOpts = options
      for (let i = 0; i < currentLevel - 1; i++) {
        const option = currentOpts.find(opt => opt.value === tempValues[i])
        if (option && option.children) {
          currentOpts = option.children
        }
      }
      setCurrentOptions(currentOpts)
    }
  }

  // 确认选择 - 只有选择完最后一级才能确认
  const confirmSelection = () => {
    const finalValues = tempValues.filter(v => v !== "")
    const finalLabels = tempLabels.filter(l => l !== "")
    
    // 检查是否选择了最后一级
    if (finalValues.length === 0) {
      return // 没有选择任何项
    }
    
    // 检查最后选择的选项是否有子级
    let currentOpts = options
    let lastOption = null
    
    for (let i = 0; i < finalValues.length; i++) {
      const option = currentOpts.find(opt => opt.value === finalValues[i])
      if (option) {
        lastOption = option
        if (option.children) {
          currentOpts = option.children
        }
      }
    }
    
    // 如果最后选择的选项没有子级，或者子级为空，则可以确认
    if (!lastOption || !lastOption.children || lastOption.children.length === 0) {
      onSelect(finalValues, finalLabels)
      closeSelector()
    }
  }

  // 检查是否可以确认（是否选择了最后一级）
  const canConfirm = () => {
    const finalValues = tempValues.filter(v => v !== "")
    if (finalValues.length === 0) return false
    
    // 检查最后选择的选项是否有子级
    let currentOpts = options
    let lastOption = null
    
    for (let i = 0; i < finalValues.length; i++) {
      const option = currentOpts.find(opt => opt.value === finalValues[i])
      if (option) {
        lastOption = option
        if (option.children) {
          currentOpts = option.children
        }
      }
    }
    
    // 如果最后选择的选项没有子级，或者子级为空，则可以确认
    return !lastOption || !lastOption.children || lastOption.children.length === 0
  }

  // 获取显示文本
  const getDisplayText = () => {
    if (tempLabels.length === 0) return placeholder
    const text = tempLabels.join(" - ")
    // 现在文本区域最大化，可以显示更多内容
    if (text.length > 35) {
      return text.substring(0, 32) + "..."
    }
    return text
  }

  return (
    <>
      <TouchableOpacity
        ref={selectorRef}
        style={[styles.selector, style, disabled && styles.disabled]}
        onPress={openSelector}
        activeOpacity={0.7}
      >
        <View style={styles.selectorGradient}>
          <Text style={[styles.selectorText, tempLabels.length === 0 && styles.placeholderText]}>
            {getDisplayText()}
          </Text>
          <View style={styles.arrowContainer}>
            <Ionicons
              name={isOpen ? "chevron-down" : "chevron-forward"}
              size={rpx(10.625)}
              color="#8C8D92"
            />
          </View>
        </View>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="none"
        onRequestClose={closeSelector}
      >
        <TouchableWithoutFeedback onPress={closeSelector}>
          <View style={styles.modalOverlay}>
            <Animated.View
              style={[
                styles.modalContent,
                {
                  opacity: fadeAnim,
                  transform: [
                    {
                      translateY: slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [300, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              {/* 标题栏 */}
              <View style={styles.header}>
                <TouchableOpacity onPress={closeSelector} style={styles.headerButton}>
                  <Text style={styles.headerButtonText}>取消</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{title}</Text>
                <TouchableOpacity 
                  onPress={confirmSelection} 
                  style={[styles.headerButton, !canConfirm() && styles.disabledButton]}
                  disabled={!canConfirm()}
                >
                  <Text style={[
                    styles.headerButtonText, 
                    canConfirm() ? styles.confirmButton : styles.disabledButtonText
                  ]}>
                    确定
                  </Text>
                </TouchableOpacity>
              </View>

              {/* 面包屑导航 */}
              <View style={styles.breadcrumb}>
                {tempLabels.map((label, index) => (
                  <View key={index} style={styles.breadcrumbItem}>
                    <TouchableOpacity
                      onPress={() => {
                        setCurrentLevel(index)
                        // 重新计算选项
                        let currentOpts = options
                        for (let i = 0; i < index; i++) {
                          const option = currentOpts.find(opt => opt.value === tempValues[i])
                          if (option && option.children) {
                            currentOpts = option.children
                          }
                        }
                        setCurrentOptions(currentOpts)
                      }}
                      style={styles.breadcrumbButton}
                    >
                      <Text style={styles.breadcrumbText}>{label}</Text>
                    </TouchableOpacity>
                    {index < tempLabels.length - 1 && (
                      <Ionicons name="chevron-forward" size={12} color="#999" />
                    )}
                  </View>
                ))}
              </View>

              {/* 选项列表 */}
              <ScrollView style={styles.optionsContainer} showsVerticalScrollIndicator={false}>
                {currentOptions.map((option, index) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.option,
                      index === currentOptions.length - 1 && styles.lastOption,
                      tempValues[currentLevel] === option.value && styles.selectedOption,
                    ]}
                    onPress={() => handleSelect(option, currentLevel)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        tempValues[currentLevel] === option.value && styles.selectedOptionText,
                      ]}
                    >
                      {option.label}
                    </Text>
                    {option.children && option.children.length > 0 && (
                      <Ionicons name="chevron-forward" size={16} color="#999" />
                    )}
                    {tempValues[currentLevel] === option.value && (
                      <View style={styles.selectedIndicator} />
                    )}
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

const styles = StyleSheet.create({
  selector: {
    borderRadius: 24,
    overflow: "hidden",
    alignSelf: "stretch", // 改为stretch，让它占满父容器宽度
    width: "100%", // 明确设置宽度为100%
  },
  selectorGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8, // 减少左右padding
    paddingVertical: 6,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 24,
  },
  selectorText: {
    fontSize: 14,
    color: "#8C8D92",
    fontWeight: "500",
    marginRight: 4, // 减少右边距
    flex: 1,
    textAlign: "left",
  },
  placeholderText: {
    color: "#999999",
  },
  arrowContainer: {
    width: 12, // 减少箭头容器宽度
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: {
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
    minHeight: 400,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  headerButtonText: {
    fontSize: 16,
    color: "#666",
  },
  confirmButton: {
    color: "#1571fc",
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledButtonText: {
    color: "#999",
    fontWeight: "normal",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  breadcrumb: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#f8f9fa",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  breadcrumbItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  breadcrumbButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: "#e9ecef",
  },
  breadcrumbText: {
    fontSize: 14,
    color: "#495057",
  },
  optionsContainer: {
    flex: 1,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  selectedOption: {
    backgroundColor: "rgba(21, 113, 252, 0.1)",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  selectedOptionText: {
    color: "#1571fc",
    fontWeight: "600",
  },
  selectedIndicator: {
    width: 4,
    height: 20,
    backgroundColor: "#1571fc",
    borderRadius: 2,
    marginLeft: 10,
  },
})

export default CascadeSelector
