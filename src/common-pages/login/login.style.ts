// import {background} from '@/components/style';
import globalStore from '@/services/global.state';
import {BasicObject} from '@/types';
import theme from '@style';
import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  loginCloseIconBox: {
    ...theme.icon.l,
    ...theme.position.abs,
    right: theme.paddingSize.l,
  },
  tabIndicatorStyle: {
    backgroundColor: theme.backgroundColor.main,
    height: 2,
  },
  switchBgStyle: {
    borderBottomColor: theme.basicColor.primary,
    borderBottomWidth: 2,
    height: '100%',
    width: '50%',
    position: 'absolute',
    top: 0,
  },
  inputBox: {
    ...theme.flex.row,
    ...theme.flex.centerByCol,
    ...theme.border.primary50,
    ...theme.borderRadius.s,
    ...theme.padding.lrl,
    ...theme.background.mainDark,
  },
  greyBorder: {},
  deepBorder: {},
  getOTP: {
    borderRadius: 4,
    overflow: 'hidden',
  },
  interval: {
    ...theme.margin.topl,
  },
  loginButton: {
    height: 48,
    // backgroundColor: theme.basicColor.primary,
    backgroundImage: theme.linearGradientColor.loginButtonLinearGradient,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
});
const inputStyle = {
  minHeight: 44,
  maxHeight: 44,
  height: 44,
  padding: 0,
  ...theme.font.white,
  ...theme.font.m,
} as BasicObject;
export const inputProps = {
  containerStyle: {
    paddingHorizontal: theme.paddingSize.m,
  },
  inputContainerStyle: {
    borderBottomWidth: 0,
  },
  inputStyle: globalStore.isWeb
    ? {...inputStyle, outline: 'none', caretColor: theme.basicColor.primary}
    : inputStyle,
  errorStyle: {
    margin: 0,
    height: 0,
  },
  selectionColor: theme.basicColor.primary,
  placeholderTextColor: theme.fontColor.secAccent,
};
