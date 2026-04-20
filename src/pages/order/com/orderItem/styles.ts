import { fontSize, px } from '@/utils/ui';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  orderItem: {
    borderRadius: px(12),
    backgroundColor: '#FFFFFF',
    paddingTop: px(18),
    paddingHorizontal: px(16),
    paddingBottom: px(16),
    marginBottom: px(12),
  },
  orderNoText: {
    fontSize: fontSize(12),
    color: '#999999',
    lineHeight: px(17),
    textAlign: 'center',
  },
  statusText: {
    fontSize: fontSize(14),
    fontWeight: 'bold',
    color: '#333333',
    lineHeight: px(20),
    textAlign: 'right',
  },
  cardImageContent: {
    width: px(48),
    height: px(48),
    overflow: 'hidden',
    borderRadius: px(7),
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardContent: {
    marginLeft: px(12),
    paddingVertical: px(3),
  },
  cardTitle: {
    fontSize: fontSize(14),
    color: '#333333',
  },
  title: {
    fontSize: fontSize(14),
    color: '#333333',
  },
  defaultText: {
    fontSize: fontSize(14),
    color: '#333333',
  },
  cardCount: {
    fontSize: fontSize(14),
    color: '#333333',
  },
  cardItem: {
    marginTop: px(16),
  },
  cardPrice: {
    fontSize: fontSize(14),
    color: '#FF2B24',
  },
  line: {
    width: '100%',
    borderTopWidth: px(0.5),
    borderColor: 'rgba(234, 234, 234, 0.9)',
    marginVertical: px(12),
  },
  boldFont: {
    fontWeight: 'bold',
  },
});
