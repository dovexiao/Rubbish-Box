import {NativeTouchableOpacity} from '@basicComponents/touchable-opacity';
import {IUserInfo} from '@services/global.service';
import {View, Animated, useWindowDimensions, StyleSheet} from 'react-native';
import theme from '@style';
import React from 'react';
import {rightIcon, rightIconSize, smallHeaderSize} from './me.variable';
import LazyImage from '@basicComponents/image';
import Text from '@basicComponents/text';
import globalStore from '@/services/global.state';
import {SafeAny} from '@/types';
import {useTranslation} from 'react-i18next';

interface MeHeaderProps {
  user?: IUserInfo;
  login: boolean;
  userAreaY: number;
  scrollAnim: SafeAny;
  showNoMenu?: boolean;
  onUser: () => void;
}
const {flex, padding, font, margin, background} = theme;
const emptyHeaderImg = require('@components/assets/icons/header.webp');
const defaultHeaderImg = require('@components/assets/icons/default-header.webp');

const MeHeader: React.FC<MeHeaderProps> = ({
  user,
  login,
  scrollAnim,
  onUser,
  userAreaY,
  showNoMenu,
}) => {
  const {i18n} = useTranslation();
  const {height: windowHeight} = useWindowDimensions();
  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            {
              translateY: scrollAnim.interpolate({
                inputRange: [0, userAreaY / 2, userAreaY, windowHeight],
                outputRange: [-windowHeight, -25, 0, 0],
                extrapolate: 'extraplateRight',
              }),
            },
          ],
        },
      ]}>
      <NativeTouchableOpacity activeOpacity={1} onPress={onUser}>
        <View
          style={[
            flex.row,
            padding.l,
            flex.between,
            flex.centerByCol,
            background.white,
          ]}>
          <View style={[flex.row, margin.lrs, flex.centerByCol]}>
            <View
              style={[
                margin.rightl,
                theme.overflow.hidden,
                {borderRadius: smallHeaderSize / 2},
              ]}>
              <LazyImage
                resizeMode="cover"
                occupancy={'transparent'}
                imageUrl={
                  globalStore.token
                    ? user?.userAvatar
                      ? user.userAvatar
                      : defaultHeaderImg
                    : emptyHeaderImg
                }
                width={smallHeaderSize}
                height={smallHeaderSize}
              />
            </View>

            {login ? (
              <Text blod style={[font.second, font.m, margin.rights]}>
                {user?.userName ? user?.userName : user?.userPhone}
              </Text>
            ) : (
              <Text style={[font.accent, font.m, margin.rights]}>
                {i18n.t('me.user.login')}
              </Text>
            )}
          </View>
          {showNoMenu && (
            <LazyImage
              occupancy={'transparent'}
              imageUrl={rightIcon}
              width={rightIconSize}
              height={rightIconSize}
            />
          )}
        </View>
      </NativeTouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    elevation: 10,
    width: '100%',
  },
});

export default MeHeader;
