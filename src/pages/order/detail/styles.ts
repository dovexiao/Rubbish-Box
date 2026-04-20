import { fontSize, px } from '@/utils/ui';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  orderDetailContainer: {
    paddingTop: px(22),
    paddingHorizontal: px(24),
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  detailItem: {
    paddingVertical: px(6),
    marginBottom: px(12),
    gap: px(12),
  },
  detailItem2: {
    paddingVertical: px(6),
    marginBottom: px(12),
  },
  title: {
    fontSize: fontSize(14),
    color: '#333333',
  },
  defaultText: {
    fontSize: fontSize(14),
    color: '#333333',
  },
  cardImage: {
    width: px(48),
    height: px(48),
    borderRadius: px(7),
    overflow: 'hidden',
  },
  cardContent: {
    marginLeft: px(12),
    paddingVertical: px(3),
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: fontSize(14),
    color: '#333333',
  },
  cardCountContainer: {
    marginLeft: px(48),
  },
  cardCount: {
    fontSize: fontSize(14),
    color: '#333333',
  },
  cardPrice: {
    fontSize: fontSize(14),
    color: '#FF2B24',
  },
  address: {
    maxWidth: px(220),
    flexWrap: 'wrap',
    textAlign: 'right',
    marginTop: px(8),
  },
});
