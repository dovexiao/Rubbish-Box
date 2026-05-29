import React, { useMemo, useState } from 'react';
import {
  Linking,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { PageContainer, Flex, Popup } from '@/components';
import { showToast } from '@/utils';
import { px } from '@/utils/ui';

const styles = require('./styles').default;

type BizOrderType = 'income' | 'expense';
type BizOrderStatus = 'all' | 'todo' | 'unpaid' | 'done' | 'aftersale';

type RouteOrderItem = {
  orderNo: string;
  orderType: BizOrderType;
  orderStatus: Exclude<BizOrderStatus, 'all'>;
  deviceName: string;
  createdAt: string;
  parkingDuration: string;
  amount: number;
};

type DetailData = {
  orderTypeText: string;
  orderStatusText: string;
  deviceName: string;
  createdAt: string;
  orderNo: string;
  parkingDuration: string;
  pricingRule: string;
  maxFee: string;
  currentFee?: string;
  orderAmount?: string;
  discountAmount?: string;
  actualPay?: string;
  paidAmount?: string;
  unpaidAmount?: string;
  refundAmount?: string;
  endTime?: string;
  payTime?: string;
  aftersaleStartTime?: string;
  aftersaleReason?: string;
  refundedAmount?: string;
};

function parseAmount(text?: string): number {
  if (!text) return 0;
  const cleaned = String(text).replace(/[^\d.]/g, '');
  const amount = Number(cleaned);
  return Number.isFinite(amount) ? amount : 0;
}

function normalizeAmountInput(text: string): string {
  const cleaned = text.replace(/[^\d.]/g, '');
  const parts = cleaned.split('.');
  if (parts.length <= 1) return cleaned;
  return `${parts[0]}.${parts.slice(1).join('')}`;
}

function buildExpenseDetail(
  item: RouteOrderItem,
  status: Exclude<BizOrderStatus, 'all'>,
): DetailData {
  const base = {
    orderTypeText: '消费订单',
    deviceName: item.deviceName || '地锁x号',
    createdAt: item.createdAt || '2026-05-05 12:00',
    orderNo: item.orderNo || 'BKXF2026051300000001',
    parkingDuration: item.parkingDuration || '02:42:23',
    pricingRule: '按时长收费  每60分钟5元',
    maxFee: '30元',
  };

  if (status === 'todo') {
    return {
      ...base,
      orderStatusText: '待完成',
      currentFee: `${item.amount ?? 6}元`,
      paidAmount: '6元',
    };
  }

  if (status === 'unpaid') {
    return {
      ...base,
      orderStatusText: '待付款',
      orderAmount: '12元',
      paidAmount: '6元',
      unpaidAmount: '6元',
      refundAmount: '6元',
      endTime: '2026-05-05 14:00:00',
      payTime: '2026-05-05 14:00:00',
    };
  }

  if (status === 'aftersale') {
    return {
      ...base,
      orderStatusText: '售后',
      orderAmount: '12元',
      discountAmount: '0元',
      actualPay: '12元',
      refundAmount: '',
      endTime: '2026-05-05 14:00:00',
      payTime: '2026-05-05 14:00:00',
      aftersaleStartTime: '2026-05-05 14:00:00',
      aftersaleReason: '扣得太多了',
      refundedAmount: '2元',
    };
  }

  return {
    ...base,
    orderStatusText: '已完成',
    orderAmount: '12元',
    discountAmount: '0元',
    actualPay: '12元',
    refundAmount: '',
    endTime: '2026-05-05 14:00:00',
    payTime: '2026-05-05 14:00:00',
  };
}

function buildIncomeDetail(
  item: RouteOrderItem,
  status: Exclude<BizOrderStatus, 'all'>,
): DetailData {
  const base = {
    orderTypeText: '收入订单',
    deviceName: item.deviceName || '地锁x号',
    createdAt: item.createdAt || '2026-05-05 12:00',
    orderNo: item.orderNo || 'BKSR2026051300000001',
    parkingDuration: item.parkingDuration || '02:42:23',
    pricingRule: '按时长收费  每60分钟5元',
    maxFee: '30元',
  };

  if (status === 'todo') {
    return {
      ...base,
      orderStatusText: '待完成',
      orderAmount: '12元',
      paidAmount: '6元',
      unpaidAmount: '6元',
      refundAmount: '',
      endTime: '2026-05-05 14:00:00',
      payTime: '2026-05-05 14:00:00',
    };
  }

  if (status === 'aftersale') {
    return {
      ...base,
      orderStatusText: '售后',
      orderAmount: '12元',
      discountAmount: '0元',
      actualPay: '12元',
      refundAmount: '',
      endTime: '2026-05-05 14:00:00',
      payTime: '2026-05-05 14:00:00',
      aftersaleStartTime: '2026-05-05 14:00:00',
      aftersaleReason: '扣得太多了',
      refundedAmount: '2元',
    };
  }

  return {
    ...base,
    orderStatusText: '已完成',
    orderAmount: '12元',
    discountAmount: '0元',
    actualPay: '12元',
    refundAmount: '',
    endTime: '2026-05-05 14:00:00',
    payTime: '2026-05-05 14:00:00',
  };
}

export default function MyOrderDetail() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const routeItem = (route.params?.item || {}) as Partial<RouteOrderItem>;
  const orderType = (route.params?.orderType ||
    routeItem.orderType ||
    'expense') as BizOrderType;
  const orderStatus = (route.params?.orderStatus ||
    routeItem.orderStatus ||
    'done') as Exclude<BizOrderStatus, 'all'>;

  const detail = useMemo(() => {
    const fallbackItem: RouteOrderItem = {
      orderNo: String(route.params?.orderNo || routeItem.orderNo || ''),
      orderType,
      orderStatus,
      deviceName: routeItem.deviceName || '地锁x号',
      createdAt: routeItem.createdAt || '2026-05-05 12:00',
      parkingDuration: routeItem.parkingDuration || '02:42:23',
      amount: Number(routeItem.amount || 6),
    };

    if (orderType === 'income') {
      return buildIncomeDetail(fallbackItem, orderStatus);
    }
    return buildExpenseDetail(fallbackItem, orderStatus);
  }, [orderStatus, orderType, route.params?.orderNo, routeItem]);

  const showPayBtn = orderType === 'expense' && orderStatus === 'unpaid';
  const showContactBtn =
    orderType === 'expense' &&
    (orderStatus === 'done' || orderStatus === 'aftersale');
  const showRefundBtn = orderType === 'expense' && orderStatus === 'done';
  const showIncomeHandleRefundBtn =
    orderType === 'income' && orderStatus === 'aftersale';
  const showAftersaleDetail = orderStatus === 'aftersale';

  const [refundPopupVisible, setRefundPopupVisible] = useState(false);
  const [contactPopupVisible, setContactPopupVisible] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [refundReasonError, setRefundReasonError] = useState('');
  const [handleRefundPopupVisible, setHandleRefundPopupVisible] =
    useState(false);
  const [handleRefundAmount, setHandleRefundAmount] = useState('');
  const [handleRefundReason, setHandleRefundReason] = useState('');
  const [handleRefundAmountError, setHandleRefundAmountError] = useState('');
  const [handleRefundReasonError, setHandleRefundReasonError] = useState('');

  const merchantPhone = '17800928432';

  const refundRecords = [
    {
      id: 'r1',
      time: '2019-09-20 18:06:25',
      applyAmount: 20,
      reason: 'XXXXX',
      resultText: '20元退款中',
      resultColor: '#FF8C62',
    },
    {
      id: 'r2',
      time: '2019-09-20 18:06:25',
      applyAmount: 10,
      reason: 'XXXXX',
      resultText: '10元退款成功',
      resultColor: '#2ACB52',
    },
    {
      id: 'r3',
      time: '2019-09-20 18:06:25',
      applyAmount: 10,
      reason: 'XXXXX',
      resultText: '10元退款失败',
      resultColor: '#FF2B24',
    },
    {
      id: 'r4',
      time: '2019-09-20 18:06:25',
      applyAmount: 120,
      reason: 'XXXXX',
      resultText: '60元退款成功  60元退款失败',
      resultColor: '#2ACB52',
      secondColor: '#FF2B24',
    },
    {
      id: 'r5',
      time: '2019-09-20 18:06:25',
      applyAmount: 120,
      reason: 'XXXXX',
      resultText: '60元退款中  60元退款失败',
      resultColor: '#FF8C62',
      secondColor: '#FF2B24',
    },
  ];

  const parkingFee =
    detail.orderAmount || detail.currentFee || `${routeItem.amount || 0}元`;
  const actualPayAmount = parseAmount(detail.actualPay);
  const refundedAmountNumber = parseAmount(detail.refundedAmount);
  const availableRefundAmount = Math.max(
    0,
    actualPayAmount - refundedAmountNumber,
  );

  const rows: Array<{ label: string; value?: string }> = [
    { label: '订单类型', value: detail.orderTypeText },
    { label: '订单状态', value: detail.orderStatusText },
    { label: '设备名称', value: detail.deviceName },
    { label: '订单创建时间', value: detail.createdAt },
    { label: '订单编号', value: detail.orderNo },
    { label: '停车时长', value: detail.parkingDuration },
    ...(detail.currentFee
      ? [{ label: '当前计费', value: detail.currentFee }]
      : []),
    ...(detail.orderAmount
      ? [{ label: '订单金额', value: detail.orderAmount }]
      : []),
    { label: '收费方式', value: detail.pricingRule },
    { label: '最高收费', value: detail.maxFee },
    ...(detail.discountAmount
      ? [{ label: '优惠金额', value: detail.discountAmount }]
      : []),
    ...(detail.actualPay
      ? [{ label: '实际支付', value: detail.actualPay }]
      : []),
    ...(detail.paidAmount
      ? [{ label: '已付金额', value: detail.paidAmount }]
      : []),
    ...(detail.unpaidAmount
      ? [{ label: '待付金额', value: detail.unpaidAmount }]
      : []),
    ...(detail.refundAmount !== undefined
      ? [{ label: '退款金额', value: detail.refundAmount }]
      : []),
    ...(detail.endTime
      ? [{ label: '订单结束时间', value: detail.endTime }]
      : []),
    ...(detail.payTime
      ? [{ label: '订单支付时间', value: detail.payTime }]
      : []),
    ...(detail.aftersaleStartTime
      ? [{ label: '售后发起时间', value: detail.aftersaleStartTime }]
      : []),
    ...(detail.aftersaleReason
      ? [{ label: '售后原因', value: detail.aftersaleReason }]
      : []),
  ];

  return (
    <PageContainer
      backgroundColor="#FFFFFF"
      statusBarStyle="dark-content"
      statusBarBackgroundColor="#FFFFFF"
      safeAreaEdges={['top', 'bottom']}
      scrollable={false}
      pageNavProps={{
        text: '订单详情',
        showBack: true,
        background: '#FFFFFF',
      }}
      footer={
        showPayBtn ||
        showContactBtn ||
        showRefundBtn ||
        showIncomeHandleRefundBtn ? (
          <View style={styles.footerBtns}>
            {showContactBtn ? (
              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  styles[
                    detail.orderStatusText == '售后'
                      ? 'footerBtn2'
                      : 'footerBtn'
                  ],
                  styles.footerBtnGhost,
                ]}
                onPress={() => setContactPopupVisible(true)}
              >
                <Text style={styles.footerBtnGhostText}>联系商家</Text>
              </TouchableOpacity>
            ) : null}

            {showPayBtn ? (
              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  styles.footerBtn2,
                  styles.footerBtnPrimary,
                  styles.footerBtnSingle,
                ]}
                onPress={() =>
                  showToast({ title: '支付功能开发中', icon: 'info' })
                }
              >
                <Text style={styles.footerBtnPrimaryText}>支付</Text>
              </TouchableOpacity>
            ) : null}

            {showRefundBtn ? (
              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.footerBtn, styles.footerBtnPrimary]}
                onPress={() => setRefundPopupVisible(true)}
              >
                <Text style={styles.footerBtnPrimaryText}>发起退款</Text>
              </TouchableOpacity>
            ) : null}

            {showIncomeHandleRefundBtn ? (
              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  styles.footerBtn2,
                  styles.footerBtnPrimary,
                  styles.footerBtnSingle,
                ]}
                onPress={() => setHandleRefundPopupVisible(true)}
              >
                <Text style={styles.footerBtnPrimaryText}>处理退款</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : undefined
      }
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.orderDetailContainer}
        showsVerticalScrollIndicator={false}
      >
        {rows.map((row, index) => {
          if (row.label === '售后发起时间' && showAftersaleDetail) {
            return (
              <View key={`${row.label}-${index}`}>
                <View style={styles.aftersaleDivider} />
                <Flex justify="between" align="center" style={styles.row}>
                  <Text style={styles.label}>{row.label}</Text>
                  <Text style={styles.value}>{row.value || ''}</Text>
                </Flex>
              </View>
            );
          }

          if (row.label === '退款金额' && showAftersaleDetail) {
            return (
              <Flex
                justify="between"
                align="center"
                style={styles.row}
                key={`${row.label}-${index}`}
              >
                <Text style={styles.label}>{row.label}</Text>
                <Text style={styles.value}>{row.value || ''}</Text>
              </Flex>
            );
          }

          return (
            <Flex
              justify="between"
              align="center"
              style={styles.row}
              key={`${row.label}-${index}`}
            >
              <Text style={styles.label}>{row.label}</Text>
              <Text style={styles.value}>{row.value || ''}</Text>
            </Flex>
          );
        })}

        {showAftersaleDetail ? (
          <Flex justify="between" align="center" style={styles.row}>
            <Text style={styles.label}>已退金额</Text>
            <View style={styles.refundDetailWrap}>
              <Text style={styles.value}>{detail.refundedAmount || ''}</Text>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.refundDetailBtn}
                onPress={() => {
                  navigation.navigate('MyOrderRefundDetail', {
                    records: refundRecords,
                  });
                }}
              >
                <Text style={styles.refundDetailBtnText}>查看详情</Text>
              </TouchableOpacity>
            </View>
          </Flex>
        ) : null}
      </ScrollView>

      <Popup
        visible={refundPopupVisible}
        onClose={() => {
          setRefundPopupVisible(false);
          setRefundReason('');
          setRefundReasonError('');
        }}
        title="发起退款"
        androidKeyboardMaxOffset={px(90)}
        showClose
      >
        <View style={styles.popWrap}>
          <Flex justify="between" align="center" style={styles.popRow}>
            <Text style={styles.popLabel}>停车费用</Text>
            <Text style={styles.popValue}>{parkingFee}</Text>
          </Flex>

          <View style={styles.popReasonRow}>
            <Text style={styles.popLabel}>
              <Text style={styles.required}>*</Text>售后原因
            </Text>
            <TextInput
              style={styles.reasonInput}
              value={refundReason}
              onChangeText={text => {
                setRefundReason(text.slice(0, 50));
                if (refundReasonError) setRefundReasonError('');
              }}
              placeholder="请输入售后原因"
              placeholderTextColor="#CCC"
              maxLength={50}
            />
          </View>

          {!!refundReasonError ? (
            <Text style={styles.reasonErrorText}>{refundReasonError}</Text>
          ) : null}

          <View style={styles.popFooter}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.popBtn, styles.popCancelBtn]}
              onPress={() => {
                setRefundPopupVisible(false);
                setRefundReason('');
                setRefundReasonError('');
              }}
            >
              <Text style={styles.popCancelText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.popBtn,
                styles.popConfirmBtn,
                !refundReason.trim() ? styles.popConfirmBtnDisabled : null,
              ]}
              onPress={() => {
                if (!refundReason.trim()) {
                  setRefundReasonError('请输入售后原因');
                  return;
                }
                setRefundPopupVisible(false);
                showToast({ title: '提交成功', icon: 'success' });
              }}
            >
              <Text style={styles.popConfirmText}>提交</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Popup>

      <Popup
        visible={contactPopupVisible}
        onClose={() => setContactPopupVisible(false)}
        title="联系商家"
        showClose
      >
        <View style={styles.popWrap}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.phoneBtn}
            onPress={() => {
              Linking.openURL(`tel:${merchantPhone}`).catch(() => {
                showToast({ title: '无法唤起拨号', icon: 'info' });
              });
            }}
          >
            <Text style={styles.phoneBtnText}>{merchantPhone}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.phoneBtn, styles.phoneCancelBtn]}
            onPress={() => setContactPopupVisible(false)}
          >
            <Text style={styles.phoneCancelText}>取消</Text>
          </TouchableOpacity>
        </View>
      </Popup>

      <Popup
        visible={handleRefundPopupVisible}
        onClose={() => {
          setHandleRefundPopupVisible(false);
          setHandleRefundAmount('');
          setHandleRefundReason('');
          setHandleRefundAmountError('');
          setHandleRefundReasonError('');
        }}
        title="处理退款"
        androidKeyboardMaxOffset={px(120)}
        showClose
      >
        <View style={styles.popWrap}>
          <Flex justify="between" align="center" style={styles.popRow}>
            <Text style={styles.popLabel}>订单金额</Text>
            <Text style={styles.popValue}>{detail.orderAmount || '0元'}</Text>
          </Flex>
          <Flex justify="between" align="center" style={styles.popRow}>
            <Text style={styles.popLabel}>实际支付</Text>
            <Text style={styles.popValue}>{detail.actualPay || '0元'}</Text>
          </Flex>
          <Flex justify="between" align="center" style={styles.popRow}>
            <Text style={styles.popLabel}>已退款</Text>
            <Text style={styles.popValue}>
              {detail.refundedAmount || '0元'}
            </Text>
          </Flex>

          <View style={[styles.popReasonRow, { marginBottom: 0 }]}>
            <Text style={styles.popLabel}>
              <Text style={styles.required}>*</Text>退款金额
            </Text>
            <TextInput
              style={styles.reasonInput}
              value={handleRefundAmount}
              onChangeText={text => {
                const next = normalizeAmountInput(text);
                setHandleRefundAmount(next);
                const amount = parseAmount(next);
                console.log(amount, availableRefundAmount, '=====');
                if (amount > availableRefundAmount) {
                  setHandleRefundAmountError('退款金额不可大于可退款金额');
                } else {
                  setHandleRefundAmountError('');
                }
              }}
              placeholder="请输入退款金额"
              placeholderTextColor="#CCC"
              keyboardType="decimal-pad"
            />
          </View>
          {!!handleRefundAmountError ? (
            <Text style={styles.reasonErrorText}>
              {handleRefundAmountError}
            </Text>
          ) : null}

          <View style={styles.popReasonRow}>
            <Text style={styles.popLabel}>
              <Text style={styles.required}>*</Text>退款原因
            </Text>
            <TextInput
              style={styles.reasonInput}
              value={handleRefundReason}
              onChangeText={text => {
                setHandleRefundReason(text.slice(0, 50));
                if (handleRefundReasonError) setHandleRefundReasonError('');
              }}
              placeholder="请输入退款原因"
              placeholderTextColor="#CCC"
              maxLength={50}
            />
          </View>
          {!!handleRefundReasonError ? (
            <Text style={styles.reasonErrorText}>
              {handleRefundReasonError}
            </Text>
          ) : null}

          <View style={styles.popFooter}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.popBtn, styles.popCancelBtn]}
              onPress={() => {
                setHandleRefundPopupVisible(false);
                setHandleRefundAmount('');
                setHandleRefundReason('');
                setHandleRefundAmountError('');
                setHandleRefundReasonError('');
              }}
            >
              <Text style={styles.popCancelText}>取消</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.popBtn, styles.popConfirmBtn]}
              onPress={() => {
                const amount = parseAmount(handleRefundAmount);
                let hasError = false;

                if (!handleRefundAmount.trim() || !amount || amount <= 0) {
                  setHandleRefundAmountError('请输入退款金额');
                  hasError = true;
                } else if (amount > availableRefundAmount) {
                  setHandleRefundAmountError('退款金额不可大于可退款金额');
                  hasError = true;
                } else {
                  setHandleRefundAmountError('');
                }

                if (!handleRefundReason.trim()) {
                  setHandleRefundReasonError('请输入退款原因');
                  hasError = true;
                } else {
                  setHandleRefundReasonError('');
                }

                if (hasError) return;

                setHandleRefundPopupVisible(false);
                showToast({ title: '处理成功', icon: 'success' });
              }}
            >
              <Text style={styles.popConfirmText}>确定</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Popup>
    </PageContainer>
  );
}
