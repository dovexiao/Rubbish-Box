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
    backgroundColor: '#ffffff',
    borderRadius: px(12),
  },
  title: {
    marginBottom: px(8),
    fontWeight: '500',
    fontSize: fontSize(14),
    color: '#fd8e62',
    lineHeight: px(22),
  },
  content: {
    marginBottom: px(16),
    fontSize: fontSize(16),
    color: '#000000',
    lineHeight: px(22),
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: px(8),
  },
  cancelBtn: {
    flex: 1,
    height: px(42),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: px(12),
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  cancelBtnText: {
    fontSize: fontSize(14),
    color: '#999999',
    lineHeight: px(20),
  },
  confirmBtn: {
    flex: 1,
    height: px(42),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333333',
    borderRadius: px(12),
  },
  confirmBtnText: {
    fontWeight: '500',
    fontSize: fontSize(14),
    color: '#ffffff',
    lineHeight: px(20),
  },
});

export default styles;
