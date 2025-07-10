/* eslint-disable prettier/prettier */
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ScrollView, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import {BottomSheet} from '@rneui/themed';

import theme from '@/style';
import {goBack, goTo} from '@/utils';
import globalStore from '@/services/global.state';
import {LazyImageLGBackground} from '@/components/basic/image';
import DetailNavTitle from '@/components/business/detail-nav-title';
import Spin from '@/components/basic/spin';

import WithdrawBalance from './withdraw-balance';
import WithdrawAmount from './withdraw-amount';
import WithdrawBank from './withdraw-bank';
import WithdrawSuccess from './withdraw-success';
import WithdrawTransfer from './withdraw-transfer';
import SelectCards from './select-cards';
import WithdrawButton from '@businessComponents/recharge-button/withdraw-button';

import {
  getBankList,
  CardListItemType,
  onWithdraw,
} from './withdraw-service';
import {postUserInfo, IUserInfo} from '@/services/global.service';
import {onTransfer} from '../transfer/transfer-service';
import {plus, times} from '@/components/utils/number-precision';

const Withdraw = () => {
  const {i18n} = useTranslation();
  const navigation = useNavigation();

  const [loading, setLoading] = useState(false);
  const [cardList, setCardList] = useState<CardListItemType[]>([]);
  const [selectedCard, setSelectedCard] = useState<string>();
  const [showCard, setShowCard] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [user, setUser] = useState<IUserInfo | undefined>();
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');

  // ======================
  // ✅ 初始化加载数据
  // ======================
  const fetchUserAndBanks = useCallback(async () => {
    setLoading(true);
    try {
      const [userRes, bankRes] = await Promise.all([
        postUserInfo(),
        getBankList(),
      ]);
      setUser(userRes);
      setCardList(bankRes || []);
      if (bankRes?.length) {
        setSelectedCard(bankRes[0].id);
      }
    } catch (err) {
      console.error('初始化失败', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserAndBanks();
  }, [fetchUserAndBanks]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      getBankList().then(res => {
        setCardList(res || []);
        if (res?.length) {
          setSelectedCard(res[0].id);
        }
      });
    });
    return unsubscribe;
  }, [navigation]);

  const handleRefresh = useCallback(() => {
    if (!globalStore.token) {
      goTo('Login', {backPage: 'Home'});
    } else {
      fetchUserAndBanks();
    }
  }, [fetchUserAndBanks]);

  const selectedBankCard = useMemo(() => {
    return cardList.find(item => item.id === selectedCard);
  }, [selectedCard, cardList]);

  const handleGotoRecords = useCallback(() => {
    if (!globalStore.token) {
      goTo('Login', {backPage: 'Home'});
    } else {
      goTo('WithdrawRecords');
    }
  }, []);

  const getReceive = useMemo(() => {
    return price ? (Number(price) * 0.97).toFixed(2) : '';
  }, [price]);

  const actualReceived = useMemo(() => {
    const max = user?.canWithdrawAmount || 0;
    const num = Number(amount);
    if (
      !isNaN(num) &&
      user?.withdrawalFreeConfigs?.length &&
      num <= max
    ) {
      const config = user.withdrawalFreeConfigs.find(
        (c: { minValue: number; maxValue: number; pct: number }) =>
          num >= c.minValue && num <= c.maxValue,
      );
      if (config) {
        return times(plus(1, config.pct), num);
      }
    }
    return 0;
  }, [amount, user]);


  const onGoAddBank = useCallback((cardInfo?: CardListItemType) => {
    if (!globalStore.token) {
      goTo('Login', {backPage: 'Home'});
      return;
    }
    goTo('AddBank', {
      isFirst: cardList.length === 0 ? '1' : '0',
      cardInfo,
    });
  }, [cardList]);

  const onWithdrawSubmit = async () => {
    if (!selectedCard) {
      globalStore.globalWaringTotal(i18n.t('withdraw-page.error.addCard'));
      return;
    }
    if (!price || Number(price) <= 0) {
      globalStore.globalWaringTotal(i18n.t('withdraw-page.error.addAmount'));
      return;
    }
    setLoading(true);
    try {
      await onWithdraw({
        cardId: selectedCard,
        price: Number(price),
      });
      setShowSuccess(true);
    } catch (err) {
      console.error('提现失败', err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmitTransfer = async () => {
    setShowTransfer(false);
    setLoading(true);
    try {
      await onTransfer(Number(amount));
      await fetchUserAndBanks();
      globalStore.globalSucessTotal(i18n.t('transfer-page.tip.success'));
    } catch (err) {
      console.error('转账失败', err);
    } finally {
      setAmount('');
      setLoading(false);
    }
  };

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
        <Spin loading={loading} style={[theme.flex.flex1, theme.flex.col]}>
          <View style={[theme.flex.flex1]}>
            <ScrollView style={[theme.flex.flex1]}>
              <WithdrawBalance
                onGotoRecords={handleGotoRecords}
                balance={user?.canWithdrawAmount || 0}
                onRefresh={handleRefresh}
                onPressTransfer={() => setShowTransfer(true)}
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

      <BottomSheet isVisible={showCard}>
        <SelectCards
          list={cardList}
          value={selectedCard}
          onChange={setSelectedCard}
          onClose={() => setShowCard(false)}
          onAddBank={onGoAddBank}
        />
      </BottomSheet>

      <BottomSheet isVisible={showTransfer}>
        <WithdrawTransfer
          inputAmount={amount}
          onInputChange={setAmount}
          withdrawAmount={user?.canWithdrawAmount || 0}
          receiveAmount={actualReceived}
          onClose={() => {
            setAmount('');
            setShowTransfer(false);
          }}
          onConfirm={onSubmitTransfer}
        />
      </BottomSheet>
    </LazyImageLGBackground>
  );
};

export default Withdraw;
