import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  itemTime: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333333',
    lineHeight: 20,
    marginTop: 12,
    marginBottom: 8,
  },
  itemContent: {
    width: '100%',
    backgroundColor: '#F7F7FB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 16,
    marginBottom: 12,
    position: 'relative',
  },
  itemHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#333333',
    lineHeight: 20,
    marginRight: 8,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(51,51,51,0.1)',
    marginTop: 12,
    marginBottom: 12,
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
    marginLeft: 4,
    marginRight: 8,
    fontSize: 14,
    fontWeight: '700',
    color: '#333333',
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 12,
    color: '#999999',
    lineHeight: 16,
  },
  bottomContent: {
    marginTop: 6,
    marginLeft: 24,
    fontSize: 14,
    color: '#999999',
    lineHeight: 20,
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    backgroundColor: '#FF2B24',
    borderRadius: 10,
  },
  footerLoading: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerSpace: {
    height: 16,
  },
});
