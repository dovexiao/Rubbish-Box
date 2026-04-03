import { fontSize, px } from '@/utils/ui';
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
    borderRadius: px(12),
    padding: px(24),
  },
  navHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    height: px(44),
    paddingHorizontal: px(16),
    minHeight: px(44),
  },
  navHeaderBorder: {
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderBottomColor: '#f4f4f4',
  },
  navHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: px(40),
  },
  navHeaderCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navHeaderRight: {
    minWidth: px(40),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  navHeaderBack: {
    marginRight: px(12),
    padding: px(4),
  },
  backButtonText: {
    fontSize: fontSize(24),
    lineHeight: px(24),
  },
  navHeaderTitle: {
    fontSize: fontSize(16),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: px(32),
  },
  errorTitle: {
    fontSize: fontSize(18),
    fontWeight: '600',
    color: '#333333',
    marginBottom: px(8),
  },
  errorMessage: {
    fontSize: fontSize(14),
    color: '#666666',
    textAlign: 'center',
    marginBottom: px(16),
  },
  errorRetryButton: {
    paddingHorizontal: px(24),
    paddingVertical: px(10),
    borderRadius: px(20),
    backgroundColor: '#2878FF',
  },
  errorRetryText: {
    fontSize: fontSize(14),
    color: '#FFFFFF',
  },
  statusLoginContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: px(32),
  },
  statusLoginTitle: {
    fontSize: fontSize(20),
    color: '#333333',
    marginBottom: px(32),
  },
  statusLoginAddBtn: {
    width: px(160),
    height: px(160),
    borderRadius: px(80),
    backgroundColor: '#F5F7FA',
    marginBottom: px(16),
  },
  statusLoginAddImage: {
    width: px(96),
    height: px(96),
    aspectRatio: px(96) / px(96),
  },
  statusLoginToast: {
    fontSize: fontSize(14),
    color: '#666666',
    marginBottom: px(24),
  },
  statusLoginLoginBtn: {
    width: px(240),
    height: px(44),
    borderRadius: px(16),
    backgroundColor: '#333333',
  },
  statusLoginLoginText: {
    fontSize: fontSize(16),
    color: '#FFFFFF',
  },
});
