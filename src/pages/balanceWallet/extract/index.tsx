import React, { useMemo, useState, useCallback, useRef } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  Platform,
} from 'react-native';
import PageContainer from '@/components/PageContainer';
import AppIcon from '@/components/AppIcon';
import Popup from '@/components/Popup';
import InputCode from '@/components/InputCode';
import styles from './styles';
import { px } from '@/utils/ui';
import Flex from '@/components/Flex';
import { useCountDown } from '@/hooks/useCountDown';
import { showToast } from '@/utils';
import {
  applyWithdrawal,
  getOrderStat,
  getWithdrawalBankCardList,
  sendWithdrawalSms,
} from '@/services/user';
import { useFocusEffect } from '@react-navigation/core';
import { BANK_INFO, STATE_COLOR } from '../constants';
import { hideLoading, showLoading } from '@/utils/index';
import { cacheGet } from '@/utils/cache';
import { useNavigation } from '@react-navigation/native';
import { SimpleLoading } from '@/components';

type OrderStat = {
  balance: number;
  todayOrderAmount: number;
};

type BankCardItem = {
  id: string | number;
  cardType?: string;
  cardImageUrl?: string;
  cardName?: string;
  cardNo?: string;
  bankCode?: string;
  bankName?: string;
  branchName?: string;
  branchCode?: string;
  province?: string;
  city?: string;
  district?: string;
  mobile?: string;
  status?: number;
  statusName?: string;
  enabled?: number;
  rejectReason?: string;
};

