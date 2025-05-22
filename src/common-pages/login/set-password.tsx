import React from 'react';
import theme from '@style';
import Text from '@basicComponents/text';
import {View} from 'react-native';
import {BasicObject, NavigatorScreenProps} from '@types';
import NavTitle from '@basicComponents/nav-title';
import {goBack, goTo} from '@utils';
import CodeInput from './components/code-input';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {ScrollView} from 'react-native-gesture-handler';
import {styles} from './login.style';
import globalStore from '@services/global.state';
import Button from '@basicComponents/button';
import {updatePassword} from './login.service';
import {NativeTouchableOpacity} from '@basicComponents/touchable-opacity';
import {useTranslation} from 'react-i18next';
import {LazyImageLGBackground} from '@basicComponents/image';

const SetPassword = (props: NavigatorScreenProps) => {
  const {i18n} = useTranslation();
  /** 登录成功的目标页面,回到原页面操作 */
  const sucessPage =
    ((props.route.params as BasicObject)?.sucessPage as string) || null;
  /** 登录成功的目标页面,回到原页面操作 */
  const sucessPageParams =
    ((props.route.params as BasicObject)?.sucessPageParams as BasicObject) ||
    null;
  const params = props.route.params as {fromLogin?: boolean};
  const fromLogin = React.useRef(params?.fromLogin || false).current;
  const [pwd, setPWD] = React.useState('');
  const [confrimPWD, setComfirmPWD] = React.useState('');
  const [confirmed, setConfirmed] = React.useState(false);
  const goNextPage = () => {
    if (sucessPage) {
      goTo(sucessPage, {sucessPageParams});
    } else {
      goTo(globalStore.homePage);
    }
  };
  return (
    <LazyImageLGBackground
      locations={[0, 1]}
      style={[theme.fill.fill, theme.flex.col]}>
      <NavTitle
        onBack={fromLogin ? undefined : () => goBack()}
        title={i18n.t('login.label.set-password')}
        rightNode={
          fromLogin ? (
            <NativeTouchableOpacity onPress={goNextPage}>
              <Text size="medium" color={theme.fontColor.white}>
                {i18n.t('login.label.skip')}
              </Text>
            </NativeTouchableOpacity>
          ) : null
        }
      />
      <View
        style={[
          theme.flex.col,
          theme.background.mainDark,
          theme.borderRadius.l,
          theme.padding.lrl,
          theme.padding.btml,
          theme.margin.l,
        ]}>
        <View
          style={[
            styles.interval,
            theme.margin.topl,
            // eslint-disable-next-line react-native/no-inline-styles
            {
              height: 66,
            },
          ]}>
          <CodeInput
            switchIndex={0}
            userPassword={pwd}
            setValueOrCode={setPWD}
          />
        </View>
        <View
          style={[
            styles.interval,
            // eslint-disable-next-line react-native/no-inline-styles
            {
              height: 66,
            },
          ]}>
          <CodeInput
            switchIndex={0}
            userPassword={confrimPWD}
            setValueOrCode={setComfirmPWD}
          />
        </View>
        <Button
          radius={theme.borderRadiusSize.l}
          style={[theme.margin.topxxl, {height: 49}]}
          onPress={() => {
            if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,15}$/.test(pwd)) {
              globalStore.globalTotal.next({
                type: 'warning',
                message: i18n.t('login.tip.passwordRule'),
              });
              return;
            }
            if (pwd !== confrimPWD) {
              globalStore.globalTotal.next({
                type: 'warning',
                message: i18n.t('login.tip.pwd-dif'),
              });
              return;
            }
            globalStore.globalLoading.next(true);
            updatePassword(pwd)
              .then(() => {
                setConfirmed(true);
                // globalStore.globalTotal.next({
                //   type: 'success',
                //   message: i18n.t('login.tip.modified'),
                // });
                // setTimeout(() => {
                goNextPage();
                // }, 3000);
              })
              .finally(() => {
                globalStore.globalLoading.next(false);
              });
          }}
          disabled={!pwd || !confrimPWD || confirmed}>
          <Text color={theme.basicColor.white} size="large" fontWeight="700">
            {i18n.t('label.confirm')}
          </Text>
        </Button>
      </View>
    </LazyImageLGBackground>
  );
};

export default SetPassword;
