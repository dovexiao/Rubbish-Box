import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 112,
    backgroundColor: '#FFFFFF',
  },
  row: {
    width: 176,
    height: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  icon: {
    width: 48,
    height: 48,
  },
  title: {
    width: 120,
    height: 28,
    fontWeight: '700',
    fontSize: 20,
    color: '#333333',
    lineHeight: 28,
    textAlign: 'center',
  },
  text: {
    width: 98,
    height: 22,
    marginTop: 24,
    fontWeight: '400',
    fontSize: 16,
    color: '#999999',
    lineHeight: 22,
    textAlign: 'center',
  },
});

