import theme from '@style';
import {StyleSheet} from 'react-native';

const tableStyle = StyleSheet.create({
  th: {
    ...theme.padding.lrl,
    ...theme.padding.tbs,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopLeftRadius: theme.borderRadiusSize.l,
    borderTopRightRadius: theme.borderRadiusSize.l,
  },
  tbPayment: {
    width: 96,
  },
  diceNumber: {
    width: 60,
  },
  tbGameType: {
    width: 72,
  },
  textRight: {
    textAlign: 'right',
  },
  td: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: 12,
  },
  tdGray: {
    backgroundColor: theme.basicColor.newBgInOne,
    // backgroundColor: '#2E2666',
  },
});

export default tableStyle;
