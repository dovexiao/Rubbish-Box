/* eslint-disable prettier/prettier */
import theme from '@style';
import {StyleSheet} from 'react-native';
const drawImageWrapPadding = 17;
export const drawImageWrapWidth = 219;
export const drawImageWrapHeight = 230;
const drawImageWidth = 236;
const drawImageHeight = 236;
// const drawImageWidth = 188;
// const drawImageHeight = 188;
export const needleWidth = 44;
export const needleHeight = 60;
export const ITEM_HEIGHT = 25;
export const titleIcon = require('@assets/imgs/luckyspin/title.png');
export const spinWrapIcon = require('@assets/imgs/luckyspin/spin-wrap.png');
export const turntableIcon = require('@assets/imgs/luckyspin/turntable.webp');

export const needleIcon = require('@assets/imgs/luckyspin/needle.png');
export const copperIcon = require('@assets/imgs/luckyspin/copper.png');
export const pillarIcon = require('@assets/imgs/luckyspin/pillar.webp');
export const footerIcon = require('@assets/imgs/luckyspin/footer.webp');

export const resultIcon = require('@assets/imgs/luckyspin/result.png');
export const moneyIcon = require('@assets/imgs/luckyspin/money.webp');
export const buttonGoldenIcon = require('@assets/imgs/luckyspin/button-golden.png');
export const buttonGreenIcon = require('@assets/imgs/luckyspin/button-green.png');
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
    marginTop: 0,
    zIndex: 10,
  },
  drawImage: {
    width: drawImageWidth,
    height: drawImageHeight,
    zIndex: 11,
  },
  needle: {
    left: (drawImageWrapWidth - needleWidth) / 2,
    top: drawImageHeight / 2 - 50 + drawImageWrapPadding,
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
    backgroundColor: '#521a1b',
    borderRadius: theme.borderRadiusSize.xs,
  },
  tabActive: {
    backgroundColor: '#e67053',
    borderRadius: theme.borderRadiusSize.xs,
  },
  nonepadding: {
    paddingVertical: 0,
  },
  tabActiveText: {
    color: theme.fontColor.white,
    paddingHorizontal: 0,
  },
  tabNotActiveText: {
    color: '#e05a5e',
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
