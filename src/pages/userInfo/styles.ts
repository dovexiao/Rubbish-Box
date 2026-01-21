import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },

  row: {
    width: '100%',
    minHeight: 32,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },


  label: {
    fontSize: 16,
    lineHeight: 20,
    color: '#333333',
    fontWeight: 'bold',
  },

  middle: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },

  valueText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666666',
    maxWidth: '100%',
  },

  avatar: {
    width: 32,
    height: 32,
    borderRadius: 32,
    backgroundColor: '#F2F2F2',
  },

  popupBody: {
    width: '100%',
    paddingHorizontal: 24,
    paddingTop: 24
  },

  inputRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },

  inputLabel: {
    width: 56,
    fontSize: 14,
    lineHeight: 20,
    color: '#333333',
    fontWeight: 'bold',
  },

  input: {
    flex: 1,
    textAlign: 'right',
    paddingVertical: 0,
    paddingHorizontal: 0,
    fontSize: 14,
    color: '#333333',
  },



  popupFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 36,
    paddingHorizontal: 24,
  },

  popupBtnGhost: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },

  popupBtnGhostText: {
    color: '#999999',
    fontSize: 16,
  },

  popupBtnPrimary: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#333333',
  },


  popupBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default styles;

