import React from 'react';
import Text from '@basicComponents/text';
import Home from './pages/home';
// import Me from './pages/me';
import theme from '@style';
import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import {ImageURISource, Image, View} from 'react-native'; //ImageBackground
import {NavigatorScreenProps} from '@types';
// import Result from './common-pages/result';
import {Shadow} from 'react-native-shadow-2';
import {NativeTouchableOpacity} from '@basicComponents/touchable-opacity';
import globalStore from './services/global.state';
import {goTo} from './utils';
import i18n from '@i18n';
// import Promotion from './common-pages/promotion';

/* eslint-disable prettier/prettier */
import Wallet from './pages/me';
//活动相关
import PromotionDrawer from './common-pages/promotion';
import Vip from '@/common-pages/vip/vip';
// import Recharge from '@/common-pages/recharge';
import ProxyHome from "@/common-pages/proxy";

const Tab = createBottomTabNavigator();

export const mainPageList: {
  name: string;
  link: string;
  component: (props: NavigatorScreenProps) => React.JSX.Element;
  img: ImageURISource;
  activeImg: ImageURISource;
  unmountOnBlur?: boolean;
  hide?: boolean;
}[] = [
  {
    name: i18n.t('home.tab.home'),
    link: 'index/home',
    component: Home,
    img: require('@assets/icons/home/home-inselect.webp'),
    activeImg: require('@assets/icons/home/home-select.webp'),
  },
  {
    name: i18n.t('home.tab.promotion'),
    link: 'index/PromotionDrawer',
    component: PromotionDrawer,
    img: require('@assets/icons/home/activity-inselect.webp'),
    activeImg: require('@assets/icons/home/activity-select.webp'),
  },
  {
    name: i18n.t('home.tab.invite'),
    link: 'index/promotion',
    component: ProxyHome,
    img: require('@assets/icons/home/agency-inselect.webp'),
    activeImg: require('@assets/icons/home/agency-select.webp'),
  },
  {
    name: i18n.t('vip.title'),
    link: 'index/vip',
    component: Vip,
    img: require('@assets/icons/home/vip.png'),
    activeImg: require('@assets/icons/home/vip-select.png'),
    // img: require('@assets/icons/home/results-inselect.webp'),
    // activeImg: require('@assets/icons/home/results-select.webp'),
  },
  {
    name: i18n.t('home.tab.me'),
    link: 'index/me',
    component: Wallet,
    img: require('@assets/icons/home/account-inselect.webp'),
    activeImg: require('@assets/icons/home/account-select.webp'),
  },
];

const CusTab = (props: BottomTabBarProps) => {
  return (
    <Shadow
      {...theme.shadow.defaultShadow}
      style={[
        theme.flex.row,
        theme.flex.around,
        theme.fill.fillW,
        // theme.shadow.defaultShadow.style,
        // eslint-disable-next-line react-native/no-inline-styles
        {
          height: 56,
          backgroundColor: theme.basicColor.newBgInTwo,
        },
      ]}>
      <View
        style={[
          theme.flex.row,
          theme.fill.fillW,
          // eslint-disable-next-line react-native/no-inline-styles
          {height: 56},
        ]}>
        {props.state?.routes.map((route, index) => {
          const {options} = props.descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? (options.tabBarLabel as string)
              : options.title !== undefined
              ? options.title
              : route.name;
          const isFocused = props.state.index === index;
          const onPress = () => {
            if (!isFocused) {
              if (
                (options.title === 'Agency' ||
                  options.title === 'आमंत्रित करना' ||
                  options.title === 'ഏജൻസി' ||
                  options.title === 'ஏஜென்சி' ||
                  options.title === 'ఏజెన్సీ' ||
                  options.title === 'VIP')  &&
                !globalStore.token
              ) {
                goTo('Login');
              } else {
                goTo(route.name);
              }
            }
          };
          return (
            <NativeTouchableOpacity
              key={label}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityState={isFocused ? {selected: true} : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              style={[theme.flex.center, theme.flex.flex1, theme.padding.tbs]}>
              <Image
                style={theme.icon.l}
                source={
                  isFocused
                    ? mainPageList[index].activeImg
                    : mainPageList[index].img
                }
              />
              <Text
                blod={true}
                fontSize={10}
                style={{
                  color: isFocused
                    ? theme.basicColor.newFontWhite
                    : theme.basicColor.newFontPink,
                }}>
                {label}
              </Text>
            </NativeTouchableOpacity>
          );
        })}
      </View>
    </Shadow>
  );
};

const MainNav = () => {
  return (
    <Tab.Navigator
      // eslint-disable-next-line react/no-unstable-nested-components
      tabBar={props => <CusTab {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      {mainPageList.map(v => (
        <Tab.Screen
          key={v.name}
          name={v.name}
          component={v.component}
          options={{
            title: v.name,
            unmountOnBlur: v.unmountOnBlur,
          }}
        />
      ))}
    </Tab.Navigator>
  );
};

export default MainNav;
