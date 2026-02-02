import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    height: 241,
    paddingTop: 40,
    width: '100%',
  },
  actionButton: {
    position: 'absolute',
    top: 2,
    right: 16,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  actionButtonDeep: {
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  actionButtonLight: {
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  actionText: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '400',
  },
  actionTextDeep: {
    color: 'rgba(255,255,255,0.8)',
  },
  actionTextLight: {
    color: 'rgba(51,51,51,0.8)',
  },
  actionIcon: {
    marginLeft: 2,
  },
  staticImage: {
    width: '100%',
    height: 210,
  },
  gifImage: {
    width: '100%',
    height: 210,
  },
});

export default styles;
