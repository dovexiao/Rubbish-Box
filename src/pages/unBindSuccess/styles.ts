import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  gifWrap: {
    width: '100%',
    alignItems: 'center',
  },
  gif: {
    width: '50%',
    aspectRatio: 1,
    resizeMode: 'contain',
  },
  textContainer: {
    width: '100%',
    marginTop: 24,
  },
  card: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#F7F7FB',
    borderRadius: 12,
  },
  textTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    lineHeight: 22,
    marginBottom: 12,
  },
  text: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
    marginBottom: 8,
  },
  btn: {
    marginTop: 24,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default styles;
