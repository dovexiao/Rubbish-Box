import React, { useState, useEffect, useCallback, useImperativeHandle, forwardRef, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, ViewStyle, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { createStyles, rpx } from '../../utils/rpxStyleSheet';
import { Images } from '../../constants/Assets';
import { getWeekCheckInList, WeekCheckInListData, WeekCheckListItem } from '../../services/pointsMall';
import { showInfo, showError } from '../../utils/toast';
import { devError, devLog } from '@/services/WebSocketManager';

type DailyCheckInProps = {
  containerStyle: ViewStyle,
  onAnswer: (points: number) => void;
}

export type DailyCheckInRef = {
  loadWeekCheckInList: () => Promise<void>;
}

type TodayInfo = {
  index: number | null;
  isChecked: boolean;
  date: string;
  text: string;
}

// 空的的7天打卡互活动列表
const EMPTY_WEEK_CHECK_IN_LIST: WeekCheckListItem[] = Array.from({ length: 7 }, (_, index) => ({
  checked: false,
  date: '未知',
  is_today: false,
  weekday: '未知',
  dateStatusCode: 0,
}));

// 领取积分奖励数组（写死）
const rewardPointsList: number[] = [1, 2, 4, 2, 2, 4, 10];

// 计算日期相对今日状态：0 过期 1 未领取 2 已领取 3 未开始
const calculateDateRelativeToTodayStatus = (index: number, isChecked: boolean, todayInfo: TodayInfo): number => {
  // 检查参数有效性
  if (index === null || index === undefined || todayInfo?.index === null || todayInfo?.index === undefined) {
    return 3;
  }
  
  const todayIndex = todayInfo.index;
  
  // 未开始：index 大于 todayIndex
  if (index > todayIndex) {
    return 3;
  }
  
  // 今日：index 等于 todayIndex
  if (index === todayIndex) {
    return isChecked ? 2 : 1;
  }
  
  // 过去：index 小于 todayIndex
  return isChecked ? 2 : 0;
};

const DailyCheckIn = forwardRef<DailyCheckInRef, DailyCheckInProps>(({ containerStyle, onAnswer }, ref) => {
  // 7天打卡活动列表
  const [weekCheckInList, setWeekCheckInList] = useState<WeekCheckListItem[]>(EMPTY_WEEK_CHECK_IN_LIST);
  // 累计打卡天数
  const [totalCheckInDays, setTotalCheckInDays] = useState(0);
  const [todayInfo, setTodayInfo] = useState<TodayInfo | null>(null);
  // 是否加载中
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);

  const loadWeekCheckInList = useCallback(async () => {
    // 保证幂等
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const weekCheckInListData: WeekCheckInListData = await getWeekCheckInList();
      // console.log('获取7天打卡活动列表成功', weekCheckInListData);
      const todayInfo: TodayInfo = {
        index: (weekCheckInListData.week_check_list ?? EMPTY_WEEK_CHECK_IN_LIST).findIndex(item => item.is_today) ?? null,
        isChecked: weekCheckInListData.today_checked ?? false,
        date: weekCheckInListData.today_date ?? '未知日期',
        text: weekCheckInListData.today_text ?? '未知日期',
      }
      const weekCheckInList = (weekCheckInListData.week_check_list ?? EMPTY_WEEK_CHECK_IN_LIST).map((item, index) => {
        return {
          checked: item.checked,
          date: item.date,
          is_today: item.is_today,
          weekday: item.weekday,
          dateStatusCode: item.dateStatusCode ?? calculateDateRelativeToTodayStatus(index, item.checked, todayInfo) as number,
        }
      });
      setWeekCheckInList(weekCheckInList);
      setTotalCheckInDays(weekCheckInListData.consecutive_days ?? 0);
      setTodayInfo(todayInfo);
    } catch (error: unknown) {
      devError('获取7天打卡活动列表失败:', error);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  // 处理打卡按钮点击
  const handleCheckInPress = useCallback(() => {
    const isValidTodayInfo = todayInfo && 
                             typeof todayInfo.index === 'number' && 
                             todayInfo.index >= 0;
    
    if (!isValidTodayInfo) {
      devError('无法打卡, 今日数据不合法', todayInfo);
      showError('无法打卡, 今日数据缺失');
      return;
    }
    
    if (todayInfo.isChecked) {
      devLog('今日已打卡', todayInfo);
      showInfo('今日已打卡');
    } else {
      const todayIndex = weekCheckInList.findIndex(item => item.is_today) ?? 0;
      onAnswer(rewardPointsList[todayIndex]);
    }
  }, [todayInfo, weekCheckInList, onAnswer]);

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    loadWeekCheckInList,
  }), [loadWeekCheckInList]);

  useEffect(() => {
    loadWeekCheckInList();
  }, []);

  return (
    <View style={[styles.container, containerStyle]}>
      <Image
        source={Images.pointsMallBackgroundPaper}
        style={styles.backgroundPaper}
        resizeMode="contain"
      />
      <View style={styles.content}>
        {/* 惊喜点 */}
        <Image
          source={Images.pointsMallSurprisePoint}
          style={styles.surprisePoint}
          resizeMode="contain"
        />
        {/* 圈圈选中 */}
        <Image
          source={Images.pointsMallSelectingByCircle}
          style={styles.selectingByCircle}
          resizeMode="contain"
        />
        {/* 7天打卡活动标题 */}
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>每日打卡领奖励</Text>
        </View>
        {/* 打卡状态 */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>已连续打卡 <Text style={styles.statusTextBold}>{totalCheckInDays}</Text> 天</Text>
          <Image source={Images.pointsMallStatusMark} style={styles.statusMarkImg} resizeMode="contain" />
        </View>

        {/* 7天打卡活动列表 */}
        <View style={styles.dailyCheckInListContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#FF9D00" />
            </View>
          ) : (
            weekCheckInList.map((item, index) => (
              <View key={index} style={[
                styles.dailyCheckInListItem,
                item.dateStatusCode === 0 && styles.dailyCheckInListItemExpired,
                item.dateStatusCode === 1 && styles.dailyCheckInListItemToday,
                item.dateStatusCode === 2 && styles.dailyCheckInListItemReceived,
              ]}>
                <Text style={[
                  styles.dailyCheckInListItemText,
                  item.dateStatusCode === 0 && styles.dailyCheckInListItemTextExpired,
                  item.dateStatusCode === 1 && styles.dailyCheckInListItemTextToday,
                  item.dateStatusCode === 2 && styles.dailyCheckInListItemTextReceived,
                ]}>
                  {item.date}
                </Text>
                {/* 已过期 */}
                {item.dateStatusCode === 0 && (
                  <Text style={styles.goldCoinText}>未打卡</Text>
                )}
                {/* 未领取 */}
                {item.dateStatusCode === 1 && (
                  <>
                    <Image source={Images.pointsMallGoldCoin} style={styles.goldCoinIcon} resizeMode="contain" />
                    <View style={[styles.goldCoinNumberContainer, index === 6 && styles.goldCoinNumberContainer_10]}>
                      <Image source={Images[`pointsMallWhite_${rewardPointsList[index]}` as keyof typeof Images]} style={styles.goldCoinNumberImg} resizeMode="contain" />
                    </View>
                  </>
                )}
                {/* 已领取 */}
                {item.dateStatusCode === 2 && (
                  <Image source={Images.pointsMallChecked} style={styles.goldCoinIcon} resizeMode="contain" />
                )}
                {/* 未开始 */}
                {item.dateStatusCode === 3 && (
                  <>
                    <Image source={Images.pointsMallGoldCoin} style={styles.goldCoinIcon} resizeMode="contain" />
                    <View style={[styles.goldCoinNumberContainer, index === 6 && styles.goldCoinNumberContainer_10]}>
                      <Image source={Images[`pointsMallOrange_${rewardPointsList[index]}` as keyof typeof Images]} style={styles.goldCoinNumberImg} resizeMode="contain" />
                    </View>
                  </>
                )}
              </View>
            ))
          )}
        </View>
      </View>
      {/* 打卡领取奖励按钮 */}
      <TouchableOpacity
        style={styles.buttonContainer}
        activeOpacity={0.8}
        onPress={handleCheckInPress}
      >
        <LinearGradient
          colors={['#FFA27D', '#FF9900']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.buttonGradient}
        >
          <Text style={styles.buttonText}>打卡得奖励</Text>
        </LinearGradient>
      </TouchableOpacity>
      {/* 装饰素材-打卡男孩金币群定位 */}
      <Image
        source={Images.pointsMallGoldCoinGroupAndBoy}
        style={styles.goldCoinGroupAndBoy}
        resizeMode="contain"
      />
    </View>
  )
});

