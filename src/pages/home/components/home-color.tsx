import LazyImage from '@basicComponents/image';
import {NativeTouchableOpacity} from '@basicComponents/touchable-opacity';
import Text from '@basicComponents/text';
import globalStore from '@/services/global.state';
import theme from '@/style';
import {goTo} from '@/utils';
import React, {forwardRef} from 'react';
import {View, ViewProps} from 'react-native';
import {useTranslation} from 'react-i18next';

const HomeColor = forwardRef<View, ViewProps>((props, ref) => {
  const {style, ...otherProp} = props;
  const colorWidth = globalStore.screenWidth - 2 * theme.paddingSize.l;

  const {i18n} = useTranslation();

  return (
    <View
      ref={ref}
      style={[
        // eslint-disable-next-line react-native/no-inline-styles
        {
          // minHeight: (colorWidth / 351) * 142,
          marginTop: -12,
          marginBottom: 12,
        },
        theme.borderRadius.s,
        style,
      ]}
      {...otherProp}>
      <View
        style={[
          theme.flex.row,
          theme.flex.centerByCol,
          // eslint-disable-next-line react-native/no-inline-styles
          {
            height: 36,
          },
        ]}>
        <Text size="large" white fontFamily="fontInter">
          {i18n.t('home.color.title')}
        </Text>
      </View>
      <NativeTouchableOpacity
        style={[
          theme.overflow.hidden,
          theme.borderRadius.s,
          // eslint-disable-next-line react-native/no-inline-styles
          {
            marginTop: -12,
          },
        ]}
        onPress={() => {
          goTo('GameWebView', {
            type: 'color',
          });
          // postMessage('router:/pages/colorPrediction/colorPrediction');
        }}>
        <LazyImage
          width={colorWidth}
          height={100}
          imageUrl={require('@assets/imgs/home/list-color.webp')}
          resizeMode={'stretch'}
        />
      </NativeTouchableOpacity>
    </View>
  );
});

export default HomeColor;
