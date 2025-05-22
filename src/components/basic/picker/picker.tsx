import theme from '@/style';
import React from 'react';
import {FlatList, View, Image} from 'react-native';
import Text from '../text';
import {NativeTouchableOpacity} from '../touchable-opacity';
import {BottomSheet, Input} from '@rneui/themed';
import {BasicObject} from '@/types';
import globalStore from '@/services/global.state';
import {debounce} from '@/utils';
import NoResult from '../error-pages/no-result';
import {useTranslation} from 'react-i18next';

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
  /** 每一项的高度,默认48,当传入titleRender时,要传入这个值 */
  itemHeight?: number;
  open: boolean;
  setOpen: (open: boolean) => void;
  /** 是否禁止用户关闭,若传入,点击背景不会关闭,以及 */
  disableUserClose?: boolean;
  value?: R;
  onValueChange?: (value: R) => void;
}

const inputStyle = {
  padding: 0,
  ...theme.font.main,
  ...theme.font.m,
} as BasicObject;
export const inputProps = {
  containerStyle: {
    paddingHorizontal: theme.paddingSize.s,
    ...theme.border.secAccent,
    ...theme.borderRadius.m,
  },
  inputContainerStyle: {
    borderBottomWidth: 0,
    height: 32,
  },
  inputStyle: globalStore.isWeb
    ? {...inputStyle, outline: 'none', caretColor: theme.basicColor.primary}
    : inputStyle,
  errorStyle: {
    margin: 0,
    height: 0,
  },
  placeholderTextColor: theme.fontColor.secAccent,
};

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
  itemHeight = 48,
  open,
  setOpen,
  value,
  onValueChange,
  disableUserClose = false,
}: PickerProps<T, R>) => {
  const {i18n} = useTranslation();
  const [keyWord, setKeyWord] = React.useState('');
  const [finalList, setFinalList] = React.useState<T[]>(list);
  const onSearch = (v: string) => {
    setKeyWord(() => v);
  };
  const filterList = debounce((key: string) => {
    setFinalList(
      list.filter(
        _v =>
          (_v as BasicObject)[labelKey]
            .toLocaleLowerCase()
            .indexOf(key.toLocaleLowerCase()) > -1,
      ),
    );
  });
  React.useEffect(() => {
    filterList(keyWord);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyWord]);
  React.useEffect(() => {
    if (!open) {
      setKeyWord('');
      filterList('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
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
            {
              borderTopRightRadius: theme.borderRadiusSize.m,
              borderTopLeftRadius: theme.borderRadiusSize.m,
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
          {list.length > 10 && (
            <View
              style={[
                theme.flex.row,
                theme.flex.centerByCol,
                theme.padding.lrl,
                theme.margin.topl,
              ]}>
              <Input
                {...inputProps}
                value={keyWord}
                placeholder={i18n.t('label.search')}
                onChangeText={onSearch}
              />
              {!!keyWord && (
                <NativeTouchableOpacity onPress={() => setKeyWord('')}>
                  <Image
                    style={[theme.icon.xs, theme.margin.lrl]}
                    source={require('@components/assets/icons/close.webp')}
                  />
                </NativeTouchableOpacity>
              )}
            </View>
          )}
          <View style={theme.margin.topl} />
          {/*
          这里会导致控制台出现警告
          VirtualizedLists should never be nested inside plain ScrollViews with the same orientation because it can break windowing and other functionality - use another VirtualizedList-backed container instead.
          可以忽略
          */}
          {finalList.length > 0 ? (
            <FlatList
              style={[
                {
                  maxHeight: itemHeight * 6,
                },
                theme.padding.lrl,
              ]}
              onStartReachedThreshold={16}
              data={finalList}
              renderItem={({item, index}) => {
                const data = item as BasicObject;
                return (
                  <NativeTouchableOpacity
                    key={index}
                    style={[
                      theme.flex.row,
                      theme.flex.centerByCol,
                      theme.padding.tbl,
                      {
                        height: theme.paddingSize.l * 4,
                      },
                    ]}
                    onPress={() =>
                      onValueChange && onValueChange(data[valueKey])
                    }>
                    <View style={[theme.flex.flex1]}>
                      {itemRender ? (
                        itemRender(item, index)
                      ) : (
                        <Text main size="medium">
                          {data[labelKey]}
                        </Text>
                      )}
                    </View>
                    {value === data[valueKey] && (
                      <Image
                        style={[theme.icon.xs, theme.margin.leftl]}
                        source={require('@assets/icons/selected.webp')}
                      />
                    )}
                  </NativeTouchableOpacity>
                );
              }}
            />
          ) : (
            <View style={[theme.padding.btmxxl]}>
              <NoResult />
            </View>
          )}
        </View>
      </BottomSheet>
    </NativeTouchableOpacity>
  );
};

export default Picker;
