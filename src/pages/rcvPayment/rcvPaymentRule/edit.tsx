import React, { useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Input, PickerView } from '@ant-design/react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { PageContainer, Popup, Flex } from '@/components';
import AppIcon from '@/components/AppIcon';
import GradientButton from '@/components/GradientButton';
import { saveFeeTemplate } from '@/services/mall';
import { cacheGet, hideLoading, showLoading, showToast } from '@/utils';
import { px } from '@/utils/ui';
import styles from './editStyles';

type ChargeTypeOption = 'duration' | 'times';
type ChargeType = ChargeTypeOption | '';
type BillingCycle = '24h' | '48h' | 'naturalDay';

type RuleForm = {
  ruleName: string;
  chargeType: ChargeType;
  durationMinute: string;
  durationFee: string;
  maxFee: string;
  timesFee: string;
  enableCycleForTimes: boolean;
  billingCycle: BillingCycle | null | undefined;
  rollingBilling: boolean;
  freeTime: string;
  chargeIfLessThanUnit: boolean;
};

const CHARGE_TYPE_OPTIONS: Array<{ value: ChargeTypeOption; label: string }> = [
  { value: 'duration', label: '按时长计费' },
  { value: 'times', label: '按次数计费' },
];

const CYCLE_OPTIONS: Array<{ value: BillingCycle; label: string }> = [
  { value: 'naturalDay', label: '自然日' },
  { value: '24h', label: '24小时' },
  { value: '48h', label: '48小时' },
];

const getCycleLabel = (value: BillingCycle) =>
  CYCLE_OPTIONS.find(it => it.value === value)?.label ?? '';

const getPickerValue = <T extends string>(
  values: Array<string | number>,
  fallback: T,
) => {
  const next = values?.[0];
  return (next ?? fallback) as T;
};

const normalizeIntegerInput = (value: string) =>
  String(value ?? '').replace(/\D/g, '');

const normalizeMinuteInput = (value: string) => {
  const digits = normalizeIntegerInput(value);
  if (!digits) return '';
  // 去掉前导零，保证分钟字段始终是整数文本
  return String(Number(digits));
};

const MONEY_MIN = 0.01;
const MONEY_MAX = 9999.99;

const normalizeMoneyInput = (value: string) => {
  const clean = String(value ?? '').replace(/[^\d.]/g, '');
  if (!clean) return '';
  const dotIndex = clean.indexOf('.');
  if (dotIndex < 0) return clean;

  const intPart = clean.slice(0, dotIndex);
  const decimalPart = clean
    .slice(dotIndex + 1)
    .replace(/\./g, '')
    .slice(0, 2);
  return decimalPart ? `${intPart}.${decimalPart}` : `${intPart}.`;
};

const toMoneyText = (value: unknown) => {
  if ([null, undefined, ''].includes(value as any)) return '';
  return String(value);
};

const parseMoneyYuan = (value: string) => {
  const text = String(value ?? '').trim();
  if (!text) return NaN;
  const num = Number(text);
  if (Number.isNaN(num)) return NaN;
  return num;
};

const resolveBillingType = (cycle: BillingCycle) => {
  return cycle === 'naturalDay' ? 2 : 1;
};

const resolveBillingCycleMinute = (
  cycle: BillingCycle,
  billingType: number,
) => {
  if (billingType === 2) return 0;
  return cycle === '48h' ? 2880 : 1440;
};

const resolveChargeType = (rule: any): ChargeType => {
  if (Number(rule?.chargingType) === 1) return 'times';
  if (Number(rule?.chargingType) === 2) return 'duration';
  return '';
};

const resolveBillingCycle = (rule: any): BillingCycle | undefined => {
  const billingType = Number(rule?.billingType);
  const billingCycle = Number(rule?.billingCycle);

  if (billingType === 2) return 'naturalDay';
  if (billingType === 1) {
    if (billingCycle === 2880) return '48h';
    if (billingCycle === 1440) return '24h';
    return undefined;
  }

  return undefined;
};

const Radio = ({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.radioItem}
      onPress={onPress}
    >
      <View
        style={[
          styles.radioIconWrap,
          active ? styles.radioIconWrapActive : null,
        ]}
      >
        {active ? (
          <AppIcon name="tick-white" color="#FFFFFF" size={px(16)} />
        ) : null}
      </View>
      <Text style={styles.radioText}>{label}</Text>
    </TouchableOpacity>
  );
};

