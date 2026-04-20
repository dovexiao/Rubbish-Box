import React, { useEffect, useState } from 'react';
import { Modal, View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { eventCenter } from '@/utils';
import { fontSize, px } from '@/utils/ui';

export const GlobalLoading = () => {
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState('');

  useEffect(() => {
    const show = (options: { title?: string }) => {
      setTitle(options?.title || '加载中...');
      setVisible(true);
    };

    const hide = () => {
      setVisible(false);
    };

    eventCenter.on('global_show_loading', show);
    eventCenter.on('global_hide_loading', hide);

    return () => {
      eventCenter.off('global_show_loading', show);
      eventCenter.off('global_hide_loading', hide);
    };
  }, []);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={() => {}}
      presentationStyle="overFullScreen"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#ffffff" />
          {!!title && <Text style={styles.text}>{title}</Text>}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: px(20),
    borderRadius: px(8),
    alignItems: 'center',
    minWidth: px(100),
    maxWidth: '80%',
  },
  text: {
    color: '#ffffff',
    marginTop: px(10),
    fontSize: fontSize(14),
  },
});
