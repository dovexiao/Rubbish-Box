import { fontSize, px } from '@/utils/ui';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: px(24),
    paddingTop: px(24),
  },
  sectionTitle: {
    fontSize: fontSize(14),
    fontWeight: '500',
    color: '#333333',
    lineHeight: px(20),
    marginBottom: px(8),
  },
  videoWrap: {
    position: 'relative',
    width: '100%',
    height: px(186),
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: px(12),
  },
  video: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playCircle: {
    width: px(48),
    height: px(48),
    borderRadius: px(24),
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownSection: {
    marginTop: px(24),
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: px(16),
  },
  countdownLabel: {
    fontSize: fontSize(18),
    fontWeight: '400',
    color: '#333333',
    lineHeight: px(20),
    marginBottom: px(8),
  },
  countdownNumber: {
    fontSize: fontSize(20),
    fontWeight: '500',
    color: '#333333',
    lineHeight: px(28),
  },
  noticeSection: {
    marginTop: px(20),
  },
  noticeBox: {
    paddingHorizontal: px(16),
    paddingVertical: px(16),
    backgroundColor: '#F7F7FB',
    borderRadius: px(12),
  },
  noticeText: {
    fontSize: fontSize(14),
    fontWeight: '400',
    color: '#333333',
    lineHeight: px(20),
  },
  footerWrap: {
    alignItems: 'center',
    paddingVertical: px(16),
    marginTop: px(80),
  },
  actionBtn: {
    width: px(196),
    height: px(48),
    backgroundColor: '#333333',
    borderRadius: px(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    fontSize: fontSize(16),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionBtnDisabled: {
    backgroundColor: '#999999',
  },
});
