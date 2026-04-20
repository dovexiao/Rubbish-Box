import { fontSize, px } from '@/utils/ui';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    paddingVertical: px(4),
    paddingHorizontal: px(4),
    borderRadius: px(7),
  },
  text: {
    fontSize: fontSize(12),
    fontWeight: '400',
  },
  ml10: {
    marginLeft: px(10),
  },
});
