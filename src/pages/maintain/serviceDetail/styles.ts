import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
    flex: 1,
  },
  toastText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#999999',
    lineHeight: 17,
  },
  marginSetting: {
    marginTop: 24,
    marginBottom: 12,
  },
  infoItem: {
    marginTop: 12,
    minHeight: 32,
  },
  descriptInfo: {
    marginTop: 12,
    minHeight: 32,
  },
  infoItemText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
  },
  infoItemTextRight: {
    flex: 1,
    textAlign: 'right',
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  descriptionText: {
    textAlign: 'left',
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
    marginTop: 12,
  },
  circle: {
    width: 16,
    height: 16,
    backgroundColor: '#E5E5E5',
    borderRadius: 16,
    position: 'relative',
  },
  blackColor: {
    backgroundColor: '#333333',
  },
  line: {
    position: 'absolute',
    left: 7,
    top: 20,
    width: 2,
    height: 40,
    backgroundColor: '#E5E5E5',
  },
  pedding: {
    flex: 1,
    marginLeft: 16,
  },
  time: {
    fontSize: 12,
    color: '#333333',
    marginTop: 4,
  },
});
