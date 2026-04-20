import { fontSize, px } from '@/utils/ui';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  titleRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f7f7fb',
    borderRadius: px(12),
    paddingLeft: px(10),
    paddingRight: px(8),
    height: px(27),
    lineHeight: px(27),
    width: px(100),
  },
  container: {
    flex: 1,
    padding: px(16),
    backgroundColor: '#F6F7FA',
  },
  section: {
    borderRadius: px(16),
    paddingHorizontal: px(16),
    paddingVertical: px(16),
    backgroundColor: '#ffffff',
  },
  textAreaContainer: {
    position: 'relative',
  },
  sectionTitle: {
    fontSize: fontSize(14),
    fontWeight: 'bold',
    lineHeight: px(20),
    color: '#333333',
  },
  textArea: {
    minHeight: px(80),
    textAlignVertical: 'top',
    fontSize: fontSize(12),
    color: '#333333',
    lineHeight: px(20),
  },
  lengthToast: {
    fontSize: fontSize(12),
    color: '#999999',
    textAlign: 'right',
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'reds',
  },
  imageList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: px(12),
  },
  imageItem: {
    width: px(72),
    height: px(72),
    borderRadius: px(8),
    marginRight: px(8),
    marginBottom: px(8),
  },
  uploader: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderStyle: 'solid',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    marginBottom: px(12),
    marginRight: px(12),
  },
  uploaderText: {
    marginTop: px(4),
    fontSize: fontSize(12),
    color: '#CCCCCC',
  },
  deleteBtn: {
    position: 'absolute',
    top: px(-6),
    right: px(-6),
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: px(12),
  },
  contactLabel: {
    width: px(60),
    fontSize: fontSize(14),
    color: '#333333',
  },
  contactInput: {
    flex: 1,
    fontSize: fontSize(14),
    color: '#333333',
    textAlign: 'right',
  },
  footerBtn: {
    width: px(191),
    height: px(44),
    borderRadius: px(16),
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerBtnDisabled: {
    backgroundColor: '#CCCCCC',
  },
  footerBtnText: {
    fontSize: fontSize(16),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  contactSection: {
    marginTop: px(16),
  },
});

export default styles;
