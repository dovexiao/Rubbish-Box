import {ImageUrlType} from '@/components/basic/image';
import React, {ReactNode} from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';
import theme from '@style';
import {useInnerStyle} from '../proxy.hooks';

type AgentLvLocation = 'info' | 'avatar';

/**
 * 代理用户信息大卡片组件
 */
interface ProxyUserInfoProps {
  // 外围样式
  style?: StyleProp<ViewStyle>;
  userAvatar?: ImageUrlType;
  userName: string;
  // 代理等级放置位置，默认头像右侧，'info' 头像右侧 'avatar' 头像中间
  agentLvLocation?: AgentLvLocation;
  agentLv: number;
  totalUser?: number;
  totalCommission?: number;
  // 如果有该事件，显示rebate
  onRebate?: () => void;
  // 如果有该时间，对应模块会跳转Team Report
  onTeamReport?: () => void;
  // 头像右侧信息底下内容
  userHeaderTip?: ReactNode;
  // 头部右侧内容
  userHeaderRightContent?: ReactNode;
  // 头像下面内容
  userHeaderBottomContent?: ReactNode;
  // 用户内部数据上部分内容
  userDataTopContent?: ReactNode;
  // 用户内部数据下部分内容
  userDataBottomContent?: ReactNode;
}

const ProxyUserInfo: React.FC<ProxyUserInfoProps> = ({
  style,
  userDataTopContent,
  userDataBottomContent,
}) => {
  const {userInfoStyle} = useInnerStyle();
  return (
    <View
      style={[
        theme.flex.col,
        theme.padding.l,
        theme.background.mediumblue,
        style,
      ]}>
      <View
        style={[
          theme.flex.col,
          userInfoStyle.greyArea,
          theme.padding.tbs,
          theme.padding.lrl,
          theme.background.transparent,
        ]}>
        <View style={[theme.flex.col, userInfoStyle.bottomLine]}>
          {userDataTopContent}
        </View>
        <View style={[theme.flex.col]}>{userDataBottomContent}</View>
      </View>
    </View>
  );
};

export default ProxyUserInfo;
