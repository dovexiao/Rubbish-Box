import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AppIcon from '@/components/AppIcon';
import Flex from '@/components/Flex';
import { LinearGradient, PageContainer, TextInput } from '@/components';
import { useHoldToTalk, VoiceRipple } from '@/components/HoldToTalk';
import { showToast } from '@/utils';
import { px } from '@/utils/ui';
import MessageItem from './com/messageItem';
import styles from './styles';
import { ChatMessage } from './typing';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    role: 'assistant',
    type: 'text',
    content:
      '我可以帮你查设备状态、控制地锁、查看成员和跳转设置页面。涉及控制、删除、退款等动作时，会先让你确认。',
  },
  {
    id: '2',
    role: 'user',
    type: 'text',
    content: '修改手机号',
  },
  {
    id: '3',
    role: 'assistant',
    type: 'phoneChange',
    intro:
      '好的，因为修改手机号有一定风险，已为你找到修改手机号页面，点击即可进入。',
    maskedPhone: '182****8367',
  },
  {
    id: '4',
    role: 'user',
    type: 'text',
    content: '降下地锁',
  },
  {
    id: '5',
    role: 'assistant',
    type: 'confirm',
    content: '即将对Boke973DC6C3E8E6执行"手动降锁"',
  },
];

const COMMON_QUESTIONS = ['我的地锁现在什么状态？', '修改手机号', '降下地锁'];

const createMessageId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const getMockAssistantReply = (userText: string): ChatMessage => {
  const text = userText.trim();

  if (text === '修改手机号') {
    return {
      id: createMessageId(),
      role: 'assistant',
      type: 'phoneChange',
      intro:
        '好的，因为修改手机号有一定风险，已为你找到修改手机号页面，点击即可进入。',
      maskedPhone: '182****8367',
    };
  }

  if (text === '降下地锁') {
    return {
      id: createMessageId(),
      role: 'assistant',
      type: 'confirm',
      content: '即将对Boke973DC6C3E8E6执行"手动降锁"',
    };
  }

  if (text === '我的地锁现在什么状态？') {
    return {
      id: createMessageId(),
      role: 'assistant',
      type: 'text',
      content: '当前地锁处于升起状态，电量 85%，信号良好。',
    };
  }

  return {
    id: createMessageId(),
    role: 'assistant',
    type: 'text',
    content: '收到你的问题，我正在处理中，请稍候...',
  };
};

const AiAssistant = () => {
  const insets = useSafeAreaInsets();
  const [inputText, setInputText] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [type, setType] = useState<'text' | 'voice'>('text');
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const messageListRef = useRef<ScrollView>(null);

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

  const handleInputTextChange = useCallback((text: string) => {
    setInputText(text);
  }, []);

  const handleChangeType = useCallback((nextType: 'text' | 'voice') => {
    setType(nextType);
    if (nextType === 'voice') {
      setIsInputFocused(false);
    }
  }, []);

  const handleConfirmCancel = useCallback((messageId: string) => {
    showToast({ title: '已取消', icon: 'none' });
    console.log('confirm cancel', messageId);
  }, []);

  const handleConfirmSubmit = useCallback((messageId: string) => {
    showToast({ title: '已确认执行', icon: 'none' });
    console.log('confirm submit', messageId);
  }, []);

  const handleSendMessage = useCallback(
    (text?: string) => {
      const content = (text ?? inputText).trim();
      if (!content) return;

      const userMessage: ChatMessage = {
        id: createMessageId(),
        role: 'user',
        type: 'text',
        content,
      };
      const assistantMessage = getMockAssistantReply(content);

      setMessages(prev => [...prev, userMessage, assistantMessage]);
      setInputText('');
      setIsInputFocused(false);
    },
    [inputText],
  );

  const {
    voiceStatus,
    isVoiceRecording,
    voiceButtonRef,
    cancelAreaRef,
    panHandlers,
    updateVoiceButtonBounds,
    updateCancelAreaBounds,
  } = useHoldToTalk({
    enabled: type === 'voice',
    onResult: handleSendMessage,
  });

  useEffect(() => {
    if (type !== 'voice') {
      return;
    }

    requestAnimationFrame(() => {
      updateCancelAreaBounds();
      updateVoiceButtonBounds();
    });
  }, [type, updateCancelAreaBounds, updateVoiceButtonBounds]);

  const isExpandedInput =
    type === 'text' && (isInputFocused || inputText.length > 0);
  const canSend = inputText.trim().length > 0;

  const handleClickSend = () => {
    if (!canSend) return;
    handleSendMessage();
  };

  const renderInputToggleIcon = () => (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.questionInputContentLeft}
      onPress={() => handleChangeType(type === 'text' ? 'voice' : 'text')}
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
              style={[
                styles.questionInputContentInput,
                styles.questionInputContentInputFocused,
              ]}
              value={inputText}
              placeholder="有什么需要问我吗？"
              placeholderTextColor="#cccccc"
              onBlur={() => setIsInputFocused(false)}
              onFocus={() => setIsInputFocused(true)}
              onChangeText={handleInputTextChange}
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
          {!isVoiceRecording && (
            <View style={styles.questionInputContentVoiceToggle}>
              {renderInputToggleIcon()}
            </View>
          )}
          <View
            ref={voiceButtonRef}
            onLayout={updateVoiceButtonBounds}
            style={styles.questionInputContentVoiceFull}
          >
            {renderVoiceButton()}
          </View>
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
        <TextInput
          style={[
            styles.questionInputContentInput,
            styles.questionInputContentInputRow,
          ]}
          value={inputText}
          placeholder="有什么需要问我吗？"
          placeholderTextColor="#cccccc"
          returnKeyType="send"
          onFocus={() => setIsInputFocused(true)}
          onSubmitEditing={handleClickSend}
          onChangeText={handleInputTextChange}
        />
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
        </ScrollView>

        <View
          ref={cancelAreaRef}
          onLayout={() => {
            updateCancelAreaBounds();
            updateVoiceButtonBounds();
          }}
          {...(type === 'voice' ? panHandlers : {})}
          style={[
            styles.userInputContent,
            {
              paddingBottom:
                keyboardHeight > 0
                  ? keyboardHeight - px(60 + Math.max(insets.bottom, 6))
                  : px(6),
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
              {voiceStatus === 'cancel'
                ? '松手取消'
                : '松手发送，移出输入区取消'}
            </Text>
          )}

          {renderQuestionInput()}
        </View>
      </View>
    </PageContainer>
  );
};

export default AiAssistant;
