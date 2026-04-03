import { fontSize, px } from '@/utils/ui';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    borderRadius: px(16),
    backgroundColor: '#FFF',
    paddingBottom: px(24),
  },
  header: {
    width: '100%',
    height: px(120),
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBgContent: {
    width: '100%',
    paddingBottom: px(24),
    position: 'absolute',
    left: 0,
    right: 0,
    top: px(-92),
    bottom: 0,
  },
  headerContent: {
    position: 'absolute',
    bottom: px(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  versionBadge: {
    width: px(163),
    height: px(38),
    borderRadius: px(19),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    overflow: 'hidden',
  },

  badgeText: {
    color: '#FFFFFF',
    fontSize: fontSize(16),
    fontWeight: '600',
    marginRight: px(8),
  },
  badgeVer: {
    color: '#FFFFFF',
    fontSize: fontSize(14),
  },
  body: {
    width: '100%',
    maxHeight: px(220),
    paddingBottom: px(12),
    paddingHorizontal: px(24),
  },
  line: {
    marginTop: px(8),
  },
  lineText: {
    flex: 1,
    fontSize: fontSize(14),
    lineHeight: px(20),
    color: '#333333',
  },
  updateBtnWrap: {
    marginTop: px(16),
    marginHorizontal: px(24),
    marginBottom: px(16),
  },
  skipRow: {
    position: 'absolute',
    width: '100%',
    bottom: px(-56),
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: px(8),
  },
  skipText: {
    fontSize: fontSize(14),
    color: '#999999',
  },
});

export default styles;
