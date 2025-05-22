import React from 'react';
import {LiveGameListItem} from '../../home.type';
import Text from '@basicComponents/text';
import {Image, View} from 'react-native';
import theme from '@/style';
import LazyImage from '@basicComponents/image';
import TouchableOpacity from '@basicComponents/touchable-opacity';
import {homeScratchCardStyle} from '../../home.style';
import {toGame} from '@/common-pages/game-navigate';

const HomeLiveCasinoCard = ({
  item,
  marginRight,
  cardWidth,
  imageHeight,
}: {
  item: LiveGameListItem;
  marginRight?: boolean;
  cardWidth: number;
  imageHeight: number;
}) => {
  return (
    <TouchableOpacity
      onPress={() => toGame(item)}
      style={[
        {
          width: cardWidth,
        },
        marginRight ? theme.margin.rights : null,
        theme.flex.col,
        theme.borderRadius.s,
        theme.overflow.hidden,
        theme.background.white,
      ]}>
      <LazyImage height={imageHeight} width="100%" imageUrl={item.gamePic} />
      <View
        style={[
          theme.padding.lrs,
          theme.fill.fillW,
          theme.flex.row,
          theme.flex.centerByCol,
          theme.flex.between,
          homeScratchCardStyle.content,
        ]}>
        <View style={[theme.flex.col]}>
          <Text second blod>
            {item.name}
          </Text>
          <Text secAccent fontSize={10} style={[theme.margin.topxxs]}>
            {item.provider}
          </Text>
        </View>
        <View style={[theme.flex.col, theme.flex.center]}>
          <Image
            source={require('@assets/icons/home/user.webp')}
            style={[theme.icon.xs]}
          />
          <Text fontSize={10} second>
            {item.playersNumber}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default HomeLiveCasinoCard;
