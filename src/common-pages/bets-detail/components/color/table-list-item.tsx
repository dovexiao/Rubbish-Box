import {downIcon} from '@/common-pages/rebate/rebate.variables';
import LazyImage, {LazyImageBackground} from '@/components/basic/image';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import theme from '@/style';
import {toPriceStr} from '@/utils';
import dayjs from 'dayjs';
import React from 'react';
import {View, LayoutAnimation} from 'react-native';
import FeeDetail from '../fee';
import tableStyle from '../style';
import {BasicObject} from '@/types';
import Text from '@/components/basic/text';
import {COLORS} from '../constant';
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
  const arrowStyle = React.useMemo(() => {
    return {
      transform: [
        {
          rotate: showMore ? '0deg' : '-90deg',
        },
      ],
    };
  }, [showMore]);

  const Ball = React.useMemo(() => {
    if (item.selectValue) {
      let bg = item.selectValue;
      if (item.selectType === 2) {
        const text = bg === 'g' ? 'GREEN' : bg === 'r' ? 'RED' : 'VIOLET';
        return (
          <LazyImageBackground
            occupancy="transparent"
            width={28}
            height={28}
            style={[theme.flex.center]}
            imageUrl={COLORS[bg]}>
            <Text
              fontSize={7}
              color={theme.basicColor.white}
              fontFamily="fontDin"
              fontWeight="bold">
              {text}
            </Text>
          </LazyImageBackground>
        );
      } else {
        if (['1', '3', '7', '9'].includes(item.selectValue)) {
          bg = 'g';
        } else if (['2', '4', '6', '8'].includes(item.selectValue)) {
          bg = 'r';
        } else if (item.selectValue === '0') {
          bg = 'rv';
        } else {
          bg = 'gv';
        }
        return (
          <LazyImageBackground
            occupancy="transparent"
            width={28}
            height={28}
            style={[theme.flex.center]}
            imageUrl={COLORS[bg]}>
            <Text
              fontSize={14}
              color={theme.fontColor.white}
              fontFamily="fontDin"
              fontWeight="bold">
              {item.selectValue}
            </Text>
          </LazyImageBackground>
        );
      }
    }
    return null;
  }, [item]);

  return (
    <View style={[index % 2 === 1 && tableStyle.tdGray]}>
      <View
        style={[
          tableStyle.td,
          index % 2 === 1 && tableStyle.tdGray,
          theme.flex.centerByCol,
        ]}>
        <View style={[theme.flex.flex1]}>{Ball}</View>
        <View style={[tableStyle.tbPayment]}>
          <Text
            size="medium"
            fontFamily="fontInter"
            white
            blod
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
                  item.awardStatus === 1
                    ? 'bets-detail.label.won'
                    : 'bets-detail.label.noWin',
                )}
              </Text>
              <Text
                color={
                  item.awardStatus === 1
                    ? theme.fontColor.winColor
                    : theme.fontColor.white
                }
                size="medium"
                fontFamily="fontInter"
                blod>
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
          delivery={item.deliveryAmount}
          fee={item.feeAmount}
          time={dayjs(item.createTime).format('DD/MM/YYYY hh:mm:ss')}
        />
      )}
    </View>
  );
};

export default TableListItem;
