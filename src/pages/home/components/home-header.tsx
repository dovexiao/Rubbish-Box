import Text from '@basicComponents/text';
import React from 'react';
import {View, Image, StyleSheet} from 'react-native';
import theme from '@style';
import {NativeTouchableOpacity} from '@basicComponents/touchable-opacity';
import globalStore from '@/services/global.state';
import {goTo, toPriceStr} from '@/utils';
import DetailNavTitle from '@/components/business/detail-nav-title';
import {combineLatest, distinctUntilChanged} from 'rxjs';
import {postUserInfo, getBalance} from '@services/global.service';
import {useTranslation} from 'react-i18next';
import {useFocusEffect} from '@react-navigation/native';
import {getAllRemind} from '@/pages/home/home.service';
import Button from '@/components/basic/button';
import envConfig from '@/utils/env.config';
const defaultHeaderImg = require('@components/assets/icons/default-header.webp');

const HomeHeader = () => {
  const styles = StyleSheet.create({
    bellTipIcon: {
      width: 7,
      height: 7,
      backgroundColor: '#fa5637',
      borderRadius: 50,
      position: 'absolute',
      top: 10,
      right: 10,
    },
  });
  const {i18n} = useTranslation();
  const [showLogin, setShowLogin] = React.useState(false);
  const [showUser, setShowUser] = React.useState(false);
  const [userName, setUserName] = React.useState(false);
  const [userAvatar, setUserAvatar] = React.useState('');
  const [amount, setAmount] = React.useState<number>(0);
  const [rate, setRate] = React.useState<number>(0);
  const [remind, setRemind] = React.useState('');
  React.useEffect(() => {
    // 在组件加载时调用接口并更新状态
    const fetchRemind = async () => {
      const response = await getAllRemind(); // 调用接口
      setRemind(String(response)); // 将返回的数据存储到状态中
    };

    fetchRemind(); // 调用函数
  }, []); // 依赖空数组，确保只在组件加载时调用一次

  // 获取余额
  const fetchBalance = async () => {
    try {
      const res = await getBalance();
      setAmount(res || 0);
    } catch (err) {
      console.error('获取余额失败', err);
    }
  };

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
          fetchBalance();
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
        // style={{marginLeft: -40}}
        <NativeTouchableOpacity>
          <Image
            style={{
              width: 100,
              height: 20,
              // transform: [{scale: 0.5}],
            }}
            source={{
              uri: envConfig.getLogoV2,
            }}
          />
        </NativeTouchableOpacity>
      }
      hideAmount
      rightNode={
        <View style={[theme.flex.centerByCol, theme.flex.row, theme.gap.m]}>
          {showUser && (
            <NativeTouchableOpacity
              onPress={() => goTo('Me')}
              style={[theme.flex.centerByCol, theme.flex.row]}>
              <Image
                source={userAvatar ? {uri: userAvatar} : defaultHeaderImg}
                style={[theme.icon.xxl, {borderRadius: theme.iconSize.xxl / 2}]}
              />
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
              <NativeTouchableOpacity
                onPress={() => {
                  goTo('NotifyNew');
                }}
                style={[
                  theme.padding.s,
                  theme.position.rel,
                  {
                    marginRight: theme.paddingSize.s,
                  },
                ]}>
                <Image
                  style={[theme.icon.xl]}
                  source={require('@assets/icons/bell.webp')}
                  resizeMode={'cover'}
                />
                {remind === '1' && <View style={[styles.bellTipIcon]} />}
              </NativeTouchableOpacity>
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
