import { fontSize, px } from '@/utils/ui';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  section: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: px(16),
    paddingVertical: px(16),
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toastText: {
    fontSize: fontSize(12),
    fontWeight: 'bold',
    color: '#999999',
    lineHeight: px(17),
  },
  toastTextRight: {
    fontSize: fontSize(12),
    lineHeight: px(17),
  },
  processingColor: {
    color: '#FF873D',
  },
  processedColor: {
    color: '#37C22A',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: px(12),
    gap: px(12),
  },
  label: {
    fontSize: fontSize(14),
    fontWeight: 'bold',
    color: '#333333',
    lineHeight: px(20),
  },
  value: {
    fontSize: fontSize(14),
    color: '#333333',
    lineHeight: px(20),
    flex: 1,
    textAlign: 'right',
  },
  timelineItem: {
    flexDirection: 'row',
    width: '100%',
  },
  timelineLeft: {
    width: px(16),
    alignItems: 'center',
    marginRight: px(12),
  },
  circle: {
    width: px(16),
    height: px(16),
    borderRadius: px(16),
    backgroundColor: '#E5E5E5',
  },
  circleBlack: {
    backgroundColor: '#333333',
  },
  circleGray: {
    backgroundColor: '#E5E5E5',
  },
  line: {
    width: 1,
    flex: 1,
    backgroundColor: '#E5E5E5',
    marginTop: px(2),
  },
  timelineRight: {
    flex: 1,
    paddingBottom: px(24),
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: px(12),
  },
  feedbackContent: {
    padding: px(12),
    borderRadius: px(12),
    backgroundColor: '#F6F7FA',
    minHeight: px(100),
    textAlign: 'center',
  },
  feedbackImageRow: {
    flexDirection: 'row',
    marginTop: px(12),
  },
  feedbackImage: {
    width: px(60),
    height: px(60),
    borderRadius: px(8),
    marginRight: px(8),
  },
  evaluateBox: {
    width: '100%',
    marginBottom: px(16),
    paddingHorizontal: px(16),
  },
  evaluateContentBox: {
    flexDirection: 'column',
    padding: px(16),
    marginVertical: px(24),
    backgroundColor: '#FFFFFF',
    borderRadius: px(12),
    borderWidth: 1,
    borderColor: '#eeeeee',
  },
  evaluateTitle: {
    fontSize: fontSize(14),
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: px(18),
    lineHeight: px(20),
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starLabel: {
    fontSize: fontSize(14),
    color: '#333333',
    marginRight: px(8),
  },
  star: {
    fontSize: fontSize(24),
    marginHorizontal: px(2),
  },
  starActive: {
    color: '#FFB400',
  },
  starInactive: {
    color: '#CCCCCC',
  },
  starText: {
    marginLeft: px(16),
    fontSize: fontSize(14),
    color: '#FFB400',
  },
  evaluateInputBox: {
    marginTop: px(12),
  },
  evaluateInput: {
    minHeight: px(80),
    textAlignVertical: 'top',
    backgroundColor: '#F7F6FA',
    borderRadius: px(12),
    paddingHorizontal: px(16),
    paddingVertical: px(16),
    fontSize: fontSize(12),
    color: '#333333',
  },
  lengthToast: {
    alignSelf: 'flex-end',
    marginTop: px(8),
    fontSize: fontSize(12),
    color: '#CCCCCC',
  },
  evaluateFooter: {
    marginTop: px(16),
    alignItems: 'center',
    marginBottom: px(24),
  },
  evaluateBtn: {
    minWidth: px(160),
    height: px(48),
    borderRadius: px(16),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#CCCCCC',
  },
  evaluateBtnActive: {
    backgroundColor: '#333333',
  },
  evaluateBtnText: {
    fontSize: fontSize(16),
    color: '#FFFFFF',
    fontWeight: 'bold',
    lineHeight: px(22),
  },
});

export default styles;
