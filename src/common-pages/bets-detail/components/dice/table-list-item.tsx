import LazyImage, {LazyImageBackground} from '@/components/basic/image';
import theme from '@/style';
import {toPriceStr} from '@/utils';
import React from 'react';
import {LayoutAnimation, View} from 'react-native';
import FeeDetail from '../fee';
import tableStyle from '../style';
import {DICES} from '../constant';
import {BasicObject} from '@/types';
import Text from '@/components/basic/text';
import {downIcon} from '@/common-pages/rebate/rebate.variables';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import dayjs from 'dayjs';
import {useTranslation} from 'react-i18next';

const TableListItem = ({
  item,
  index = 0,
}: {
  item: BasicObject;
  index: number;
}) => {
  const [showMore, setShowMore] = React.useState(false);
  const {i18n} = useTranslation();
  const NumberNode = React.useMemo(() => {
    const toNumber = Number(item.number);
    let numberArr = [];
    switch (item.playType) {
      case 'Single':
        return (
          <LazyImage
            occupancy="transparent"
            width={32}
            height={32}
            imageUrl={DICES[item?.number?.toLowerCase()]}
          />
        );
      case 'Sum':
        if (isNaN(toNumber)) {
          return (
            <LazyImage
              occupancy="transparent"
              width={32}
              height={32}
              imageUrl={DICES[item?.number?.toLowerCase()]}
            />
          );
        } else {
          return (
            <LazyImageBackground
              occupancy="transparent"
              width={32}
              height={32}
              style={[theme.flex.center]}
              imageUrl={DICES.ball}>
              <Text fontSize={17} fontFamily="fontDin" fontWeight="bold">
                {item.number}
              </Text>
            </LazyImageBackground>
          );
        }
      case 'Pair':
        numberArr = item.number.split('');
        return (
          <View style={[theme.flex.row]}>
            {numberArr.map((pie: string, i: number) => (
              <LazyImage
                key={i}
                occupancy="transparent"
                width={16}
                height={16}
                imageUrl={DICES[pie]}
              />
            ))}
          </View>
        );
      case 'Triple':
        if (isNaN(toNumber)) {
          return (
            <View style={[theme.flex.row]}>
              <View style={[theme.flex.centerByCol]}>
                <LazyImage
                  occupancy="transparent"
                  width={16}
                  height={16}
                  imageUrl={DICES[item?.number?.toLowerCase()]}
                />
                <View style={[theme.flex.row]}>
                  {['any', 'any'].map((pie: string, i: number) => (
                    <LazyImage
                      key={i}
                      occupancy="transparent"
                      width={16}
                      height={16}
                      imageUrl={DICES[item?.number?.toLowerCase()]}
                    />
                  ))}
                </View>
              </View>
            </View>
          );
        } else {
          numberArr = item.number.split('');
          return (
            <View style={[theme.flex.row]}>
              <View style={[theme.flex.centerByCol]}>
                <LazyImage
                  occupancy="transparent"
                  width={16}
                  height={16}
                  imageUrl={DICES[numberArr[0]]}
                />
                <View style={[theme.flex.row]}>
                  {numberArr.slice(1).map((pie: string, i: number) => (
                    <LazyImage
                      key={i}
                      occupancy="transparent"
                      width={16}
                      height={16}
                      imageUrl={DICES[pie]}
                    />
                  ))}
                </View>
              </View>
            </View>
          );
        }
    }
  }, [item]);

  const arrowStyle = React.useMemo(() => {
    return {
      transform: [
        {
          rotate: showMore ? '0deg' : '-90deg',
        },
      ],
    };
  }, [showMore]);

  return (
    <View style={[index % 2 === 1 && tableStyle.tdGray]}>
      <View
        style={[
          tableStyle.td,
          index % 2 === 1 && tableStyle.tdGray,
          theme.flex.centerByCol,
        ]}>
        <View style={[tableStyle.diceNumber]}>{NumberNode}</View>
        <View style={[tableStyle.tbGameType]}>
          <Text white style={[theme.font.center]}>
            {item.playType}
          </Text>
        </View>
        <View style={[tableStyle.tbPayment]}>
          <Text
            size="medium"
            fontFamily="fontInter"
            blod
            white
            style={[theme.font.center]}>
            {toPriceStr(item.amount, {
              fixed: 2,
              showCurrency: true,
              thousands: true,
            })}
          </Text>
        </View>
        <View style={[theme.flex.flex1, theme.flex.row, theme.flex.end]}>
          <NativeTouchableOpacity
            onPress={() => {
              LayoutAnimation.configureNext(
                LayoutAnimation.Presets.easeInEaseOut,
              );
              setShowMore(!showMore);
            }}
            style={[theme.flex.row, theme.flex.centerByCol]}>
            <View style={[theme.flex.alignEnd]}>
              <Text white>
                {i18n.t(
                  item.status === 1
                    ? 'bets-detail.label.won'
                    : 'bets-detail.label.noWin',
                )}
              </Text>
              <Text
                color={
                  item.status === 1
                    ? theme.fontColor.winColor
                    : theme.fontColor.white
                }
                size="medium"
                fontFamily="fontDin">
                {toPriceStr(item.awardAmount, {
                  fixed: 2,
                  showCurrency: true,
                  thousands: true,
                })}
              </Text>
            </View>
            <View style={[arrowStyle, theme.margin.leftxxs]}>
              <LazyImage
                imageUrl={downIcon}
                width={14}
                height={14}
                occupancy="transparent"
              />
            </View>
          </NativeTouchableOpacity>
        </View>
      </View>
      {showMore && (
        <FeeDetail
          fee={item.basePrice ? item.amount - item.basePrice : undefined}
          time={dayjs(item.createTime).format('DD/MM/YYYY hh:mm:ss')}
        />
      )}
    </View>
  );
};

export default TableListItem;
