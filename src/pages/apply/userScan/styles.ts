import { pad } from 'crypto-js';
import { StyleSheet } from 'react-native';
import { fontSize, px } from '@/utils/ui';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    paddingHorizontal: px(16),
    backgroundColor: '#f6f7fa',
  },
  bannerBox: {
    marginTop: px(12),
    width: '100%',
    height: px(170),
    overflow: 'hidden',
    borderRadius: px(12),
  },
});

export default styles;
