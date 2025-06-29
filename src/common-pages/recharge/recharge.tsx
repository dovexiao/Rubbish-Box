/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import DetailNavTitle from '@/components/business/detail-nav-title';
import theme from '@/style';
import {goBack, goTo} from '@/utils';
import React, {useMemo, useState} from 'react';
import {ScrollView, View} from 'react-native';
import RechargeChannel from './recharge-channel';
import {
  BalanceListItem,
  PayMethod,
  getBalanceList,
  getPayMethod,
  goIncome,
  paySuccess,
} from './recharge.service';
import Spin from '@/components/basic/spin';
import {Success, upiPayment} from '@/utils';
import RechargeBalance from './recharge-balance';
import RechargeSelect from './recharge-select';
import RechargeButton from '@/components/business/recharge-button';
import globalStore from '@/services/global.state';
import {useTranslation} from 'react-i18next';
import {LazyImageLGBackground} from '@/components/basic/image';
import useCouponStore from '@/store/useCouponStore';

const Recharge = () => {
  const {i18n} = useTranslation();
  const [balanceList, setBalanceList] = React.useState<BalanceListItem[]>([]);
  const [paymethodList, setPaymenthodList] = React.useState<PayMethod[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [balance, setBalance] = React.useState('');
  const [payMethodId, setPayMethodId] = React.useState<number>();

  const payMethodItem = useMemo(() => {
    return paymethodList.find(p => p.id === payMethodId);
  }, [paymethodList, payMethodId]);

  const balanceId = useMemo(() => {
    const item = balanceList.find(b => b.balance === +balance);
    return item ? item.id + '' : '';
  }, [balanceList, balance]);
  const [amount] = useState<number>(0);
  const [incomeInfo, setIncomeInfo] = React.useState({
    upiId: '',
    orderNo: '',
  });
  React.useEffect(() => {
    setLoading(true);
    Promise.all([getBalanceList(), getPayMethod()])
      .then(([blance, paymenthod]) => {
        setBalanceList(blance);
        setBalance((blance[0]?.balance || '') + '');
        setPaymenthodList(paymenthod);
        setPayMethodId(paymenthod[0].id);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleRefresh = () => {
    if (!globalStore.token) {
      goTo('Login', {backPage: 'Home'});
      return;
    }
    setLoading(true);
    globalStore.updateAmount.next();
  };

  const handleGotoRecords = () => {
    if (!globalStore.token) {
      goTo('Login', {backPage: 'Home'});
      return;
    }
    goTo('RechargeRecords');
  };

  // 支付成功回调
  const onSuccess = (success: Success) => {
    if (success.status === 'SUCCESS') {
      paySuccess({
        orderNo: incomeInfo.orderNo,
        tradeResult: '1',
        approvalUrt: success.approvalRefNo,
      })
        .then()
        .finally(() => {
          globalStore.updateAmount.next();
        });
    } else {
    }
  };
  const onFailure = (error: Error) => {
    globalStore.globalWaringTotal(error.message);
  };

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
      globalStore.globalWaringTotal(
        i18n.t('recharge-page.tip.paymethod-error'),
      );
      return;
    }
    setLoading(true);
    goIncome({
      balanceId: balanceId || 0,
      payTag: payMethodItem.payTag,
      payTypeId: payMethodId + '',
      rechargeBalance: balanceId ? 0 : balance,
      couponRecordId: selectedCoupon?.id || 0,
    })
      .then(res => {
        if (typeof res === 'string') {
          if (globalStore.isWeb) {
            location.href = res;
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
      })
      .finally(() => {
        setLoading(false);
      });
  };
  // 吊起APP支付
  const onPay = () => {
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
  };

  React.useEffect(() => {
    if (incomeInfo.orderNo && incomeInfo.upiId) {
      onPay();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomeInfo]);

  const selectedCoupon = useCouponStore(state => state.selectedCoupon);

  return (
    <LazyImageLGBackground style={[theme.fill.fill, theme.flex.col]}>
      <DetailNavTitle
        onBack={goBack}
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
                onChangeBalance={val => {
                  setBalance(val);
                }}
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
