import { StyleSheet } from 'react-native';
import { fontSize, px } from '@/utils/ui';

export default StyleSheet.create({
  swiperBox: {
    width: '100%',
    marginTop: px(12),
    borderRadius: px(12),
    overflow: 'hidden',
  },
  swiperItem: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: px(12),
    backgroundColor: '#fff',
  },
  dotWrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: px(8),
    marginBottom: px(8),
  },
  dot: {
    width: px(6),
    height: px(6),
    borderRadius: px(3),
    marginHorizontal: px(6),
  },
  bannerTextBox: {
    padding: px(15),
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adText: {
    fontSize: fontSize(16),
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
  },
  videoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
