import { fontSize, px } from '@/utils/ui';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: px(16),
    paddingTop: px(12),
    paddingBottom: px(16),
    backgroundColor: '#FFFFFF',
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: px(16),
    paddingVertical: px(12),
  },
  fieldLabel: {
    fontSize: fontSize(14),
    color: '#333333',
    fontWeight: 'bold',
    lineHeight: px(20),
  },
  fieldInput: {
    flex: 1,
    marginLeft: px(16),
    fontSize: fontSize(14),
    color: '#333333',
    paddingVertical: px(0),
  },
  sectionHeader: {
    paddingHorizontal: px(16),
    paddingTop: px(18),
    paddingBottom: px(6),
  },
  sectionTitle: {
    fontSize: fontSize(14),
    color: '#333333',
    fontWeight: '600',
  },
  lockListContent: {
    paddingHorizontal: px(16),
    paddingTop: px(4),
    paddingBottom: px(80),
  },
  lockItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: px(12),
    borderBottomWidth: px(1),
    borderBottomColor: '#F0F0F0',
  },
  lockInfo: {
    flexDirection: 'column',
    flex: 1,
    marginRight: px(12),
  },
  lockName: {
    fontSize: fontSize(14),
    color: '#333333',
    fontWeight: '500',
  },
  lockDesc: {
    fontSize: fontSize(12),
    color: '#999999',
    marginTop: px(4),
  },
  lockRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lockStatus: {
    fontSize: fontSize(12),
    color: '#999999',
    marginRight: px(8),
  },
  lockStatusActive: {
    color: '#333333',
  },
  footer: {
    marginBottom: px(34),
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
    fontSize: fontSize(16),
    fontWeight: 'bold',
    lineHeight: px(22),
  },
  emptyText: {
    textAlign: 'center',
    color: '#666666',
    fontSize: fontSize(14),
  },
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  emptyImage: {
    width: px(80),
    height: px(80),
  },
  footerText: {
    fontSize: fontSize(12),
    color: '#999999',
    marginTop: px(8),
    textAlign: 'center',
  },
});

export default styles;
