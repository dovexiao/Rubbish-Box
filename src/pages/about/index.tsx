import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PageContainer } from '@/components';
import AppIcon from '@/components/AppIcon';
import styles from './styles';
import { px } from '@/utils/ui';

const USER_AGREEMENT_URL =
  'https://g.18qjz.cn/protocol/boklock/userAgreement.html';
const PRIVACY_POLICY_URL =
  'https://g.18qjz.cn/protocol/boklock/privacyPolicy.html';

export default function About() {
  const navigation = useNavigation<any>();

  const openWeb = (url: string, title: string) => {
    navigation.navigate('WebView' as never, { url, title } as never);
  };

  return (
    <PageContainer
      backgroundColor="#FFFFFF"
      statusBarStyle="dark-content"
      statusBarBackgroundColor="#FFFFFF"
      safeAreaEdges={['top', 'bottom']}
      pageNavProps={{
        text: '关于泊刻地锁',
        showBack: true,
        background: '#FFFFFF',
      }}
    >
      <View style={styles.container}>
        {/* 用户协议 */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.itemFirst}
          onPress={() => openWeb(USER_AGREEMENT_URL, '用户协议')}
        >
          <Text style={styles.itemText}>用户协议</Text>
          <AppIcon name="a-headfor-20" size={px(20)} color="#333333" />
        </TouchableOpacity>

        {/* 隐私政策 */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.item}
          onPress={() => openWeb(PRIVACY_POLICY_URL, '隐私政策')}
        >
          <Text style={styles.itemText}>隐私政策</Text>
          <AppIcon name="a-headfor-20" size={px(20)} color="#333333" />
        </TouchableOpacity>
      </View>
    </PageContainer>
  );
}
