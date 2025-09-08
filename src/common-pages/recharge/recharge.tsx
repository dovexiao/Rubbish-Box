/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, {useMemo, useState, useEffect, useCallback} from 'react';
import {ScrollView, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import theme from '@/style';
import {goTo, goBack} from '@/utils';//goBack,
import globalStore from '@/services/global.state';

import {LazyImageLGBackground} from '@/components/basic/image';
import DetailNavTitle from '@/components/business/detail-nav-title';
import RechargeBalance from './recharge-balance';
import RechargeSelect from './recharge-select';
import RechargeChannel from './recharge-channel';
import RechargeButton from '@/components/business/recharge-button';
import Spin from '@/components/basic/spin';
import RechargeRule from './recharge-rule';
import { useFocusEffect } from '@react-navigation/native';
import {
  BalanceListItem,
  PayMethod,
  getBalanceList,
  getPayMethod,
  goIncome,
  paySuccess,
  getAdjustParams,
  AdjustParams,
} from './recharge.service';

import {Success, upiPayment} from '@/utils';
import useCouponStore from '@/store/useCouponStore';
// 导入Adjust事件跟踪函数
import { trackFirstDeposit, trackRecharge, trackDepositAll } from '@/utils/AdjustEventTracker';
// import { background, backgroundColor } from '@/components/style';

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

  const bBalance: number = Number(balance);
  let exResult: number = 0;
  const sortedBalanceList = [...balanceList].sort(
    (a, b) => a.balance - b.balance,
  );
  for (let i = 0; i < sortedBalanceList.length - 1; i++) {
    if (
      sortedBalanceList[i].balance <= bBalance &&
      bBalance < sortedBalanceList[i + 1].balance
    ) {
      exResult = (sortedBalanceList[i].giveBalance / 100) * bBalance;
      break; // 找到后退出循环
    }

    // 在循环内直接处理大于或等于最大值的情况
    if (
      i === sortedBalanceList.length - 2 &&
      bBalance >= sortedBalanceList[i + 1].balance
    ) {
      const lastItem = sortedBalanceList[i + 1];
      exResult = (lastItem.giveBalance / 100) * bBalance;
      break;
    }
  }
  const payMethodItem = useMemo(
    () => paymethodList.find(p => p.id === payMethodId),
    [paymethodList, payMethodId]
  );

  const balanceId = useMemo(() => {
    const item = balanceList.find(b => b.balance === +balance);
    return item ? item.id + '' : '';
  }, [balanceList, balance]);

  // ✅ 初始化获取充值选项并调用getAdjustParams
  useFocusEffect(
    React.useCallback(() => {
      // 每次页面获得焦点时执行（包括首次进入和返回进入）
      const fetchData = async () => {
        setLoading(true);
        try {
          // 调用getBalanceList和getPayMethod
          const [balances, methods, adjustParamsResponse] = await Promise.all([
            getBalanceList(),
            getPayMethod(),
            getAdjustParams() // 新增：调用getAdjustParams获取参数
          ]);
          
          setBalanceList(balances);
          setPaymethodList(methods);
          if (balances.length > 0) {
            setBalance(balances[0].balance + '');
          }
          if (methods.length > 0) {
            setPayMethodId(methods[0].id);
          }
          
          // 新增：处理Adjust参数并上报
          const adjustParams = adjustParamsResponse as AdjustParams;
          if (adjustParams) {
            // 上报首充事件
            if ('First_deposit' in adjustParams) {
              const amount = adjustParams.First_deposit ? parseFloat(String(adjustParams.First_deposit)) : 0;
              if (!isNaN(amount) && amount > 0) {
                await trackFirstDeposit(amount);
                console.log('上报首充事件成功');
              }
            }
            
            // 上报总充值事件
            if ('Deposit' in adjustParams) {
              const amount = adjustParams.Deposit ? parseFloat(String(adjustParams.Deposit)) : 0;
              if (!isNaN(amount) && amount > 0) {
                await trackDepositAll(amount);
                console.log('上报总充值事件成功');
              }
            }
            
            // 上报复充事件
            if ('Recharge' in adjustParams) {
              const amount = adjustParams.Recharge ? parseFloat(String(adjustParams.Recharge)) : 0;
              if (!isNaN(amount) && amount > 0) {
                await trackRecharge(amount);
                console.log('上报复充事件成功');
              }
            }
          }
        } catch (error) {
          console.error('Failed to fetch data or report to Adjust:', error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchData();
  
      // 订阅逻辑（保持不变）
      const sub = globalStore.amountChanged.subscribe(res => {
        setAmount(res.current);
        setLoading(false);
      });
  
      return () => {
        sub.unsubscribe(); // 页面失焦时取消订阅
      };
    }, []) // 空依赖 → useCallback确保函数引用稳定
  );

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

  const onFailure = useCallback((error: {msg: string, code?: number}) => {
    globalStore.globalWaringTotal(error.msg || i18n.t('recharge-page.tip.pay-failed'));
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
      const errorData = (error as any).data || {}
      globalStore.globalWaringTotal(errorData.msg || i18n.t('recharge-page.tip.pay-failed'));
    } finally {
      setLoading(false);
    }
  };
  const payMethodStr = payMethodItem?.payName ? `${payMethodItem?.payName}(${`Limit: ${payMethodItem.minAmount} - ${payMethodItem.maxAmount}`})` : '';
  return (
    <LazyImageLGBackground style={[theme.fill.fill, theme.flex.col]}>
      <DetailNavTitle
        onBack={goBack}
        hideAmount
        serverRight
        title={i18n.t('home.tab.deposit')}
      />
      <Spin loading={loading} style={[theme.flex.flex1, theme.flex.col, {backgroundColor: theme.basicColor.newBgInTwo}]}>
        <View style={[theme.flex.flex1, theme.flex.basis0]}>
          <ScrollView>
            <View style={[{backgroundColor: theme.basicColor.newBgInThree}]}>
              <RechargeBalance
                balance={amount}
                payMethod={payMethodStr}
                onRefresh={handleRefresh}
                onGotoRecords={handleGotoRecords}
              />
            </View>
            <View style={[theme.padding.lrl]}>
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
              <View style={[theme.padding.lrxxl]}>
                <RechargeRule />
              </View>
              {/* <View style={[{height: 30}]}></View> */}
          </ScrollView>
        </View>
        <RechargeButton
          disabled={balance === '' || +balance <= 0}
          onRecharge={handleRecharge}
          text={
            i18n.t('label.recharge') +
            (exResult > 0
              ? '( ' +
                i18n.t('recharge-page.extra') +
                ` +₹${exResult.toFixed(2).toString()} )`
              : '')
          }
        />
      </Spin>
    </LazyImageLGBackground>
  );
};

export default Recharge;
