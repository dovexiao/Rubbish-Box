import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F6F7FA',
    paddingBottom: 12,
  },
  goodsList: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between'
  },

  bottomBtnContent: {
    width: '100%',
    backgroundColor: '#F7F7FB',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 10,
  },
  bottomBtn: {
    width: 108,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    boxShadow: '0 2px 12px 0 rgba(0, 0, 0, 0.25)',
  },
  bottomBtnText: {
    fontSize: 14,
    color: '#333333',
    paddingLeft: 8,
    fontWeight: 'bold',
  },
});

export default styles;

