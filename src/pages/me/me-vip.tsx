import {NativeTouchableOpacity} from '@basicComponents/touchable-opacity';
import React from 'react';
import {View, Image, ImageSourcePropType} from 'react-native';
import Text from '@basicComponents/text';
import i18n from '@i18n';
import {toPriceStr} from '@utils';
import globalStore from '@/services/global.state';

import theme from '@style';
import {vipBgColors, vipOptionsMap} from '@businessComponents/vip';
import LinearGradient from '@/components/basic/linear-gradient';
import useVipStore from '@/store/useVipStore';
const {flex, padding, fontColor, fontSize} = theme; //font
interface MeVipProps {
  level: number;
  login?: boolean;
  nextLevelValue: number;
  renderProgress: any;
  onPress: () => void;
}

const MeVip: React.FC<MeVipProps> = ({
  level,
  // login,
  nextLevelValue,
  onPress,
  renderProgress,
}) => {
  const {nextValue, diff} = useVipStore(state => state.vipInfo);

  return (
    <NativeTouchableOpacity onPress={onPress}>
      <LinearGradient
        colors={vipBgColors[level]}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
        style={[
          flex.flex,
          flex.row,
          padding.lrxxs,
          flex.centerByCol,
          flex.between,
          theme.borderRadius.s,
          theme.border.white30,
          // eslint-disable-next-line react-native/no-inline-styles
          {height: 60},
        ]}>
        <Image
          source={vipOptionsMap[level].small as ImageSourcePropType}
          style={[
            {
              height: (globalStore.screenWidth * 58) / 375,
              width: (globalStore.screenWidth * 58) / 375,
            },
          ]}
        />

        {/* {login ? ( */}
        <View
          style={[
            flex.flex1,
            padding.lrxxs,
            flex.around,
            flex.centerByRow,
            // eslint-disable-next-line react-native/no-inline-styles
            {height: 50},
          ]}>
          <View style={[flex.row, flex.centerByCol, flex.flex1]}>
            <Text
              numberOfLines={1}
              color={fontColor.white60}
              fontSize={fontSize.s}>
              {i18n.t('me.vip.recharge')}{' '}
              <Text color={fontColor.white} blod>
                {toPriceStr(nextLevelValue, {fixed: 0})}
              </Text>{' '}
              {i18n.t('me.vip.move')}{' '}
              <Text color={fontColor.white} blod>
                VIP{level + 1}
              </Text>
            </Text>
          </View>
          <View style={[theme.flex.row, flex.centerByCol, flex.flex1]}>
            {renderProgress}
          </View>
          <View style={[theme.flex.row, flex.centerByCol, flex.flex1]}>
            <Text color={fontColor.white60} fontSize={fontSize.s}>
              Level Progression{' '}
              <Text color={fontColor.white} blod>
                {((nextValue - diff) / nextValue) * 100}%
              </Text>
            </Text>
          </View>
        </View>
        <Image
          source={require('@assets/icons/right-white.webp')}
          style={[theme.icon.l]}
        />
      </LinearGradient>
    </NativeTouchableOpacity>
  );
};

export default MeVip;
