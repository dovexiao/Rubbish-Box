import React, {memo, useEffect, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import CustomTitle from '../recharge/custom-title';
import theme from '@/style';
import {scaleSize} from '@/utils';
import Text from '@/components/basic/text';
import {Trans, useTranslation} from 'react-i18next';
import {getWithdrawRule} from './withdraw.service';

export interface WithdrawActualReceivedProps {}

const WithdrawActualReceived = ({}: WithdrawActualReceivedProps) => {
  const {i18n} = useTranslation();

  const [ruleList, setRuleList] = useState<
    {
      label: string;
      value: string | number;
    }[]
  >([
    {
      label: i18n.t('withdraw-page.actualAmount.rule.dailyWithdrawalLimit'),
      value: 0,
    },
    {
      label: i18n.t('withdraw-page.actualAmount.rule.withdrawalFees'),
      value: 0,
    },
    {
      label: i18n.t('withdraw-page.actualAmount.rule.dailyWithdrawalTimes'),
      value: 0,
    },
    {
      label: i18n.t('withdraw-page.actualAmount.rule.minimumWithdrawal'),
      value: 0,
    },
  ]);

  useEffect(() => {
    const fetchWithdrawRule = async () => {
      try {
        const {minAmount, per, withAmount, withCount} = await getWithdrawRule();

        setRuleList([
          {
            label: i18n.t(
              'withdraw-page.actualAmount.rule.dailyWithdrawalLimit',
            ),
            value: withAmount,
          },
          {
            label: i18n.t('withdraw-page.actualAmount.rule.withdrawalFees'),
            value: per,
          },
          {
            label: i18n.t(
              'withdraw-page.actualAmount.rule.dailyWithdrawalTimes',
            ),
            value: withCount,
          },
          {
            label: i18n.t('withdraw-page.actualAmount.rule.minimumWithdrawal'),
            value: minAmount,
          },
        ]);
      } catch (error) {
      } finally {
      }
    };

    fetchWithdrawRule();
  }, []);

  return (
    <View style={[theme.padding.lrl, theme.padding.bl, theme.margin.lrl]}>
      <CustomTitle name={i18n.t('withdraw-page.label.received')} />

      <View
        style={[
          theme.background.primary,
          theme.borderRadius.m,
          styles.contentContainer,
        ]}>
        {ruleList.map(item => {
          return (
            <View style={styles.cell}>
              <Text white style={styles.text} fontSize={scaleSize(14)}>
                {item.label}
              </Text>
              <Text white style={styles.text} fontSize={scaleSize(14)}>
                {item.value}
              </Text>
            </View>
          );
        })}

        <View>
          <View>
            <Text white style={styles.subTitle}>
              {i18n.t('withdraw-page.actualAmount.subTitle')}:
            </Text>
          </View>

          <Text>
            <Text white style={styles.note}>
              1.{' '}
            </Text>
            <Trans i18nKey={'withdraw-page.rules.fee'} values={{percent: '3%'}}>
              <Text white style={styles.note} />
              <Text color={theme.fontColor.primary} style={styles.note} />
            </Trans>
          </Text>

          <Text white style={styles.note}>
            <Text white style={styles.note}>
              2.{' '}
            </Text>
            {i18n.t('withdraw-page.rules.note')}
            <Text color={theme.fontColor.primary} style={styles.note}>
              2 hours
            </Text>
            <Text white style={styles.note}>
              {i18n.t('withdraw-page.rules.limit')}
              <Text color={theme.fontColor.primary} style={styles.note}>
                24 hours
              </Text>
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: scaleSize(12),
    minHeight: scaleSize(100),
    paddingBottom: scaleSize(12),
  },
  cell: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: scaleSize(12),
    borderBottomWidth: scaleSize(1),
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  text: {
    fontWeight: 'bold',
  },
  subTitle: {
    fontSize: scaleSize(14),
    fontWeight: 'bold',
    paddingTop: scaleSize(12),
    paddingBottom: scaleSize(4),
  },
  note: {
    opacity: 0.9,
    fontSize: scaleSize(12),
    lineHeight: scaleSize(22),
    // color: '#ffffff',
  },
});

export default memo(WithdrawActualReceived);
