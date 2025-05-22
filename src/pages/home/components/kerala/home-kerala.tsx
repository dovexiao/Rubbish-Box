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

const HomeKerala = forwardRef<View, HomeKeralaProps>((props, ref) => {
  const {i18n} = useTranslation();
  const {style, keralaList, ...otherProp} = props;
  // TODO 优化布局规则
  const cardWidth =
    (globalStore.screenWidth -
      theme.paddingSize.l * 3 -
      theme.paddingSize.s -
      2) /
    3;
  const imageHeight = (cardWidth * 200) / 200;
  return (
    <View
      ref={ref}
      {...otherProp}
      style={[
        // {minHeight: imageHeight + 88 + theme.paddingSize.l},
        theme.borderRadius.s,
        style,
      ]}>
      <HomeFloorBox
        title={i18n.t('home.kerala.title')}
        list={keralaList}
        itemWidth={cardWidth}
        onPressViewAll={() => goTo('HomeDetail', {detailType: 'kerala'})}
        titleIcon={require('@assets/icons/home/little.webp')}
        titleIconSize={8}
        renderItem={(item, index) => {
          return (
            <HomeKeralaCard
              key={index}
              imageHeight={imageHeight}
              cardWidth={cardWidth}
              item={item}
              marginRight={index % 3 == 2 ? false : true}
              marginTop={index < 3 ? false : true}
            />
          );
        }}
      />
    </View>
  );
});

export default HomeKerala;
