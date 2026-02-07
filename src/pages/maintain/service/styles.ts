import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7FA',
    paddingHorizontal: 16,
  },
  serviceItem: {
    width: '100%',
    marginTop: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  itemTopBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 20,
  },
  itemTopText: {
    flex: 1,
    fontSize: 12,
    color: '#999999',
    lineHeight: 17,
  },
  diviler: {
    width: '100%',
    height: 1,
    marginVertical: 12,
    backgroundColor: 'rgba(51,51,51,0.1)',
  },
  text: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    lineHeight: 20,
  },
  rightText: {
    flex: 1,
    fontWeight: 'normal',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyImage: {
    width: 120,
    height: 120,
  },
  emptyText: {
    fontSize: 14,
    color: '#999999',
    marginTop: 16,
  },
});
