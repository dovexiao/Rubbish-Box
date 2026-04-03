import { px, fontSize } from '@/utils/ui';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  iconWrapper: {
    marginTop: px(115),
    gap: px(12),
    alignItems: 'center',
  },
  iconText: {
    fontSize: fontSize(20),
    color: '#333333',
    lineHeight: px(27),
    fontWeight: '700',
  },
  btnWrapper: {
    marginTop: px(120),
    alignItems: 'center',
  },
  tips: {
    marginBottom: px(16),
    fontSize: fontSize(16),
    color: '#999999',
    lineHeight: px(22),
  },
  btnText: {
    fontWeight: '700',
    fontSize: fontSize(16),
    color: '#ffffff',
    lineHeight: px(22),
  },
});
