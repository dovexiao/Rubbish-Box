import { StyleSheet } from 'react-native';
import { fontSize, px } from '@/utils/ui';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: px(16),
    backgroundColor: '#f5f7fb',
  },
  bannerBox: {
    width: '100%',
    height: px(170),
    overflow: 'hidden',
    borderRadius: px(12),
  },
  lockImgBox: {
    width: px(274),
    height: px(160),
    marginVertical: px(24),
    position: 'relative',
  },
  lockImg: {
    width: px(274),
    height: px(160),
  },
  optContent: {
    width: '100%',
    height: px(326),
    borderRadius: px(12),
    backgroundColor: '#fff',
  },
  optBtn: {
    width: px(100),
    height: px(100),
    borderRadius: px(50),
    backgroundColor: '#f2f2f2',
  },
  'optBtn--disable': {
    width: px(100),
    height: px(100),
    borderRadius: px(50),
    backgroundColor: '#f2f2f2',
  },
  btnText: {
    fontSize: fontSize(16),
    marginTop: px(6),
    color: '#333',
    fontWeight: 'bold',
  },
  'btnText--disable': {
    fontSize: fontSize(16),
    marginTop: px(6),
    color: '#cccccc',
    fontWeight: 'bold',
  },
  lockNumBox: {
    position: 'absolute',
    top: px(5),
    right: px(29),
  },
  lockNumText: {
    color: '#333',
    fontSize: fontSize(16),
    fontWeight: 'bold',
    lineHeight: fontSize(30),
    marginRight: px(3),
  },
  lockNumText2: {
    color: '#333',
    fontSize: fontSize(32),
    fontWeight: 'bold',
  },
  applyBtn: {
    marginTop: px(60),
    paddingHorizontal: px(14),
    paddingVertical: px(12),
    borderRadius: px(16),
    border: '2px solid #999',
  },
  applyBtnText: {
    fontSize: fontSize(16),
    color: '#333',
    fontWeight: 'bold',
    marginRight: px(4),
  },
  botText: {
    color: '#333',
    fontSize: fontSize(12),
    fontWeight: 'bold',
  },
  tips: {
    color: '#ff873d',
    fontSize: fontSize(16),
    fontWeight: 'bold',
    marginTop: px(72),
  },
  tips2: {
    color: '#333333',
    fontSize: fontSize(16),
    fontWeight: 'bold',
    marginTop: px(72),
  },
  tips3: {
    color: '#333333',
    fontSize: fontSize(16),
    fontWeight: 'bold',
    marginTop: px(0),
  },
  popTitle: {
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: px(8),
    fontSize: fontSize(16),
  },
  popText: {
    color: '#333',
    fontSize: fontSize(12),
  },
});

export default styles;
