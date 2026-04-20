import {
  ReactElement,
  ReactNode,
  useImperativeHandle,
  useState,
  forwardRef,
} from 'react';
import { StyleSheet, Text, type TextStyle, type ViewStyle } from 'react-native';
import { Modal } from '@ant-design/react-native';
import Flex from '../Flex';
import popupStyle from './styles';
import GradientButton from '../GradientButton';
import { px } from '@/utils/ui';

interface PopConfirmProps {
  title?: string | ReactNode;
  children?: ReactNode;
  showClose?: boolean;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => any;
  onCancel?: () => any;
  confirmColors?: [string, string];
  confirmTextColor?: string;
  textWeight?: TextStyle['fontWeight'];
  submitBtn?: ReactElement;
  btnWrapStyle?: ViewStyle;
  confirmBtnStyle?: TextStyle;
  width?: number;
  visible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  maskClosable?: boolean;
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
      confirmColors = ['#333333', '#333333'],
      confirmTextColor = '#FFFFFF',
      textWeight = 'normal',
      btnWrapStyle = {},
      confirmBtnStyle,
      width = px(311),
      submitBtn,
      visible,
      onVisibleChange,
      maskClosable = true,
    },
    ref,
  ) => {
    const [innerVisible, setInnerVisible] = useState(false);

    const isControlled = typeof visible === 'boolean';
    const mergedVisible = isControlled ? visible : innerVisible;

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

    const handleCancel = async () => {
      if (onCancel) {
        await onCancel();
      } else {
        setVisible(false);
      }
    };

    const handleConfirm = async () => {
      setVisible(false);
      requestAnimationFrame(async () => {
        await onConfirm?.();
      });
    };

    return (
      <Modal
        visible={mergedVisible}
        transparent
        maskClosable={maskClosable}
        onClose={() => setVisible(false)}
        footer={[]}
        // modalType="view"
        style={[styles.modalWrap, { width }]}
      >
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
            justify="center"
            align="center"
          >
            {showClose && (
              <GradientButton
                colors={['transparent', 'transparent']}
                width={px(124)}
                height={px(42)}
                onPress={handleCancel}
                style={[popupStyle.btnContainer, popupStyle.btnContainerClose]}
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
                width={showClose ? px(124) : px(160)}
                height={px(42)}
                onPress={handleConfirm}
                style={popupStyle.btnContainer}
              >
                <Text
                  style={[
                    popupStyle.btnContainerConfirmText,
                    {
                      color: confirmTextColor,
                      fontWeight: textWeight,
                    },
                    confirmBtnStyle,
                  ]}
                >
                  {confirmText}
                </Text>
              </GradientButton>
            )}
          </Flex>
        </Flex>
      </Modal>
    );
  },
);

const styles = StyleSheet.create({
  modalWrap: {
    borderRadius: px(16),
    backgroundColor: '#FFFFFF',
    paddingTop: px(24),
    paddingHorizontal: px(12),
    paddingBottom: px(12),
  },
});

export default PopConfirm;
