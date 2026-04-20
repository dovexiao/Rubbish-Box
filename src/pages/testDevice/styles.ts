import { fontSize, px } from '@/utils/ui';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: px(12),
    paddingHorizontal: px(16),
    backgroundColor: '#FFFFFF',
  },
  searchWrapper: {
    borderRadius: px(12),
    marginBottom: px(10),
  },
  searchBar: {
    borderRadius: px(12),
    height: px(44),
  },
  listWrapper: {
    paddingBottom: px(24),
  },
  lockContentWrapper: {
    width: '100%',
    borderRadius: px(12),
    borderWidth: px(1),
    borderColor: 'rgba(0,0,0,0.1)',
    backgroundColor: '#F7F7F7',
    paddingVertical: px(12),
    marginBottom: px(12),
  },
  normalText: {
    color: '#999999',
    fontSize: fontSize(14),
  },
  failText: {
    color: '#E86B6E',
    fontSize: fontSize(14),
  },
  qualifiedText: {
    color: '#70B601',
    fontSize: fontSize(14),
  },
  snText: {
    fontSize: fontSize(14),
    color: '#333333',
    marginLeft: px(12),
  },
});

export default styles;
