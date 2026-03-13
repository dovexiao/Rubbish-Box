import AppIcon from '@/components/AppIcon';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, Image, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import { PageContainer, Popup, Flex } from '@/components';
import { DAY_OF_WEEK } from '@/constants';
import {
  getAdmins,
  getDetails,
  getLockListByAdmin,
  saveInvite,
} from '@/services/user';
import DateTimePickerPopup from '@/components/CustomDateTimePickerPopup';
import { showToast } from '@/utils';
import { styles } from './style';
import { DeviceItem } from './com/deviceItem';
import UseCountPop from './com/useCountPop';

/**
 * Page state interface
 * @interface Props
 * @property {string | undefined} detail - Page detail data
 */

interface UserList {
  adminUserId?: number;
  adminUsername?: string;
}

interface DeviceItemType {
  groupCount: number;
  id: number;
  imageUrl: string;
  lockName: string;
  role: number;
  roleName: string;
}

const PAGE_SIZE = 10;

export default function VipEditRecordPage() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const currentId = route.params?.currentId as number | undefined;

  const [detail, setDetail] = useState<any>();
  const [info, setInfo] = useState<{ username?: string; mobile?: string }>();
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [selectedDeviceList, setSelectedDeviceList] = useState<number[]>([]);
  const [deviceList, setDeviceList] = useState<DeviceItemType[]>([]);
  const [complete, setComplete] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [endTime, setEndTime] = useState<number>(
    dayjs(Date.now()).hour(23).minute(59).second(59).millisecond(0).valueOf(),
  );
  const [pickerValue, setPickerValue] = useState<string | undefined>();
  const [noLimit, setNoLimit] = useState<number>(0);
  const [active, setActive] = useState<boolean>(true);
  const [customUsageCount, setCustomUsageCount] = useState<number>(0);
  const [adminUsername, setAdminUsername] = useState<string | undefined>();
  const [adminUserId, setAdminUserId] = useState<number | undefined>();
  const [userList, setUserList] = useState<UserList[]>([]);

  const startTimePopRef = useRef<any>(null);
  const endTimePopRef = useRef<any>(null);
  const usageCountPopRef = useRef<any>(null);
  const [adminUserPopupVisible, setAdminUserPopupVisible] = useState(false);

  const [userItem, setUserItem] = useState<UserList>({} as UserList);

  const handleSelected = useCallback((id: number) => {
    setSelectedDeviceList(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id],
    );
  }, []);

  const fetchDetails = useCallback(async () => {
    if (!currentId) return;
    const res: any = await getDetails({ id: currentId });
    const data = res.data || res;
    const {
      adminUserId: _adminUserId,
      adminUsername: _adminUsername,
      username,
      mobile,
      startTime: _start,
      endTime: _end,
      limitTime,
      noLimit: _noLimit,
      page,
      customUsageCount: _custom,
    } = data || {};

    const selectedIds: number[] = (page?.list || [])
      .filter((item: any) => item.chooseFlag === 1)
      .map((item: any) => item.id);

    setDetail(data);
    setAdminUserId(_adminUserId);
    setAdminUsername(_adminUsername);
    setInfo({ username, mobile });
    setStartTime(_start);
    setEndTime(_end);
    setCustomUsageCount(_noLimit ? 0 : limitTime);
    setNoLimit(_noLimit);
    setPickerValue(limitTime);
    setSelectedDeviceList(selectedIds || []);

    await fetchDeviceList(_adminUserId, true, selectedIds || []);
  }, [currentId]);

  const fetchUserList = useCallback(async () => {
    const res: any = await getAdmins({});
    const data = res.data || res;
    setUserList(data || []);
  }, []);

  const fetchDeviceList = useCallback(
    async (id: number, reload?: boolean, selectedIds?: number[]) => {
      if (!id) return;
      const res: any = await getLockListByAdmin({
        offset: reload ? 0 : deviceList.length,
        pageSize: PAGE_SIZE,
        adminUserId: id,
      });
      const data = res.data || res;
      const rows: DeviceItemType[] = Array.isArray(data.list)
        ? data.list
        : Array.isArray((res as any).list)
        ? (res as any).list
        : [];

      const nextList = reload ? rows : [...deviceList, ...rows];
      const setList = new Set(selectedIds || selectedDeviceList);
      setDeviceList(nextList);
      setComplete(rows.length < PAGE_SIZE);
      setIsAllSelected(
        nextList.length > 0 && nextList.every(item => setList.has(item.id)),
      );
    },
    [deviceList, selectedDeviceList],
  );

  useEffect(() => {
    void fetchDetails();
    void fetchUserList();
  }, [fetchDetails, fetchUserList]);

  useEffect(() => {
    if (
      selectedDeviceList.length === deviceList.length &&
      deviceList.length > 0
    ) {
      setIsAllSelected(true);
    } else {
      setIsAllSelected(false);
    }
  }, [selectedDeviceList, deviceList.length]);

  const handleInvite = useCallback(async () => {
    if (!startTime) {
      showToast({ title: '请选择开始时间', icon: 'none' });
      return;
    }
    if (!endTime) {
      showToast({ title: '请选择结束时间', icon: 'none' });
      return;
    }
    if (startTime > endTime) {
      showToast({ title: '开始时间不能大于结束时间', icon: 'none' });
      return;
    }
    if (!noLimit && !customUsageCount) {
      showToast({ title: '请选择使用次数', icon: 'none' });
      return;
    }
    if (!selectedDeviceList || selectedDeviceList.length <= 0) {
      showToast({ title: '请选择分享地锁', icon: 'none' });
      return;
    }
    if (!adminUserId) {
      showToast({ title: '请选择有效的管理员身份', icon: 'none' });
      return;
    }

    const payload: any = {
      id: currentId,
      adminUserId,
      userLockIds: selectedDeviceList,
      username: info?.username,
      mobile: info?.mobile,
      startTime,
      endTime,
      limitTime: noLimit ? null : customUsageCount,
      noLimit,
    };

    const res: any = await saveInvite(payload);
    const ok = res?.code === 200 || res?.success;
    if (ok) {
      navigation.goBack();
    }
  }, [
    startTime,
    endTime,
    noLimit,
    customUsageCount,
    selectedDeviceList,
    adminUserId,
    currentId,
    info?.username,
    info?.mobile,
    navigation,
  ]);

  return (
    <PageContainer
      pageNavProps={{ text: '编辑宾客邀请记录', showBack: true }}
      backgroundColor="#F6F7FA"
      statusBarStyle="dark-content"
      safeAreaEdges={['top', 'bottom']}
      scrollable
      footer={
        <Flex
          style={styles.editPageFooter}
          direction="column"
          justify="center"
          align="center"
          isTouchView
          onPress={handleInvite}
        >
          <Text style={styles.footerBtnText}>确定编辑</Text>
        </Flex>
      }
    >
      <Flex
        style={[styles.titleBox, styles.mt24]}
        direction={'row'}
        justify={'between'}
        align={'center'}
      >
        <View style={styles.titleLine}></View>
        <Text style={styles.titleText}>贵宾信息</Text>
      </Flex>

      <Flex
        direction={'column'}
        style={[styles.infoBox, styles.mt24]}
        justify={'between'}
      >
        <Flex style={styles.itemContent} align="center" justify="between">
          <Text style={[styles.label, styles.contentLabel]}>姓名</Text>
          <Text
            style={[styles.input, { flex: 1, textAlign: 'right' }]}
            numberOfLines={1}
          >
            {info?.username}
          </Text>
        </Flex>
        <Flex
          style={[styles.itemContent, styles.mt40]}
          align="center"
          justify="between"
        >
          <Text style={[styles.label, styles.contentLabel]}>手机号码</Text>
          <Text
            style={[styles.input, { flex: 1, textAlign: 'right' }]}
            numberOfLines={1}
          >
            {info?.mobile}
          </Text>
        </Flex>
      </Flex>

      <Flex
        style={[styles.titleBox, styles.mt32]}
        direction={'row'}
        justify={'between'}
        align={'center'}
      >
        <View style={styles.titleLine}></View>
        <Text style={styles.titleText}>使用时间</Text>
      </Flex>

      <Flex
        direction={'column'}
        style={[styles.infoBox, styles.mt24]}
        justify={'between'}
      >
        <Flex
          style={{ height: 69 }}
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
              startTimePopRef.current?.open?.();
            }}
          >
            <Flex direction="row">
              <Text style={[styles.dateText, { marginRight: 5 }]}>
                {`${dayjs(startTime).format('MM')}月${dayjs(startTime).format(
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
          <AppIcon name={'arrows1'} size={40} color="#333333"></AppIcon>
          <Flex
            style={styles.timeBox}
            direction={'column'}
            justify={'between'}
            isTouchView
            onPress={() => endTimePopRef.current?.open?.()}
          >
            <Flex direction="row">
              <Text style={[styles.dateText, { marginRight: 5 }]}>
                {`${dayjs(endTime).format('MM')}月${dayjs(endTime).format(
                  'DD',
                )}日`}
              </Text>
              <Text style={styles.dateText}>
                {DAY_OF_WEEK[dayjs(endTime).day() as keyof typeof DAY_OF_WEEK]}
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
          style={[{ height: 20 }, styles.mt40]}
          isTouchView
          onPress={() => usageCountPopRef.current?.open?.()}
        >
          <Text>使用次数</Text>
          <Text style={styles.usageCount}>
            {/* {selector?.find(item => item.value === customUsageCount)?.label} */}
            {customUsageCount !== 0 &&
            customUsageCount !== undefined &&
            customUsageCount !== null
              ? `${customUsageCount}次`
              : '不限'}
          </Text>
          <AppIcon name={'a-headfor-20'} size={40} color="#333333"></AppIcon>
        </Flex>
      </Flex>

      <Flex
        style={[styles.titleBox, styles.mt32]}
        direction={'row'}
        justify={'between'}
        align={'center'}
      >
        <View style={styles.titleLine}></View>
        <Flex style={styles.titleText}>
          <Text>选择</Text>
          <Flex
            direction={'row'}
            align={'center'}
            style={{ marginLeft: 4 }}
            isTouchView
            onPress={() => {
              setUserItem(prev => ({
                ...prev,
                adminUserId,
                adminUsername,
              }));
              setAdminUserPopupVisible(true);
            }}
          >
            <Text numberOfLines={1} style={{ maxWidth: 70 }}>
              {adminUsername}
            </Text>
            <AppIcon name={'pull-down'} size={24} color="#333333"></AppIcon>
            <Text style={styles.chooseNum}>
              （已选择
              {(selectedDeviceList && selectedDeviceList?.length) ?? 0}个）
            </Text>
          </Flex>
        </Flex>

        <Flex
          direction={'row'}
          align={'center'}
          isTouchView
          onPress={() => {
            if (isAllSelected) {
              setSelectedDeviceList([]);
              setIsAllSelected(false);
            } else {
              const allIds = deviceList.map(item => item.id);
              setSelectedDeviceList(allIds);
              setIsAllSelected(true);
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
        <ScrollView
          style={{ flex: 1 }}
          onScrollEndDrag={event => {
            const { contentOffset, contentSize, layoutMeasurement } =
              event.nativeEvent;
            const paddingToBottom = 20;
            if (
              contentOffset.y + layoutMeasurement.height + paddingToBottom >=
              contentSize.height
            ) {
              if (!complete && adminUserId) {
                void fetchDeviceList(adminUserId, false);
              }
            }
          }}
        >
          {deviceList && deviceList.length > 0 ? (
            deviceList.map((item, index) => (
              <DeviceItem
                hasMargin={index !== 0}
                hasLine={
                  index !== deviceList.length - 1 && deviceList.length !== 1
                }
                data={item}
                active={selectedDeviceList.includes(item.id)}
                onSelect={() => handleSelected(item.id)}
              ></DeviceItem>
            ))
          ) : (
            <></>
          )}
        </ScrollView>
      </Flex>

      {/* 开始时间 */}
      <DateTimePickerPopup
        minHeight={208}
        height={380}
        ref={startTimePopRef}
        timestamp={startTime}
        style={{ height: 380 }}
        onChange={(value: number) => {
          // if (startTime > value) {
          //   showToast({title: '您选择的时间已过期，请重新选择一个当前或将来的时间'})
          //   return
          // }
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
          // if (endTime > value) {
          //   showToast({title: '您选择的时间已过期，请重新选择一个当前或将来的时间'})
          //   return
          // }
          setEndTime(value);
        }}
      />

      {/* 使用次数 */}
      <UseCountPop
        ref={usageCountPopRef}
        active={active}
        value={pickerValue}
        onChange={(noLimitVal, customUsageCountVal, activeVal) => {
          setNoLimit(noLimitVal as number);
          setCustomUsageCount(customUsageCountVal as number);
          setActive(activeVal as boolean);
        }}
      />

      {/* 用户选择 */}
      <Popup
        visible={adminUserPopupVisible}
        onClose={() => setAdminUserPopupVisible(false)}
        minHeight={343}
        title={
          <Flex
            style={styles.num}
            direction="row"
            justify={'between'}
            align={'center'}
          >
            <View style={{ width: 24, height: 24 }}></View>
            <View>
              <Text style={styles.popTitleText}>切换列表</Text>
            </View>
            <View
              style={{ marginRight: 16 }}
              onTouchEnd={() => setAdminUserPopupVisible(false)}
            >
              <AppIcon name={'close'} size={24} color="#333333"></AppIcon>
            </View>
          </Flex>
        }
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
            {userList && userList.length ? (
              userList.map((user, index) => (
                <Flex
                  isTouchView
                  onPress={() => {
                    setUserItem(user);
                  }}
                  key={user?.adminUserId}
                  style={[
                    styles.userItem,
                    userItem?.adminUsername === user?.adminUsername
                      ? styles.activeUserItem
                      : styles.defaultUserItem,
                    index + 1 !== userList.length ? styles.mb24 : {},
                  ]}
                  align={'center'}
                >
                  <Text style={styles.userItemText}>{user?.adminUsername}</Text>
                </Flex>
              ))
            ) : (
              <></>
            )}
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
                await fetchDeviceList(userItem.adminUserId, true);
                setAdminUserPopupVisible(false);
              }}
            >
              <Text style={styles.confirmBtnText}>确定</Text>
            </Flex>
          </Flex>
        </View>
      </Popup>
    </PageContainer>
  );
}
