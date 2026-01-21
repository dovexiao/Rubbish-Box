import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    marginTop: 103,
    paddingHorizontal: 24,

  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    lineHeight: 22
  },
  content: {
    marginTop: 16,
    backgroundColor: '#f7f7fb',
    borderRadius: 12,
    paddingHorizontal: 10,
    width: '100%',
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorBorder: {
    borderWidth: 1,
    borderColor: '#ff2b24',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333333',

  },

  error: {
    fontSize: 14,
    color: '#ff2b24',
    marginTop: 8,
    textAlign: 'center',
  },
  btn: {
    marginTop: 36,
    backgroundColor: '#999999',
    borderRadius: 16,
    width: '100%',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnActive: {
    backgroundColor: '#333333',
  },
  btnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default styles;
