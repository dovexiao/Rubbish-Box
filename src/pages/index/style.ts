import { px, fontSize } from '@/utils/ui';
import { StyleSheet } from 'react-native';
export const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  deviceStatusBlock: {
    height: px(180),
    backgroundColor: '#e6f7ff',
    borderRadius: px(12),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: px(24),
  },
  deviceStatusText: {
    color: '#1890ff',
    fontSize: fontSize(16),
  },
  guestContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: px(32),
  },
  guestTitle: {
    fontSize: fontSize(20),
    color: '#333',
    marginBottom: px(32),
  },
  guestAddBtn: {
    width: px(160),
    height: px(160),
    borderRadius: px(80),
    backgroundColor: '#F5F7FA',
    marginBottom: px(16),
  },
  guestAddImage: {
    width: px(96),
    height: px(96),
  },
  guestToast: {
    fontSize: fontSize(14),
    color: '#666',
    marginBottom: px(24),
  },
  guestLoginBtn: {
    width: px(240),
    height: px(44),
    borderRadius: px(16),
    backgroundColor: '#333333',
  },
  guestLoginText: {
    fontSize: fontSize(16),
    color: '#FFFFFF',
  },
  deviceInfoBlock: {
    backgroundColor: '#fff',
    borderRadius: px(8),
    padding: px(16),
    marginBottom: px(16),
    shadowColor: '#000',
    shadowOpacity: px(0.05),
    shadowRadius: px(4),
    elevation: px(2),
  },
  deviceInfoText: {
    color: '#333',
    fontSize: fontSize(15),
  },
  noDeviceBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: px(100),
  },
  noDeviceText: {
    color: '#999',
    fontSize: fontSize(16),
  },
});
