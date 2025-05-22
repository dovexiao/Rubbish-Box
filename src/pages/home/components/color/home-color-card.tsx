import React from 'react';
// import Text from '@basicComponents/text';
import theme from '@style';
import {LazyImageBackground} from '@basicComponents/image';
import {NativeTouchableOpacity} from '@basicComponents/touchable-opacity';
import {ColorListItem} from '../../home.type';
import {goTo} from '@/utils';
// import {Shadow} from 'react-native-shadow-2';
import globalStore from '@/services/global.state';
import {BasicObject} from '@/types';
// import {useTranslation} from 'react-i18next';

const HomeColorCard = ({
  item,
  marginRight,
  marginTop,
  cardWidth,
  imageHeight,
}: {
  item: ColorListItem;
  index: number;
  marginRight?: boolean;
  marginTop?: boolean;
  cardWidth: number;
  imageHeight: number;
}) => {
  // const {i18n} = useTranslation();
  const shadow = {
    startColor: '#0000001a',
    distance: 4,
    offset: [0, 2],
    style: [
      theme.flex.col,
      theme.flex.alignStart,
      theme.padding.lrl,
      theme.flex.center,
      theme.borderRadius.s,
      {
        borderTopWidth: 1,
        borderTopColor: '#ffffff33',
        backgroundColor: '#ffffff1a',
        height: (cardWidth * 27) / 172,
        width: '100%',
      },
    ] as BasicObject[],
  } as BasicObject;
  if (globalStore.isWeb) {
    shadow.distance = 0;
    delete shadow.offset;
    shadow.style.push({
      boxShadow: '0 2px 8px 4px #0000001a',
    });
  }
  return (
    <NativeTouchableOpacity
      style={[
        {
          width: cardWidth,
        },
        marginRight ? theme.margin.rights : null,
        marginTop ? theme.margin.tops : null,
        theme.flex.col,
        theme.borderRadius.s,
        theme.overflow.hidden,
      ]}
      onPress={() => {
        goTo('GameWebView', {
          type: 'color',
          params: `configId=${item.id}`,
        });
      }}>
      <LazyImageBackground
        height={imageHeight}
        width={cardWidth}
        imageUrl={item.iconUrl}
        style={[
          theme.flex.col,
          theme.flex.end,
          theme.padding.tbl,
          theme.padding.lrm,
        ]}>
        {/* <Shadow {...shadow}>
          <Text fontSize={theme.fontSize.s} blod style={[theme.font.white]}>
            {i18n.t('home.color.play')}
          </Text>
        </Shadow> */}
      </LazyImageBackground>
    </NativeTouchableOpacity>
  );
};

export default HomeColorCard;
