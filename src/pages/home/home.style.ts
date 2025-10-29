import globalStore from '@/services/global.state';
import {designToDp} from '@utils';
import {Dimensions, StyleSheet} from 'react-native';

export default StyleSheet.create({
  menuIcon: {
    width: 24,
    height: 24,
  },
  bellIconBox: {
    width: 28,
    height: 28,
    position: 'relative',
  },
  bellIcon: {
    width: 28,
    height: 28,
    top: 0,
    left: 0,
  },
  bellTipIconBox: {
    position: 'absolute',
    width: 20,
    height: 20,
    top: -4,
    right: -4,
  },
  bellTipIcon: {
    width: 20,
    height: 20,
  },
  topBanner: {
    width: '100%',
    margin: 'auto',
    marginLeft: designToDp(10),
  },
  vipNavs: {
    height: (56 * globalStore.screenWidth) / 375,
  },
  vipNavsItem: {
    paddingTop: 3,
    height: (81 * globalStore.screenWidth) / 375 + 2,
    alignItems: 'center',
    position: 'relative',
  },
  vipNavsItemImg: {
    width: (64 * globalStore.screenWidth) / 375,
    height: (64 * globalStore.screenWidth) / 375,
  },
  vipNavsItemTag: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  text: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '500',
  },
  tabs: {
    width: '100%',
    height: 48,
  },
  colorTitle: {
    height: 52,
  },
  image442Icon: {
    width: 8,
    height: 8,
  },
  frameFlexBox: {
    alignItems: 'center',
    width: Dimensions.get('window').width * 0.93,
    height: 52,
    flexDirection: 'row',
    margin: 'auto',
    marginBottom: 0,
    marginTop: 0,
  },
  scratchOff: {
    color: '#000',
    marginLeft: 8,
    letterSpacing: -0.3,
  },
});

export const homeDrawerStyle = StyleSheet.create({
  close: {
    height: 28,
    width: 28,
  },
  logo: {
    height: 28,
    width: 28,
  },
  itemIcon: {
    height: 24,
    width: 24,
  },
  down: {
    height: 12,
    width: 12,
  },
});

export const homeScratchCardStyle = StyleSheet.create({
  content: {
    height: 40,
  },
});

export const homeServiceStyle = StyleSheet.create({
  service: {
    borderRadius: 52,
    right: 0,
    bottom: 24,
    zIndex: 5,
    padding: 3,
  },
  checkin: {
    borderRadius: 52,
    right: 22,
    bottom: 140,
    zIndex: 5,
    padding: 3,
  },
  invite: {
    borderRadius: 52,
    right: 22,
    bottom: 80,
    zIndex: 5,
    padding: 3,
  },
});
