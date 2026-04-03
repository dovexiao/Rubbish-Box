import { px, fontSize } from '@/utils/ui';
import { StyleSheet, Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: px(100),
  },
  swiper: {
    width: screenWidth,
    height: px(280),
    backgroundColor: '#FFFFFF',
  },
  detailInfo: {
    marginTop: px(12),
    marginHorizontal: px(16),
    paddingHorizontal: px(16),
    paddingTop: px(16),
    paddingBottom: px(20),
    backgroundColor: '#FFFFFF',
    borderRadius: px(12),
  },
  detailPrice: {
    color: '#FF0000',
    fontSize: fontSize(20),
    fontWeight: 'bold',
  },
  detailOriginalPrice: {
    fontSize: fontSize(12),
    marginLeft: px(8),
    color: '#CCCCCC',
    textDecorationLine: 'line-through',
  },
  detailSaleNum: {
    fontSize: fontSize(12),
    color: '#CCCCCC',
  },
  detailName: {
    fontSize: fontSize(16),
    color: '#333333',
    marginVertical: px(8),
    fontWeight: 'bold',
  },
  detailStock: {
    fontSize: fontSize(12),
    color: '#999999',
  },
  detailTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: px(20),
    marginBottom: px(16),
  },
  detailTitleText: {
    fontSize: fontSize(16),
    color: '#333333',
    marginHorizontal: px(12),
  },
  line: {
    width: px(24),
    height: px(1),
    borderWidth: px(1),
    borderColor: 'rgba(51, 51, 51, 0.1)',
  },
  detail: {
    width: '100%',
  },
  footer: {
    width: '100%',
    paddingTop: px(10),
    paddingBottom: px(10),
    // backgroundColor: 'rgba(255, 255, 255, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyButton: {
    borderRadius: px(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyButtonText: {
    color: '#FFFFFF',
    fontSize: fontSize(16),
  },
  popupContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: px(24),
    borderTopRightRadius: px(24),
    padding: px(24),
    width: '100%',
    position: 'relative',
  },

  popupBody: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    marginTop: 0,
  },
  popupImage: {
    width: px(100),
    height: px(100),
    borderRadius: px(15),
  },
  popupInfo: {
    flex: 1,
    marginLeft: px(12),
  },
  popupTitle: {
    fontSize: fontSize(16),
    color: '#333333',
    fontWeight: 'bold',
    marginBottom: 0,
  },
  popupPrice: {
    fontSize: fontSize(16),
    color: '#FF2B24',
    fontWeight: 'bold',
    marginBottom: 0,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: px(4),
  },
  stepperBtn: {
    width: px(48),
    height: px(48),
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnText: {
    fontSize: fontSize(24),
    color: '#333333',
    fontWeight: '600',
  },
  stepperValue: {
    minWidth: px(60),
    textAlign: 'center',
    fontSize: fontSize(24),
    color: '#333333',
    paddingHorizontal: px(12),
  },
  popupStock: {
    fontSize: fontSize(12),
    color: '#333333',
    marginLeft: px(12),
  },
  popupFooter: {
    marginTop: px(48),
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  goodsPopupBuyBtn: {
    borderRadius: px(12),
  },
  popupBuyText: {
    color: '#FFFFFF',
    fontSize: fontSize(16),
    fontWeight: 'bold',
  },
});

export default styles;
