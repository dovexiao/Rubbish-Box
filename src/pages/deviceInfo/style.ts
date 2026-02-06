import { StyleSheet } from 'react-native';
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 16,
  },
  cardTitleLine: {
    width: 2,
    height: 12,
    backgroundColor: '#333333',
    borderRadius: 7,
  },
  cardTitle: {
    fontWeight: '500',
    fontSize: 14,
    color: '#333333',
    textAlign: 'left',
    marginLeft: 6,
  },
  cardRows: {
    // width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  cardLable: {
    fontSize: 14,
    fontWeight: '400',
    color: '#333333',
  },
  cardValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    color: '#333333',
    textAlign: 'right',
  },
  cardLine: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginVertical: 8,
  },
  qrCodeBtn: {
    paddingVertical: 5,
    paddingHorizontal: 8,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f7fb',
    borderRadius: 12,
  },
  qrCodeBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginHorizontal: 2,
  },
  testBtn: {
    paddingVertical: 4,
    paddingHorizontal: 20,
    backgroundColor: '#333333',
    marginLeft: 8,
    borderRadius: 26,
  },
  testBtnText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  toastText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '400',
    color: '#999999',
  },
  footerBtnContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerBtn: {
    paddingVertical: 13,
    paddingHorizontal: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'solid',
  },
  cancelBtn: {
    borderColor: 'rgba(0,0,0,0.1)',
  },
  confirmBtn: {
    borderColor: '#FF2B24',
  },
  footerBtnText: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
  },
  cancelBtnText: {
    color: '#999999',
  },
  confirmBtnText: {
    color: '#FF2B24',
  },
  // 编辑弹窗
  header: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  editContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingTop: 16,
    paddingHorizontal: 24,
    position: 'relative',
  },
  closeIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  editContent: {
    marginTop: 24,
    marginBottom: 36,
  },
  editItem: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  input: {
    flex: 1,
    textAlign: 'right',
    fontSize: 16,
    color: '#333',
    padding: 0,
    marginRight: 4,
  },
  editFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editBtn: {
    flex: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  cancelPopBtn: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(0,0,0,0.1)',
    marginRight: 15,
  },
  confirmPopBtn: {
    backgroundColor: '#333', // Dark theme primary
    marginLeft: 10,
  },
  cancelText: {
    color: '#666',
    fontSize: 16,
  },
  confirmText: {
    color: '#fff',
    fontSize: 16,
  },

  // 电源模式提示
  powerModeTooltip: {
    position: 'absolute',
    bottom: -34,
    right: -8,
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    zIndex: 10,
  },
  powerModeTooltipText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#fff',
    textAlign: 'right',
  },

  qrCodeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
});
