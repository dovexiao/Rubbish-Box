import React from 'react';
import theme from '@style';
import i18n from '@i18n';
import {View, Text, StyleSheet, ImageBackground} from 'react-native';
import LazyImage, {ImageUrlType} from '@/components/basic/image';
import {TodayEarningsChartItemRes} from '../types';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import LinearGradient from '@/components/basic/linear-gradient';
import {inviteListParams} from '../types';

export interface EarnMeItem {
  rank?: string;
  exceed?: string;
  commissionAmount?: string;
  headImg?: ImageUrlType;
}
interface EarningChartProps {
  user?: TodayEarningsChartItemRes[];
  me?: EarnMeItem;
  bet?: number;
  invite?: number;
  recharge?: number;
  todayInvite: number;
  inviteList?: inviteListParams[];
  onShare?: () => void;
}
const EarningsChart: React.FC<EarningChartProps> = props => {
  const {inviteList, onShare} = props;
  const userNum = ['First', 'Second', 'Third'];
  const userColor = [
    [theme.basicColor.primary10, theme.basicColor.primary30],
    [theme.basicColor.primary30, theme.basicColor.primary50],
    [theme.basicColor.primary50, theme.basicColor.primary60],
  ];
  const getTotal = () => {
    let val = 0;
    inviteList?.map(item => {
      if (item.inviteAmount) {
        val = val + item.inviteAmount * 1;
      }
    });
    return val;
  };
  const total = getTotal();
  const addInviteUser = (item: any, ind: number) => {
    return (
      <NativeTouchableOpacity
        key={ind}
        style={[styles.userCard, styles.userCardMr]}
        onPress={() => {
          if (item.userAvatar) {
            return;
          } else {
            onShare?.();
          }
        }}>
        <LinearGradient
          colors={userColor[ind]}
          style={[
            styles.userCard,
            styles.cardBoder,
            theme.flex.row,
            theme.fill.fillW,
          ]}>
          <View
            style={[
              theme.fill.fillW,
              theme.flex.flex,
              theme.flex.centerByRow,
              theme.flex.centerByCol,
            ]}>
            <Text
              style={[
                {
                  fontSize: 14,
                  fontWeight: 'bold',
                  color: theme.fontColor.primary,
                  marginBottom: 6,
                  textAlign: 'center',
                },
              ]}>
              {userNum[ind]}
            </Text>
            {/*<Text style={[{}]}> </Text>*/}
            {item?.userAvatar ? (
              <LazyImage
                imageUrl={item.userAvatar}
                width={44}
                height={44}
                radius={22}
                occupancy="transparent"
              />
            ) : (
              <View style={[styles.addStyle]}>
                <Text style={[styles.addPlusStyle]}>
                  <LazyImage
                    imageUrl={require('@/assets/imgs/proxy/plus.png')}
                    width={44}
                    height={44}
                    radius={22}
                    occupancy="transparent"
                  />
                </Text>
              </View>
            )}
            <Text
              style={[
                {
                  textAlign: 'center',
                },
              ]}>
              <Text
                style={[
                  {
                    fontSize: 16,
                    // fontWeight: 'bold',
                    color: theme.fontColor.primary,
                  },
                ]}>
                +{item.inviteAmount || 0}rs
              </Text>
            </Text>
          </View>
        </LinearGradient>
      </NativeTouchableOpacity>
    );
  };
  return (
    <View
      style={[
        theme.margin.l,
        theme.borderRadius.m,
        styles.friendStyle,
        // eslint-disable-next-line react-native/no-inline-styles
        {
          paddingBottom: 8,
        },
      ]}>
      <View
        style={[
          theme.margin.btmm,
          styles.empty,
          theme.fill.fill,
          theme.flex.flex,
          theme.flex.centerByRow,
          theme.flex.centerByCol,
          // eslint-disable-next-line react-native/no-inline-styles
          {
            height: 44,
          },
        ]}>
        <ImageBackground
          style={[
            theme.fill.fill,
            styles.backgroundContainer,
            theme.flex.flex,
            theme.flex.centerByRow,
            theme.flex.centerByCol,
          ]}
          imageStyle={styles.imgStyle}
          source={require('@/assets/imgs/proxy/proxyBtn.webp')}
          resizeMode="cover">
          <Text
            // eslint-disable-next-line react-native/no-inline-styles
            style={{
              fontSize: 15,
              color: '#fff',
              lineHeight: 20,
              fontWeight: 'bold',
            }}>
            {i18n.t('newProxy.home.home-rewards-title')}
          </Text>
          <Text
            // eslint-disable-next-line react-native/no-inline-styles
            style={{
              fontSize: 11,
              color: theme.basicColor.primary30,
              lineHeight: 14,
              fontWeight: 'bold',
            }}>
            {i18n.t('newProxy.home.home-rewards-desc')}
          </Text>
        </ImageBackground>
      </View>
      <View>
        <View>
          <Text style={[styles.userTitle]}>
            {i18n.t('newProxy.home.home-friends-title')}
          </Text>
        </View>
        <View style={[styles.userView]}>
          <View
            style={[
              theme.flex.flex,
              theme.flex.row,
              theme.flex.centerByRow,
              theme.flex.centerByCol,
            ]}>
            {inviteList?.map((item, index) => {
              return addInviteUser(item, index);
            })}
          </View>
          <View>
            <Text style={[styles.userTitle1]}>
              {i18n.t('other.invite3User')} {total}RS
            </Text>
          </View>
          <View>
            <Text style={[styles.userTitle2]}>
              {i18n.t('newProxy.home.home-friends-invite1')}
            </Text>
          </View>
          <NativeTouchableOpacity
            style={[styles.inviteBtnStyle]}
            onPress={() => onShare?.()}>
            <LinearGradient
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              colors={[theme.basicColor.primary15, theme.basicColor.primary50]}
              style={[
                theme.flex.row,
                theme.fill.fillW,
                theme.fill.fillH,
                styles.inviteLinerBtnStyleL,
                theme.flex.centerByRow,
                theme.flex.centerByCol,
              ]}>
              <Text
                style={[
                  styles.btnStyle,
                  theme.flex.flex,
                  theme.flex.row,
                  theme.flex.centerByRow,
                  theme.flex.centerByCol,
                ]}>
                {i18n.t('newProxy.home.invitation-link')}
              </Text>
            </LinearGradient>
          </NativeTouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  addStyle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.basicColor.primary10,
  },
  addPlusStyle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.basicColor.primary10,
    width: 44,
    height: 44,
    textAlign: 'center',
    lineHeight: 40,
  },
  inviteBtnStyle: {
    width: '70%',
    marginLeft: '15%',
    height: 44,
    marginTop: 10,
  },
  inviteLinerBtnStyleL: {
    borderRadius: 24,
  },
  userTitle: {
    fontSize: 15,
    color: '#fff',
    lineHeight: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  btnStyle: {
    fontSize: 18,
    color: '#fff',
    lineHeight: 24,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  userTitle1: {
    fontSize: 12,
    color: 'rgba(255,255,255,.5)',
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 5,
  },
  userTitle2: {
    fontSize: 12,
    color: 'rgba(255,255,255,.5)',
    lineHeight: 20,
    textAlign: 'center',
  },
  userView: {
    backgroundColor: theme.basicColor.primary10,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 10,
    paddingRight: 0,
    marginLeft: 15,
    marginRight: 15,
    borderRadius: 8,
  },
  userCard: {
    width: '28%',
    height: 120,
    borderRadius: 8,
  },
  userCardMr: {
    marginRight: 10,
  },
  cardBoder: {
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  empty: {},
  textStyle: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
  },
  labelStyle: {
    color: 'rgba(255,255,255,.3)',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
  },
  viewStyle: {
    flex: 1,
    marginBottom: 10,
  },
  herderStyle: {
    backgroundColor: theme.basicColor.primary30,
    height: 30,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    lineHeight: 30,
  },
  th1: {
    backgroundColor: theme.basicColor.primary50,
  },
  th2: {
    backgroundColor: theme.basicColor.primary60,
  },
  viewMg: {
    marginLeft: 12,
    marginRight: 12,
  },
  backgroundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imgStyle: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  friendStyle: {
    backgroundColor: theme.basicColor.primary10,
  },
});

export default EarningsChart;
