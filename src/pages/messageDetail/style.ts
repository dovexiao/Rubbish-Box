import { fontSize, px } from '@/utils/ui';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7F9',
  },
  content: {
    paddingHorizontal: px(16),
    paddingTop: px(16),
    paddingBottom: px(24),
  },
  sectionTitle: {
    fontSize: fontSize(16),
    fontWeight: '700',
    color: '#333333',
    lineHeight: px(22),
    marginTop: px(12),
    marginBottom: px(12),
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: px(12),
    paddingHorizontal: px(12),
    paddingVertical: px(12),
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: px(10),
  },
  label: {
    width: px(110),
    fontSize: fontSize(14),
    color: '#333333',
    lineHeight: px(20),
    marginRight: px(12),
  },
  value: {
    flex: 1,
    fontSize: fontSize(14),
    color: '#333333',
    lineHeight: px(20),
    textAlign: 'right',
  },
  serviceText: {
    fontSize: fontSize(14),
    color: '#999999',
    lineHeight: px(20),
    marginBottom: px(12),
  },
  operationContainer: {
    backgroundColor: '#F7F7FB',
    borderRadius: px(12),
    padding: px(12),
  },
  operationItemText: {
    fontSize: fontSize(12),
    color: '#333333',
    lineHeight: px(18),
    marginBottom: px(6),
  },
  footerContainer: {
    paddingHorizontal: px(16),
    paddingBottom: px(16),
    backgroundColor: '#F6F7F9',
  },
  footerBtnText: {
    fontSize: fontSize(16),
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