export default function RcvPaymentRuleEdit() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const incomingRule = route.params?.rule ?? {};

  const ruleId = route.params?.ruleId;
  const isEdit = !!ruleId;
  const initChargeType = resolveChargeType(incomingRule);

  const [form, setForm] = useState<RuleForm>({
    ruleName: String(incomingRule?.templateName ?? ''),
    chargeType: initChargeType,
    durationMinute:
      incomingRule?.duration === null || incomingRule?.duration === undefined
        ? ''
        : String(incomingRule.duration),
    durationFee:
      incomingRule?.unitFee === null || incomingRule?.unitFee === undefined
        ? ''
        : toMoneyText(incomingRule.unitFee),
    maxFee:
      incomingRule?.maxFee === null || incomingRule?.maxFee === undefined
        ? ''
        : toMoneyText(incomingRule.maxFee),
    timesFee:
      incomingRule?.unitFee === null || incomingRule?.unitFee === undefined
        ? ''
        : toMoneyText(incomingRule.unitFee),
    enableCycleForTimes: Number(incomingRule?.isRoll ?? 0) === 1,
    billingCycle: resolveBillingCycle(incomingRule),
    rollingBilling: Number(incomingRule?.isRoll ?? 0) === 1,
    chargeIfLessThanUnit: Number(incomingRule?.feeUnitRoundUp ?? 0) === 1,
    freeTime: [null, undefined].includes(incomingRule?.freeTime)
      ? ''
      : String(incomingRule.freeTime),
  });

  const [showCycleTips, setShowCycleTips] = useState(false);
  const [showCycleTips2, setShowCycleTips2] = useState(false);
  const [showChargeTips, setShowChargeTips] = useState(false);

  const [showChargeTypePopup, setShowChargeTypePopup] = useState(false);
  const [showCyclePopup, setShowCyclePopup] = useState(false);

  const [pendingChargeType, setPendingChargeType] = useState<ChargeType>(
    form.chargeType || 'duration',
  );
  const [pendingBillingCycle, setPendingBillingCycle] = useState<BillingCycle>(
    (form.billingCycle ?? '24h') as BillingCycle,
  );

  const navTitle = useMemo(
    () => (isEdit ? '编辑收费规则' : '新增收费规则'),
    [isEdit],
  );

  const closeAllTips = () => {
    if (showCycleTips) setShowCycleTips(false);
    if (showCycleTips2) setShowCycleTips2(false);
    if (showChargeTips) setShowChargeTips(false);
  };

  const openChargeTypePopup = () => {
    closeAllTips();
    setPendingChargeType(form.chargeType || 'duration');
    setShowChargeTypePopup(true);
  };

  const openCyclePopup = () => {
    closeAllTips();
    setPendingBillingCycle((form.billingCycle ?? '24h') as BillingCycle);
    setShowCyclePopup(true);
  };

  const handleSave = async () => {
    const ruleName = String(form.ruleName ?? '').trim();
    if (!ruleName) {
      showToast({ title: '请输入规则名称', icon: 'info' });
      return;
    }

    if (!form.chargeType) {
      showToast({ title: '请选择收费方式', icon: 'info' });
      return;
    }

    const unitFeeText =
      form.chargeType === 'duration' ? form.durationFee : form.timesFee;
    const unitFee = parseMoneyYuan(unitFeeText);
    if (Number.isNaN(unitFee)) {
      showToast({ title: '请输入费用单价', icon: 'info' });
      return;
    }
    if (unitFee < MONEY_MIN || unitFee > MONEY_MAX) {
      showToast({
        title: `费用单价需大于0元且小于10000元`,
        icon: 'info',
      });
      return;
    }

    const maxFee = parseMoneyYuan(form.maxFee);
    if (form.chargeType === 'duration') {
      if (Number.isNaN(maxFee)) {
        showToast({ title: '请输入最高收费', icon: 'info' });
        return;
      }
      if (maxFee < MONEY_MIN || maxFee > MONEY_MAX) {
        showToast({
          title: `最高收费需在${MONEY_MIN}~${MONEY_MAX}元之间`,
          icon: 'info',
        });
        return;
      }
      if (maxFee < unitFee) {
        showToast({ title: '最高收费需大于等于单价', icon: 'info' });
        return;
      }
    }

    let duration = 0;
    if (form.chargeType === 'duration') {
      duration = Number(form.durationMinute ?? '0');
      if (!Number.isInteger(duration) || duration <= 0) {
        showToast({ title: '单位时长需为正整数分钟', icon: 'info' });
        return;
      }
    }

    if (!form.billingCycle && form.enableCycleForTimes) {
      showToast({ title: '请选择计费周期', icon: 'info' });
      return;
    }

    const cycle = (form.billingCycle ?? '24h') as BillingCycle;
    const billingType = resolveBillingType(cycle);
    const billingCycle = resolveBillingCycleMinute(cycle, billingType);

    const userIdRaw = await cacheGet({ key: 'userId' });
    const userId = Number(userIdRaw);

    const payload: any = {
      templateName: ruleName,
      chargingType: form.chargeType === 'times' ? 1 : 2,
      unitFee,
      duration: form.chargeType === 'duration' ? duration : 0,
      maxFee,
      billingType,
      billingCycle,
      isRoll:
        form.chargeType === 'duration'
          ? form.rollingBilling
            ? 1
            : 0
          : form.enableCycleForTimes
          ? 1
          : 0,
      feeUnitRoundUp: form.chargeIfLessThanUnit ? 1 : 0,
      freeTime: form.freeTime ? Number(form.freeTime) : 0,
    };

    console.log('payload', payload);

    if (![null, undefined, ''].includes(ruleId as any)) {
      payload.id = Number(ruleId);
    }
    if (!Number.isNaN(userId) && userId > 0) {
      payload.userId = userId;
    }

    showLoading({ title: isEdit ? '保存中...' : '创建中...' });
    try {
      const res: any = await saveFeeTemplate(payload);
      const ok =
        res?.success === true ||
        Number(res?.code) === 200 ||
        Number(res?.code) === 0;

      if (!ok) {
        showToast({
          title: res?.msg ?? res?.message ?? '保存失败',
          icon: 'info',
        });
        return;
      }

      showToast({ title: isEdit ? '保存成功' : '创建成功', icon: 'success' });
      navigation.goBack();
    } catch (err: any) {
      showToast({
        title: err?.msg ?? err?.message ?? '保存失败',
        icon: 'info',
      });
    } finally {
      hideLoading();
    }
  };

  return (
    <PageContainer
      backgroundColor="#f6f7fa"
      statusBarStyle="dark-content"
      statusBarBackgroundColor="#FFFFFF"
      safeAreaEdges={['top', 'bottom']}
      scrollable={false}
      pageNavProps={{
        text: navTitle,
        showBack: true,
        background: '#FFFFFF',
      }}
      footer={
        <View style={styles.footer}>
          <GradientButton
            colors={['#333', '#333']}
            style={styles.saveBtn}
            onPress={handleSave}
          >
            <Text style={styles.saveBtnText}>保存</Text>
          </GradientButton>
        </View>
      }
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={closeAllTips}
        style={{ flex: 1 }}
      >
        <View style={styles.container}>
          <View style={styles.card}>
            <View style={[styles.row, { paddingBottom: px(0) }]}>
              <View style={styles.labelBox}>
                <Text style={styles.required}>*</Text>
                <Text style={styles.label}>规则名称</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  style={styles.cardInput}
                  inputStyle={styles.cardInputText}
                  placeholder="请输入名称"
                  maxLength={20}
                  placeholderTextColor="#CCCCCC"
                  value={form.ruleName}
                  onChangeText={value =>
                    setForm(prev => ({
                      ...prev,
                      ruleName: String(value ?? ''),
                    }))
                  }
                />
              </View>
            </View>

            <View>
              <View style={styles.rowTop}>
                <View style={styles.labelBox}>
                  <Text style={styles.required}>*</Text>
                  <Text style={styles.label}>收费方式</Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.selector}
                  onPress={openChargeTypePopup}
                >
                  <Text style={styles.selectorText}>
                    {!form.chargeType
                      ? '请选择'
                      : form.chargeType === 'duration'
                      ? '按时长计费'
                      : '按次数计费'}
                  </Text>
                  <AppIcon
                    name="a-headfor-20"
                    style={styles.selectorIcon}
                    color="#333"
                    size={px(16)}
                  />
                </TouchableOpacity>
              </View>
              {form.chargeType === 'duration' ? (
                <>
                  <View style={styles.inlineFeeRow}>
                    <Text style={styles.inlineText}>每</Text>
                    <View style={styles.inlineInput2}>
                      <Input
                        style={styles.cardInput}
                        inputStyle={styles.cardInputText2}
                        placeholder=""
                        maxLength={3}
                        type="number"
                        placeholderTextColor="#CCCCCC"
                        value={form.durationMinute}
                        onChangeText={value =>
                          setForm(prev => ({
                            ...prev,
                            durationMinute: normalizeMinuteInput(
                              String(value ?? ''),
                            ),
                          }))
                        }
                      />
                    </View>
                    <Text style={styles.inlineText}>分钟</Text>
                    <View style={styles.inlineInput}>
                      <Input
                        style={styles.cardInput}
                        inputStyle={styles.cardInputText2}
                        placeholder=""
                        type="number"
                        placeholderTextColor="#CCCCCC"
                        value={form.durationFee}
                        onChangeText={value =>
                          setForm(prev => ({
                            ...prev,
                            durationFee: normalizeMoneyInput(
                              String(value ?? ''),
                            ),
                          }))
                        }
                      />
                    </View>
                    <Text style={styles.inlineText}>元</Text>
                  </View>

                  <View style={styles.rowWithDivider}>
                    <View style={styles.labelBox}>
                      <Text style={styles.required}>*</Text>
                      <Text style={styles.label}>最高收费</Text>
                    </View>
                    <View style={styles.rightInline}>
                      <View style={styles.inlineInput}>
                        <Input
                          style={styles.cardInput}
                          inputStyle={styles.cardInputText2}
                          placeholder=""
                          type="number"
                          placeholderTextColor="#CCCCCC"
                          value={form.maxFee}
                          onChangeText={value =>
                            setForm(prev => ({
                              ...prev,
                              maxFee: normalizeMoneyInput(String(value ?? '')),
                            }))
                          }
                        />
                      </View>
                      <Text style={styles.inlineText}>元</Text>
                    </View>
                  </View>

                  <View style={styles.rowWithDivider}>
                    <View style={styles.leftWithIcon}>
                      <View style={styles.labelBox}>
                        <Text style={styles.required}>*</Text>
                        <Text style={styles.label}>计费周期</Text>
                      </View>
                      <TouchableOpacity
                        activeOpacity={0.85}
                        style={{ marginLeft: px(4) }}
                        onPress={e => {
                          e?.stopPropagation?.();
                          setShowChargeTips(false);
                          setShowCycleTips(!showCycleTips);
                        }}
                      >
                        <AppIcon
                          name={'a-styledescription'}
                          color="#333"
                          size={px(20)}
                        />
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      style={styles.selector}
                      onPress={openCyclePopup}
                    >
                      <Text style={styles.selectorText}>
                        {[null, undefined].includes(form?.billingCycle as any)
                          ? '请选择'
                          : getCycleLabel(form.billingCycle as any)}
                      </Text>
                      <AppIcon
                        style={styles.selectorIcon}
                        name="a-headfor-20"
                        color="#333"
                        size={px(16)}
                      />
                    </TouchableOpacity>

                    {showCycleTips ? (
                      <View style={styles.tooltip}>
                        <Text style={styles.tooltipText}>
                          一个周期内满足最高收费后将不再进行计费
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  <View style={styles.row2}>
                    <View style={styles['row2-top']}>
                      <View style={styles.labelBox}>
                        <Text style={styles.required}>*</Text>
                        <Text style={styles.label}>计费方式</Text>
                      </View>
                      <TouchableOpacity
                        activeOpacity={0.85}
                        style={{ marginLeft: px(4) }}
                        onPress={e => {
                          e?.stopPropagation?.();
                          setShowCycleTips(false);
                          setShowChargeTips(!showChargeTips);
                        }}
                      >
                        <AppIcon
                          name={'a-styledescription'}
                          color="#333"
                          size={px(20)}
                        />
                      </TouchableOpacity>
                      {showChargeTips ? (
                        <View style={styles.tooltipWide}>
                          <Text style={styles.tooltipText}>
                            滚动计费：一个计费周期内满足最高收费后不再计费，勾选后在下一个计费周期将继续计费
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    <View style={styles.radioWrap}>
                      <Radio
                        label="滚动计费"
                        active={form.rollingBilling}
                        onPress={() =>
                          setForm(prev => ({ ...prev, rollingBilling: true }))
                        }
                      />
                      <Radio
                        label="不滚动"
                        active={!form.rollingBilling}
                        onPress={() =>
                          setForm(prev => ({ ...prev, rollingBilling: false }))
                        }
                      />
                    </View>
                  </View>

                  <View
                    style={[
                      styles.row2,
                      { borderBottomWidth: 0, paddingBottom: px(16) },
                    ]}
                  >
                    <View style={styles['row2-top']}>
                      <View style={styles.labelBox}>
                        <Text style={styles.required}>*</Text>
                        <Text style={styles.label}>
                          不足一个计费单位时是否计费
                        </Text>
                      </View>
                    </View>
                    <View style={styles.radioWrap}>
                      <Radio
                        label="是"
                        active={form.chargeIfLessThanUnit}
                        onPress={() =>
                          setForm(prev => ({
                            ...prev,
                            chargeIfLessThanUnit: true,
                          }))
                        }
                      />
                      <Radio
                        label="否"
                        active={!form.chargeIfLessThanUnit}
                        onPress={() =>
                          setForm(prev => ({
                            ...prev,
                            chargeIfLessThanUnit: false,
                          }))
                        }
                      />
                    </View>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.inlineFeeRow}>
                    <Text style={styles.inlineText}>每次</Text>
                    <View style={styles.inlineInput}>
                      <Input
                        style={styles.cardInput}
                        inputStyle={styles.cardInputText2}
                        placeholder=""
                        type="number"
                        placeholderTextColor="#CCCCCC"
                        value={form.timesFee}
                        onChangeText={value =>
                          setForm(prev => ({
                            ...prev,
                            timesFee: normalizeMoneyInput(String(value ?? '')),
                          }))
                        }
                      />
                    </View>
                    <Text style={styles.inlineText}>元</Text>
                  </View>

                  <View style={styles.row2}>
                    <View style={styles['row2-top']}>
                      <View style={styles.labelBox}>
                        <Text style={styles.required}>*</Text>
                        <Text style={styles.label}>是否开启计费周期</Text>
                      </View>
                      <TouchableOpacity
                        activeOpacity={0.85}
                        style={{ marginLeft: px(4) }}
                        onPress={e => {
                          e?.stopPropagation?.();
                          setShowCycleTips2(!showCycleTips2);
                        }}
                      >
                        <AppIcon
                          name={'a-styledescription'}
                          color="#333"
                          size={px(20)}
                        />
                      </TouchableOpacity>
                      {showCycleTips2 ? (
                        <View style={styles.tooltip2}>
                          <Text style={styles.tooltipText}>
                            一个周期内满足最高收费后将不再进行计费
                          </Text>
                        </View>
                      ) : null}
                    </View>
                    <View style={styles.radioWrap}>
                      <Radio
                        label="是"
                        active={form.enableCycleForTimes}
                        onPress={() =>
                          setForm(prev => ({
                            ...prev,
                            enableCycleForTimes: true,
                          }))
                        }
                      />
                      <Radio
                        label="否"
                        active={!form.enableCycleForTimes}
                        onPress={() =>
                          setForm(prev => ({
                            ...prev,
                            enableCycleForTimes: false,
                          }))
                        }
                      />
                    </View>
                  </View>

                  <View
                    style={[
                      styles.row,
                      { paddingTop: px(20), borderBottomWidth: 0 },
                      !form.enableCycleForTimes ? { opacity: 0.55 } : null,
                    ]}
                  >
                    <View style={styles.leftWithIcon}>
                      <View style={styles.labelBox}>
                        <Text style={styles.required}>*</Text>
                        <Text style={styles.label}>计费周期</Text>
                      </View>
                      <TouchableOpacity
                        activeOpacity={0.85}
                        style={{ marginLeft: px(4) }}
                        disabled={!form.enableCycleForTimes}
                        onPress={e => {
                          e?.stopPropagation?.();
                          setShowCycleTips(!showCycleTips);
                        }}
                      >
                        <AppIcon
                          name={'a-styledescription'}
                          color={
                            !form.enableCycleForTimes ? '#999999' : '#333333'
                          }
                          size={px(20)}
                        />
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      activeOpacity={0.85}
                      disabled={!form.enableCycleForTimes}
                      style={[
                        styles.selector,
                        !form.enableCycleForTimes
                          ? { backgroundColor: '#F5F5F5' }
                          : null,
                      ]}
                      onPress={openCyclePopup}
                    >
                      <Text
                        style={[
                          styles.selectorText,
                          !form.enableCycleForTimes
                            ? { color: '#B7B7B7' }
                            : null,
                        ]}
                      >
                        {[null, undefined].includes(form?.billingCycle as any)
                          ? '请选择'
                          : getCycleLabel(form.billingCycle as any)}
                      </Text>
                      <AppIcon
                        style={styles.selectorIcon}
                        name="a-headfor-20"
                        color={
                          !form.enableCycleForTimes ? '#A9A9A9' : '#333333'
                        }
                        size={px(16)}
                      />
                    </TouchableOpacity>

                    {showCycleTips && form.enableCycleForTimes ? (
                      <View style={styles.tooltip}>
                        <Text style={styles.tooltipText}>
                          一个周期内满足最高收费后将不再进行计费
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </>
              )}
              <View style={styles.row3}>
                <View style={styles.labelBox}>
                  <Text style={styles.label}>免费时长</Text>
                </View>
                <View style={[styles.inlineFeeRow, { borderBottomWidth: 0 }]}>
                  <View style={styles.inlineInput}>
                    <Input
                      style={styles.cardInput}
                      inputStyle={styles.cardInputText2}
                      placeholder=""
                      type="number"
                      placeholderTextColor="#CCCCCC"
                      value={form.freeTime}
                      onChangeText={value =>
                        setForm(prev => ({
                          ...prev,
                          freeTime: normalizeMinuteInput(String(value ?? '')),
                        }))
                      }
                    />
                  </View>
                  <Text style={styles.inlineText}>分钟</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      <Popup
        visible={showChargeTypePopup}
        onClose={() => setShowChargeTypePopup(false)}
        title={<Text style={styles.popupTitle}>选择收费方式</Text>}
        footer={
          <View style={styles.popupFooter}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.popupBtn, styles.popupCancelBtn]}
              onPress={() => setShowChargeTypePopup(false)}
            >
              <Text style={styles.popupCancelText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.popupBtn, styles.popupConfirmBtn]}
              onPress={() => {
                setForm(prev => ({ ...prev, chargeType: pendingChargeType }));
                setShowChargeTypePopup(false);
              }}
            >
              <Text style={styles.popupConfirmText}>确认</Text>
            </TouchableOpacity>
          </View>
        }
      >
        <View style={styles.pickerPanel}>
          <PickerView
            data={CHARGE_TYPE_OPTIONS.map(option => ({
              label: option.label,
              value: option.value,
            }))}
            value={[pendingChargeType || 'duration']}
            cols={1}
            style={{ height: px(126) }}
            cascade={false}
            itemHeight={px(54)}
            numberOfLines={1}
            itemStyle={styles.pickerItemText}
            indicatorStyle={styles.pickerIndicator}
            onChange={values => {
              setPendingChargeType(
                getPickerValue(
                  values as Array<string | number>,
                  pendingChargeType || 'duration',
                ),
              );
            }}
          />
        </View>
      </Popup>

      <Popup
        visible={showCyclePopup}
        onClose={() => setShowCyclePopup(false)}
        title={<Text style={styles.popupTitle}>选择计费周期</Text>}
        footer={
          <View style={styles.popupFooter}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.popupBtn, styles.popupCancelBtn]}
              onPress={() => setShowCyclePopup(false)}
            >
              <Text style={styles.popupCancelText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.popupBtn, styles.popupConfirmBtn]}
              onPress={() => {
                setForm(prev => ({
                  ...prev,
                  billingCycle: pendingBillingCycle,
                }));
                setShowCyclePopup(false);
              }}
            >
              <Text style={styles.popupConfirmText}>确认</Text>
            </TouchableOpacity>
          </View>
        }
      >
        <View style={styles.pickerPanel}>
          <PickerView
            data={CYCLE_OPTIONS.map(option => ({
              label: option.label,
              value: option.value,
            }))}
            value={[pendingBillingCycle]}
            cols={1}
            cascade={false}
            itemHeight={px(54)}
            numberOfLines={1}
            style={{ height: px(180) }}
            itemStyle={styles.pickerItemText}
            indicatorStyle={styles.pickerIndicator}
            onChange={values => {
              setPendingBillingCycle(
                getPickerValue(
                  values as Array<string | number>,
                  pendingBillingCycle,
                ) as BillingCycle,
              );
            }}
          />
        </View>
      </Popup>
    </PageContainer>
  );
}
