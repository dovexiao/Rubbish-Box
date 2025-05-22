import React from 'react';
import {NavigatorScreenProps} from '@/types';
import {View} from 'react-native';
import globalStore from '@/services/global.state';
import envConfig from '@/utils/env.config';
import {FadeInView} from '@basicComponents/animations';
import Spin from '@/components/basic/spin';
import Text from '@/components/basic/text';
import WebView, {WebViewMessageEvent} from 'react-native-webview';
// import TouchableOpacity from '@basicComponents/touchable-opacity';
import theme from '@/style';
// import {goBack} from '@/utils';
// const goBackStyle = {
//   top: 4,
//   left: 4,
// }
const IM = React.forwardRef(
  (
    props: NavigatorScreenProps & {onCanGoBack?: (canGoBack: boolean) => void},
    ref,
  ) => {
    const jumpParams = `baseUrl=${envConfig.baseUrl}&api=app/openIm/getReqParams&token=${globalStore.token}`;
    const [pageLoading, setPageLoading] = React.useState(true);
    const webViewRef = React.useRef<WebView>(null);
    React.useImperativeHandle(ref, () => ({
      webViewRef,
    }));
    const handleMessage = (e: WebViewMessageEvent | MessageEvent) => {
      const data = globalStore.isWeb
        ? (e as MessageEvent).data
        : (e as WebViewMessageEvent).nativeEvent.data;
      if (data === 'pageLoading:show') {
        setPageLoading(true);
        return;
      }
      if (data === 'pageLoading:hide') {
        setPageLoading(false);
        return;
      }
      if (data === 'update:amount') {
        if (globalStore.token) {
          globalStore.updateAmount.next();
        }
        return;
      }
      // if (data === 'scratch-detail-back') {
      //   goTo('Home');
      // } else if (data === 'scratch-customer-server') {
      //   goCS();
      // } else if (data === 'login') {
      //   goLogin();
      // }
    };
    if (globalStore.isWeb) {
      const webStyle = {borderWidth: 0};
      return (
        <Spin loading={false} style={[theme.fill.fill, theme.flex.col]}>
          {/* <TouchableOpacity
            onPress={goBack}
            style={[goBackStyle, theme.position.abs]}>
            <Image
              style={theme.icon.l}
              source={require('@components/assets/icons/back.webp')}
            />
          </TouchableOpacity> */}
          <iframe
            id="im-frame"
            name={jumpParams}
            src="http://localhost:3000"
            height={'100%'}
            width={'100%'}
            style={webStyle}
            allow="microphone"
            // sandbox="allow-microphone"
            // allowScripts={true}
            // allowFullScreen={true}
            // allowTransparency={true}
            // allowGeolocation={true}
            // allowOrientation={true}
            // allowPresentation={true}
            // allowFileAccess={true}
          />
        </Spin>
      );
    } else {
      return (
        <FadeInView>
          <Spin loading={pageLoading} style={[theme.fill.fill]}>
            <WebView
              ref={webViewRef}
              source={{
                uri: 'http://localhost:3000',
              }}
              cacheEnabled={true}
              collapsable={false}
              cacheMode={'LOAD_NO_CACHE'}
              domStorageEnabled={true}
              renderError={(errorDomain, errorCode, errorDesc) => (
                <View>
                  <Text>Load Error, Please exit and retry</Text>
                  <Text>{errorDomain}</Text>
                  <Text>{errorCode}</Text>
                  <Text>{errorDesc}</Text>
                </View>
              )}
              onMessage={handleMessage}
              onNavigationStateChange={e => {
                // setCanGoBack(e.canGoBack);
                props.onCanGoBack?.(e.canGoBack);
              }}
              style={[theme.flex.flex1]}
            />
          </Spin>
        </FadeInView>
      );
    }
  },
);

export default IM;
