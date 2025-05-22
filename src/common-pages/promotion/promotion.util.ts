import i18n from '@/i18n';
import {goTo} from '@/utils';
import {StyleProp, TextStyle, ViewStyle} from 'react-native';
import theme from '@style';

export const goToLink = (url: string) => {
  // 可能没有url，该情况直接不跳转
  if (!url) {
    return;
  }
  if (url.startsWith('http')) {
    goTo('WebView', {
      headerTitle: i18n.t('promotion.detail'),
      originUrl: url,
    });
    return;
  }
  if (url.startsWith('uniurl:')) {
    goTo('WebView', {
      headerTitle: i18n.t('promotion.detail'),
      isReactH5: '0',
      path: url.substring('uniurl:'.length),
    });
  }
  if (url.startsWith('reacth5url:')) {
    goTo('WebView', {
      headerTitle: i18n.t('promotion.detail'),
      path: url.substring('reacth5url:'.length),
    });
  }
};

export const titlePositionStyle = (position: number) => {
  let containerStyle: StyleProp<ViewStyle> = {};
  let titleStyle: StyleProp<TextStyle> = {textAlign: 'left'};
  switch (position) {
    case 0:
      containerStyle = [
        theme.flex.row,
        theme.padding.lrl,
        theme.padding.tbm,
        theme.flex.centerByCol,
        theme.flex.between,
      ];
      break;
    case 1:
      containerStyle = {
        marginTop: 12,
        alignItems: 'center',
        maxWidth: '50%',
      };
      titleStyle = {textAlign: 'center'};
      break;
    case 2:
      containerStyle = {
        position: 'absolute',
        alignItems: 'center',
        maxWidth: '50%',
        bottom: 12,
      };
      titleStyle = {textAlign: 'center'};
      break;
    case 3:
      containerStyle = {
        position: 'absolute',
        left: 12,
        top: 12,
        maxWidth: '50%',
      };
      break;
    case 4:
      containerStyle = {
        position: 'absolute',
        right: 12,
        top: 45,
        maxWidth: '50%',
      };
      titleStyle = {textAlign: 'right'};
      break;
    default:
      break;
  }
  return {containerStyle, titleStyle};
};
