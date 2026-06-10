import { fontSize, px } from '@/utils/ui';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    paddingHorizontal: px(16),
    paddingVertical: px(12),
    backgroundColor: '#f6f7fa',
  },

  row: {
    width: '100%',
    paddingHorizontal: px(16),
    paddingVertical: px(17),
    backgroundColor: '#FFFFFF',
    borderRadius: px(12),
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: px(12),
  },

  'row-left': {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: px(8),
  },

  'row-left_text': {
    fontSize: fontSize(14),
    color: '#333333',
  },
  'row-left_text2': {
    fontSize: fontSize(14),
    fontWeight: '500',
    color: '#333333',
  },

  row2: {
    width: '100%',
    paddingHorizontal: px(16),
    paddingVertical: px(17),
    backgroundColor: '#FFFFFF',
    borderRadius: px(12),
    marginBottom: px(12),
  },

  row2_text: {
    fontSize: fontSize(14),
    color: '#333333',
  },

  'row2-bottom': {
    marginTop: px(12),
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  'row2-bottom_text': {
    flex: 2,
    fontSize: fontSize(14),
    color: '#FD8E62',
  },

  'row2-bottom-right': {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },

  'row2-bottom-right_text2': {
    fontSize: fontSize(14),
    color: '#333333',
  },

  'row2-bottom2': {
    marginTop: px(20),
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  'row2-bottom2-item': {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: px(4),
  },

  'row2-bottom2-item2': {
    flex: 1,
    backgroundColor: '#f9f9f9',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: px(12),
    borderRadius: px(8),
  },

  'row2-bottom2_dividingLine': {
    width: px(1),
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    height: px(32),
  },

  'row2-bottom2-item_text': {
    fontSize: fontSize(20),
    color: '#333333',
    fontWeight: '500',
  },
  'row2-bottom2-item_text2': {
    fontSize: fontSize(12),
    color: '#ccc',
  },

  row3: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: px(16),
    paddingVertical: px(17),
    borderRadius: px(12),
  },

  'row3-item': {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: px(22),
  },

  'row3-item_text': {
    fontSize: fontSize(14),
    color: '#333333',
  },

  'row3-item-right': {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: px(4),
  },

  'row3-item-right_text': {
    fontSize: fontSize(14),
    color: '#333333',
  },
});

export default styles;
