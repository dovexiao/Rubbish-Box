import AppIcon from '@/components/AppIcon';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Easing,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput as RNTextInput,
  View,
} from 'react-native';
import { PickerView } from '@ant-design/react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Flex from '@/components/Flex';
import { styles as styleSheet } from './indexStyle';
import { TextInput } from '@/components';
import { px } from '@/utils/ui';

const selector = [
  { label: '不限', value: 0 },
  { label: '1次', value: 1 },
  { label: '2次', value: 2 },
  { label: '3次', value: 3 },
  { label: '4次', value: 4 },
  { label: '5次', value: 5 },
];

export interface UseCountPopProps {
  active: boolean;
  value?: string;
  onChange?: (
    noLimit: number,
    customUsageCount: number,
    active: boolean,
  ) => void;
}

export interface UseCountPopRef {
  open: () => void;
  close: () => void;
}

const UseCountPop = forwardRef<UseCountPopRef, UseCountPopProps>(
  ({ active, value, onChange }, ref) => {
    const insets = useSafeAreaInsets();
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState<boolean>(active);
    const [pickerValue, setPickerValue] = useState<string | undefined>(value);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const inputRef = useRef<RNTextInput | null>(null);

    const slideAnim = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
      setMode(active);
    }, [active]);

    useEffect(() => {
      setPickerValue(value);
    }, [value]);

    useEffect(() => {
      const showEvent =
        Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
      const hideEvent =
        Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

      const showSub = Keyboard.addListener(showEvent, (e: any) => {
        setKeyboardVisible(true);
        setKeyboardHeight(e?.endCoordinates?.height || 0);
      });

      const hideSub = Keyboard.addListener(hideEvent, () => {
        setKeyboardVisible(false);
        setKeyboardHeight(0);
      });

      return () => {
        showSub.remove();
        hideSub.remove();
      };
    }, []);

    useEffect(() => {
      Animated.timing(slideAnim, {
        toValue: isOpen ? 1 : 0,
        duration: 300,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start();
    }, [isOpen, slideAnim]);

    const translateY = slideAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [294, 0],
    });

    useImperativeHandle(ref, () => ({
      open: () => setIsOpen(true),
      close: () => {
        Keyboard.dismiss();
        setIsOpen(false);
      },
    }));

    const focusInputSafely = () => {
      const input = inputRef.current;
      if (!input) return;

      // 处理 Android 键盘“收起”后 input 仍保持焦点导致无法再次唤起键盘的问题
      if (!keyboardVisible) {
        input.blur();
        setTimeout(() => {
          input.focus();
        }, 30);
        return;
      }

      if (!input.isFocused()) {
        input.focus();
      }
    };

    const handleConfirm = () => {
      const count = Number(pickerValue) || 0;
      const noLimit = count === 0 ? 1 : 0;
      onChange?.(noLimit, count, mode);
    };

    return (
      <Modal
        transparent
        visible={isOpen}
        presentationStyle="overFullScreen"
        statusBarTranslucent
        animationType="none"
      >
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: 'rgba(0,0,0,0.5)', opacity: slideAnim },
            ]}
          >
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => {
                Keyboard.dismiss();
                setIsOpen(false);
              }}
            />
          </Animated.View>

          <Animated.View
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom:
                mode || !keyboardVisible
                  ? 0
                  : px(Math.max(keyboardHeight - insets.bottom, 0)),
              paddingBottom: insets.bottom,
              backgroundColor: '#fff',
              transform: [{ translateY }],
              borderTopLeftRadius: px(16),
              borderTopRightRadius: px(16),
            }}
          >
            <Flex
              style={styleSheet.numRN}
              direction="row"
              justify="between"
              align="center"
            >
              <View style={{ width: px(24), height: px(24) }} />
              <Text style={styleSheet.popTitleText}>使用次数</Text>
              <Flex
                isTouchView
                onPress={() => setIsOpen(false)}
                style={{ marginRight: px(16) }}
              >
                <AppIcon name={'close'} size={px(24)} color="#333333" />
              </Flex>
            </Flex>

            <View style={{ paddingHorizontal: px(24) }}>
              <Flex
                style={styleSheet.useageCountTitle}
                direction="row"
                justify="center"
                align="center"
              >
                <Flex
                  isTouchView
                  align="center"
                  onPress={() => setMode(true)}
                  style={{ marginRight: px(24) }}
                >
                  <AppIcon
                    name={mode ? 'selected' : 'unselected'}
                    color={mode ? '#333333' : '#e1e1e1'}
                    size={px(24)}
                  />
                  <Text style={[styleSheet.text, { marginLeft: 4 }]}>
                    选择次数
                  </Text>
                </Flex>
                <Flex isTouchView onPress={() => setMode(false)} align="center">
                  <AppIcon
                    name={mode ? 'unselected' : 'selected'}
                    color={mode ? '#e1e1e1' : '#333333'}
                    size={px(24)}
                  />
                  <Text style={[styleSheet.text, { marginLeft: px(4) }]}>
                    自定义次数
                  </Text>
                </Flex>
              </Flex>

              {mode ? (
                <View style={{ width: '100%', marginVertical: px(16) }}>
                  <PickerView
                    data={selector as any}
                    value={[Number(pickerValue ?? 0)]}
                    onChange={(v: any) => {
                      const value0 = Array.isArray(v) ? v[0] : 0;
                      setPickerValue(String(value0 ?? 0));
                    }}
                    style={{ height: px(190) }}
                    itemHeight={px(44)}
                    itemStyle={{ padding: 0 }}
                  />
                </View>
              ) : (
                <Flex direction="column">
                  <Flex
                    direction="row"
                    justify="center"
                    align="center"
                    style={{ width: '100%' }}
                  >
                    <Flex
                      style={styleSheet.usageCountInput}
                      direction="row"
                      align="center"
                      isTouchView
                      onPress={focusInputSafely}
                    >
                      <TextInput
                        ref={inputRef}
                        style={{ flex: 1 }}
                        keyboardType="number-pad"
                        blurOnSubmit={false}
                        onPressIn={focusInputSafely}
                        value={pickerValue ?? ''}
                        onChangeText={text => {
                          const raw = text.replace(/\D/g, '');
                          setPickerValue(raw);
                        }}
                        placeholder="请输入使用次数"
                      />
                      <Text>次数</Text>
                    </Flex>
                  </Flex>
                </Flex>
              )}

              <Flex
                style={{
                  width: '100%',
                  marginTop: px(16),
                  marginBottom: px(8),
                }}
                direction="row"
                justify="center"
                align="center"
              >
                <Flex
                  direction="column"
                  justify="center"
                  align="center"
                  style={styleSheet.cancalBtn}
                  isTouchView
                  onPress={() => {
                    Keyboard.dismiss();
                    setPickerValue(undefined);
                    setIsOpen(false);
                  }}
                >
                  <Text>取消</Text>
                </Flex>
                <Flex
                  direction="column"
                  justify="center"
                  align="center"
                  style={[
                    styleSheet.confirmBtn,
                    pickerValue ? styleSheet.bgColor333 : styleSheet.bgColor999,
                  ]}
                  isTouchView
                  onPress={() => {
                    Keyboard.dismiss();
                    handleConfirm();
                    setIsOpen(false);
                  }}
                >
                  <Text style={styleSheet.confirmBtnText}>确定</Text>
                </Flex>
              </Flex>
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  },
);

export default UseCountPop;
