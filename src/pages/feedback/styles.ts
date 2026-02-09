import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  titleRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f7f7fb',
    borderRadius: 12,
    paddingLeft: 10,
    paddingRight: 8,
    height: 27,
    lineHeight: 27,
    width: 100,
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F6F7FA',
  },
  section: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
  },
  textAreaContainer: {
    position: 'relative',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    lineHeight: 20,
    color: '#333333',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: 12,
    color: '#333333',
    lineHeight: 20,
  },
  lengthToast: {
    fontSize: 12,
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
    marginTop: 12,
  },
  imageItem: {
    width: 72,
    height: 72,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  uploader: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderStyle: 'solid',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    marginBottom: 12,
    marginRight: 12,
  },
  uploaderText: {
    marginTop: 4,
    fontSize: 12,
    color: '#CCCCCC',
  },
  deleteBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  contactLabel: {
    width: 60,
    fontSize: 14,
    color: '#333333',
  },
  contactInput: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
    textAlign: 'right',
  },
  footerBtn: {
    width: 191,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerBtnDisabled: {
    backgroundColor: '#CCCCCC',
  },
  footerBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  contactSection: {
    marginTop: 16,
  },
});

export default styles;
