import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ImageStyle,
  FlatList,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Flex from '@/components/Flex';
import AppIcon from '@/components/AppIcon';
import Popup from '@/components/Popup';
import { PageContainer, TextInput } from '@/components';
import DateTimePickerPopup from '@/components/CustomDateTimePickerPopup';
import { DeviceItem } from './com/deviceItem';
import UseCountPop from './com/useCountPop';
import { WeChatCoverImage } from './com/weChatCoverImage';
import { styles } from './style';
import { LockInfoDTO } from '@/pages/index/typing';
import dayjs from 'dayjs';
import { DetailsProp } from './type';
import {
  getAdmins,
  saveInvite,
  simpleDetails,
  getLockListByAdmin,
  getMobileByName,
  getNameByMobile,
  getUnUseCount,
} from '@/services/user';
import { tencentUpload } from '@/utils/request';
import { showToast, showLoading, hideLoading } from '@/utils';
import { generateShareImage, onShareAppMessage } from '@/utils/shareImage';
import { stringify } from '@/utils/stringify';
import { DAY_OF_WEEK, INVITE_STATUS } from '@/constants';
import { checkInstalledWeChat } from '@/utils/wechat';

interface UserList {
  adminUserId?: number;
  adminUsername?: string;
}

interface DeviceList {
  groupCount: number;
  id: number;
  imageUrl: string;
  lockName: string;
  role: number;
  roleName: string;
}

