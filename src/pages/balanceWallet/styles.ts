import { fontSize, px } from '@/utils/ui';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },

  balanceContent: {
    marginHorizontal: px(16),
    marginTop: px(12),
    marginBottom: px(16),
    backgroundColor: '#FFFFFF',
    borderRadius: px(12),
    height: px(183),
    paddingVertical: px(24),
  },

  balanceContent_text: {
    color: '#999',
    fontSize: fontSize(14),
  },
  balanceContent_text2: {
    color: '#333',
    fontSize: fontSize(28),
    fontWeight: '500',
    marginTop: px(4),
    marginBottom: px(24),
  },

  'balanceContent-button': {
    backgroundColor: '#FF5C3A',
    borderRadius: px(12),
    width: px(174),
    height: px(48),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  'balanceContent-button_text': {
    fontSize: fontSize(16),
    color: '#FFFFFF',
    fontWeight: '500',
  },

  tabItem: {
    width: px(104),
    height: px(36),
    borderRadius: px(12),
    backgroundColor: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  'tabItem--active': {
    width: px(104),
    height: px(36),
    borderRadius: px(12),
    backgroundColor: '#fff6f4',
    borderWidth: px(1),
    borderColor: '#FF5C3A',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  tabItem_text: {
    fontSize: fontSize(14),
    color: '#333',
    fontWeight: '500',
  },

  'tabItem_text--active': {
    fontSize: fontSize(14),
    color: '#FF5C3A',
    fontWeight: '500',
  },

  listContent: {
    flex: 1,
    padding: px(16),
    paddingBottom: px(0),
    borderTopLeftRadius: px(16),
    borderTopRightRadius: px(16),
    backgroundColor: '#f6f7fa',
  },

  listItem: {},

  listItem_text: {
    color: '#333',
    fontSize: fontSize(14),
  },
  listItem_text2: {
    color: '#999',
    fontSize: fontSize(12),
  },

  listItem_icon: {
    marginLeft: px(2),
    transform: [{ rotate: '90deg' }],
  },

  'listItem-content': {
    padding: px(16),
    marginBottom: px(12),
    borderRadius: px(12),
    backgroundColor: '#fff',
  },
});

export default styles;
