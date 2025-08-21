import React, {useMemo} from 'react';
import {View} from 'react-native';
import {RecordItem, doReceive} from './rebate.service';
import Text from '@/components/basic/text';
import Button from '@/components/basic/button';
import {useInnerStyle} from './rebate.hooks';
import theme from '@/style';
import LinearGradient from '@/components/basic/linear-gradient';
import dayjs from 'dayjs';
import LazyImage from '@/components/basic/image';
import {bettingIcon, rebateIcon} from './rebate.variables';
import {toPriceStr} from '@/utils';
import globalStore from '@/services/global.state';
import {useRebateSuccessToast} from './rebate-toast.hooks';
import OkIcon from './svg/okIcon';
import {useTranslation} from 'react-i18next';
export interface RebateCardProps {
  data: RecordItem;
  onRefresh: () => void;
}

const RebateCard: React.FC<RebateCardProps> = ({data, onRefresh}) => {
  const {rebateStyle} = useInnerStyle();
  const {i18n} = useTranslation();
  const dataOptions = (receiveStatus: number) => {
    const upMap = [
      i18n.t('rebate.undone'),
      i18n.t('rebate.unclaimed'),
      i18n.t('rebate.completed'),
    ];
    const upColorMap = [
      theme.linearGradientColor.noWinLinearGradient,
      theme.linearGradientColor.toDrawnLinearGradient,
      theme.linearGradientColor.wonLinearGradient,
    ];
    const upTextColorMap = [
      theme.fontColor.noWinFontColor,
      theme.fontColor.toDrawnFontColor,
      theme.fontColor.wonFontColor,
    ];
    const downMap = [
      i18n.t('rebate.unfinished'),
      i18n.t('rebate.receive'),
      'ok',
    ];
    return {
      up: upMap[receiveStatus] || upMap[0],
      down: downMap[receiveStatus] || downMap[0],
      upColor: upColorMap[receiveStatus] || upColorMap[0],
      upText: upTextColorMap[receiveStatus] || upTextColorMap[0],
    };
  };
  const dataOption = useMemo(() => {
    return dataOptions(data.receiveStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const toDate = (time: number) => {
    if (dayjs().startOf('day').isSame(dayjs(time).startOf('day'))) {
      return i18n.t('rebate.today');
    }
    if (
      dayjs()
        .startOf('day')
        .subtract(1, 'day')
        .isSame(dayjs(time).startOf('day'))
    ) {
      return i18n.t('rebate.yesterday');
    }
    return dayjs(time).format('MMM D');
  };
  const {show, renderModal} = useRebateSuccessToast();
  const handleReceive = () => {
    if (data.rebateAmount <= 0) {
      return;
    }
    globalStore.globalLoading.next(true);
    doReceive(data.id)
      .then(() => {
        show(data.rebateAmount);
        onRefresh();
      })
      .finally(() => globalStore.globalLoading.next(false));
  };
  return (
    <View
      style={[
        theme.borderRadius.m,
        theme.padding.l,
        {backgroundColor: theme.basicColor.newBgInOne},
      ]}>
      <LinearGradient
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        colors={dataOption.upColor}
        style={[
          theme.padding.lrl,
          theme.flex.row,
          theme.flex.between,
          rebateStyle.itemLinear,
          theme.flex.centerByCol,
          theme.margin.btml,
        ]}>
        <Text blod fontSize={theme.fontSize.m} white>
          {toDate(data.createTime)}
        </Text>
        <Text color={dataOption.upText} fontSize={theme.fontSize.s}>
          {dataOption.up}
        </Text>
      </LinearGradient>
      <View
        style={[theme.flex.row, theme.flex.between, theme.flex.centerByCol]}>
        <View style={[theme.flex.col]}>
          <View style={[theme.flex.row, theme.flex.centerByCol]}>
            <LazyImage
              imageUrl={bettingIcon}
              width={theme.iconSize.s}
              height={theme.iconSize.s}
              occupancy="#0000"
            />
            <Text style={[theme.margin.lrxxs]} white>
              {i18n.t('rebate.betting')}
            </Text>
            <Text fontSize={theme.fontSize.m} white blod fontFamily="fontInter">
              {toPriceStr(data.betAmount)}
            </Text>
          </View>
          <View
            style={[
              theme.margin.topxs,
              theme.flex.row,
              theme.flex.centerByCol,
            ]}>
            <LazyImage
              imageUrl={rebateIcon}
              width={theme.iconSize.s}
              height={theme.iconSize.s}
              occupancy="#0000"
            />
            <Text style={[theme.margin.lrxxs]} white>
              {i18n.t('rebate.rebate')}
            </Text>
            <Text
              fontSize={theme.fontSize.m}
              color={theme.fontColor.green}
              blod
              fontFamily="fontInter">
              {toPriceStr(data.rebateAmount)}
            </Text>
          </View>
        </View>
        <Button
          type={
            data.receiveStatus === 1 && data.rebateAmount > 0
              ? 'linear-primary'
              : 'primary'
          }
          radius={theme.borderRadiusSize.l}
          disabled={data.receiveStatus !== 1 || data.rebateAmount <= 0}
          disabledStyle={[rebateStyle.buttonDisabled]}
          buttonStyle={[rebateStyle.button, theme.flex.center]}
          onPress={handleReceive}>
          {dataOption.down === 'ok' ? (
            <OkIcon />
          ) : (
            <Text
              color={theme.basicColor.white}
              blod
              fontSize={theme.fontSize.m}>
              {dataOption.down}
            </Text>
          )}
        </Button>
      </View>
      {renderModal}
    </View>
  );
};

export default RebateCard;
