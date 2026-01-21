import React from 'react';
import { Modal } from '@ant-design/react-native';
import type { ViewStyle } from 'react-native';
import { Text, TouchableOpacity, View } from 'react-native';
import IconFont from '@/iconfont';
import styles from './styles';

export type PopupProps = {
  visible: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children?: React.ReactNode;

  /** 底部按钮区域（可选） */
  footer?: React.ReactNode;

  /** 内容最小高度 */
  minHeight?: number;

  /** 点击遮罩是否关闭 */
  maskClosable?: boolean;

  /** 是否展示右上角关闭按钮 */
  showClose?: boolean;

  /** 外层样式 */
  contentStyle?: ViewStyle;

  /** body 样式 */
  bodyStyle?: ViewStyle;
};

export default function Popup({
  visible,
  onClose,
  title,
  children,
  footer,
  minHeight,
  maskClosable = true,
  showClose = true,
  contentStyle,
  bodyStyle,
}: PopupProps) {
  return (
    <Modal
      visible={visible}
      popup
      animationType="slide-up"
      maskClosable={maskClosable}
      onClose={onClose}
      modalType="portal"
      closable={false}
      style={{
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 20,
        overflow: 'hidden',
      }}
    >
      <View style={[styles.sheet, minHeight ? { minHeight } : null, contentStyle]}>
        {(title !== undefined || showClose) && (
          <View style={styles.header}>
            {/* 左侧占位，保证标题居中 */}

            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              {typeof title === 'string' ? (
                <Text style={styles.title} numberOfLines={1}>
                  {title}
                </Text>
              ) : (
                title ?? null
              )}
            </View>
            {showClose && (
              <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
                <IconFont name="close" size={20} color="#999999" />
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={[styles.body, bodyStyle]}>{children}</View>

        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </View>
    </Modal>
  );
}

