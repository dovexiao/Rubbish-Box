import React, { useEffect, useState } from 'react';
import { Image, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { PageContainer, Flex, GradientButton } from '@/components';
import { LOCK_BTN_COLORS, LOCK_STATUS } from '@/constants';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { styles } from './style';
import { reLaunch } from '@/utils';
import { px } from '@/utils/ui';

type RouteParams = {
  id?: string | number;
  pages?: string;
  isFromGroup?: boolean; // 是否是从组合设备来的
};

export default function BluetoothLinkSuccess() {
  const route = useRoute() as any;
  const navigation = useAppNavigation();
  const params: RouteParams = route?.params || {};

  const [backNum, setBackNum] = useState(3);

  useEffect(() => {
    if (backNum <= 0) return;
    const timer = setTimeout(() => {
      setBackNum(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearTimeout(timer);
  }, [backNum]);

  useEffect(() => {
    if (backNum > 0) return;
    if (!!params?.isFromGroup) {
      reLaunch('Multiple');
    } else {
      reLaunch(
        'Index',
        params.pages
          ? {
              pages: 'addDevice',
              id: params?.id,
            }
          : undefined,
      );
    }
  }, [backNum, params?.id, params.pages]);

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
            <Image
              source={{ uri: 'https://g.18qjz.cn/img/boklock/success.png' }}
              style={{ width: px(48), height: px(48) }}
              resizeMode="contain"
            />
            <Text style={styles.iconText}>
              {isAddPage ? '添加成功' : '连接成功'}
            </Text>
          </Flex>

          <Flex direction="column" align="center" style={styles.btnWrapper}>
            <Text style={styles.tips}>{backNum}s 秒后返回至首页</Text>
            <GradientButton
              colors={LOCK_BTN_COLORS[LOCK_STATUS.FALL_SUCCESS]}
              width={px(160)}
              height={px(44)}
              round={false}
              btnBorderRadius={px(16)}
              onPress={() => {
                if (!!params?.isFromGroup) {
                  reLaunch('Multiple');
                } else {
                  reLaunch(
                    'Index' as any,
                    !!isAddPage
                      ? { pages: 'addDevice', id: params?.id }
                      : undefined,
                  );
                }
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
