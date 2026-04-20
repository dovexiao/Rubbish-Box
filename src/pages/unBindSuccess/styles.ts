import { px, fontSize } from '@/utils/ui';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingHorizontal: px(24),
  },
  gifWrap: {
    width: '100%',
    alignItems: 'center',
  },
  gif: {
    width: '50%',
    aspectRatio: 1,
    resizeMode: 'contain',
  },
  textContainer: {
    width: '100%',
    marginTop: px(24),
  },
  card: {
    width: '100%',
    paddingVertical: px(16),
    paddingHorizontal: px(12),
    backgroundColor: '#F7F7FB',
    borderRadius: px(12),
  },
  textTitle: {
    fontSize: fontSize(16),
    fontWeight: 'bold',
    color: '#333333',
    lineHeight: px(22),
    marginBottom: px(12),
  },
  text: {
    fontSize: fontSize(14),
    color: '#333333',
    lineHeight: px(20),
    marginBottom: px(8),
  },
  btn: {
    marginTop: px(24),
    borderRadius: px(16),
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    fontSize: fontSize(14),
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default styles;
