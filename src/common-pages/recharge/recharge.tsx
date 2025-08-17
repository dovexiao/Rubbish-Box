/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, {useMemo, useState, useEffect, useCallback} from 'react';
import {ScrollView, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import theme from '@/style';
import {goTo} from '@/utils';//goBack, 
import globalStore from '@/services/global.state';

import {LazyImageLGBackground} from '@/components/basic/image';
import DetailNavTitle from '@/components/business/detail-nav-title';
import RechargeBalance from './recharge-balance';
import RechargeSelect from './recharge-select';
import RechargeChannel from './recharge-channel';
import RechargeButton from '@/components/business/recharge-button';
import Spin from '@/components/basic/spin';

import {
  BalanceListItem,
  PayMethod,
  getBalanceList,
  getPayMethod,
  goIncome,
  paySuccess,
} from './recharge.service';

import {Success, upiPayment} from '@/utils';
import useCouponStore from '@/store/useCouponStore';

const Recharge = () => {
  const {i18n} = useTranslation();

  const [balanceList, setBalanceList] = useState<BalanceListItem[]>([]);
  const [paymethodList, setPaymethodList] = useState<PayMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<string>(''); // 金额输入
  const [payMethodId, setPayMethodId] = useState<number>();
  const [incomeInfo, setIncomeInfo] = useState({ upiId: '', orderNo: '' });

  const selectedCoupon = useCouponStore(state => state.selectedCoupon);

  const [amount, setAmount] = useState<number>(0);
  useEffect(() => {
    const sub = globalStore.amountChanged.subscribe(res => {
      setAmount(res.current);
      setLoading(false);
    });
    return () => {
      sub.unsubscribe();
    };
  }, []);

  const payMethodItem = useMemo(
    () => paymethodList.find(p => p.id === payMethodId),
    [paymethodList, payMethodId]
  );

  const balanceId = useMemo(() => {
    const item = balanceList.find(b => b.balance === +balance);
    return item ? item.id + '' : '';
  }, [balanceList, balance]);

  // ✅ 初始化获取充值选项
  useEffect(() => {
    setLoading(true);
    Promise.all([getBalanceList(), getPayMethod()])
      .then(([balances, methods]) => {
        setBalanceList(balances);
        setPaymethodList(methods);
        if (balances.length > 0) {
          setBalance(balances[0].balance + '');
        }
        if (methods.length > 0) {
          setPayMethodId(methods[0].id);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // ✅ 刷新余额
  const handleRefresh = useCallback(() => {
    if (!globalStore.token) {
      goTo('Login', {backPage: 'Home'});
    } else {
      setLoading(true);
      globalStore.updateAmount.next();
    }
  }, []);

  const handleGotoRecords = useCallback(() => {
    if (!globalStore.token) {
      goTo('Login', {backPage: 'Home'});
    } else {
      goTo('RechargeRecords');
    }
  }, []);

  // ✅ 支付成功回调
  const onSuccess = useCallback((success: Success) => {
    if (success.status === 'SUCCESS') {
      paySuccess({
        orderNo: incomeInfo.orderNo,
        tradeResult: '1',
        approvalUrt: success.approvalRefNo,
      })
        .catch(err => {
          console.error('支付成功状态上报失败', err);
        })
        .finally(() => {
          globalStore.updateAmount.next();
        });
    }
  }, [incomeInfo.orderNo]);

  const onFailure = useCallback((error: Error) => {
    globalStore.globalWaringTotal(error.message || i18n.t('recharge-page.tip.pay-failed'));
  }, [i18n]);

  // ✅ 发起支付
  const onPay = useCallback(() => {
    const config = {
      payeeVpa: incomeInfo.upiId,
      payeeName: incomeInfo.upiId,
      merchantCode: incomeInfo.upiId,
      transactionId: incomeInfo.orderNo,
      transactionRefId: incomeInfo.orderNo,
      description: incomeInfo.orderNo,
      amount: balance + '',
    };
    upiPayment.initiate('net.one97.paytm', '', config, onSuccess, onFailure);
  }, [incomeInfo, balance, onSuccess, onFailure]);

  // ✅ 当接口返回支付信息后，触发支付
  useEffect(() => {
    if (incomeInfo.orderNo && incomeInfo.upiId) {
      onPay();
    }
  }, [incomeInfo, onPay]);

  // ✅ 发起充值流程
  const handleRecharge = async () => {
    const {minAmount, maxAmount} = payMethodItem || {};
    if (
      !balance ||
      +balance <= 0 ||
      (minAmount && +balance < minAmount) ||
      (maxAmount && +balance > maxAmount)
    ) {
      globalStore.globalWaringTotal(i18n.t('recharge-page.tip.money-error'));
      return;
    }

    if (!payMethodItem) {
      globalStore.globalWaringTotal(i18n.t('recharge-page.tip.paymethod-error'));
      return;
    }

    setLoading(true);
    try {
      const res = await goIncome({
        balanceId: balanceId || 0,
        payTag: payMethodItem.payTag,
        payTypeId: payMethodId + '',
        rechargeBalance: balanceId ? 0 : balance,
        couponRecordId: selectedCoupon?.id || 0,
      });

      if (typeof res === 'string') {
        if (globalStore.isWeb) {
          window.location.href = res;
        } else {
          goTo('WebView', {
            originUrl: res,
            header: true,
            headerTitle: i18n.t('home.tab.deposit'),
            serverRight: false,
            hideAmount: true,
          });
        }
      } else {
        setIncomeInfo(res);
      }
    } catch (error) {
      globalStore.globalWaringTotal(i18n.t('recharge-page.tip.pay-failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <LazyImageLGBackground style={[theme.fill.fill, theme.flex.col]}>
      <DetailNavTitle
        // onBack={goBack}
        hideAmount
        serverRight
        title={i18n.t('home.tab.deposit')}
      />
      <Spin loading={loading} style={[theme.flex.flex1, theme.flex.col]}>
        <View style={[theme.flex.flex1, theme.flex.basis0]}>
          <ScrollView>
            <RechargeBalance
              balance={amount}
              payMethod={payMethodItem?.payName}
              onRefresh={handleRefresh}
              onGotoRecords={handleGotoRecords}
            />
            <View style={[theme.padding.lrl, theme.fill.fillH]}>
              <RechargeSelect
                min={payMethodItem?.minAmount || 0}
                max={payMethodItem?.maxAmount || 0}
                balance={balance}
                balanceList={balanceList}
                onChangeBalance={setBalance}
              />
              <RechargeChannel
                payMethodList={paymethodList}
                onPayMethodChange={setPayMethodId}
                payMethodId={payMethodId}
                balance={balance}
              />
            </View>
          </ScrollView>
        </View>
        <RechargeButton
          disabled={balance === '' || +balance <= 0}
          onRecharge={handleRecharge}
        />
      </Spin>
    </LazyImageLGBackground>
  );
};

export default Recharge;
