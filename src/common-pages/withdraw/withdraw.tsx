/* eslint-disable prettier/prettier */
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ScrollView, View, LayoutChangeEvent, Linking} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import {BottomSheet} from '@rneui/themed';

import theme from '@/style';
import {goBack, goTo, errorLog} from '@/utils';
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

import {getBankList, CardListItemType, onWithdraw, createShareRecord, getShareRecordCountdown} from './withdraw.service';
import {postUserInfo, IUserInfo} from '@/services/global.service';
import {onTransfer} from '../transfer/transfer-service';
import {plus, times} from '@/components/utils/number-precision';
import WithdrawActualReceived from './withdraw-actual-received';
import ExitIntentModal from './component/exit-intent-modal';
import RedPacketFloatButton from './component/red-packet-float-button';
import useRedPacketFloatButtonStore, {useSetRedPacketVisible, useSetRedPacketEndTimestamp} from './component/red-packet-float-button.store';
import WithdrawNoticeBanner from './component/withdraw-notice-banner';
import SharePanel from '@businessComponents/share-panel/new-share-panel';
import Clipboard from '@react-native-clipboard/clipboard';
import Drawer from '@basicComponents/drawer';
import {DrawerRef} from '@basicComponents/drawer/drawer';
import {getCachedAndroidId} from '@/utils/deviceInfo';
import useWithdrawStore, {useSetWithdrawPrice} from './withdraw.store';

