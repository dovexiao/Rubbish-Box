import theme from '@/style';
import React, {forwardRef, useMemo} from 'react';
import {View, ViewProps} from 'react-native';
import HomeFloorBox from '../floor/home-floor-box';
import globalStore from '@/services/global.state';
import HomeDigitCard from './home-digit-card';
import {DigitListItem} from '../../home.type';
import {getSeperateList, goTo} from '@/utils';
import {useTranslation} from 'react-i18next';

interface HomeDigitProps extends ViewProps {
  digitList: DigitListItem[];
}

const HomeDigits = forwardRef<View, HomeDigitProps>((props, ref) => {
  const {i18n} = useTranslation();
  const {style, digitList, ...otherProp} = props;
  const cardWidth =
    (globalStore.screenWidth - theme.paddingSize.l * 2 - theme.paddingSize.s) /
    2;
  const imageHeight = (cardWidth * 210) / 370;
  const seperateDigitList = useMemo(() => {
    return getSeperateList(digitList, 2);
  }, [digitList]);
  return (
    <View
      ref={ref}
      {...otherProp}
      style={[
        // {
        //   minHeight:
        //     (imageHeight + 31) * 2 +
        //     50 +
        //     theme.paddingSize.l +
        //     theme.paddingSize.s,
        // },
        theme.borderRadius.s,
        style,
      ]}>
      <HomeFloorBox
        title={i18n.t('home.digit.title')}
        type={'digit'}
        list={seperateDigitList}
        itemWidth={cardWidth}
        titleIcon={require('@assets/icons/home/little.webp')}
        titleIconSize={8}
        onPressViewAll={() => goTo('HomeDetail', {detailType: 'digit'})}
        renderItem={(items, index) => {
          return (
            <View
              key={index}
              style={[theme.flex.row, index > 0 ? theme.margin.tops : null]}>
              {items.map((item, _index) => {
                return (
                  <HomeDigitCard
                    key={index + '-' + _index}
                    imageHeight={imageHeight}
                    cardWidth={cardWidth}
                    // marginRight={_index % 3 === 0}
                    marginRight={_index % 2 === 0}
                    // marginTop={index < 3 ? false : true}
                    item={item}
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

export default HomeDigits;
