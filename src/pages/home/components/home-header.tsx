import Text from '@basicComponents/text';
import React from 'react';
import {View, Image} from 'react-native';
import theme from '@style';
import {NativeTouchableOpacity} from '@basicComponents/touchable-opacity';
import globalStore from '@/services/global.state';
import {goTo, toPriceStr} from '@/utils';
import DetailNavTitle from '@/components/business/detail-nav-title';
import {combineLatest, distinctUntilChanged} from 'rxjs';
import {postUserInfo} from '@services/global.service';
import {useTranslation} from 'react-i18next';
import {useFocusEffect} from '@react-navigation/native';
import Button from '@/components/basic/button';
const defaultHeaderImg = require('@components/assets/icons/default-header.webp');

const HomeHeader = () => {
  const {i18n} = useTranslation();
  const [showLogin, setShowLogin] = React.useState(false);
  const [showUser, setShowUser] = React.useState(false);
  const [userName, setUserName] = React.useState(false);
  const [userAvatar, setUserAvatar] = React.useState('');
  const [amount, setAmount] = React.useState<number>(0);
  const [rate, setRate] = React.useState<number>(0);

  useFocusEffect(
    React.useCallback(() => {
      const sub = combineLatest([
        globalStore.tokenSubject,
        globalStore.globalLoading,
      ]).subscribe(([t, l]) => {
        // 没有token且没有加载时,显示login按钮
        setShowLogin(!t && !l);
        setShowUser(!!t);
        if (t) {
          postUserInfo().then(res => {
            globalStore.userInfo = res;
            setUserName(res.userName || res.userPhone);
            setUserAvatar(res.userAvatar);
          });
        }
      });
      const amountSub = globalStore.amountChanged.subscribe(res => {
        if (res.current) {
          setAmount(res.current);
        }
      });
      const rateSub = globalStore.rateSubject
        .pipe(distinctUntilChanged())
        .subscribe(v => {
          setRate(v);
        });

      const msgSub = globalStore.notificationSubject.subscribe(() => {});
      return () => {
        sub.unsubscribe();
        amountSub.unsubscribe();
        rateSub.unsubscribe();
        msgSub.unsubscribe();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  return (
    <DetailNavTitle
      rate={rate}
      showProgress
      containerStyle={[
        theme.flex.row,
        theme.flex.centerByCol,
        theme.background.transparentMedium,
        {
          paddingTop: theme.paddingSize.zorro,
          paddingBottom: theme.paddingSize.zorro,
        },
      ]}
      hideServer
      leftNode={
        <View style={[theme.flex.centerByCol, theme.flex.row]}>
          <NativeTouchableOpacity
            style={[theme.flex.row, theme.flex.centerByCol]}>
            <Image
              style={[
                // eslint-disable-next-line react-native/no-inline-styles
                {
                  width: 180,
                  height: 45,
                  // borderRadius: 6,
                  // borderColor: theme.basicColor.selectPrimary,
                  // borderWidth: 1,
                },
              ]}
              source={require('@assets/logos/logo-v2.webp')}
            />
          </NativeTouchableOpacity>
        </View>
      }
      hideAmount
      rightNode={
        <View style={[theme.flex.centerByCol, theme.flex.row, theme.gap.m]}>
          {showUser && (
            <NativeTouchableOpacity
              onPress={() => goTo('Me')}
              style={[theme.flex.centerByCol, theme.flex.row, theme.gap.m]}>
              <View style={[theme.flex.col, theme.margin.lefts]}>
                <Text
                  accent
                  textAlign="left"
                  color={theme.fontColor.white}
                  style={[
                    {
                      marginBottom: -theme.paddingSize.xxs / 2,
                    },
                  ]}>
                  {userName}
                </Text>
                <Text
                  color={theme.fontColor.white}
                  textAlign="right"
                  size="medium"
                  blod>
                  {toPriceStr(amount)}
                </Text>
              </View>
              <Image
                source={userAvatar ? {uri: userAvatar} : defaultHeaderImg}
                style={[theme.icon.xxl, {borderRadius: theme.iconSize.xxl / 2}]}
              />
            </NativeTouchableOpacity>
          )}
          {/*{showUser ? (*/}
          {/*  <NativeTouchableOpacity*/}
          {/*    onPress={() => {*/}
          {/*      goToWithLogin('Notification');*/}
          {/*    }}*/}
          {/*    style={[theme.position.rel]}>*/}
          {/*    <Image*/}
          {/*      style={[theme.image.xs]}*/}
          {/*      resizeMode={'cover'}*/}
          {/*    />*/}
          {/*    {unReadMessageCount?.messageTotalCount ? (*/}
          {/*      <Tag*/}
          {/*        // eslint-disable-next-line react-native/no-inline-styles*/}
          {/*        style={[theme.position.abs, {top: 0, right: 0}]}*/}
          {/*        badgeSize={14}*/}
          {/*        backgroundColor={theme.basicColor.red}*/}
          {/*        content={*/}
          {/*          unReadMessageCount?.messageTotalCount > 99*/}
          {/*            ? '99+'*/}
          {/*            : unReadMessageCount?.messageTotalCount*/}
          {/*        }*/}
          {/*      />*/}
          {/*    ) : null}*/}
          {/*  </NativeTouchableOpacity>*/}
          {/*) : null}*/}
          {showLogin && (
            <View style={[theme.flex.row, theme.flex.centerByCol, theme.gap.m]}>
              <Button
                title={i18n.t('me.user.loginUpper')}
                type="linear-primary"
                size="small"
                titleColor="#000000"
                radius={5}
                onPress={() => {
                  goTo('Login');
                }}
              />
              <Button
                title={i18n.t('me.user.registerUpper')}
                type="border"
                titleColor="#FEB705"
                size="small"
                radius={5}
                onPress={() => {
                  goTo('SingUp');
                }}
              />
            </View>
          )}
        </View>
      }>
      <View style={[theme.flex.flex1]} />
    </DetailNavTitle>
  );
};

export default HomeHeader;
