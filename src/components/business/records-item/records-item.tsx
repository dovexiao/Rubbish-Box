import React, {ReactElement} from 'react';
import {
  View,
  StyleSheet,
  LayoutAnimation,
  ViewStyle,
  StyleProp,
} from 'react-native';
import Text from '@/components/basic/text';
import LinearGradient from '@/components/basic/linear-gradient';
import theme from '@/style';
import {capitalizeWords, toPriceStr} from '@/utils';
import globalStore from '@/services/global.state';
import LazyImage from '@components/basic/image';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import dayjs from 'dayjs';
import {useTranslation} from 'react-i18next';
import {ToastType, useToast} from '@/components/basic/modal';
import Clipboard from '@react-native-clipboard/clipboard';

import {CopyImg} from '@/common-pages/profile/svg.variable';

interface moreDataType {
  key: string;
  value: string | ReactElement<{}>;
  canCopy?: boolean;
}

export interface RecordItemType {
  status?: 'PROCESS' | 'COMPLETE' | 'FAILED' | 'REVIEW';
  statusTip?: string;
  iconUrl: string | number;
  type?: number;
  typeName?: string;
  hasMore?: boolean;
  hasAmountPrefix?: boolean;
  isIncome?: boolean;
  showBalance?: boolean;
  hasStatus?: boolean;
  time?: number;
  amount?: number;
  balance?: number;
  moreData?: moreDataType[];
  showHeaderBorder?: boolean;
  style?: StyleProp<ViewStyle>;
}

const COLORS_MAP = {
  PROCESS: {
    icon: null,
    text: 'In progress...',
    bg: theme.linearGradientColor.toDrawnLinearGradient,
    color: theme.fontColor.toDrawnFontColor,
  },
  COMPLETE: {
    icon: require('../../assets/icons/records-list-item/complete.webp'),
    text: 'COMPLETE',
    bg: theme.linearGradientColor.wonLinearGradient,
    color: theme.fontColor.wonFontColor,
  },
  REVIEW: {
    icon: null,
    text: 'In review...',
    bg: theme.linearGradientColor.noWinLinearGradient,
    color: theme.fontColor.noWinFontColor,
  },
  FAILED: {
    icon: require('../../assets/icons/records-list-item/failed.webp'),
    text: 'failed',
    bg: ['rgba(200.81, 2.51, 2.51, 0.08)', 'rgba(200.81, 2.51, 2.51, 0)'],
    color: '#E20000',
  },
};

