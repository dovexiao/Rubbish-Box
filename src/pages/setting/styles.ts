import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    backgroundColor: '#FFFFFF',
  },
  itemFirst: {
    width: '100%',
    height: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  item: {
    width: '100%',
    height: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 28,
  },
  itemText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    lineHeight: 20,
  },
  itemText2: {
    fontSize: 14,
    color: '#333333',
    marginRight: 4,
  },
  updateBtn: {
    height: 30,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#F7F7FB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateBtnText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: 'bold',
  },
});

export default styles;
