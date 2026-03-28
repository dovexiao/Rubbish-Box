import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7FA',
    paddingHorizontal: 24,
  },
  item: {
    width: '100%',
    minHeight: 60,
    padding: 12,
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  borderActive: {
    borderWidth: 1,
    borderColor: '#333333',
  },
  lockName: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    lineHeight: 20,
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
    color: '#666666',
    marginTop: 16,
  },
});
