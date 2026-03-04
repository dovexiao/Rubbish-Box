import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7F9',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
    lineHeight: 22,
    marginTop: 12,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  label: {
    width: 110,
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
    marginRight: 12,
  },
  value: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
    textAlign: 'right',
  },
  serviceText: {
    fontSize: 14,
    color: '#999999',
    lineHeight: 20,
    marginBottom: 12,
  },
  operationContainer: {
    backgroundColor: '#F7F7FB',
    borderRadius: 12,
    padding: 12,
  },
  operationItemText: {
    fontSize: 12,
    color: '#333333',
    lineHeight: 18,
    marginBottom: 6,
  },
  footerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#F6F7F9',
  },
  footerBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
