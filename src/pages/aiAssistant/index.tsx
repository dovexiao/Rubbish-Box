import React, { useCallback, useEffect, useRef } from 'react';
import {
  Keyboard,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/core';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AvoidSoftInput } from 'react-native-avoid-softinput';
import AppIcon from '@/components/AppIcon';
import Flex from '@/components/Flex';
import { LinearGradient, PageContainer, TextInput } from '@/components';
import { useHoldToTalk, VoiceRipple } from '@/components/HoldToTalk';
import { useAIChat } from '@/hooks/useAIChat';
import { showToast } from '@/utils';
import { checkMicrophonePermission } from '@/utils/permissions';
import { px } from '@/utils/ui';
import MessageItem from './com/messageItem';
import TextMessageItem from './com/textMessage';
import styles from './styles';
import { ChatMessage, TextMessage } from './typing';
import { useTabBarHeight } from '@/hooks/useTabBarHeight';

const COMMON_QUESTIONS = ['我的地锁现在什么状态？', '修改手机号', '降下地锁'];
const DEFAULT_MESSAGES: TextMessage[] = [
  {
    id: '1',
    role: 'assistant',
    type: 'text',
    content:
      '你好！我是你的泊刻地锁专属小助手，我能帮你看看地锁现在什么状态，也可以帮你升降地锁、管理成员，快来向我提问吧！',
    isStreaming: false,
  },
];

function hasActiveConfirmFlow(messages: ChatMessage[]): boolean {
  return messages.some(message => {
    if (message.type === 'confirm') {
      return (
        message.processing ||
        message.submitted ||
        Boolean(message.isReplyStreaming)
      );
    }
    if (message.type === 'text' && message.confirm) {
      const confirm = message.confirm;
      return (
        confirm.processing ||
        confirm.submitted ||
        Boolean(confirm.isReplyStreaming)
      );
    }
    return false;
  });
}

const AiAssistant = () => {
  const insets = useSafeAreaInsets();
  const bottomSafePadding = Math.max(insets.bottom, px(6));
  const { tabBarHeight } = useTabBarHeight();
  const [inputText, setInputText] = React.useState('');
  const [isInputFocused, setIsInputFocused] = React.useState(false);
  const [type, setType] = React.useState<'text' | 'voice'>('text');
  const [keyboardHeight, setKeyboardHeight] = React.useState(0);

  const messageListRef = useRef<ScrollView>(null);

  const {
    messages,
    isLoading,
    sendMessage,
    sendVoiceMessage,
    confirmToolCall,
  } = useAIChat({ initialMessages: DEFAULT_MESSAGES });

  const scrollToBottom = useCallback(() => {
    messageListRef.current?.scrollToEnd({ animated: true });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, event => {
      setKeyboardHeight(event.endCoordinates?.height ?? 0);
      scrollToBottom();
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [scrollToBottom]);

  const handleInputContentSizeChange = useCallback(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  const handleChangeType = useCallback(async (nextType: 'text' | 'voice') => {
    if (nextType === 'voice') {
      const granted = await checkMicrophonePermission();
      if (!granted) {
        showToast({ title: '需要麦克风权限才能语音输入', icon: 'none' });
        return;
      }
      setIsInputFocused(false);
      Keyboard.dismiss();
    }
    setType(nextType);
  }, []);

  const handleToggleInputType = useCallback(() => {
    void handleChangeType(type === 'text' ? 'voice' : 'text');
  }, [handleChangeType, type]);

  const handleConfirmCancel = useCallback(
    (sessionId: string, confirmMessageId?: string) => {
      confirmToolCall(sessionId, { approved: false, confirmMessageId });
    },
    [confirmToolCall],
  );

  const handleConfirmSubmit = useCallback(
    (sessionId: string, confirmMessageId?: string) => {
      confirmToolCall(sessionId, { approved: true, confirmMessageId });
    },
    [confirmToolCall],
  );

  const handleSendMessage = useCallback(
    (text?: string) => {
      const content = (text ?? inputText).trim();
      if (!content || isLoading) return;

      sendMessage(content);
      setInputText('');
      setIsInputFocused(false);
      Keyboard.dismiss();
    },
    [inputText, isLoading, sendMessage],
  );

  const { voiceStatus, isVoiceRecording, voiceButtonRef, gestureCaptureProps } =
    useHoldToTalk({
      enabled: type === 'voice' && !isLoading,
      onResult: handleSendMessage,
      onVoiceFile: sendVoiceMessage,
      skipPermissionCheck: true,
    });

  const isExpandedInput =
    type === 'text' && (isInputFocused || inputText.length > 0);
  const canSend = inputText.trim().length > 0 && !isLoading;
  const hasStreamingAssistant = messages.some(
    message =>
      message.role === 'assistant' &&
      message.type === 'text' &&
      message.isStreaming,
  );
  const showThinking =
    isLoading && !hasStreamingAssistant && !hasActiveConfirmFlow(messages);

  const handleClickSend = () => {
    if (!canSend) return;
    handleSendMessage();
  };

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android') {
        return undefined;
      }

      AvoidSoftInput.setAdjustNothing();

      return () => {
        Keyboard.dismiss();
        AvoidSoftInput.setDefaultAppSoftInputMode();
      };
    }, []),
  );

  const renderInputToggleIcon = () => (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.questionInputContentLeft}
      onPress={handleToggleInputType}
    >
      <AppIcon
        name={type === 'text' ? 'icon_voice_input' : 'icon_keyboard'}
        size={px(24)}
        color="#333333"
      />
    </TouchableOpacity>
  );

  const renderSendButton = () => (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.questionInputContentRight}
      onPress={handleClickSend}
    >
      <AppIcon name={canSend ? 'icon_send1' : 'icon_send'} size={px(24)} />
    </TouchableOpacity>
  );

  const renderVoiceButton = () => {
    const isIdle = voiceStatus === 'idle';

    return (
      <LinearGradient
        colors={
          isIdle
            ? ['rgba(0,0,0,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0)']
            : voiceStatus === 'cancel'
            ? ['#fbcbca', '#fd908f', '#fbcbca']
            : ['#cddef9', '#88affd', '#cddef9']
        }
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={
          isIdle
            ? styles.questionInputContentVoiceIdle
            : styles.questionInputContentVoiceActive
        }
      >
        {isIdle && (
          <View pointerEvents="none">
            <Text style={styles.questionInputContentVoiceText}>按住说话</Text>
          </View>
        )}
        {voiceStatus === 'recording' ? (
          <View pointerEvents="none">
            <VoiceRipple />
          </View>
        ) : null}
      </LinearGradient>
    );
  };

  const renderQuestionInput = () => {
    if (isExpandedInput) {
      return (
        <LinearGradient
          colors={['#f7f7f7', '#ffffff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[
            styles.questionInputContent,
            styles.questionInputContentFocused,
            styles.questionInputShadow,
          ]}
        >
          <View style={styles.questionInputContentExpanded}>
            <TextInput
              autoFocus={isInputFocused}
              multiline
              scrollEnabled={false}
              editable={!isLoading}
              style={[
                styles.questionInputContentInput,
                styles.questionInputContentInputFocused,
              ]}
              value={inputText}
              placeholder="有什么需要问我吗？"
              placeholderTextColor="#cccccc"
              onBlur={() => setIsInputFocused(false)}
              onFocus={() => setIsInputFocused(true)}
              onChangeText={setInputText}
              onContentSizeChange={handleInputContentSizeChange}
            />
            <View style={styles.questionInputContentActions}>
              {renderInputToggleIcon()}
              {renderSendButton()}
            </View>
          </View>
        </LinearGradient>
      );
    }

    if (type === 'voice') {
      const voiceInputBody = (
        <>
          <View
            ref={voiceButtonRef}
            {...gestureCaptureProps}
            style={styles.questionInputContentVoiceFull}
          >
            {renderVoiceButton()}
          </View>
          {!isVoiceRecording && (
            <View style={styles.questionInputContentVoiceToggle}>
              {renderInputToggleIcon()}
            </View>
          )}
        </>
      );

      return (
        <LinearGradient
          key="voice"
          colors={
            isVoiceRecording
              ? ['rgba(0,0,0,0)', 'rgba(0,0,0,0)']
              : ['#f7f7f7', '#ffffff']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={
            isVoiceRecording
              ? styles.questionInputContentRecording
              : [
                  styles.questionInputContent,
                  styles.questionInputContentVoiceRow,
                  styles.questionInputShadow,
                ]
          }
        >
          {voiceInputBody}
        </LinearGradient>
      );
    }

    return (
      <LinearGradient
        colors={['#f7f7f7', '#ffffff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.questionInputContent, styles.questionInputShadow]}
      >
        {renderInputToggleIcon()}
        <TouchableOpacity
          style={[
            styles.questionInputContentInput,
            styles.questionInputContentInputRow,
          ]}
          onPress={() => setIsInputFocused(true)}
        >
          <Text style={styles.questionInputContentInputText}>
            有什么需要问我吗？
          </Text>
        </TouchableOpacity>
        {renderSendButton()}
      </LinearGradient>
    );
  };

  return (
    <PageContainer
      backgroundColor="#f4f4f4"
      statusBarBackgroundColor="#ffffff"
      statusBarStyle="dark-content"
      safeAreaEdges={['top']}
      scrollable={false}
      header={
        <View style={styles.navHeader}>
          <Flex
            direction="column"
            align="center"
            justify="center"
            style={styles.navTitle}
          >
            <Text style={styles.navTitleText}>泊刻AI</Text>
            <Text style={styles.navTitleTextSmall}>内容由AI生成</Text>
          </Flex>
        </View>
      }
    >
      <View style={styles.content}>
        <ScrollView
          ref={messageListRef}
          style={styles.messageList}
          contentContainerStyle={styles.messageListInner}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          scrollEnabled={!isVoiceRecording}
          onContentSizeChange={scrollToBottom}
        >
          {messages.map(message => (
            <MessageItem
              key={message.id}
              data={message}
              onConfirmCancel={handleConfirmCancel}
              onConfirmSubmit={handleConfirmSubmit}
            />
          ))}
          {showThinking ? (
            <TextMessageItem
              data={{
                id: '__thinking__',
                role: 'assistant',
                type: 'text',
                content: '',
                isStreaming: true,
              }}
            />
          ) : null}
        </ScrollView>

        <View
          style={[
            styles.userInputContent,
            {
              paddingBottom:
                keyboardHeight > 0
                  ? keyboardHeight + px(6) - tabBarHeight
                  : bottomSafePadding,
            },
          ]}
        >
          {!isVoiceRecording && (
            <Flex
              direction="row"
              align="center"
              style={styles.commonQuestionsRow}
            >
              <Text style={styles.commonQuestionsText}>常用问题：</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.commonQuestionsScroll}
                contentContainerStyle={styles.commonQuestionsItemList}
                keyboardShouldPersistTaps="handled"
              >
                {COMMON_QUESTIONS.map(item => (
                  <TouchableOpacity
                    key={item}
                    activeOpacity={0.85}
                    style={styles.commonQuestionsItem}
                    onPress={() => handleSendMessage(item)}
                    disabled={isLoading}
                  >
                    <Text style={styles.commonQuestionsItemText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Flex>
          )}

          {isVoiceRecording && (
            <Text
              style={[
                styles.voiceRecordingHint,
                voiceStatus === 'cancel' && styles.voiceRecordingHintCancel,
              ]}
            >
              {voiceStatus === 'cancel' ? '松手取消' : '松手发送 上滑取消'}
            </Text>
          )}

          {renderQuestionInput()}
        </View>
      </View>
    </PageContainer>
  );
};

export default AiAssistant;
