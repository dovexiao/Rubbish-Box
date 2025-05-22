import React from 'react';
import {useInnerStyle} from '../proxy.hooks';
import {defaultHeaderImg, whatsappIcon} from '../proxy.variable';
import {View} from 'react-native';
import theme from '@/style';
import i18n from '@/i18n';
import Text from '@/components/basic/text';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import {
  CopyIcon,
  HomeBettingIcon,
  HomeNewUserIcon,
  HomeRechargeIcon,
} from '../svg.variable';
import Clipboard from '@react-native-clipboard/clipboard';
import globalStore from '@/services/global.state';
import LazyImage from '@/components/basic/image';
import HomeUserDataItem from './home-user-data-item';
import {goWhatsAppChat, toPriceStr} from '@/utils';
import ProxyUserInfo from '../basic-components/proxy-user-info';
import {IProxyUserInfo} from '../proxy.type';
import dayjs from 'dayjs';
import {margin} from '@/components/style';

export interface CommissionDetailUserHeaderProps {
  userId: number;
  userInfo?: IProxyUserInfo;
}

const CommissionDetailUserHeader: React.FC<CommissionDetailUserHeaderProps> = ({
  userId,
  userInfo,
}) => {
  const {commissionDetailStyle, userInfoStyle} = useInnerStyle();
  const handleCopy = () => {
    Clipboard.setString(userId + '');
    globalStore.globalSucessTotal(i18n.t('tip.copysuccess'));
  };
  const handleContact = () => {
    goWhatsAppChat(userInfo?.contactPhone);
  };
  return (
    <ProxyUserInfo
      style={[commissionDetailStyle.header]}
      userAvatar={userInfo?.userAvatar || defaultHeaderImg}
      agentLv={userInfo?.agentLevel || 1}
      userName={userInfo?.userPhone || '-'}
      agentLvLocation="avatar"
      totalUser={userInfo?.totalUserCount || 0}
      totalCommission={
        userInfo?.commissionAmount ? +userInfo.commissionAmount : 0
      }
      userHeaderTip={
        <View style={[theme.flex.col]}>
          <View style={[theme.flex.row, theme.flex.centerByCol]}>
            <Text white>{i18n.t('proxy.user.id')}</Text>
            <Text white>{userInfo?.userId}</Text>
            <NativeTouchableOpacity
              onPress={handleCopy}
              style={[theme.margin.leftxxs]}>
              <CopyIcon width={14} height={14} />
            </NativeTouchableOpacity>
          </View>
          <Text white style={[theme.margin.topxxs]}>
            {userInfo?.activeDay || '-'}
          </Text>
        </View>
      }
      userHeaderRightContent={
        <NativeTouchableOpacity
          style={[theme.flex.col, theme.flex.centerByCol]}
          onPress={handleContact}>
          {userInfo?.agentLevel && userInfo.agentLevel === 1 && (
            <>
              <Text white>{i18n.t('proxy.user.up-line')}</Text>
              <LazyImage
                width={theme.iconSize.xxl}
                height={theme.iconSize.xxl}
                imageUrl={whatsappIcon}
                occupancy="#0000"
              />
            </>
          )}
        </NativeTouchableOpacity>
      }
      userHeaderBottomContent={
        <View style={[theme.flex.row]}>
          <Text white>{i18n.t('proxy.user.register-date')}</Text>
          <Text white style={[theme.margin.leftxxs]}>
            {userInfo?.registerDate
              ? dayjs(userInfo.registerDate, 'YYYY-MM-DD').format('DD/MM YYYY')
              : '-'}
          </Text>
        </View>
      }
      userDataTopContent={
        <View>
          <Text
            fontSize={12}
            fontFamily="fontInterBold"
            color={theme.fontColor.white}
            style={[margin.btml]}>
            {i18n.t('proxy.user.new-user-title')}
          </Text>
          <View style={[theme.margin.btml, theme.flex.row, theme.flex.between]}>
            <HomeUserDataItem
              style={[theme.flex.alignStart]}
              icon={
                <HomeNewUserIcon
                  width={theme.iconSize.s}
                  height={theme.iconSize.s}
                />
              }
              title={i18n.t('proxy.user.users')}
              result={(userInfo?.totalUserCount || 0) + ''}
              resultTextProps={{
                fontSize: theme.fontSize.m,
                fontFamily: 'fontInter',
                style: theme.margin.topxxs,
              }}
            />
            <HomeUserDataItem
              style={[theme.flex.alignEnd]}
              icon={
                <HomeNewUserIcon
                  width={theme.iconSize.s}
                  height={theme.iconSize.s}
                />
              }
              title={i18n.t('proxy.user.recharge-user')}
              result={(userInfo?.rechargeUserCount || 0) + ''}
              resultTextProps={{
                fontSize: theme.fontSize.m,
                fontFamily: 'fontInter',
                style: theme.margin.topxxs,
              }}
            />
          </View>
        </View>
      }
      userDataBottomContent={
        <View style={[theme.margin.topl, theme.flex.row, theme.flex.between]}>
          <HomeUserDataItem
            style={[theme.flex.alignStart]}
            icon={
              <HomeRechargeIcon
                width={theme.iconSize.s}
                height={theme.iconSize.s}
              />
            }
            title={i18n.t('proxy.user.recharge')}
            result={
              userInfo?.rechargeAmount
                ? toPriceStr(+userInfo.rechargeAmount)
                : '-'
            }
            resultTextProps={{
              fontSize: theme.fontSize.m,
              fontFamily: 'fontInter',
            }}
          />
          <View style={[userInfoStyle.lineVert]} />
          <HomeUserDataItem
            style={[theme.flex.centerByCol, theme.flex.alignEnd]}
            icon={
              <HomeBettingIcon
                width={theme.iconSize.s}
                height={theme.iconSize.s}
                stroke={theme.fontColor.accent}
              />
            }
            title={i18n.t('proxy.user.betting')}
            result={userInfo?.betAmount ? toPriceStr(+userInfo.betAmount) : '-'}
            resultTextProps={{
              fontSize: theme.fontSize.m,
              fontFamily: 'fontInter',
              style: theme.margin.topxxs,
            }}
          />
        </View>
      }
    />
  );
};

export default CommissionDetailUserHeader;
