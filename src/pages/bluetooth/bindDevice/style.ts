import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  scanBox: {
    width: '100%',
    alignItems: 'center',
  },
  scanImage: {
    width: 160,
    height: 160,
    marginTop: 12,
  },
  countdownText: {
    marginTop: 16,
    marginBottom: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
  },
  card: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f7f7fb',
    borderRadius: 12,
  },
  cardItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    lineHeight: 20,
    marginBottom: 8,
  },
  afterFound: {
    width: '100%',
    alignItems: 'center',
    marginTop: 12,
    gap: 12,
  },
  footer: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  btnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryBtn: {
    width: 220,
    height: 44,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  infoBox: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 16,
  },
  kvRow: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kvLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  kvValue: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '700',
    maxWidth: '70%',
    textAlign: 'right',
  },
});

