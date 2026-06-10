import React, { useState, useCallback, useRef, useEffect } from 'react';
import { TouchableOpacity, View, Text, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import PageContainer from '@/components/PageContainer';
import AppIcon from '@/components/AppIcon';
import { SimpleLoading } from '@/components';
import styles from './styles';
import { px } from '@/utils/ui';
import Flex from '@/components/Flex';
import dayjs from 'dayjs';
import MyEmpty from '@/components/MyEmpty/index';
import {
  getOrderStat,
  getSettlementList,
  getWithdrawalList,
} from '@/services/user';
import { useFocusEffect } from '@react-navigation/core';
import { cacheGet } from '@/utils/cache';
import { showToast } from '@/utils';
import { STATE_COLOR } from './constants';

type OrderStat = {
  todayOrderCount: number;
  balance: number;
  totalAmount: number;
};

export default function BalanceWallet() {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('income');
  const [orderStat, setOrderStat] = useState<OrderStat | undefined>(undefined);
  const [settlementMonthlyList, setSettlementMonthlyList] = useState<any[]>([]);
  const [withdrawMonthlyList, setWithdrawMonthlyList] = useState<any[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const listRequestIdRef = useRef(0);
  const activeTabRef = useRef<'income' | 'expense'>(activeTab);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  const getRequestParams = useCallback(async () => {
    const userIdRaw = await cacheGet({ key: 'userId' });
    const userId = Number(userIdRaw);

    return {
      offset: 0,
      pageSize: 999,
      userId: Number.isNaN(userId) ? undefined : userId,
    };
  }, []);

  const fetchOrderStatData = useCallback(async () => {
    try {
      const orderStatRes = await getOrderStat({});

      if (orderStatRes.code === 200 && orderStatRes.success) {
        setOrderStat((orderStatRes.data || {}) as OrderStat);
      }
    } catch {
      // ignore
    }
  }, []);

  const fetchListByTab = useCallback(
    async (tab: 'income' | 'expense') => {
      const requestId = ++listRequestIdRef.current;
      setListLoading(true);

      try {
        const req = await getRequestParams();
        if (tab === 'income') {
          const settlementRes: any = await getSettlementList(req);
          if (requestId !== listRequestIdRef.current) return;

          if (settlementRes?.success) {
            setSettlementMonthlyList(
              Array.isArray(settlementRes?.data?.list)
                ? settlementRes.data.list
                : [],
            );
          } else {
            setSettlementMonthlyList([]);
            showToast({
              title:
                settlementRes?.msg ||
                settlementRes?.message ||
                '加载收入明细失败',
              icon: 'info',
            });
          }
          return;
        }

        const withdrawalRes: any = await getWithdrawalList(req);
        if (requestId !== listRequestIdRef.current) return;

        if (withdrawalRes?.success) {
          setWithdrawMonthlyList(
            Array.isArray(withdrawalRes?.data?.list)
              ? withdrawalRes.data.list
              : [],
          );
        } else {
          setWithdrawMonthlyList([]);
          showToast({
            title:
              withdrawalRes?.msg ||
              withdrawalRes?.message ||
              '加载提现明细失败',
            icon: 'info',
          });
        }
      } finally {
        if (requestId === listRequestIdRef.current) {
          setListLoading(false);
        }
      }
    },
    [getRequestParams],
  );

  const loadOnFocus = useCallback(async () => {
    await fetchOrderStatData();
    await fetchListByTab(activeTabRef.current);
  }, [fetchListByTab, fetchOrderStatData]);

  useFocusEffect(
    useCallback(() => {
      void loadOnFocus();
    }, [loadOnFocus]),
  );

  const currentMonthlyList =
    activeTab === 'income' ? settlementMonthlyList : withdrawMonthlyList;

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
            {orderStat?.totalAmount?.toFixed(2) || '0.00'}
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
            onPress={() => {
              if (activeTab === 'income') return;
              setActiveTab('income');
              void fetchListByTab('income');
            }}
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
            onPress={() => {
              if (activeTab === 'expense') return;
              setActiveTab('expense');
              void fetchListByTab('expense');
            }}
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
          {listLoading ? (
            <SimpleLoading />
          ) : (
            <ScrollView>
              {currentMonthlyList.length ? (
                currentMonthlyList.map(monthlyGroup => (
                  <View
                    key={String(monthlyGroup?.monthly || '')}
                    style={styles.listItem}
                  >
                    <Flex
                      align="center"
                      style={{ marginBottom: px(8), paddingLeft: px(12) }}
                    >
                      <Text style={styles.listItem_text}>
                        {monthlyGroup?.monthly || ''}
                      </Text>
                      <AppIcon
                        name="a-headfor-20"
                        size={px(14)}
                        color="#333333"
                        style={styles.listItem_icon}
                      />
                    </Flex>
                    {(Array.isArray(monthlyGroup?.list)
                      ? monthlyGroup.list
                      : []
                    ).map((item: any, index: number) => (
                      <TouchableOpacity
                        activeOpacity={0.85}
                        key={String(item?.id ?? index)}
                        style={styles['listItem-content']}
                        onPress={() => {
                          if (activeTab !== 'expense') return;
                          navigation.navigate('BalanceWalletWithdrawDetail', {
                            id: item?.id,
                          });
                          setTimeout(() => {
                            setListLoading(true);
                          }, 100);
                        }}
                      >
                        <Flex justify="between">
                          <Text
                            style={[
                              styles.listItem_text,
                              activeTab === 'expense'
                                ? {
                                    color:
                                      STATE_COLOR[item.status] ||
                                      styles.listItem_text.color,
                                  }
                                : {},
                            ]}
                          >
                            {activeTab === 'income'
                              ? '订单结算'
                              : item.statusName || ''}
                          </Text>
                          <Text style={styles.listItem_text}>
                            {activeTab === 'income' ? '+' : '-'}
                            {Number(
                              activeTab === 'income'
                                ? item.merchantAmount
                                : item.applicationAmount,
                            )?.toFixed(2)}
                          </Text>
                        </Flex>
                        <Flex justify="between" style={{ marginTop: px(8) }}>
                          <Text style={styles.listItem_text2}>
                            {dayjs(
                              activeTab === 'income'
                                ? item.allocateDate
                                : item.createTime,
                            ).format('YYYY-MM-DD HH:mm:ss')}
                          </Text>
                          <Text style={styles.listItem_text2}>
                            余额钱包
                            {Number(
                              item.balance || item.currentAmount || 0,
                            )?.toFixed(2)}
                          </Text>
                        </Flex>
                      </TouchableOpacity>
                    ))}
                  </View>
                ))
              ) : (
                <MyEmpty emptyText="暂无明细" marginTop={px(80)} />
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </PageContainer>
  );
}
