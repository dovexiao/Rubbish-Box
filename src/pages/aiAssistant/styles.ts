import { fontSize, px } from '@/utils/ui';
import { Platform, StyleSheet } from 'react-native';

export const INPUT_MIN_HEIGHT = px(20);
export const INPUT_MAX_HEIGHT = px(120);

const styles = StyleSheet.create({
  navHeader: {
    height: px(44),
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f4',
    backgroundColor: '#ffffff',
  },
  navTitle: {
    gap: px(4),
    paddingVertical: px(5),
  },
  navTitleText: {
    fontWeight: '500',
    fontSize: fontSize(14),
    color: '#333333',
    lineHeight: px(20),
    textAlign: 'center',
  },
  navTitleTextSmall: {
    fontWeight: '400',
    fontSize: fontSize(8),
    color: '#999999',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: px(12),
    minHeight: 0,
  },
  messageList: {
    flex: 1,
    minHeight: 0,
  },
  messageListInner: {
    paddingBottom: px(8),
  },
  inputFooter: {
    flexShrink: 0,
    width: '100%',
  },
  userInputContent: {
    width: '100%',
    flexShrink: 0,
    paddingBottom: px(12),
    gap: px(12),
    zIndex: 2,
  },
  commonQuestionsRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: px(8),
    paddingTop: px(12),
  },
  commonQuestionsText: {
    fontSize: fontSize(12),
    color: '#999999',
    flexShrink: 0,
  },
  commonQuestionsScroll: {
    flex: 1,
    minWidth: 0,
  },
  commonQuestionsItemList: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: px(8),
    paddingRight: px(4),
  },
  commonQuestionsItem: {
    flexShrink: 0,
    paddingVertical: px(8),
    paddingHorizontal: px(12),
    backgroundColor: '#ffffff',
    borderRadius: px(999),
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  commonQuestionsItemText: {
    fontSize: fontSize(12),
    color: '#333333',
    lineHeight: px(17),
  },
  voiceRecordingHint: {
    fontSize: fontSize(12),
    color: '#999999',
    lineHeight: px(17),
    textAlign: 'center',
  },
  voiceRecordingHintCancel: {
    color: '#ff4d4f',
  },
  questionInputContent: {
    width: '100%',
    minHeight: px(24),
    paddingVertical: px(12),
    paddingHorizontal: px(16),
    borderRadius: px(12),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.75)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: px(8),
    overflow: 'hidden',
  },
  questionInputContentText: {
    flexDirection: 'column',
    alignItems: 'stretch',
    overflow: 'visible',
  },
  questionInputContentFocused: {
    minHeight: px(24),
  },
  questionInputContentRecording: {
    height: px(24),
    padding: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  questionInputShadow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: px(2) },
    shadowOpacity: 0.12,
    shadowRadius: px(8),
    elevation: 4,
  },
  questionInputContentInput: {
    flex: 1,
    minWidth: 0,
    padding: 0,
    margin: 0,
    fontSize: fontSize(14),
    lineHeight: px(20),
    color: '#333333',
    backgroundColor: 'transparent',
  },
  questionInputContentInputFocused: {
    flexGrow: 0,
    flexShrink: 0,
    alignSelf: 'stretch',
    width: '100%',
    minHeight: INPUT_MIN_HEIGHT,
    maxHeight: INPUT_MAX_HEIGHT,
    marginBottom: px(12),
    textAlignVertical: 'top',
    ...Platform.select({
      android: {
        includeFontPadding: false,
        paddingVertical: 0,
      },
      default: {},
    }),
  },
  questionInputContentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    flexShrink: 0,
  },
  questionInputContentLeft: {
    width: px(24),
    height: px(24),
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  questionInputContentRight: {
    width: px(24),
    height: px(24),
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  questionInputContentVoice: {
    flex: 1,
    minWidth: 0,
    height: px(24),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: px(12),
    overflow: 'hidden',
  },
  questionInputContentVoiceText: {
    fontSize: fontSize(14),
    color: '#333333',
    lineHeight: px(24),
    textAlign: 'center',
  },
  questionInputContentVoiceRecording: {
    height: px(24),
    borderRadius: px(12),
  },
  questionInputContentVoiceCancel: {
    height: px(24),
    borderRadius: px(12),
  },
  voiceRecordingRipple: {
    width: px(40),
    height: px(24),
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceRecordingRippleRing: {
    position: 'absolute',
    borderRadius: px(999),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.45)',
  },
  voiceRecordingRippleRing1: {
    width: px(24),
    height: px(24),
    opacity: 0.9,
  },
  voiceRecordingRippleRing2: {
    width: px(40),
    height: px(40),
    opacity: 0.5,
  },
  voiceRecordingRippleRing3: {
    width: px(56),
    height: px(56),
    opacity: 0.25,
  },
});

export default styles;
