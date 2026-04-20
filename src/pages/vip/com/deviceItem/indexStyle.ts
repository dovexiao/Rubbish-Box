import { px, fontSize } from '@/utils/ui';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  deviceItem: {
    width: '100%',
    borderRadius: px(12),
    backgroundColor: '#ffffff',
  },

  mt6: {
    marginTop: px(3),
  },

  deviceItemBox: {
    width: '100%',
    height: px(84),
    paddingTop: px(18),
    paddingBottom: px(18),
    paddingRight: px(16),
    paddingLeft: px(16),
  },

  deviceItemLine: {
    width: px(295),
    height: 0,
    borderStyle: 'solid',
    borderWidth: px(0.5),
    // borderColor: 'rgba(0, 0, 0, 0.1)',
    borderColor: 'rgba(179, 189, 199, 0.2)',
  },

  deviceNameText: {
    height: px(20),
    fontWeight: '400',
    fontSize: fontSize(14),
    color: '#333333',
    lineHeight: px(20),
    textAlign: 'left',
  },

  deviceType: {
    marginRight: px(16),
    width: px(40),
    height: '100%',
  },

  deviceTypeText: {
    height: px(14),
    fontWeight: '700',
    fontSize: fontSize(10),
    color: '#333333',
    lineHeight: px(14),
    textAlign: 'left',
  },

  deviceUnitText: {
    height: px(14),
    fontWeight: '700',
    fontSize: fontSize(10),
    color: '#333333',
    lineHeight: px(14),
    textAlign: 'left',
  },

  deviceCountText: {
    height: px(14),
    fontWeight: '700',
    fontSize: fontSize(10),
    color: '#333333',
    lineHeight: px(14),
    textAlign: 'left',
  },

  tag: {
    height: px(21),
    backgroundColor: 'rgba(255, 135, 61, 0.1)',
    borderRadius: px(7),
    paddingLeft: px(6),
    paddingRight: px(6),
    paddingTop: px(2),
    paddingBottom: px(2),
    marginLeft: px(8),
  },

  tagText: {
    height: px(17),
    fontWeight: '400',
    fontSize: fontSize(12),
    color: '#ff873d',
    lineHeight: px(17),
    textAlign: 'left',
  },

  addressText: {
    marginLeft: px(2),
    fontWeight: '400',
    fontSize: fontSize(10),
    color: '#cccccc',
    lineHeight: px(14),
    textAlign: 'left',
  },

  mt18: {
    marginTop: px(9),
  },
});
