import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { PageContainer, Flex, Popup } from '@/components';
import { hideLoading, showLoading, showToast } from '@/utils';
import { px } from '@/utils/ui';
import {
  getLockOrderDetail,
  postMerchantDealRefund,
  postUserAfsRefund,
} from '@/services/order';
import dayjs from 'dayjs';
import { TextInput } from '@/components/index';
import { getMiniToken } from '@/services/common';
import { wechatOpenMiniProgram } from '@/utils/wechat';
import MyEmpty from '@/components/MyEmpty';

const styles = require('./styles').default;

const STATUS_MAP: Record<number, string> = {
  1: '待完成',
  2: '待付款',
  3: '已完成',
  4: '售后',
};

const formatSeconds = (seconds: number) => {
  if (!seconds) return '00:00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s
    .toString()
    .padStart(2, '0')}`;
};

function parseAmount(text?: string): number {
  if (!text) return 0;
  const cleaned = String(text).replace(/[^\d.]/g, '');
  const amount = Number(cleaned);
  return Number.isFinite(amount) ? amount : 0;
}

export default function MyOrderDetail() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [loading, setLoading] = useState(true);

  const [detailData, setDetailData] = useState<any>(null);

  const routeItem = (route.params?.item || {}) as Partial<any>;
  const orderType = (route.params?.orderType ||
    routeItem.orderType ||
    'expense') as 'income' | 'expense';

  const orderNo = String(route.params?.orderNo || routeItem.orderNo || '');

  const detail = useMemo(() => {
    if (!detailData) return null;
    console.log(detailData, '===detailData===');

    const orderStatusText = STATUS_MAP[detailData.tabStatus] || '';
    const { feeTemplateDto } = detailData;

    let pricingRule = '';
    if (feeTemplateDto) {
      if (feeTemplateDto.chargingType === 1) {
        pricingRule = `按次收费 ${feeTemplateDto.unitFee}元/次`;
      } else {
        pricingRule = `按时收费 每${feeTemplateDto.duration}分钟${feeTemplateDto.unitFee}元`;
      }
    }

    return {
      orderTypeText: orderType === 'income' ? '收入订单' : '消费订单',
      orderStatusText,
      deviceName: detailData.deviceName || detailData.deviceNo || '',
      createdAt: detailData.useStartTime
        ? dayjs(detailData.useStartTime).format('YYYY-MM-DD HH:mm:ss')
        : '',
      orderNo: detailData.orderNo || '',
      parkingDuration: formatSeconds(detailData.parkingDurationSeconds),
      pricingRule,
      maxFee: feeTemplateDto ? `${feeTemplateDto.maxFee || 0}元` : '',
      currentFee: detailData.currentFee
        ? `${detailData.currentFee?.toFixed(2) ?? 0}元`
        : undefined,
      orderAmount: detailData.orderAmount
        ? `${detailData.orderAmount?.toFixed(2) ?? 0}元`
        : undefined,
      discountAmount:
        detailData.reduceAmount !== undefined
          ? `${detailData.reduceAmount?.toFixed(2) ?? 0}元`
          : undefined,
      actualPay:
        detailData.payAmount !== undefined
          ? `${detailData.payAmount?.toFixed(2) ?? 0}元`
          : undefined,
      paidAmount:
        detailData.payAmount !== undefined
          ? `${detailData.payAmount?.toFixed(2) ?? 0}元`
          : undefined, // same as actualPay
      unpaidAmount:
        orderStatusText === '待付款'
          ? `${(detailData.orderAmount - (detailData.payAmount || 0)).toFixed(
              2,
            )}元`
          : undefined,
      refundAmount:
        detailData.refundAmount !== undefined
          ? `${detailData.refundAmount?.toFixed(2) ?? 0}元`
          : undefined,
      endTime: detailData.realEndTime
        ? dayjs(detailData.realEndTime).format('YYYY-MM-DD HH:mm:ss')
        : undefined,
      payTime: detailData.payTime
        ? dayjs(detailData.payTime).format('YYYY-MM-DD HH:mm:ss')
        : undefined,
      aftersaleStartTime: detailData.afsApplyTime
        ? dayjs(detailData.afsApplyTime).format('YYYY-MM-DD HH:mm:ss')
        : undefined,
      aftersaleReason: detailData.afsReason || undefined,
      afsApplyAmount:
        detailData.afsApplyAmount !== undefined
          ? `${detailData.afsApplyAmount?.toFixed(2) ?? 0}元`
          : undefined,
      refundedAmount:
        detailData.refundAmount !== undefined
          ? `${detailData.refundAmount?.toFixed(2) ?? 0}元`
          : undefined,
      afsCompleteTime: detailData.afsCompleteTime
        ? dayjs(detailData.afsCompleteTime).format('YYYY-MM-DD HH:mm:ss')
        : undefined,
    };
  }, [detailData, orderType]);

  const showPayBtn = detailData?.canPay;
  const showContactBtn = detailData?.canContactMerchant;
  const showRefundBtn = detailData?.canUserRefund;
  const showIncomeHandleRefundBtn = detailData?.canMerchantDealRefund;
  const showAftersaleDetail =
    detail?.orderStatusText === '售后' || detailData?.afsFlag === 1;

  const [refundPopupVisible, setRefundPopupVisible] = useState(false);
  const [contactPopupVisible, setContactPopupVisible] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [refundReasonError, setRefundReasonError] = useState('');
  const [submittingRefund, setSubmittingRefund] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!orderNo) return;
    const res: any = await getLockOrderDetail({ orderNo });
    setLoading(false);
    if (res?.success) {
      setDetailData(res.data);
    } else {
      showToast({ title: res?.message || '加载订单详情失败', icon: 'info' });
    }
  }, [orderNo]);

  useEffect(() => {
    void fetchDetail();
  }, [fetchDetail]);

  const submitUserRefund = useCallback(async () => {
    if (submittingRefund) return;

    const reason = refundReason.trim();
    if (!reason) {
      setRefundReasonError('请输入售后原因');
      return;
    }

    const applyRefundAmount = Number(detailData?.canRefundAmount ?? 0);
    if (!applyRefundAmount || applyRefundAmount <= 0) {
      showToast({ title: '暂无可退款金额', icon: 'info' });
      return;
    }

    setSubmittingRefund(true);
    showLoading({ title: '提交中...' });
    try {
      const res: any = await postUserAfsRefund({
        orderNo,
        applyRefundAmount,
        refundReason: reason,
      });
      hideLoading();

      if (res?.success && res?.data) {
        setRefundPopupVisible(false);
        setRefundReason('');
        setRefundReasonError('');
        showToast({ title: '提交成功', icon: 'success' });
        await fetchDetail();
        return;
      }

      showToast({
        title: res?.msg || res?.message || '提交失败',
        icon: 'info',
      });
    } catch {
      showToast({ title: '提交失败', icon: 'info' });
    } finally {
      setSubmittingRefund(false);
    }
  }, [detailData, fetchDetail, orderNo, refundReason, submittingRefund]);
  const [handleRefundPopupVisible, setHandleRefundPopupVisible] =
    useState(false);
  const [handleRefundAmount, setHandleRefundAmount] = useState('');
  const [handleRefundReason, setHandleRefundReason] = useState('');
  const [handleRefundAmountError, setHandleRefundAmountError] = useState('');
  const [handleRefundReasonError, setHandleRefundReasonError] = useState('');
  const [submittingHandleRefund, setSubmittingHandleRefund] = useState(false);

  const merchantPhone = detailData?.merchantMobile || '17800928432';

  const parkingFee = detail?.orderAmount || detail?.currentFee || `0元`;
  const availableRefundAmount = detailData?.canRefundAmount ?? 0;

  const submitMerchantHandleRefund = useCallback(async () => {
    const amount = parseAmount(handleRefundAmount);
    const reason = handleRefundReason.trim();
    let hasError = false;

    if (!handleRefundAmount.trim() || amount < 0) {
      setHandleRefundAmountError('请输入退款金额');
      showToast({ title: '请输入退款金额', icon: 'info' });
      hasError = true;
    } else if (amount > availableRefundAmount) {
      setHandleRefundAmountError('退款金额不可大于可退款金额');
      showToast({ title: '退款金额不可大于可退款金额', icon: 'info' });
      hasError = true;
    } else {
      setHandleRefundAmountError('');
    }

    if (!reason) {
      setHandleRefundReasonError('请输入退款原因');
      showToast({ title: '请输入退款原因', icon: 'info' });
      hasError = true;
    } else {
      setHandleRefundReasonError('');
    }
    if (submittingHandleRefund) return;

    if (hasError) return;

    setSubmittingHandleRefund(true);
    showLoading({ title: '提交中...' });
    try {
      const res: any = await postMerchantDealRefund({
        orderNo,
        totalRefundAmount: amount,
        replyContent: reason,
      });
      hideLoading();

      if (res?.success && res?.data) {
        setHandleRefundPopupVisible(false);
        setHandleRefundAmount('');
        setHandleRefundReason('');
        setHandleRefundAmountError('');
        setHandleRefundReasonError('');
        showToast({ title: '处理成功', icon: 'success' });
        await fetchDetail();
        return;
      }

      showToast({
        title: res?.msg || res?.message || '处理失败',
        icon: 'info',
      });
    } catch {
      showToast({ title: '处理失败', icon: 'info' });
    } finally {
      setSubmittingHandleRefund(false);
    }
  }, [
    availableRefundAmount,
    fetchDetail,
    handleRefundAmount,
    handleRefundReason,
    orderNo,
    submittingHandleRefund,
  ]);

  const rows: Array<{ label: string; value?: string }> = detail
    ? [
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
        ...(detail.pricingRule
          ? [{ label: '收费方式', value: detail.pricingRule }]
          : []),
        ...(detail.maxFee ? [{ label: '最高收费', value: detail.maxFee }] : []),
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
      ]
    : [];

  const toPay = async () => {
    try {
      const tokenRes = await getMiniToken({});
      if (!tokenRes.success || !tokenRes.data?.token) {
        showToast({ title: '获取小程序token失败', icon: 'info' });
        return;
      }

      // 构建跳转参数
      const params: any = {
        orderNo,
        token: tokenRes.data.token,
      };
      // 打开小程序购买页面
      const queryString = Object.keys(params)
        .map(key => `${key}=${encodeURIComponent(String(params[key]))}`)
        .join('&');
      const result = await wechatOpenMiniProgram(
        `pages/order/detail/index?${queryString}`,
      );

      if (!result.result) {
        showToast({
          title: result.message || '打开小程序发起支付失败',
          icon: 'info',
        });
      }
    } catch (error: any) {
      showToast({
        title: error?.message || '发起支付失败，请重试',
        icon: 'info',
      });
    }
  };

  return (
    <PageContainer
      backgroundColor="#FFFFFF"
      statusBarStyle="dark-content"
      statusBarBackgroundColor="#FFFFFF"
      safeAreaEdges={['top', 'bottom']}
      scrollable={false}
      loading={loading}
      loadingType="content"
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
                style={[styles['footerBtn'], styles.footerBtnGhost]}
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
                onPress={() => toPay()}
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
      {detailData ? (
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
                <Text style={styles.value}>
                  {detail?.afsCompleteTime ? detail?.afsApplyAmount || '' : ''}
                </Text>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.refundDetailBtn}
                  onPress={() => {
                    navigation.navigate('MyOrderRefundDetail', {
                      orderNo,
                    });
                  }}
                >
                  <Text style={styles.refundDetailBtnText}>查看详情</Text>
                </TouchableOpacity>
              </View>
            </Flex>
          ) : null}
        </ScrollView>
      ) : (
        <MyEmpty emptyText="查询订单详情失败" />
      )}

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
                !refundReason.trim() || submittingRefund
                  ? styles.popConfirmBtnDisabled
                  : null,
              ]}
              onPress={() => {
                void submitUserRefund();
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
        showClose
      >
        <View style={styles.popWrap}>
          <Flex justify="between" align="center" style={styles.popRow}>
            <Text style={styles.popLabel}>订单金额</Text>
            <Text style={styles.popValue}>{detail?.orderAmount || '0元'}</Text>
          </Flex>
          <Flex justify="between" align="center" style={styles.popRow}>
            <Text style={styles.popLabel}>实际支付</Text>
            <Text style={styles.popValue}>{detail?.actualPay || '0元'}</Text>
          </Flex>
          <Flex justify="between" align="center" style={styles.popRow}>
            <Text style={styles.popLabel}>已退款</Text>
            <Text style={styles.popValue}>
              {detail?.refundedAmount || '0元'}
            </Text>
          </Flex>

          <View style={[styles.popReasonRow, { marginBottom: px(16) }]}>
            <Text style={styles.popLabel}>
              <Text style={styles.required}>*</Text>退款金额
            </Text>
            <TextInput
              style={styles.reasonInput}
              value={handleRefundAmount}
              onChangeText={text => {
                setHandleRefundAmount(text);
                const amount = parseAmount(text);
                if (amount > availableRefundAmount) {
                  setHandleRefundAmountError('退款金额不可大于可退款金额');
                } else {
                  setHandleRefundAmountError('');
                }
              }}
              placeholder="请输入退款金额"
              placeholderTextColor="#CCC"
              keyboardType="decimal-pad"
              decimalScale={2}
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
              style={[
                styles.popBtn,
                styles.popConfirmBtn,
                submittingHandleRefund ? styles.popConfirmBtnDisabled : null,
              ]}
              onPress={() => {
                void submitMerchantHandleRefund();
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
