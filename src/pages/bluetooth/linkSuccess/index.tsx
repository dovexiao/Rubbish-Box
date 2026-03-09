import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { PageContainer, Flex, GradientButton } from '@/components';
import { LOCK_BTN_COLORS, LOCK_STATUS } from '@/constants';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { styles } from './style';

type RouteParams = {
  id?: string | number;
  pages?: string;
};

export default function BluetoothLinkSuccess() {
  const route = useRoute() as any;
  const navigation = useAppNavigation();
  const params: RouteParams = route?.params || {};

  const [backNum, setBackNum] = useState(3);

  useEffect(() => {
    const timer = setTimeout(() => {
      setBackNum(prev => {
        const next = prev - 1;
        if (next <= 0) {
          navigation.navigate('Index' as any);
        }
        return next;
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [backNum, navigation]);

  const isAddPage = !!params.pages;

  return (
    <PageContainer
      backgroundColor="#FFFFFF"
      statusBarStyle="dark-content"
      safeAreaEdges={['top', 'bottom']}
      padding={0}
      pageNavProps={{
        text: isAddPage ? '添加设备' : '连接设备',
        showBack: false,
        background: '#FFFFFF',
      }}
    >
      <View style={styles.container}>
        <Flex direction="column" align="center" style={styles.content}>
          <Flex align="center" style={styles.iconWrapper}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconEmoji}>✓</Text>
            </View>
            <Text style={styles.iconText}>
              {isAddPage ? '添加成功' : '连接成功'}
            </Text>
          </Flex>

          <Flex direction="column" align="center" style={styles.btnWrapper}>
            <Text style={styles.tips}>{backNum}s 秒后返回至首页</Text>
            <GradientButton
              colors={LOCK_BTN_COLORS[LOCK_STATUS.FALL_SUCCESS]}
              width={220}
              height={44}
              round={false}
              btnBorderRadius={16}
              onPress={() => {
                navigation.navigate('Index' as any);
              }}
            >
              <Text style={styles.btnText}>完成</Text>
            </GradientButton>
          </Flex>
        </Flex>
      </View>
    </PageContainer>
  );
}

