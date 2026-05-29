import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View, Text, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import PageContainer from '@/components/PageContainer';
import AppIcon from '@/components/AppIcon';
import styles from './styles';
import { px } from '@/utils/ui';
import Flex from '@/components/Flex';
import dayjs from 'dayjs';
import MyEmpty from '@/components/MyEmpty/index';

export default function BalanceWallet() {
  const navigation = useNavigation<any>();
  const [balance, setBalance] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('income');

  useEffect(() => {
    const res = {
      balance: 1000,
      income: {
        '2026年5月': [
          {
            name: '订单结算',
            amount: 2,
            time: '2026-05-01 12:00:00',
            balance: 1000,
          },
          {
            name: '订单结算',
            amount: 2,
            time: '2026-05-01 12:00:00',
            balance: 1000,
          },
          {
            name: '订单结算',
            amount: 2,
            time: '2026-05-01 12:00:00',
            balance: 1000,
          },
        ],
        '2026年4月': [
          {
            name: '订单结算',
            amount: 2,
            time: '2026-05-01 12:00:00',
            balance: 1000,
          },
          {
            name: '订单结算',
            amount: 2,
            time: '2026-05-01 12:00:00',
            balance: 1000,
          },
          {
            name: '订单结算',
            amount: 2,
            time: '2026-05-01 12:00:00',
            balance: 1000,
          },
        ],
        '2026年3月': [
          {
            name: '订单结算',
            amount: 2,
            time: '2026-05-01 12:00:00',
            balance: 1000,
          },
          {
            name: '订单结算',
            amount: 2,
            time: '2026-05-01 12:00:00',
            balance: 1000,
          },
          {
            name: '订单结算',
            amount: 2,
            time: '2026-05-01 12:00:00',
            balance: 1000,
          },
        ],
      },
      expense: {
        '2026年5月': [
          {
            name: '申请中',
            amount: 2,
            state: 0,
            time: '2026-05-01 12:00:00',
            balance: 1000,
          },
          {
            name: '申请成功',
            amount: 2,
            state: 1,
            time: '2026-05-01 12:00:00',
            balance: 1000,
          },
          {
            name: '申请失败',
            amount: 2,
            state: 2,
            time: '2026-05-01 12:00:00',
            balance: 1000,
          },
        ],
        '2026年4月': [
          {
            name: '申请中',
            amount: 2,
            state: 0,
            time: '2026-05-01 12:00:00',
            balance: 1000,
          },
          {
            name: '申请成功',
            amount: 2,
            state: 1,
            time: '2026-05-01 12:00:00',
            balance: 1000,
          },
          {
            name: '申请失败',
            amount: 2,
            state: 2,
            time: '2026-05-01 12:00:00',
            balance: 1000,
          },
        ],
        '2026年3月': [
          {
            name: '申请中',
            amount: 2,
            state: 0,
            time: '2026-05-01 12:00:00',
            balance: 1000,
          },
          {
            name: '申请成功',
            amount: 2,
            state: 1,
            time: '2026-05-01 12:00:00',
            balance: 1000,
          },
          {
            name: '申请失败',
            amount: 2,
            state: 2,
            time: '2026-05-01 12:00:00',
            balance: 1000,
          },
        ],
      },
    };
    setBalance(res);
  }, []);

  const stateColor: any = {
    0: '#FD8E62',
    1: '#37C22A',
    2: '#FF2B24',
  };

  return (
    <PageContainer
      backgroundColor="#FCFBFE"
      backgroundImage={{
        uri: 'https://g.18qjz.cn/img/boklock/wallet/wallet_background.png',
      }}
      backgroundImageHeight={px(400)}
      safeAreaEdges={['top']}
      pageNavProps={{
        text: '余额钱包',
        showBack: true,
        titleColor: '#FFFFFF',
      }}
    >
      <View style={styles.container}>
        <Flex direction="column" align="center" style={styles.balanceContent}>
          <Text style={styles['balanceContent_text']}>余额(元)</Text>
          <Text style={styles['balanceContent_text2']}>
            {balance?.balance?.toFixed(2)}
          </Text>
          <TouchableOpacity
            style={styles['balanceContent-button']}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('BalanceWalletExtract')}
          >
            <Text style={styles['balanceContent-button_text']}>提现</Text>
          </TouchableOpacity>
        </Flex>
        <Flex justify="center" style={{ width: '100%', marginBottom: px(12) }}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setActiveTab('income')}
            style={[
              styles.tabItem,
              { marginRight: px(15) },
              activeTab === 'income' ? styles['tabItem--active'] : {},
            ]}
          >
            <Text
              style={[
                styles.tabItem_text,
                activeTab === 'income' ? styles['tabItem_text--active'] : {},
              ]}
            >
              收入明细
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setActiveTab('expense')}
            style={[
              styles.tabItem,
              activeTab === 'expense' ? styles['tabItem--active'] : {},
            ]}
          >
            <Text
              style={[
                styles.tabItem_text,
                activeTab === 'expense' ? styles['tabItem_text--active'] : {},
              ]}
            >
              提现明细
            </Text>
          </TouchableOpacity>
        </Flex>
        <View style={styles.listContent}>
          <ScrollView>
            {Object.keys(balance?.[activeTab] || {}).length ? (
              Object.keys(balance?.[activeTab] || {}).map(month => (
                <View key={month} style={styles.listItem}>
                  <Flex
                    align="center"
                    style={{ marginBottom: px(8), paddingLeft: px(12) }}
                  >
                    <Text style={styles.listItem_text}>{month}</Text>
                    <AppIcon
                      name="a-headfor-20"
                      size={px(14)}
                      color="#333333"
                      style={styles.listItem_icon}
                    />
                  </Flex>
                  {balance?.[activeTab]?.[month]?.map(
                    (item: any, index: number) => (
                      <TouchableOpacity
                        activeOpacity={0.85}
                        key={index}
                        style={styles['listItem-content']}
                        onPress={() => {
                          if (activeTab !== 'expense') return;
                          navigation.navigate('BalanceWalletWithdrawDetail', {
                            item,
                          });
                        }}
                      >
                        <Flex justify="between">
                          <Text
                            style={[
                              styles.listItem_text,
                              activeTab === 'expense'
                                ? { color: stateColor[item.state] }
                                : {},
                            ]}
                          >
                            {item.name}
                          </Text>
                          <Text style={styles.listItem_text}>
                            {activeTab === 'income' || item.state == 2
                              ? '+'
                              : '-'}
                            {item.amount.toFixed(2)}
                          </Text>
                        </Flex>
                        <Flex justify="between" style={{ marginTop: px(8) }}>
                          <Text style={styles.listItem_text2}>
                            {dayjs(item.time).format('YYYY-MM-DD HH:mm:ss')}
                          </Text>
                          <Text style={styles.listItem_text2}>
                            余额钱包{item.balance.toFixed(2)}
                          </Text>
                        </Flex>
                      </TouchableOpacity>
                    ),
                  )}
                </View>
              ))
            ) : (
              <MyEmpty emptyText="暂无明细" marginTop={px(80)} />
            )}
          </ScrollView>
        </View>
      </View>
    </PageContainer>
  );
}
