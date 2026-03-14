import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import dayjs from 'dayjs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar, LocaleConfig, DateData } from 'react-native-calendars';
import DatePicker from 'react-native-date-picker';
import Flex from '@/components/Flex';
import AppIcon from '@/components/AppIcon';

export interface DateTimePickerPopupProps {
  title?: React.ReactNode;
  minHeight?: number;
  children?: React.ReactNode;
  timestamp?: number;
  style?: any;
  onChange?: (timestamp: number) => void;
  height?: number;
  refs?: React.MutableRefObject<DateTimePickerPopupRef | null>;
}

export interface DateTimePickerPopupRef {
  open: () => void;
  close: () => void;
}

const DateTimePickerPopup = forwardRef<
  DateTimePickerPopupRef,
  DateTimePickerPopupProps
>(({ title, minHeight = 500, timestamp, style, onChange, refs }, ref) => {
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'date' | 'time'>('date');
  const [currentTs, setCurrentTs] = useState<number>(
    timestamp ?? dayjs().valueOf(),
  );
  const [selectedDate, setSelectedDate] = useState<string>(
    dayjs(timestamp ?? dayjs().valueOf()).format('YYYY-MM-DD'),
  );

  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const base = timestamp ?? dayjs().valueOf();
    setCurrentTs(base);
    setSelectedDate(dayjs(base).format('YYYY-MM-DD'));
  }, [timestamp]);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 1 : 0,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [slideAnim, visible]);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [minHeight, 0],
  });

  useImperativeHandle(
    ref,
    () => ({
      open: () => setVisible(true),
      close: () => setVisible(false),
    }),
    [],
  );

  useEffect(() => {
    if (refs) {
      refs.current = {
        open: () => setVisible(true),
        close: () => setVisible(false),
      };
    }
  }, [refs]);

  const updateTimestampWithTime = (dateStr: string, timeDate: Date) => {
    const d = dayjs(dateStr);
    const t = dayjs(timeDate);
    const newTs = d
      .hour(t.hour())
      .minute(t.minute())
      .second(0)
      .millisecond(0)
      .valueOf();
    setCurrentTs(newTs);
  };

  const handleDayPress = (day: DateData) => {
    const dateStr = day.dateString;
    setSelectedDate(dateStr);
    updateTimestampWithTime(dateStr, dayjs(currentTs).toDate());
  };

  const formatSelectedDate = () => dayjs(selectedDate).format('MM月DD日');
  const formatSelectedTime = () => dayjs(currentTs).format('HH:mm');

  const handleConfirm = () => {
    setVisible(false);
    onChange?.(currentTs);
  };

  const handleClose = () => {
    setVisible(false);
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
      presentationStyle="overFullScreen"
      statusBarTranslucent
    >
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: 'rgba(0,0,0,0.5)', opacity: slideAnim },
          ]}
          pointerEvents="auto"
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        </Animated.View>

        <Animated.View
          style={[
            styles.container,
            { minHeight, paddingBottom: insets.bottom },
            style,
            { transform: [{ translateY }] },
          ]}
          pointerEvents="auto"
        >
          {title && (typeof title === 'string' ? <Text>{title}</Text> : title)}

          <Flex
            style={styles.topBar}
            direction="row"
            justify="between"
            align="center"
          >
            <View style={styles.tabWrap}>
              <Pressable
                onPress={() => setActiveTab('date')}
                style={[
                  styles.tab,
                  activeTab === 'date' ? styles.tabActive : undefined,
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'date' ? styles.tabTextActive : undefined,
                  ]}
                >
                  {formatSelectedDate()}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setActiveTab('time')}
                style={[
                  styles.tab,
                  activeTab === 'time' ? styles.tabActive : undefined,
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'time' ? styles.tabTextActive : undefined,
                  ]}
                >
                  {formatSelectedTime()}
                </Text>
              </Pressable>
            </View>

            <Pressable onPress={handleConfirm}>
              <Text style={styles.headerConfirm}>确定</Text>
            </Pressable>
          </Flex>

          <View style={styles.bodyArea}>
            {activeTab === 'date' ? (
              <Calendar
                current={selectedDate}
                onDayPress={handleDayPress}
                firstDay={1}
                monthFormat={'yyyy年 MM月'}
                markedDates={{
                  [selectedDate]: {
                    selected: true,
                    selectedColor: '#333333',
                  },
                }}
                renderArrow={(direction: 'left' | 'right') => (
                  <View>
                    {direction === 'left' ? (
                      <View style={{ transform: [{ rotate: '180deg' }] }}>
                        <AppIcon
                          name={'a-headfor-201'}
                          size={30}
                          color="#333333"
                        />
                      </View>
                    ) : (
                      <AppIcon
                        name={'a-headfor-201'}
                        size={30}
                        color="#333333"
                      />
                    )}
                  </View>
                )}
                theme={{
                  backgroundColor: '#ffffff',
                  calendarBackground: '#ffffff',
                  textSectionTitleColor: '#333333',
                  textSectionTitleDisabledColor: '#cccccc',
                  monthTextColor: '#333333',
                  dayTextColor: '#333333',
                  todayTextColor: '#333333',
                  selectedDayTextColor: '#ffffff',
                  arrowColor: '#000000',
                  selectedDayBackgroundColor: '#333333',
                }}
              />
            ) : (
              <View style={styles.timeWrap}>
                <DatePicker
                  mode="time"
                  locale="zh-Hans"
                  date={dayjs(currentTs).toDate()}
                  theme="light"
                  dividerColor="#e5e5e5"
                  is24hourSource="locale"
                  onDateChange={(d: Date) => {
                    updateTimestampWithTime(selectedDate, d);
                  }}
                />
              </View>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
});

(LocaleConfig.locales as Record<string, any>).zh = {
  monthNames: [
    '1月',
    '2月',
    '3月',
    '4月',
    '5月',
    '6月',
    '7月',
    '8月',
    '9月',
    '10月',
    '11月',
    '12月',
  ],
  monthNamesShort: [
    '1月',
    '2月',
    '3月',
    '4月',
    '5月',
    '6月',
    '7月',
    '8月',
    '9月',
    '10月',
    '11月',
    '12月',
  ],
  dayNames: [
    '星期日',
    '星期一',
    '星期二',
    '星期三',
    '星期四',
    '星期五',
    '星期六',
  ],
  dayNamesShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
  today: '今天',
};

LocaleConfig.defaultLocale = 'zh';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  topBar: {
    width: '100%',
    paddingLeft: 12,
    paddingRight: 12,
    paddingTop: 8,
  },
  tabWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f6f7',
    borderRadius: 8,
    padding: 3,
    marginRight: 8,
  },
  tab: {
    width: 150,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  tabActive: {
    backgroundColor: '#ffffff',
  },
  tabText: {
    fontSize: 16,
    color: '#999999',
    fontWeight: '400',
    textAlign: 'center',
  },
  tabTextActive: {
    color: '#333333',
    fontWeight: 'bold',
  },
  headerConfirm: {
    fontSize: 14,
    color: '#333333',
    fontWeight: 'bold',
  },
  bodyArea: {
    height: 340,
  },
  timeWrap: {
    width: '100%',
    height: 340,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});

export default DateTimePickerPopup;
