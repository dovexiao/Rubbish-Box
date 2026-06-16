import React from 'react';
import { Text, View } from 'react-native';
import AppIcon from '@/components/AppIcon';
import { TextInput } from '@/components';
import { PhoneChangeMessage } from '../../typing';
import { px } from '@/utils/ui';
import styles from './styles';

interface Props {
  data: PhoneChangeMessage;
}

export default function PhoneChangeCard({ data }: Props) {
  const maskedPhone = data.maskedPhone || '182****8367';

  return (
    <View style={styles.messageRow}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>更换手机号</Text>
          <View style={styles.link}>
            <Text style={styles.linkText}>点击前往</Text>
            <AppIcon name="a-nextpage" size={px(12)} color="#999999" />
          </View>
        </View>
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>原手机号码验证</Text>
          <Text style={styles.formDesc}>
            {`请输入改账号绑定的原手机号${maskedPhone}，完成手机验证`}
          </Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            placeholder="请输入手机号"
            placeholderTextColor="#cccccc"
          />
          <View style={styles.codeRow}>
            <TextInput
              style={styles.codeInput}
              keyboardType="number-pad"
              placeholder="请输入验证码"
              placeholderTextColor="#cccccc"
            />
            <View style={styles.codeDivider} />
            <View style={styles.codeBtn}>
              <Text style={styles.codeBtnText}>获取验证码</Text>
            </View>
          </View>
          <View style={styles.submitBtn}>
            <Text style={styles.submitBtnText}>确定</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
