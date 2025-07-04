import {
  defaultHeaderImg,
  emptyHeaderImg,
  // headerSize,
} from '@/pages/me/me.variable';
import theme from '@style';
import {NativeTouchableOpacity} from '@basicComponents/touchable-opacity';
import React from 'react';
import {View} from 'react-native'; //StyleSheet
import LazyImage from '@basicComponents/image';
import Text from '@basicComponents/text';
import {IUserInfo} from '@services/global.service';
// import {vipOptionsMap} from '@businessComponents/vip';
import Level from '@/common-pages/proxy/basic-components/level';
// import i18n from '@i18n';

const {flex, font, margin, fill} = theme;
import globalStore from '@/services/global.state';
import {toAgentApply} from '@/utils';
import {useUserInfo} from '@/store/useUserStore';
import i18n from '@i18n';

interface MeUserProps {
  login?: boolean;
  user?: IUserInfo;
  level?: number;
  onUser?: () => void;
  showNoMenu?: boolean;
}

const MeUser: React.FC<MeUserProps> = ({level}) => {
  const user = useUserInfo();
  // const pressLeft = () => {
  //   goTo('NewProxyMyRatio');
  // };
  const pressRight = () => {
    toAgentApply();
  };

  return (
    <View
      style={[
        flex.row,
        margin.btmm,
        flex.between,
        flex.centerByCol,
        {marginLeft: 12, marginRight: 12},
      ]}>
      <View style={[flex.row, flex.center, flex.between, fill.fillW]}>
        <View style={[flex.row]}>
          <View style={[margin.rightl]}>
            <LazyImage
              occupancy={'transparent'}
              radius={28}
              resizeMode="cover"
              imageUrl={
                globalStore.token
                  ? user?.userAvatar
                    ? user.userAvatar
                    : defaultHeaderImg
                  : emptyHeaderImg
              }
              width={54}
              height={54}
            />
          </View>
          <View style={[flex.col, flex.centerByRow]}>
            <View style={[flex.row]}>
              <Text blod style={[font.white, font.m, margin.rights]}>
                {i18n.t('newProxy.rules.agent-level')}
              </Text>
              <Level level={level || 1} style={[theme.margin.rights]} />
            </View>
            <View style={[flex.row, margin.tops, flex.centerByCol]}>
              {/*<NativeTouchableOpacity*/}
              {/*  style={[flex.row, flex.centerByCol]}*/}
              {/*  onPress={() => pressLeft()}>*/}
              {/*  <Text*/}
              {/*    style={[margin.leftxxs, font.white, flex.centerByCol]}*/}
              {/*    fontSize={theme.fontSize.s}>*/}
              {/*    {i18n.t('newProxy.child.leftText')}*/}
              {/*  </Text>*/}
              {/*  <LazyImage*/}
              {/*    style={[margin.leftxxs, margin.rightxxl, font.purple]}*/}
              {/*    occupancy={'transparent'}*/}
              {/*    imageUrl={require('@assets/imgs/proxy/right-white.webp')}*/}
              {/*    width={16}*/}
              {/*    height={16}*/}
              {/*  />*/}
              {/*</NativeTouchableOpacity>*/}

              <NativeTouchableOpacity
                style={[flex.row, flex.centerByCol]}
                onPress={() => pressRight()}>
                <Text
                  style={[margin.leftxxs, font.white]}
                  fontSize={theme.fontSize.s}>
                  {i18n.t('newProxy.child.rightText')}
                </Text>
                <LazyImage
                  occupancy={'transparent'}
                  imageUrl={require('@assets/imgs/proxy/right-white.webp')}
                  width={16}
                  height={16}
                />
              </NativeTouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default MeUser;
