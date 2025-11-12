import React from 'react';
import {Dialog} from '@rneui/themed';
import Text from '@basicComponents/text';
import theme from '@/style';
import {ImageBackground, View} from 'react-native';
import {NavigatorScreenProps} from '@/types';
import {useTranslation} from 'react-i18next';
import ProgressBar from '@/components/basic/progress-bar';
import {ScreenHeight} from '@rneui/base';

export interface SplashProps {
  available?: number;
  received: number;
  total: number;
}

const Splash = (props: Partial<NavigatorScreenProps> & SplashProps) => {
  const {available = 0, received = 0, total = 0} = props;
  const [loading, setLoading] = React.useState(true);
  const {i18n} = useTranslation();
  React.useEffect(() => {
    return () => {
      setLoading(false);
    };
  }, []);

  const progress = total ? received / total : 0;

  return (
    <Dialog
      isVisible={loading}
      overlayStyle={[theme.fill.fill, theme.padding.zorro]}>
      <ImageBackground
        source={require('@/assets/imgs/splash.webp')}
        style={{height: ScreenHeight}}>
        <View
          style={[
            theme.padding.xxxl,
            theme.flex.flex,
            theme.flex.center,
            {
              bottom: 160,
              position: 'absolute',
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            },
          ]}>
          <Text white textAlign="center" size="large">
            {available === 0 && i18n.t('splash.tip.checkingVersion')}
            {available === 1 && i18n.t('splash.tip.downloading')}
            {available === 2 && i18n.t('splash.tip.checkingResources')}
          </Text>

          {Boolean(available) && Boolean(progress) && (
            <ProgressBar progress={progress} style={{marginTop: 10}} />
          )}
        </View>
      </ImageBackground>
    </Dialog>
  );
};

export default Splash;