const RecordItem = (props: RecordItemType) => {
  const {
    type = 0,
    isIncome,
    amount = 0,
    status = 'PROCESS',
    balance = 0,
    time,
    hasMore = true,
    showBalance = true,
    statusTip,
    // iconUrl,
    hasStatus = false,
    hasAmountPrefix,
    moreData = [],
    style = {},
    typeName = '',
    showHeaderBorder = false,
  } = props;
  const {i18n} = useTranslation();
  const isSpecial = React.useMemo(() => {
    return [0, 1, 3, 5, 20].includes(type);
  }, [type]);

  const [showDetail, setShowDetail] = React.useState(false);

  const arrowStyle = React.useMemo(() => {
    return {
      transform: [
        {
          rotate: showDetail ? '180deg' : '0deg',
        },
      ],
    };
  }, [showDetail]);

  const amountColor = React.useMemo(() => {
    if (hasStatus) {
      if (status === 'REVIEW' || status === 'FAILED') {
        return theme.fontColor.secAccent;
      }
    }
    return theme.fontColor.green;
  }, [hasStatus, status]);

  const timeLabel = React.useMemo(() => {
    if (type === 999) {
      return i18n.t(`label.${typeName}`);
    }
    let typeT = 'recharge';
    if (isSpecial) {
      if (type === 3) {
        typeT = 'withdraw';
      }
      if ([0, 20].includes(type)) {
        typeT = 'transfer';
      }
    } else {
      typeT = 'order';
    }
    const t = `label.${typeT}`;
    return i18n.t(t);
  }, [type, isSpecial, i18n, typeName]);

  const {renderModal, show} = useToast();
  const handleCopy = (value: string) => {
    if (value) {
      Clipboard.setString('' + value);
      show({
        type: ToastType.success,
        message: i18n.t('share.copy-success'),
      });
    }
  };
  return (
    <View
      style={[
        theme.borderRadius.s,
        theme.margin.btml,
        theme.padding.btms,
        style,
        {backgroundColor: theme.basicColor.newBgInOne},
      ]}>
      {hasStatus && (
        <LinearGradient
          style={[
            theme.flex.row,
            theme.flex.between,
            theme.padding.lrl,
            theme.padding.tbs,
            styles.progress,
          ]}
          colors={COLORS_MAP[status].bg}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}>
          <View style={[theme.flex.row, theme.flex.centerByCol]}>
            {COLORS_MAP[status].icon && (
              <View style={[theme.margin.rightxxs]}>
                <LazyImage
                  imageUrl={COLORS_MAP[status].icon}
                  width={12}
                  height={12}
                  occupancy="transparent"
                />
              </View>
            )}
            <Text color={COLORS_MAP[status].color}>
              {i18n.t(`records.status.${status}`).toUpperCase()}
            </Text>
          </View>
          <Text
            color={
              status === 'FAILED'
                ? COLORS_MAP[status].color
                : theme.fontColor.primaryMain
            }>
            {statusTip}
          </Text>
        </LinearGradient>
      )}
      <View
        style={[
          styles.item,
          showHeaderBorder
            ? // eslint-disable-next-line react-native/no-inline-styles
              {
                borderBottomWidth: 1,
                borderBottomColor: theme.border.primary50,
              }
            : {},
        ]}>
        <View
          style={[
            theme.flex.row,
            theme.flex.centerByCol,
            theme.margin.rightxl,
            theme.flex.flex1,
          ]}>
          {/* <LazyImage
            imageUrl={iconUrl}
            width={24}
            height={24}
            occupancy="transparent"
          /> */}
          <View style={[theme.flex.flex1]}>
            <Text
              white
              numberOfLines={1}
              // style={[theme.margin.leftl]}
              size="medium"
              fontFamily="fontInterBold">
              {capitalizeWords(typeName)}
            </Text>
          </View>
        </View>
        <NativeTouchableOpacity
          disabled={!hasMore}
          onPress={() => {
            LayoutAnimation.configureNext(
              LayoutAnimation.Presets.easeInEaseOut,
            );
            setShowDetail(!showDetail);
          }}
          style={[theme.flex.row, theme.flex.centerByCol]}>
          <Text style={[theme.margin.rights]}>
            {hasAmountPrefix && (
              <Text blod size="large" color={amountColor}>
                {isIncome ? '+ ' : '- '}
              </Text>
            )}
            <Text blod color={amountColor} size="large">
              {toPriceStr(amount, {
                thousands: true,
                spacing: true,
                currency: globalStore.currency,
              })}
            </Text>
            <Text />
          </Text>
          {hasMore && (
            <View style={arrowStyle}>
              <LazyImage
                width={14}
                height={14}
                occupancy="transparent"
                imageUrl={require('@/components/assets/icons/records-list-item/arrow-down.webp')}
              />
            </View>
          )}
        </NativeTouchableOpacity>
      </View>
      {showBalance && (
        <View style={styles.item}>
          <Text color={theme.fontColor.white}>{i18n.t('label.balance')}</Text>
          <Text color={theme.fontColor.green}>
            {toPriceStr(balance, {
              thousands: true,
              spacing: true,
              currency: globalStore.currency,
            })}
          </Text>
        </View>
      )}
      <View style={styles.item}>
        <Text white>
          {timeLabel} {i18n.t('label.time')}
        </Text>
        <Text white>{dayjs(time).format('DD/MM/YYYY hh:mm A')}</Text>
      </View>
      {showDetail && (
        <View>
          {moreData.map((item, index) => (
            <View style={styles.itemOrder} key={index}>
              <View style={styles.itemOrderKey}>
                <Text color={theme.fontColor.white}>{item.key}</Text>
              </View>
              {React.isValidElement(item.value) ? (
                item.value
              ) : (
                <View style={styles.itemOrderView}>
                  <Text color={theme.fontColor.white}>{item.value}</Text>
                  {item.canCopy && (
                    <NativeTouchableOpacity
                      onPress={() => handleCopy(item.value as string)}>
                      <CopyImg width={16} height={16} />
                    </NativeTouchableOpacity>
                  )}
                </View>
              )}
            </View>
          ))}
        </View>
      )}
      {renderModal}
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    height: 40,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemOrder: {
    minHeight: 40,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemOrderKey: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  itemOrderView: {
    flex: 1,
    color: theme.fontColor.white,
    fontSize: theme.fontSize.s,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  progress: {
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
});

export default RecordItem;
