import DetailNavTitle from '@/components/business/detail-nav-title';
import theme from '@/style';
import {goBack} from '@/utils';
import React from 'react';
import {View, FlatList, ActivityIndicator} from 'react-native';
import {SafeAny} from '@types';
import Spin from '@/components/basic/spin';

import {
  getRechargeLogs,
  getWithdrawLogs,
  getTransferLogs,
} from './records-service';
import NoData from '@/components/basic/error-pages/no-data';
import {useTranslation} from 'react-i18next';
import Item from './records-item';
import useInfiniteScroll from '../hooks/load-more.hooks';
import {LazyImageLGBackground} from '@/components/basic/image';

const Records = (props: {type: 'withdraw' | 'recharge' | 'transfer'}) => {
  const {i18n} = useTranslation();
  const {type} = props;
  const pageRef = React.useRef(1);
  const hasMores = React.useRef(false);
  const [list, setList] = React.useState<SafeAny[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [firstLoad, setFirstLoad] = React.useState(true);
  const [moreLoading, setMoreLoading] = React.useState(false);

  const title = React.useMemo(() => {
    switch (type) {
      case 'withdraw':
        return `${i18n.t('other.withdraw')} ${i18n.t('other.records')}`;
      case 'recharge':
        return `${i18n.t('label.recharge')} ${i18n.t('label.records')}`;
      case 'transfer':
        return `${i18n.t('label.transfer')} ${i18n.t('label.records')}`;
      default:
        return '';
    }
  }, [i18n, type]);

  const {onEndReachedCalledDuringMomentum} = useInfiniteScroll(
    `${type}-records`,
  );

  React.useEffect(() => {
    if (type) {
      onGetRecordsList(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const pageSize = 10;

  const onGetRecordsList = async (refresh: boolean) => {
    if (loading || moreLoading) {
      return;
    }
    if (refresh) {
      // setList([]);
      pageRef.current = 1;
      if (!firstLoad) {
        setLoading(true);
      }
    } else {
      pageRef.current += 1;
      setMoreLoading(true);
    }
    try {
      let res = [];
      switch (type) {
        case 'withdraw':
          res = await getWithdrawLogs(pageRef.current, pageSize);
          // 状态：0审核中，   1 打款中 ，    2完成，      3拒绝
          // REVIEW         PROCESS     COMPLETE   FAILED
          res.forEach(v => {
            v.status = ['REVIEW', 'PROCESS', 'COMPLETE', 'FAILED'][
              v.respCode
            ] as typeof v.status;
          });
          break;
        case 'recharge':
          res = await getRechargeLogs(pageRef.current, pageSize);
          break;
        case 'transfer':
          res = await getTransferLogs(pageRef.current, pageSize);
          break;
        default:
          return '';
      }
      setList(refresh ? res : list.concat(res));
      hasMores.current = res.length >= pageSize;
    } finally {
      if (firstLoad) {
        setFirstLoad(false);
      }
      setLoading(false);
      setMoreLoading(false);
    }
  };

  const onLoadMore = async () => {
    if (hasMores.current && !onEndReachedCalledDuringMomentum.current) {
      await onGetRecordsList(false);
      onEndReachedCalledDuringMomentum.current = true;
    }
  };

  const Footer = React.useMemo(() => {
    if (moreLoading) {
      return (
        <View style={[theme.flex.center, theme.padding.m]}>
          <ActivityIndicator />
        </View>
      );
    }
    return null;
  }, [moreLoading]);

  return (
    <LazyImageLGBackground style={[theme.fill.fill, theme.flex.col]}>
      <DetailNavTitle onBack={goBack} hideServer hideAmount title={title} />
      <Spin loading={firstLoad} style={[theme.flex.flex1]}>
        <FlatList
          id={`${type}-records`}
          style={[theme.flex.flex1]}
          contentContainerStyle={[theme.padding.lrl, theme.padding.topl]}
          data={list}
          onEndReachedThreshold={0.2}
          onMomentumScrollBegin={() => {
            onEndReachedCalledDuringMomentum.current = false;
          }}
          onEndReached={onLoadMore}
          ListFooterComponent={Footer}
          keyExtractor={(item, index) => `${index}`}
          refreshing={loading}
          onRefresh={() => {
            onGetRecordsList(true);
          }}
          renderItem={({item}) => <Item type={type} info={item} />}
          ListEmptyComponent={
            !firstLoad && list.length === 0 ? <NoData /> : null
          }
        />
      </Spin>
    </LazyImageLGBackground>
  );
};

export default Records;
