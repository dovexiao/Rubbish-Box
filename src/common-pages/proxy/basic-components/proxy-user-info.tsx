import {ImageUrlType, LazyImageBackground} from '@/components/basic/image';
import React, {ReactNode} from 'react';
import {StyleProp, View, ViewStyle, Image} from 'react-native';
import theme from '@style';
import Level from './level';
import Text from '@/components/basic/text';
import {useInnerStyle} from '../proxy.hooks';
import {rightIcon} from '../proxy.variable';
import i18n from '@/i18n';
import {toPriceStr} from '@/utils';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import {HomeWhiteRightIcon} from '../svg.variable';
import Tier from './tier';

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
  agentLvLocation = 'info',
  agentLv,
  userAvatar,
  userName,
  userHeaderTip,
  userHeaderRightContent,
  userHeaderBottomContent,
  userDataTopContent,
  userDataBottomContent,
  totalUser,
  totalCommission,
  onRebate,
  onTeamReport,
}) => {
  const {userInfoStyle} = useInnerStyle();
  return (
    <View style={[theme.flex.col, theme.padding.l, style]}>
      <View
        style={[
          theme.fill.fillW,
          theme.flex.flex,
          theme.flex.row,
          theme.flex.between,
          theme.flex.centerByCol,
          theme.margin.topxxs,
          theme.margin.btms,
        ]}>
        <View style={[theme.flex.row, theme.flex.centerByCol]}>
          <View
            style={[
              theme.flex.col,
              theme.flex.centerByCol,
              theme.margin.rights,
            ]}>
            <LazyImageBackground
              width={theme.imageSize.s}
              height={theme.imageSize.s}
              imageUrl={userAvatar}
              radius={theme.imageSize.s / 2}
            />
            {agentLvLocation === 'avatar' && (
              <View style={[userInfoStyle.tier]}>
                <Tier level={agentLv} />
              </View>
            )}
          </View>

          <View style={[theme.flex.col]}>
            <View style={[theme.flex.row, theme.margin.btmxxs]}>
              {agentLvLocation === 'info' && (
                <Level level={agentLv} style={[theme.margin.rights]} />
              )}
              <Text fontSize={theme.fontSize.m} blod white>
                {userName}
              </Text>
            </View>
            <View style={[theme.flex.col]}>{userHeaderTip}</View>
          </View>
        </View>
        <View style={[theme.flex.col]}>{userHeaderRightContent}</View>
      </View>
      <View style={[theme.margin.btms, theme.flex.col]}>
        {userHeaderBottomContent}
      </View>
      <View style={[userInfoStyle.line]} />
      <NativeTouchableOpacity
        style={[
          theme.margin.tbl,
          theme.flex.row,
          theme.flex.between,
          theme.flex.centerByCol,
        ]}
        activeOpacity={onTeamReport ? 0.8 : 1}
        onPress={onTeamReport}>
        <View style={[theme.flex.col]}>
          <View
            style={[
              userInfoStyle.totalItem,
              theme.flex.row,
              theme.flex.centerByCol,
            ]}>
            <Text white>{i18n.t('proxy.user.total-user')}</Text>
            <Text white blod style={[theme.margin.leftxxs]}>
              {totalUser != null ? totalUser : '-'}
            </Text>
          </View>
          <View
            style={[
              userInfoStyle.totalItem,
              theme.flex.row,
              theme.margin.topxxs,
              theme.flex.centerByCol,
            ]}>
            <Text white>{i18n.t('proxy.user.total-commission')}</Text>
            <Text white blod style={[theme.margin.leftxxs]}>
              {totalCommission != null
                ? toPriceStr(totalCommission, {suffixUnit: 'K'})
                : '-'}
            </Text>
            {onRebate && (
              <NativeTouchableOpacity
                style={[
                  userInfoStyle.rebate,
                  theme.flex.row,
                  theme.flex.centerByCol,
                  theme.padding.lrs,
                  theme.padding.tbxxs,
                  theme.margin.lefts,
                  theme.background.primary,
                ]}
                onPress={onRebate}>
                <Text
                  color={theme.basicColor.white}
                  fontSize={theme.fontSize.xs}
                  blod>
                  {i18n.t('proxy.home.rebate')}
                </Text>
                <HomeWhiteRightIcon width={10} height={10} />
              </NativeTouchableOpacity>
            )}
          </View>
        </View>
        {onTeamReport && (
          <Image
            source={rightIcon}
            style={{
              width: theme.paddingSize.xl,
              height: theme.paddingSize.xl,
              marginLeft: theme.paddingSize.s,
            }}
          />
        )}
      </NativeTouchableOpacity>
      <View
        style={[
          theme.flex.col,
          userInfoStyle.greyArea,
          theme.padding.tbs,
          theme.padding.lrl,
          theme.background.background1,
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