const styles = createStyles({
  container: {
    width: 278.125, // 712
    height: 123.046875, // 315
    // position: 'relative' as const,
    // overflow: 'hidden' as const,
    zIndex: 1,
  },
  content: {
    width: 273.4375, // 700
    height: 108.203125, // 277
    marginLeft: 4.6875, // 12
    backgroundColor: '#FFFCEB',
    borderRadius: 11.71875, // 30
    paddingHorizontal: 7.8125, // 20
    shadowColor: 'rgba(173, 104, 0, 0.25)',
    shadowOffset: { width: 0.78125, height: 1.5625 }, // { width: 2, height: 4 }
    shadowRadius: 1.5625, // 4
    shadowOpacity: 1,
    elevation: 5,
  },
  backgroundPaper: {
    position: 'absolute' as const,
    width: 259.1796875, // 663
    height: 108.203125, // 277
    top: 3.125, // 8
    left: -4.6875, // -12
    zIndex: 0,
  },
  surprisePoint: {
    position: 'absolute' as const,
    width: 9.375, // 24
    height: 8.59375, // 22
    top: 9.765625, // 25
    left: 8.59375, // 22
    zIndex: 3,
  },
  selectingByCircle: {
    position: 'absolute' as const,
    width: 48.828125, // 125
    height: 24.609375, // 63
    top: 7.03125, // 18
    left: 44.3359375, // 113.5
    zIndex: 0,
  },
  titleContainer: {
    marginTop: 13.671875, // 35
    marginLeft: 3.90625, // 10
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  titleText: {
    fontFamily: 'PingFang SC',
    fontSize: 10.9375, // 28
    color: '#000000',
    fontWeight: 'bold' as const,
  },
  statusContainer: {
    position: 'absolute' as const,
    top: 5.078125, // 13
    left: 176.953125, // 453
    width: 92.1875, // 236
    height: 22.65625, // 58
    flexDirection: 'row' as const,
    borderRadius: 5.859375, // 15
    paddingHorizontal: 6.25, // 16
    paddingVertical: 4.6875, // 12
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 3.125, // 8
    transform: [{ rotate: '-3.01deg' }],
    backgroundColor: '#E1FF1D',
    shadowColor: 'rgba(188, 135, 0, 0.18)',
    shadowOffset: { width: 0.78125, height: 1.171875 }, // { width: 2, height: 3 }
    shadowRadius: 0.78125, // 2
    shadowOpacity: 1,
    elevation: 4,
    zIndex: 1,
    marginTop: 3.90625, // 10
  },
  statusText: {
    fontFamily: 'PingFang SC',
    fontSize: 9.375, // 24
    color: 'rgba(0, 0, 0, 0.5)',
    fontWeight: '500' as const,
  },
  statusMarkImg: {
    width: 8.203125, // 21
    height: 8.203125, // 21
  },
  statusTextBold: {
    color: '#000000B2',
    fontWeight: 'bold' as const,
  },
  dailyCheckInListContainer: {
    flexDirection: 'row' as const,
    width: '100%' as const,
    height: 45.703125, // 117
    marginTop: 10.546875, // 27
    justifyContent: 'space-between' as const,
    zIndex: 1,
    position: 'relative' as const,
  },
  loadingContainer: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: 'rgba(255, 252, 235, 0.8)', // 半透明背景，与 content 背景色一致
    borderRadius: 7.8125, // 20
    zIndex: 2,
  },
  dailyCheckInListItem: {
    // flex: 1,
    width: 33.59375, // 84
    height: '100%' as const,
    justifyContent: 'space-evenly' as const,
    alignItems: 'center' as const,
    borderRadius: 7.8125, // 20
    backgroundColor: '#FFFFFF',
    shadowColor: '#AB8702',
    shadowOpacity: 0.08,
    shadowOffset: {
      width: 1.171875, // 3
      height: 1.5625, // 4
    },
    shadowRadius: 0.60546875, // 1.55
    elevation: 0.78125, // 2
  },
  dailyCheckInListItemToday: {
    backgroundColor: '#FF9D00',
  },
  dailyCheckInListItemExpired: {
    backgroundColor: '#E5E5E5',
  },
  dailyCheckInListItemReceived: {
    backgroundColor: '#FFEEB4',
  },
  dailyCheckInListItemText: {
    fontFamily: 'PingFang-SC',
    fontSize: 8.59375, // 22
    color: '#00000080',
    fontWeight: 'bold' as const,
  },
  dailyCheckInListItemTextToday: {
    color: '#FFFFFF',
  },
  dailyCheckInListItemTextExpired: {
    color: '#00000080',
  },
  dailyCheckInListItemTextReceived: {
    color: '#FFA200',
  },
  goldCoinIcon: {
    width: 15.625, // 40
    height: 15.625, // 40
  },
  goldCoinNumberContainer: {
    position: 'absolute' as const,
    width: 12.5, // 32
    height: 11.328125, // 29
    top: 30.078125, // 77
    left: 16.40625, // 42
    zIndex: 1,
  },
  goldCoinNumberContainer_10: {
    width: 17.96875, // 46
    height: 11.328125, // 29
    top: 30.078125, // 77
    left: 12.109375, // 31
  },
  goldCoinNumberImg: {
    width: '100%' as const,
    height: '100%' as const,
  },
  goldCoinText: {
    fontFamily: 'PingFang-SC',
    fontSize: 8.59375, // 22
    color: '#00000066',
    fontWeight: '500' as const,
  },
  buttonContainer: {
    position: 'absolute' as const,
    width: 187.5, // 480
    height: 28.90625, // 74
    top: 94.140625, // 241
    left: 47.65625, // 122
    borderRadius: 15.625, // 40
    borderWidth: 1.171875, // 3
    borderColor: '#FFDBDB',
    shadowColor: 'rgba(203, 105, 0, 0.62)',
    shadowOffset: { width: 0, height: 0.78125 }, // { width: 0, height: 2 }
    shadowRadius: 1.328125, // 3.4
    shadowOpacity: 1,
    elevation: 8,
    zIndex: 1,
    overflow: 'hidden' as const,
  },
  buttonGradient: {
    flex: 1,
    // paddingHorizontal: 62.5, // 160
    // paddingVertical: 6.25, // 16
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 3.90625, // 10
  },
  buttonText: {
    fontFamily: 'kingnam_bobo',
    fontSize: 12.5, // 32
    color: '#FFFFFF',
    fontWeight: '400' as const,
  },
  goldCoinGroupAndBoy: {
    position: 'absolute' as const,
    width: 111.328125, // 285
    height: 54.6875, // 140
    top: -45.703125, // 117
    left: 144.921875, // 371
    zIndex: 1,
  },
})

export default DailyCheckIn;