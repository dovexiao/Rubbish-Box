import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 52
  },
  logo: {
    width: 191,
    height: 66,
  },
  logoTitle: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
    letterSpacing: 5,
    marginTop: 8
  },
  agree: {
    fontSize: 12,
    color: '#999999',
    lineHeight: 17,
  },
  agreeLink: {
    color: '#333333',
    fontSize: 12,
    lineHeight: 17,
  },
  logTip: {
    marginTop: 24,
    marginBottom: 16,
  },
  line: {
    width: 24,
    height: 1,
    backgroundColor: '#999999',
  },
  fastDesc: {
    fontSize: 12,
    color: '#999999',
    lineHeight: 17,
    marginHorizontal: 12
  },
  wxlogo: {
    width: 40,
    height: 40
  }
});

export default styles;

