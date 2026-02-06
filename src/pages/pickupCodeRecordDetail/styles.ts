import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },
  innerContent: {
    width: '100%',
    paddingHorizontal: 24,
  },
  cardImgWrapper: {
    position: 'relative',
    width: '100%',
    height: 148,
    marginTop: 12,
  },
  cardImg: {
    width: '100%',
    height: 148,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardInfo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyImage: {
    width: 120,
  },
  stepImageContent: {
    width: 280,
    height: 75,
    marginTop: 22,
    marginBottom: 22,
  },
  stepImage: {
    width: '100%',
    height: '100%',
  },
  cardImage: {
    width: '100%',
    height: 148,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardInfoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    paddingRight: 45,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  cardInfoText: {
    color: '#283E77',
    fontSize: 16,
    lineHeight: 22,
    marginHorizontal: 8,
    textAlign: 'center',
  },
  cardTimeText: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 17,
  },
  infoBox: {
    width: '100%',
    backgroundColor: '#F8F7FC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    marginTop: 28,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: 12,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 'bold',
    color: '#333333',
    width: 80,
  },
  value: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#333333',
    textAlign: 'right',
  },
  addressValue: {
    marginTop: 4,
  },
  expressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 12,
  },
  expressNoText: {
    fontSize: 14,
    color: '#333333',
    marginRight: 12,
    flex: 1,
  },
  copyIconWrap: {
    padding: 4,
  },
  infoContent: {
    width: '100%',
    paddingHorizontal: 24,
    marginTop: 16,
  },
  qrCodeContent: {
    marginTop: 50,
    marginHorizontal: 80,
    marginBottom: 26,
    height: 176,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCodeImage: {
    width: 120,
    height: 120,
    marginTop: 8,
  },
  qrCodeContentText: {
    fontSize: 14,
    color: '#333333',
    marginTop: 12,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999999',
    marginTop: 16,
    textAlign: 'center',
    opacity: 0.5,
  },
});

export default styles;
