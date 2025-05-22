/* eslint-disable react-native/no-inline-styles */
import {
  background,
  basicColor,
  borderRadius,
  flex,
  fontColor,
  fontSize,
  margin,
  padding,
} from '@/components/style';
import React, {useState, forwardRef, useImperativeHandle, useRef} from 'react';
import {View} from 'react-native';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import LazyImage from '@/components/basic/image';
const defaultHeaderImg = require('@components/assets/icons/default-header.webp');
import LinearGradient from '@basicComponents/linear-gradient';
import {getUserInfo, getUser7DayGameList} from '../proxy.service';
import Text from '@basicComponents/text';
import Tier from '../basic-components/tier';
import Drawer, {DrawerRef} from '@/components/basic/drawer/drawer';

import {
  CloseIcon,
  NewUserIcon,
  BettingUsersIcon,
  HomeRechargeIcon,
  HomeBettingIcon,
  // WonLostIcon,
} from '../svg.variable';
import {whatsapp, rightIcon, proxyColor, chevronUp} from '../proxy.variable';
import Spin from '@/components/basic/spin';
interface listObj {
  betAmount: string;
  icon: string;
  name: string;
  wonLost: string;
  wonLostAmount?: string;
  gameList: listObj[];
  status?: boolean;
}
const boxRadius = {
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
};
import {IProxyUserInfo} from '../proxy.type';
import {SafeAny} from '@/types';
import {ScrollView} from 'react-native-gesture-handler';
import {goWhatsAppChat, toPriceStr} from '@/utils';
import dayjs from 'dayjs';
import theme from '@/style';
import {useTranslation} from 'react-i18next';
import ErrorInvitePage from '../basic-components/error-user-page';

