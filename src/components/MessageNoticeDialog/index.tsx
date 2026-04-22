import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Animated,
  Image,
  TouchableOpacity,
  InteractionManager,
  Platform,
} from 'react-native';
import { eventCenter } from '@/utils';
import { px } from '@/utils/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styles from './styles';
import AppIcon from '@/components/AppIcon';
import { navigate } from '@/utils/navigation';

export interface MessageInfo {
  id?: number;
  messageType?: number;
  messageContent?: string;
  createTime?: number;
  [key: string]: any;
}

const MessageTypeIconMap: Record<number, any> = {
  1: {
    title: '电池电量低',
    imgUri: 'battery_low',
  },
  2: {
    title: '触发碰撞蜂呜',
    imgUri: 'collision',
  },
  3: {
    title: '安装完成',
    imgUri: 'install_done',
  },
  4: {
    title: '高温报警',
    imgUri: 'high_temp',
  },
  5: {
    title: '设备离线',
    imgUri: 'offline',
  },
  6: {
    title: '火焰检测',
    imgUri: 'fire',
  },
  7: {
    title: '站位提醒',
    imgUri: 'occupyed',
  },
};

export function showMessageNoticeDialog(info: MessageInfo) {
  eventCenter.trigger('global:messageNoticeDialog:show', info);
}

export function MessageNoticeDialogHost() {
  const [info, setInfo] = useState<MessageInfo | null>(null);
  const slideAnim = useRef(new Animated.Value(-px(200))).current;
  const insets = useSafeAreaInsets();
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClose = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }
    Animated.timing(slideAnim, {
      toValue: -px(200),
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setInfo(null);
    });
  };

  useEffect(() => {
    const handler = (payload: MessageInfo) => {
      setInfo(payload);

      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }

      InteractionManager.runAfterInteractions(() => {
        // 计算顶部安全距离 + 一定间距
        const topOffset =
          Platform.OS === 'android' ? px(42) : Math.max(insets.top, px(42));

        Animated.spring(slideAnim, {
          toValue: topOffset,
          useNativeDriver: true,
          friction: 8,
          tension: 40,
        }).start();

        // 默认 3 秒后自动回缩隐藏
        hideTimerRef.current = setTimeout(() => {
          handleClose();
        }, 3000);
      });
    };

    eventCenter.on('global:messageNoticeDialog:show', handler);
    return () => {
      eventCenter.off('global:messageNoticeDialog:show', handler);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [insets.top, slideAnim]);

  const handlePress = () => {
    // 点击卡片后的跳转逻辑
    handleClose();
    navigate('Message');
  };

  if (!info) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePress}
        style={styles.noticeBox}
      >
        {info.messageType == 3 ? (
          <AppIcon
            name="explain"
            size={32}
            color="#333333"
            style={{ marginRight: px(8) }}
          />
        ) : (
          <Image
            style={styles.iconImg}
            source={{
              uri: `https://g.18qjz.cn/img/boklock/message/${
                MessageTypeIconMap[info.messageType || 0].imgUri
              }.png`,
            }}
          />
        )}
        <View style={styles.contentWrap}>
          <Text style={styles.title}>
            {MessageTypeIconMap[info.messageType || 0].title}
          </Text>
          <Text style={styles.content} numberOfLines={2}>
            {info.messageContent || '您收到了一条新消息'}
          </Text>
        </View>
        {info.unreadCount && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>
              未读{info.unreadCount > 99 ? '99+' : info.unreadCount}
            </Text>
          </View>
        )}
        <AppIcon
          name="a-headfor-20"
          size={px(16)}
          color="#333333"
          style={{ alignSelf: 'flex-end' }}
        />
      </TouchableOpacity>
    </Animated.View>
  );
}
