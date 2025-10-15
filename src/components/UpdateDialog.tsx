import { View, Text, TouchableOpacity, Modal } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import { createStyles, rpx } from "../utils/rpxStyleSheet"

interface UpdateDialogProps {
  visible: boolean
  version: string
  description: string
  forceUpdate?: boolean
  onUpdate: () => void
  onCancel?: () => void
}

/**
 * 更新对话框组件
 * 100%还原UniApp项目 /src/components/UpdateDialog.vue
 */
export function UpdateDialog({
  visible,
  version,
  description,
  forceUpdate = false,
  onUpdate,
  onCancel,
}: UpdateDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={forceUpdate ? undefined : onCancel}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <View style={styles.header}>
            <Ionicons name="cloud-download" size={rpx(48)} color="#4891FF" />
            <Text style={styles.title}>发现新版本</Text>
            <Text style={styles.version}>v{version}</Text>
          </View>

          <View style={styles.content}>
            <Text style={styles.descTitle}>更新内容：</Text>
            <Text style={styles.description}>{description}</Text>
          </View>

          <View style={styles.actions}>
            {!forceUpdate && onCancel && (
              <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
                <Text style={styles.cancelBtnText}>稍后更新</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.updateBtn, forceUpdate && styles.updateBtnFull]} onPress={onUpdate}>
              <Text style={styles.updateBtnText}>{forceUpdate ? "立即更新" : "更新"}</Text>
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
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  dialog: {
    width: 300,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
  },
  header: {
    alignItems: "center",
    paddingTop: 32,
    paddingBottom: 16,
    backgroundColor: "#F5F8FF",
  },
  title: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 4,
  },
  version: {
    fontSize: 10,
    color: "#4891FF",
  },
  content: {
    padding: 20,
  },
  descTitle: {
    fontSize: 11,
    color: "#333",
    fontWeight: "bold",
    marginBottom: 8,
  },
  description: {
    fontSize: 10,
    color: "#666",
    lineHeight: 16,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: 11,
    color: "#666",
  },
  updateBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "#4891FF",
    borderRadius: 8,
    alignItems: "center",
  },
  updateBtnFull: {
    flex: 1,
  },
  updateBtnText: {
    fontSize: 11,
    color: "#fff",
    fontWeight: "bold",
  },
})


