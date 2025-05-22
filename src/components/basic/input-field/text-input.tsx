import React from 'react';
import {Input, InputProps} from '@rneui/themed';
import {View, ViewProps, StyleSheet} from 'react-native';
import theme from '@/style';
import globalStore from '@/services/global.state';
import {BasicObject} from '@/types';

export interface TextInputProps {
  hasMax: boolean;
  style?: ViewProps;
  onMaxPress?: (value: string) => void;
  rightElement?: React.ReactElement<{}>;
  onValueChange?: (value: string) => void;
}

const TextInput: React.FC<InputProps & TextInputProps> = props => {
  const {
    value = '',
    onValueChange = () => {},
    placeholder,
    rightElement,
    hasMax = false,
  } = props;

  return (
    <View style={[styles.container, theme.border.primary50]}>
      <Input
        containerStyle={[theme.padding.lrm, styles.inputContainer]}
        inputContainerStyle={styles.inputContainerStyle}
        keyboardType="numeric"
        // eslint-disable-next-line react-native/no-inline-styles
        style={[styles.inputStyles, {outline: 'none'}]}
        value={value}
        errorStyle={styles.error}
        onChangeText={v => {
          if (v) {
            if (/^[0-9]+$/.test(v)) {
              onValueChange(v);
            } else {
              onValueChange(v || '');
            }
          } else {
            onValueChange('');
          }
        }}
        rightIcon={hasMax ? rightElement : undefined}
        placeholder={placeholder}
      />
    </View>
  );
};

const baseInputStyle = {
  minHeight: 48,
  maxHeight: 48,
  height: 48,
  padding: 0,
  ...theme.font.primaryMain,
  ...theme.font.m,
} as BasicObject;

const inputStyle = globalStore.isWeb
  ? {
      ...baseInputStyle,
      caretColor: theme.fontColor.main,
      outline: 'none',
    }
  : baseInputStyle;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00000026',
    ...theme.margin.btms,
    ...theme.borderRadius.s,
  },
  inputStyles: {
    ...inputStyle,
  },
  inputContainer: {
    paddingBottom: 0,
  },
  error: {
    margin: 0,
    height: 0,
  },
  inputContainerStyle: {
    borderBottomWidth: 0,
  },
});

export default TextInput;
