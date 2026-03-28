import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#333333',
    fontWeight: 'bold',
    lineHeight: 20,
  },
  fieldInput: {
    flex: 1,
    marginLeft: 16,
    fontSize: 14,
    color: '#333333',
    paddingVertical: 0,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 6,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '600',
  },
  lockListContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 80,
  },
  lockItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  lockInfo: {
    flexDirection: 'column',
    flex: 1,
    marginRight: 12,
  },
  lockName: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  lockDesc: {
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
  },
  lockRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lockStatus: {
    fontSize: 12,
    color: '#999999',
    marginRight: 8,
  },
  lockStatusActive: {
    color: '#333333',
  },
  footer: {
    marginBottom: 34,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButton: {
    // boxShadow: '0 4px 16px 0 rgba(0, 0, 0, 0.25)',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 22,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666666',
    fontSize: 14,
  },
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  emptyImage: {
    width: 80,
    height: 80,
  },
  footerText: {
    fontSize: 12,
    color: '#999999',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default styles;
