import {Input, InputProps} from '@rneui/themed';
import {View, StyleSheet, ActivityIndicator} from 'react-native';
import Text from '../text';
import React from 'react';
import theme from '@/style';
import globalStore from '@/services/global.state';
import {BasicObject, SafeAny} from '@/types';
import {NativeTouchableOpacity} from '../touchable-opacity';
import {useTranslation} from 'react-i18next';
import {sendCode} from '@/common-pages/login/login.service';
import baseVariable from '@/style/base.variable';

export interface InputFieldProps {
  required?: boolean;
  label: string;
  tip?: string;
  phoneNumber?: string;
  codeText?: string;
  hasCode?: boolean;
  name?: string;
  status?: 'success' | 'error';
  positionTranslation?: boolean;
}

const InputField: React.FC<InputProps & InputFieldProps> = props => {
  const timerRef = React.useRef<SafeAny>();
  const timeCount = React.useRef(60);
  const [sec, setSec] = React.useState(60);
  const [codeLoading, setCodeLoading] = React.useState(false);
  const [showTime, setShowTime] = React.useState(false);
  const {i18n} = useTranslation();
  const {
    required = false,
    label = '',
    tip,
    hasCode = false,
    phoneNumber = '',
    codeText = i18n.t('login.label.get-otp'),
    value,
    status,
    onChangeText,
    placeholder,
    keyboardType,
    maxLength,
    positionTranslation = false,
  } = props;

  const timeDown = () => {
    setShowTime(true);
    timerRef.current && clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (timeCount.current === 1) {
        setShowTime(false);
        clearInterval(timerRef.current);
        timeCount.current = 60;
        setSec(60);
      } else {
        timeCount.current -= 1;
        setSec(timeCount.current);
      }
    }, 1000);
  };

  const onSendCode = async () => {
    setCodeLoading(true);
    await sendCode(phoneNumber);
    setCodeLoading(false);
    timeDown();
  };

  return (
    <View
      style={[
        styles.container,
        theme.flex.centerByCol,
        status === 'error' && {borderColor: theme.basicColor.red},
      ]}>
      <View style={[theme.flex.flex1]}>
        <View style={[theme.flex.row, theme.flex.centerByCol]}>
          {positionTranslation && (
            <Text
              // eslint-disable-next-line react-native/no-inline-styles
              style={[theme.margin.rightxxs, {opacity: 0}]}
              color={theme.fontColor.red}>
              *
            </Text>
          )}
          {required && (
            <Text style={[theme.margin.rightxxs]} color={theme.fontColor.red}>
              *
            </Text>
          )}
          <Text white fontSize={14}>
            {label}
          </Text>
          {tip ? (
            <Text color={'#848490'} style={[theme.margin.lefts]}>
              {tip}
            </Text>
          ) : null}
        </View>
        <Input
          containerStyle={styles.containerStyle}
          inputContainerStyle={styles.inputContainerStyle}
          style={[
            styles.input,
            theme.font.fontInterBold,
            // eslint-disable-next-line react-native/no-inline-styles
            {outline: 'none'},
            status === 'error' && {color: theme.fontColor.red},
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          keyboardType={keyboardType}
          errorStyle={styles.error}
          maxLength={maxLength}
        />
      </View>
      {hasCode && (
        <NativeTouchableOpacity
          disabled={showTime || codeLoading}
          onPress={onSendCode}
          style={[styles.button, showTime && styles.disabled]}>
          {codeLoading ? (
            <ActivityIndicator />
          ) : (
            <Text
              color={
                showTime
                  ? baseVariable.fontColor.secAccent
                  : theme.basicColor.white
              }
              fontFamily="fontInterBold"
              fontSize={14}>
              {showTime ? `${sec}S` : codeText}
            </Text>
          )}
        </NativeTouchableOpacity>
      )}
    </View>
  );
};

const baseInputStyle = {
  minHeight: 40,
  maxHeight: 40,
  height: 40,
  padding: 0,
  ...theme.font.primaryMain,
  ...theme.font.m,
} as BasicObject;

const inputStyle = globalStore.isWeb
  ? {
      ...baseInputStyle,
      outline: 'none',
      caretColor: theme.fontColor.white,
    }
  : baseInputStyle;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    ...theme.borderRadius.m,
    ...theme.margin.btml,
  },
  input: {
    ...inputStyle,
  },
  error: {
    margin: 0,
    height: 0,
  },
  containerStyle: {
    paddingBottom: 0,
  },
  inputContainerStyle: {
    borderBottomWidth: 0,
  },
  button: {
    width: 78,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.background.primary,
    ...theme.borderRadius.xs,
  },
  disabled: {
    backgroundColor: '#DCDCE5',
  },
});

export default InputField;
