import React, { useCallback } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MarkdownView from '@/components/MarkdownView';
import AppIcon from '@/components/AppIcon';
import { PhoneChangeMessage } from '../../typing';
import { getPageTypeConfig } from '../../constants';
import { parseExtend } from '../../utils/extractJsonCardsFromMarkdown';
import { px } from '@/utils/ui';
import styles from './styles';

interface Props {
  data: PhoneChangeMessage;
}

const normalizeExtendParams = (
  extend: unknown,
): Record<string, unknown> | undefined => {
  const parsed = parseExtend(extend);
  if (!parsed || Object.keys(parsed).length === 0) return undefined;

  const params = { ...parsed };
  if (params.lockId != null && params.id == null) {
    params.id = params.lockId;
  }
  return params;
};

export default function PhoneChangeCard({ data }: Props) {
  const navigation = useNavigation<any>();
  const pageConfig = getPageTypeConfig(data?.pageType, 1);

  const handleNavigate = useCallback(() => {
    const route = pageConfig?.route;
    if (!route) return;

    const params = normalizeExtendParams(data.maskedPhone);
    if (String(data?.pageType) === '16') {
      navigation.navigate('MainTabs', {
        screen: route,
        params: {
          ...params,
          pageType: data?.pageType,
          _autoOpenAt: Date.now(),
        },
      });
      return;
    }

    navigation.navigate(route, {
      ...params,
      pageType: data?.pageType || 1,
      _autoOpenAt: Date.now(),
    });
  }, [data?.pageType, data?.maskedPhone, navigation, pageConfig?.route]);

  return (
    <View style={styles.messageRow}>
      <TouchableOpacity style={styles.card} onPress={handleNavigate}>
        <View style={styles.header}>
          {data?.intro ? (
            <MarkdownView content={data.intro} style={styles.introMarkdown} />
          ) : null}
          <TouchableOpacity activeOpacity={0.85} style={styles.link}>
            <Text style={styles.linkText}>点击前往</Text>
            <AppIcon name="a-nextpage" size={px(12)} color="#999999" />
          </TouchableOpacity>
        </View>
        <View style={styles.formCard}>
          {pageConfig?.imgUrl ? (
            <Image
              source={{ uri: pageConfig.imgUrl }}
              style={styles.img}
              resizeMode="contain"
            />
          ) : null}
        </View>
      </TouchableOpacity>
    </View>
  );
}