const ModalContent = forwardRef((props, ref: any) => {
  const [userInfo, setUserInfo] = useState<IProxyUserInfo>();
  const [gameList, setGameList] = useState<listObj[]>();
  const [loading, setLoading] = useState(false);
  const drawerRef = useRef<DrawerRef>(null);
  const i18n = useTranslation();
  const handleGetData = (userId: number) => {
    setLoading(true);
    getUserInfo(userId)
      .then(info => setUserInfo(info))
      .finally(() => setLoading(false));
    getUser7DayGameList({userId: userId})
      .then((info: SafeAny) => {
        info.map((item: listObj) => {
          item.gameList.map((game: listObj) => {
            game.status = false;
          });
        });
        setGameList(info);
      })
      .finally(() => setLoading(false));
  };
  const handleContact = () => {
    goWhatsAppChat(userInfo?.contactPhone);
  };

  useImperativeHandle(ref, () => ({
    showModal: (id: number) => {
      drawerRef.current?.open();
      handleGetData(id);
    },
  }));
  return (
    <Drawer ref={drawerRef} mode="bottom" contentBackgroundColor="#0000">
      <ScrollView
        stickyHeaderIndices={[0]}
        style={[background.white, boxRadius, {width: '100%', maxHeight: 700}]}>
        <View
          style={[
            {padding: 20, paddingBottom: 0, height: 44},
            margin.btml,
            flex.row,
            boxRadius,
            background.white,
            flex.between,
            flex.flex,
          ]}>
          <Text
            style={[{position: 'absolute'}]}
            color={'#000'}
            blod
            fontFamily={'fontInter'}
            fontSize={fontSize.m}>
            {i18n.t('proxy.team-report.user-view')}
          </Text>
          <NativeTouchableOpacity
            style={[{position: 'absolute', right: 14}]}
            onPress={() => {
              drawerRef.current?.close();
            }}>
            <CloseIcon width={24} height={24} />
          </NativeTouchableOpacity>
        </View>
        <View style={[theme.padding.btmxxl]}>
          <View style={[padding.l, {backgroundColor: '#F3F5F8'}]}>
            <View
              style={[flex.between, flex.row, margin.lrl, flex.centerByCol]}>
              <View>
                <View style={[flex.row, flex.between, flex.centerByCol]}>
                  <View>
                    <LazyImage
                      imageUrl={defaultHeaderImg}
                      occupancy="#0000"
                      width={48}
                      height={48}
                    />
                    <View
                      style={[
                        {
                          width: 48,
                          height: 20,
                          borderRadius: 20,
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderColor: 'rgba(255, 255, 255, 0.40)',
                          borderWidth: 1,
                          overflow: 'hidden',
                          marginTop: -8,
                        },
                      ]}>
                      <Tier
                        level={userInfo?.agentLevel ? userInfo?.agentLevel : 1}
                      />
                    </View>
                  </View>
                  <View style={[margin.lefts]}>
                    <Text color={fontColor.main} blod fontSize={fontSize.m}>
                      {userInfo?.userPhone}
                    </Text>
                  </View>
                </View>
              </View>
              <NativeTouchableOpacity
                style={[{alignItems: 'flex-end'}]}
                onPress={handleContact}>
                {userInfo?.agentLevel && userInfo?.agentLevel === 1 ? (
                  <View>
                    <Text
                      color={fontColor.main}
                      fontSize={fontSize.s}
                      style={[margin.btmxxs]}>
                      {i18n.t('proxy.team-report.up-line')}
                    </Text>
                    <LazyImage
                      imageUrl={whatsapp}
                      occupancy="#0000"
                      width={32}
                      height={32}
                    />
                  </View>
                ) : null}
              </NativeTouchableOpacity>
            </View>
            <View style={[flex.row, margin.tops, margin.lrl]}>
              <Text color={fontColor.accent} fontSize={fontSize.s}>
                {i18n.t('proxy.team-report.register-date')}
              </Text>
              <Text
                color={fontColor.second}
                fontSize={fontSize.s}
                style={[margin.leftxxs]}>
                {dayjs(userInfo?.registerDate).format('MM/DD YYYY')}
              </Text>
            </View>
            <View
              style={[
                background.white,
                margin.topl,
                padding.lrl,
                padding.tbs,
                flex.row,
                flex.between,
              ]}>
              <Text fontSize={12} fontWeight={'bold'} color={'#252529'}>
                {i18n.t('proxy.user.new-user-title')}
              </Text>
            </View>
            <View
              style={[
                background.white,
                padding.lrl,
                padding.tbs,
                flex.row,
                flex.between,
              ]}>
              <View
                style={[
                  flex.row,
                  flex.between,
                  {width: '100%'},
                  {borderBottomWidth: 1, borderColor: '#E8EAEE'},
                  padding.btml,
                ]}>
                <View style={[flex.row, flex.between]}>
                  <View>
                    <View style={[flex.row, flex.centerByCol]}>
                      <NewUserIcon width={16} height={16} />
                      <Text
                        color={fontColor.accent}
                        fontSize={fontSize.s}
                        style={[margin.leftxxs]}>
                        {i18n.t('proxy.user.users')}
                      </Text>
                    </View>
                    <Text
                      color={fontColor.main}
                      fontSize={fontSize.m}
                      blod
                      style={[margin.topxxs]}>
                      {userInfo?.totalUserCount}
                    </Text>
                  </View>
                </View>
                <View style={[flex.row, flex.between]}>
                  <View>
                    <View style={[flex.row, flex.centerByCol]}>
                      <BettingUsersIcon width={16} height={16} />
                      <Text
                        color={fontColor.accent}
                        fontSize={fontSize.s}
                        style={[margin.leftxxs]}>
                        {i18n.t('proxy.user.recharge-user')}
                      </Text>
                    </View>
                    <Text
                      color={fontColor.main}
                      fontSize={fontSize.m}
                      blod
                      style={[
                        {
                          textAlign: 'right',
                        },
                        margin.topxxs,
                      ]}>
                      {userInfo?.rechargeUserCount}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            <View
              style={[
                padding.lrl,
                background.white,
                flex.row,
                flex.between,
                padding.btms,
              ]}>
              <View>
                <View style={[flex.row, flex.centerByCol]}>
                  <HomeRechargeIcon width={16} height={16} />
                  <Text
                    color={fontColor.accent}
                    fontSize={fontSize.s}
                    style={[margin.leftxxs]}>
                    {i18n.t('proxy.team-report.recharge')}
                  </Text>
                </View>
                <Text
                  color={fontColor.main}
                  fontSize={fontSize.m}
                  blod
                  style={[margin.topxxs]}>
                  {userInfo?.rechargeAmount
                    ? toPriceStr(+userInfo?.rechargeAmount)
                    : '-'}
                </Text>
              </View>
              <View
                style={[{width: 1, height: '100%', backgroundColor: '#E8EAEE'}]}
              />
              <View>
                <View style={[flex.row, flex.centerByCol]}>
                  <HomeBettingIcon
                    width={16}
                    height={16}
                    stroke={theme.fontColor.accent}
                  />
                  <Text
                    color={fontColor.accent}
                    fontSize={fontSize.s}
                    style={[margin.leftxxs]}>
                    {i18n.t('proxy.team-report.betting')}
                  </Text>
                </View>
                <Text
                  color={fontColor.main}
                  fontSize={fontSize.m}
                  blod
                  style={[margin.topxxs, {textAlign: 'right'}]}>
                  {toPriceStr(+(userInfo?.betAmount || 0))}
                </Text>
              </View>
            </View>
          </View>
          {false && (
            <View style={[{marginBottom: 20}]}>
              <View style={[background.white, padding.l, {paddingBottom: 0}]}>
                <LinearGradient
                  style={[padding.l, borderRadius.m]}
                  colors={['#F3F5F8', 'rgba(243, 245, 248, 0.00)']}
                  start={{x: 0, y: 0}}
                  end={{x: 0, y: 1}}>
                  <Text color={'#000'} fontSize={fontSize.m} blod>
                    {i18n.t('proxy.team-report.games-played7')}
                  </Text>
                </LinearGradient>
              </View>
              <Spin loading={loading}>
                {gameList?.length === 0 ? (
                  <ErrorInvitePage
                    content={i18n.t('proxy.user.error-no-performance')}
                    buttonTitle={i18n.t('proxy.user.contact')}
                    onClick={() => goWhatsAppChat(userInfo?.contactPhone)}
                  />
                ) : (
                  gameList &&
                  gameList?.map((item: listObj, index: number) => {
                    return (
                      <View style={[background.white]} key={index}>
                        <View
                          style={[padding.tbs, padding.l, flex.centerByRow]}>
                          <NativeTouchableOpacity
                            onPress={() => {
                              let arr: listObj[] = [...(gameList || [])];
                              arr[index].status = !arr[index].status;
                              setGameList(arr);
                            }}
                            style={[
                              margin.lrl,
                              flex.row,
                              flex.between,
                              index !== (gameList?.length || 0) - 1
                                ? {
                                    borderBottomWidth: item.status ? 0 : 1,
                                    borderColor: '#E8EAEE',
                                  }
                                : null,
                              padding.btms,
                            ]}>
                            <View style={[flex.row, flex.center]}>
                              <LazyImage
                                imageUrl={
                                  item.icon ? item.icon : defaultHeaderImg
                                }
                                occupancy="#0000"
                                width={20}
                                height={20}
                              />
                              <Text
                                color={fontColor.main}
                                fontSize={fontSize.m}
                                style={[margin.lefts]}>
                                {item.name}
                              </Text>
                            </View>
                            <View>
                              <View style={[flex.row, flex.centerByCol]}>
                                <View style={[margin.rights]}>
                                  <Text
                                    color={fontColor.accent}
                                    fontSize={fontSize.s}
                                    style={[
                                      {
                                        textAlign: 'right',
                                      },
                                    ]}>
                                    {parseInt(item.wonLost, 10) >= 0
                                      ? i18n.t('proxy.team-report.won')
                                      : i18n.t('proxy.team-report.loss')}
                                  </Text>
                                  <Text
                                    color={
                                      parseInt(item.wonLost, 10) >= 0
                                        ? proxyColor.raise
                                        : basicColor.primary
                                    }
                                    fontSize={fontSize.m}
                                    fontFamily={'fontDin'}
                                    blod>
                                    {parseInt(item.wonLost, 10) >= 0
                                      ? '+'
                                      : '-'}
                                    {toPriceStr(+item.wonLost)}
                                  </Text>
                                </View>
                                {item.status ? (
                                  <LazyImage
                                    imageUrl={chevronUp}
                                    occupancy="#0000"
                                    width={14}
                                    height={14}
                                  />
                                ) : (
                                  <LazyImage
                                    imageUrl={rightIcon}
                                    occupancy="#0000"
                                    width={14}
                                    height={14}
                                  />
                                )}
                              </View>
                            </View>
                          </NativeTouchableOpacity>
                          {item.status && (
                            <View
                              style={[
                                flex.row,
                                flex.between,
                                flex.center,
                                {height: 48},
                              ]}>
                              <View
                                style={[
                                  {
                                    width: 125,
                                    backgroundColor: '#D8E2E7',
                                    marginRight: 2,
                                  },
                                  padding.l,
                                ]}>
                                <Text color={'#45454D'} fontSize={fontSize.s}>
                                  {i18n.t('proxy.team-report.game-name')}
                                </Text>
                              </View>
                              <View
                                style={[
                                  flex.row,
                                  flex.between,
                                  flex.flex1,
                                  {backgroundColor: '#D8E2E7'},
                                  padding.l,
                                ]}>
                                <View>
                                  <Text color={'#45454D'} fontSize={fontSize.s}>
                                    {i18n.t('proxy.team-report.betting')}
                                  </Text>
                                </View>
                                <View>
                                  <Text color={'#45454D'} fontSize={fontSize.s}>
                                    {i18n.t('proxy.team-report.won-loss')}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          )}

                          {item.status &&
                            item.gameList.map((val: listObj, idx: number) => {
                              return (
                                <View
                                  style={[
                                    flex.row,
                                    flex.between,
                                    flex.centerByCol,
                                    {height: 48},
                                  ]}
                                  key={idx}>
                                  <View
                                    style={[
                                      {
                                        width: 125,
                                        backgroundColor:
                                          idx % 2 === 0 ? '' : '#F1F5F8',
                                        marginRight: 2,
                                        height: 48,
                                      },
                                      padding.l,
                                      flex.centerByRow,
                                    ]}>
                                    <Text
                                      color={'#45454D'}
                                      fontSize={fontSize.s}>
                                      {val.name}
                                    </Text>
                                  </View>
                                  <View
                                    style={[
                                      flex.row,
                                      flex.between,
                                      flex.flex1,
                                      flex.centerByCol,
                                      {
                                        backgroundColor:
                                          idx % 2 === 0 ? '' : '#F1F5F8',
                                        height: 48,
                                      },
                                      padding.l,
                                    ]}>
                                    <View style={[{width: 88}]}>
                                      <Text
                                        color={'#45454D'}
                                        numberOfLines={2}
                                        fontSize={fontSize.s}>
                                        {toPriceStr(+val.betAmount)}
                                      </Text>
                                    </View>
                                    <View style={[{width: 88}]}>
                                      <Text
                                        style={[{textAlign: 'right'}]}
                                        color={'#45454D'}
                                        numberOfLines={2}
                                        fontSize={fontSize.s}>
                                        {toPriceStr(+(val.wonLostAmount || 0))}
                                      </Text>
                                    </View>
                                  </View>
                                </View>
                              );
                            })}
                        </View>
                      </View>
                    );
                  })
                )}
              </Spin>
            </View>
          )}
        </View>
      </ScrollView>
    </Drawer>
  );
});
export default ModalContent;
