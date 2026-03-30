import { StyleSheet } from 'react-native';
export const styles = StyleSheet.create({
  deviceItem: {
    padding: 12,
    borderRadius: 8,
    width: '100%',
  },
  defaultBgColor: {
    backgroundColor: '#F5F7FA',
  },
  deviceItemActive: {
    // backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#333',
  },
  mt24: {
    marginTop: 12,
  },
  deviceNameText: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
    maxWidth: 260,
  },
  tagContainer: {
    marginLeft: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
    backgroundColor: '#E6E8EB',
    borderRadius: 4,
  },
  tag: {
    fontSize: 10,
    color: '#666',
  },
  editText: {
    fontSize: 12,
    color: '#999',
    marginRight: 4,
  },
  deviceTypeText: {
    fontSize: 12,
    color: '#999',
  },
  deviceCountText: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
});
