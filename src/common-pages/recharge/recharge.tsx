import React, {useMemo, useState, useEffect, useCallback, useRef} from 'react';
import {BackHandler, Platform, ScrollView, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import theme from '@/style';
import {goTo, goBack, toPriceStr} from '@/utils'; //goBack,
import globalStore from '@/services/global.state';
import {LazyImageLGBackground} from '@/components/basic/image';
import DetailNavTitle from '@/components/business/detail-nav-title';
import RechargeBalance from './recharge-balance';
import RechargeSelect from './recharge-select';
import RechargeChannel from './recharge-channel';
import Spin from '@/components/basic/spin';
import RechargeRule from './recharge-rule';
import {useFocusEffect} from '@react-navigation/native';
import {
  BalanceListItem,
  PayMethod,
  getBalanceList,
  goIncome,
  paySuccess,
  getAdjustParams,
  getRechargeTypeList,
  AdjustParams,
  RechargeTypeListItem,
  getPayMethodV2,
} from './recharge.service';

import {Success, upiPayment} from '@/utils';
import useCouponStore from '@/store/useCouponStore';
import {
  trackFirstDeposit,
  trackRecharge,
  trackDepositAll,
} from '@/utils/AdjustEventTracker';
import RechargeCheckBoxes from './recharge-checkboxes';
import RechargeButton from '@/common-pages/recharge/RechargeButton';
import RechargeType, {RechargeTypeProps} from './recharge-type';
import RechargeModal from './recharge-modal';
import {useSkipTodayModal} from './recharge.hooks';

function findMatchingData(balance: number, data: PayMethod[]) {
  if (data.length > 0) {
    const matchedData =
      data.find(
        item => balance >= item.minAmount && balance <= item.maxAmount,
      ) || null;

    return matchedData;
  }
}

const Recharge = () => {
  const {i18n} = useTranslation();

  const [balanceList, setBalanceList] = useState<BalanceListItem[]>([]);
  const [paymethodList, setPaymethodList] = useState<PayMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<string>(''); // 金额输入
  const balanceRef = useRef('');
  const [payMethodId, setPayMethodId] = useState<number>();
  const [incomeInfo, setIncomeInfo] = useState({upiId: '', orderNo: ''});
  const [selectedRechargeTypeId, setSelectedRechargeTypeId] = useState('');
  const [rechargetTypeList, setRechargetTypeList] = useState<
    RechargeTypeListItem[]
  >([]);

  const allPaymethodListRef = useRef<PayMethod[]>([]);
  const [isShowRechargeModal, setIsShowRechargeModal] = useState(false);
  const {checkShouldShow} = useSkipTodayModal('recharge');

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
    [paymethodList, payMethodId],
  );

  useEffect(() => {
    const backAction = () => {
      // 自定义返回键按下时的行为
      handleNavTitleBack();

      return true; // 阻止默认返回行为
    };

    // 添加返回键监听
    if (Platform.OS !== 'web') {
      BackHandler.addEventListener('hardwareBackPress', backAction);
      // window.addEventListener('popstate', backAction);
    }

    // 在组件卸载时移除监听
    return () => {
      if (Platform.OS !== 'web') {
        BackHandler.removeEventListener('hardwareBackPress', backAction);
        // window.removeEventListener('popstate', backAction);
      }
    };
  }, []);

  const balanceId = useMemo(() => {
    const item = balanceList.find(b => b.balance === +balance);
    return item ? item.id + '' : '';
  }, [balanceList, balance]);

  useEffect(() => {
    balanceRef.current = balance;
  }, [balance]);

  // ✅ 初始化获取充值选项并调用getAdjustParams
  useFocusEffect(
    React.useCallback(() => {
      // 每次页面获得焦点时执行（包括首次进入和返回进入）
      const fetchData = async () => {
        setLoading(true);
        try {
          // 调用getBalanceList和getPayMethod
          const [balances, allMethods, adjustParamsResponse, rechargeTypes] =
            await Promise.all([
              getBalanceList(),
              getPayMethodV2({modeId: '1'}),
              getAdjustParams(), // 新增：调用getAdjustParams获取参数
              getRechargeTypeList(),
            ]);

          setBalanceList(balances);
          setRechargetTypeList(rechargeTypes);

          if (balances.length > 0) {
            setBalance(balances[0].balance + '');
          }

          if (allMethods.length > 0) {
            allPaymethodListRef.current = allMethods;
          }

          if (rechargeTypes.length > 0) {
            setSelectedRechargeTypeId(rechargeTypes[0].id + '');
            getPayMethodByRechargeTypeId(rechargeTypes[0].id + '');
          }

          // 新增：处理Adjust参数并上报
          const adjustParams = adjustParamsResponse as AdjustParams;
          if (adjustParams) {
            // 上报首充事件
            if ('First_deposit' in adjustParams) {
              const amount = adjustParams.First_deposit
                ? parseFloat(String(adjustParams.First_deposit))
                : 0;
              if (!isNaN(amount) && amount > 0) {
                await trackFirstDeposit(amount);
                console.log('上报首充事件成功');
              }
            }

            // 上报总充值事件
            if ('Deposit' in adjustParams) {
              const amount = adjustParams.Deposit
                ? parseFloat(String(adjustParams.Deposit))
                : 0;
              if (!isNaN(amount) && amount > 0) {
                await trackDepositAll(amount);
                console.log('上报总充值事件成功');
              }
            }

            // 上报复充事件
            if ('Recharge' in adjustParams) {
              const amount = adjustParams.Recharge
                ? parseFloat(String(adjustParams.Recharge))
                : 0;
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

      // TODO: 这块逻辑是否与上面的订阅重复了
      // 订阅逻辑（保持不变）
      const sub = globalStore.amountChanged.subscribe(res => {
        setAmount(res.current);
        setLoading(false);
      });

      return () => {
        sub.unsubscribe(); // 页面失焦时取消订阅
      };
    }, []), // 空依赖 → useCallback确保函数引用稳定
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
  const onSuccess = useCallback(
    (success: Success) => {
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
    },
    [incomeInfo.orderNo],
  );

  const onFailure = useCallback(
    (error: {msg: string; code?: number}) => {
      globalStore.globalWaringTotal(
        error.msg || i18n.t('recharge-page.tip.pay-failed'),
      );
    },
    [i18n],
  );

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
      globalStore.globalWaringTotal(
        i18n.t('recharge-page.tip.paymethod-error'),
      );
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
      const errorData = (error as any).data || {};
      globalStore.globalWaringTotal(
        errorData.msg || i18n.t('recharge-page.tip.pay-failed'),
      );
    } finally {
      setLoading(false);
    }
  };
  const payMethodStr = payMethodItem?.payName
    ? `${
        payMethodItem?.payName
      }(${`Limit: ${payMethodItem.minAmount} - ${payMethodItem.maxAmount}`})`
    : '';

  const exResult = useMemo(() => {
    if (!balance || !balanceList || balanceList.length === 0) {
      return 0;
    }

    const bBalance: number = Number(balance);

    // 排序balanceList按照balance属性做升序
    const sortedBalanceList = [...balanceList].sort(
      (a, b) => a.balance - b.balance,
    );

    if (bBalance < balanceList[0].balance) {
      return 0;
    }

    // 找到第一个balance属性大于bBalance的项
    const targetIndex = sortedBalanceList.findIndex(
      item => item.balance > bBalance,
    );

    if (targetIndex > 0) {
      // 取前一个项的giveBalance
      const previousItem = sortedBalanceList[targetIndex - 1];
      return previousItem.giveBalance;
    }

    // 如果没有找到大于bBalance的项，说明bBalance大于等于所有项，取最后一个项
    if (sortedBalanceList.length > 0) {
      const lastItem = sortedBalanceList[sortedBalanceList.length - 1];
      return lastItem.giveBalance;
    }

    return 0;
  }, [balance, balanceList]);

  /**
   * 充值类型 - 切换事件
   *
   * @param {string} id
   */
  const onRechargeTypeChange: RechargeTypeProps['onChange'] = id => {
    setSelectedRechargeTypeId(id);
    getPayMethodByRechargeTypeId(id);
  };

  /**
   * 根据支付类型获取支付通道
   *
   * @param {string} id - 支付类型 ID
   */
  const getPayMethodByRechargeTypeId = async (id: string) => {
    const target = String(id).trim();

    // 过滤出所有 remarks 中包含该 id 的项
    const result = allPaymethodListRef.current.filter(method => {
      if (!method.remarks) return false;

      const remarkIds = method.remarks
        .split(',')
        .map(r => r.trim())
        .filter(r => r.length > 0);

      return remarkIds.includes(target);
    });

    setPaymethodList(result);

    if (result.length > 0) {
      const data = findMatchingData(Number(balanceRef.current), result);

      if (data) {
        setPayMethodId(data.id);
      } else {
        setPayMethodId(undefined);
      }
    }
  };

  /**
   * 返回时候显示弹窗
   */
  const handleNavTitleBack = async () => {
    const shouldShowModal = await checkShouldShow();

    if (shouldShowModal) {
      setIsShowRechargeModal(true);
    } else {
      goBack();
    }
  };

  return (
    <LazyImageLGBackground style={[theme.fill.fill, theme.flex.col]}>
      <DetailNavTitle
        onBack={handleNavTitleBack}
        hideAmount
        serverRight
        title={i18n.t('home.tab.deposit')}
        style={{backgroundColor: theme.basicColor.newBgInTwo}}
      />
      <Spin
        loading={loading}
        style={[
          theme.flex.flex1,
          theme.flex.col,
          {backgroundColor: theme.basicColor.newBgInTwo},
        ]}>
        <View style={[theme.flex.flex1, theme.flex.basis0]}>
          <ScrollView>
            <View style={[theme.padding.lrxs]}>
              <RechargeBalance
                balance={amount}
                payMethod={payMethodStr}
                onRefresh={handleRefresh}
                onGotoRecords={handleGotoRecords}
              />
              <RechargeCheckBoxes />
              <RechargeSelect
                min={payMethodItem?.minAmount || 0}
                max={payMethodItem?.maxAmount || 0}
                balance={balance}
                balanceList={balanceList}
                onChangeBalance={setBalance}
              />
              <RechargeType
                typeList={rechargetTypeList}
                onChange={onRechargeTypeChange}
                value={selectedRechargeTypeId}
              />
              <RechargeChannel
                payMethodList={paymethodList}
                onPayMethodChange={setPayMethodId}
                payMethodId={payMethodId}
                balance={balance}
              />
              {/* <RechargeDepositEvent
                checked={isAgreedNotice}
                onToggle={setIsAgreedNotice}
              /> */}

              <RechargeRule />
            </View>
          </ScrollView>
        </View>
        <RechargeButton
          disabled={balance === '' || +balance <= 0}
          onRecharge={handleRecharge}
          text={
            exResult > 0
              ? i18n.t('recharge-page.extra') +
                ` +₹ ${toPriceStr(exResult, {
                  fixed: 0,
                  showCurrency: false,
                  thousands: true,
                })}`
              : ''
          }
          type="linear-primary"
        />
      </Spin>
      <RechargeModal
        visible={isShowRechargeModal}
        onClose={() => setIsShowRechargeModal(false)}
        amount={
          balanceList.length > 0
            ? balanceList[balanceList.length - 1].giveBalance
            : 0
        }
      />
    </LazyImageLGBackground>
  );
};

export default Recharge;
