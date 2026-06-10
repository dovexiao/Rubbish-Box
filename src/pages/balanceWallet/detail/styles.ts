import { StyleSheet } from 'react-native';
import { fontSize, px } from '@/utils/ui';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
    paddingHorizontal: px(16),
    paddingTop: px(12),
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: px(12),
    padding: px(16),
  },
  statusText: {
    textAlign: 'center',
    fontSize: fontSize(14),
    fontWeight: '500',
    marginBottom: px(12),
  },
  amountText: {
    textAlign: 'center',
    color: '#333333',
    fontSize: fontSize(26),
    fontWeight: '500',
    marginBottom: px(24),
  },
  infoWrap: {
    paddingHorizontal: px(6),
  },
  infoRow: {
    marginBottom: px(24),
  },
  infoLabel: {
    color: '#333',
    fontSize: fontSize(14),
  },
  infoValue: {
    color: '#333',
    fontSize: fontSize(14),
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginBottom: px(24),
  },
  timelineWrap: {
    paddingLeft: px(6),
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: px(7),
    top: px(8),
    bottom: px(8),
    borderLeftWidth: 1,
    borderColor: '#C9C9C9',
    borderStyle: 'dashed',
  },
  timelineRow: {
    minHeight: px(32),
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: px(8),
  },
  timelineDot: {
    width: px(18),
    height: px(18),
    borderRadius: px(9),
    borderWidth: 3,
    borderColor: '#333333',
    backgroundColor: '#FFFFFF',
    marginRight: px(10),
    zIndex: 2,
  },
  timelineDotActive: {
    borderColor: '#333333',
  },
  timelineDotFail: {
    borderColor: '#FF2B24',
  },
  timelineText: {
    color: '#333333',
    fontSize: fontSize(14),
  },
  timelineTextFail: {
    color: '#333333',
  },
  progressContent: {
    height: px(78),
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
  },
});

export default styles;
