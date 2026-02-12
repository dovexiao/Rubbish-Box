import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
  row: {
    marginTop: 130,
    width: '100%',
    height: 48,
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
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 9,
  },
  text: {
    color: '#999999',
    fontSize: 16,
  },
  btnContainer: {
    width: 196,
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnContainerConfirmText: {
    color: '#999999',
    fontSize: 16,
  },
  btnContainerShareText: {
    color: '#ffffff',
    fontSize: 16,
  },
});
