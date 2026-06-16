import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView as RNKeyboardAvoidingView,
  NativeSyntheticEvent,
  PanResponder,
  Platform,
  ScrollView,
  Text,
  TextInputContentSizeChangeEventData,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/core';
import AppIcon from '@/components/AppIcon';
import Flex from '@/components/Flex';
import { LinearGradient, PageContainer, TextInput } from '@/components';
import { showToast } from '@/utils';
import { px } from '@/utils/ui';
import MessageItem from './com/messageItem';
import styles, { INPUT_MAX_HEIGHT, INPUT_MIN_HEIGHT } from './styles';
import { ChatMessage } from './typing';

type VoiceStatus = 'idle' | 'recording' | 'cancel';

const CANCEL_SLIDE_THRESHOLD = 60;
const MIN_RECORD_DURATION = 1000;

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
  const [inputText, setInputText] = useState('');
  const [inputHeight, setInputHeight] = useState(INPUT_MIN_HEIGHT);
  const [inputExtraHeight, setInputExtraHeight] = useState(0);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [type, setType] = useState<'text' | 'voice'>('text');
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>('idle');
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);

  const messageListRef = useRef<ScrollView>(null);
  const touchStartYRef = useRef(0);
  const recordStartTimeRef = useRef(0);
  const shouldSendRef = useRef(false);
  const voiceStatusRef = useRef<VoiceStatus>('idle');
  const inputTypeRef = useRef(type);

  useEffect(() => {
    voiceStatusRef.current = voiceStatus;
  }, [voiceStatus]);

  useEffect(() => {
    inputTypeRef.current = type;
  }, [type]);

  useEffect(() => {
    messageListRef.current?.scrollToEnd({ animated: true });
  }, [messages, inputExtraHeight]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        shouldSendRef.current = false;
        setVoiceStatus('idle');
      };
    }, []),
  );

  const handleInputContentSizeChange = useCallback(
    (event: NativeSyntheticEvent<TextInputContentSizeChangeEventData>) => {
      const nextHeight = Math.ceil(event.nativeEvent.contentSize.height);
      const clampedHeight = Math.min(
        INPUT_MAX_HEIGHT,
        Math.max(INPUT_MIN_HEIGHT, nextHeight),
      );
      setInputHeight(clampedHeight);
      setInputExtraHeight(Math.max(clampedHeight - INPUT_MIN_HEIGHT, 0));
    },
    [],
  );

  const handleInputTextChange = useCallback((text: string) => {
    setInputText(text);
    if (!text) {
      setInputHeight(INPUT_MIN_HEIGHT);
      setInputExtraHeight(0);
    }
  }, []);

  const handleChangeType = useCallback((nextType: 'text' | 'voice') => {
    setType(nextType);
    if (nextType === 'voice') {
      setIsInputFocused(false);
    }
  }, []);

  const handleVoiceSend = useCallback(
    (_tempFilePath: string, duration: number) => {
      // TODO: 接入语音识别 / 发送语音消息
      console.log('voice recorded', _tempFilePath, duration);
    },
    [],
  );

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
      setInputHeight(INPUT_MIN_HEIGHT);
      setInputExtraHeight(0);
      setIsInputFocused(false);
    },
    [inputText],
  );

  const finishVoiceRecording = useCallback(
    (isCancel: boolean) => {
      shouldSendRef.current = !isCancel;

      if (!isCancel) {
        const duration = Date.now() - recordStartTimeRef.current;
        if (duration < MIN_RECORD_DURATION) {
          showToast({ title: '说话时间太短', icon: 'none' });
        } else {
          handleVoiceSend('', duration);
        }
      }

      setVoiceStatus('idle');
    },
    [handleVoiceSend],
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () =>
        inputTypeRef.current === 'voice' && voiceStatusRef.current === 'idle',
      onMoveShouldSetPanResponder: () => voiceStatusRef.current !== 'idle',
      onPanResponderGrant: evt => {
        if (voiceStatusRef.current !== 'idle') return;

        const touch = evt.nativeEvent;
        touchStartYRef.current = touch.pageY;
        shouldSendRef.current = true;
        recordStartTimeRef.current = Date.now();
        setVoiceStatus('recording');
      },
      onPanResponderMove: evt => {
        if (voiceStatusRef.current === 'idle') return;

        const deltaY = touchStartYRef.current - evt.nativeEvent.pageY;
        const nextStatus: VoiceStatus =
          deltaY > CANCEL_SLIDE_THRESHOLD ? 'cancel' : 'recording';

        if (nextStatus !== voiceStatusRef.current) {
          setVoiceStatus(nextStatus);
        }
      },
      onPanResponderRelease: () => {
        if (voiceStatusRef.current === 'idle') return;
        finishVoiceRecording(voiceStatusRef.current === 'cancel');
      },
      onPanResponderTerminate: () => {
        if (voiceStatusRef.current === 'idle') return;
        finishVoiceRecording(voiceStatusRef.current === 'cancel');
      },
    }),
  ).current;

  const isVoiceRecording = type === 'voice' && voiceStatus !== 'idle';
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
      <AppIcon
        name={canSend ? 'icon_send1' : 'icon_send'}
        size={px(24)}
        // color="#333333"
      />
    </TouchableOpacity>
  );

  const renderVoiceRipple = () => (
    <View style={styles.voiceRecordingRipple}>
      <View
        style={[
          styles.voiceRecordingRippleRing,
          styles.voiceRecordingRippleRing1,
        ]}
      />
      <View
        style={[
          styles.voiceRecordingRippleRing,
          styles.voiceRecordingRippleRing2,
        ]}
      />
      <View
        style={[
          styles.voiceRecordingRippleRing,
          styles.voiceRecordingRippleRing3,
        ]}
      />
    </View>
  );

  const renderQuestionInput = () => {
    if (isVoiceRecording) {
      return (
        <View
          style={[
            styles.questionInputContent,
            styles.questionInputContentRecording,
          ]}
        >
          <View
            {...panResponder.panHandlers}
            style={{ flex: 1, width: '100%' }}
          >
            <LinearGradient
              colors={
                voiceStatus === 'cancel'
                  ? ['#ff6b6b', '#ffa8a8', '#fff5f5']
                  : [
                      'rgba(82, 152, 255, 0.08)',
                      'rgba(82, 152, 255, 0.35)',
                      '#5298ff',
                    ]
              }
              start={{ x: 0, y: 0 }}
              end={voiceStatus === 'cancel' ? { x: 1, y: 0 } : { x: 0, y: 1 }}
              style={[
                styles.questionInputContentVoice,
                voiceStatus === 'recording'
                  ? styles.questionInputContentVoiceRecording
                  : styles.questionInputContentVoiceCancel,
              ]}
            >
              {renderVoiceRipple()}
            </LinearGradient>
          </View>
        </View>
      );
    }

    if (type === 'text') {
      return (
        <LinearGradient
          colors={['#f7f7f7', '#ffffff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[
            styles.questionInputContent,
            isInputFocused && styles.questionInputContentText,
            isInputFocused && styles.questionInputContentFocused,
            styles.questionInputShadow,
          ]}
        >
          {!isInputFocused && renderInputToggleIcon()}
          <TextInput
            autoFocus={isInputFocused}
            multiline={isInputFocused}
            scrollEnabled={isInputFocused && inputHeight >= INPUT_MAX_HEIGHT}
            style={[
              styles.questionInputContentInput,
              isInputFocused && styles.questionInputContentInputFocused,
              isInputFocused ? { height: inputHeight } : null,
            ]}
            value={inputText}
            placeholder="有什么需要问我吗？"
            placeholderTextColor="#cccccc"
            returnKeyType="default"
            blurOnSubmit={false}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            onChangeText={handleInputTextChange}
            onContentSizeChange={
              isInputFocused ? handleInputContentSizeChange : undefined
            }
          />
          {isInputFocused ? (
            <View style={styles.questionInputContentActions}>
              {renderInputToggleIcon()}
              {renderSendButton()}
            </View>
          ) : (
            renderSendButton()
          )}
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
        <View {...panResponder.panHandlers} style={{ flex: 1, minWidth: 0 }}>
          <View style={styles.questionInputContentVoice}>
            <Text style={styles.questionInputContentVoiceText}>按住说话</Text>
          </View>
        </View>
      </LinearGradient>
    );
  };

  const renderInputArea = () => (
    <Flex direction="column" style={styles.userInputContent}>
      {!isVoiceRecording && (
        <Flex direction="row" align="center" style={styles.commonQuestionsRow}>
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
          {voiceStatus === 'cancel' ? '松手取消' : '松手发送 上滑取消'}
        </Text>
      )}

      {renderQuestionInput()}
    </Flex>
  );

  const renderChatBody = () => (
    <View style={styles.content}>
      <Flex style={styles.messageList} direction="column">
        {messages.map(message => (
          <MessageItem
            key={message.id}
            data={message}
            onConfirmCancel={handleConfirmCancel}
            onConfirmSubmit={handleConfirmSubmit}
          />
        ))}
      </Flex>

      {renderInputArea()}
    </View>
  );

  return (
    <PageContainer
      backgroundColor="#f4f4f4"
      statusBarBackgroundColor="#ffffff"
      statusBarStyle="dark-content"
      scrollable={false}
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
      {renderChatBody()}
    </PageContainer>
  );
};

export default AiAssistant;
