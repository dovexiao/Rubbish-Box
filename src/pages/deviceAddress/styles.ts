import { fontSize, px } from '@/utils/ui';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    fontSize: fontSize(16),
    color: '#333333',
  },
  mapContainer: {
    width: '100%',
    height: '100%',
    flex: 1,
    position: 'relative',
  },
  mapContent: {
    width: '100%',
    height: '100%',
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  mapFallback: {
    flex: 1,
    minHeight: px(240),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F6F7FB',
  },
  mapFallbackText: {
    marginTop: px(12),
    fontSize: fontSize(14),
    color: '#666666',
  },
  locateIcon: {
    zIndex: 10,
    position: 'absolute',
    width: px(48),
    height: px(48),
    backgroundColor: '#FFFFFF',
    borderRadius: px(16),
    justifyContent: 'center',
    alignItems: 'center',
    right: px(16),
    bottom: px(21),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: px(2),
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addressContainer: {
    width: '100%',
    minHeight: px(182),
    maxHeight: px(340),
    position: 'relative',
  },
  addressContainerInner: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: px(-5),
    backgroundColor: '#FFFFFF',
    paddingTop: px(16),
    paddingLeft: px(24),
    paddingRight: px(24),
    borderTopLeftRadius: px(12),
    borderTopRightRadius: px(12),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: px(-2),
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  addressTitle: {
    width: '100%',
    marginBottom: px(24),
    alignItems: 'center',
  },
  addressTitleText: {
    fontWeight: 'bold',
    fontSize: fontSize(16),
    color: '#333333',
    lineHeight: px(22),
    textAlign: 'center',
  },
  addressList: {
    width: '100%',
    flex: 1,
  },
  addressItem: {
    width: '100%',
    minHeight: px(76),
    paddingBottom: px(8),
    marginBottom: px(8),
    borderBottomWidth: px(1),
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  addressItemLast: {
    borderBottomWidth: 0,
  },
  addressItemName: {
    width: '100%',
    marginBottom: px(8),
  },
  addressItemNameText: {
    width: '100%',
    fontWeight: 'bold',
    fontSize: fontSize(14),
    color: '#333333',
    lineHeight: px(20),
  },
  addressItemAddress: {
    width: '100%',
    marginBottom: px(8),
  },
  addressItemAddressText: {
    width: '100%',
    fontSize: fontSize(14),
    color: '#333333',
    lineHeight: px(20),
  },
  addressItemSpace: {
    width: '100%',
    marginBottom: px(8),
  },
  addressItemSpaceText: {
    width: '100%',
    fontSize: fontSize(12),
    color: '#999999',
    lineHeight: px(17),
  },
  addressItemButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: px(8),
  },
  addressItemButton: {
    borderRadius: px(12),
  },
  addressItemButtonRight: {
    width: px(56),
    height: px(30),
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressItemButtonRightText: {
    fontWeight: 'bold',
    fontSize: fontSize(12),
    color: '#FFFFFF',
    lineHeight: px(17),
    textAlign: 'center',
  },
  addressEmpty: {
    width: '100%',
    height: px(100),
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressEmptyText: {
    fontSize: fontSize(14),
    color: '#333333',
    lineHeight: px(20),
  },
});

export default styles;
