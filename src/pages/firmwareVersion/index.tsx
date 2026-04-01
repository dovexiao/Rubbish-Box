import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRoute } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Flex, PageContainer } from '@/components';
import AppIcon from '@/components/AppIcon';
import { lastVersion } from '@/services/deviceInfo';
import { styles } from './style';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { showToast } from '@/utils';

type LastVersionInfo = {
  version?: string;
  remark?: string;
};

export default function FirmwareVersion() {
  const navigation = useAppNavigation();
  const route = useRoute<any>();
  const { lockId, currentVersion } = (route.params || {}) as {
    lockId?: number;
    currentVersion?: string;
  };

  const [initialLoading, setInitialLoading] = useState(true);
  const [latestInfo, setLatestInfo] = useState<LastVersionInfo | null>(null);

  const latestVersion = latestInfo?.version || '';

  const fetchLatestVersion = useCallback(async () => {
    if (!lockId) {
      setLatestInfo(null);
      setInitialLoading(false);
      return;
    }

    setInitialLoading(true);
    try {
      const res: any = await lastVersion({ lockId });
      if (res?.code === 200 && res?.success) {
        setLatestInfo(res.data || null);
      } else {
        showToast({
          title: res?.message || res?.msg || '获取最新版本失败',
          icon: 'info',
        });
        setLatestInfo(null);
      }
    } catch (e) {
      showToast({ title: '获取最新版本失败', icon: 'info' });
      setLatestInfo(null);
    } finally {
      setInitialLoading(false);
    }
  }, [lockId]);

  useEffect(() => {
    fetchLatestVersion();
  }, [fetchLatestVersion]);

  const handleHistoryPress = useCallback(() => {
    if (!lockId) return;
    navigation.navigate('VersionHistory', { lockId });
  }, [lockId, navigation]);

  return (
    <PageContainer
      backgroundColor="#FFFFFF"
      statusBarStyle="dark-content"
      statusBarBackgroundColor="#FFFFFF"
      safeAreaEdges={['top', 'bottom']}
      scrollable={false}
      loading={initialLoading}
      pageNavProps={{
        text: '固件版本',
        showBack: true,
        background: '#FFFFFF',
        rightContent: (
          <TouchableOpacity
            style={styles.titleRight}
            onPress={handleHistoryPress}
            activeOpacity={0.8}
          >
            <Text style={styles.titleText}>历史记录</Text>
            <AppIcon name="a-headfor-12" color="#333333" size={16} />
          </TouchableOpacity>
        ),
      }}
      navBorder
    >
      <Flex direction="column" align="center" style={styles.body}>
        <Text style={styles.versionText}>{currentVersion || '--'}</Text>
        <Text style={styles.versionBottom}>当前版本</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {latestVersion ? `最新版本 ${latestVersion}` : '暂无最新版本信息'}
          </Text>
          <Text style={styles.cardText}>{latestInfo?.remark}</Text>
        </View>
      </Flex>
    </PageContainer>
  );
}
