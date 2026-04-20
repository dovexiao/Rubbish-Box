import { px, fontSize } from '@/utils/ui';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: px(16),
    paddingTop: px(12),
    paddingBottom: px(16),
  },
  itemTime: {
    fontSize: fontSize(14),
    fontWeight: '700',
    color: '#333333',
    lineHeight: px(20),
    marginTop: px(12),
    marginBottom: px(8),
  },
  itemContent: {
    width: '100%',
    backgroundColor: '#F7F7FB',
    borderRadius: px(12),
    paddingHorizontal: px(12),
    paddingVertical: px(16),
    marginBottom: px(12),
    position: 'relative',
  },
  itemHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemName: {
    flex: 1,
    fontSize: fontSize(14),
    fontWeight: '700',
    color: '#333333',
    lineHeight: px(20),
    marginRight: px(8),
  },
  divider: {
    height: px(1),
    backgroundColor: 'rgba(51,51,51,0.1)',
    marginTop: px(12),
    marginBottom: px(12),
  },
  messageBody: {
    flexDirection: 'column',
  },
  messageMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageType: {
    flex: 1,
    marginLeft: px(4),
    marginRight: px(8),
    fontSize: fontSize(14),
    fontWeight: '700',
    color: '#333333',
    lineHeight: px(20),
  },
  messageTime: {
    fontSize: fontSize(12),
    color: '#999999',
    lineHeight: px(16),
  },
  bottomContent: {
    marginTop: px(6),
    marginLeft: px(24),
    fontSize: fontSize(14),
    color: '#999999',
    lineHeight: px(20),
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: px(10),
    height: px(10),
    backgroundColor: '#FF2B24',
    borderRadius: px(10),
  },
  footerLoading: {
    paddingVertical: px(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerSpace: {
    height: px(16),
  },
});
