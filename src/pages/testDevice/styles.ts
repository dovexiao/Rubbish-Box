import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  searchWrapper: {
    borderRadius: 12,
    marginBottom: 10,
  },
  searchBar: {
    borderRadius: 12,
    height: 44,
  },
  listWrapper: {
    paddingBottom: 24,
  },
  lockContentWrapper: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    backgroundColor: '#F7F7F7',
    paddingVertical: 12,
    marginBottom: 12,
  },
  normalText: {
    color: '#999999',
    fontSize: 14,
  },
  failText: {
    color: '#E86B6E',
    fontSize: 14,
  },
  qualifiedText: {
    color: '#70B601',
    fontSize: 14,
  },
  snText: {
    fontSize: 14,
    color: '#333333',
    marginLeft: 12,
  },
});

export default styles;
