import { fontSize, px } from '@/utils/ui';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  emptyImage: {
    width: px(120),
  },
  listWrapper: {
    paddingHorizontal: px(16),
    paddingVertical: px(12),
  },
  card: {
    width: '100%',
    paddingHorizontal: px(16),
    paddingVertical: px(15),
    marginBottom: px(12),
    borderRadius: px(12),
    backgroundColor: '#F7F7FB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftArea: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceImg: {
    width: px(60),
    height: px(30),
    marginRight: px(12),
  },
  textArea: {},
  title: {
    fontSize: fontSize(14),
    color: '#333333',
  },
  time: {
    marginTop: px(8),
    fontSize: fontSize(12),
    color: '#999999',
  },
  statusText: {
    flex: 1,
    fontSize: fontSize(12),
    color: '#333333',
    textAlign: 'right',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: px(40),
  },
  emptyText: {
    fontSize: fontSize(14),
    color: '#666666',
  },
  qrCodeContent: {
    marginHorizontal: px(40),
    marginVertical: px(24),
    height: px(176),
    borderRadius: px(16),
    borderWidth: px(1),
    borderColor: '#EAEAEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCodeImage: {
    width: px(120),
    height: px(120),
  },
  qrCodeContentText: {
    fontSize: fontSize(14),
    color: '#333333',
    marginTop: px(12),
    textAlign: 'center',
  },
});

export default styles;