export default function BalanceWalletExtract() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [orderStat, setOrderStat] = useState<OrderStat | undefined>(undefined);
  const [bankCardList, setBankCardList] = useState<BankCardItem[]>([]);
  const [amount, setAmount] = useState('');
  const [bankPopupVisible, setBankPopupVisible] = useState(false);
  const [selectedBankCardId, setSelectedBankCardId] = useState<
    string | number | null
  >(null);
  const [pendingBankCardId, setPendingBankCardId] = useState<
    string | number | null
  >(null);
  const [verifyPopupVisible, setVerifyPopupVisible] = useState(false);
  const [withdrawCode, setWithdrawCode] = useState('');
  const [withdrawCodeError, setWithdrawCodeError] = useState('');
  const [submittingWithdraw, setSubmittingWithdraw] = useState(false);
  const [codeRequested, setCodeRequested] = useState(false);
  const amountInputRef = useRef<TextInput>(null);
  const { count, isCounting, start, reset } = useCountDown(59);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [orderStatRes, bankCardRes] = await Promise.all([
        getOrderStat({}),
        getWithdrawalBankCardList({}),
      ]);

      if (orderStatRes.code === 200 && orderStatRes.success) {
        setOrderStat((orderStatRes.data || {}) as OrderStat);
      }

      if (bankCardRes?.success) {
        const list = Array.isArray(bankCardRes?.data?.list)
          ? bankCardRes.data.list
          : [];
        setBankCardList(list);

        if (list.length === 1) {
          setSelectedBankCardId(list[0]?.id ?? null);
          setPendingBankCardId(list[0]?.id ?? null);
        } else if (list.length > 1) {
          const enabledCard = list.find(
            (item: BankCardItem) => item?.enabled === 1,
          );
          const defaultId = enabledCard?.id ?? null;
          setSelectedBankCardId(defaultId);
          setPendingBankCardId(defaultId);
        } else {
          setSelectedBankCardId(null);
          setPendingBankCardId(null);
        }
      } else {
        setBankCardList([]);
        setSelectedBankCardId(null);
        setPendingBankCardId(null);
        showToast({
          title: bankCardRes?.msg || bankCardRes?.message || '加载银行卡失败',
          icon: 'info',
        });
      }
    } catch {
      showToast({
        title: '加载数据失败',
        icon: 'info',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      // 返回当前页时重新拉取，确保银行卡列表是最新数据。
      load();
    }, [load]),
  );

  const canWithdraw = useMemo(() => {
    return Math.max(0, Number(orderStat?.balance || 0));
  }, [orderStat?.balance]);

  const bankCard =
    bankCardList?.find((item: any) => item?.id === selectedBankCardId) ||
    bankCardList?.[0];
  const bankImage = bankCard?.bankName ? BANK_INFO[bankCard?.bankName] : '';

  const formatAmountInput = (text: string) => {
    const sanitized = (text || '').replace(/[^\d.]/g, '');
    if (!sanitized) return '';

    const parts = sanitized.split('.');
    const integerPart = (parts[0] || '0').replace(/^0+(?=\d)/, '');
    const decimalPart = parts[1] ? parts[1].slice(0, 2) : '';

    if (parts.length > 1) {
      return `${integerPart}.${decimalPart}`;
    }
    return integerPart;
  };

  const handleChangeAmount = (text: string) => {
    setAmount(formatAmountInput(text));
  };

  const handleFillAll = () => {
    setAmount(String(canWithdraw));
  };

  const handleAmountInputPressIn = useCallback(() => {
    if (Platform.OS !== 'android') return;
    const input = amountInputRef.current;
    if (!input) return;

    input.blur();
    setTimeout(() => {
      amountInputRef.current?.focus();
    }, 80);
  }, []);

  const submitDisabled = !amount || Number(amount) <= 0;

  const openBankPopup = () => {
    setPendingBankCardId(selectedBankCardId);
    setBankPopupVisible(true);
  };

  const applyBankCard = () => {
    const pendingCard = bankCardList?.find(
      (item: any) => item?.id === pendingBankCardId,
    );
    if (pendingCard?.status !== 2) {
      return;
    }
    setSelectedBankCardId(pendingBankCardId);
    setBankPopupVisible(false);
  };

  const bankStatusMap = {
    1: { text: '更改审核中', color: '#FF8C62' },
    2: { text: '', color: '#37C22A' },
    3: { text: '更改失败', color: '#FF3A3A' },
  } as const;

  const codeButtonText = isCounting
    ? `${count}s`
    : codeRequested
    ? '重新获取'
    : '获取验证码';

  const openVerifyPopup = () => {
    const balance: any = Number(orderStat?.balance || 0);
    if (amount > balance) {
      showToast({ title: '提现金额不能大于可提现金额', icon: 'info' });
      return;
    }
    setVerifyPopupVisible(true);
    setWithdrawCode('');
    setWithdrawCodeError('');
    setCodeRequested(false);
    reset();
  };

  const closeVerifyPopup = () => {
    setVerifyPopupVisible(false);
    setWithdrawCode('');
    setWithdrawCodeError('');
    setCodeRequested(false);
    reset();
  };

  const handleGetCode = () => {
    if (isCounting) return;
    const mobile = bankCard?.mobile || '';
    if (!mobile) {
      showToast({ title: '手机号为空', icon: 'info' });
      return;
    }

    void (async () => {
      showLoading({ title: '发送中...' });
      try {
        const res: any = await sendWithdrawalSms({ mobile });
        if (res?.success && res?.data === true) {
          setCodeRequested(true);
          setWithdrawCodeError('');
          start();
          return;
        }

        showToast({
          title: res?.msg || res?.message || '获取验证码失败',
          icon: 'info',
        });
      } catch {
        showToast({ title: '获取验证码失败', icon: 'info' });
      } finally {
        hideLoading();
      }
    })();
  };

  const handleSubmitWithdraw = async (smsCode: string) => {
    if (submittingWithdraw) return;
    const pureCode = (smsCode || '').replace(/\D/g, '').slice(0, 6);
    if (pureCode.length !== 6) {
      return;
    }

    const amountCent = Number(amount || 0);
    if (!amountCent || amountCent <= 0) {
      setWithdrawCodeError('提现金额有误');
      return;
    }

    if (!bankCard?.cardNo) {
      setWithdrawCodeError('请选择到账银行卡');
      return;
    }

    setSubmittingWithdraw(true);
    showLoading({ title: '提交中...' });
    try {
      const userIdRaw = await cacheGet({ key: 'userId' });
      const userId = Number(userIdRaw);
      const res: any = await applyWithdrawal({
        userId: Number.isNaN(userId) ? undefined : userId,
        applicationAmount: amountCent,
        gatheringNumber: bankCard?.cardNo,
        gatheringName: bankCard?.cardName,
        bankName: bankCard?.bankName,
        smsCode: pureCode,
      });

      if (res?.success) {
        hideLoading();
        closeVerifyPopup();
        showToast({ title: '提现申请已提交', icon: 'success' });
        navigation.goBack();
        return;
      }

      setWithdrawCodeError(res?.msg || res?.message || '验证码错误');
    } catch {
      setWithdrawCodeError('提现申请失败');
    } finally {
      hideLoading();
      setSubmittingWithdraw(false);
    }
  };

  return (
    <PageContainer
      backgroundColor="#F5F6FA"
      safeAreaEdges={['top']}
      pageNavProps={{
        text: '提现',
        showBack: true,
      }}
    >
      {loading ? (
        <SimpleLoading />
      ) : (
        <View style={styles.container}>
          <View style={styles.content}>
            <View style={styles.availableCard}>
              <Text style={styles.availableTitle}>
                可提现金额(元)：
                <Text style={styles.availableValue}>
                  {orderStat?.balance?.toFixed(2) || 0}
                </Text>
              </Text>
              <View style={styles.tipBox}>
                <Text style={styles.tipText}>
                  您今日分账的
                  <Text style={styles.tipHighlight}>
                    {Number(orderStat?.todayOrderAmount || 0).toFixed(0)}元
                  </Text>
                  暂不可提现，根据三方支付平台规则需暂存3天后方可提现
                </Text>
              </View>
            </View>

            <View style={styles.withdrawCard}>
              <Text style={styles.sectionTitle}>提现金额</Text>
              <Flex align="center" style={styles.amountRow}>
                <Text style={styles.currency}>¥</Text>
                <TextInput
                  ref={amountInputRef}
                  value={amount}
                  onChangeText={handleChangeAmount}
                  placeholder="请输入"
                  placeholderTextColor="#B9B9B9"
                  keyboardType="decimal-pad"
                  onPressIn={handleAmountInputPressIn}
                  style={styles.amountInput}
                />
                <TouchableOpacity activeOpacity={0.85} onPress={handleFillAll}>
                  <Text style={styles.fillAllText}>全部</Text>
                </TouchableOpacity>
              </Flex>

              <View style={styles.divider} />

              <Text style={styles.sectionTitle}>到账银行卡</Text>
              {bankCard ? (
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.bankRow}
                  onPress={openBankPopup}
                >
                  <View style={styles.bankLeft}>
                    {bankImage ? (
                      <Image
                        source={{ uri: bankImage }}
                        style={styles.bankIcon}
                        resizeMode="contain"
                      />
                    ) : null}
                    <View>
                      <Text style={styles.bankName}>
                        {bankCard.bankName}（{bankCard.cardNo?.slice(-4)}）
                      </Text>
                      <Text style={styles.bankDesc}>预计2小时内到账</Text>
                    </View>
                  </View>
                  <AppIcon name="a-nextpage" size={px(24)} color="#333" />
                </TouchableOpacity>
              ) : (
                <Flex justify="center">
                  <TouchableOpacity
                    activeOpacity={0.9}
                    style={[styles.addBtn]}
                    onPress={() => {
                      navigation.navigate('RcvPaymentChangeBank', {
                        cardType: (orderStat as any)?.cardType,
                        regName: (orderStat as any)?.regName,
                      });
                    }}
                  >
                    <Text style={styles.addBtnText}>添加银行卡</Text>
                  </TouchableOpacity>
                </Flex>
              )}
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            style={[
              styles.submitBtn,
              submitDisabled ? styles.submitBtnDisabled : {},
            ]}
            disabled={submitDisabled}
            onPress={openVerifyPopup}
          >
            <Text style={styles.submitBtnText}>申请提现</Text>
          </TouchableOpacity>

          <Popup
            visible={bankPopupVisible}
            onClose={() => setBankPopupVisible(false)}
            title="请选择银行卡"
            showClose
          >
            <View style={styles.bankPopupWrap}>
              <Text style={styles.bankPopupDesc}>请留意银行卡审核时间</Text>

              <ScrollView
                style={styles.bankPopupList}
                contentContainerStyle={styles.bankPopupListContent}
                showsVerticalScrollIndicator={false}
              >
                {(bankCardList || []).map((item: any) => {
                  const itemImage =
                    item?.bankName && BANK_INFO[item?.bankName]
                      ? BANK_INFO[item?.bankName]
                      : BANK_INFO['通用银行'];
                  const active = pendingBankCardId === item?.id;
                  const status =
                    bankStatusMap[
                      Number(item?.status || 2) as keyof typeof bankStatusMap
                    ];

                  return (
                    <TouchableOpacity
                      key={item?.id}
                      activeOpacity={0.85}
                      style={styles.bankPopupItem}
                      onPress={() => {
                        if (item?.status !== 2) return;
                        setPendingBankCardId(item?.id);
                      }}
                    >
                      <View style={styles.bankLeft}>
                        {itemImage ? (
                          <Image
                            source={{ uri: itemImage }}
                            style={styles.bankIcon}
                            resizeMode="contain"
                          />
                        ) : null}
                        <View>
                          <Text style={styles.bankName}>
                            {item?.bankName}（{item?.cardNo?.slice(-4)}）
                          </Text>
                          <Text style={styles.bankDesc}>预计2小时内到账</Text>
                        </View>
                      </View>

                      {Number(item?.status) === 2 ? (
                        <View
                          style={[
                            styles.bankCheck,
                            active ? styles.bankCheckActive : null,
                          ]}
                        >
                          {active ? (
                            <AppIcon
                              name="tick-white"
                              color="#FFFFFF"
                              size={px(16)}
                            />
                          ) : null}
                        </View>
                      ) : (
                        <Text
                          style={[
                            styles.bankStatusText,
                            { color: status.color },
                          ]}
                        >
                          {status.text}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <View style={styles.bankPopupFooter}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={[styles.bankPopupBtn, styles.bankPopupCancelBtn]}
                  onPress={() => setBankPopupVisible(false)}
                >
                  <Text style={styles.bankPopupCancelText}>取消</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={[
                    styles.bankPopupBtn,
                    styles.bankPopupConfirmBtn,
                    !pendingBankCardId
                      ? styles.bankPopupConfirmBtnDisabled
                      : null,
                  ]}
                  onPress={applyBankCard}
                  disabled={!pendingBankCardId}
                >
                  <Text style={styles.bankPopupConfirmText}>
                    更改到账银行卡
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Popup>

          <Popup
            visible={verifyPopupVisible}
            onClose={closeVerifyPopup}
            title="请输入提现验证码"
            showClose
            androidKeyboardOffset={0}
            androidKeyboardMaxOffset={px(360)}
          >
            <View style={styles.verifyPopupWrap}>
              <Text style={styles.verifyAmountLabel}>提现金额</Text>
              <View style={styles.verifyAmountRow}>
                <Text style={styles.verifyAmountCurrency}>¥</Text>
                <Text style={styles.verifyAmountValue}>{amount}</Text>
              </View>

              <View style={styles.verifyDivider} />

              <Flex
                justify="between"
                align="center"
                style={styles.verifyPhoneRow}
              >
                <Text style={styles.verifyPhoneText}>
                  提现手机号：{bankCard?.mobile || ''}
                </Text>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.verifyCodeBtn}
                  disabled={isCounting}
                  onPress={handleGetCode}
                >
                  <Text style={styles.verifyCodeBtnText}>{codeButtonText}</Text>
                </TouchableOpacity>
              </Flex>

              <InputCode
                showError={!!withdrawCodeError}
                code={withdrawCode}
                onUpdate={code => {
                  setWithdrawCode(code);
                  if (!code) {
                    setWithdrawCodeError('');
                    return;
                  }
                  // if (code.length < 6) {
                  //   setWithdrawCodeError('请输入验证码');
                  //   return;
                  // }
                  if (withdrawCodeError) setWithdrawCodeError('');
                  void handleSubmitWithdraw(code);
                }}
              />
              <Text style={styles.verifyErrorText}>{withdrawCodeError}</Text>
            </View>
          </Popup>
        </View>
      )}
    </PageContainer>
  );
}
