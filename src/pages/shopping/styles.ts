import { px, fontSize } from '@/utils/ui';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    paddingTop: px(12),
    paddingHorizontal: px(16),
    backgroundColor: '#F6F7FA',
    paddingBottom: px(12),
  },
  goodsList: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  bottomBtnContent: {
    width: '100%',
    backgroundColor: '#F7F7FB',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: px(10),
    paddingBottom: px(10),
  },
  bottomBtn: {
    width: px(108),
    height: px(36),
    borderRadius: px(12),
    backgroundColor: '#FFFFFF',
    borderWidth: px(1),
    borderColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    boxShadow: '0 2px 12px 0 rgba(0, 0, 0, 0.25)',
  },
  bottomBtnText: {
    fontSize: fontSize(14),
    color: '#333333',
    paddingLeft: px(8),
    fontWeight: 'bold',
  },
});

export default styles;
