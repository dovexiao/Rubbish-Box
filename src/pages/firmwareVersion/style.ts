import { StyleSheet } from 'react-native';
export const styles = StyleSheet.create({
  titleRight: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#F7F7FB',
  },
  titleText: {
    fontSize: 12,
    color: '#333333',
    fontWeight: '500',
  },
  body: {
    borderBlockColor: '#f12345',
    flex: 1,
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  versionText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#111111',
    marginTop: 8,
  },
  versionBottom: {
    fontSize: 14,
    color: '#999999',
    marginTop: 6,
    marginBottom: 24,
  },
  card: {
    width: '100%',
    backgroundColor: '#F7F7FB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 10,
  },
  cardText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
});
