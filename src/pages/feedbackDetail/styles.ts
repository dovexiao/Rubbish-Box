import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  section: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toastText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#999999',
    lineHeight: 17,
  },
  toastTextRight: {
    fontSize: 12,
    lineHeight: 17,
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
    marginTop: 12,
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    lineHeight: 20,
  },
  value: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
    flex: 1,
    textAlign: 'right',
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
    width: 16,
    height: 16,
    borderRadius: 16,
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
    marginTop: 2,
  },
  timelineRight: {
    flex: 1,
    paddingBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  feedbackContent: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F6F7FA',
    minHeight: 100,
    textAlign: 'center',
  },
  feedbackImageRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  feedbackImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
  },
  evaluateBox: {
    width: '100%',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  evaluateContentBox: {
    flexDirection: 'column',
    padding: 16,
    marginVertical: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eeeeee',
  },
  evaluateTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 18,
    lineHeight: 20,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starLabel: {
    fontSize: 14,
    color: '#333333',
    marginRight: 8,
  },
  star: {
    fontSize: 24,
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 12,
    color: '#333333',
  },
  lengthToast: {
    alignSelf: 'flex-end',
    marginTop: 8,
    fontSize: 12,
    color: '#CCCCCC',
  },
  evaluateFooter: {
    marginTop: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  evaluateBtn: {
    minWidth: 160,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#CCCCCC',
  },
  evaluateBtnActive: {
    backgroundColor: '#333333',
  },
  evaluateBtnText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
    lineHeight: 22,
  },
});

export default styles;
