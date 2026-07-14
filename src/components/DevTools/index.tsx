/**
 * Dev 环境 Tools 悬浮窗
 * 可展开输入自定义 API 基址，生效后业务请求统一走该地址
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from '@/libs/safeAreaContext';
import {
  getApiBaseUrl,
  getCustomApiBaseUrl,
  getDefaultApiBaseUrl,
  initCustomApiBaseUrl,
  isDevToolsEnabled,
  setCustomApiBaseUrl,
} from '@/utils/apiBaseUrl';
import { showToast } from '@/utils';
import { fontSize, px } from '@/utils/ui';

const BTN_SIZE = px(48);

export default function DevTools() {
  const insets = useSafeAreaInsets();
  const [ready, setReady] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [inputUrl, setInputUrl] = useState('');
  const [activeUrl, setActiveUrl] = useState(getDefaultApiBaseUrl());

  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const lastOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!isDevToolsEnabled()) return;
    let cancelled = false;
    (async () => {
      await initCustomApiBaseUrl();
      if (cancelled) return;
      const custom = getCustomApiBaseUrl();
      setActiveUrl(getApiBaseUrl());
      setInputUrl(custom || '');
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gesture) =>
        !expanded && (Math.abs(gesture.dx) > 4 || Math.abs(gesture.dy) > 4),
      onPanResponderGrant: () => {
        pan.setOffset(lastOffset.current);
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gesture) => {
        lastOffset.current = {
          x: lastOffset.current.x + gesture.dx,
          y: lastOffset.current.y + gesture.dy,
        };
        pan.flattenOffset();
      },
    }),
  ).current;

  const refreshActive = useCallback(() => {
    setActiveUrl(getApiBaseUrl());
    setInputUrl(getCustomApiBaseUrl() || '');
  }, []);

  const handleApply = useCallback(async () => {
    Keyboard.dismiss();
    const value = inputUrl.trim();
    if (!value) {
      showToast({ title: '请输入请求地址', icon: 'none' });
      return;
    }
    const applied = await setCustomApiBaseUrl(value);
    refreshActive();
    showToast({ title: `已切换: ${applied}`, icon: 'success' });
  }, [inputUrl, refreshActive]);

  const handleReset = useCallback(async () => {
    Keyboard.dismiss();
    await setCustomApiBaseUrl(null);
    refreshActive();
    showToast({ title: '已恢复默认地址', icon: 'success' });
  }, [refreshActive]);

  if (!isDevToolsEnabled() || !ready) {
    return null;
  }

  const bottom = Math.max(insets.bottom, px(12)) + px(80);
  const right = Math.max(insets.right, px(12));

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <KeyboardAvoidingView
        pointerEvents="box-none"
        style={StyleSheet.absoluteFill}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.View
          pointerEvents="box-none"
          style={[
            styles.anchor,
            {
              bottom,
              right,
              transform: [{ translateX: pan.x }, { translateY: pan.y }],
            },
          ]}
          {...(expanded ? {} : panResponder.panHandlers)}
        >
          {expanded ? (
            <View style={styles.panel}>
              <View style={styles.panelHeader}>
                <Text style={styles.panelTitle}>Tools</Text>
                <TouchableOpacity
                  onPress={() => {
                    Keyboard.dismiss();
                    setExpanded(false);
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.closeText}>收起</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>当前请求地址</Text>
              <Text style={styles.currentUrl} numberOfLines={2}>
                {activeUrl}
              </Text>

              <Text style={styles.label}>自定义请求地址</Text>
              <TextInput
                style={styles.input}
                value={inputUrl}
                onChangeText={setInputUrl}
                placeholder={getDefaultApiBaseUrl()}
                placeholderTextColor="#999"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                clearButtonMode="while-editing"
              />
              <Text style={styles.hint}>
                默认: {getDefaultApiBaseUrl()}
              </Text>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.resetBtn]}
                  onPress={handleReset}
                >
                  <Text style={styles.resetText}>恢复默认</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.applyBtn]}
                  onPress={handleApply}
                >
                  <Text style={styles.applyText}>应用</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.fab}
              activeOpacity={0.85}
              onPress={() => {
                refreshActive();
                setExpanded(true);
              }}
            >
              <Text style={styles.fabText}>Tools</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  anchor: {
    position: 'absolute',
    alignItems: 'flex-end',
    zIndex: 9999,
    elevation: 9999,
  },
  fab: {
    width: BTN_SIZE,
    height: BTN_SIZE,
    borderRadius: BTN_SIZE / 2,
    backgroundColor: 'rgba(40, 40, 40, 0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  fabText: {
    color: '#fff',
    fontSize: fontSize(11),
    fontWeight: '600',
  },
  panel: {
    width: px(300),
    backgroundColor: '#fff',
    borderRadius: px(12),
    padding: px(14),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E6E6E6',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: px(10),
  },
  panelTitle: {
    fontSize: fontSize(16),
    fontWeight: '600',
    color: '#333',
  },
  closeText: {
    fontSize: fontSize(13),
    color: '#666',
  },
  label: {
    fontSize: fontSize(12),
    color: '#888',
    marginBottom: px(4),
  },
  currentUrl: {
    fontSize: fontSize(12),
    color: '#333',
    marginBottom: px(10),
    lineHeight: fontSize(18),
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#D9D9D9',
    borderRadius: px(8),
    paddingHorizontal: px(10),
    paddingVertical: Platform.OS === 'ios' ? px(10) : px(8),
    fontSize: fontSize(13),
    color: '#333',
    backgroundColor: '#FAFAFA',
  },
  hint: {
    marginTop: px(6),
    fontSize: fontSize(11),
    color: '#999',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: px(12),
    gap: px(8),
  },
  actionBtn: {
    paddingHorizontal: px(14),
    paddingVertical: px(8),
    borderRadius: px(8),
  },
  resetBtn: {
    backgroundColor: '#F5F5F5',
  },
  applyBtn: {
    backgroundColor: '#282828',
  },
  resetText: {
    fontSize: fontSize(13),
    color: '#666',
  },
  applyText: {
    fontSize: fontSize(13),
    color: '#fff',
    fontWeight: '500',
  },
});
