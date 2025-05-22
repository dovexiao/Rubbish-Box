import React from 'react';
import theme from '@style';
import i18n from '@i18n';
import style from './style';
import {View, Image} from 'react-native';
import Text from '@basicComponents/text';
import {vip1Image, vip2Image, vip3Image, vip4Image} from '../proxy.variable';
interface IProps {
  userAvatar: any;
  userPhone: string;
  agentID: number;
  agentLv: number;
}
const ProxyHeader = (props: IProps) => {
  const {userAvatar, userPhone, agentID, agentLv} = props;
  const agentLvMaps = new Map([
    [1, vip1Image],
    [2, vip2Image],
    [3, vip3Image],
    [4, vip4Image],
  ]);
  return (
    <View
      style={[
        theme.fill.fillW,
        theme.flex.flex,
        theme.flex.row,
        theme.margin.topxxs,
        theme.background.white,
        style.headerHeight,
        {padding: theme.paddingSize.l},
      ]}>
      <Image
        source={userAvatar}
        style={[
          {width: theme.paddingSize.l * 4, height: theme.paddingSize.l * 4},
          theme.margin.rightl,
        ]}
      />
      <View>
        <View style={[theme.flex.flex, theme.flex.row, theme.margin.btmxxs]}>
          <Text
            fontSize={theme.fontSize.l}
            blod
            style={[theme.font.main, theme.margin.rights]}>
            {userPhone}
          </Text>
          <Image source={agentLvMaps.get(agentLv)} style={[style.vipWrap]} />
        </View>
        <Text fontSize={theme.fontSize.s} style={[theme.font.accent]}>
          {i18n.t('proxy.home.agent-id') + agentID}
        </Text>
      </View>
    </View>
  );
};

export default ProxyHeader;
