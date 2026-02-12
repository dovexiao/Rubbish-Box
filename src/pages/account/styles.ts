import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowTop: {
    marginTop: 16,
  },
  rowMiddle: {
    marginTop: 28,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    lineHeight: 20,
  },
  value: {
    fontSize: 14,
    color: '#333333',
    marginRight: 2,
  },
  valueGray: {
    color: '#CCCCCC',
  },
  footerWrap: {
    marginTop: 40,
    alignItems: 'center',
  },
  logoffBtn: {
    width: 196,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FF2B24',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoffText: {
    fontSize: 16,
    color: '#FF2B24',
  },
  popTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    lineHeight: 22,
    color: '#333333',
    textAlign: 'center',
  },
  popDesc: {
    fontSize: 14,
    color: '#999999',
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: 'normal',
  },
});

export default styles;
