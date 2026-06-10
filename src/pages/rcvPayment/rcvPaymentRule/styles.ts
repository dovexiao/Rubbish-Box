import { fontSize, px } from '@/utils/ui';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f6f7fa',
    paddingHorizontal: px(16),
    paddingTop: px(14),
  },

  listContent: {
    paddingBottom: px(16),
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: px(12),
    minHeight: px(86),
    marginBottom: px(12),
    paddingHorizontal: px(16),
    paddingVertical: px(16),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  ruleName: {
    flex: 1,
    color: '#333333',
    fontSize: fontSize(16),
    fontWeight: '500',
    marginRight: px(16),
  },

  actionWrap: {
    // alignItems: 'flex-end',
  },

  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: px(8),
  },

  editText: {
    color: '#333333',
    fontSize: fontSize(14),
    fontWeight: '500',
    marginRight: px(2),
  },

  removeText: {
    color: '#CCCCCC',
    fontSize: fontSize(14),
  },

  emptyContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: px(150),
    color: '#666666',
    fontSize: fontSize(14),
  },
  footer: {
    paddingTop: px(12),
    backgroundColor: '#f6f7fa',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },

  'footer-btn': {
    width: px(196),
    height: px(48),
    borderRadius: px(16),
  },

  'footer-btn_text': {
    fontSize: fontSize(16),
    color: '#fff',
    fontWeight: '500',
  },

  removePopupSubTitle: {
    textAlign: 'center',
    color: '#333',
    fontWeight: '500',
    fontSize: fontSize(14),
  },
  removePopupDesc: {
    marginTop: px(14),
    textAlign: 'center',
    color: '#333333',
    fontSize: fontSize(16),
    fontWeight: '500',
    lineHeight: px(24),
    paddingHorizontal: px(8),
  },
});

export default styles;
