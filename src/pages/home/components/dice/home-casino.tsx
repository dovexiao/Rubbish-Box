import React, {forwardRef} from 'react';
import {View, ViewProps} from 'react-native';
import HomeFloorBox from '../floor/home-floor-box';
import HomeDiceCard from './home-dice-card';
import {DiceListItem} from '../../home.type';
import globalStore from '@/services/global.state';
import theme from '@style';
import {goTo} from '@/utils';
import {useTranslation} from 'react-i18next';

interface HomeDiceProps extends ViewProps {
  diceList: DiceListItem[];
}

const HomeCasino = forwardRef<View, HomeDiceProps>((props, ref) => {
  const {style, diceList, ...otherProp} = props;
  const paddingL = theme.paddingSize.l;
  // TODO 优化布局规则
  const paddingL3xWidth =
    globalStore.screenWidth - paddingL * 3 - theme.paddingSize.s - 3;
  const cardWidth = paddingL3xWidth / 3;
  const imageHeight = (cardWidth * 250) / 300;
  const {i18n} = useTranslation();
  return (
    <View
      ref={ref}
      {...otherProp}
      style={[
        {
          // minHeight: imageHeight + 50 + paddingL,
        },
        theme.borderRadius.s,
        style,
      ]}>
      <HomeFloorBox
        title={i18n.t('home.casino.title')}
        list={diceList}
        itemWidth={cardWidth}
        titleIcon={require('@assets/icons/home/little.webp')}
        titleIconSize={8}
        onPressViewAll={() => goTo('HomeDetail', {detailType: 'dicegame'})}
        renderItem={(item, index) => {
          return (
            <HomeDiceCard
              key={index}
              index={index}
              imageHeight={imageHeight}
              cardWidth={cardWidth}
              item={item}
              marginRight={index % 3 === 2 ? false : true}
              // marginTop={index > -1}
            />
          );
        }}
      />
    </View>
  );
});

export default HomeCasino;
