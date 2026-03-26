import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 52,
  },
  logo: {
    width: 191,
    height: 66,
    marginTop: 60,
  },
  logoTitle: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
    letterSpacing: 5,
    marginTop: 8,
  },
  agree: {
    fontSize: 12,
    color: '#666666',
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
    color: '#666666',
    lineHeight: 17,
    marginHorizontal: 12,
  },
  wxlogo: {
    width: 50,
    height: 50,
  },
  loginIcon: {
    width: 50,
    height: 50,
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
    color: '#666666',
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: 'normal',
  },
  popDescLink: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333333',
  },
  popNotice: {
    fontSize: 13,
    color: '#666666',
    // lineHeight: 1.6,
    marginTop: 8,
  },
  popSubmit: {
    borderRadius: 12,
    marginLeft: 15,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wxLoginBtn: {
    padding: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  popBtnText: {
    color: '#ffffff',
    textAlign: 'center',
  },
});

export default styles;
