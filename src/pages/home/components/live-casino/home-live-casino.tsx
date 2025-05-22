import React from 'react';
import {LiveGameListItem} from '../../home.type';
import HomeFloorBox from '../floor/home-floor-box';
import globalStore from '@/services/global.state';
import theme from '@/style';
import HomeLiveCasinoCard from './home-live-casino-card';
import {goTo} from '@/utils';
import {StyleSheet, View} from 'react-native';
import {useTranslation} from 'react-i18next';

const HomeLiveCasino = ({
  liveCasinoList,
}: {
  liveCasinoList: LiveGameListItem[];
}) => {
  const {i18n} = useTranslation();
  const cardWidth =
    (globalStore.screenWidth - theme.paddingSize.l * 2 - theme.paddingSize.s) /
    2;
  const imageHeight = (cardWidth * 114) / 172;
  const styles = StyleSheet.create({
    wrap: {
      minHeight: imageHeight + 88 + theme.paddingSize.l,
      marginBottom: -2,
    },
  });
  return (
    <View style={[styles.wrap]}>
      <HomeFloorBox
        title={i18n.t('home.live-casino.title')}
        list={liveCasinoList}
        itemWidth={cardWidth}
        onPressViewAll={() => {
          goTo('Live');
        }}
        titleIcon={require('@assets/icons/home/live-casino-floor-icon.webp')}
        titleBgImg={require('@assets/imgs/home/floor-bg.webp')}
        renderItem={(item, index) => {
          return (
            <HomeLiveCasinoCard
              key={index}
              imageHeight={imageHeight}
              cardWidth={cardWidth}
              item={item}
              marginRight={index < liveCasinoList.length - 1}
            />
          );
        }}
      />
    </View>
  );
};

export default HomeLiveCasino;
