import { px, fontSize } from '@/utils/ui';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: px(24),
  },

  row: {
    width: '100%',
    minHeight: px(32),
    marginTop: px(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  label: {
    fontSize: fontSize(16),
    lineHeight: px(20),
    color: '#333333',
    fontWeight: 'bold',
  },

  middle: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },

  valueText: {
    fontSize: fontSize(14),
    lineHeight: px(20),
    color: '#666666',
    maxWidth: '100%',
  },

  avatar: {
    width: px(32),
    height: px(32),
    borderRadius: px(32),
    backgroundColor: '#F2F2F2',
  },

  popupBody: {
    width: '100%',
    paddingHorizontal: px(24),
    paddingTop: px(24),
  },

  inputRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },

  inputLabel: {
    width: px(56),
    fontSize: fontSize(14),
    lineHeight: px(20),
    color: '#333333',
    fontWeight: 'bold',
  },

  input: {
    flex: 1,
    textAlign: 'right',
    paddingVertical: px(0),
    paddingHorizontal: px(0),
    fontSize: fontSize(14),
    color: '#333333',
  },

  popupFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: px(36),
    paddingHorizontal: px(24),
  },

  popupBtnGhost: {
    flex: 1,
    height: px(48),
    borderRadius: px(12),
    borderWidth: px(1),
    borderColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },

  popupBtnGhostText: {
    color: '#999999',
    fontSize: fontSize(16),
  },

  popupBtnPrimary: {
    flex: 1,
    height: px(42),
    borderRadius: px(12),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#333333',
  },

  popupBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: fontSize(16),
  },
});

export default styles;
