import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  emptyImage: {
    width: 120,
  },
  listWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  card: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 15,
    marginBottom: 12,
    borderRadius: 12,
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
    width: 60,
    height: 30,
    marginRight: 12,
  },
  textArea: {},
  title: {
    fontSize: 14,
    color: '#333333',
  },
  time: {
    marginTop: 8,
    fontSize: 12,
    color: '#999999',
  },
  statusText: {
    flex: 1,
    fontSize: 12,
    color: '#333333',
    textAlign: 'right',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#666666',
    },
  qrCodeContent: {
    marginHorizontal: 40,
    marginVertical: 24,
    height: 176,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCodeImage: {
    width: 120,
    height: 120,
  },
  qrCodeContentText: {
    fontSize: 14,
    color: '#333333',
    marginTop: 12,
    textAlign: 'center',
  },
});

export default styles;
