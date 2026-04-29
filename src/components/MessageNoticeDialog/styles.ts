import { fontSize, px } from '@/utils/ui';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 99999,
    alignItems: 'center',
  },
  noticeBox: {
    width: '92%',
    borderRadius: px(16),
    padding: px(16),
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    borderStyle: 'solid',
    borderWidth: px(1),
    borderColor: '#fff',
    overflow: 'hidden',
  },
  contentWrap: {
    flex: 1,
    marginRight: px(12),
  },
  title: {
    fontSize: fontSize(16),
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: px(4),
  },
  content: {
    lineHeight: px(18),
    fontSize: fontSize(14),
    color: '#333',
  },
  closeBtn: {
    padding: fontSize(8),
  },
  iconImg: {
    width: px(32),
    height: px(32),
    marginRight: px(8),
  },
  unreadBadge: {
    position: 'absolute',
    top: px(8),
    right: px(12),
    paddingVertical: px(3),
    paddingHorizontal: px(6),
    backgroundColor: '#FF8B83',
    borderRadius: px(12),
  },
  unreadBadgeText: {
    fontSize: fontSize(12),
    color: '#FFFFFF',
  },
});

export default styles;
