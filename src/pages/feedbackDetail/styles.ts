import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: '#F6F7FA',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  toastText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999999',
  },
  toastTextRight: {
    fontSize: 14,
    color: '#999999',
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
    marginTop: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  value: {
    fontSize: 14,
    color: '#333333',
  },
  timelineItem: {
    flexDirection: 'row',
    width: '100%',
  },
  timelineLeft: {
    width: 16,
    alignItems: 'center',
    marginRight: 12,
  },
  circle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E5E5E5',
  },
  circleBlack: {
    backgroundColor: '#333333',
  },
  circleGray: {
    backgroundColor: '#E5E5E5',
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E5E5',
    marginTop: 2,
  },
  timelineRight: {
    flex: 1,
    paddingBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  feedbackContent: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F6F7FA',
    marginTop: 4,
  },
  feedbackImageRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  feedbackImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
  },
  evaluateBox: {
    marginTop: 8,
  },
  evaluateTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  starLabel: {
    fontSize: 14,
    color: '#333333',
    marginRight: 8,
  },
  star: {
    fontSize: 18,
    marginHorizontal: 2,
  },
  starActive: {
    color: '#FFB400',
  },
  starInactive: {
    color: '#CCCCCC',
  },
  evaluateInputBox: {
    marginTop: 12,
  },
  evaluateInput: {
    minHeight: 80,
    textAlignVertical: 'top',
    backgroundColor: '#F7F6FA',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#333333',
  },
  lengthToast: {
    alignSelf: 'flex-end',
    marginTop: 4,
    fontSize: 12,
    color: '#CCCCCC',
  },
  evaluateFooter: {
    marginTop: 16,
    alignItems: 'center',
  },
  evaluateBtn: {
    minWidth: 160,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#CCCCCC',
  },
  evaluateBtnActive: {
    backgroundColor: '#333333',
  },
  evaluateBtnText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default styles;

