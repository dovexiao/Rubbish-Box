import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7FA',
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#333333',
    fontWeight: 'bold',
    width: 70,
    lineHeight: 20,
  },
  fieldValueWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
    textAlign: 'right',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  placeholderText: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'right',
  },
  regionText: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
    textAlign: 'right',
  },
  arrowIconWrap: {
    marginLeft: 8,
  },
  footerBtnWrap: {
    marginTop: 32,
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 32,
  },
  saveBtn: {
    width: 196,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  popupBtn: {
    height: 48,
    borderRadius: 24,
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 24,
    marginBottom: 8,
  },
  popupBtnText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
});

export default styles;
