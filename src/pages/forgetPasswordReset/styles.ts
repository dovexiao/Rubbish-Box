import { px, fontSize } from '@/utils/ui';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    marginTop: px(103),
    paddingHorizontal: px(24),
  },
  title: {
    fontSize: fontSize(16),
    fontWeight: 'bold',
    color: '#333333',
    lineHeight: px(22),
  },
  content: {
    marginTop: px(16),
    backgroundColor: '#f7f7fb',
    borderRadius: px(12),
    paddingHorizontal: px(10),
    width: '100%',
    height: px(56),
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorBorder: {
    borderWidth: 1,
    borderColor: '#ff2b24',
  },
  input: {
    flex: 1,
    fontSize: fontSize(16),
    color: '#333333',
  },

  error: {
    fontSize: fontSize(14),
    color: '#ff2b24',
    marginTop: px(8),
    textAlign: 'center',
  },
  btn: {
    marginTop: px(36),
    backgroundColor: '#999999',
    borderRadius: px(16),
    width: '100%',
    height: px(48),
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnActive: {
    backgroundColor: '#333333',
  },
  btnText: {
    color: '#ffffff',
    fontSize: fontSize(16),
    fontWeight: 'bold',
  },
});

export default styles;
