import { fontSize, px } from '@/utils/ui';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  messageRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: px(12),
  },
  card: {
    width: '100%',
    padding: px(12),
    backgroundColor: '#fbfbfb',
    borderRadius: px(12),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: px(12),
  },
  title: {
    flex: 1,
    minWidth: 0,
    fontWeight: '500',
    fontSize: fontSize(14),
    color: '#333333',
    lineHeight: px(22),
    marginRight: px(8),
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: px(4),
    flexShrink: 0,
  },
  linkText: {
    fontSize: fontSize(14),
    color: '#333333',
    lineHeight: px(20),
  },
  formCard: {
    padding: px(16),
    backgroundColor: '#ffffff',
    borderRadius: px(16),
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  img: {
    width: '100%',
    height: px(190),
  },
});

export default styles;
