import React from 'react';
import {
  Platform,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  View,
} from 'react-native';

export const readOnlyTextInputStyle: TextStyle = {
  padding: 0,
  margin: 0,
  borderWidth: 0,
  backgroundColor: 'transparent',
  ...Platform.select({
    ios: {
      paddingVertical: 0,
    },
    android: {
      paddingVertical: 0,
      textAlignVertical: 'top',
      includeFontPadding: false,
    },
    default: {},
  }),
};

export function extractPlainText(node: React.ReactNode): string {
  if (node == null || typeof node === 'boolean') {
    return '';
  }
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(extractPlainText).join('');
  }
  if (React.isValidElement(node)) {
    return extractPlainText(
      (node.props as { children?: React.ReactNode }).children,
    );
  }
  return '';
}

export function containsInteractiveChild(node: React.ReactNode): boolean {
  if (!React.isValidElement(node)) {
    return false;
  }

  const props = node.props as { onPress?: unknown; children?: React.ReactNode };
  if (typeof props.onPress === 'function') {
    return true;
  }

  return React.Children.toArray(props.children).some(containsInteractiveChild);
}

interface SelectableTextProps {
  value: string;
  style?: StyleProp<TextStyle>;
  /** 气泡内使用时避免 TextInput 撑满整行 */
  shrinkWrap?: boolean;
}

export default function SelectableText({
  value,
  style,
  shrinkWrap = false,
}: SelectableTextProps) {
  if (!value) {
    return null;
  }

  if (Platform.OS === 'ios') {
    const input = (
      <TextInput
        value={value}
        multiline
        editable={false}
        scrollEnabled={false}
        selectTextOnFocus={false}
        caretHidden
        underlineColorAndroid="transparent"
        style={[
          style,
          readOnlyTextInputStyle,
          shrinkWrap ? styles.shrinkWrapInput : null,
        ]}
      />
    );

    if (shrinkWrap) {
      return <View style={styles.shrinkWrap}>{input}</View>;
    }

    return input;
  }

  return (
    <Text style={style} selectable>
      {value}
    </Text>
  );
}

const styles = StyleSheet.create({
  shrinkWrap: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  shrinkWrapInput: {
    alignSelf: 'flex-start',
  },
});
