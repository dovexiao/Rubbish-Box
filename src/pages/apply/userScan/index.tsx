import { showToast, showLoading, hideLoading } from '@/utils';
import { Image, View, Text, TouchableOpacity } from 'react-native';
import { useRef, useState } from 'react';
import {
  PageContainer,
  TextInput,
  Flex,
  MediaCarousel,
  PopConfirm,
} from '@/components/index';
import AppIcon from '@/components/AppIcon';
import styles from './styles';
import { useFocusEffect } from '@react-navigation/core';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getOperateResult, lockApplyOpt } from '@/services/device';
import { userScanDevice } from '@/services/user';
import { loopFunc } from '@/utils';
import { px } from '@/utils/ui';

interface ImageMapProps {
  closeCoverGif: string;
  fallLockGif: string;
  fallLockPng: string;
  lockBindGif: string;
  openCoverGif: string;
  openLockPng: string;
  unlockLockGif: string;
  upLockGif: string;
  up120LockPng: string;
  upLockPng: string;
  up30LockPng: string;
}

interface ScanDeviceProps {
  /*是否为分享的地锁0否 1是 */
  shareFlag: number;
  /*该时间段内商家是否有共享地锁 0否 1是 */
  hasShareFlag: number;
  /*该时间段内共享的地锁有无可用的 0否 1是 */
  hasShareEmptyFlag: number;
  /*该地锁是否空闲 0否 1是 */
  emptyFlag: number;
  /*广告图片url列表 */
  bannerImageUrls: string[];
  /*广告文案 */
  bannerText: string;
  /*地锁名称 */
  lockName: string;
  /*贵宾码 */
  code: string;
  /*是否为管理员/成员扫码*/
  belongFlag: boolean;
  /*是否需要进行APP端操作*/
  needAppOpt: boolean;
  /*是否为组合设备*/
  groupFlag: boolean;
  /*地锁数量*/
  count: number;
  /*用户剩余可使用次数*/
  userLeftTime: number;
  /*申请审核状态 0无申请记录 1待审核 2审核通过 3审核驳回*/
  auditStatus: number;
  /*申请记录ID*/
  applyId: number;
  deviceNo: string;
  lockId: number;
  imageMap: ImageMapProps;
  // 商家手机号
  adminMobile: string;
  // 用户手机号
  loginMobile: string;
  //最后一次降下是否为当前用户
  lastOptUserFlag: boolean;
}

