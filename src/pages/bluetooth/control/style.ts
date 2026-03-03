import { Flex } from '@ant-design/react-native';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  pairedBox: {
    width: '100%',
    alignItems: 'center',
  },
  gif: {
    width: 200,
    height: 200,
  },
  statusText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
  },
  card: {
    width: '100%',
    paddingHorizontal: 12,
    paddingVertical: 16,
    backgroundColor: '#f7f7fb',
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
    marginBottom: 6,
  },
  toggleBtn: {
    marginTop: 12,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  unpairedBox: {
    width: '100%',
    paddingTop: 40,
    alignItems: 'center',
  },
  unpairedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 8,
  },
  unpairedDesc: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
  },
  actions: {
    width: '100%',
    alignItems: 'center',
  },
  btnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 22,
  },
  footer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLabel: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '600',
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerValue: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '700',
    marginRight: 6,
  },
  footerArrow: {
    fontSize: 18,
    color: '#999999',
    marginTop: -1,
  },
  rowMargin32: {
    marginBottom: 16,
  },
  cardItemText: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
    fontWeight: 'bold',
    lineHeight: 20,
  },
  rowMargin: {
    marginBottom: 8,
  },
  dotWrapper: {
    width: 20,
    height: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#999999',
    marginRight: 8,
  },
  buttonTipsText: {
    fontSize: 14,
    color: '#999999',
    lineHeight: 20,
    marginBottom: 8,
  },
  btn: {
    height: 48,
    borderRadius: 16,
    marginTop: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
