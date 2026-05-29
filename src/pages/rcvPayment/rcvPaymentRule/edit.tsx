import React, { useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Input, PickerView } from '@ant-design/react-native';
import { useRoute } from '@react-navigation/native';
import { PageContainer, Popup } from '@/components';
import AppIcon from '@/components/AppIcon';
import GradientButton from '@/components/GradientButton';
import { px } from '@/utils/ui';
import styles from './editStyles';

type ChargeType = 'duration' | 'times';
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
  chargeIfLessThanUnit: boolean;
};

const CHARGE_TYPE_OPTIONS: Array<{ value: ChargeType; label: string }> = [
  { value: 'duration', label: '按时长计费' },
  { value: 'times', label: '按次数计费' },
];

const CYCLE_OPTIONS: Array<{ value: BillingCycle; label: string }> = [
  { value: 'naturalDay', label: '自然日' },
  { value: '24h', label: '24小时' },
  { value: '48h', label: '48小时' },
];

const getCycleLabel = (value: BillingCycle) =>
  CYCLE_OPTIONS.find(it => it.value === value)?.label || '24小时';

const getPickerValue = <T extends string>(
  values: Array<string | number>,
  fallback: T,
) => {
  const next = values?.[0];
  return (next ?? fallback) as T;
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
  const route = useRoute<any>();

  const ruleId = route.params?.ruleId;
  const isEdit = !!ruleId;

  const [form, setForm] = useState<RuleForm>({
    ruleName:
      route.params?.rule?.ruleName ||
      route.params?.rule?.name ||
      '地上收费规则',
    chargeType: route.params?.rule?.chargeType || 'duration',
    durationMinute: String(route.params?.rule?.durationMinute ?? '60'),
    durationFee: String(route.params?.rule?.durationFee ?? '5'),
    maxFee: String(route.params?.rule?.maxFee ?? '100'),
    timesFee: String(route.params?.rule?.timesFee ?? '5'),
    enableCycleForTimes: route.params?.rule?.enableCycleForTimes ?? true,
    billingCycle: route.params?.rule?.billingCycle || '24h',
    rollingBilling: route.params?.rule?.rollingBilling ?? true,
    chargeIfLessThanUnit: route.params?.rule?.chargeIfLessThanUnit ?? true,
  });

  const [showCycleTips, setShowCycleTips] = useState(false);
  const [showCycleTips2, setShowCycleTips2] = useState(false);
  const [showChargeTips, setShowChargeTips] = useState(false);

  const [showChargeTypePopup, setShowChargeTypePopup] = useState(false);
  const [showCyclePopup, setShowCyclePopup] = useState(false);

  const [pendingChargeType, setPendingChargeType] = useState<ChargeType>(
    form.chargeType,
  );
  const [pendingBillingCycle, setPendingBillingCycle] = useState<BillingCycle>(
    form.billingCycle as BillingCycle,
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
    setPendingChargeType(form.chargeType);
    setShowChargeTypePopup(true);
  };

  const openCyclePopup = () => {
    closeAllTips();
    setPendingBillingCycle(form.billingCycle as BillingCycle);
    setShowCyclePopup(true);
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
            onPress={async () => {}}
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
                  // onChangeText={setRecvName}
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
                    <View style={styles.inlineInput}>
                      <Input
                        style={styles.cardInput}
                        inputStyle={styles.cardInputText2}
                        placeholder=""
                        maxLength={3}
                        type="number"
                        placeholderTextColor="#CCCCCC"
                        value={form.durationMinute}
                        // onChangeText={setRecvName}
                      />
                    </View>
                    <Text style={styles.inlineText}>分钟</Text>
                    <View style={styles.inlineInput}>
                      <Input
                        style={styles.cardInput}
                        inputStyle={styles.cardInputText2}
                        placeholder=""
                        maxLength={3}
                        type="number"
                        placeholderTextColor="#CCCCCC"
                        value={form.durationFee}
                        // onChangeText={setRecvName}
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
                          maxLength={3}
                          type="number"
                          placeholderTextColor="#CCCCCC"
                          value={form.maxFee}
                          // onChangeText={setRecvName}
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
                      <Text style={styles.inlineInputText}>
                        {form.timesFee}
                      </Text>
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
            value={[pendingChargeType]}
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
                  pendingChargeType,
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
