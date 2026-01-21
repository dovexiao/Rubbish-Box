import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },

  header: {
    height: 40,
    paddingHorizontal: 12,
    top: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    width: '100%'
  },


  closeBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: 12,
    top: 0,
  },

  body: {

  },

  footer: {

  },

  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  footerBtn: {
    flex: 1,
  },

  footerGap: {
    width: 12,
  },
});

export default styles;

