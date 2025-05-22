import React from 'react';
import {CarListItem} from '../../home.type';
import HomeFloorBox from '../floor/home-floor-box';
import globalStore from '@/services/global.state';
import theme from '@/style';
import HomeCarCard from './home-car-card';
import {StyleSheet, View} from 'react-native';
import {useTranslation} from 'react-i18next';

const bgs = [
  ['#FD3', '#FFEDC0'],
  ['#26BDFF', '#B9FBFF'],
  ['#FF4343', '#FFD8B4'],
];

const HomeCar = ({carList}: {carList: CarListItem[]}) => {
  const {i18n} = useTranslation();
  const cardWidth =
    (globalStore.screenWidth -
      theme.paddingSize.l * 2 -
      theme.paddingSize.xs * 2 -
      4) /
    3;
  const imageHeight = (cardWidth * 133) / 113;
  const styles = StyleSheet.create({
    wrap: {
      minHeight: imageHeight + theme.paddingSize.l,
      marginBottom: -2,
    },
  });
  return (
    <View style={[styles.wrap]}>
      <HomeFloorBox
        title={i18n.t('home.car.title')}
        list={carList}
        itemWidth={cardWidth}
        titleIcon={require('@assets/icons/home/little.webp')}
        titleIconSize={8}
        renderItem={(item, index) => {
          return (
            <HomeCarCard
              key={index}
              imageHeight={imageHeight}
              cardWidth={cardWidth}
              item={item}
              marginRight={index < carList.length - 1}
              bg={bgs[index]}
            />
          );
        }}
      />
    </View>
  );
};

export default HomeCar;
