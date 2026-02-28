import React, {
  ReactElement,
  ReactNode,
  useImperativeHandle,
  useState,
  forwardRef,
} from 'react';
import {
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import Flex from '../Flex';
import popupStyle from './styles';
import GradientButton from '../GradientButton';

/**
 * 确认弹窗
 * 用于确认用户操作，如删除、退出登录等
 * @param title 弹窗标题
 * @param showClose 是否显示关闭按钮
 * @param ref 弹窗引用
 * @param confirmText 确认按钮文本
 * @param cancelText 取消按钮文本
 * @param onConfirm 确认回调
 * @param onCancel 取消回调
 * @param confirmColors 确认按钮背景渐变颜色
 * @param confirmTextColor 确认按钮字体颜色
 * @param textWeight 按钮字体加粗
 * @param submitBtn 自定义确认按钮
 */

interface PopConfirmProps {
  title?: string | ReactNode;
  children?: ReactNode;
  showClose?: boolean;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => any; //Promise<boolean>
  onCancel?: () => any;
  confirmColors?: [string, string]; // 自定义确认按钮背景渐变颜色
  confirmTextColor?: string; // 自定义确认按钮字体颜色
  textWeight?: TextStyle['fontWeight']; // 按钮字体加粗
  submitBtn?: ReactElement;
  btnWrapStyle?: ViewStyle;
  confirmBtnStyle?: ViewStyle;
  width?: number;
  visible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  coverSafeArea?: boolean;
}

export interface PopConfirmRef {
  open: () => void;
  close: () => void;
}

const PopConfirm = forwardRef<PopConfirmRef, PopConfirmProps>(
  (
    {
      title,
      children,
      showClose = true,
      confirmText = '确定',
      cancelText = '取消',
      onConfirm,
      onCancel,
      confirmColors = ['#333333', '#333333'], // 默认背景颜色
      confirmTextColor = '#FFFFFF', // 默认字体颜色
      textWeight = 'normal',
      btnWrapStyle = {},
      confirmBtnStyle,
      width = 311,
      submitBtn,
      visible,
      onVisibleChange,
      coverSafeArea = true,
    },
    ref,
  ) => {
    const [innerVisible, setInnerVisible] = useState<boolean>(false);

    const isControlled = typeof visible === 'boolean';
    const mergedVisible = isControlled ? (visible as boolean) : innerVisible;

    const setVisible = (next: boolean) => {
      if (!isControlled) {
        setInnerVisible(next);
      }
      onVisibleChange?.(next);
    };

    useImperativeHandle(ref, () => ({
      open: () => setVisible(true),
      close: () => setVisible(false),
    }));

    return (
      <Modal
        visible={mergedVisible}
        transparent
        animationType="fade"
        statusBarTranslucent={coverSafeArea}
        presentationStyle={coverSafeArea ? 'overFullScreen' : undefined}
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modalRoot}>
          {coverSafeArea ? (
            <StatusBar
              translucent
              backgroundColor="transparent"
              barStyle="light-content"
            />
          ) : null}
          <TouchableWithoutFeedback
            onPress={() => {
              setVisible(false);
            }}
          >
            <View style={styles.mask} />
          </TouchableWithoutFeedback>

          <View style={styles.center} pointerEvents="box-none">
            <View style={[styles.card, { width }]}>
              <Flex style={popupStyle.popupContainer}>
                {title !== undefined &&
                  (typeof title === 'string' ? (
                    <Text style={popupStyle.popupTitle}>{title}</Text>
                  ) : (
                    title
                  ))}

                {children}
                <Flex
                  style={[btnWrapStyle, popupStyle.btnContainerWrapper]}
                  justify={'center'}
                  align="center"
                >
                  {showClose && (
                    <GradientButton
                      colors={['transparent', 'transparent']}
                      width={124}
                      height={42}
                      onPress={async () => {
                        onCancel ? await onCancel() : setVisible(false);
                      }}
                      style={[
                        popupStyle.btnContainer,
                        popupStyle.btnContainerClose,
                      ]}
                    >
                      <Text style={popupStyle.btnContainerCloseText}>
                        {cancelText}
                      </Text>
                    </GradientButton>
                  )}

                  {submitBtn ? (
                    submitBtn
                  ) : (
                    <GradientButton
                      colors={confirmColors}
                      width={showClose ? 124 : 160}
                      height={42}
                      onPress={async () => {
                        const result = await onConfirm?.();
                        if (result !== false) {
                          setVisible(false);
                        }
                      }}
                      style={[popupStyle.btnContainer]}
                    >
                      <Text
                        style={[
                          popupStyle.btnContainerConfirmText,
                          {
                            color: confirmTextColor,
                            fontWeight: textWeight,
                            ...confirmBtnStyle,
                          },
                        ]}
                      >
                        {confirmText}
                      </Text>
                    </GradientButton>
                  )}
                </Flex>
              </Flex>
            </View>
          </View>
        </View>
      </Modal>
    );
  },
);

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
  },
  mask: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingTop: 12,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
});

export default PopConfirm;
