/* eslint-disable @typescript-eslint/no-unused-vars */
import theme from '@/style';
import React from 'react';
import {FlatList, View, Image} from 'react-native';
import Text from '../text';
import {NativeTouchableOpacity} from '../touchable-opacity';
import {BottomSheet, Input} from '@rneui/themed';
import {BasicObject} from '@/types';
import globalStore from '@/services/global.state';
import {debounce} from '@/utils';

export interface PickerProps<T, R> {
  disabled?: boolean;
  title?: string;
  titleRender?: React.JSX.Element;
  /** 打开的抽屉title */
  sheetHeaderTitle?: string;
  /** 自定义打开的抽屉title */
  sheetHeaderTitleRender?: React.JSX.Element;
  list: T[];
  itemRender?: (item: T, index: number) => React.JSX.Element;
  /** 默认取value */
  valueKey?: string;
  /** 默认取label */
  labelKey?: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  /** 是否禁止用户关闭,若传入,点击背景不会关闭,以及 */
  disableUserClose?: boolean;
  value?: R;
  onValueChange?: (value: R) => void;
}
/**
 * @deprecated
 * 暂存的,不要用
 */
const Picker = <T, R>({
  title = 'Please Choese',
  disabled = false,
  titleRender,
  sheetHeaderTitle = 'Please Choese',
  sheetHeaderTitleRender,
  list,
  itemRender,
  labelKey = 'label',
  valueKey = 'value',
  open,
  setOpen,
  value,
  onValueChange,
  disableUserClose = false,
}: PickerProps<T, R>) => {
  return (
    <NativeTouchableOpacity
      style={theme.flex.col}
      onPress={() => !disabled && setOpen(true)}>
      {titleRender ? (
        titleRender
      ) : (
        <View style={[theme.padding.l]}>
          <Text main>{title}</Text>
        </View>
      )}
      <BottomSheet
        modalProps={{animationType: 'fade'}}
        onBackdropPress={() => !disableUserClose && setOpen(false)}
        isVisible={open}>
        <View
          style={[
            theme.background.white,
            theme.flex.col,
            theme.borderRadius.m,
            // eslint-disable-next-line react-native/no-inline-styles
            {
              borderBottomRightRadius: 0,
              borderBottomLeftRadius: 0,
            },
          ]}>
          <View
            style={[
              theme.flex.row,
              theme.flex.centerByCol,
              {
                height: theme.paddingSize.l * 3,
              },
              theme.padding.lrl,
              theme.padding.topl,
            ]}>
            <View style={theme.flex.flex1}>
              {sheetHeaderTitleRender || (
                <View>
                  <Text main size="medium" blod>
                    {sheetHeaderTitle}
                  </Text>
                </View>
              )}
            </View>
            {!disableUserClose && (
              <NativeTouchableOpacity onPress={() => setOpen(false)}>
                <Image
                  style={[theme.icon.m]}
                  source={require('@components/assets/icons/close.webp')}
                />
              </NativeTouchableOpacity>
            )}
          </View>
        </View>
      </BottomSheet>
    </NativeTouchableOpacity>
  );
};

export default Picker;
