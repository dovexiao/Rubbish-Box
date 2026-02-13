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
  ImageStyle,
  FlatList,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Toast } from '@ant-design/react-native';
import Flex from '@/components/Flex';
import IconFont from '@/iconfont';
import Popup from '@/components/Popup';
import { PageContainer, TextInput } from '@/components';
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

interface UserList {
  adminUserId: number;
  adminUsername: string;
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
  const [info, setInfo] = useState<any>(undefined);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [selectedDeviceList, setSelectedDeviceList] = useState<
    number[] | undefined
  >(undefined);
  const [deviceList, setDeviceList] = useState<DeviceList[] | undefined>(
    undefined,
  );
  const [complete, setComplete] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [endTime, setEndTime] = useState(
    dayjs(Date.now()).hour(23).minute(59).second(59).millisecond(0).valueOf(),
  );
  const [pickerValue, setPickerValue] = useState<undefined | string>(undefined);
  const [noLimit, setNoLimit] = useState(1);
  const [active, setActive] = useState(true); // 是否直接选择次数
  const [customUsageCount, setCustomUsageCount] = useState<number>(1); // 自定义使用次数
  const [adminUsername, setAdminUsername] = useState<string | undefined>(
    undefined,
  ); // 当前选择的用户
  const [adminUserId, setAdminUserId] = useState<number | undefined>(undefined);
  const [userList, setUserList] = useState<UserList[] | undefined>(undefined);
  const [shareDetail, setShareDetail] = useState<DetailsProp | undefined>(
    undefined,
  );
  const [shareImagePath, setShareImagePath] = useState<string | undefined>(
    undefined,
  );
  const [unUseCount, setUnUseCount] = useState<number | undefined>(undefined);
  const [showSharePopup, setShowSharePopup] = useState<boolean>(false);
  const [sharePopRef, setSharePopRef] = useState<boolean>(false);
  const shareContentRef = useRef<any>(null);
  const startTimePopRef = useRef<any>(null);
  const endTimePopRef = useRef<any>(null);
  const usageCountPopRef = useRef<any>(null);
  const adminUserPopRef = useRef<any>(null);
  const [userItem, setUserItem] = useState<UserList>({} as UserList);
  const selector = [
    { label: '不限', value: 0 },
    { label: '1次', value: 1 },
    { label: '2次', value: 2 },
    { label: '3次', value: 3 },
    { label: '4次', value: 4 },
    { label: '5次', value: 5 },
  ];

  const router = useRoute<any>();
  const navigation = useNavigation();

  useEffect(() => {
    setIsAllSelected(selectedDeviceList?.length === deviceList?.length);
  }, [selectedDeviceList]);

  const onLoad = async () => {
    const detail = router.params?.detail as unknown as LockInfoDTO;
    setDetail(detail);
    await getUserList();
    await getCount();
  };

  const getCount = async () => {
    const res: any = await getUnUseCount({});
    setUnUseCount(res ?? 0);
  };

  const getUserList = async () => {
    const res: any = await getAdmins({});
    await setUserList(res?.list ?? []);
    await setAdminUsername(res?.[0]?.adminUsername);
    await setAdminUserId(res?.[0]?.adminUserId);
    getDeviceList(res?.[0]?.adminUserId, true);
  };

  const handleSelected = async (id: number) => {
    if (selectedDeviceList.includes(id)) {
      setSelectedDeviceList(
        selectedDeviceList.filter((item: any) => item !== id),
      );
    } else {
      setSelectedDeviceList([...selectedDeviceList, id]);
    }
  };

  const getDeviceList = async (id: number, reload?: boolean) => {
    const res: any = await getLockListByAdmin({
      offset: reload ? 0 : deviceList?.length,
      pageSize: 10,
      adminUserId: id,
    });
    setDeviceList(reload ? res.list : [...deviceList, ...res.list]);
    setComplete(res.list.length < 10);
    setSelectedDeviceList(res.list.map(item => item.id));
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
      username: info?.username,
      mobile: info?.mobile,
      startTime,
      endTime,
      limitTime: noLimit ? null : customUsageCount,
      noLimit, // 0-限制次数 1-不限制次数
      // status: 0,  // 状态：1-生效中 2-已使用 10-过期未用 20-已作废
    });
    if (res.code === '200') {
      const shareDetail = await getSimpleDetails(res?.data);
      setSharePopRef(true);
      setTimeout(async () => {
        await setShareDetail(shareDetail);
      }, 300);
    }
  };

  const getSimpleDetails = async id => {
    const res: any = await simpleDetails({
      id,
    });

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
      const fl = await tencentUpload({
        file,
        filename: file.split('/').pop() as string,
        index: 0,
      });
      return cdnDomain(fl.data.Location);
    } catch (e) {
      showToast({ title: '资源上传失败' });
      return '';
    }
  };

  const onShare = async (detail: any) => {
    showLoading({ title: '生成分享图片中...' });
    try {
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
      setSharePopRef(false);
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
      footer={
        <Flex
          style={styles.pageFooter}
          direction="column"
          justify={'center'}
          align="center"
        >
          <TouchableOpacity onPress={handleInvite} style={styles.footerBtn}>
            <Text style={styles.footerBtnText}>生成贵宾码</Text>
          </TouchableOpacity>
          <Flex
            style={[styles.mt24, { position: 'relative' }]}
            direction={'row'}
            justify={'center'}
            align={'center'}
            isTouchView
            onPress={() => {
              // navigateTo({ url: '/pages/user/vip/record' })
            }}
          >
            <Text style={styles.vipRecord}>贵宾邀请记录</Text>
            <IconFont
              name={'a-headfor-20'}
              size={32}
              color="#333333"
            ></IconFont>

            {unUseCount > 0 && (
              <View style={styles.messageBadge}>
                <Text style={styles.messageBadgeText}>
                  {unUseCount > 99 ? '99+' : unUseCount}
                </Text>
              </View>
            )}
          </Flex>
        </Flex>
      }
    >
      <></>
    </PageContainer>
  );
};
