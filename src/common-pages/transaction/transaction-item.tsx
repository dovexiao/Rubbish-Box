import RecordItem from '@/components/business/records-item';
import theme from '@/style';
import {BasicObject} from '@/types';
import React from 'react';
import {TabType} from './transaction-service';
import globalStore from '@/services/global.state';
import {toPriceStr} from '@/utils';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';
import Text from '@components/basic/text';
import dayjs from 'dayjs';
import LazyImage from '@/components/basic/image';
const defaultCard = require('@/assets/icons/withdraw/default-card-icon.webp');

// const NAMES_ENUM = [
//   {
//     name: 'Winnings',
//     values: [4, 14, 101],
//   },
//   {
//     name: 'Recharge',
//     values: [1, 5],
//   },
//   {
//     name: 'Bets',
//     values: [2],
//   },
//   {
//     name: 'Withdraw',
//     values: [3],
//   },
//   {
//     name: 'Commission',
//     values: [6, 7, 8],
//   },
//   {
//     name: 'Rebate',
//     values: [12, 10],
//   },
//   {
//     name: 'Transfer',
//     values: [0, 20],
//   },
//   {
//     name: 'VIP',
//     values: [19],
//   },
//   {
//     name: 'Casino',
//     values: [98, 99, 102, 103, 104, 105, 106, 107],
//   },
//   {
//     name: 'Scratch',
//     values: [100, 101],
//   },
// ];

const TransactionItem = (props: {
  type?: string;
  info: BasicObject;
  tabs: TabType[];
}) => {
  const {info = {}} = props;
  const {i18n} = useTranslation();
  const moreData = React.useMemo(() => {
    if (info!.payType) {
      // win || bets 2,4,14,101
      if ([2, 4, 14, 101].includes(info.payType)) {
        return [
          {
            key: i18n.t('records.label.game'),
            value: info.gameName,
          },
          {
            key: i18n.t('records.label.order'),
            value: info.order,
          },
        ];
      }
      // transfer 0, 20
      if ([0, 20].includes(info.payType)) {
        return [
          {
            key: `${i18n.t('label.transfer')} ${i18n.t(
              'records.label.amount',
            )}`,
            value: toPriceStr(info.price, {
              thousands: true,
              fixed: 2,
              spacing: true,
              currency: globalStore.currency,
            }),
          },
          {
            key: `${i18n.t('label.transfer')} ${i18n.t(
              'records.label.reward',
            )}`,
            value: `+ ${toPriceStr(info.reward, {
              thousands: true,
              fixed: 2,
              spacing: true,
              currency: globalStore.currency,
            })}`,
          },
          {
            key: i18n.t('records.label.orderNum'),
            value: info.order,
          },
        ];
      }
      // withdraw 3
      if (info.payType === 3) {
        const data = [
          {
            key: i18n.t('records.label.received'),
            value: `${toPriceStr(info.receivedAmount || 0, {
              thousands: true,
              spacing: true,
              fixed: 2,
              currency: globalStore.currency,
            })}`,
          },
          {
            key: i18n.t('records.label.commission'),
            value: `- ${toPriceStr(info.withdrawFeeRate || 0, {
              thousands: true,
              spacing: true,
              fixed: 2,
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
            value: info.order,
          },
        ];
        if (info.status === '2') {
          data.unshift({
            key: i18n.t('records.label.receiptTime'),
            value: dayjs(info.callbackTime).format('DD/MM/YYYY hh:mm'),
          });
        }
        return data;
      }
      // recharge 1,5
      if ([1, 5].includes(info.payType)) {
        return [
          {
            key: `${i18n.t('label.recharge')} ${i18n.t(
              'records.label.amount',
            )}`,
            value: toPriceStr(info.price, {
              thousands: true,
              spacing: true,
              fixed: 2,
              currency: globalStore.currency,
            }),
          },
          {
            key: i18n.t('records.label.orderNum'),
            value: info.order,
          },
        ];
      }
      if ([999].includes(info.payType)) {
        return [
          {
            key: i18n.t('records.label.orderNum'),
            value: info.order,
          },
        ];
      }
      // 其他
      return [
        {
          key: i18n.t('records.label.types'),
          value: info.payTypeName,
        },
      ];
    }
    return [];
  }, [i18n, info]);

  const itemName = React.useMemo(() => {
    // if (info.payType) {
    //   const exist = NAMES_ENUM.find(item => item.values.includes(info.payType));
    //   if (exist) {
    //     return exist!.name;
    //   }
    //   return '';
    // }
    // return '';
    return info.title;
  }, [info]);

  return (
    <RecordItem
      style={[theme.margin.lrl]}
      iconUrl={info.iconUrl}
      hasAmountPrefix
      isIncome={!info.changeType}
      typeName={itemName}
      type={info.payType}
      amount={info.price}
      balance={info.balance}
      time={info.appDate}
      hasMore
      moreData={moreData}
      showHeaderBorder
    />
  );
};

export default TransactionItem;
