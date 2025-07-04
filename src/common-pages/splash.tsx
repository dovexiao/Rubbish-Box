import React from 'react';
import {Dialog, LinearProgress} from '@rneui/themed';
import Text from '@basicComponents/text';
import theme from '@/style';
import {Image, View, StyleSheet} from 'react-native';
import {NavigatorScreenProps} from '@/types';
import {useTranslation} from 'react-i18next';
import LinearGradient from '@/components/basic/linear-gradient';
/** 这是一个加载页 */

export interface SplashProps {
  available?: number;
}

const Splash = (props: Partial<NavigatorScreenProps> & SplashProps) => {
  const {available = 0} = props;
  const [loading, setLoading] = React.useState(true);
  const {i18n} = useTranslation();
  React.useEffect(() => {
    return () => {
      setLoading(false);
    };
  }, []);
  return (
    <Dialog
      isVisible={loading}
      // style={[theme.border.red]}
      overlayStyle={[theme.fill.fill, theme.padding.zorro]}>
      <LinearGradient
        colors={['#152A36', '#152A36']}
        style={[
          theme.fill.fill,
          theme.flex.flex,
          theme.flex.center,
          // theme.flex.around,
        ]}>
        <View
          style={[
            theme.flex.centerByCol,
            theme.flex.around,
            {
              width: '100%',
              height: '60%',
            },
          ]}>
          <Image
            source={require('@assets/icons/common/common.webp')}
            style={[
              // eslint-disable-next-line react-native/no-inline-styles
              {
                width: 300,
                height: 300,
              },
            ]}
            resizeMode="stretch"
          />
          <View
            style={[
              theme.margin.xxxl,
              theme.margin.btml,
              theme.padding.xxxl,
              theme.flex.flex,
              theme.flex.center,
              {height: '20%', width: '90%'},
            ]}>
            <Text
              style={[theme.margin.btml]}
              white
              textAlign="center"
              size="large">
              {available === 0 && i18n.t('splash.tip.checkingVersion')}
              {available === 1 && i18n.t('splash.tip.downloading')}
              {available === 2 && i18n.t('splash.tip.checkingResources')}
            </Text>
            <LinearProgress
              style={styleSheet.linearProgress}
              color={'#F7D85D'}
              trackColor={'#152A36'}
            />
          </View>
        </View>
      </LinearGradient>
    </Dialog>
  );
};

const styleSheet = StyleSheet.create({
  image: {
    width: '80%',
    aspectRatio: 1,
  },
  linearProgress: {
    height: 19,
    borderRadius: 16,
  },
});

export default Splash;
