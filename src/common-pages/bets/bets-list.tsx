import {ActivityIndicator, FlatList, View} from 'react-native';
import React from 'react';
import {SafeAny} from '@/types';
import theme from '@/style';
import Spin from '@/components/basic/spin';
import {
  get3D,
  getColor,
  getDice,
  getKerala,
  getSatta,
  getScratchAndCasino,
  getSports,
} from './bets.service';
import NoData from '@/components/basic/error-pages/no-data';
import {useTranslation} from 'react-i18next';
import Clipboard from '@react-native-clipboard/clipboard';
import globalStore from '@/services/global.state';
import BetsListItem from './bets-list-item';
import useInfiniteScroll from '../hooks/load-more.hooks';
import {formatDate, getDaysByDate} from '@/utils';
const getOrderStatus = (gameName: string, status: string) => {
  if (status === 'ALL') {
    return '3';
  }
  if (['Kerala', '3 Digit', 'Quick 3D'].includes(gameName)) {
    return status === 'UNKNOWN' ? '2' : status === 'KNOWN' ? '0' : '1';
  } else if (['Dice', 'Color'].includes(gameName)) {
    return status === 'UNKNOWN' ? '0' : status === 'KNOWN' ? '4' : '1';
  } else if (gameName === 'Satta Matka') {
    return status === 'UNKNOWN' ? '2' : status === 'KNOWN' ? '4' : '1';
  } else {
    return status === 'UNKNOWN' ? '0' : status === 'KNOWN' ? '4' : '1';
  }
};

const BetsList = (props: {
  currentDate?: Date;
  isActive?: boolean;
  status: string | 'ALL' | 'UNKNOWN' | 'KNOWN' | 'WON';
  game: string;
}) => {
  const pageSize = 10;
  const pageRef = React.useRef(1);
  const hasMores = React.useRef(false);
  const [loading, setLoading] = React.useState(false);
  const [list, setList] = React.useState<SafeAny[]>([]);
  const [firstLoad, setFirstLoad] = React.useState(true);
  const [moreLoading, setMoreLoading] = React.useState(false);
  const {i18n} = useTranslation();
  const {status, game, currentDate = new Date(), isActive = false} = props;

  const {onEndReachedCalledDuringMomentum} = useInfiniteScroll(
    `bets-${status}`,
  );

  React.useEffect(() => {
    if (isActive) {
      setFirstLoad(true);
      getList(true, true).then();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game, currentDate, isActive]);

  const getList = async (refresh = false, isFirst = false) => {
    if (loading || moreLoading) {
      return;
    }
    if (refresh) {
      setList([]);
      pageRef.current = 1;
      if (!firstLoad && !isFirst) {
        setLoading(true);
      }
    } else {
      pageRef.current += 1;
      setMoreLoading(true);
    }
    console.log(11111, game, status);
    const yearMonth = formatDate(currentDate, 'yyyyMM');
    try {
      let res = [];
      let data;
      const normalParams = {
        orderStatus: getOrderStatus(game, status),
        pageNo: pageRef.current,
        pageSize,
        yearMonth,
      };
      console.log(222222, normalParams);
      const startTime = formatDate(currentDate, 'yyyy-MM-01 00:00:00');
      const endTime = formatDate(
        getDaysByDate(currentDate),
        'yyyy-MM-dd 23:59:59',
      );
      switch (game) {
        case 'Kerala':
          // 0:已开奖，1:已中奖，2:未开奖 3:全部
          res =
            (await getKerala({
              ...normalParams,
              // orderStatus
              lotteryType: 'KERALA',
            })) || [];
          break;
        // case '3 Digit':
        case 'Quick 3D':
          // 0:已开奖，1:已中奖，2:未开奖 3:全部
          res = (await get3D(normalParams)) || [];
          break;
        case 'Color':
          // 0-未开奖 1-已中奖 2-未中奖 3全部
          data = await getColor(normalParams);
          res = data!.content || [];
          break;
        case 'Dice':
          // 0-未开奖 1-已中奖 2-未中奖 3全部
          data = await getDice(normalParams);
          res = data!.content || [];
          break;
        case 'Satta Matka':
          // 0未中奖1已中奖2未开奖 3全部
          res = (await getSatta(normalParams)) || [];
          break;
        case 'Quick Race':
        case 'Scratch off':
        case 'Casino':
        case 'Live':
          // 1=中奖 0=已使用 2=未使用 3全部
          const gameType =
            game === 'Scratch off'
              ? 1
              : game === 'Casino'
              ? 2
              : game === 'Quick Race'
              ? 5
              : 3;
          res =
            (await getScratchAndCasino({
              ...normalParams,
              startTime,
              endTime,
              gameType,
            })) || [];
          break;
        case 'Sports':
          // 0未中奖1已中奖2未开奖 3全部
          const result = await getSports({
            ...normalParams,
            startTime,
            endTime,
          });
          res = result.content || [];
          break;
      }
      setList(refresh ? res : list.concat(res));
      hasMores.current = res.length >= pageSize;
    } finally {
      setFirstLoad(false);
      setLoading(false);
      setMoreLoading(false);
    }
  };

  const onLoadMore = async () => {
    if (hasMores.current && !onEndReachedCalledDuringMomentum.current) {
      await getList(false);
      onEndReachedCalledDuringMomentum.current = true;
    }
  };

  const Footer = React.useMemo(() => {
    if (moreLoading) {
      return (
        <View style={[theme.flex.center, theme.padding.l]}>
          <ActivityIndicator />
        </View>
      );
    }
    return null;
  }, [moreLoading]);

  const onCopy = (id: string) => {
    Clipboard.setString(id);
    globalStore.globalSucessTotal(i18n.t('copy-success'));
  };

  return (
    <View style={[theme.flex.flex1]}>
      <Spin loading={firstLoad} style={theme.flex.flex1}>
        <FlatList
          id={`bets-${status}`}
          style={theme.flex.flex1}
          renderItem={({item}) => {
            return (
              <BetsListItem
                info={item}
                hideShare
                onCopy={onCopy}
                canGoDetail
                onRefresh={() => getList(true)}
                game={game}
              />
            );
          }}
          onEndReachedThreshold={0.3}
          onMomentumScrollBegin={() => {
            onEndReachedCalledDuringMomentum.current = false;
          }}
          refreshing={loading}
          onRefresh={() => {
            getList(true).then();
          }}
          onEndReached={onLoadMore}
          ListFooterComponent={Footer}
          keyExtractor={(item, index) => `${index}`}
          data={list}
          ListEmptyComponent={
            !firstLoad && !loading && list && list.length === 0 ? (
              <NoData />
            ) : null
          }
          contentContainerStyle={[
            theme.padding.lrl,
            list.length === 0 && theme.flex.flex1,
          ]}
        />
      </Spin>
    </View>
  );
};

export default BetsList;