const VipPage = () => {
  const [detail, setDetail] = useState<LockInfoDTO | null>(null);
  const [info, setInfo] = useState<any>({});
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [selectedDeviceList, setSelectedDeviceList] = useState<number[]>([]);
  const [deviceList, setDeviceList] = useState<DeviceList[]>([]);
  const [complete, setComplete] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [endTime, setEndTime] = useState(
    dayjs(Date.now()).hour(23).minute(59).second(59).millisecond(0).valueOf(),
  );
  const [pickerValue, setPickerValue] = useState<string | undefined>(undefined);
  const [noLimit, setNoLimit] = useState(1);
  const [active, setActive] = useState(true); // 是否直接选择次数
  const [customUsageCount, setCustomUsageCount] = useState<number>(1); // 自定义使用次数
  const [adminUsername, setAdminUsername] = useState<string | undefined>(); // 当前选择的用户
  const [adminUserId, setAdminUserId] = useState<number | undefined>();
  const [userList, setUserList] = useState<UserList[]>([]);
  const [shareDetail, setShareDetail] = useState<DetailsProp | undefined>();
  const [shareImagePath, setShareImagePath] = useState<string | undefined>();
  const [unUseCount, setUnUseCount] = useState<number>(0);
  const [sharePopupVisible, setSharePopupVisible] = useState(false);
  const shareContentRef = useRef<any>(null);
  const startTimePopRef = useRef<any>(null);
  const endTimePopRef = useRef<any>(null);
  const usageCountPopRef = useRef<any>(null);
  const [adminUserPopupVisible, setAdminUserPopupVisible] = useState(false);
  const [userItem, setUserItem] = useState<UserList>({} as UserList);
  const selector = [
    { label: '不限', value: 0 },
    { label: '1次', value: 1 },
    { label: '2次', value: 2 },
    { label: '3次', value: 3 },
    { label: '4次', value: 4 },
    { label: '5次', value: 5 },
  ];
  const [username, setUsername] = useState('');
  const [mobile, setMobile] = useState('');

  const pickStringFromResult = (result: any, key: string): string => {
    if (typeof result === 'string') return result;
    if (result && typeof result === 'object') {
      if (typeof result[key] === 'string') return result[key];
      if (result.data && typeof result.data === 'object') {
        if (typeof result.data[key] === 'string') return result.data[key];
      }
    }
    return '';
  };

  const router = useRoute<any>();
  const navigation = useNavigation();

  useEffect(() => {
    setIsAllSelected(
      selectedDeviceList.length > 0 &&
        selectedDeviceList.length === deviceList.length,
    );
  }, [selectedDeviceList, deviceList.length]);

  const onLoad = async () => {
    const detail = router.params?.detail as unknown as LockInfoDTO;
    setDetail(detail);
    await getUserList();
    await getCount();
  };

  useEffect(() => {
    onLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCount = async () => {
    const res: any = await getUnUseCount({});
    setUnUseCount(res ?? 0);
  };

  const getUserList = async () => {
    const res: any = await getAdmins({});
    const list: UserList[] = res?.data ?? [];
    setUserList(list);
    if (list.length > 0) {
      const first = list[0];
      setAdminUsername(first.adminUsername);
      setAdminUserId(first.adminUserId);
      if (first.adminUserId) {
        void getDeviceList(first.adminUserId, true);
      }
    }
  };

  const handleSelected = async (id: number) => {
    if (selectedDeviceList.includes(id)) {
      setSelectedDeviceList(selectedDeviceList.filter(item => item !== id));
    } else {
      setSelectedDeviceList([...selectedDeviceList, id]);
    }
  };

  const getDeviceList = async (id: number, reload?: boolean) => {
    const res: any = await getLockListByAdmin({
      offset: reload ? 0 : deviceList.length,
      pageSize: 10,
      adminUserId: id,
    });
    const list: DeviceList[] = res.data.list ?? [];
    setDeviceList(reload ? list : [...deviceList, ...list]);
    setComplete(list.length < 10);
    setSelectedDeviceList(list.map((item: DeviceList) => item.id));
    setIsAllSelected(true);
  };

  const handleInvite = async () => {
    if (!startTime) {
      showToast({ title: '请选择开始时间' });
      return;
    }
    if (!endTime) {
      showToast({ title: '请选择结束时间' });
      return;
    }
    if (startTime > endTime) {
      showToast({ title: '开始时间不能大于结束时间' });
      return;
    }
    if (!noLimit && !customUsageCount) {
      showToast({ title: '请选择使用次数' });
      return;
    }
    if (selectedDeviceList && selectedDeviceList?.length <= 0) {
      showToast({ title: '请选择分享地锁' });
      return;
    }
    if (!adminUserId) {
      showToast({ title: '请选择有效的管理员身份' });
      return;
    }
    const res: any = await saveInvite({
      adminUserId,
      userLockIds: selectedDeviceList,
      username,
      mobile,
      startTime,
      endTime,
      limitTime: noLimit ? null : customUsageCount,
      noLimit, // 0-限制次数 1-不限制次数
      // status: 0,  // 状态：1-生效中 2-已使用 10-过期未用 20-已作废
    });
    if (res.code == 200) {
      const shareDetail = await getSimpleDetails(res?.data);
      setShareDetail(shareDetail);
      setSharePopupVisible(true);
    }
  };

  const getSimpleDetails = async (id: number) => {
    const res: any = await simpleDetails({
      id,
    });
    console.log(res, '====');

    setShareDetail(res);
    return res;
  };

  const cdnDomain = (cosPath: string) => {
    return cosPath.replace(
      'sbqfc-1307862547.cos.ap-shanghai.myqcloud.com',
      'https://g.18qjz.cn',
    );
  };

  const handleUploadImages = async (file: string): Promise<string> => {
    try {
      const fl: any = await tencentUpload({
        file,
        filename: file.split('/').pop() as string,
        index: 0,
      });
      const code = Number(fl?.code);
      if (code !== 200) {
        showToast({ title: '资源上传失败', icon: 'error' });
        return '';
      }
      const location = fl?.data?.Location || fl?.Location;
      if (!location) {
        showToast({ title: '资源上传失败', icon: 'error' });
        return '';
      }
      return cdnDomain(location);
    } catch (e) {
      showToast({ title: '资源上传失败', icon: 'error' });
      return '';
    }
  };

  const onShare = async (detail: any) => {
    showLoading({ title: '生成分享图片中...' });
    try {
      const isInstalledWeChat: any = await checkInstalledWeChat();
      if (!isInstalledWeChat.result) {
        showToast({
          title: isInstalledWeChat.message,
          icon: 'error',
        });
        hideLoading();
        return;
      }

      let imagePath = await generateShareImage({
        details: detail,
        width: 750,
        height: 600,
        ref: shareContentRef,
      });
      //替换为网络路径
      imagePath = await handleUploadImages(imagePath);
      if (!imagePath) {
        return;
      }
      // 存储分享图片路径，供分享时使用
      await setShareImagePath(imagePath);
      await onShareAppMessage({
        // title: '贵宾邀请 - ' + (detail?.code || '邀请码'),
        path: `/pages/user/vipCode/index?${stringify({
          id: detail?.id,
        })}`,
        title: ``,
        imageUrl: imagePath,
      });
      setSharePopupVisible(false);
    } catch (error) {
      console.error('分享失败:', error);
      showToast({ title: '分享失败，请重试', icon: 'none' });
    } finally {
      hideLoading();
    }
  };

  // RN 环境下没有 Taro.useShareAppMessage，这里用一个函数封装分享逻辑，
  // 在按钮等交互里直接调用即可。
  const shareConfig = useCallback(() => {
    if (!shareDetail?.id || !shareImagePath) {
      showToast({ title: '请先生成分享图片' });
      return;
    }

    onShareAppMessage({
      // title: `贵宾邀请 - ${shareDetail?.code || '邀请码'}`,
      title: ``,
      imageUrl: shareImagePath,
      path: `/pages/user/vipCode/index?${stringify({
        id: shareDetail.id,
      })}`,
    });
  }, [shareDetail, shareImagePath]);

  return (
    <PageContainer
      pageNavProps={{ showBack: true, text: '宾客邀请' }}
      backgroundColor="#FFFFFF"
      statusBarStyle="dark-content"
      statusBarBackgroundColor="#FFFFFF"
      safeAreaEdges={['top', 'bottom']}
      scrollable
      footer={
        <Flex
          style={styles.pageFooter}
          direction="column"
          justify={'center'}
          align="center"
        >
          <TouchableOpacity
            onPress={handleInvite}
            style={[styles.footerBtn, styles.mt24]}
          >
            <Text style={styles.footerBtnText}>生成贵宾码</Text>
          </TouchableOpacity>
          <Flex
            style={[styles.mt24]}
            direction={'row'}
            justify={'center'}
            align={'center'}
            isTouchView
            onPress={() => {
              (navigation as any).navigate('VipRecord');
            }}
          >
            <Text style={styles.vipRecord}>贵宾邀请记录</Text>
            <AppIcon
              name={'a-headfor-20'}
              size={16}
              color="#333333"
            ></AppIcon>

            {(unUseCount ?? 0) > 0 && (
              <View style={styles.messageBadge}>
                <Text style={styles.messageBadgeText}>
                  {(unUseCount ?? 0) > 99 ? '99+' : unUseCount}
                </Text>
              </View>
            )}
          </Flex>
        </Flex>
      }
    >
      <View
        style={{
          paddingLeft: 16,
          paddingRight: 16,
          paddingTop: 12,
          paddingBottom: 120,
          backgroundColor: '#f6f7fa',
        }}
      >
        <Flex
          style={[styles.titleBox]}
          direction={'row'}
          justify={'between'}
          align={'center'}
        >
          <View style={styles.titleLine}></View>
          <Text style={styles.titleText}>贵宾信息</Text>
          <Flex
            style={styles.titleRight}
            direction={'row'}
            justify={'between'}
            align={'center'}
            isTouchView
            onPress={(e: any) => {
              (navigation as any).navigate('VipInfo');
            }}
          >
            <Text style={styles.titleRightText}>贵宾管理</Text>
            <AppIcon
              name={'a-headfor-16-grey'}
              size={16}
              color="#999999"
            ></AppIcon>
          </Flex>
        </Flex>

        <View style={[styles.infoBox, styles.mt24]}>
          <Flex style={styles.itemContent} align="center" justify="between">
            <Text style={[styles.label]}>姓名</Text>
            <TextInput
              placeholder="请输入姓名"
              maxLength={11}
              value={username}
              placeholderTextColor="#CCCCCC"
              style={styles.input}
              onChangeText={text => {
                setUsername(text);
                setInfo((prev: any) => ({
                  ...prev,
                  username: text,
                }));
              }}
              onEndEditing={async event => {
                const finalUsername = (event?.nativeEvent?.text ?? '').trim();
                if (!finalUsername) {
                  return;
                }
                const res = await getMobileByName({
                  username: finalUsername,
                });
                const resolvedMobile = pickStringFromResult(res, 'mobile');
                if (resolvedMobile) {
                  setMobile(resolvedMobile);
                  setInfo((prev: any) => ({
                    ...prev,
                    username: finalUsername,
                    mobile: resolvedMobile,
                  }));
                }
              }}
            />
          </Flex>
          <Flex
            style={[styles.itemContent, styles.mt40]}
            align="center"
            justify="between"
          >
            <Text style={[styles.label]}>手机号码</Text>
            <TextInput
              placeholder="请输入手机号"
              value={mobile}
              keyboardType="numeric"
              maxLength={11}
              placeholderTextColor="#CCCCCC"
              style={styles.input}
              onChangeText={text => {
                setMobile(text);
                setInfo((prev: any) => ({
                  ...prev,
                  mobile: text,
                }));
              }}
              onEndEditing={async event => {
                const finalMobile = (event?.nativeEvent?.text ?? '').trim();
                if (!finalMobile) {
                  return;
                }
                const res = await getNameByMobile({
                  mobile: finalMobile,
                });
                const resolvedUsername = pickStringFromResult(res, 'username');
                if (resolvedUsername) {
                  setUsername(resolvedUsername);
                  setInfo((prev: any) => ({
                    ...prev,
                    mobile: finalMobile,
                    username: resolvedUsername,
                  }));
                }
              }}
            />
          </Flex>
        </View>
        <Flex
          style={[styles.titleBox, styles.mt32]}
          direction={'row'}
          justify={'between'}
          align={'center'}
        >
          <View style={styles.titleLine}></View>
          <Text style={[styles.titleText]}>使用时间</Text>
        </Flex>

        <Flex
          direction={'column'}
          style={[styles.infoBox, styles.mt24]}
          justify={'between'}
        >
          <Flex
            style={{ height: 66 }}
            direction={'row'}
            justify={'between'}
            align={'center'}
          >
            <Flex
              style={styles.timeBox}
              direction={'column'}
              justify={'between'}
              isTouchView
              onPress={() => {
                startTimePopRef?.current?.open?.();
              }}
            >
              <Flex direction="row">
                <Text style={[styles.dateText, { marginRight: 5 }]}>
                  {`${dayjs(startTime).month() + 1}月${dayjs(startTime).format(
                    'DD',
                  )}日`}
                </Text>
                <Text style={styles.dateText}>
                  {
                    DAY_OF_WEEK[
                      dayjs(startTime).day() as keyof typeof DAY_OF_WEEK
                    ]
                  }
                </Text>
              </Flex>
              <Flex>
                <Text style={styles.timeText}>{`${dayjs(startTime).format(
                  'HH',
                )}：${dayjs(startTime).format('mm')}`}</Text>
              </Flex>
            </Flex>
            <AppIcon name={'arrows1'} size={20} color="#333333"></AppIcon>
            <Flex
              style={styles.timeBox}
              direction={'column'}
              justify={'between'}
              isTouchView
              onPress={() => endTimePopRef.current?.open?.()}
            >
              <Flex direction="row">
                <Text style={{ marginRight: 5, ...styles.dateText }}>
                  {`${dayjs(endTime).format('MM')}月${dayjs(endTime).format(
                    'DD',
                  )}日`}
                </Text>
                <Text style={styles.dateText}>
                  {
                    DAY_OF_WEEK[
                      dayjs(endTime).day() as keyof typeof DAY_OF_WEEK
                    ]
                  }
                </Text>
              </Flex>
              <Flex>
                <Text style={styles.timeText}>{`${dayjs(endTime).format(
                  'HH',
                )}：${dayjs(endTime).format('mm')}`}</Text>
              </Flex>
            </Flex>
          </Flex>
          <Flex
            direction={'row'}
            justify={'between'}
            align={'center'}
            isTouchView
            style={{ height: 20, ...styles.mt40 }}
            onPress={() => {
              usageCountPopRef.current?.open?.();
            }}
          >
            <Text>使用次数</Text>
            <Text style={styles.usageCount}>
              {active
                ? selector?.find(item => item.value === customUsageCount)?.label
                : customUsageCount !== 0
                ? `${customUsageCount}次`
                : '不限'}
            </Text>
            <AppIcon
              name={'a-headfor-20'}
              size={20}
              color="#333333"
            ></AppIcon>
          </Flex>
        </Flex>

        <Flex
          style={[styles.titleBox, styles.mt32]}
          direction={'row'}
          justify={'between'}
          align={'center'}
        >
          <View style={styles.titleLine}></View>
          <Flex style={styles.titleText} align="center">
            <Text>选择</Text>
            <Flex
              direction={'row'}
              align={'center'}
              style={{ marginLeft: 4, height: 20 }}
              isTouchView
              onPress={() => {
                let newUserItem: any = {
                  ...userItem,
                  adminUserId,
                  adminUsername,
                };
                setUserItem(newUserItem);
                setAdminUserPopupVisible(true);
              }}
            >
              <Text
                numberOfLines={1}
                style={{
                  maxWidth: 70,
                  lineHeight: 18,
                  overflow: 'hidden',
                }}
              >
                {adminUsername}
              </Text>
              <AppIcon name={'pull-down'} size={12} color="#333333"></AppIcon>
              <Text style={styles.chooseNum}>
                （已选择
                {(selectedDeviceList && selectedDeviceList?.length) ?? 0}
                个）
              </Text>
            </Flex>
          </Flex>

          <Flex
            direction={'row'}
            align={'center'}
            isTouchView
            onPress={() => {
              const newIsAllSelected = !isAllSelected;
              if (!newIsAllSelected) {
                setSelectedDeviceList([]);
                setIsAllSelected(newIsAllSelected);
              } else {
                setSelectedDeviceList(
                  deviceList?.map(item => item.id) as number[],
                );
                setIsAllSelected(newIsAllSelected);
              }
            }}
          >
            <Text>全选</Text>
            <Image
              style={{
                width: 16,
                height: 16,
                marginLeft: 8,
              }}
              source={{
                uri: `https://g.18qjz.cn/img/boklock/${
                  isAllSelected ? 'radio_checked' : 'radio_default'
                }.png`,
              }}
            />
          </Flex>
        </Flex>

        <Flex
          direction={'column'}
          style={[styles.deviceBox, styles.mt24]}
          justify={'between'}
        >
          {deviceList && deviceList?.length > 0
            ? deviceList?.map((item, index) => (
                <DeviceItem
                  key={item?.id || index}
                  hasMargin={index !== 0}
                  hasLine={
                    index !== deviceList?.length - 1 && deviceList?.length !== 1
                  }
                  data={item}
                  active={selectedDeviceList.includes(item?.id)}
                  onSelect={() => handleSelected(item?.id)}
                ></DeviceItem>
              ))
            : null}
          {!complete && adminUserId ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                void getDeviceList(adminUserId, false);
              }}
              style={{ paddingVertical: 12, alignItems: 'center' }}
            >
              <Text style={{ color: '#999999', fontSize: 12 }}>加载更多</Text>
            </TouchableOpacity>
          ) : null}
        </Flex>

        {/* 开始时间 */}
        <DateTimePickerPopup
          minHeight={208}
          height={380}
          ref={startTimePopRef}
          timestamp={startTime}
          style={{ height: 380 }}
          onChange={(value: number) => {
            const now = Date.now();
            if (now > value) {
              showToast({
                title: '您选择的时间已过期，请重新选择一个当前或将来的时间',
              });
              return;
            }
            setStartTime(value);
          }}
        />

        {/* 结束时间 */}
        <DateTimePickerPopup
          minHeight={208}
          height={380}
          ref={endTimePopRef}
          timestamp={endTime}
          style={{ height: 380 }}
          onChange={(value: number) => {
            if (startTime > value) {
              showToast({ title: '开始时间不能大于结束时间' });
              return;
            }
            setEndTime(value);
          }}
        />

        {/* 使用次数 */}
        <UseCountPop
          ref={usageCountPopRef}
          active={active}
          value={pickerValue}
          onChange={(noLimitVal, customUsageCountVal, activeVal) => {
            setNoLimit(noLimitVal);
            setCustomUsageCount(customUsageCountVal);
            setActive(activeVal);
          }}
        />

        {/* 用户选择 */}
        <Popup
          visible={adminUserPopupVisible}
          onClose={() => setAdminUserPopupVisible(false)}
          minHeight={343}
          title={'切换列表'}
        >
          <View
            style={{
              paddingLeft: 24,
              paddingRight: 24,
            }}
          >
            <ScrollView
              style={{
                height: 216,
              }}
            >
              {userList && userList?.length
                ? userList.map((user, index) => (
                    <Flex
                      key={user?.adminUserId}
                      style={[
                        styles.userItem,
                        userItem?.adminUsername === user?.adminUsername
                          ? styles.activeUserItem
                          : styles.defaultUserItem,
                        index + 1 !== userList?.length ? styles.mb24 : {},
                      ]}
                      align={'center'}
                      isTouchView
                      onPress={() => {
                        setUserItem(user);
                      }}
                    >
                      <Text style={styles.userItemText}>
                        {user?.adminUsername}
                      </Text>
                    </Flex>
                  ))
                : null}
            </ScrollView>

            <Flex
              style={{
                width: '100%',
                marginBottom: 8,
                marginTop: 8,
              }}
              direction="row"
              justify="center"
              align="center"
            >
              <Flex
                direction={'column'}
                justify="center"
                align="center"
                style={styles.cancalBtn}
                isTouchView
                onPress={() => setAdminUserPopupVisible(false)}
              >
                <Text>取消</Text>
              </Flex>
              <Flex
                direction={'column'}
                justify="center"
                align="center"
                style={[styles.confirmBtn, styles.bgColor333]}
                isTouchView
                onPress={async () => {
                  if (!userItem || !userItem.adminUserId) {
                    showToast({ title: '请选择管理员' });
                    return;
                  }
                  setAdminUserId(userItem.adminUserId);
                  setAdminUsername(userItem.adminUsername);
                  await getDeviceList(userItem.adminUserId, true);
                  setAdminUserPopupVisible(false);
                }}
              >
                <Text style={styles.confirmBtnText}>确定</Text>
              </Flex>
            </Flex>
          </View>
        </Popup>

        {/* 查看 */}
        <Popup
          visible={sharePopupVisible}
          onClose={() => setSharePopupVisible(false)}
          minHeight={507}
          showClose={false}
        >
          <Flex
            style={styles.numPop}
            direction="row"
            justify={'between'}
            align={'center'}
          >
            <View></View>
            <Text style={styles.titleTextPop}>贵宾码</Text>
            <Flex isTouchView onPress={() => setSharePopupVisible(false)}>
              <AppIcon name={'close'} size={24} color="#333333"></AppIcon>
            </Flex>
          </Flex>
          <View style={styles.contentBox}>
            <Flex
              direction={'row'}
              justify={'between'}
              style={[{ width: '100%' }, styles.pl48, styles.pr32]}
            >
              <Text style={styles.rowText1}>尊敬的贵宾</Text>
              <Text style={styles.tagBox}></Text>
            </Flex>
            <Text style={styles.inviteCode}>{shareDetail?.code}</Text>
            <Text style={styles.popTime}>使用时间:</Text>
            <Flex
              direction="row"
              justify={'between'}
              align="center"
              style={styles.timeBoxPop}
            >
              <Flex
                direction="column"
                justify="between"
                style={{ marginLeft: 10 }}
              >
                <Flex direction="row" align="center">
                  <Text style={[styles.dateTextPop, styles.mr12, styles.mb8]}>
                    {`${dayjs(shareDetail?.startTime).format('MM')}月${dayjs(
                      shareDetail?.startTime,
                    ).format('DD')}日`}
                  </Text>
                  <Text style={[styles.dateTextPop, styles.mb8]}>
                    {
                      DAY_OF_WEEK[
                        dayjs(
                          shareDetail?.startTime,
                        ).day() as keyof typeof DAY_OF_WEEK
                      ]
                    }
                  </Text>
                </Flex>
                <Text style={styles.dateTime}>{`${dayjs(
                  shareDetail?.startTime,
                ).format('HH')}：${dayjs(shareDetail?.startTime).format(
                  'mm',
                )}`}</Text>
              </Flex>
              <AppIcon name={'arrows1'} size={20} color="#333333"></AppIcon>
              <Flex
                direction="column"
                justify="between"
                style={{ marginLeft: 10 }}
              >
                <Flex direction="row" align="center">
                  <Text style={[styles.dateTextPop, styles.mr12, styles.mb8]}>
                    {`${dayjs(shareDetail?.endTime).format('MM')}月${dayjs(
                      shareDetail?.endTime,
                    ).format('DD')}日`}
                  </Text>
                  <Text style={[styles.dateTextPop, styles.mb8]}>
                    {
                      DAY_OF_WEEK[
                        dayjs(
                          shareDetail?.endTime,
                        ).day() as keyof typeof DAY_OF_WEEK
                      ]
                    }
                  </Text>
                </Flex>
                <Text style={styles.dateTime}>{`${dayjs(
                  shareDetail?.endTime,
                ).format('HH')}：${dayjs(shareDetail?.endTime).format(
                  'mm',
                )}`}</Text>
              </Flex>
            </Flex>
            <Flex direction="row" justify="center" align="center">
              <Text style={styles.dateTextPop}>使用次数：</Text>
              <Text style={styles.dateTextPop}>
                {shareDetail?.noLimit ? '不限' : shareDetail?.limitTime ?? 0}
              </Text>
            </Flex>
          </View>
          <View style={styles.popupCode}>
            <Flex
              style={{
                width: '100%',
                marginTop: 31,
                marginBottom: 8,
              }}
              direction="row"
              justify="center"
              align="center"
            >
              <Flex
                direction={'column'}
                justify="center"
                align="center"
                style={styles.cancalBtnPop}
                isTouchView
                onPress={() => setSharePopupVisible(false)}
              >
                <Text>取消</Text>
              </Flex>
              <Flex
                direction={'column'}
                justify="center"
                align="center"
                isTouchView
                style={[
                  styles.confirmBtnPop,
                  styles.bgColor333,
                  styles.shareBtn,
                ]}
                onPress={() => {
                  if (!shareDetail) return;
                  void onShare(shareDetail);
                }}
              >
                <Text style={{ color: '#ffffff' }}>发送给贵宾</Text>
              </Flex>
            </Flex>
          </View>
        </Popup>

        {/* 隐藏的封面图UI */}
        {shareDetail && (
          <WeChatCoverImage
            style={{ position: 'absolute', top: -9999, left: -9999 }}
            shareContentRef={shareContentRef}
            details={shareDetail}
          />
        )}
      </View>
    </PageContainer>
  );
};

export default VipPage;
