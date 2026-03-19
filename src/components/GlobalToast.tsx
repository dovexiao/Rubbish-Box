import React, { useEffect, useState, useRef } from 'react';
import { Modal, View, Text, StyleSheet, Animated } from 'react-native';
import { eventCenter } from '@/utils';

export const GlobalToast = () => {
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState<'success' | 'error' | 'loading' | 'none'>(
    'none',
  );
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<any>(null);

  useEffect(() => {
    const show = (options: {
      title: string;
      icon?: 'success' | 'error' | 'loading' | 'none';
      duration?: number;
    }) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setTitle(options.title);
      setIcon(options.icon || 'none');
      setVisible(true);

      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      timerRef.current = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setVisible(false);
        });
      }, options.duration || 1500);
    };

    eventCenter.on('global_show_toast', show);

    return () => {
      eventCenter.off('global_show_toast', show);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [opacity]);

  if (!visible) return null;

  const hasIcon = icon === 'success' || icon === 'error';

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={() => {}}
      statusBarTranslucent
    >
      <View style={styles.overlay} pointerEvents="none">
        <Animated.View
          style={[
            styles.container,
            { opacity },
            !hasIcon && styles.containerTextOnly,
          ]}
        >
          <Text style={[styles.text, !hasIcon && styles.textOnly]}>
            {title}
          </Text>
        </Animated.View>
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
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 120,
    maxWidth: '80%',
  },
  containerTextOnly: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    minWidth: 0,
  },
  icon: {
    marginBottom: 8,
  },
  text: {
    color: '#ffffff',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  textOnly: {
    marginTop: 0,
  },
});
