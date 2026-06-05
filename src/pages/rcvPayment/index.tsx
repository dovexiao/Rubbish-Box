import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Text, TouchableOpacity, View, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PageContainer, Flex } from '@/components/index';
import styles from './styles';
import { fontSize, px } from '@/utils/ui';
import AppIcon from '@/components/AppIcon';
import { getOrderStat } from '@/services/user';
import { useFocusEffect } from '@react-navigation/core';

export default function RcvPayment() {
  const navigation = useNavigation<any>();
  const [detail, setDetail] = useState<any>(null);
  const menuList: {
    title: string;
    text: string;
    onPress: () => void;
  }[] = [
    {
      title: '设备收费规则',
      text: '去设置',
      onPress: () => navigation.navigate('RcvPaymentRule'),
    },
    {
      title: '设备列表',
      text: '去查看',
      onPress: () =>
        navigation.navigate('MyDevice', {
          fromRcvPayment: true,
          isOpen: true,
        }),
    },
    {
      title: '换绑银行卡',
      text: '去更换',
      onPress: () =>
        navigation.navigate('RcvPaymentChangeBank', {
          cardType: detail?.cardType,
          regName: detail?.regName,
          changeBankStatus: detail?.changeBankStatus,
          failReason: detail?.failReason,
        }),
    },
  ];

  const loadData = useCallback(async () => {
    const orderStatRes = await getOrderStat({});
    if (orderStatRes.code === 200 && orderStatRes.success) {
      setDetail(orderStatRes.data);
      console.log('orderStatRes.data', orderStatRes.data);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  useEffect(() => {}, []);

  return (
    <PageContainer
      backgroundColor="#FFFFFF"
      statusBarStyle="dark-content"
      statusBarBackgroundColor="#FFFFFF"
      safeAreaEdges={['top', 'bottom']}
      scrollable={false}
      loadingType="content"
      pageNavProps={{
        text: '收款设置',
        showBack: true,
        background: '#FFFFFF',
      }}
      loading={!detail}
    >
      {detail ? (
        <View style={styles.container}>
          {/* <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate('BalanceWallet')}
          >
            <View style={styles['row-left']}>
              <Text style={styles['row-left_text']}>余额钱包(元):</Text>
              <Text style={styles['row-left_text2']}>
                {detail?.totalAmount}
              </Text>
            </View>
            <AppIcon name="a-headfor-20" size={px(16)} color="#333333" />
          </TouchableOpacity> */}

          {/* <View style={styles.row2}>
            <Text style={styles['row2_text']}>收款设置</Text>
            <View style={styles['row2-bottom']}>
              <Text style={styles['row2-bottom_text']}>
                请尽快开通支付收款功能，确保用户支付顺畅
              </Text>
              <View style={styles['row2-bottom-right']}>
                <Text style={styles['row2-bottom-right_text2']}>前往进件 </Text>
                <AppIcon name="a-headfor-20" size={px(16)} color="#333333" />
              </View>
            </View>
          </View> */}

          {/* <View style={styles.row2}>
            <Text style={styles['row2_text']}>今日订单</Text>
            <View style={styles['row2-bottom2']}>
              <View style={styles['row2-bottom2-item']}>
                <Text style={styles['row2-bottom2-item_text']}>
                  {detail?.todayOrderAmount}
                </Text>
                <Text style={styles['row2-bottom2-item_text2']}>
                  订单金额(元)
                </Text>
              </View>
              <View style={styles['row2-bottom2_dividingLine']}></View>
              <View style={styles['row2-bottom2-item']}>
                <Text style={styles['row2-bottom2-item_text']}>
                  {detail?.orderCount}
                </Text>
                <Text style={styles['row2-bottom2-item_text2']}>订单量</Text>
              </View>
            </View>
          </View> */}

          {/* <View style={styles.row2}>
            <Text style={styles['row2_text']}>收款设置</Text>
            <View style={styles['row2-bottom2']}>
              <View
                style={[styles['row2-bottom2-item2'], { marginRight: px(6) }]}
              >
                <Flex align="center" gap={px(8)}>
                  <Image
                    style={{ width: px(20), height: px(20) }}
                    source={{
                      uri: 'https://g.18qjz.cn/img/boklock/wallet/img_weixin.png',
                    }}
                  />
                  <Text style={{ fontSize: fontSize(12) }}>微信</Text>
                </Flex>
                <Text style={{ color: '#2552F5', fontSize: fontSize(12) }}>
                  已认证
                </Text>
              </View>
              <View
                style={[styles['row2-bottom2-item2'], { marginLeft: px(6) }]}
              >
                <Flex align="center" gap={px(8)}>
                  <Image
                    style={{ width: px(20), height: px(20) }}
                    source={{
                      uri: 'https://g.18qjz.cn/img/boklock/wallet/img_zhifubao.png',
                    }}
                  />
                  <Text style={{ fontSize: fontSize(12) }}>支付宝</Text>
                </Flex>
                <Text style={{ color: '#FF543A', fontSize: fontSize(12) }}>
                  未认证
                </Text>
              </View>
            </View>
          </View> */}

          <View style={styles.row3}>
            {menuList.map((item, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.8}
                style={[
                  styles['row3-item'],
                  index === menuList.length - 1 ? { marginBottom: 0 } : {},
                ]}
                onPress={item.onPress}
              >
                <Text style={styles['row3-item_text']}>{item.title}</Text>
                <View style={styles['row3-item-right']}>
                  <Text style={styles['row3-item-right_text']}>
                    {item.text}
                  </Text>
                  <AppIcon name="a-headfor-20" size={px(16)} color="#333333" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        <></>
      )}
    </PageContainer>
  );
}
