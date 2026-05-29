import React, { useMemo } from 'react';
import { View, Text, Image } from 'react-native';
import { useRoute } from '@react-navigation/native';
import dayjs from 'dayjs';
import PageContainer from '@/components/PageContainer';
import Flex from '@/components/Flex';
import { px } from '@/utils/ui';
import styles from './styles';

type WithdrawState = 0 | 1 | 2;

type WithdrawItem = {
  name?: string;
  amount?: number;
  state?: WithdrawState;
  time?: string;
  balance?: number;
  tradeNo?: string;
};

const STATE_NAME: Record<WithdrawState, string> = {
  0: '申请中',
  1: '申请成功',
  2: '申请失败',
};

const STATE_COLOR: Record<WithdrawState, string> = {
  0: '#FD8E62',
  1: '#37C22A',
  2: '#FF2B24',
};

const PROGRESS_IMAGE: Record<WithdrawState, string> = {
  0: 'https://g.18qjz.cn/img/boklock/wallet/withdraw_pendding.png',
  1: 'https://g.18qjz.cn/img/boklock/wallet/withdraw_success.png',
  2: 'https://g.18qjz.cn/img/boklock/wallet/withdraw_fail.png',
};

export default function BalanceWalletWithdrawDetail() {
  const route = useRoute<any>();
  const item: WithdrawItem = route.params?.item || {};

  const state = Number(item?.state ?? 0) as WithdrawState;
  const statusText = STATE_NAME[state] || '申请中';
  const statusColor = STATE_COLOR[state] || '#FD8E62';

  const withdrawTime = useMemo(() => {
    return item?.time
      ? dayjs(item.time).format('YYYY-MM-DD HH:mm:ss')
      : dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss');
  }, [item?.time]);

  const reviewTime = useMemo(() => {
    return dayjs(withdrawTime).add(1, 'day').format('YYYY-MM-DD HH:mm:ss');
  }, [withdrawTime]);

  const tradeNo = item?.tradeNo || 'F20250818000001';
  const amountText = Number(item?.amount ?? 100).toFixed(2);
  const balanceText = Number(item?.balance ?? 830029.2).toFixed(1);

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
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {statusText}
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
                {`${statusText}  ${reviewTime}`}
              </Text>
              <Text
                style={styles.timelineText}
              >{`提现申请  ${withdrawTime}`}</Text>
            </Flex>
          </View>
        </View>
      </View>
    </PageContainer>
  );
}
