import { px, fontSize } from '@/utils/ui';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  contentBox: {
    flexGrow: 1,
    width: '100%',
    paddingTop: px(48),
    paddingHorizontal: px(24),
    paddingBottom: px(80),
    alignItems: 'center',
  },

  avatar: {
    width: px(72),
    height: px(72),
    borderRadius: px(36),
    borderWidth: px(2),
    borderColor: '#FFFFFF',
    backgroundColor: '#F2F2F2',
  },

  name: {
    marginTop: px(12),
    marginBottom: px(18),
    width: '100%',
    fontSize: fontSize(18),
    lineHeight: px(24),
    fontWeight: '500',
    textAlign: 'center',
  },
  darkName: {
    color: '#FFFFFF',
  },
  lightName: {
    color: '#333333',
  },

  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: px(12),
    paddingHorizontal: px(16),
    paddingVertical: px(14),
  },

  memberRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },

  memberTextBox: {
    flex: 1,
    marginLeft: px(12),
  },

  memberTitle: {
    fontSize: fontSize(14),
    lineHeight: px(20),
    color: '#333333',
  },

  memberDesc: {
    marginTop: px(4),
    fontSize: fontSize(12),
    lineHeight: px(17),
    color: '#C6C9D1',
  },

  listBox: {
    width: '100%',
    marginTop: px(12),
    borderRadius: px(12),
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },

  listItem: {
    width: '100%',
    paddingHorizontal: px(16),
    paddingVertical: px(14),
    flexDirection: 'row',
    alignItems: 'center',
  },

  listLabel: {
    flex: 1,
    marginLeft: px(12),
    fontSize: fontSize(14),
    lineHeight: px(20),
    color: '#333333',
  },

  logoutBox: {
    width: '100%',
    marginTop: px(12),
    borderRadius: px(12),
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
});

export default styles;
