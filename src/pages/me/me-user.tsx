import {
  defaultHeaderImg,
  emptyHeaderImg,
  headerSize,
  rightIcon,
  rightIconSize,
  toLogin,
} from './me.variable';
import theme from '@style';
import {NativeTouchableOpacity} from '@basicComponents/touchable-opacity';
import React from 'react';
import {View} from 'react-native'; //StyleSheet
import LazyImage from '@basicComponents/image';
import Text from '@basicComponents/text';
import {IUserInfo} from '@services/global.service';
import {vipOptionsMap} from '@businessComponents/vip';
import i18n from '@i18n';

const {flex, padding, font, margin, fill} = theme;
import Button from '@basicComponents/button';
import globalStore from '@/services/global.state';
import {goTo} from '@/utils';
import {useUserInfo} from '@/store/useUserStore'; //useToken
import useVipStore from '@/store/useVipStore';

interface MeUserProps {
  login?: boolean;
  user?: IUserInfo;
  level?: number;
  onUser?: () => void;
  showNoMenu?: boolean;
}

const MeUser: React.FC<MeUserProps> = ({onUser, showNoMenu, login}) => {
  // const {isLogin: login} = useToken();
  const user = useUserInfo();
  const {level} = useVipStore(state => state.vipInfo);
  return (
    <NativeTouchableOpacity
      onPress={() => (login ? goTo('Profile') : onUser && onUser())}>
      <View style={[flex.row, margin.btmm, flex.between, flex.centerByCol]}>
        <View style={[flex.row, flex.center, flex.between, fill.fillW]}>
          {/* fill.fillW */}
          <View style={[flex.row]}>
            <View style={[margin.rightl]}>
              <LazyImage
                occupancy={'transparent'}
                radius={50}
                resizeMode="cover"
                imageUrl={
                  globalStore.token
                    ? user?.userAvatar
                      ? user.userAvatar
                      : defaultHeaderImg
                    : emptyHeaderImg
                }
                width={(globalStore.screenWidth * headerSize) / 375}
                height={(globalStore.screenWidth * headerSize) / 375}
                // width={60}
                // height={60}
              />
            </View>
            {login ? (
              <View style={[flex.col, flex.centerByRow]}>
                <View style={[flex.row]}>
                  <Text blod style={[font.white, font.m, margin.rights]}>
                    {user?.userName ? user?.userName : user?.userPhone}
                  </Text>
                  <LazyImage
                    occupancy="#0000"
                    imageUrl={vipOptionsMap[level].sign}
                    width={(globalStore.screenWidth * 45) / 375}
                    height={(globalStore.screenWidth * 20) / 375}
                  />
                </View>
                <View style={[flex.row, margin.tops, flex.centerByCol]}>
                  <LazyImage
                    occupancy={'transparent'}
                    imageUrl={require('@assets/icons/me/mobile.webp')}
                    width={16}
                    height={16}
                  />
                  <Text
                    style={[margin.leftxxs, margin.rightxxl, font.primaryMain]}
                    fontSize={theme.fontSize.s}>
                    {user?.userPhone}
                  </Text>
                  <LazyImage
                    occupancy={'transparent'}
                    imageUrl={require('@assets/icons/me/userId.webp')}
                    width={16}
                    height={16}
                  />
                  <Text
                    style={[margin.leftxxs, font.primaryMain]}
                    fontSize={theme.fontSize.s}>
                    {+(user?.userId || 0)}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={[flex.col, flex.centerByRow, flex.alignStart]}>
                <Text style={[font.s, font.white, padding.btmxxs]}>
                  {i18n.t('me.user.moreExciting')}
                </Text>
                {/* TODO 这里会引起报错,button不能是另一个botton的子元素 */}
                <Button
                  title={i18n.t('me.user.loginUpper')}
                  type="linear-primary"
                  titleBold
                  size="small"
                  onPress={toLogin}
                />
              </View>

              // <View style={[flex.flex, flex.row, {flex: 1}]}>
              //   <View
              //     style={[
              //       flex.col,
              //       flex.centerByRow,
              //       flex.alignStart,
              //       // styles.textStyle,
              //     ]}>
              //     <Text style={[font.l1, font.white]}>
              //       {i18n.t('me.user.moreExciting')}
              //     </Text>
              //   </View>
              //   <View style={[flex.col, flex.centerByRow, flex.alignStart]}>
              //     <Button
              //       title={i18n.t('me.user.loginUpper')}
              //       type="linear-primary"
              //       titleBold
              //       size="small"
              //       onPress={toLogin}
              //     />
              //   </View>
              // </View>
            )}
          </View>
          {/* {login ? ( */}
          <LazyImage
            occupancy={'transparent'}
            imageUrl={rightIcon}
            width={(rightIconSize / 3) * 4}
            height={rightIconSize * 1.5}
          />
          {/* ) : null} */}
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
  );
};
// const styles = StyleSheet.create({
//   textStyle: {
//     flex: 1,
//     paddingRight: 50,
//   },
// });

export default MeUser;
