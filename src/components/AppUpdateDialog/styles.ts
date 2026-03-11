import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    borderRadius: 16,
    backgroundColor: '#FFF',
    paddingBottom: 24,
  },
  header: {
    width: '100%',
    height: 120,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBgContent: {
    width: '100%',
    paddingBottom: 24,
    position: 'absolute',
    left: 0,
    right: 0,
    top: -92,
    bottom: 0,
  },
  headerContent: {
    position: 'absolute',
    bottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  versionBadge: {
    width: 163,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    overflow: 'hidden',
  },

  badgeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  badgeVer: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  body: {
    width: '100%',
    maxHeight: 220,
    paddingBottom: 12,
    paddingHorizontal: 24,
  },
  line: {
    marginTop: 8,
  },
  lineText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#333333',
  },
  updateBtnWrap: {
    marginTop: 16,
    marginHorizontal: 24,
    marginBottom: 16,
  },
  skipRow: {
    position: 'absolute',
    width: '100%',
    bottom: -56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 14,
    color: '#999999',
  },
});

export default styles;
