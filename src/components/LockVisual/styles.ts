import { fontSize, px } from '@/utils/ui';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    height: px(241),
    paddingTop: px(40),
    width: '100%',
  },
  actionButton: {
    position: 'absolute',
    top: px(2),
    right: px(16),
    paddingVertical: px(6),
    paddingHorizontal: px(10),
    borderRadius: px(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  groupCount: {
    position: 'absolute',
    top: px(60),
    left: 0,
  },
  groupCountText: {
    fontSize: fontSize(32),
    fontWeight: '500',
    lineHeight: px(45),
  },
  actionButtonDeep: {
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  actionButtonLight: {
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  actionText: {
    fontSize: fontSize(12),
    lineHeight: px(17),
    fontWeight: '400',
  },
  actionTextDeep: {
    color: 'rgba(255,255,255,0.8)',
  },
  actionTextLight: {
    color: 'rgba(51,51,51,0.8)',
  },
  actionIcon: {
    marginLeft: px(2),
  },
  staticImage: {
    width: '100%',
    height: px(210),
  },
  gifImage: {
    width: '100%',
    height: px(210),
  },
});

export default styles;