const Withdraw = () => {
  const {i18n} = useTranslation();
  const navigation = useNavigation();
  const {visible: redPacketVisible, endTimestamp: redPacketEndTimestamp} = useRedPacketFloatButtonStore();
  const {price} = useWithdrawStore();

  const [loading, setLoading] = useState(false);
  const [cardList, setCardList] = useState<CardListItemType[]>([]);
  const [selectedCard, setSelectedCard] = useState<string>();
  const [showCard, setShowCard] = useState(false);
  // const [showTransfer, setShowTransfer] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [user, setUser] = useState<IUserInfo | undefined>();
  // const [amount, setAmount] = useState('');
  // const [price, setPrice] = useState('');

  const [parentHeight, setParentHeight] = useState(0);
  const panelRef = React.useRef<DrawerRef>(null);
  const [deviceId, setDeviceId] = useState('');
  const deviceType = useMemo(() => {
    return globalStore.isWeb
        ? 'web'
        : globalStore.isAndroid
          ? 'android'
          : '';
  }, []);
  const [ExitIntentModalVisible, setExitIntentModalVisible] = useState(false);
  const [shareRecordText, setShareRecordText] = useState('');

  // 初始化加载数据
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

  // 获取设备id
  useEffect(() => {
    switch (deviceType) {
      case 'web':
        setDeviceId(globalStore.visitor || '');
        break;
      case 'android':
        getCachedAndroidId().then(setDeviceId);
        break;
      default:
        setDeviceId('');
    }
  }, [deviceType]);

  // 获取分享记录报文
  const fetchShareRecordText = useCallback(async() => {
    setLoading(true);
    try {
      console.log('fetchShareRecordText', deviceId, deviceType);
      const shareRecord = await createShareRecord(deviceId, deviceType);
      console.log('fetchShareRecordText', shareRecord.result);
      setShareRecordText(shareRecord.result);
      await fetchShareRecordCountdown();
    } catch (err: unknown) {
      console.error('创建分享记录失败', err);
      setShareRecordText('');
      useSetRedPacketEndTimestamp(null);
    } finally {
      setLoading(false);
    }
  }, [deviceId, deviceType]);

  // 获取分享倒计时
  const fetchShareRecordCountdown = useCallback(async() => {
    try {
      const timestamp = await getShareRecordCountdown();
      console.log('fetchShareRecordCountdown', timestamp);
      useSetRedPacketEndTimestamp(timestamp ?? null);
    } catch (err: unknown) {
      console.error('获取分享倒计时失败', err);
      useSetRedPacketEndTimestamp(null);
    }
  }, []);

  // 刷新数据
  const handleRefresh = useCallback(() => {
    if (!globalStore.token) {
      goTo('Login', {backPage: 'Home'});
    } else {
      fetchUserAndBanks();
    }
  }, [fetchUserAndBanks]);

  // 获取选中银行卡
  const selectedBankCard = useMemo(() => {
    return cardList.find(item => item.id === selectedCard);
  }, [selectedCard, cardList]);

  // 去提现记录
  const handleGotoRecords = useCallback(() => {
    if (!globalStore.token) {
      goTo('Login', {backPage: 'Home'});
    } else {
      goTo('WithdrawRecords');
    }
  }, []);

  // const actualReceived = useMemo(() => {
  //   const max = user?.canWithdrawAmount || 0;
  //   const num = Number(amount);
  //   if (!isNaN(num) && user?.withdrawalFreeConfigs?.length && num <= max) {
  //     const config = user.withdrawalFreeConfigs.find(
  //       (c: {minValue: number; maxValue: number; pct: number}) =>
  //         num >= c.minValue && num <= c.maxValue,
  //     );
  //     if (config) {
  //       return times(plus(1, config.pct), num);
  //     }
  //   }
  //   return 0;
  // }, [amount, user]);

  // 去添加银行卡
  const onGoAddBank = useCallback(
    (cardInfo?: CardListItemType) => {
      setShowCard(false);
      if (!globalStore.token) {
        goTo('Login', {backPage: 'Home'});
        return;
      }
      goTo('AddBank', {
        isFirst: cardList.length === 0 ? '1' : '0',
        cardInfo,
      });
    },
    [cardList],
  );

  // 提现提交
  const onWithdrawSubmit = useCallback(async () => {
    console.log('onWithdrawSubmit', selectedCard, price);
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
      await onWithdraw({cardId: selectedCard, price: Number(price)});
      handleRefresh();
      setShowSuccess(true);
    } catch (err: unknown) {
      console.error('提现失败', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCard, price]);

  // 提现成功后处理
  const onWithdrawSuccessFinish = useCallback(async () => {
    setShowSuccess(true);
    useSetWithdrawPrice('');
    setShowSuccess(false);
    await fetchShareRecordText();
    setExitIntentModalVisible(true);
  }, [fetchShareRecordText]);

  // const onSubmitTransfer = async () => {
  //   setShowTransfer(false);
  //   setLoading(true);
  //   try {
  //     await onTransfer(Number(amount));
  //     await fetchUserAndBanks();
  //     globalStore.globalSucessTotal(i18n.t('transfer-page.tip.success'));
  //   } catch (err) {
  //     console.error('转账失败', err);
  //   } finally {
  //     setAmount('');
  //     setLoading(false);
  //   }
  // };

  // 获取父容器高度用于弹窗入口定位
  const handleParentLayout = useCallback((event: LayoutChangeEvent) => {
    const {height} = event.nativeEvent.layout;
    setParentHeight(height);
  }, []);

  // 初始化加载数据
  useEffect(() => {
    fetchUserAndBanks();
    fetchShareRecordCountdown();
  }, [fetchUserAndBanks]);

  // 监听页面焦点
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

  return (
    <LazyImageLGBackground
      style={[theme.fill.fill, theme.flex.col]}
      onLayout={handleParentLayout}>
      <DetailNavTitle
        onBack={goBack}
        hideServer
        hideAmount
        title={i18n.t('other.withdraw')}
      />
      {/* 提现页面轮播公告 */}
      <WithdrawNoticeBanner />
      {/* 提现页面主体 */}
      <Spin
        loading={loading}
        style={[
          theme.flex.flex1,
          theme.flex.col,
          { backgroundColor: '#820709' }
        ]}>
        <View style={[theme.flex.flex1]}>
          <ScrollView 
            style={[theme.flex.flex1]}
            showsVerticalScrollIndicator={false}
          >
            {/* 提现页面余额 */}
            <WithdrawBalance
              onGotoRecords={handleGotoRecords}
              balance={user?.canWithdrawAmount || 0}
              onRefresh={handleRefresh}
              // onPressTransfer={() => setShowTransfer(true)}
            />
            {/* 提现页面银行卡选择 */}
            <WithdrawBank
              bankInfo={selectedBankCard}
              onSelectBank={() => setShowCard(true)}
              onAddBank={() => onGoAddBank()}
            />
            {/* 提现页面金额输入 */}
            <WithdrawAmount />
            {/* 提现页面规则说明*/}
            <WithdrawActualReceived />
          </ScrollView>
        </View>
        {/* 提现按钮 */}
        <WithdrawButton
          onRecharge={onWithdrawSubmit}
          type="linear-primary"
          text={i18n.t('other.withdraw')}
        />
      </Spin>
      {/* 提现成功弹窗 */}
      <WithdrawSuccess
        visible={showSuccess}
        onFinish={onWithdrawSuccessFinish}
      />
      {/* 红包分享弹窗 */}
      <ExitIntentModal
        visible={ExitIntentModalVisible}
        onPress={() => panelRef.current?.open()}
        onClose={() => {
          setExitIntentModalVisible(false);
          useSetRedPacketVisible(true);
        }}
      />
      {/* 底部银行卡选择面板 */}
      <BottomSheet isVisible={showCard}>
        <SelectCards
          list={cardList}
          value={selectedCard}
          onChange={setSelectedCard}
          onClose={() => setShowCard(false)}
          onAddBank={onGoAddBank}
        />
      </BottomSheet>
      {/* <BottomSheet isVisible={showTransfer}>
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
      </BottomSheet> */}
      {/* 红包弹窗入口 */}
      {parentHeight > 0 && redPacketEndTimestamp && (
        <RedPacketFloatButton
          visible={redPacketVisible}
          endTimestamp={redPacketEndTimestamp}
          parentHeight={parentHeight}
          onPress={() => setExitIntentModalVisible(true)}
          enableBreathing={true}
          onHide={() => {
            setExitIntentModalVisible(false);
            useSetRedPacketVisible(false);
            useSetRedPacketEndTimestamp(null);
          }}
          onCountdownFinish={() => {
            setExitIntentModalVisible(false);
            useSetRedPacketVisible(false);
            useSetRedPacketEndTimestamp(null);
          }}
        />
      )}
      {/* 分享面板 */}
      <Drawer mode="bottom" ref={panelRef} contentBackgroundColor="transparent">
        <SharePanel
          onClose={() => panelRef.current?.close()}
          onItemPress={platform => {
            panelRef.current?.close();
            const inviteText = shareRecordText;
            // 复制到剪贴板作为备用
            Clipboard.setString(inviteText);
            switch (platform) {
              case 'Facebook':
                Linking.openURL('fb://messaging').catch(e => errorLog(e));
                break;
              case 'Telegram':
                const encodedText = encodeURIComponent(inviteText);
                Linking.openURL(`tg://msg_url?text=${encodedText}`).catch(e =>
                  errorLog(e),
                );
                break;
              case 'Whatsapp':
                const whatsappText = encodeURIComponent(inviteText);
                Linking.openURL(`https://wa.me?text=${whatsappText}`).catch(e =>
                  errorLog(e),
                );
                break;
              case 'Instagram':
                Linking.openURL('instagram://media').catch(e => errorLog(e));
                break;
              case 'CopyLink':
                globalStore.globalSucessTotal(i18n.t('share.copy-success'));
              default:
                break;
            }
          }}
        />
      </Drawer>
    </LazyImageLGBackground>
  );
};

export default Withdraw;
