import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { PageContainer } from '@/components';
import { chooseSkin, getSkinList } from '@/services/user';
import { useTheme } from '@/context/ThemeContext';
import styles from './styles';
import { showToast } from '@/utils';

interface ThemeItem {
  code: string;
  hasChoose: boolean;
  url: string;
}

export default function SkinPeeler() {
  const { setTheme } = useTheme();
  const [themeList, setThemeList] = useState<ThemeItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadThemes = useCallback(async () => {
    try {
      const res = await getSkinList({});
      const list: ThemeItem[] = (res as any)?.data ?? res ?? [];
      setThemeList(list);
    } catch (e) {
      showToast({ title: '获取皮肤列表失败', icon: 'info' });
    }
  }, []);

  useEffect(() => {
    loadThemes();
  }, [loadThemes]);

  const handleThemeChange = useCallback(
    async (themeCode: string) => {
      if (loading) return;
      setLoading(true);
      try {
        const res = await chooseSkin({ code: themeCode });
        const code = (res as any)?.code ?? (res as any)?.status;
        if (String(code) === '200') {
          setThemeList(prev =>
            prev.map(item => ({
              ...item,
              hasChoose: item.code === themeCode,
            })),
          );

          // 简单映射：根据 code 设置深浅主题（可按实际业务调整）
          // 例如：后端约定某些 code 为暗色主题
          if (themeCode === 'deep') {
            setTheme('dark');
          } else if (themeCode === 'shallow') {
            setTheme('light');
          }

          showToast({ title: '切换成功', icon: 'info' });
        } else {
          showToast({
            title: (res as any)?.message || '切换失败',
            icon: 'info',
          });
        }
      } catch (e) {
        showToast({ title: '切换失败', icon: 'info' });
      } finally {
        setLoading(false);
      }
    },
    [loading, setTheme],
  );

  return (
    <PageContainer
      backgroundColor="#FFFFFF"
      statusBarStyle="dark-content"
      statusBarBackgroundColor="#FFFFFF"
      safeAreaEdges={['top', 'bottom']}
      pageNavProps={{
        text: '换肤',
        showBack: true,
        background: '#FFFFFF',
      }}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.themeList}>
            {themeList.map(theme => (
              <View key={theme.code} style={styles.themeItem}>
                <View style={styles.themeCard}>
                  {theme.url ? (
                    <Image
                      source={{ uri: theme.url }}
                      style={styles.themeImage}
                      resizeMode="cover"
                    />
                  ) : null}
                </View>
                <View style={styles.themeInfo}>
                  {theme.hasChoose ? (
                    <View style={styles.currentButton}>
                      <Text style={styles.buttonText}>当前</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.switchButton}
                      onPress={() => handleThemeChange(theme.code)}
                    >
                      <Text style={styles.buttonText}>切换</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </PageContainer>
  );
}
