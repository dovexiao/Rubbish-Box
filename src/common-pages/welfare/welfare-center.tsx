import DetailNavTitle from '@/components/business/detail-nav-title';
import theme from '@/style';
import React, {useCallback} from 'react';
import {LazyImageLGBackground} from '@basicComponents/image';
import {ScrollView} from 'react-native';
import CheckInCard from './components/check-in-card';
import NewUserCard from './components/new-user-card';
import QuestCard from './components/quest-card';
import useWelfareStore, {useWelfareStoreActions} from '@/store/useWelfareStore';
import TotalAmountButton from '@/components/business/total-amount-button';
import {useShallow} from 'zustand/react/shallow';
import {useFocusEffect} from '@react-navigation/native';
import JumpButton from './components/jump-button';

const WelfareCenterPage = () => {
  const {getWelfareHomeData} = useWelfareStoreActions();
  const {welfareHomeData} = useWelfareStore(
    useShallow(state => ({
      welfareHomeData: state.welfareHomeData,
    })),
  );

  const fetchHomeData = useCallback(() => {
    getWelfareHomeData();
  }, [getWelfareHomeData]);

  useFocusEffect(fetchHomeData);

  return (
    <LazyImageLGBackground
      showBottomBG={false}
      subtractBottomTabHeight
      style={[theme.position.rel, theme.overflow.hidden]}>
      <DetailNavTitle
        onBack={undefined}
        hideAmount
        serverRight
        title={'WelfareCenter'}
      />
      <ScrollView style={[theme.flex.flex1, theme.padding.lrl]}>
        {/* <MeUser showNoMenu={false} /> */}
        <TotalAmountButton
          optionList={[
            {
              title: 'Coin',
              colors: [theme.basicColor.primary10, theme.basicColor.primary30],
              source: require('@assets/icons/welfare/goldCoin.webp'),
              amount: welfareHomeData?.wealCoinInfo?.coinCount,
            },
            {
              title: 'Gem',
              colors: [theme.basicColor.primary30, theme.basicColor.primary60],
              source: require('@assets/icons/welfare/diamond.webp'),
              amount: welfareHomeData?.wealCoinInfo?.gemCount,
            },
          ]}
        />
        <JumpButton />
        <CheckInCard />
        <NewUserCard />
        <QuestCard />
      </ScrollView>
    </LazyImageLGBackground>
  );
};

export default WelfareCenterPage;
