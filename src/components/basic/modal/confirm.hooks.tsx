import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {useModal} from './modal.hooks';
import Text from '../text';
import {useRef, useState} from 'react';
import React from 'react';
import theme from '@style';
import {designToDp} from '@utils';
import {useTranslation} from 'react-i18next';

const {backgroundColor, borderRadiusSize, flex, font, margin, padding} = theme;

export function useConfirm(okText?: string) {
  const {i18n} = useTranslation();
  const [title, setTitle] = useState<string>();
  const [message, setMessage] = useState<string>();
  const confirmFn = useRef<() => void>();

  const handleConfirm = () => {
    confirmFn.current && confirmFn.current();
    hide();
  };

  const handleCancel = () => {
    hide();
  };

  const styles = StyleSheet.create({
    border: {borderColor: backgroundColor.grey, borderTopWidth: 1},
    borderRight: {borderRightWidth: 1},
    btnH: {
      height: designToDp(44),
    },
    viewW: {
      width: designToDp(270),
    },
  });

  const {show, hide, renderModal} = useModal(
    <View style={[flex.col, styles.viewW]}>
      <View style={[flex.col, padding.xxl]}>
        <Text style={[font.bold, font.white, font.l, font.center]}>
          {title}
        </Text>
        <Text style={[font.white, font.m, margin.tbl, font.center]}>
          {message}
        </Text>
      </View>
      <View style={[flex.row, styles.btnH]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleCancel}
          style={[flex.flex1, styles.border, flex.center, styles.borderRight]}>
          <Text style={[font.accent, font.m]}>{i18n.t('label.cancel')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleConfirm}
          style={[flex.flex1, styles.border, flex.center]}>
          <Text style={[{color: backgroundColor.main}, font.m]}>
            {okText || i18n.t('label.confirm')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>,
    {
      overlayStyle: [
        {
          padding: 0,
          borderRadius: borderRadiusSize.m + borderRadiusSize.s,
          backgroundColor: theme.backgroundColor.mainDark,
        },
      ],
    },
  );

  const handleShow = (
    confirmTitle: string,
    confirmMessage: string,
    confirmCallback?: () => void,
  ) => {
    setTitle(confirmTitle);
    setMessage(confirmMessage);
    confirmFn.current = confirmCallback || (() => {});
    show();
  };

  return {
    show: handleShow,
    hide,
    renderModal,
  };
}