export default function ApplyRecordDetail() {
  const route = useRoute<any>();
  const tipsRef = useRef<any>(null);
  const [disableOpt, setDisableOpt] = useState(false);
  const navigation = useNavigation<any>();
  const code = route.params?.code ? String(route.params.code) : '';
  const [detail, setDetail] = useState<ScanDeviceProps | undefined>(undefined);
  const [optName, setOptName] = useState('');
  const [successCount, setSuccessCount] = useState(0);

  useFocusEffect(() => {
    getDetail();
  });

  const getDetail = async () => {
    const res: any = await userScanDevice({
      code,
    });
    if (res?.code != '200') {
      showToast({ title: res?.message || '获取详情失败', icon: 'none' });
      return;
    }
    if (res.data.bannerText?.trim()) {
      res.data.bannerImageUrls.unshift(res.data.bannerText?.trim());
    }
    setDisableOpt(!res.data?.userLeftTime);
    setDetail(res.data);
  };

  const getScanDevice = async (code: string) => {
    const res = await userScanDevice({ code });
    if (res) {
      setDetail(res.data);
    }
  };

  const loopOperateStatus = async (ot: number) => {
    let timer: any = null;
    const { start, stop } = loopFunc(async () => {
      const res = await getOperateResult({
        deviceNo: detail?.deviceNo,
        ot,
      });
      if (res) {
        stop();
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
        hideLoading();
        if (detail && detail.count > 1 && successCount < detail.count) {
          tipsRef.current?.open();
        } else {
          showToast({ title: '操作成功', icon: 'none' });
        }
        getScanDevice(code);
        return false;
      }
      return true;
    }, 1000);
    timer = setTimeout(() => {
      stop();
      hideLoading();
      showToast({
        title: '操作超时',
        icon: 'none',
      });
    }, 10000);
    start();
  };

  const onOperate = async (optType: number) => {
    if (!detail) return;

    showLoading({ title: optType === 1 ? '升锁中...' : '降锁中...' });
    const res = await lockApplyOpt({
      id: detail.lockId,
      optType,
    });
    if (res.success) {
      setSuccessCount(res.data);
      setOptName(optType === 1 ? '升起' : '降下');
      loopOperateStatus(optType === 1 ? 1 : 2);
    } else {
      hideLoading();
      showToast({
        title: res.message || '操作失败',
        icon: 'none',
      });
    }
  };

  return (
    <PageContainer
      safeAreaEdges={['top', 'bottom']}
      statusBarStyle="dark-content"
      statusBarBackgroundColor="#ffffff"
      pageNavProps={{
        text: detail?.lockName || '',
        showBack: true,
        background: '#FFFFFF',
      }}
      navBorder
      backgroundColor="#f5f7fb"
    >
      {detail && (
        <Flex direction="column" align="center" style={styles.container}>
          {((detail?.bannerImageUrls && detail?.bannerImageUrls?.length > 0) ||
            detail?.bannerText) && (
            <MediaCarousel itemList={detail?.bannerImageUrls || []} />
          )}
          {!detail?.bannerImageUrls?.length && !detail?.bannerText && (
            <View style={styles.lockImgBox}>
              <Image
                source={{ uri: detail?.imageMap?.upLockPng ?? '' }}
                style={styles.lockImg}
              />
              {detail?.groupFlag && (
                <Flex style={styles.lockNumBox} align="end">
                  <View
                    style={{
                      marginBottom: 9,
                      marginRight: 2,
                    }}
                  >
                    <AppIcon size={15} color="#333333" name="multiplication" />
                  </View>
                  <Text style={styles.lockNumText2}>{detail?.count}</Text>
                </Flex>
              )}
            </View>
          )}
          {detail &&
          detail?.userLeftTime > 0 &&
          !detail?.emptyFlag &&
          !detail?.lastOptUserFlag ? (
            <Flex
              style={styles.optContent}
              direction="column"
              align="center"
              justify="center"
            >
              <Text style={styles.tips3}>此地锁已被使用</Text>
            </Flex>
          ) : (
            <Flex
              style={styles.optContent}
              direction="column"
              align="center"
              justify="center"
            >
              <Flex>
                <Flex
                  isTouchView
                  direction="column"
                  align="center"
                  justify="center"
                  style={{
                    ...styles[disableOpt ? 'optBtn--disable' : 'optBtn'],
                    marginRight: 48,
                  }}
                  onPress={() => !disableOpt && onOperate(1)}
                >
                  <AppIcon
                    name="rise"
                    size={36}
                    color={disableOpt ? '#ccc' : '#333333'}
                  ></AppIcon>
                  <Text
                    style={styles[disableOpt ? 'btnText--disable' : 'btnText']}
                  >
                    升锁
                  </Text>
                </Flex>
                <Flex
                  direction="column"
                  align="center"
                  justify="center"
                  isTouchView
                  style={styles[disableOpt ? 'optBtn--disable' : 'optBtn']}
                  onPress={() => !disableOpt && onOperate(0)}
                >
                  <AppIcon
                    name="down"
                    size={36}
                    color={disableOpt ? '#ccc' : '#333333'}
                  ></AppIcon>
                  <Text
                    style={styles[disableOpt ? 'btnText--disable' : 'btnText']}
                  >
                    降锁
                  </Text>
                </Flex>
              </Flex>
              {/* {detail &&
              (([0, 1, 3].includes(detail?.auditStatus) && detail?.emptyFlag) ||
                (detail?.userLeftTime == 0 && detail.auditStatus == 2) ||
                ([0, 1, 3].includes(detail?.auditStatus) &&
                  !detail?.emptyFlag &&
                  detail.lastOptUserFlag)) ? (
                <Flex
                  style={styles.applyBtn}
                  align="center"
                  justify="center"
                  onPress={() => {
                    toApplyDetail();
                  }}
                >
                  <Text style={styles.applyBtnText}>
                    {[0, 2].includes(detail?.auditStatus)
                      ? '申请使用地锁'
                      : detail.auditStatus == 1
                      ? '地锁使用申请审核中'
                      : '地锁使用申请被拒'}
                  </Text>
                  {[0, 3].includes(detail?.auditStatus) && (
                    <AppIcon name="a-headfor-20" color="#333333" size={36} />
                  )}
                </Flex>
              ) : null} */}
              {detail && detail?.userLeftTime > 0 && (
                <Text style={styles.tips}>
                  您还有 {detail.userLeftTime} 次使用机会
                </Text>
              )}
              {detail &&
                !detail?.emptyFlag &&
                !detail?.userLeftTime &&
                !detail?.lastOptUserFlag && (
                  <Text style={styles.tips2}>该地锁已被使用</Text>
                )}
              {detail && detail?.needAppOpt && (
                <Text style={styles.tips2}>此地锁未对外，暂不可使用</Text>
              )}
            </Flex>
          )}
          <Flex
            align="center"
            isTouchView
            justify="center"
            style={{ marginTop: 24 }}
            onPress={() => {
              console.log(11111);
              navigation.navigate('Shopping');
            }}
          >
            <Text style={styles.botText}>前往商城购买同款地锁 &nbsp;</Text>
            <AppIcon name={'arrows1'} size={px(16)} color="#333333"></AppIcon>
          </Flex>
          <PopConfirm
            title={
              <Flex direction={'column'} align={'center'}>
                <Text style={styles.popTitle}>温馨提示</Text>
                <Text style={[styles.popText, { marginBottom: px(4) }]}>
                  {successCount}台地锁{optName}成功
                </Text>
                <Text style={styles.popText}>
                  (其他地锁可能存在上方有车、锁盖解锁、设备离线的情况)
                </Text>
              </Flex>
            }
            ref={tipsRef}
            showClose={false}
            confirmText="关闭"
            onConfirm={async () => {
              tipsRef.current?.close();
            }}
          />
        </Flex>
      )}
    </PageContainer>
  );
}
