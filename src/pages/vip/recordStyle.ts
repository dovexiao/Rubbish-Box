import { fontSize, px } from '@/utils/ui';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    paddingLeft: px(16),
    paddingRight: px(16),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: '#f6f7fa',
  },

  card: {
    width: '100%',
    height: px(96),
    marginTop: px(12),
    paddingLeft: px(16),
    paddingRight: px(16),
    paddingTop: px(16),
    paddingBottom: px(16),
    backgroundColor: '#ffffff',
    borderRadius: px(12),
  },

  itemLine: {
    width: '100%',
    height: 0,
    marginTop: px(12),
    marginBottom: px(12),
    borderWidth: px(0.5),
    borderStyle: 'solid',
    borderColor: 'rgba(179, 189, 199, 0.2)',
    // borderColor: '#e2e2e2',
  },

  infoText: {
    height: px(20),
    fontWeight: 'normal',
    fontSize: fontSize(14),
    color: '#333333',
    lineHeight: px(20),
    textAlign: 'left',
  },

  mr8: {
    marginRight: px(4),
  },

  timeText: {
    height: px(17),
    fontWeight: 'normal',
    fontSize: fontSize(12),
    color: '#999999',
    lineHeight: px(17),
    textAlign: 'left',
  },

  num: {
    width: '100%',
    height: px(54),
    padding: px(16),
    position: 'relative',
  },

  popTitleText: {
    height: px(22),
    fontWeight: 'bold',
    fontSize: fontSize(16),
    color: '#333333',
    lineHeight: px(22),
    textAlign: 'center',
  },

  popText: {
    height: px(20),
    fontWeight: 'bold',
    fontSize: fontSize(14),
    color: '#333333',
    lineHeight: px(20),
    textAlign: 'left',
  },

  cancalBtn: {
    width: px(156),
    height: px(48),
    borderRadius: px(12),
    borderWidth: px(1),
    borderStyle: 'solid',
    borderColor: 'rgba(0, 0, 0, 0.1)',
    fontWeight: 'normal',
    fontSize: fontSize(16),
    color: '#999999',
    textAlign: 'center',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },

  confirmBtn: {
    width: px(156),
    height: px(48),
    marginLeft: px(15),
    borderRadius: px(12),
    fontWeight: 'bold',
    lineHeight: px(48),
    fontSize: fontSize(16),
    color: '#ffffff',
    textAlign: 'center',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },

  bgColor333: {
    backgroundColor: '#333333',
  },

  popup: {
    paddingLeft: px(24),
    paddingRight: px(24),
  },

  fixBox: {
    width: px(92),
    height: px(88),
    backgroundColor: '#ffffff',
    shadowColor: 'rgba(0, 0, 0, 0.12)',
    shadowOffset: { width: 0, height: px(2) },
    shadowRadius: px(6),
    shadowOpacity: 1,
    elevation: px(4),
    borderRadius: px(12),
    paddingLeft: px(12),
    paddingRight: px(12),
    position: 'absolute',
    top: px(47),
    left: px(16),
    zIndex: 9999999999,
  },

  fixBoxLine: {
    width: '100%',
    height: 0,
    borderWidth: px(0.5),
    borderStyle: 'solid',
    borderColor: '#e5e5e5',
  },

  fixBtn: {
    width: '100%',
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  color333: {
    color: '#333333',
  },

  redColor: {
    color: '#eb2a2a',
  },

  contentBox: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
    height: px(339),
    marginLeft: px(24),
    marginRight: px(24),
    paddingTop: px(16),
    paddingBottom: px(16),
    backgroundColor: '#f7f7fb',
    borderRadius: px(12),
  },

  contentBoxShare: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: px(327),
    height: px(339),
    marginLeft: px(24),
    marginRight: px(24),
    marginTop: px(5),
    paddingTop: px(16),
    paddingBottom: px(16),
    backgroundColor: '#f7f7fb',
    borderRadius: px(12),
  },

  rowText1: {
    height: px(20),
    fontWeight: 'bold',
    fontSize: fontSize(14),
    color: '#333333',
    lineHeight: px(20),
    textAlign: 'left',
  },

  tagBox: {
    height: px(20),
    fontWeight: 'normal',
    fontSize: fontSize(14),
    lineHeight: px(20),
    textAlign: 'center',
  },

  color1: {
    color: '#ff873d',
  },

  color2: {
    color: '#37c22a',
  },

  color10: {
    color: '#999999',
  },

  color20: {
    color: '#e5140d',
  },

  inviteCode: {
    height: px(50),
    fontWeight: 'bold',
    fontSize: fontSize(36),
    color: '#333333',
    lineHeight: px(50),
    textAlign: 'left',
  },

  timeBox: {
    width: px(307),
    height: px(77),
    padding: px(14),
    borderRadius: px(12),
    borderWidth: px(0.5),
    borderStyle: 'solid',
    borderColor: '#ebebeb',
  },

  popTime: {
    width: px(279),
    height: px(20),
    fontWeight: 'normal',
    fontSize: fontSize(14),
    color: '#333333',
    lineHeight: px(20),
    textAlign: 'left',
  },

  dateText: {
    height: px(20),
    fontWeight: 'normal',
    fontSize: fontSize(14),
    color: '#333333',
    lineHeight: px(20),
    textAlign: 'left',
  },

  dateTime: {
    height: px(25),
    fontWeight: 'normal',
    fontSize: fontSize(18),
    color: '#333333',
    lineHeight: px(25),
    textAlign: 'left',
  },

  shareBtn: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: px(20),
    paddingRight: px(20),
    margin: 0,
    color: '#ffffff',
  },

  pl48: {
    paddingLeft: px(24),
  },

  pr32: {
    paddingRight: px(16),
  },

  mr12: {
    marginRight: px(6),
  },

  mb8: {
    marginBottom: px(4),
  },

  mt16: {
    marginTop: px(8),
  },

  mt24: {
    marginTop: px(12),
  },
});
