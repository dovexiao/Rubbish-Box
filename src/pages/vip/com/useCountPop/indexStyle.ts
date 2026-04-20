import { fontSize, px } from '@/utils/ui';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  num: {
    width: '100%',
    height: px(22),
    fontWeight: 'bold',
    fontSize: fontSize(16),
    color: '#333333',
    lineHeight: px(22),
    textAlign: 'center',
  },

  numRN: {
    width: '100%',
    height: px(22),
    fontWeight: 'bold',
    marginTop: px(16),
    marginBottom: px(16),
    fontSize: fontSize(16),
    color: '#333333',
    lineHeight: px(22),
    textAlign: 'center',
  },

  popTitleText: {
    height: px(22),
    fontWeight: 'bold',
    fontSize: fontSize(16),
    color: '#333333',
    lineHeight: px(22),
    textAlign: 'center',
  },

  useageCountTitle: {
    width: '100%',
  },

  text: {
    height: px(20),
    fontWeight: '400',
    fontSize: fontSize(14),
    color: '#333333',
    lineHeight: px(20),
    textAlign: 'left',
  },

  chooseItem: {
    height: px(22),
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: 'bold',
    fontSize: fontSize(16),
    color: '#333333',
  },

  cancalBtn: {
    width: px(156),
    height: px(48),
    borderRadius: px(12),
    borderWidth: px(1),
    borderStyle: 'solid',
    borderColor: 'rgba(0, 0, 0, 0.1)',
    fontWeight: '400',
    fontSize: fontSize(16),
    color: '#999999',
    textAlign: 'center',
  },

  confirmBtn: {
    width: px(156),
    height: px(48),
    marginLeft: px(15),
    borderRadius: px(12),
  },

  bgColor333: {
    backgroundColor: '#333333',
  },

  bgColor999: {
    backgroundColor: '#999999',
  },

  confirmBtnText: {
    fontWeight: 'bold',
    fontSize: fontSize(16),
    color: '#ffffff',
    textAlign: 'center',
  },

  usageCountInput: {
    width: px(327),
    height: px(44),
    marginTop: px(60),
    paddingRight: px(12),
    borderRadius: px(8),
    borderColor: 'rgba(0, 0, 0, 0.05)',
    borderWidth: px(1),
    borderStyle: 'solid',
  },
});
