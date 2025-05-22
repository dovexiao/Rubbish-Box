import theme from '@style';
import {ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native';
import Text from '@basicComponents/text';
import LazyImage from '@basicComponents/image';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import Drawer from '../drawer';
import {DrawerRef} from '../drawer/drawer';
import globalStore from '@/services/global.state';
import SelectedSvg from '@/components/svgs/basic/selected';
const iconClose = require('@components/assets/icons/close.webp');
const {padding, font, flex, background, margin} = theme;

export interface FilterModalOption {
  title: string;
  value: string;
}

const MAX_HEIGHT = 294;

/**
 * 筛选hooks，通过remderModal渲染该筛选控件，并通过show来进行显示
 * @param filterList 筛选列表
 * @param filterTitle 筛选标题
 * @param requireInit 是否需要默认选择第一个，默认是
 * @returns
 *  @param currentValue 筛选值，涉及查询的根据该值变化进行重新查询
 *  @param renderModal 渲染modal
 *  @param show 通过调用该函数进行展示
 */
export function useFilterModal(
  filterTitle: string,
  filterList: FilterModalOption[] = [],
  requireInit: boolean = true,
) {
  const [currentValue, setCurrentValue] = useState<string>();
  const drawerRef = useRef<DrawerRef>(null);
  const currentTitle = useMemo(() => {
    const _currentItem = filterList.find(item => item.value === currentValue);
    return _currentItem ? _currentItem.title : '';
  }, [currentValue, filterList]);
  const filterStyles = StyleSheet.create({
    container: {
      paddingTop: theme.paddingSize.m * 2,
      paddingHorizontal: theme.paddingSize.m * 2,
      height: filterList.length > 5 ? MAX_HEIGHT : 'auto',
      borderTopLeftRadius: theme.borderRadiusSize.m,
      borderTopRightRadius: theme.borderRadiusSize.m,
      paddingBottom: globalStore.isAndroid
        ? theme.paddingSize.l * 3
        : theme.paddingSize.l,
    },
    title: {
      paddingBottom: theme.paddingSize.m * 2,
    },
  });
  useEffect(() => {
    if (filterList.length > 0) {
      setCurrentValue(requireInit ? filterList[0].value : undefined);
    }
  }, [filterList, requireInit]);

  const handleHide = () => {
    drawerRef.current?.close();
  };
  const handleToggle = (value: string) => {
    setCurrentValue(value);
    handleHide();
  };
  const handleShow = (value?: string) => {
    if (value != null) {
      setCurrentValue(value);
    }
    drawerRef.current?.open();
  };

  const subItemsRender = filterList.map((item, index) => (
    <TouchableOpacity
      activeOpacity={1}
      onPress={() => handleToggle(item.value)}
      key={index}>
      <View
        style={[
          padding.l,
          flex.row,
          flex.between,
          flex.centerByCol,
          currentValue === item.value ? background.lightGrey : {},
        ]}>
        <Text style={[font.second, font.m]}>{item.title}</Text>
        {currentValue === item.value ? (
          <SelectedSvg
            color={theme.basicColor.primary}
            width={theme.iconSize.xs}
            height={theme.iconSize.xs}
          />
        ) : (
          <View />
        )}
      </View>
    </TouchableOpacity>
  ));

  return {
    renderModal: (
      <Drawer ref={drawerRef} mode="bottom" contentBackgroundColor="#0000">
        <View style={[filterStyles.container, theme.background.white]}>
          <View
            style={[
              flex.row,
              flex.between,
              flex.centerByCol,
              filterStyles.title,
            ]}>
            <Text style={[font.bold, font.m, font.main]}>{filterTitle}</Text>
            <TouchableOpacity activeOpacity={1} onPress={handleHide}>
              <LazyImage
                occupancy={'transparent'}
                imageUrl={iconClose}
                width={24}
                height={24}
              />
            </TouchableOpacity>
          </View>
          {filterList.length > 5 ? (
            <ScrollView style={[flex.flex1, flex.col, margin.topl]}>
              {subItemsRender}
            </ScrollView>
          ) : (
            <View>{subItemsRender}</View>
          )}
        </View>
      </Drawer>
    ),
    show: handleShow,
    hide: handleHide,
    currentValue,
    currentTitle,
  };
}
