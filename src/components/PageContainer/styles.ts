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
  },
  footerContainer: {
    zIndex: 10,
    paddingTop: 20,
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
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    paddingHorizontal: 16,
    minHeight: 44,
  },
  navHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  navHeaderCenter: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
});

