import React, {useMemo} from 'react';
import {Platform, TextStyle} from 'react-native';
import {Text as RNEText, TextProps as RNETextProps} from '@rneui/themed';
import theme from '@style';
import {BasicObject, Size} from '@types';
import {useResponsiveDimensions} from '@/utils';

const FONT_ANY_BODY = 'fontAnybody';
const FONT_INTER = 'fontInter';
const FONT_INTER_BOLD = 'fontInterBold';
const FONT_DIN = 'fontDin';
const FONT_DIN_MID = 'fontDinMid';
const FONT_DIN_BOLD = 'fontDinBold';
const FONT_DIN_BLACK = 'fontDinBlack';

export type FontFamily =
  | typeof FONT_DIN
  | typeof FONT_ANY_BODY
  | typeof FONT_INTER
  | typeof FONT_INTER_BOLD
  | typeof FONT_DIN_BOLD;

type InnerFontFamily =
  | typeof FONT_ANY_BODY
  | typeof FONT_INTER
  | typeof FONT_INTER_BOLD
  | typeof FONT_DIN
  | typeof FONT_DIN_MID
  | typeof FONT_DIN_BOLD
  | typeof FONT_DIN_BLACK;
export interface TextProps extends RNETextProps {
  /** 设计稿的DIN = fontDinBold，设计稿的DIN-BLA = fontDin，目前暂时DIN只使用fontDin，由于热更的原因 */
  fontFamily?: FontFamily;
  /** 优先级低于fontSize 'large': 16 | 'default': 12 | 'medium': 14 | 'small': 12 */
  size?: Size;
  /**
   * @deprecated 尽量不要使用
   * 是否粗体,传入true会设置字体为fontInterBold,如果同时指定了其他字体,会将字重设置为700
   */
  blod?: boolean;
  fontSize?: TextStyle['fontSize'];
  /**
   * @deprecated 尽量不要使用
   */
  fontWeight?: TextStyle['fontWeight'];
  /** 是否使用主题色,默认使用二级字体色 */
  primary?: boolean;
  /** 是否使用主字体色 */
  main?: boolean;
  /** 是否使用二级体色 */
  second?: boolean;
  /** 是否使用三级体色 */
  accent?: boolean;
  /** 是否使用四级体色 */
  secAccent?: boolean;
  /** 是否使用白色字体 */
  white?: boolean;
  /** 字间距,默认-0.3 */
  letterSpacing?: number;
  textAlign?: 'left' | 'right' | 'center';
  color?: TextStyle['color'] | null;
  /** 是否需要根据宽度比例缩放,慎用! */
  calc?: boolean;
}
const Text: React.FC<TextProps> = props => {
  const {width} = useResponsiveDimensions();
  const {
    style,
    fontSize,
    size = 'small',
    fontWeight = 'normal',
    fontFamily,
    color,
    blod,
    primary = false,
    main = false,
    second = false,
    accent = false,
    secAccent = false,
    white = false,
    letterSpacing = -0.3,
    textAlign = 'left',
    calc = false,
    ...otherProps
  } = props;
  let _fontSize: number;
  if (fontSize) {
    _fontSize = fontSize;
  } else {
    switch (size) {
      case 'large':
        _fontSize = theme.fontSize.l;
        break;
      case 'medium':
        _fontSize = theme.fontSize.m;
        break;
      case 'default':
      case 'small':
        _fontSize = theme.fontSize.s;
        break;
      default:
        _fontSize = size;
    }
  }
  const resultFontFamily: InnerFontFamily = useMemo(() => {
    let fw = blod ? '700' : fontWeight;
    let _fontFamily = fontFamily || FONT_INTER;
    if (_fontFamily === FONT_ANY_BODY) {
      return _fontFamily;
    }
    if (_fontFamily === FONT_INTER || _fontFamily === FONT_INTER_BOLD) {
      fw = _fontFamily === FONT_INTER_BOLD ? '700' : fw;
      return fw === '700' || fw === 'bold' ? FONT_INTER_BOLD : FONT_INTER;
    }
    fw = _fontFamily === FONT_DIN_BOLD ? '700' : fw;

    if (fw === '500') {
      return FONT_DIN_MID;
    }
    if (['700', '600', 'bold'].includes(fw)) {
      return FONT_DIN_BOLD;
    }
    if (['800', '900'].includes(fw)) {
      return FONT_DIN_BLACK;
    }
    return FONT_DIN;
  }, [fontWeight, blod, fontFamily]);

  if (calc) {
    _fontSize = (_fontSize * width) / 375;
  }
  const midStyle: TextStyle & BasicObject = {
    fontSize: _fontSize,
    fontWeight: 'normal',
    letterSpacing,
    textAlign,
    color:
      color ||
      (primary
        ? theme.fontColor.primary
        : main
        ? theme.fontColor.main
        : second
        ? theme.fontColor.second
        : accent
        ? theme.fontColor.accent
        : secAccent
        ? theme.fontColor.secAccent
        : white
        ? theme.fontColor.white
        : theme.fontColor.second),
  };
  if (_fontSize! < 12 && Platform.OS === 'web') {
    midStyle.fontSize = 12;
    midStyle.zoom = _fontSize! / 12;
  }
  return (
    <RNEText
      style={[midStyle, theme.font[resultFontFamily], style]}
      {...otherProps}
    />
  );
};

export default Text;
