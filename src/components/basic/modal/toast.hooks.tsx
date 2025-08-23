import Text from '@basicComponents/text';
import LazyImage, {ImageUrlType} from '@basicComponents/image';
import {ModalOptions, useModal} from '@basicComponents/modal';
import theme from '@style';
import React, {ReactElement, useCallback, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {designToDp} from '@components/utils';
const {borderRadiusSize, flex, font, margin, padding} = theme;

export enum ToastType {
  success = 'success',
  warning = 'warning',
}

export interface ToastOptions {
  type: ToastType | 'success' | 'warning';
  message?: string;
  tip?: string | ReactElement;
  backgroundColor?: string;
}

const successIcon = require('@components/assets/icons/modal/success.webp');
const warningIcon = require('@components/assets/icons/modal/warning.webp');

const toastIconMap: Record<ToastType, ImageUrlType> = {
  [ToastType.success]: successIcon,
  [ToastType.warning]: warningIcon,
};

const iconSize = 28;

export function useToast(
  options: ModalOptions = {backDropClose: true, delayClose: 2000},
) {
  const {...modalOptions} = options;
  const [toastInfo, setToastInfo] = useState<ToastOptions>({
    type: ToastType.success,
    message: 'ok',
    tip: '',
    backgroundColor: '',
  });

  const {type, message, tip, backgroundColor} = toastInfo;
  const toastIcon = toastIconMap[type];

  const {renderModal, show} = useModal(
    <View style={[flex.col, styles.toast, padding.l, flex.centerByCol]}>
      <View style={[flex.row, flex.center]}>
        <LazyImage
          occupancy={'transparent'}
          imageUrl={toastIcon}
          width={iconSize}
          height={iconSize}
        />
      </View>
      <View style={[flex.col, flex.center, margin.tops]}>
        <Text style={[font.center, font.white, font.l, font.bold]}>
          {message}
        </Text>
        {React.isValidElement(tip)
          ? tip
          : tip && (
              <Text style={[font.center, font.white, font.m, margin.tops]}>
                {tip}
              </Text>
            )}
      </View>
    </View>,
    {
      ...modalOptions,
      overlayStyle: {
        borderRadius: borderRadiusSize.xl,
        backgroundColor: backgroundColor || theme.basicColor.newBgInOne,
      },
    },
  );
  const handleShow = useCallback(
    (showOptions: ToastOptions) => {
      setToastInfo(showOptions);
      show();
    },
    [show],
  );
  return {renderModal, show: handleShow};
}

const styles = StyleSheet.create({
  toast: {
    maxWidth: designToDp(296),
  },
});
