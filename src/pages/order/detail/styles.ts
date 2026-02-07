import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  orderDetailContainer: {
    paddingTop: 22,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  detailItem: {
    paddingVertical: 6,
    marginBottom: 12,
    gap: 12,
  },
  title: {
    fontSize: 14,
    color: '#333333',
  },
  defaultText: {
    fontSize: 14,
    color: '#333333',
  },
  cardImage: {
    width: 48,
    height: 48,
    borderRadius: 7,
    overflow: 'hidden',
  },
  cardContent: {
    marginLeft: 12,
    paddingVertical: 3,
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 14,
    color: '#333333',
  },
  cardCountContainer: {
    marginLeft: 48,
  },
  cardCount: {
    fontSize: 14,
    color: '#333333',
  },
  cardPrice: {
    fontSize: 14,
    color: '#FF2B24',
  },
  address: {
    maxWidth: 220,
    flexWrap: 'wrap',
    textAlign: 'right',
    marginTop: 8,
  },
});
