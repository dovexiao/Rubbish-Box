import React from 'react';
import {MatkaListItem} from '../../home.type';
import Text from '@basicComponents/text';
import {View, StyleSheet} from 'react-native';
import theme from '@/style';
import LazyImage, {LazyImageBackground} from '@basicComponents/image';
import {NativeTouchableOpacity} from '@basicComponents/touchable-opacity';
import {goTo} from '@/utils';
import globalStore from '@/services/global.state';
import {useTranslation} from 'react-i18next';

function getResultNum(
  openResultNum?: string | null,
  closeResultNum?: string | null,
) {
  let openNum, closeNum;
  if (openResultNum) {
    openNum = openResultNum.split('').reduce((s, y) => (s + +y) % 10, 0);
  } else {
    openNum = '*';
  }
  if (closeResultNum) {
    closeNum = closeResultNum.split('').reduce((s, y) => (s + +y) % 10, 0);
  } else {
    closeNum = '*';
  }
  return {openNum, closeNum};
}

const HomeMatkaCard = ({
  item,
  marginRight,
  cardWidth,
}: // imageHeight,
{
  item: MatkaListItem;
  marginRight?: boolean;
  cardWidth: number;
  imageHeight: number;
}) => {
  const {i18n} = useTranslation();
  const {openNum, closeNum} = getResultNum(
    item.openResultNum,
    item.closeResultNum,
  );

  const handlePress = () => {
    if (item.isClose === 2) {
      globalStore.globalTotal.next({
        type: 'warning',
        message: i18n.t('home.tip.closed', {
          name: item.lotteryName,
        }),
      });
      return;
    }
    goTo('GameWebView', {
      type: 'matka',
      params: `data=${JSON.stringify(item)}`,
    });
  };
  return (
    <NativeTouchableOpacity
      style={[
        {
          width: cardWidth,
          height: cardWidth,
        },
        marginRight ? theme.margin.rights : null,
        theme.flex.col,
        theme.position.rel,
        theme.borderRadius.s,
        theme.overflow.hidden,
      ]}
      onPress={handlePress}>
      <LazyImageBackground
        height={cardWidth}
        width={cardWidth}
        imageUrl={item.backImg}
        style={[
          theme.flex.col,
          theme.flex.end,
          // theme.padding.lrs,
          // theme.padding.tbl,
        ]}>
        <View style={[theme.flex.center]}>
          <View
            style={[
              theme.padding.tbxs,
              theme.padding.lrl,
              theme.margin.btmxxs,
              styles.matkaArea,
            ]}>
            <Text
              fontSize={theme.fontSize.xs}
              blod
              fontWeight="900"
              style={[theme.font.white]}>
              {item.openResultNum || '***'}-{openNum}
              {closeNum}-{item.closeResultNum || '***'}
            </Text>
          </View>
        </View>
        <View
          style={[
            theme.fill.fillW,
            theme.flex.row,
            theme.flex.centerByCol,
            theme.flex.between,
          ]}>
          <View
            style={[theme.flex.col, theme.flex.alignStart, theme.margin.lefts]}>
            <View style={[theme.flex.row, theme.flex.centerByCol]}>
              {/*<Image*/}
              {/*  source={require('@assets/icons/home/matka-open.webp')}*/}
              {/*  style={[theme.icon.xxs]}*/}
              {/*/>*/}
              <Text fontSize={theme.fontSize.xs} white>
                {i18n.t('home.matka.open')}
              </Text>
            </View>
            <Text fontSize={theme.fontSize.xs} white>
              {item.openDraw}
            </Text>
          </View>
          <View
            style={[theme.flex.col, theme.flex.alignEnd, theme.margin.rights]}>
            <View style={[theme.flex.row, theme.flex.centerByCol]}>
              {/*<Image*/}
              {/*  source={require('@assets/icons/home/matka-close.webp')}*/}
              {/*  style={[theme.icon.xxs]}*/}
              {/*/>*/}
              <Text fontSize={theme.fontSize.xs} white>
                {i18n.t('home.matka.close')}
              </Text>
            </View>
            <Text fontSize={theme.fontSize.xs} white>
              {item.closeDraw}
            </Text>
          </View>
        </View>
      </LazyImageBackground>
      {item.isClose === 2 && (
        <View
          style={[
            theme.background.background50,
            theme.fill.fill,
            theme.position.abs,
            theme.flex.center,
            // eslint-disable-next-line react-native/no-inline-styles
            {
              // opacity: 0.5,
              left: 0,
              bottom: 0,
            },
          ]}>
          <View style={[styles.closed]}>
            <LazyImage
              imageUrl={require('@assets/icons/home/closed.webp')}
              width={theme.imageSize.m}
              height={theme.imageSize.m}
              occupancy="#0000"
            />
          </View>
        </View>
      )}
    </NativeTouchableOpacity>
  );
};

const styles = StyleSheet.create({
  matkaArea: {
    borderRadius: 32,
    // borderWidth: 1,
    // borderColor: 'rgba(255, 255, 255, 0.20)',
    // backgroundColor: 'rgba(0, 0, 0, 0.30)',
  },
  closed: {
    zIndex: 5,
    position: 'absolute',
    right: 2,
    top: 8,
  },
});

export default HomeMatkaCard;
