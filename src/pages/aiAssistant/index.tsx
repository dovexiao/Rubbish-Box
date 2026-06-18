import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  PanResponder,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { impact } from 'react-native-haptic-feedback';
import { useFocusEffect } from '@react-navigation/core';
import AppIcon from '@/components/AppIcon';
import Flex from '@/components/Flex';
import { LinearGradient, PageContainer, TextInput } from '@/components';
import { showToast } from '@/utils';
import { px } from '@/utils/ui';
import MessageItem from './com/messageItem';
import styles from './styles';
import { ChatMessage } from './typing';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type VoiceStatus = 'idle' | 'recording' | 'cancel';

const CANCEL_SLIDE_THRESHOLD = 120;
const MIN_RECORD_DURATION = 1000;
const VOICE_HOLD_DELAY_MS = 500;

const triggerLightVibration = () => {
  try {
    impact('impactHeavy', 1, {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    });
  } catch {
    // 设备不支持触觉反馈时静默跳过
  }
};

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
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>('idle');
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const messageListRef = useRef<ScrollView>(null);
  const userInputContentRef = useRef<View>(null);
  const voiceButtonRef = useRef<View>(null);
  const recordStartTimeRef = useRef(0);
  const voiceStatusRef = useRef<VoiceStatus>('idle');
  const inputTypeRef = useRef(type);
  const pressActiveRef = useRef(false);
  const hasStartedRef = useRef(false);
  const cancelingRef = useRef(false);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userInputBoundsRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const voiceButtonBoundsRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const wasInsideUserInputRef = useRef(true);

  useEffect(() => {
    voiceStatusRef.current = voiceStatus;
  }, [voiceStatus]);

  useEffect(() => {
    inputTypeRef.current = type;
  }, [type]);

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
      setIsInputFocused(false);
    },
    [inputText],
  );

  const finishVoiceRecording = useCallback(
    (isCancel: boolean) => {
      hasStartedRef.current = false;
      cancelingRef.current = false;
      wasInsideUserInputRef.current = true;

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

  const clearHoldTimer = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, []);

  const updateUserInputBounds = useCallback(() => {
    userInputContentRef.current?.measureInWindow((x, y, width, height) => {
      userInputBoundsRef.current = { x, y, width, height };
    });
  }, []);

  const updateVoiceButtonBounds = useCallback(() => {
    voiceButtonRef.current?.measureInWindow((x, y, width, height) => {
      voiceButtonBoundsRef.current = { x, y, width, height };
    });
  }, []);

  const isTouchOnVoiceButton = useCallback((pageX: number, pageY: number) => {
    const { x, y, width, height } = voiceButtonBoundsRef.current;
    if (width <= 0 || height <= 0) {
      return true;
    }
    return (
      pageX >= x && pageX <= x + width && pageY >= y && pageY <= y + height
    );
  }, []);

  const isTouchInsideUserInput = useCallback((pageX: number, pageY: number) => {
    const { x, y, width, height } = userInputBoundsRef.current;
    if (width <= 0 || height <= 0) {
      return true;
    }
    return (
      pageX >= x && pageX <= x + width && pageY >= y && pageY <= y + height
    );
  }, []);

  const updateCancelStateFromTouch = useCallback(
    (moveX: number, moveY: number, startY: number) => {
      const isInsideUserInput = isTouchInsideUserInput(moveX, moveY);

      if (
        hasStartedRef.current &&
        isInsideUserInput !== wasInsideUserInputRef.current
      ) {
        wasInsideUserInputRef.current = isInsideUserInput;
        triggerLightVibration();
      }

      const shouldCancel =
        !isInsideUserInput || startY - moveY > CANCEL_SLIDE_THRESHOLD;

      if (shouldCancel !== cancelingRef.current) {
        cancelingRef.current = shouldCancel;
        setVoiceStatus(shouldCancel ? 'cancel' : 'recording');
      }
    },
    [isTouchInsideUserInput],
  );

  const beginVoiceRecording = useCallback(() => {
    if (!pressActiveRef.current || hasStartedRef.current) {
      return;
    }

    hasStartedRef.current = true;
    cancelingRef.current = false;
    wasInsideUserInputRef.current = true;
    recordStartTimeRef.current = Date.now();
    triggerLightVibration();
    setVoiceStatus('recording');
  }, []);

  const resetVoicePressState = useCallback(() => {
    pressActiveRef.current = false;
    clearHoldTimer();
  }, [clearHoldTimer]);

  useEffect(() => {
    return () => {
      clearHoldTimer();
    };
  }, [clearHoldTimer]);

  useEffect(() => {
    if (voiceStatus !== 'idle') {
      requestAnimationFrame(() => {
        updateUserInputBounds();
        updateVoiceButtonBounds();
      });
    }
  }, [voiceStatus, updateUserInputBounds, updateVoiceButtonBounds]);

  const voicePanHandlersRef = useRef({
    updateUserInputBounds,
    updateVoiceButtonBounds,
    clearHoldTimer,
    beginVoiceRecording,
    updateCancelStateFromTouch,
    resetVoicePressState,
    finishVoiceRecording,
    isTouchOnVoiceButton,
  });

  useEffect(() => {
    voicePanHandlersRef.current = {
      updateUserInputBounds,
      updateVoiceButtonBounds,
      clearHoldTimer,
      beginVoiceRecording,
      updateCancelStateFromTouch,
      resetVoicePressState,
      finishVoiceRecording,
      isTouchOnVoiceButton,
    };
  }, [
    updateUserInputBounds,
    updateVoiceButtonBounds,
    clearHoldTimer,
    beginVoiceRecording,
    updateCancelStateFromTouch,
    resetVoicePressState,
    finishVoiceRecording,
    isTouchOnVoiceButton,
  ]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        resetVoicePressState();
        hasStartedRef.current = false;
        cancelingRef.current = false;
        wasInsideUserInputRef.current = true;
        setVoiceStatus('idle');
      };
    }, [resetVoicePressState]),
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt, _gestureState) => {
        if (inputTypeRef.current !== 'voice' || pressActiveRef.current) {
          return false;
        }

        const { pageX, pageY } = evt.nativeEvent;
        return voicePanHandlersRef.current.isTouchOnVoiceButton(pageX, pageY);
      },
      onMoveShouldSetPanResponder: () => pressActiveRef.current,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (evt, _gestureState) => {
        if (inputTypeRef.current !== 'voice' || hasStartedRef.current) {
          return;
        }

        const handlers = voicePanHandlersRef.current;
        pressActiveRef.current = true;
        cancelingRef.current = false;
        handlers.updateUserInputBounds();
        handlers.updateVoiceButtonBounds();
        handlers.clearHoldTimer();

        holdTimerRef.current = setTimeout(() => {
          handlers.beginVoiceRecording();
        }, VOICE_HOLD_DELAY_MS);
      },
      onPanResponderMove: (evt, gestureState) => {
        if (!hasStartedRef.current) {
          return;
        }

        const pageX = evt.nativeEvent.pageX ?? gestureState.moveX;
        const pageY = evt.nativeEvent.pageY ?? gestureState.moveY;

        voicePanHandlersRef.current.updateCancelStateFromTouch(
          pageX,
          pageY,
          gestureState.y0,
        );
      },
      onPanResponderRelease: (evt, gestureState) => {
        const handlers = voicePanHandlersRef.current;
        handlers.resetVoicePressState();

        if (!hasStartedRef.current) {
          return;
        }

        const pageX = evt.nativeEvent.pageX ?? gestureState.moveX;
        const pageY = evt.nativeEvent.pageY ?? gestureState.moveY;

        handlers.updateCancelStateFromTouch(pageX, pageY, gestureState.y0);
        handlers.finishVoiceRecording(cancelingRef.current);
      },
      onPanResponderTerminate: () => {
        const handlers = voicePanHandlersRef.current;
        handlers.resetVoicePressState();

        if (!hasStartedRef.current) {
          return;
        }

        handlers.finishVoiceRecording(true);
      },
    }),
  ).current;

  const isVoiceRecording = type === 'voice' && voiceStatus !== 'idle';
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

  const renderVoiceButton = () => {
    if (voiceStatus === 'idle') {
      return (
        <View style={styles.questionInputContentVoiceIdle}>
          <Text style={styles.questionInputContentVoiceText}>按住说话</Text>
        </View>
      );
    }

    return (
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
        style={styles.questionInputContentVoiceActive}
      >
        {voiceStatus === 'recording' ? renderVoiceRipple() : null}
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

      if (isVoiceRecording) {
        return (
          <View
            style={[
              styles.questionInputContent,
              styles.questionInputContentRecording,
            ]}
          >
            {voiceInputBody}
          </View>
        );
      }

      return (
        <LinearGradient
          colors={['#f7f7f7', '#ffffff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[
            styles.questionInputContent,
            styles.questionInputContentVoiceRow,
            styles.questionInputShadow,
          ]}
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
          ref={userInputContentRef}
          onLayout={() => {
            updateUserInputBounds();
            updateVoiceButtonBounds();
          }}
          {...(type === 'voice' ? panResponder.panHandlers : {})}
          style={[
            styles.userInputContent,
            {
              paddingBottom:
                keyboardHeight > 0
                  ? keyboardHeight - px(60 + Math.max(insets.bottom, 24))
                  : px(24),
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
