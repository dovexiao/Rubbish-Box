import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Image, TouchableOpacity, View, Text, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/core';
import PageContainer from '@/components/PageContainer';
import PopConfirm from '@/components/popConfirm';
import AppIcon from '@/components/AppIcon';
import { baseInfo, logout, getOrderStat } from '@/services/user';
import { updateRegId } from '@/services/common';
import { getStorage, setStorage } from '@/utils';
import { cacheGetSync, cacheRemove, cacheSetSync } from '@/utils/cache';
import { tokenStorage } from '@/utils/storage';
import styles from './styles';
import { useTheme } from '@/context/ThemeContext';
import { reLaunch, showToast } from '@/utils';
import { px } from '@/utils/ui';

export default function NetWorkMiddles() {
  const navigation = useNavigation<any>();

  const listItems = useMemo(
    () => [
      {
        label: '433网关组合',
        onPress: () => {
          navigation.navigate('AddNetWork');
        },
      },
      {
        label: '普通组合',
        onPress: () => {
          navigation.navigate('CombineDevice');
        },
      },
    ],
    [navigation],
  );

  return (
    <PageContainer
      backgroundColor="#FFFFFF"
      statusBarBackgroundColor={'transparent'}
      scrollable={false}
      safeAreaEdges={['top']}
      pageNavProps={{
        text: '新增组合设备',
        showBack: true,
        background: '#FFFFFF',
      }}
      navBorder
    >
      <View style={styles.contentBox}>
        <Text style={styles.contentBoxItemTitle}>选择组合类型</Text>
        <View style={styles.contentBoxList}>
          {listItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.contentBoxItem}
              onPress={item.onPress}
            >
              <Text style={styles.contentBoxItemTitle}>{item.label}</Text>
              <AppIcon name="a-nextpage" size={px(20)} color="#333333" />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </PageContainer>
  );
}
