/* eslint-disable prettier/prettier */
import theme from '@style';
import {StyleSheet} from 'react-native';
// const drawImageWrapPadding = 17;
export const drawImageWrapWidth = 219;
export const drawImageWrapHeight = 230;
const drawImageWidth = 188;
const drawImageHeight = 188;
export const needleWidth = 74;
export const needleHeight = 74;
export const ITEM_HEIGHT = 25;
export const titleIcon = require('@assets/imgs/luckyspin/title.webp');
export const spinWrapIcon = require('@assets/imgs/luckyspin/spin-wrap.webp');
export const turntableIcon = require('@assets/imgs/luckyspin/turntable.webp');

export const needleIcon = require('@assets/imgs/luckyspin/needle.webp');
export const copperIcon = require('@assets/imgs/luckyspin/copper.webp');
export const pillarIcon = require('@assets/imgs/luckyspin/pillar.webp');
export const footerIcon = require('@assets/imgs/luckyspin/footer.webp');

export const resultIcon = require('@assets/imgs/luckyspin/result.webp');
export const moneyIcon = require('@assets/imgs/luckyspin/money.webp');
export const buttonGoldenIcon = require('@assets/imgs/luckyspin/button-golden.webp');
export const buttonGreenIcon = require('@assets/imgs/luckyspin/button-green.webp');
export const vipIcon = require('@assets/imgs/luckyspin/vip.webp');

export const closeIcon = require('@assets/imgs/luckyspin/button-close.png');
export const rotateAudio = require('@assets/imgs/luckyspin/rotate.mp3');
export const openAudio = require('@assets/imgs/luckyspin/open.mp3');
export const styles = StyleSheet.create({
  closeButton: {
    top: -20,
    right: -20,
  },
  drawImageWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    marginTop: -30,
    zIndex: 10,
  },
  drawImage: {
    width: drawImageWidth,
    height: drawImageHeight,
    zIndex: 11,
  },
  needle: {
    top: (drawImageWrapHeight + 10 - needleWidth) / 2,
    left: (drawImageWrapWidth - needleWidth) / 2,
    zIndex: 12,
  },
  copper: {
    bottom: -10,
    left: (drawImageWrapWidth - 135) / 2,
    zIndex: 11,
  },
  pillar: {
    width: 183,
    height: 65,
    bottom: 0,
    left: (drawImageWrapWidth - 183) / 2,
    zIndex: 9,
  },
  footer: {
    zIndex: 1,
    marginTop: -12,
    paddingTop: 34,
    alignItems: 'center',
  },
  result: {
    marginTop: 8,
    paddingTop: 12,
  },
  tabWrap: {
    borderRadius: theme.borderRadiusSize.xs,
  },
  tabActive: {
    borderRadius: theme.borderRadiusSize.xs,
  },
  nonepadding: {
    paddingVertical: 0,
  },
  tabActiveText: {
    color: theme.fontColor.primary,
    paddingHorizontal: 0,
  },
  tabNotActiveText: {
    color: theme.fontColor.primaryMain,
    paddingHorizontal: 0,
  },
  resultList: {
    height: 100,
    marginHorizontal: theme.paddingSize.xl,
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: 'auto',
  },
  resultItem: {
    height: ITEM_HEIGHT,
  },
  buy: {
    // color: '#43cf7c',
  },
  won: {
    color: '#C90D4A',
  },
  desc: {
    position: 'relative',
    top: -4,
  },
});
