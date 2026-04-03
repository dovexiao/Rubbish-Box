import { px, fontSize } from '@/utils/ui';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  tag: {
    paddingVertical: px(5),
    paddingHorizontal: px(10),
    borderRadius: px(12),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F7FB',
  },
  text: {
    fontSize: fontSize(12),
    color: '#666666',
    lineHeight: px(16),
  },
});

export default styles;
