import theme from '@/style';
import React, {forwardRef, useMemo} from 'react';
import {View, ViewProps} from 'react-native';
import {MatkaListItem} from '../../home.type';
import HomeFloorBox from '../floor/home-floor-box';
import globalStore from '@/services/global.state';
import {getSeperateList, goTo} from '@/utils';
import HomeMatkaCard from './home-matka-card';
import {useTranslation} from 'react-i18next';

interface HomeMatkaProps extends ViewProps {
  matkaList: MatkaListItem[];
}

const HomeMatka = forwardRef<View, HomeMatkaProps>((props, ref) => {
  const {i18n} = useTranslation();
  const {style, matkaList, ...otherProp} = props;
  const cardWidth =
    (globalStore.screenWidth -
      theme.paddingSize.l * 3 -
      theme.paddingSize.s -
      2) /
    3;
  const imageHeight = (cardWidth * 300) / 200;
  const seprateMatkaList = useMemo(() => {
    return getSeperateList(matkaList, 3);
  }, [matkaList]);

  return (
    <View
      ref={ref}
      {...otherProp}
      style={[
        // {
        //   minHeight: imageHeight,
        // },
        theme.borderRadius.s,
        style,
      ]}>
      <HomeFloorBox
        title={i18n.t('home.matka.title')}
        list={seprateMatkaList}
        itemWidth={cardWidth}
        titleIcon={require('@assets/icons/home/little.webp')}
        onPressViewAll={() => goTo('HomeDetail', {detailType: 'matka'})}
        titleIconSize={8}
        renderItem={(items, index) => {
          return (
            <View
              key={index}
              style={[theme.flex.row, index > 0 ? theme.margin.tops : null]}>
              {items.map((item, _index) => {
                return (
                  <HomeMatkaCard
                    key={index + '-' + _index}
                    imageHeight={imageHeight}
                    cardWidth={cardWidth}
                    item={item}
                    marginRight={index % 3 == 2 ? false : true}
                    // marginTop={index < 3 ? false : true}
                  />
                );
              })}
            </View>
          );
        }}
      />
    </View>
  );
});

export default HomeMatka;
