import theme from '@style';
import {Overlay} from '@rneui/themed';
import React, {useState, ReactNode, useCallback, useRef} from 'react';
import {StyleProp, ViewStyle} from 'react-native';

const {padding} = theme;

export interface ModalOptions {
  // 为0时不会主动关闭，否则延迟多久关闭
  delayClose?: number;
  // 点击外围是否关闭
  backDropClose?: boolean;
  overlayStyle?: StyleProp<ViewStyle>;
  // 点击外围关闭事件，覆盖时使用
  onBackDropClose?: () => void;
}

export function useModal(modalContent: ReactNode, options: ModalOptions = {}) {
  const [visible, setVisible] = useState<boolean>(false);
  const {
    delayClose = 0,
    overlayStyle,
    backDropClose,
    onBackDropClose: backDropCloseFn,
  } = options;
  const timeout = useRef<NodeJS.Timeout>();
  const show = useCallback(() => {
    setVisible(true);
    if (delayClose <= 0) {
      return;
    }
    timeout.current = setTimeout(() => {
      setVisible(false);
    }, delayClose);
  }, [delayClose]);
  const hide = useCallback(() => {
    setVisible(false);
    if (timeout.current) {
      clearTimeout(timeout.current);
      timeout.current = undefined;
    }
  }, []);
  const handleBackDrop = () => {
    if (backDropClose) {
      backDropCloseFn ? backDropCloseFn() : hide();
    }
  };
  return {
    renderModal: (
      <Overlay
        isVisible={visible}
        animationType="fade"
        overlayStyle={[padding.l, overlayStyle]}
        onBackdropPress={handleBackDrop}>
        {modalContent}
      </Overlay>
    ),
    show,
    hide,
  };
}
