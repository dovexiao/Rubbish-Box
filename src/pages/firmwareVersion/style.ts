import { px, fontSize } from '@/utils/ui';
import { StyleSheet } from 'react-native';
export const styles = StyleSheet.create({
  titleRight: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: px(10),
    paddingVertical: px(5),
    borderRadius: px(12),
    backgroundColor: '#F7F7FB',
  },
  titleText: {
    fontSize: fontSize(12),
    color: '#333333',
    fontWeight: '500',
  },
  body: {
    borderBlockColor: '#f12345',
    flex: 1,
    width: '100%',
    paddingHorizontal: px(16),
    paddingTop: px(24),
  },
  versionText: {
    fontSize: fontSize(28),
    fontWeight: '600',
    color: '#111111',
    marginTop: px(8),
  },
  versionBottom: {
    fontSize: fontSize(14),
    color: '#999999',
    marginTop: px(6),
    marginBottom: px(24),
  },
  card: {
    width: '100%',
    backgroundColor: '#F7F7FB',
    borderRadius: px(12),
    paddingHorizontal: px(14),
    paddingVertical: px(16),
  },
  cardTitle: {
    fontSize: fontSize(16),
    fontWeight: '500',
    color: '#333333',
    marginBottom: px(10),
  },
  cardText: {
    fontSize: fontSize(14),
    color: '#666666',
    lineHeight: px(20),
  },
});
