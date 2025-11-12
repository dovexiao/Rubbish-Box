import React from 'react';
import {Dialog} from '@rneui/themed';
import Text from '@basicComponents/text';
import theme from '@/style';
import {Image, View} from 'react-native';
import {NavigatorScreenProps} from '@/types';
import {useTranslation} from 'react-i18next';
import LinearGradient from '@/components/basic/linear-gradient';
import ProgressBar from '@/components/basic/progress-bar';

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

            {Boolean(available) && Boolean(progress) && (
              <ProgressBar progress={progress} />
            )}
          </View>
        </View>
      </LinearGradient>
    </Dialog>
  );
};

export default Splash;
