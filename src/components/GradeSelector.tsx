import { useState, useEffect } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native"

import { createStyles } from "../utils/rpxStyleSheet"
import { getHighSchoolVolumeList } from "../services/classroom"

/**
 * 学制类型
 */
type EducationalSystem = "六三" | "五四"

/**
 * 学段类型
 */
type GradeStage = "小学" | "初中" | "高中"

/**
 * 学期类型（高中可能有：第五册、下册、必修、选修等）
 */
type Semester = string

/**
 * 选中的年级信息
 */
export interface GradeSelection {
  educationalSystem: EducationalSystem
  gradeStage: GradeStage
  grade: string
  semester: Semester
}

interface Props {
  visible: boolean
  onClose: () => void
  currentSelection: GradeSelection
  onConfirm: (selection: GradeSelection) => void
}

/**
 * 年级选择弹窗
 * 100% 还原UI设计
 */
export function GradeSelector({ visible, onClose, currentSelection, onConfirm }: Props) {
  const [tempSelection, setTempSelection] = useState<GradeSelection>(currentSelection)
  const [highSchoolSemesters, setHighSchoolSemesters] = useState<string[]>(["上册", "下册"]) // 高中学期列表（动态获取）

  // 当弹窗打开时，同步 currentSelection 到 tempSelection
  useEffect(() => {
    if (visible) {
      console.log("📚 弹窗打开，同步 currentSelection:", currentSelection)
      setTempSelection(currentSelection)
    }
  }, [visible, currentSelection])

  // 根据学制和学段获取年级列表
  const getGradeOptions = (
    system: EducationalSystem,
    stage: GradeStage,
  ): string[] => {
    if (stage === "小学") {
      // 小学：1-6年级
   
        if (system === "六三") {
        // 六三学制初中：初一~初三
             return ["一年级", "二年级", "三年级", "四年级", "五年级", "六年级"]
      } else {
        // 五四学制初中：初一~初四
            return ["一年级", "二年级", "三年级", "四年级", "五年级"]
      }
    } else if (stage === "初中") {
      if (system === "六三") {
        // 六三学制初中：初一~初三
        return ["初一", "初二", "初三"]
      } else {
        // 五四学制初中：初一~初四
        return ["初一", "初二", "初三", "初四"]
      }
    } else if (stage === "高中") {
      // 高中：高一~高三
      return ["高一", "高二", "高三"]
    } else {
      return []
    }
  }

  const handleClose = () => {
    // 点击蒙板时，应用当前选择并关闭
    onConfirm(tempSelection)
    onClose()
  }

  const currentGradeOptions = getGradeOptions(
    tempSelection.educationalSystem,
    tempSelection.gradeStage,
  )

  // 监听高中年级变化，动态获取学期列表
  useEffect(() => {
    const fetchHighSchoolSemesters = async () => {
      if (tempSelection.gradeStage === "高中" && tempSelection.grade) {
        try {
          console.log("📚 获取高中学期列表:", {
            grade: tempSelection.grade,
            educational_system: tempSelection.educationalSystem,
          })
          const semesters = await getHighSchoolVolumeList({
            grade: tempSelection.grade,
            educational_system: tempSelection.educationalSystem,
          })
          console.log("✅ 高中学期列表:", semesters)
          setHighSchoolSemesters(semesters)
          
          // 如果当前选择的学期不在列表中，自动选择第一个
          if (semesters.length > 0 && !semesters.includes(tempSelection.semester)) {
            setTempSelection(prev => ({
              ...prev,
              semester: semesters[0] as Semester,
            }))
          }
        } catch (error) {
          console.error("❌ 获取高中学期列表失败:", error)
          // 失败时使用默认值
          setHighSchoolSemesters(["上册", "下册"])
        }
      } else {
        // 非高中，使用默认的上下册
        setHighSchoolSemesters(["上册", "下册"])
      }
    }

    fetchHighSchoolSemesters()
  }, [tempSelection.gradeStage, tempSelection.grade, tempSelection.educationalSystem])

  // 获取学期列表（根据学段动态返回）
  const getSemesterOptions = (): Semester[] => {
    if (tempSelection.gradeStage === "高中") {
      return highSchoolSemesters as Semester[]
    }
    return ["上册", "下册"]
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.modalBackground}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                {/* 第一行：学制选择 */}
                <View style={styles.systemRow}>
                <TouchableOpacity
                  style={[
                    styles.systemButton,
                    tempSelection.educationalSystem === "六三" &&
                      styles.systemButtonActive,
                  ]}
                  onPress={() =>
                    setTempSelection({ ...tempSelection, educationalSystem: "六三" })
                  }
                >
                  <Text
                    style={[
                      styles.systemButtonText,
                      tempSelection.educationalSystem === "六三" &&
                        styles.systemButtonTextActive,
                    ]}
                  >
                    六三学制
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.systemButton,
                    tempSelection.educationalSystem === "五四" &&
                      styles.systemButtonActive,
                  ]}
                  onPress={() =>
                    setTempSelection({ ...tempSelection, educationalSystem: "五四" })
                  }
                >
                  <Text
                    style={[
                      styles.systemButtonText,
                      tempSelection.educationalSystem === "五四" &&
                        styles.systemButtonTextActive,
                    ]}
                  >
                    五四学制
                  </Text>
                </TouchableOpacity>
              </View>

              {/* 第二行：学段、年级、学期三列 */}
              <View style={styles.mainRow}>
                {/* 左列：学段 */}
                <ScrollView
                  style={styles.column}
                  showsVerticalScrollIndicator={false}
                >
                    {(["小学", "初中", "高中"] as GradeStage[]).map((stage) => (
                      <TouchableOpacity
                        key={stage}
                        style={[
                          styles.columnItem,
                          tempSelection.gradeStage === stage && styles.columnItemActive,
                        ]}
                        onPress={() => {
                          const newGrade = getGradeOptions(tempSelection.educationalSystem, stage)[0] || "一年级"
                          setTempSelection({
                            ...tempSelection,
                            gradeStage: stage,
                            grade: newGrade,
                            // 切换学段时，重置学期为"上册"（高中会在 useEffect 中自动更新）
                            semester: "上册",
                          })
                        }}
                      >
                        {tempSelection.gradeStage === stage && (
                          <View style={styles.activeIndicator} />
                        )}
                        <Text
                          style={[
                            styles.columnItemText,
                            tempSelection.gradeStage === stage &&
                              styles.columnItemTextActive,
                          ]}
                        >
                          {stage}
                        </Text>
                      </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* 中间列：年级 */}
                <ScrollView
                  style={styles.column}
                  showsVerticalScrollIndicator={false}
                >
                  {currentGradeOptions.map((grade) => (
                    <TouchableOpacity
                      key={grade}
                      style={[
                        styles.columnItem,
                        tempSelection.grade === grade && styles.columnItemActive,
                      ]}
                      onPress={() =>
                        setTempSelection({
                          ...tempSelection,
                          grade,
                        })
                      }
                    >
                      {tempSelection.grade === grade && (
                        <View style={styles.activeIndicator} />
                      )}
                      <Text
                        style={[
                          styles.columnItemText,
                          tempSelection.grade === grade &&
                            styles.columnItemTextActive,
                        ]}
                      >
                        {grade}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* 右列：学期 */}
                <ScrollView
                  style={styles.column}
                  showsVerticalScrollIndicator={false}
                >
                  {getSemesterOptions().map((semester) => (
                    <TouchableOpacity
                      key={semester}
                      style={[
                        styles.columnItem,
                        tempSelection.semester === semester && styles.columnItemActive,
                      ]}
                      onPress={() =>
                        setTempSelection({
                          ...tempSelection,
                          semester,
                        })
                      }
                    >
                      {tempSelection.semester === semester && (
                        <View style={styles.activeIndicator} />
                      )}
                      <Text
                        style={[
                          styles.columnItemText,
                          tempSelection.semester === semester &&
                            styles.columnItemTextActive,
                        ]}
                      >
                        {semester}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )
}

const styles = createStyles({
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.01)", // 全屏透明蒙板
    justifyContent: "flex-start" as const,
    alignItems: "flex-end" as const,
  },
  modalOverlay: {
    width: 269.53125,
    height: 208,
    borderRadius: 16,
    backgroundColor: '#F3EFEF66',
    marginRight: 20,
    marginTop: 88,
    overflow: "hidden" as const,
  },
  modalContent: {
    flex: 1,
  },
  // 第一行：学制选择
  systemRow: {
    flexDirection: "row" as const,
    // paddingHorizontal: 6,
  },
  systemButton: {
   width: '50%',
    paddingVertical: 8,
    backgroundColor: "#D5E3FF",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  systemButtonActive: {
    backgroundColor: "#9EC9FF",
  },
  systemButtonText: {
    fontSize: 10.9375,
    color: "#ADADAD",
    fontWeight: "bold" as const,
  },
  systemButtonTextActive: {
    color: "#2454FF",
  },
  // 第二行：三列
  mainRow: {
    flexDirection: "row" as const,

  
  },
  column: {
    height: 178,
      backgroundColor: '#FFFFFF',
        
    // paddingVertical: 8,
  },
  columnItem: {
    paddingVertical: 8,
    paddingHorizontal: 6,
    position: "relative" as const,
    alignItems: "center" as const,
  },
  columnItemActive: {
    // backgroundColor: "#F0F6FF",
  },
  activeIndicator: {
    position: "absolute" as const,
    left: 10,
      top: "60%" as any,
    width: 3,
    height: 14,
    backgroundColor: "#4891FF",
    borderRadius: 3,
  },
  columnItemText: {
    fontSize: 8.6,
    color: "#666",
  },
  columnItemTextActive: {
    color: "#4891FF",
    fontWeight: "bold" as const,
  },
})
