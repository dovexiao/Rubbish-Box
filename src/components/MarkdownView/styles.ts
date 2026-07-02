import { fontSize, px } from '@/utils/ui';
import { StyleSheet } from 'react-native';

export const markdownStyles = StyleSheet.create({
  body: {
    color: '#333333',
    fontSize: fontSize(14),
    lineHeight: px(22),
  },
  heading1: {
    fontSize: fontSize(18),
    lineHeight: px(26),
    fontWeight: '600',
    color: '#333333',
    marginBottom: px(4),
  },
  heading2: {
    fontSize: fontSize(16),
    lineHeight: px(24),
    fontWeight: '600',
    color: '#333333',
    marginBottom: px(4),
  },
  heading3: {
    fontSize: fontSize(15),
    lineHeight: px(22),
    fontWeight: '600',
    color: '#333333',
    marginBottom: px(4),
  },
  heading4: {
    fontSize: fontSize(14),
    lineHeight: px(22),
    fontWeight: '600',
    color: '#333333',
  },
  heading5: {
    fontSize: fontSize(14),
    lineHeight: px(22),
    fontWeight: '600',
    color: '#333333',
  },
  heading6: {
    fontSize: fontSize(14),
    lineHeight: px(22),
    fontWeight: '600',
    color: '#333333',
  },
  paragraph: {
    marginTop: 0,
    marginBottom: px(8),
  },
  strong: {
    fontWeight: '600',
  },
  em: {
    fontStyle: 'italic',
  },
  s: {
    textDecorationLine: 'line-through',
  },
  link: {
    color: '#1677ff',
    textDecorationLine: 'underline',
  },
  blockquote: {
    backgroundColor: 'transparent',
    borderLeftWidth: px(3),
    borderLeftColor: '#e8e8e8',
    paddingLeft: px(10),
    marginBottom: px(8),
  },
  code_inline: {
    paddingHorizontal: px(4),
    paddingVertical: px(1),
    fontSize: fontSize(12),
    color: '#d4380d',
    backgroundColor: '#f5f5f5',
    borderRadius: px(3),
  },
  code_block: {
    padding: px(10),
    fontSize: fontSize(12),
    lineHeight: px(20),
    color: '#333333',
    backgroundColor: '#f5f5f5',
    borderRadius: px(6),
    marginBottom: px(8),
  },
  fence: {
    padding: px(10),
    fontSize: fontSize(12),
    lineHeight: px(20),
    color: '#333333',
    backgroundColor: '#f5f5f5',
    borderRadius: px(6),
    marginBottom: px(8),
  },
  bullet_list: {
    marginBottom: px(8),
  },
  ordered_list: {
    marginBottom: px(8),
  },
  list_item: {
    marginBottom: px(4),
  },
  hr: {
    backgroundColor: '#e8e8e8',
    height: 1,
    marginVertical: px(8),
  },
  tableScroll: {
    marginBottom: px(8),
    width: '100%',
  },
  tableScrollContent: {
    minWidth: '100%',
  },
  table: {
    width: '100%',
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: '#e8e8e8',
    borderRadius: px(6),
    overflow: 'hidden',
  },
  thead: {
    backgroundColor: '#fafafa',
  },
  tbody: {},
  tr: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderBottomWidth: 1,
    borderColor: '#e8e8e8',
  },
  th: {
    padding: px(6),
    borderRightWidth: 1,
    borderColor: '#e8e8e8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  td: {
    padding: px(6),
    borderRightWidth: 1,
    borderColor: '#e8e8e8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableCell: {
    minWidth: 0,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableCellText: {
    flexShrink: 1,
    textAlign: 'center',
  },
});
