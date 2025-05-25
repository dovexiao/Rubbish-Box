/* eslint-disable prettier/prettier */
import React from 'react';
import Text from '@basicComponents/text';
import Home from './pages/home';
import Wallet from './pages/me';
import theme from '@style';
import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import {ImageURISource, Image} from 'react-native';
import {NavigatorScreenProps} from '@types';
import Promotion from './common-pages/proxy-new/proxy-home';
import {NativeTouchableOpacity} from '@basicComponents/touchable-opacity';
import globalStore from './services/global.state';
import {goTo} from './utils';
import LinearGradient from './components/basic/linear-gradient';
import ArticleDetail from './common-pages/article/article-detail';
import {useToken} from '@/store/useUserStore';
//活动相关
import PromotionDrawer from './common-pages/promotion';
import i18n from '@i18n';
import Recharge from '@/common-pages/recharge';

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
    img: require('@assets/icons/home/home.webp'),
    activeImg: require('@assets/icons/home/home.webp'),
  },
  {
    name: i18n.t('home.tab.promotion'),
    link: 'index/PromotionDrawer',
    component: PromotionDrawer,
    img: require('@assets/icons/home/promotion.webp'),
    activeImg: require('@assets/icons/home/promotion.webp'),
  },
  {
    name: i18n.t('home.tab.invite'),
    link: 'index/promotion',
    component: Promotion,
    img: require('@assets/icons/home/agency.webp'),
    activeImg: require('@assets/icons/home/agency.webp'),
  },
  {
    name: i18n.t('home.tab.deposit'),
    link: 'index/recharge',
    component: Recharge,
    img: require('@assets/icons/home/deposit.webp'),
    activeImg: require('@assets/icons/home/deposit.webp'),
  },
  {
    name: i18n.t('home.tab.me'),
    link: 'index/me',
    component: Wallet,
    img: require('@assets/icons/home/me.webp'),
    activeImg: require('@assets/icons/home/me.webp'),
  },
];

const CusTab = (props: BottomTabBarProps) => {
  return (
    <LinearGradient
      colors={theme.linearGradientColor.mainNavigationLinearGradientBtnColor}
      style={[
        theme.flex.row,
        theme.fill.fillW,
        // eslint-disable-next-line react-native/no-inline-styles
        {height: 50},
      ]}>
      {props.state?.routes.map((route, index) => {
        const {options} = props.descriptors[route.key];
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const {isLogin: login} = useToken();
        const InviteLabelName = login ? 'Agency' : 'Rule';
        const label =
          options.tabBarLabel !== undefined
            ? (options.tabBarLabel as string)
            : options.title !== undefined
            ? route.name === 'Agency'
              ? route.name
              : options.title
            : route.name;
        const isFocused = props.state.index === index;
        const onPress = () => {
          if (!isFocused) {
            if (options.title === 'Sports' && !globalStore.token) {
              goTo('Login');
            } else {
              if (route.name === 'Agency' && InviteLabelName === 'Rule') {
                goTo(route.name, {id: 1, type: 'index'});
                // toAgentApply();
                return;
              }
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
            style={[
              theme.flex.center,
              theme.flex.flex1,
              // eslint-disable-next-line react-native/no-inline-styles
              isFocused && {
                overflow: 'visible',
                backgroundColor: theme.basicColor.transparentP30,
              },
            ]}>
            <Image
              style={[
                isFocused
                  ? // eslint-disable-next-line react-native/no-inline-styles
                    {
                      marginTop: -14,
                      width: 42,
                      height: 42,
                    }
                  : // eslint-disable-next-line react-native/no-inline-styles
                    {height: 28, width: 28},
              ]}
              source={mainPageList[index].img}
            />
            <Text
              blod={true}
              fontSize={10}
              style={{
                color: theme.basicColor.white,
              }}>
              {label}
            </Text>
          </NativeTouchableOpacity>
        );
      })}
    </LinearGradient>
    // </Shadow>
  );
};
const MainNav = () => {
  const {isLogin} = useToken();
  if (!isLogin) {
    mainPageList[2].component = ArticleDetail;
    mainPageList[2].link = 'index/promotion?id=1&type=index';
  } else {
    mainPageList[2].component = Promotion;
    mainPageList[2].link = 'index/promotion?id=1&type=index';
  }
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
