import { StyleSheet } from 'react-native';
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  containerScrollView: {
    paddingHorizontal: 16,
  },
  date: {
    marginLeft: 8,
    marginTop: 12,
    marginBottom: 4,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  card: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 16,
    backgroundColor: '#F7F7FB',
    gap: 12,
  },

  left: {
    flex: 1,
    fontSize: 14,
    marginRight: 12,
    fontWeight: '400',
    color: '#333',
  },
  right: { fontSize: 12, color: '#999' },
});
