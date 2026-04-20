import { px, fontSize } from '@/utils/ui';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    paddingHorizontal: px(24),
    paddingTop: px(16),
    paddingBottom: px(40),
    flex: 1,
  },
  toastText: {
    fontSize: fontSize(12),
    fontWeight: 'bold',
    color: '#999999',
    lineHeight: px(17),
  },
  marginSetting: {
    marginTop: px(24),
    marginBottom: px(12),
  },
  infoItem: {
    marginTop: px(12),
    minHeight: px(32),
  },
  descriptInfo: {
    marginTop: px(12),
    minHeight: px(32),
    width: '100%',
    gap: px(20),
  },
  infoItemText: {
    fontSize: fontSize(14),
    fontWeight: 'bold',
    color: '#333333',
  },
  infoItemTextRight: {
    flex: 1,
    textAlign: 'right',
    fontSize: fontSize(14),
    color: '#333333',
    lineHeight: px(20),
  },
  descriptionText: {
    textAlign: 'right',
    fontSize: fontSize(14),
    color: '#333333',
    lineHeight: px(20),
    flex: 1,
  },
  circle: {
    width: px(16),
    height: px(16),
    backgroundColor: '#E5E5E5',
    borderRadius: px(16),
    position: 'relative',
  },
  blackColor: {
    backgroundColor: '#333333',
  },
  line: {
    position: 'absolute',
    left: px(7),
    top: px(20),
    width: px(2),
    height: px(40),
    backgroundColor: '#E5E5E5',
  },
  pedding: {
    flex: 1,
    marginLeft: px(16),
  },
  time: {
    fontSize: fontSize(12),
    color: '#333333',
    marginTop: px(4),
  },
});
