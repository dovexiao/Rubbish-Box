import theme from '@style';
import React, {forwardRef} from 'react';
import {View, ViewProps} from 'react-native';
import HomeFloorBox from '../floor/home-floor-box';
import globalStore from '@/services/global.state';
import HomeKeralaCard from './home-kerala-card';
import {KeralaListItem} from '../../home.type';
import {goTo} from '@/utils';
import {useTranslation} from 'react-i18next';

interface HomeKeralaProps extends ViewProps {
  keralaList: KeralaListItem[];
}

const MAX_DISPLAY_ITEMS = 8;
const ITEMS_PER_ROW = 2;

const HomeKerala = forwardRef<View, HomeKeralaProps>((props, ref) => {
  const {i18n} = useTranslation();
  const {style, keralaList, ...otherProp} = props;

  const cardWidth =
    (globalStore.screenWidth - theme.paddingSize.l * 2 - theme.paddingSize.s) /
    ITEMS_PER_ROW;

  const imageHeight = (cardWidth * 120) / 200; // 原比例不变，可自定义高度比例

  const displayList = keralaList.slice(0, MAX_DISPLAY_ITEMS);

  return (
    <View ref={ref} {...otherProp} style={[theme.borderRadius.s, style]}>
      <HomeFloorBox
        title={i18n.t('home.kerala.title')}
        list={displayList}
        itemWidth={cardWidth}
        onPressViewAll={() => goTo('HomeDetail', {detailType: 'kerala'})}
        titleIcon={require('@assets/icons/home/little.webp')}
        titleIconSize={8}
        renderItem={(item, index) => {
          const isLastInRow = index % ITEMS_PER_ROW === ITEMS_PER_ROW - 1;
          const isFirstRow = index < ITEMS_PER_ROW;

          return (
            <HomeKeralaCard
              key={index}
              imageHeight={imageHeight}
              cardWidth={cardWidth}
              item={item}
              marginRight={!isLastInRow}
              marginTop={!isFirstRow}
            />
          );
        }}
      />
    </View>
  );
});

export default HomeKerala;
