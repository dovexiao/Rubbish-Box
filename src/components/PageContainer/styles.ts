import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pageContainer: {
    flex: 1,
    zIndex: 1,
    position: 'relative',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  headerContainer: {
    zIndex: 10,
    // borderBottomWidth: 0.5,
    // borderBottomColor: '#f4f4f4',
  },
  footerContainer: {
    zIndex: 10,
    // paddingTop: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    borderRadius: 12,
    padding: 24,
  },
  navHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    paddingHorizontal: 16,
    minHeight: 44,
  },
  navHeaderBorder: {
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderBottomColor: '#f4f4f4',
  },
  navHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 40,
  },
  navHeaderCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navHeaderRight: {
    minWidth: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  navHeaderBack: {
    marginRight: 12,
    padding: 4,
  },
  backButtonText: {
    fontSize: 24,
    lineHeight: 24,
  },
  navHeaderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 16,
  },
  errorRetryButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#2878FF',
  },
  errorRetryText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  statusLoginContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  statusLoginTitle: {
    fontSize: 20,
    color: '#333333',
    marginBottom: 32,
  },
  statusLoginAddBtn: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#F5F7FA',
    marginBottom: 16,
  },
  statusLoginAddImage: {
    width: 96,
    height: 96,
  },
  statusLoginToast: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 24,
  },
  statusLoginLoginBtn: {
    width: 240,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#333333',
  },
  statusLoginLoginText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
});
