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
  avatarTouchable: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: px(16),
  },
  avatarLeft: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: px(13),
  },
  avatar: {
    width: px(40),
    height: px(40),
    borderRadius: px(10),
    borderWidth: px(2),
    borderColor: '#FFFFFF',
    backgroundColor: '#F2F2F2',
  },

  name: {
    fontSize: fontSize(16),
    lineHeight: px(22),
    fontWeight: '500',
  },
  darkName: {
    color: '#FFFFFF',
  },
  lightName: {
    color: '#333333',
  },
  deviceManageCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: px(12),
    paddingHorizontal: px(16),
    paddingTop: px(10),
    paddingBottom: px(16),
    gap: px(12),
  },
  deviceManageCardTitle: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deviceManageCardTitleText: {
    fontSize: fontSize(14),
    lineHeight: px(20),
    color: '#333333',
  },
  deviceManageList: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: px(8),
  },
  deviceManageListItem: {
    // flex: 1,
    alignItems: 'center',
    gap: px(4),
  },
  deviceManageListItemLast: {
    // flexShrink: 0,
  },
  deviceManageListItemIcon: {
    width: px(26),
    height: px(26),
  },
  deviceManageListItemText: {
    fontSize: fontSize(12),
    lineHeight: px(17),
    color: '#333333',
  },
  businessCenterCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: px(12),
    paddingHorizontal: px(16),
    paddingTop: px(10),
    paddingBottom: px(16),
    marginTop: px(12),
  },
  businessCenterCardTitle: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  businessCenterCardTitleText: {
    fontSize: fontSize(14),
    lineHeight: px(20),
    color: '#333333',
  },
  businessCenterBody: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: px(20),
  },
  businessCenterBodyItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: px(4),
  },
  businessCenterBodyItemText: {
    fontSize: fontSize(20),
    lineHeight: px(28),
    color: '#333333',
    fontWeight: '500',
  },
  businessCenterBodyItemValue: {
    fontSize: fontSize(12),
    lineHeight: px(17),
    color: '#CCCCCC',
  },
  businessCenterBodyItemTextBold: {
    fontSize: fontSize(20),
    lineHeight: px(28),
    color: '#CCCCCC',
  },
  businessCenterBodyItemLine: {
    width: px(1),
    height: px(32),
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  businessCenterList: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: px(8),
    marginTop: px(20),
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
    marginTop: px(26),
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: px(8),
    width: '100%',
  },
  logoutText: {
    fontSize: fontSize(14),
    lineHeight: px(20),
    color: '#CCCCCC',
  },
});

export default styles;
