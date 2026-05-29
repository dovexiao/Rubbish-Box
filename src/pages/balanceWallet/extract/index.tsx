import React, { useEffect, useMemo, useState } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
} from 'react-native';
import PageContainer from '@/components/PageContainer';
import AppIcon from '@/components/AppIcon';
import Popup from '@/components/Popup';
import InputCode from '@/pages/handOver/com/inputCode';
import styles from './styles';
import { px } from '@/utils/ui';
import Flex from '@/components/Flex';
import { useCountDown } from '@/hooks/useCountDown';
import { showToast } from '@/utils';

export default function BalanceWalletExtract() {
  const [detailInfo, setDetailInfo] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [bankPopupVisible, setBankPopupVisible] = useState(false);
  const [selectedBankCardId, setSelectedBankCardId] = useState<string>('');
  const [pendingBankCardId, setPendingBankCardId] = useState<string>('');
  const [verifyPopupVisible, setVerifyPopupVisible] = useState(false);
  const [withdrawCode, setWithdrawCode] = useState('');
  const [withdrawCodeError, setWithdrawCodeError] = useState('');
  const [codeRequested, setCodeRequested] = useState(false);
  const { count, isCounting, start, reset } = useCountDown(59);

  const BANK_IMAGE = {
    0: {
      bankName: '工商银行',
      url: 'https://g.18qjz.cn/img/boklock/wallet/bankIcon/bank-gongshang.png ',
    },
    1: {
      bankName: '建设银行',
      url: 'https://g.18qjz.cn/img/boklock/wallet/bankIcon/bank-jianshe.png ',
    },
    2: {
      bankName: '交通银行',
      url: 'https://g.18qjz.cn/img/boklock/wallet/bankIcon/bank-jiaotong.png ',
    },
    3: {
      bankName: '民生银行',
      url: 'https://g.18qjz.cn/img/boklock/wallet/bankIcon/bank-minsheng.png ',
    },
    4: {
      bankName: '农业银行',
      url: 'https://g.18qjz.cn/img/boklock/wallet/bankIcon/bank-nongye.png ',
    },
    5: {
      bankName: '浦发银行',
      url: 'https://g.18qjz.cn/img/boklock/wallet/bankIcon/bank-pufa.png ',
    },
    6: {
      bankName: '通融银行',
      url: 'https://g.18qjz.cn/img/boklock/wallet/bankIcon/bank-tongrong.png ',
    },
    7: {
      bankName: '兴业银行',
      url: 'https://g.18qjz.cn/img/boklock/wallet/bankIcon/bank-xingye.png ',
    },
    8: {
      bankName: '邮政银行',
      url: 'https://g.18qjz.cn/img/boklock/wallet/bankIcon/bank-youzheng.png ',
    },
    9: {
      bankName: '招商银行',
      url: 'https://g.18qjz.cn/img/boklock/wallet/bankIcon/bank-zhaoshang.png ',
    },
    10: {
      bankName: '中国银行',
      url: 'https://g.18qjz.cn/img/boklock/wallet/bankIcon/bank-zhongguo.png ',
    },
    11: {
      bankName: '中信银行',
      url: 'https://g.18qjz.cn/img/boklock/wallet/bankIcon/bank-zhongxin.png ',
    },
  };

  useEffect(() => {
    setDetailInfo({
      balance: 1000,
      unUseBalance: 200,
      mobile: '19800728100',
      bankCard: [
        {
          id: 'b1',
          bankName: '建设银行',
          cardNo: '**** **** **** 1234',
          bankType: 1,
          status: 'normal',
        },
        {
          id: 'b2',
          bankName: '中国邮政储蓄银行',
          cardNo: '**** **** **** 2873',
          bankType: 8,
          status: 'normal',
        },
        {
          id: 'b3',
          bankName: '中国建设银行',
          cardNo: '**** **** **** 1983',
          bankType: 1,
          status: 'reviewing',
        },
        {
          id: 'b4',
          bankName: '中国工商银行',
          cardNo: '**** **** **** 0923',
          bankType: 0,
          status: 'failed',
        },
      ],
    });
  }, []);

  useEffect(() => {
    const defaultCard = detailInfo?.bankCard?.find(
      (item: any) => item?.status === 'normal',
    );
    if (defaultCard?.id && !selectedBankCardId) {
      setSelectedBankCardId(defaultCard.id);
      setPendingBankCardId(defaultCard.id);
    }
  }, [detailInfo?.bankCard, selectedBankCardId]);

  const canWithdraw = useMemo(() => {
    const total = Number(detailInfo?.balance || 0);
    const freeze = Number(detailInfo?.unUseBalance || 0);
    return Math.max(0, total - freeze);
  }, [detailInfo]);

  const bankCard =
    detailInfo?.bankCard?.find(
      (item: any) => item?.id === selectedBankCardId,
    ) || detailInfo?.bankCard?.[0];
  const bankType = Number(bankCard?.bankType ?? 0);
  const bankImage =
    BANK_IMAGE[bankType as keyof typeof BANK_IMAGE]?.url?.trim?.() || '';

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

  const submitDisabled = !amount || Number(amount) <= 0;

  const openBankPopup = () => {
    setPendingBankCardId(selectedBankCardId);
    setBankPopupVisible(true);
  };

  const applyBankCard = () => {
    const pendingCard = detailInfo?.bankCard?.find(
      (item: any) => item?.id === pendingBankCardId,
    );
    if (pendingCard?.status !== 'normal') {
      return;
    }
    setSelectedBankCardId(pendingBankCardId);
    setBankPopupVisible(false);
  };

  const bankStatusMap = {
    normal: { text: '', color: '#37C22A' },
    reviewing: { text: '更改审核中', color: '#FF8C62' },
    failed: { text: '更改失败', color: '#FF3A3A' },
  } as const;

  const codeButtonText = isCounting
    ? `${count}s`
    : codeRequested
    ? '重新获取'
    : '获取验证码';

  const openVerifyPopup = () => {
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
    setCodeRequested(true);
    setWithdrawCodeError('');
    start();
  };

  const handleSubmitWithdraw = () => {
    const pureCode = (withdrawCode || '').replace(/\D/g, '').slice(0, 6);
    if (pureCode.length < 6) {
      setWithdrawCodeError('请输入验证码');
      return;
    }
    if (pureCode !== '650106') {
      setWithdrawCodeError('验证码错误');
      return;
    }

    closeVerifyPopup();
    showToast({ title: '提现申请已提交', icon: 'success' });
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
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.availableCard}>
            <Text style={styles.availableTitle}>
              可提现金额(元)：
              <Text style={styles.availableValue}>
                {canWithdraw.toFixed(2)}
              </Text>
            </Text>
            <View style={styles.tipBox}>
              <Text style={styles.tipText}>
                您今日分账的
                <Text style={styles.tipHighlight}>
                  {Number(detailInfo?.unUseBalance || 0).toFixed(0)}元
                </Text>
                暂不可提现，根据三方支付平台规则需暂存5天后方可提现
              </Text>
            </View>
          </View>

          <View style={styles.withdrawCard}>
            <Text style={styles.sectionTitle}>提现金额</Text>
            <Flex align="center" style={styles.amountRow}>
              <Text style={styles.currency}>¥</Text>
              <TextInput
                value={amount}
                onChangeText={handleChangeAmount}
                placeholder="请输入"
                placeholderTextColor="#B9B9B9"
                keyboardType="decimal-pad"
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
                <TouchableOpacity activeOpacity={0.9} style={[styles.addBtn]}>
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
              {(detailInfo?.bankCard || []).map((item: any) => {
                const itemType = Number(item?.bankType ?? 0);
                const itemImage =
                  BANK_IMAGE[
                    itemType as keyof typeof BANK_IMAGE
                  ]?.url?.trim?.() || '';
                const active = pendingBankCardId === item?.id;
                const status =
                  bankStatusMap[
                    (item?.status || 'normal') as keyof typeof bankStatusMap
                  ];

                return (
                  <TouchableOpacity
                    key={item?.id}
                    activeOpacity={0.85}
                    style={styles.bankPopupItem}
                    onPress={() => {
                      if (item?.status !== 'normal') return;
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

                    {item?.status === 'normal' ? (
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
                        style={[styles.bankStatusText, { color: status.color }]}
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
                <Text style={styles.bankPopupCancelText}>上一步</Text>
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
                <Text style={styles.bankPopupConfirmText}>更改到账银行卡</Text>
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
                提现手机号：{detailInfo?.mobile || ''}
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
                if (code.length < 6) {
                  setWithdrawCodeError('请输入验证码');
                  return;
                }
                if (withdrawCodeError) setWithdrawCodeError('');
              }}
            />
            <Text style={styles.verifyErrorText}>{withdrawCodeError}</Text>
          </View>
        </Popup>
      </View>
    </PageContainer>
  );
}
