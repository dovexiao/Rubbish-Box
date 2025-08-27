import {NativeTouchableOpacity} from '@basicComponents/touchable-opacity';
import React from 'react';
import {View, Image, ImageSourcePropType} from 'react-native';
import Text from '@basicComponents/text';
import i18n from '@i18n';
import {toPriceStr} from '@utils';
import globalStore from '@/services/global.state';
// import Button from '@basicComponents/button';
// import LinearGradient from '@/components/basic/linear-gradient';
import {whiteRightIcon} from './me.variable';
import theme from '@style';
import {vipOptionsMap} from '@businessComponents/vip';
const {flex, padding, fontSize} = theme;
interface MeVipProps {
  level: number;
  nextLevelValue: number;
  renderProgress: any;
  onPress: () => void;
  currentPercent: number;
}

const MeVip: React.FC<MeVipProps> = ({
  level,
  nextLevelValue,
  onPress,
  renderProgress,
  currentPercent,
}) => {
  return (
    <View
      style={[
        flex.flex,
        flex.row,
        padding.lrl,
        flex.centerByCol,
        flex.between,
        {
          height: 65,
          borderRadius: 49,
          backgroundColor: theme.basicColor.newBgInOne,
        },
      ]}>
      <Image
        source={vipOptionsMap[level].small as ImageSourcePropType}
        style={[
          {
            height: (globalStore.screenWidth * 34) / 375,
            width: (globalStore.screenWidth * 40) / 375,
          },
        ]}
      />

      <View style={[flex.flex1, padding.lrl, flex.centerByRow, {height: 49}]}>
        <View style={[{marginBottom: globalStore.isAndroid ? 0 : 4}]}>
          <Text
            fontSize={10}
            fontFamily={'fontDinBold'}
            style={[{color: theme.basicColor.newFontF}]}>
            Level progression {(currentPercent * 100).toFixed(0)} %
          </Text>
        </View>
        <View style={[theme.flex.row]}>{renderProgress}</View>
        <View style={[flex.row, {marginTop: globalStore.isAndroid ? 0 : 4}]}>
          <Text
            color={theme.basicColor.newFontYellow}
            numberOfLines={2}
            fontSize={fontSize.xs}>
            {i18n.t('me.vip.recharge')}{' '}
            <Text color={theme.basicColor.newFontYellow}>
              {toPriceStr(nextLevelValue, {fixed: 0})}
            </Text>{' '}
            {i18n.t('me.vip.move')} VIP{level + 1}
          </Text>
        </View>
      </View>
      <NativeTouchableOpacity
        onPress={onPress}
        style={[{position: 'relative'}]}>
        <Image
          source={whiteRightIcon}
          style={[
            {
              height: (globalStore.screenWidth * 12) / 375,
              width: (globalStore.screenWidth * 16) / 375,
              // height: 12,
              // width: 12,
            },
          ]}
        />
      </NativeTouchableOpacity>
      {/* <Button
      size="xsmall"
      titleBold
      title={i18n.t('me.vip.deposit')}
      onPress={onPress}
    /> */}
    </View>
  );
};

export default MeVip;
