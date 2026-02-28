import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  content: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  footer: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  btn: {},
  btnText: {
    width: '100%',
    height: '100%',
  },
  btnTextInner: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  countdownContainer: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '600',
  },
  countdownNumber: {
    marginLeft: 8,
    color: '#ff873d',
  },
  card: {
    width: '100%',
    marginTop: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f7f7fb',
    borderRadius: 12,
  },
  rowMargin: {
    marginBottom: 12,
  },
  cardItem: {
    marginBottom: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#333333',
    marginRight: 8,
  },
  cardItemText: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
    fontWeight: '600',
    lineHeight: 20,
  },
  deviceName: {
    color: '#ff873d',
    fontWeight: '700',
  },
  iconWrapper: {
    marginTop: 32,
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
  },
  titleWrapper: {
    marginTop: 16,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
  },
  titleIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleIconText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#333333',
    fontWeight: '600',
  },
  infoSection: {
    width: '100%',
    marginTop: 16,
  },
  infoBox: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    marginBottom: 12,
  },
  infoContent: {
    width: '100%',
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 6,
  },
  infoValue: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '700',
  },
  pinValue: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '800',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  copyText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  tips: {
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  tipsText: {
    fontSize: 12,
    color: '#6b7280',
  },
  footerWrapper: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
    paddingBottom: 10,
  },
});

export default styles;
