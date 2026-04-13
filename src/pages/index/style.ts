import { StyleSheet } from 'react-native';
export const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  deviceStatusBlock: {
    height: 180,
    backgroundColor: '#e6f7ff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  deviceStatusText: {
    color: '#1890ff',
    fontSize: 16,
  },
  guestContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 32,
    // justifyContent: 'center',
  },
  guestTitle: {
    fontSize: 20,
    color: '#333',
    marginTop: '40%',
    marginBottom: 32,
  },
  guestAddBtn: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#F5F7FA',
    marginBottom: 16,
  },
  guestAddImage: {
    width: 96,
    height: 96,
  },
  guestToast: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  guestLoginBtn: {
    width: 240,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#333333',
  },
  guestLoginText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  deviceInfoBlock: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  deviceInfoText: {
    color: '#333',
    fontSize: 15,
  },
  noDeviceBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  noDeviceText: {
    color: '#999',
    fontSize: 16,
  },
});
