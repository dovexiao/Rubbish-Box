import { px, fontSize } from '@/utils/ui';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
  row: {
    marginTop: px(130),
    width: '100%',
    height: px(48),
  },
  iconBox: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#333333',
    fontSize: fontSize(20),
    fontWeight: 'bold',
    marginLeft: px(9),
  },
  text: {
    color: '#999999',
    fontSize: fontSize(16),
  },
  btnContainer: {
    width: px(196),
    height: px(48),
    borderRadius: px(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnContainerConfirmText: {
    color: '#999999',
    fontSize: fontSize(16),
  },
  btnContainerShareText: {
    color: '#ffffff',
    fontSize: fontSize(16),
  },
});
