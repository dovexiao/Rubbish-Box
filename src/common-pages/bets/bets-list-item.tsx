import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import BetsCard from '@/components/business/bets/card';
import Text from '@/components/basic/text';
import theme from '@/style';
import {BasicObject} from '@/types';
import {goTo, toPriceStr} from '@/utils';
import dayjs from 'dayjs';
import React from 'react';
import {View, ViewStyle, StyleProp} from 'react-native';
import {useTranslation} from 'react-i18next';
import globalStore from '@/services/global.state';
import {toGame} from '../game-navigate';

const BetsListItem = ({
  info,
  onCopy,
  hideShare = false,
  canGoDetail = true,
  game = '',
  onShare = () => {},
  style = {},
  onRefresh = () => {},
}: {
  info: BasicObject;
  onCopy?: (id: string) => void;
  canGoDetail?: boolean;
  hideShare?: boolean;
  game?: string;
  onShare?: () => void;
  onRefresh?: () => void;
  style?: StyleProp<ViewStyle>;
}) => {
  const {i18n} = useTranslation();
  const itemContent = (
    status: number,
    drawTime: string | number,
    orderAmount: number,
    orderNumber: number,
    source?: string,
  ) => {
    if (drawTime) {
      const time =
        typeof drawTime === 'string'
          ? drawTime
          : dayjs(drawTime).format('DD-MM hh:mm A');
      return (
        <View style={[theme.flex.row, theme.flex.centerByCol]}>
          <Text color={theme.basicColor.white} style={[theme.margin.rights]}>
            {i18n.t('bets-page.label.drawTime')}
          </Text>
          <Text color={theme.basicColor.white}>{time}</Text>
        </View>
      );
    }
    if (source) {
      return source === 'SKY GAME' ? (
        ''
      ) : (
        <Text color={theme.basicColor.white}>{source}</Text>
      );
    }
    return `${toPriceStr(orderAmount, {
      fixed: 2,
      showCurrency: true,
      thousands: true,
    })} x ${orderNumber || 1}`;
  };

  const goPlay = () => {
    if (!globalStore.token) {
      goTo('Login', {backPage: 'Home'});
      return;
    }
    goTo('Scratch', {
      path: `my-scratch-list/detail/${info.orderId}`,
    });
  };

  const rightEle = (information: BasicObject = {}) => {
    if (information!.orderOverNum > 0) {
      return (
        <NativeTouchableOpacity
          onPress={goPlay}
          style={[
            theme.padding.lrs,
            theme.padding.tbxxs,
            theme.background.primary,
            theme.borderRadius.xs,
            theme.flex.center,
          ]}>
          <Text
            fontSize={10}
            fontFamily="fontInterBold"
            color={theme.basicColor.white}>
            ({information!.orderOverNum}/{information!.orderNumber})
          </Text>
          <Text fontFamily="fontInterBold" color={theme.basicColor.white}>
            {i18n.t('bets-page.label.playNow')}
          </Text>
        </NativeTouchableOpacity>
      );
    }
    return null;
  };

  const status = React.useMemo(() => {
    console.log(111111, info);
    // const {gameCode} = info.gameCode;
    // if (gameCode === 'kerala') {
    // Kerala
    //   if (info.bonusStatus === 0) {
    //     return info.wonAmount > 0 ? 1 : 0;
    //   }
    //   return info.bonusStatus;
    // }
    // if (gameCode === 'pick3') {
    //   // 3 Digit
    //   if (info.wonCode && !info.wonCode.startsWith('*')) {
    //     // 已开奖
    //     return info.winAmount > 0 ? 1 : 0;
    //   }
    //   return 2;
    // }
    // if (gameCode === 'color') {
    //   // color
    //   if (info.openStatus === 1) {
    //     // 未开奖
    //     return 2;
    //   } else {
    //     return info.awardAmount > 0 ? 1 : 0;
    //   }
    // }
    // if (gameCode === 'matka') {
    //   if (info.openStatus === 1) {
    //     return 2;
    //   }
    //   return info.wonAmount > 0 ? 1 : 0;
    // }
    // if (gameCode === 'dice') {
    //   // dice
    //   if (info.openStatus === 1) {
    //     // 未开奖
    //     return 2;
    //   } else {
    //     return info.totalAwardAmount > 0 ? 1 : 0;
    //   }
    // }
    // if (info.orderStatus !== undefined && info.openStatus !== undefined) {
    //   // 1=中奖 0=未中奖 2=未使用
    //   // scratch
    //   if (info.openStatus === 2) {
    //     // 未开奖
    //     return 2;
    //   }
    //   return info.orderStatus;
    // }
    return info.orderStatus;
  }, [info]);

  const hasShare = React.useMemo(() => {
    if (hideShare) {
      return false;
    }
    return status === 1 || status === 2;
  }, [hideShare, status]);

  const drawTime =
    info.drawDate || info.gameDrawTime || info.openTime || info.drawTime;
  const id = info.orderGroup || info.orderId || info.issueNo || info.issNo;
  const reward =
    info.winAmount ||
    info.awardAmount ||
    info.wonAmount ||
    info.orderWinAmount ||
    info.totalAwardAmount;

  const goDetail = () => {
    if (!globalStore.token) {
      goTo('Login', {backPage: 'Home'});
      return;
    }
    if (game === 'Casino' || game === 'Live') {
      toGame({
        source: info.source,
        name: info.gameName,
        gameUrl: info.gameUrl,
        id: ['Slotegrator', 'WS168', 'SEAG'].includes(info.source)
          ? info.gameId
          : info.orderId,
        tripartiteUniqueness: info.tripartiteUniqueness,
      });
    } else if (game === 'Sports') {
      goTo('Sports');
    } else {
      goTo('BetsDetail', {info: JSON.stringify(info), game, onRefresh});
    }
  };

  const time = React.useMemo(() => {
    const target = info.createTime || info.orderTime;
    if (target) {
      if (typeof target === 'string') {
        return target;
      }
      return dayjs(target).format('DD-MM-YYYY hh:mm A');
    }
  }, [info]);

  return (
    <BetsCard
      style={style}
      goDetail={goDetail}
      canGoDetail={canGoDetail}
      onCopy={() => onCopy && onCopy(id)}
      onShare={onShare}
      payment={
        info.totalAmount ||
        info.amount ||
        (info.orderAmount && info.orderAmount * (info.orderNumber || 1))
      }
      content={itemContent(
        status,
        drawTime,
        info.orderAmount,
        info.orderNumber,
        info.source,
      )}
      status={status}
      time={time}
      id={id}
      rightEle={rightEle(info)}
      reward={reward}
      title={info.gameName || info.issueNo}
      hasShare={hasShare}
      cover={info.gameIconUrl || info.gameIcon}
    />
  );
};

export default BetsListItem;
