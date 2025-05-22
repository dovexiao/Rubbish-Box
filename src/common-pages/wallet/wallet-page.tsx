import theme from '@/style';
import React, {useEffect} from 'react';
import {ScrollView, View} from 'react-native';
import {useInnerStyle} from './wallet.hooks';
// import globalStore from '@/services/global.state';
// import WalletTotalWallet from './wallet-total-wallet';
// import WalletTransfer from './wallet-transfer';
// import {getWalletAmountList} from './wallet.service';
import {goBack, goToWithLogin} from '@/utils';
// import {goBack, goCS, goToWithLogin, goTo} from '@/utils';
import DetailNavTitle from '@/components/business/detail-nav-title';
import {useRoute} from '@react-navigation/native';
import {BasicObject} from '@/types';
import {LazyImageLGBackground} from '@basicComponents/image';
import {useTranslation} from 'react-i18next';
import MeAmount from '@/pages/me/me-amount';
import MeRowMenu from '@/pages/me/me-row-menu';
import {MeListItem} from '@/components/business/list-item';
import {useToken, useUserActions} from '@/store/useUserStore';

const WalletPage = () => {
  const {i18n} = useTranslation();
  const {walletStyle} = useInnerStyle();
  const {isLogin} = useToken();
  const {getUserInfo} = useUserActions();
  // const [login, setLogin] = useState<boolean>(false);
  // const [amount, setAmount] = useState<number>(0);
  // const allAmount = useRef<number>();
  // const [thirdAmount, setThirdAmount] = useState(0);
  // const [mainAmount, setMainAmount] = useState(0);
  // const [walletList, setWalletList] = useState<WalletAmountListItem[]>([]);
  // const refreshWallet = (loading = true) => {
  //   loading && globalStore.globalLoading.next(true);
  //   if (login) {
  //     globalStore.updateAmount.next();
  //   }
  //   getWalletAmountList()
  //     .then(info => {
  //       const _amount = info.totalCreditAmount;
  //       if (allAmount.current == null) {
  //         allAmount.current = _amount;
  //       }
  //       setThirdAmount(_amount);
  //       setMainAmount(allAmount.current - _amount);
  //       // setWalletList(info.gamesList);
  //     })
  //     .finally(() => {
  //       globalStore.globalLoading.next(false);
  //     });
  // };

  const initAgentInfo = async () => {
    try {
    } catch (error) {}
  };

  useEffect(() => {
    if (isLogin) {
      initAgentInfo();
      getUserInfo();
    }
    // const sub = globalStore.tokenSubject.subscribe(token => {
    //   setLogin(!!token);
    //   if (token) {
    //     refreshWallet();
    //   }
    // });
    // const moneySub = globalStore.amountChanged.subscribe(res => {
    //   setAmount(res.current);
    // });

    return () => {
      // sub.unsubscribe();
      // moneySub.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLogin]);

  // const toRecharge = () => {
  //   if (!login) {
  //     goTo('Login');
  //     return;
  //   }
  //   // 跳转recharge
  //   goTo('Recharge');
  // };

  const route = useRoute();

  return (
    <LazyImageLGBackground style={[walletStyle.page, theme.position.rel]}>
      <DetailNavTitle
        title={i18n.t('wallet.title')}
        hideServer={true}
        hideAmount={true}
        onBack={
          (route.params as BasicObject)?.hideBack ? undefined : () => goBack()
        }
      />

      <ScrollView style={[theme.flex.flex1]}>
        <View style={[walletStyle.container, theme.padding.lrl]}>
          {/* <WalletTotalWallet
            login={login}
            amount={amount}
            onRecharge={toRecharge}
          /> */}
          <MeAmount onRefresh={getUserInfo} />
          <MeRowMenu />

          <MeListItem
            iconSize={18}
            icon={require('@assets/icons/home/home-menu/drawer-gold-area-5.webp')}
            title={`${i18n.t('me.bottom.myTransactions')} ${i18n.t(
              'other.records',
            )}`}
            onPress={() => {
              goToWithLogin('Transactions');
            }}
          />

          <View
            style={[
              theme.background.mainDark,
              theme.borderRadius.s,
              theme.margin.topm,
            ]}>
            <MeListItem
              mt={0}
              iconSize={18}
              icon={require('@assets/icons/home/home-menu/drawer-gold-area-2.webp')}
              title={`${i18n.t('label.recharge')} ${i18n.t('label.records')}`}
              onPress={() => {
                goToWithLogin('RechargeRecords');
              }}
            />
            <MeListItem
              mt={0}
              iconSize={18}
              icon={require('@assets/icons/home/home-menu/drawer-gold-area-2.webp')}
              title={`${i18n.t('other.withdraw')} ${i18n.t('other.records')}`}
              onPress={() => {
                goToWithLogin('WithdrawRecords');
              }}
            />
            <MeListItem
              mt={0}
              iconSize={18}
              icon={require('@assets/icons/home/home-menu/drawer-gold-area-2.webp')}
              title={`${i18n.t('label.transfer')} ${i18n.t('label.records')}`}
              onPress={() => {
                goToWithLogin('TransferRecords');
              }}
            />
          </View>
          <View
            style={[
              theme.background.mainDark,
              theme.borderRadius.s,
              theme.margin.topm,
            ]}>
            {/*<MeListItem*/}
            {/*  mt={0}*/}
            {/*  iconSize={18}*/}
            {/*  icon={require('@assets/icons/home/home-menu/drawer-gold-area-6.webp')}*/}
            {/*  title={i18n.t('proxy.home.commission-detail')}*/}
            {/*  onPress={() => {*/}
            {/*    if (!isLogin) {*/}
            {/*      return goTo('Login');*/}
            {/*    }*/}
            {/*    if (agentInfo?.userId != null) {*/}
            {/*      goTo('ProxyCommissionDetail', {*/}
            {/*        userId: agentInfo?.userId,*/}
            {/*        agentLevel: agentInfo?.agentLevel,*/}
            {/*      });*/}
            {/*    }*/}
            {/*  }}*/}
            {/*/>*/}
            <MeListItem
              mt={0}
              iconSize={18}
              icon={require('@assets/icons/home/home-menu/drawer-gold-area-4.webp')}
              title={`${i18n.t('me.bottom.myBets')} ${i18n.t('label.records')}`}
              onPress={() => {
                goToWithLogin('Bets');
              }}
            />
          </View>
          {/*<Button*/}
          {/*  style={[theme.margin.topl]}*/}
          {/*  title={i18n.t('me.bottom.customer')}*/}
          {/*  onPress={goCS}*/}
          {/*  type="linear-primary"*/}
          {/*/>*/}
        </View>
      </ScrollView>
    </LazyImageLGBackground>
  );
};

export default WalletPage;
