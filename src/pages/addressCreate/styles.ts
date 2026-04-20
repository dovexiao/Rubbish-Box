import { fontSize, px } from '@/utils/ui';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7FA',
    paddingHorizontal: px(16),
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: px(12),
    padding: px(16),
    marginVertical: px(12),
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: px(16),
  },
  fieldLabel: {
    fontSize: fontSize(14),
    color: '#333333',
    fontWeight: 'bold',
    width: px(70),
    lineHeight: px(20),
  },
  fieldValueWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  textInput: {
    flex: 1,
    fontSize: fontSize(14),
    color: '#333333',
    textAlign: 'right',
    paddingVertical: px(0),
    paddingHorizontal: px(0),
  },
  placeholderText: {
    fontSize: fontSize(14),
    color: '#CCCCCC',
    textAlign: 'right',
  },
  regionText: {
    flex: 1,
    fontSize: fontSize(14),
    color: '#333333',
    textAlign: 'right',
  },
  arrowIconWrap: {
    marginLeft: px(8),
  },
  footerBtnWrap: {
    marginTop: px(32),
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: px(32),
  },
  saveBtn: {
    width: px(196),
    height: px(48),
    borderRadius: px(16),
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontSize: fontSize(16),
    color: '#FFFFFF',
    fontWeight: '600',
  },
  popupBtn: {
    height: px(48),
    borderRadius: px(24),
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: px(24),
    marginBottom: px(8),
  },
  popupBtnText: {
    fontSize: fontSize(16),
    color: '#FFFFFF',
  },
});

export default styles;
