import { fontSize, px } from '@/utils/ui';
import { StyleSheet } from 'react-native';
export const styles = StyleSheet.create({
  deviceItem: {
    padding: px(12),
    borderRadius: px(8),
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
    marginTop: px(12),
  },
  deviceNameText: {
    fontSize: fontSize(16),
    color: '#333',
    fontWeight: 'bold',
    maxWidth: px(260),
  },
  tagContainer: {
    marginLeft: px(6),
    paddingHorizontal: px(4),
    paddingVertical: px(2),
    backgroundColor: '#E6E8EB',
    borderRadius: px(4),
  },
  tag: {
    fontSize: fontSize(10),
    color: '#666',
  },
  editText: {
    fontSize: fontSize(12),
    color: '#999',
    marginRight: px(4),
  },
  deviceTypeText: {
    fontSize: fontSize(12),
    color: '#999',
  },
  deviceCountText: {
    fontSize: fontSize(16),
    color: '#333',
    fontWeight: 'bold',
  },
});
