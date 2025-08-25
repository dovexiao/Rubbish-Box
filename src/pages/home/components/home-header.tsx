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
        <NativeTouchableOpacity style={{marginLeft: -38}}>
          <Image
            style={{
              width: 180,
              height: 45,
              transform: [{scale: 0.55}],
            }}
            source={require('@assets/logos/logo-v2.png')}
          />
        </NativeTouchableOpacity>
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
