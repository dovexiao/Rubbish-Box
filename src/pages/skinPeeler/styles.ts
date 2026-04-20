import { fontSize, px } from '@/utils/ui';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: px(16),
    paddingVertical: px(8),
  },
  content: {
    width: '100%',
  },
  themeList: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  themeItem: {
    width: '50%',
    marginBottom: px(24),
    paddingHorizontal: px(8),
    alignItems: 'center',
  },
  themeCard: {
    width: '100%',
    height: px(165),
    borderRadius: px(12),
    overflow: 'hidden',
    backgroundColor: '#F6F7FA',
  },
  themeImage: {
    width: '100%',
    height: '100%',
  },
  themeInfo: {
    width: '100%',
    marginTop: px(12),
    alignItems: 'center',
  },
  currentButton: {
    width: px(56),
    height: px(30),
    borderRadius: px(12),
    backgroundColor: '#CCCCCC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchButton: {
    width: px(56),
    height: px(30),
    borderRadius: px(12),
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: fontSize(12),
    lineHeight: px(17),
  },
});

export default styles;
