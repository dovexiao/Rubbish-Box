import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, Image } from 'react-native';
import { useRoute } from '@react-navigation/native';
import dayjs from 'dayjs';
import PageContainer from '@/components/PageContainer';
import Flex from '@/components/Flex';
import { px } from '@/utils/ui';
import styles from './styles';
import { getWithdrawalInfo } from '@/services/user';
import { showToast } from '@/utils';
import { STATE_COLOR, PROGRESS_IMAGE } from '../constants';
import { SimpleLoading } from '@/components';

type WithdrawState = 1 | 2 | 3 | 4;

type WithdrawItem = {
  id?: number;
  tradeNo?: string;
  currentAvailableAmount?: number;
  applicationAmount?: number;
  bankNo?: string;
  createTime?: string;
  statusList?: Array<{
    status?: WithdrawState;
    statusName?: string;
    rejectReason?: string;
    time?: string;
  }>;
};

export default function BalanceWalletWithdrawDetail() {
  const route = useRoute<any>();
  const withdrawId = route.params?.id;
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<WithdrawItem>({});

  const loadDetail = useCallback(async () => {
    if ([null, undefined, ''].includes(withdrawId)) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res: any = await getWithdrawalInfo({ id: withdrawId });
      console.log('getWithdrawalInfo res', res, res.data.statusList);
      if (res?.success) {
        setDetail((res?.data || {}) as WithdrawItem);
      } else {
        showToast({
          title: res?.msg || res?.message || '加载提现详情失败',
          icon: 'info',
        });
      }
    } catch {
      showToast({ title: '加载提现详情失败', icon: 'info' });
    } finally {
      setLoading(false);
    }
  }, [withdrawId]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  const statusFlow = Array.isArray(detail?.statusList) ? detail.statusList : [];
  const currentStatus = statusFlow[statusFlow.length - 1] || {};

  const state = Number(currentStatus?.status ?? 0) as WithdrawState;

  const withdrawTime = useMemo(() => {
    return detail?.createTime
      ? dayjs(detail.createTime).format('YYYY-MM-DD HH:mm:ss')
      : '';
  }, [detail?.createTime]);

  const reviewTime = useMemo(() => {
    return currentStatus?.time
      ? dayjs(currentStatus.time).format('YYYY-MM-DD HH:mm:ss')
      : '';
  }, [currentStatus?.time]);

  const tradeNo = detail?.tradeNo || '-';
  const amountText = Number(detail?.applicationAmount || 0).toFixed(2);
  const balanceText = Number(detail?.currentAvailableAmount || 0).toFixed(2);

  return (
    <PageContainer
      backgroundColor="#FFFFFF"
      safeAreaEdges={['top']}
      pageNavProps={{
        text: '提现明细',
        showBack: true,
        background: '#FFFFFF',
      }}
    >
      {loading ? (
        <SimpleLoading />
      ) : (
        <View style={styles.container}>
          <View style={styles.card}>
            <Text style={[styles.statusText, { color: STATE_COLOR[state] }]}>
              {statusFlow[statusFlow.length - 1]?.statusName || '-'}
            </Text>
            <Text style={styles.amountText}>-{amountText}</Text>

            <View style={styles.infoWrap}>
              <Flex justify="between" style={styles.infoRow}>
                <Text style={styles.infoLabel}>提现时间</Text>
                <Text style={styles.infoValue}>{withdrawTime}</Text>
              </Flex>
              <Flex justify="between" style={styles.infoRow}>
                <Text style={styles.infoLabel}>交易单号</Text>
                <Text style={styles.infoValue}>{tradeNo}</Text>
              </Flex>
              <Flex justify="between" style={styles.infoRow}>
                <Text style={styles.infoLabel}>提现金额</Text>
                <Text style={styles.infoValue}>¥ {amountText}</Text>
              </Flex>
              <Flex justify="between" style={styles.infoRow}>
                <Text style={styles.infoLabel}>余额钱包</Text>
                <Text style={styles.infoValue}>¥ {balanceText}</Text>
              </Flex>
            </View>

            <View style={styles.divider} />

            <View style={styles.progressContent}>
              <Image
                source={{ uri: PROGRESS_IMAGE[state] }}
                style={{ width: px(24), height: px(76) }}
                resizeMode="contain"
              />
              <Flex
                direction="column"
                justify="between"
                style={{
                  height: px(78),
                  paddingTop: px(2),
                  paddingBottom: px(4),
                  paddingLeft: px(12),
                }}
              >
                <Text
                  style={[
                    styles.timelineText,
                    state === 2 ? styles.timelineTextFail : null,
                  ]}
                >
                  {`${statusFlow[1]?.statusName}  ${reviewTime || ''}`}
                </Text>
                <Text
                  style={[
                    styles.timelineText,
                    state === 2 ? styles.timelineTextFail : null,
                  ]}
                >
                  {`${statusFlow[0]?.statusName}  ${withdrawTime || ''}`}
                </Text>
              </Flex>
            </View>
          </View>
        </View>
      )}
    </PageContainer>
  );
}
