import { StyleSheet, Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 100,
  },
  swiper: {
    width: screenWidth,
    height: 280,
    backgroundColor: '#FFFFFF',
  },
  detailInfo: {
    marginTop: 12,
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  detailPrice: {
    color: '#FF0000',
    fontSize: 20,
    fontWeight: 'bold',
  },
  detailOriginalPrice: {
    fontSize: 12,
    marginLeft: 8,
    color: '#CCCCCC',
    textDecorationLine: 'line-through',
  },
  detailSaleNum: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  detailName: {
    fontSize: 16,
    color: '#333333',
    marginVertical: 8,
    fontWeight: 'bold',
  },
  detailStock: {
    fontSize: 12,
    color: '#999999',
  },
  detailTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  detailTitleText: {
    fontSize: 16,
    color: '#333333',
    marginHorizontal: 12,
  },
  line: {
    width: 24,
    height: 1,
    borderWidth: 1,
    borderColor: 'rgba(51, 51, 51, 0.1)',
  },
  detail: {
    width: '100%',
  },
  footer: {
    width: '100%',
    paddingBottom: 21,
    // backgroundColor: 'rgba(255, 255, 255, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyButton: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  popupContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    width: '100%',
    position: 'relative',
  },

  popupBody: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    marginTop: 0,
  },
  popupImage: {
    width: 100,
    height: 100,
    borderRadius: 15,
  },
  popupInfo: {
    flex: 1,
    marginLeft: 12,
  },
  popupTitle: {
    fontSize: 16,
    color: '#333333',
    fontWeight: 'bold',
    marginBottom: 0,
  },
  popupPrice: {
    fontSize: 16,
    color: '#FF2B24',
    fontWeight: 'bold',
    marginBottom: 0,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 4,
  },
  stepperBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnText: {
    fontSize: 24,
    color: '#333333',
    fontWeight: '600',
  },
  stepperValue: {
    minWidth: 60,
    textAlign: 'center',
    fontSize: 24,
    color: '#333333',
    paddingHorizontal: 12,
  },
  popupStock: {
    fontSize: 12,
    color: '#333333',
    marginLeft: 12,
  },
  popupFooter: {
    marginTop: 48,
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  goodsPopupBuyBtn: {
    borderRadius: 12,
  },
  popupBuyText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default styles;
