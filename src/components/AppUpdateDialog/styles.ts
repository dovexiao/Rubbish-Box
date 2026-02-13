import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
  },
  header: {
    width: '100%',
    height: 180,
    position: 'relative',
    backgroundColor: '#202F4F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  headerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  versionBadge: {
    width: 220,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
    overflow: 'hidden',
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
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
    paddingHorizontal: 24,
    paddingVertical: 12,
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 12,
    color: '#999999',
  },
});

export default styles;

