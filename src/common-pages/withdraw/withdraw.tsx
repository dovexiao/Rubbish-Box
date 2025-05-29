import React from 'react';
import {ScrollView, View} from 'react-native';
import DetailNavTitle from '@/components/business/detail-nav-title';
import theme from '@/style';
import {goBack, goTo} from '@/utils';
import {useTranslation} from 'react-i18next';
import Spin from '@/components/basic/spin';
import WithdrawBalance from './withdraw-balance';
import WithdrawAmount from './withdraw-amount';
import WithdrawBank from './withdraw-bank';
import {BottomSheet} from '@rneui/themed';
import SelectCards from './select-cards';
import WithdrawSuccess from './withdraw-success';
import {getBankList, CardListItemType, onWithdraw} from './withdraw-service';
import globalStore from '@/services/global.state';
import WithdrawTransfer from './withdraw-transfer';
import {IUserInfo, postUserInfo} from '@/services/global.service';
import {BasicObject} from '@/types';
import {plus, times} from '@/components/utils/number-precision';
import {onTransfer} from '../transfer/transfer-service';
import {useNavigation} from '@react-navigation/native';
import {LazyImageLGBackground} from '@/components/basic/image';
import WithdrawButton from '@businessComponents/recharge-button/withdraw-button';

const Withdraw = () => {
  const {i18n} = useTranslation();
  const [loading, setLoading] = React.useState(false);
  const [cardList, setCardList] = React.useState<CardListItemType[]>([]);
  const [showCard, setShowCard] = React.useState(false);
  const [showTransfer, setShowTransfer] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [amount, setAmount] = React.useState('');
  const [price, setPrice] = React.useState<string>('');
  const [selectedCard, setSelectedCard] = React.useState<string | undefined>();
  const [user, setUser] = React.useState<IUserInfo | BasicObject>({});
  const navigation = useNavigation();
  React.useEffect(() => {
    setLoading(true);
    Promise.allSettled([getUserInfo(), onGetBankList()]).finally(() =>
      setLoading(false),
    );
    navigation.addListener('focus', () => {
      onGetBankList();
    });
  }, [navigation]);

  const getUserInfo = async (refresh = false) => {
    try {
      if (refresh) {
        setLoading(true);
      }
      const res = await postUserInfo();
      setUser(res);
    } finally {
      if (refresh) {
        setLoading(false);
      }
    }
  };

  const onGetBankList = async (refresh = false) => {
    try {
      if (refresh) {
        setLoading(true);
      }
      const res = (await getBankList()) || [];
      if (res.length > 0) {
        setSelectedCard(res[0]?.id);
      }
      setCardList(res);
    } finally {
      if (refresh) {
        setLoading(false);
      }
    }
  };

  const handleRefresh = () => {
    if (!globalStore.token) {
      goTo('Login', {backPage: 'Home'});
      return;
    }
    getUserInfo(true);
  };

  const selectedBankCard = React.useMemo(() => {
    return cardList.find(item => item.id === selectedCard) || {};
  }, [selectedCard, cardList]);

  const onGoAddBank = (cardInfo?: CardListItemType) => {
    if (!globalStore.token) {
      goTo('Login', {backPage: 'Home'});
      return;
    }
    goTo('AddBank', {
      isFirst: cardList.length === 0 ? '1' : '0',
      cardInfo,
    });
  };

  const onWithdrawSubmit = async () => {
    try {
      if (!selectedCard) {
        globalStore.globalWaringTotal(i18n.t('withdraw-page.error.addCard'));
        return;
      }
      if (!price) {
        globalStore.globalWaringTotal(i18n.t('withdraw-page.error.addAmount'));
        return;
      }
      setLoading(true);
      await onWithdraw({
        cardId: selectedCard,
        price: Number(price),
      });
      setShowSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  const getReceive = React.useMemo(() => {
    if (price) {
      return (Number(price) * 0.97).toFixed(2);
    }
    return '';
  }, [price]);

  const handleGotoRecords = () => {
    if (!globalStore.token) {
      goTo('Login', {backPage: 'Home'});
      return;
    }
    goTo('WithdrawRecords');
  };

  const onSubmitTransfer = async () => {
    setShowTransfer(false);
    setLoading(true);
    onTransfer(Number(amount))
      .then(() => {
        getUserInfo(false);
        globalStore.globalSucessTotal(i18n.t('transfer-page.tip.success'));
      })
      .finally(() => {
        setAmount('');
        setLoading(false);
      });
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

  return (
    <LazyImageLGBackground style={[theme.fill.fill, theme.flex.col]}>
      <DetailNavTitle
        onBack={goBack}
        hideServer
        hideAmount
        title={i18n.t('other.withdraw')}
      />
      {showSuccess ? (
        <WithdrawSuccess
          amount={Number(getReceive)}
          onFinish={() => {
            setPrice('');
            handleRefresh();
            setShowSuccess(false);
          }}
        />
      ) : (
        <Spin
          loading={loading}
          style={[theme.flex.flex1, theme.flex.col, theme.flex.start]}>
          <View style={[theme.flex.flex1, theme.flex.basis0]}>
            <ScrollView contentContainerStyle={[]} style={[theme.flex.flex1]}>
              <WithdrawBalance
                onGotoRecords={handleGotoRecords}
                balance={user!.canWithdrawAmount}
                onRefresh={handleRefresh}
                onPressTransfer={() => {
                  setShowTransfer(true);
                }}
              />
              <WithdrawBank
                bankInfo={selectedBankCard}
                onSelectBank={() => setShowCard(true)}
                onAddBank={() => onGoAddBank()}
              />
              <WithdrawAmount
                receiveAmount={getReceive}
                amount={price}
                onAmountChange={setPrice}
              />
            </ScrollView>
          </View>
          <WithdrawButton
            onRecharge={onWithdrawSubmit}
            type="linear-primary-gold"
            text={i18n.t('other.withdraw')}
          />
        </Spin>
      )}

      <BottomSheet
        modalProps={{
          animationType: 'fade',
        }}
        isVisible={showCard}>
        <SelectCards
          onClose={() => setShowCard(false)}
          list={cardList}
          onAddBank={(card?: CardListItemType) => {
            setShowCard(false);
            onGoAddBank(card);
          }}
          value={selectedCard}
          onChange={v => {
            setSelectedCard(v);
          }}
        />
      </BottomSheet>
      <BottomSheet
        modalProps={{
          animationType: 'fade',
        }}
        isVisible={showTransfer}>
        <WithdrawTransfer
          onConfirm={onSubmitTransfer}
          onClose={() => {
            setAmount('');
            setShowTransfer(false);
          }}
          withdrawAmount={user!.canWithdrawAmount}
          inputAmount={amount}
          onInputChange={setAmount}
          receiveAmount={actualReceived}
        />
      </BottomSheet>
    </LazyImageLGBackground>
  );
};

export default Withdraw;
