/* eslint-disable prettier/prettier */
import RecordItem from '@/components/business/records-item';
import globalStore from '@/services/global.state';
import {BasicObject} from '@/types';
import {toPriceStr} from '@/utils';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';
import Text from '@components/basic/text';
import theme from '@/style';
import LazyImage from '@/components/basic/image';
import {
  RechargeLogItem,
  WithdrawLogItem,
  TransferLogItem,
} from './records-service';
const defaultCard = require('@/assets/icons/withdraw/default-card-icon.webp');
const ICONS = {
  withdraw: require('@assets/icons/records/withdraw-new.webp'),
  recharge: require('@assets/icons/records/recharge-new.webp'),
  transfer: require('@assets/icons/records/transfer-new.webp'),
} as BasicObject;

const Item = (
  props:
    | {
        type: 'withdraw';
        info: WithdrawLogItem;
      }
    | {
        type: 'recharge';
        info: RechargeLogItem;
      }
    | {
        type: 'transfer';
        info: TransferLogItem;
      },
) => {
  const {i18n} = useTranslation();
  const {type, info} = props;

  const detailInfo = React.useMemo(() => {
    switch (type) {
      case 'withdraw':
        const data = [
          {
            key: i18n.t('records.label.received'),
            value: `${toPriceStr(info.reward, {
              thousands: true,
              spacing: true,
              currency: globalStore.currency,
            })}`,
          },
          {
            key: i18n.t('records.label.commission'),
            value: `- ${toPriceStr(info.withdrawFeeRate * info.paidAmount, {
              thousands: true,
              spacing: true,
              currency: globalStore.currency,
            })}`,
          },
          {
            key: i18n.t('records.label.withdrawChannel'),
            value: (
              <View style={[theme.flex.row, theme.flex.centerByCol]}>
                <View style={[theme.flex.alignEnd, theme.margin.rights]}>
                  <Text color={theme.fontColor.white}>{info.bankName}</Text>
                  <Text color={theme.fontColor.white}>
                    {info.userCardNumber}
                  </Text>
                </View>
                <LazyImage
                  imageUrl={defaultCard}
                  width={32}
                  height={32}
                  occupancy="transparent"
                />
              </View>
            ),
          },
          {
            key: i18n.t('records.label.orderNum'),
            value: info.orderNo,
          },
        ];
        if (info.status === 'FAILED') {
          data.push({
            key: i18n.t('records.label.remark'),
            value: info.remark,
          });
        }
        return data;
      case 'recharge':
        return [
          {
            key: `${i18n.t('label.recharge')} ${i18n.t(
              'records.label.amount',
            )}`,
            value: toPriceStr(info.paidAmount, {
              thousands: true,
              spacing: true,
              currency: globalStore.currency,
            }),
          },
          {
            key: `${i18n.t('label.recharge')} ${i18n.t(
              'records.label.reward',
            )}`,
            value:
              '+' +
              toPriceStr(info.reward, {
                thousands: true,
                spacing: true,
                currency: globalStore.currency,
              }),
          },
          {
            key: i18n.t('records.label.orderNum'),
            value: info.orderNo,
          },
        ];
      case 'transfer':
        return [
          {
            key: `${i18n.t('label.transfer')} ${i18n.t(
              'records.label.amount',
            )}`,
            value: toPriceStr(info.price, {
              thousands: true,
              spacing: true,
              currency: globalStore.currency,
            }),
          },
          {
            key: `${i18n.t('label.transfer')} ${i18n.t(
              'records.label.reward',
            )}`,
            value:
              '+' +
              toPriceStr(info.reward || 0, {
                thousands: true,
                spacing: true,
                currency: globalStore.currency,
              }),
          },
          {
            key: i18n.t('records.label.orderNum'),
            value: info.order,
          },
        ];
    }
  }, [info, type, i18n]);
  const statusTip = React.useMemo(() => {
    switch (type) {
      case 'withdraw':
        if (info.status === 'PROCESS') {
          return i18n.t('records.tip.renewTime');
        } else if (info.status === 'FAILED') {
          return i18n.t('records.tip.check');
        } else {
          return '';
        }
      case 'recharge':
        if (info.status === 'PROCESS') {
          return i18n.t('records.tip.renewTime');
        } else {
          return '';
        }
      case 'transfer':
        if (info.status === 'PROCESS') {
          return i18n.t('records.tip.renewTime');
        } else if (info.status === 'FAILED') {
          return i18n.t('records.tip.error');
        } else {
          return '';
        }
    }
  }, [info, type, i18n]);
  return (
    <RecordItem
      showBalance={false}
      type={999}
      hasStatus={type !== 'transfer'}
      status={info.status}
      iconUrl={ICONS[type]}
      hasAmountPrefix={false}
      hasMore
      typeName={type}
      statusTip={statusTip}
      moreData={detailInfo}
      amount={(info.paidAmount || 0) + (info.reward || 0) || info.price}
      balance={info.balance}
      time={info.appDate || info.createTime}
    />
  );
};

export default Item;
