import React, { useCallback } from 'react';
import {
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MarkdownView from '@/components/MarkdownView';
import AppIcon from '@/components/AppIcon';
import { PhoneChangeMessage } from '../../typing';
import { getPageTypeConfig } from '../../constants';
import { px } from '@/utils/ui';
import styles from './styles';

interface Props {
  data: PhoneChangeMessage;
}

export default function PhoneChangeCard({ data }: Props) {
  const navigation = useNavigation<any>();
  const maskedPhone = data.maskedPhone;
  const pageConfig = getPageTypeConfig(data?.pageType, 7);

  const handleNavigate = useCallback(() => {
    const route = pageConfig?.route;
    if (!route) return;

    const params =
      maskedPhone &&
      typeof maskedPhone === 'object' &&
      Object.keys(maskedPhone).length > 0
        ? maskedPhone
        : undefined;

    navigation.navigate(route, params);
  }, [maskedPhone, navigation, pageConfig?.route]);

  return (
    <View style={styles.messageRow}>
      <View style={styles.card}>
        <View style={styles.header}>
          {data?.intro ? (
            <MarkdownView content={data.intro} style={styles.introMarkdown} />
          ) : null}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.link}
            onPress={handleNavigate}
          >
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
      </View>
    </View>
  );
}
