import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import theme from '@/style';
import {downloadApk} from '@/utils'; //goTo
import globalStore from '@services/global.state';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {View, Image} from 'react-native';
import Text from '@basicComponents/text';
import LinearGradient from '@/components/basic/linear-gradient';
import envConfig from '@/utils/env.config';

const Download: React.FC = () => {
  const {i18n} = useTranslation();
  const [show] = React.useState(true); //setShow
  const toDownload = () => {
    // if (!globalStore.token) {
    //   globalStore.globalWaringTotal(i18n.t('home.tip.beforDownload'));
    //   goTo('Login');
    //   return;
    // }
    downloadApk();
  };
  const heightZoom = 50 / 375;
  const bannerHeight = globalStore.screenWidth * heightZoom;
  const downloadSizeH = (30 * globalStore.screenWidth) / 375;
  const downloadSizeW = (90 * globalStore.screenWidth) / 375;
  const imgSize = (35 * globalStore.screenWidth) / 375;
  return show ? (
    <LinearGradient
      colors={theme.linearGradientColor.homeTopLogLinearGradient}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 0}}
      style={[
        theme.flex.row,
        theme.flex.centerByCol,
        theme.flex.between,
        {
          height: bannerHeight,
          paddingLeft: theme.paddingSize.xxl,
          paddingRight: theme.paddingSize.xxl,
          marginTop: 3,
        },
      ]}>
      <View style={[theme.flex.flex, theme.flex.row]}>
        <Image
          style={[
            {
              height: imgSize,
              width: imgSize,
              marginRight: theme.paddingSize.m,
            },
          ]}
          source={{
            uri: envConfig.getLogo,
          }}
        />
        <View style={[theme.flex.flex, theme.flex.col, theme.flex.centerByRow]}>
          <Text main blod style={[theme.font.fm]} color={theme.fontColor.white}>
            {i18n.t('home.tip.downTips1')}
          </Text>
          <Text second style={[theme.font.fs]} color={theme.fontColor.white}>
            {i18n.t('home.tip.downTips2')}
          </Text>
        </View>
      </View>
      <View style={[theme.flex.flex, theme.flex.row, theme.flex.centerByCol]}>
        <NativeTouchableOpacity onPress={toDownload}>
          <Image
            style={[
              {
                height: downloadSizeH,
                width: downloadSizeW,
              },
            ]}
            source={require('@assets/animated/home-download.gif')}
          />
        </NativeTouchableOpacity>
      </View>
    </LinearGradient>
  ) : (
    <></>
  );
};

export default Download;
