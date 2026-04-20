import { fontSize, px } from '@/utils/ui';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    marginTop: px(12),
    backgroundColor: '#F7F7FB',
    borderRadius: px(12),
    overflow: 'hidden',
  },
  checkBox: {
    backgroundColor: '#EAEAEE',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: px(2),
  },
  checked: {
    backgroundColor: '#333333',
  },
  content: {
    flex: 1,
    padding: px(16),
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lockName: {
    flex: 1,
    fontSize: fontSize(16),
    color: '#333333',
    fontWeight: 'bold',
    lineHeight: px(22),
  },
  lockType: {
    fontSize: fontSize(10),
    color: '#333333',
    fontWeight: 'bold',
    lineHeight: px(14),
    marginLeft: px(5),
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    marginTop: px(6),
  },
  lockImage: {
    width: px(36),
    height: px(36),
    top: px(4),
  },
  multiBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginLeft: px(6),
  },
  count: {
    fontSize: fontSize(14),
    color: '#333333',
    fontWeight: 'bold',
    lineHeight: px(40),
  },
  line: {
    marginTop: px(10),
    marginBottom: px(10),
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(51,51,51,0.1)',
  },
  validityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: fontSize(14),
    color: '#333333',
    fontWeight: 'bold',
  },
  rightArea: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    fontSize: fontSize(14),
    color: '#333333',
    marginLeft: px(6),
    fontWeight: 'bold',
  },
  optionGap: {
    marginLeft: px(14),
  },
  endtimeBox: {
    marginTop: px(10),
    flexDirection: 'row',
    alignItems: 'center',
  },
  endTime: {
    marginLeft: px(10),
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: px(10),
    paddingVertical: px(6),
    paddingHorizontal: px(10),
    flexDirection: 'row',
    alignItems: 'center',
  },
  endTimeText: {
    fontSize: fontSize(14),
    color: '#333333',
  },
  arrow: {
    marginLeft: px(6),
  },
});

export default styles;
