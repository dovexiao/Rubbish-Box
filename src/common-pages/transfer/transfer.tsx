import DetailNavTitle from '@/components/business/detail-nav-title';
import theme from '@/style';
import {goBack, goTo, toPriceStr} from '@/utils';
import React from 'react';
import {useTranslation} from 'react-i18next';
import Text from '@/components/basic/text';
import {ScrollView, View} from 'react-native';
import TransferBalance from './transfer-balance';
import Spin from '@/components/basic/spin';
import RechargeButton from '@/components/business/recharge-button';
import globalStore from '@/services/global.state';
import TransferAmount from './transfer-amount';
import {IUserInfo, postUserInfo} from '@/services/global.service';
import {plus, times} from '@components/utils/number-precision';
import {BasicObject} from '@/types';
import {onTransfer} from './transfer-service';
import {LazyImageLGBackground} from '@basicComponents/image';
const Transfer = () => {
  const {i18n} = useTranslation();

  const [loading, setLoading] = React.useState(false);
  const [amount, setAmount] = React.useState('');
  const [user, setUser] = React.useState<IUserInfo | BasicObject>({});
  React.useEffect(() => {
    getUserInfo().then();
  }, []);

  const getUserInfo = async (refresh = true) => {
    try {
      if (refresh) {
        setLoading(true);
      }
      const res = await postUserInfo();
      setUser(res);
    } finally {
      setLoading(false);
    }
  };

  const handleGotoRecords = () => {
    if (!globalStore.token) {
      goTo('Login', {backPage: 'Home'});
      return;
    }
    goTo('TransferRecords');
  };

  const actualReceived = React.useMemo(() => {
    const max = user?.canWithdrawAmount || 0;
    if (
      user!.withdrawalFreeConfigs &&
      user!.withdrawalFreeConfigs.length > 0 &&
      max > 0
    ) {
      if (amount && amount <= max) {
        const amountToNumber = Number(amount);
        if (!isNaN(amountToNumber)) {
          const config = user!.withdrawalFreeConfigs.find(
            (item: {maxValue: number; minValue: number}) => {
              return (
                item.maxValue >= amountToNumber &&
                item.minValue <= amountToNumber
              );
            },
          );
          if (config) {
            return times(plus(1, config.pct), amountToNumber);
          }
        }
      }
    }
    return 0;
  }, [amount, user]);

  const onSubmit = async () => {
    setLoading(true);
    onTransfer(Number(amount))
      .then(() => {
        getUserInfo(false);
        setAmount('');
        globalStore.globalSucessTotal(i18n.t('transfer-page.tip.success'));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <LazyImageLGBackground style={[theme.fill.fill, theme.flex.col]}>
      <DetailNavTitle
        onBack={goBack}
        hideServer
        hideAmount
        title={i18n.t('label.transfer')}
      />
      <Spin loading={loading} style={[theme.flex.flex1, theme.flex.col]}>
        <View style={[theme.flex.flex1, theme.flex.basis0]}>
          <ScrollView>
            <TransferBalance
              onGotoRecords={handleGotoRecords}
              balance={user?.canWithdrawAmount || 0}
            />
            <TransferAmount
              receiveAmount={actualReceived}
              inputAmount={amount}
              balance={user?.canWithdrawAmount || 0}
              onInputChange={setAmount}
            />
          </ScrollView>
        </View>
        <View style={[]}>
          <View
            style={[
              theme.flex.row,
              theme.flex.center,
              theme.padding.lrl,
              theme.padding.topl,
            ]}>
            <Text white size="medium">
              {i18n.t('transfer-page.label.willGet')}:{' '}
            </Text>
            <Text
              color={theme.fontColor.green}
              fontFamily="fontInterBold"
              fontSize={20}>
              {toPriceStr(actualReceived, {
                thousands: true,
                spacing: false,
                fixed: 2,
                currency: globalStore.currency,
              })}
            </Text>
          </View>
          <RechargeButton
            onRecharge={onSubmit}
            disabled={Boolean(!actualReceived)}
            text={i18n.t('label.confirm')}
          />
        </View>
      </Spin>
    </LazyImageLGBackground>
  );
};

export default Transfer;
