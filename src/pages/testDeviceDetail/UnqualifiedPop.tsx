import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useState,
} from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Flex, GradientButton, Popup } from '@/components';
import styles from './styles';
import { px } from '@/utils/ui';

export interface UnqualifiedPopRef {
  open: () => void;
  close: () => void;
}

interface UnqualifiedPopProps {
  onConfirm: (testReason: string) => Promise<boolean> | boolean;
}

const UnqualifiedPop = forwardRef<UnqualifiedPopRef, UnqualifiedPopProps>(
  ({ onConfirm }, ref) => {
    const [visible, setVisible] = useState(false);
    const [testReason, setTestReason] = useState('');

    const handleOpen = useCallback(() => {
      setTestReason('');
      setVisible(true);
    }, []);

    const handleClose = useCallback(() => {
      setVisible(false);
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        open: handleOpen,
        close: handleClose,
      }),
      [handleClose, handleOpen],
    );

    const handleConfirm = useCallback(async () => {
      const ok = await onConfirm(testReason);
      if (ok) {
        setTestReason('');
        setVisible(false);
      }
    }, [onConfirm, testReason]);

    return (
      <Popup
        visible={visible}
        onClose={handleClose}
        title="本次测试结果为不合格"
        footer={
          <Flex style={styles.btnContainerWrapper}>
            <GradientButton
              height={px(48)}
              colors={['transparent', 'transparent']}
              onPress={() => {
                handleClose();
              }}
              style={[styles.btnContainer, styles.btnContainerClose]}
            >
              <Text style={[styles.btnContainerText]}>取消</Text>
            </GradientButton>
            <GradientButton
              height={px(48)}
              colors={['#282828', '#4A4A4A']}
              onPress={async () => {
                handleConfirm();
              }}
              style={[styles.btnContainer, styles.btnContainerConfirm]}
            >
              <Text
                style={[
                  styles.btnContainerConfirmText,
                  styles.btnContainerText,
                ]}
              >
                确定
              </Text>
            </GradientButton>
          </Flex>
        }
      >
        <View style={styles.popupBody}>
          <Text style={[styles.reasonLabel, { marginBottom: px(8) }]}>
            不合格原因
          </Text>
          <TextInput
            value={testReason}
            onChangeText={setTestReason}
            placeholder="请输入不合格原因"
            placeholderTextColor="#CCCCCC"
            style={{
              minHeight: px(88),
              borderRadius: px(8),
              borderWidth: px(1),
              borderColor: '#EAEAEA',
              paddingHorizontal: px(12),
              paddingVertical: px(8),
              color: '#333333',
              textAlignVertical: 'top',
            }}
            multiline
            maxLength={140}
          />
        </View>
      </Popup>
    );
  },
);

export default UnqualifiedPop;
