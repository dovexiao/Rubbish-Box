import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    marginTop: 12,
    backgroundColor: '#F7F7FB',
    borderRadius: 12,
    overflow: 'hidden',
  },
  checkBox: {
    backgroundColor: '#EAEAEE',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2
  },
  checked: {
    backgroundColor: '#333333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lockName: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    fontWeight: 'bold',
    lineHeight: 22,
  },
  lockType: {
    fontSize: 10,
    color: '#333333',
    fontWeight: 'bold',
    lineHeight: 14,
    marginLeft: 5,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    marginTop: 6,
  },
  lockImage: {
    width: 36,
    height: 36,
    top: 4
  },
  multiBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginLeft: 6,
  },
  count: {
    fontSize: 14,
    color: '#333333',
    fontWeight: 'bold',
    lineHeight: 40
  },
  line: {
    marginTop: 10,
    marginBottom: 10,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(51,51,51,0.1)',
  },
  validityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 14,
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
    fontSize: 14,
    color: '#333333',
    marginLeft: 6,
    fontWeight: 'bold',
  },
  optionGap: {
    marginLeft: 14,
  },
  endtimeBox: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  endTime: {
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  endTimeText: {
    fontSize: 14,
    color: '#333333',
  },
  arrow: {
    marginLeft: 6,
  },
});

export default styles;

