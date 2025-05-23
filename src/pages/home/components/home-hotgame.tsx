import React from 'react';
import globalStore from '@/services/global.state';
import theme from '@/style';
import Carousel from 'react-native-reanimated-carousel';
import {View} from 'react-native';
import {goTo, navigateGame} from '@/utils';
import LazyImage from '@basicComponents/image';
import TouchableOpacity from '@basicComponents/touchable-opacity';
import {toLiveCasino} from '../home.util';

export type HotGameType = 'game' | 'live-casino';

export interface HotGameListItem {
  img: string;
  name: string;
  link: string;
  type: HotGameType;
  table?: string;
}

export interface HomeHotGameProps {
  hotGameList: HotGameListItem[];
}

const HomeHotGame: React.FC<HomeHotGameProps> = ({hotGameList}) => {
  const pictureWidth = (globalStore.screenWidth * 224) / 375;
  const height = (globalStore.screenWidth * 128) / 375;
  const handleGoTo = (item: HotGameListItem) => {
    if (globalStore.token) {
      if (item.type === 'game') {
        /* navigateTo(
          `${item.link}${globalStore.token}&homeurl=${
            globalStore.isWeb ? window.location.href : 'Home'
          }`,
        ); */
        navigateGame(item.name, item.link);
        return;
      }
      // goTo('Live', {link: item.link, table: item.table});
      toLiveCasino(item.link, item.table + '');
    } else {
      goTo('Login');
    }
  };
  return (
    <View style={[theme.position.rel]}>
      <View style={[theme.padding.lrl, theme.margin.btml]}>
        <Carousel
          loop
          width={pictureWidth + theme.paddingSize.s}
          style={[theme.fill.fillW]}
          height={height}
          autoPlay={true}
          autoPlayInterval={2000}
          scrollAnimationDuration={1000}
          data={hotGameList}
          renderItem={({item}) => (
            <TouchableOpacity
              style={[
                theme.borderRadius.m,
                theme.overflow.hidden,
                theme.background.palegrey,
                {
                  width: pictureWidth,
                  height: height,
                },
              ]}
              onPress={() => {
                handleGoTo(item);
              }}>
              <LazyImage
                imageUrl={item.img}
                height={height}
                width={pictureWidth}
              />
            </TouchableOpacity>
          )}
        />
      </View>
      {!hotGameList.length && (
        <View
          style={[
            // eslint-disable-next-line react-native/no-inline-styles
            {
              height: height,
              width: globalStore.screenWidth - theme.paddingSize.l * 2,
              left: 12,
              top: 0,
            },
            theme.borderRadius.m,
            theme.position.abs,
            theme.background.palegrey,
          ]}
        />
      )}
    </View>
  );
};

export default HomeHotGame;
