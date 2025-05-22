import theme from '@style';
import {BottomSheet} from '@rneui/themed';
import React, {useState, ReactNode, useCallback} from 'react';
import {DimensionValue, View} from 'react-native';

export interface ButtomSheetOptions {
  /** 点击外围是否关闭 */
  backDropClose?: boolean;
  /** 从底下向上伸出的高度，如果没有则使用自动高度 */
  height?: DimensionValue;
  /** 上圆角是多少 */
  topBorderRadius?: number;
  animationType?: 'fade' | 'none' | 'slide' | undefined;
  afterHidden?: () => void;
}

export function useBottomSheet(
  modalContent: ReactNode,
  options: ButtomSheetOptions = {},
) {
  const lastVisible = React.useRef(false);
  const [visible, setVisible] = useState<boolean>(false);
  const {backDropClose, height, topBorderRadius, animationType, afterHidden} =
    options;
  const show = useCallback(() => {
    setVisible(true);
  }, []);
  const hide = useCallback(() => {
    setVisible(false);
  }, []);
  const handleBackDrop = () => {
    backDropClose && hide();
  };
  React.useEffect(() => {
    if (lastVisible.current && !visible) {
      afterHidden?.();
    }
    lastVisible.current = visible;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);
  return {
    renderModal: (
      <BottomSheet
        modalProps={{
          animationType: animationType || 'fade',
        }}
        isVisible={visible}
        onBackdropPress={handleBackDrop}>
        <View
          style={[
            theme.padding.l,
            theme.background.mainDark,
            height ? {height: height} : {},
            topBorderRadius
              ? {
                  borderTopLeftRadius: topBorderRadius,
                  borderTopRightRadius: topBorderRadius,
                }
              : {},
          ]}>
          {modalContent}
        </View>
      </BottomSheet>
    ),
    show,
    hide,
  };
}
