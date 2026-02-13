import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
  },
  section: {
    marginTop: 100,
    marginBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    lineHeight: 24,
    textAlign: 'center',
  },
  desc: {
    fontSize: 14,
    color: '#999999',
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 24,
    marginTop: 8,
  },
  inputRow: {
    marginTop: 16,
    backgroundColor: '#f7f7fb',
    borderRadius: 12,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    width: 327,
    height: 56,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    lineHeight: 22,
  },
  codeBtn: {
    marginLeft: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderLeftWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    minWidth: 112,
    alignItems: 'center',
  },
  codeBtnDisabled: {
    borderColor: '#CCCCCC',
  },
  codeBtnText: {
    fontSize: 16,
    color: '#333333',
  },
  codeBtnTextDisabled: {
    color: '#CCCCCC',
  },
  errorBorder: {
    borderColor: '#ff2b24',
    borderWidth: 1,
    borderRadius: 12,
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: '#FF4D4F',
    lineHeight: 20,
  },
  submitBtn: {
    marginTop: 36,
    width: 160,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  submitBtnDisabled: {
    backgroundColor: '#999999',
  },
  submitBtnText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default styles;
