import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import type { StyleProp, TextStyle } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/core';
import { Button } from '@ant-design/react-native';
import { GradientButton, PageContainer, Popup, Tag } from '@/components';
import Flex from '@/components/Flex';
import Video from 'react-native-video';
import {
  getTestDeviceDetail,
  getTestDeviceReason,
  getTestDeviceReslt,
  getTestOperateResult,
  modifyTestDevice,
  resetTestDevice,
  switchTestDevice,
  testDeviceOperation,
} from '@/services/deviceTest';
import { hideLoading, loopFunc, showLoading, showToast } from '@/utils';
import {
  getSystemConnectedDevices,
  isSameMac,
  getBluetoothDeviceInfo,
} from '@/utils';
import { sendModeCommandByBluetooth, getBluetoothState } from '@/utils/api';
import styles from './styles';
import AppIcon from '@/components/AppIcon';
import PopCenter from '@/components/PopCenter';
import UnqualifiedPop, { UnqualifiedPopRef } from './UnqualifiedPop';
import { px } from '@/utils/ui';

const TEST_RESULT = {
  NORMAL: 0,
  QUALIFIED: 1,
  FAIL: 2,
} as const;

const BUZZER_STATUS = {
  CLOSE: 0,
  OPEN: 1,
  FAIL: 2,
} as const;

const ABOVE_STATUS = {
  CLOSE: 0,
  OPEN: 1,
} as const;

const COVER_STATUS = {
  CLOSE: 0,
  OPEN: 1,
} as const;

// 与后端约定的测试操作类型（保持与 src/constants 中一致）
const TEST_OT_STATUS = {
  DOWN: 0,
  RISE: 1,
  BUZZER: 3,
  OPENCOVER: 13,
} as const;

interface TestReasonItem {
  failureReason: string;
  testTime: number;
}

interface TestDeviceDetail {
  id: string;
  deviceNo: string;
  fourGLiftTestStatus: number;
  bluetoothProximityStatus: number;
  buzzerTestStatus: number;
  ccoverTestStatus: number;
  leaveTestStatus: number;
  testResult: number;
  testReason: string;
  canOpenCover: boolean;
  lockId: string;
  modeSwitchTestStatus: number;
  fourGLiftStatus: number;
  coverStatus: number;
  coverTestStatus: number;
  model?: number;
  bleName?: string;
  pin?: string;
  aboveGeoTestStatus?: number;
  aboveMixtureTestStatus?: number;
  /* 火焰检测 */
  fireTestStatus: number;
  /* 温度检测 */
  tempTestStatus: number;
  /* 地磁检测 */
  magneticTestStatus: number;
}

type RouteParams = {
  deviceNo: string;
};

export default function TestDeviceDetailScreen() {
  const route = useRoute<any>();
  const deviceNo: string = route.params?.deviceNo;

  const [detail, setDetail] = useState<TestDeviceDetail | null>(null);
  const [testResult, setTestResult] = useState<0 | 1 | 2 | undefined>(0);
  const [reasonList, setReasonList] = useState<TestReasonItem[]>([]);
  const [currentReason, setCurrentReason] = useState<string | undefined>();
  const [isLink, setIsLink] = useState(false);
  const [linkDevice, setLinkDevice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [testDeviceReslt, setTestDeviceReslt] = useState<any>({});

  const testStatusPollingRef = useRef<{
    start: () => void;
    stop: () => void;
  } | null>(null);
  const confirmPopupRef = useRef<any>(null);

  const [reasonPopupVisible, setReasonPopupVisible] = useState(false);
  const [unqualifiedPopupVisible, setUnqualifiedPopupVisible] = useState(false);
  const [howToConnectVisible, setHowToConnectVisible] = useState(false);
  const [confirmPopup, setConfirmPopup] = useState<{
    visible: boolean;
    title: string;
    onConfirm?: () => Promise<void> | void;
  }>({ visible: false, title: '' });

  const unqualifiedPopupRef = useRef<UnqualifiedPopRef | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!deviceNo) return;
    try {
      const res: any = await getTestDeviceDetail({ deviceNo });
      const d: TestDeviceDetail = res?.data ?? res ?? {};
      setDetail(d);
      setTestResult(d.testReason ? (d.testResult as any) : undefined);
    } catch (e) {
      showToast({ title: '获取设备详情失败', icon: 'info' });
    } finally {
      setLoading(false);
    }
  }, [deviceNo]);

  const fetchReasons = useCallback(async () => {
    if (!deviceNo) return;
    try {
      const res: any = await getTestDeviceReason({ deviceNo });
      const list: TestReasonItem[] = res?.list || res?.data?.list || [];
      setReasonList(list);
    } catch (e) {
      console.error('getTestDeviceReason error:', e);
    }
  }, [deviceNo]);

  const checkConnection = useCallback(async () => {
    if (!detail?.lockId) {
      setIsLink(false);
      setLinkDevice(null);
      return;
    }
    try {
      const state = await getBluetoothState();
      if (state !== 'PoweredOn') {
        setIsLink(false);
        setLinkDevice(null);
        return;
      }
      const info = await getSystemConnectedDevices();
      const data = (info as any).data || [];
      let connected = false;
      let found = null;
      const bleNo = String((detail as any).bleNo || detail.lockId);
      if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
        const result = await getBluetoothDeviceInfo().catch(() => ({}));
        const savedDeviceInfo = (result as any)?.[bleNo];
        const deviceId = savedDeviceInfo?.deviceId;
        found = data.find((item: any) => item.deviceId == deviceId);
        connected = !!(found && found.isConnected);
      } else {
        found = data.find((item: any) => isSameMac(item.deviceId, bleNo));
        connected = !!found;
      }
      setIsLink(connected);
      setLinkDevice(found || null);
    } catch (e) {
      console.error('检查蓝牙连接状态失败:', e);
      setIsLink(false);
      setLinkDevice(null);
    }
  }, [detail]);

  const handleTestDeviceReslt = useCallback(
    (key?: string, value?: number) => {
      if (!detail?.deviceNo) return;

      if (
        testStatusPollingRef.current ||
        detail?.testResult !== TEST_RESULT.NORMAL
      ) {
        testStatusPollingRef.current?.stop();
        testStatusPollingRef.current = null;
      }

      let hasShownSwitchSuccess = false;

      const { start, stop } = loopFunc(async () => {
        try {
          const res: any = await getTestDeviceReslt({
            deviceNo: detail.deviceNo,
          });
          if (res) {
            const data = res?.data ?? res;
            setTestDeviceReslt(data);
            // 若传入了 key/value，则等待对应字段达到目标值后提示成功（本轮轮询只提示一次）
            if (
              !hasShownSwitchSuccess &&
              key &&
              data &&
              (data as any)[key] === value
            ) {
              hasShownSwitchSuccess = true;
              hideLoading();
              showToast({ title: '切换成功', icon: 'info' });
            }
            // 若后端返回了最终测试结果，则刷新详情并停止轮询
            const tr = (res?.data ?? res)?.testResult;
            if (
              tr === TEST_RESULT.QUALIFIED ||
              tr === TEST_RESULT.FAIL ||
              detail.testResult !== TEST_RESULT.NORMAL
            ) {
              hideLoading();
              stop();
              testStatusPollingRef.current = null;
              await fetchDetail();
              return false;
            }
          }
          return true;
        } catch (e) {
          console.error('getTestDeviceReslt error:', e);
          hideLoading();
          stop();
          testStatusPollingRef.current = null;
          return false;
        }
      }, 1000);

      testStatusPollingRef.current = { start, stop };
      start();
    },
    [detail?.deviceNo, detail?.testResult, fetchDetail],
  );

  useEffect(() => {
    void fetchDetail();
    void fetchReasons();
  }, [fetchDetail, fetchReasons]);

  useFocusEffect(
    useCallback(() => {
      let stopLoop: (() => void) | null = null;
      if (detail) {
        const { start, stop } = loopFunc(async () => {
          await checkConnection();
          return true; // 返回 true 继续轮询，loopFunc 会自动 await 避免请求堆叠
        }, 1000);
        stopLoop = stop;
        start();
      }
      return () => {
        if (stopLoop) stopLoop();
      };
    }, [detail, checkConnection]),
  );

  useEffect(() => {
    if (detail?.deviceNo) {
      handleTestDeviceReslt();
    }
  }, [detail?.deviceNo, handleTestDeviceReslt]);

  useEffect(() => {
    return () => {
      testStatusPollingRef.current?.stop?.();
      testStatusPollingRef.current = null;
    };
  }, []);

  const updateTestResult = async (params: Partial<TestDeviceDetail>) => {
    if (!deviceNo) return;
    showLoading({ title: '操作中...' });
    try {
      const payload: any = {
        deviceNo,
        ...params,
      };
      const res: any = await modifyTestDevice(payload);
      if (res === true || Number(res?.code) === 200) {
        await fetchDetail();
      } else {
        showToast({
          title: res?.message || res?.msg || '操作失败',
          icon: 'info',
        });
      }
    } catch (e) {
      showToast({ title: '操作失败', icon: 'info' });
    } finally {
      hideLoading();
    }
  };

  const getResult = async (
    ot: (typeof TEST_OT_STATUS)[keyof typeof TEST_OT_STATUS],
  ) => {
    if (!detail) return;
    let count = 0;
    const maxCount = 10;

    const { start, stop } = loopFunc(async () => {
      try {
        const res: any = await getTestOperateResult({
          id: detail.id,
          ot,
        });
        if (res) {
          stop();
          hideLoading();
          await fetchDetail();
          return false;
        }
      } catch (e) {
        console.error('getTestOperateResult error:', e);
      }
      count += 1;
      if (count >= maxCount) {
        stop();
        hideLoading();
        showToast({ title: '操作超时', icon: 'info' });
        return false;
      }
      return true;
    }, 1000);

    start();
  };

  const operateDevice = async (data: {
    optType: (typeof TEST_OT_STATUS)[keyof typeof TEST_OT_STATUS];
    isOpen?: 0 | 1;
  }) => {
    if (!deviceNo) return;
    showLoading({ title: '操作中...' });
    try {
      const res: any = await testDeviceOperation({
        deviceNo,
        ...data,
      });
      if ((data.optType === TEST_OT_STATUS.BUZZER && res) || res === true) {
        await fetchDetail();
        hideLoading();
      } else {
        hideLoading();
        await getResult(data.optType);
      }
    } catch (e) {
      hideLoading();
      showToast({ title: '操作失败', icon: 'info' });
    }
  };

  const handleReset = async () => {
    if (!deviceNo) return;
    showLoading({ title: '重测中...' });
    try {
      const res: any = await resetTestDevice({ deviceNo });
      if (res === true || Number(res?.code) === 200) {
        hideLoading();
        await fetchDetail();
        showToast({ title: '重测已发起', icon: 'info' });
      } else {
        hideLoading();
        showToast({
          title: res?.message || res?.msg || '重测失败',
          icon: 'info',
        });
      }
    } catch (e) {
      hideLoading();
      showToast({ title: '重测失败', icon: 'info' });
    }
  };

  const handleChange = useCallback(
    async (val: number) => {
      if (!detail || !deviceNo) return;
      showLoading({ title: '切换模式中...' });
      try {
        // 性能优先（val===1）且蓝牙已连接时，先通过蓝牙切换，提升成功率
        if (val === 1 && isLink && linkDevice?.deviceId) {
          const cmdRes = await sendModeCommandByBluetooth({
            deviceId: linkDevice.deviceId,
            mode: val,
            deviceNo: detail.deviceNo,
          });
          if (!cmdRes?.success) {
            showToast({
              title: cmdRes?.msg || '蓝牙模式切换失败，请重试',
              icon: 'info',
            });
            return;
          }
          // 给设备一点时间落库/上报
          await new Promise(r => setTimeout(r, 1500));
        }

        // 同步到后端（后端字段可能是 model 或 mode，这里都带上，兼容历史）
        await updateTestResult({
          model: val,
          mode: val,
        } as any);
      } finally {
        hideLoading();
      }
    },
    [detail, deviceNo, isLink, linkDevice?.deviceId],
  );
  const renderFooterButtons = () => {
    return (
      <Flex
        direction={'column'}
        align={'center'}
        style={styles.btnContainerWrapper}
      >
        {detail?.testResult !== 1 ? (
          <Flex
            justify={'center'}
            align={'center'}
            style={{
              width: '100%',
            }}
            direction={detail?.testResult === 2 ? 'column' : 'row'}
          >
            {detail?.testResult === 0 ? (
              <>
                <GradientButton
                  height={px(48)}
                  colors={['transparent', 'transparent']}
                  onPress={() => unqualifiedPopupRef.current?.open()}
                  style={[styles.btnContainer, styles.btnContainerClose]}
                >
                  <Text style={styles.btnContainerCloseText}>测试不合格</Text>
                </GradientButton>
                <GradientButton
                  height={px(48)}
                  colors={['#2F77FF', '#2F77FF']}
                  onPress={() => {
                    confirmPopupRef.current.open();
                    setConfirmPopup({
                      visible: true,
                      title: `确定本次测试结果合格吗？`,
                      onConfirm: async () => {
                        const res: any = await switchTestDevice(
                          {
                            deviceNo: detail.deviceNo,
                            aboveCheckMethod: 1,
                          } as any,
                          'info' as any,
                        );
                        if (res && (res.code === 200 || res.success)) {
                          handleTestDeviceReslt('aboveCheckMethod', 1);
                          if (testDeviceReslt?.aboveCheckMethod === 1) {
                            await updateTestResult({
                              testResult: 1,
                            });
                          }
                        } else {
                          hideLoading();
                          showToast({
                            title: res?.message || res?.msg || '提交失败',
                            icon: 'info',
                          });
                        }
                      },
                    });
                  }}
                  style={[styles.btnContainer, styles.btnContainerConfirm]}
                >
                  <Text style={styles.btnContainerConfirmText}>测试合格</Text>
                </GradientButton>
              </>
            ) : (
              <>
                <Text
                  style={styles.lockBtnTextFail}
                  onPress={() => {
                    setCurrentReason(detail?.testReason);
                    setUnqualifiedPopupVisible(true);
                  }}
                >
                  测试不合格，查看原因
                </Text>
                <GradientButton
                  colors={['#2F77FF', '#2F77FF']}
                  onPress={() => {
                    handleReset();
                  }}
                  width={px(174)}
                  style={styles.resetBtn}
                >
                  <Text style={styles.btnContainerConfirmText}>再次测试</Text>
                </GradientButton>
              </>
            )}
          </Flex>
        ) : null}
        {reasonList && reasonList.length > 0 && (
          <Text
            style={styles.historyUnqualifiedReason}
            onPress={() => setReasonPopupVisible(true)}
          >
            历史不合格原因》
          </Text>
        )}
      </Flex>
    );
  };

  console.log(detail, 'detail?.model');
  return (
    <PageContainer
      backgroundColor="#FFFFFF"
      statusBarStyle="dark-content"
      statusBarBackgroundColor="#FFFFFF"
      safeAreaEdges={['top', 'bottom']}
      scrollable
      contentContainerStyle={styles.container}
      pageNavProps={{
        text: '泊刻地锁测试',
        showBack: true,
        background: '#FFFFFF',
      }}
      loading={loading}
      footer={renderFooterButtons()}
    >
      {detail && (
        <Flex direction={'column'} align={'center'}>
          <Flex style={styles.lockContentWrapper} justify={'center'}>
            <Image
              style={{ width: px(120), height: px(120) }}
              source={{ uri: 'https://g.18qjz.cn/jijimaClient/occupy.png' }}
            />

            <Flex style={styles.lockContentTextWrapper} direction={'column'}>
              {detail.testResult !== 0 && (
                <>
                  <Text
                    style={[
                      detail.testResult === 1 && styles.lockContentTextSuccess,
                      detail.testResult === 2 && styles.lockContentTextFail,
                    ]}
                  >
                    测试{detail.testResult === 1 ? '' : '不'}合格
                  </Text>
                  {detail.testResult === 2 && (
                    <Text
                      style={styles.lockContentText}
                      onPress={() => {
                        setCurrentReason(detail.testReason);
                        unqualifiedPopupRef.current?.open();
                      }}
                    >
                      查看原因
                    </Text>
                  )}
                </>
              )}
            </Flex>
          </Flex>
          {/* <Text style={styles.deviceNoText}>设备编号: {detail?.deviceNo}</Text> */}
          <Text style={styles.deviceNoText}>
            设备SN码: {detail?.lockId ?? '暂无'}
          </Text>

          {/* <Flex
            direction={'column'}
            style={detail?.['bleName'] ? styles.deviceModeWrapper : undefined}
          >
            <Text style={styles.modeText}>
              蓝牙名称：
              <Text style={styles.modeTextValue}>{detail?.['bleName']}</Text>
            </Text>
            <Text style={styles.modeText}>
              蓝牙密码：
              <Text style={styles.modeTextValue}>{detail?.['pin']}</Text>
            </Text>
            <Text style={styles.modeText}>
              蓝牙连接状态：
              <Text
                style={isLink ? styles.modeTextSuccess : styles.modeTextFail}
              >
                {isLink ? '已连接' : '未连接'}
              </Text>
            </Text>
          </Flex> */}
          <Flex
            justify="between"
            style={{
              marginBottom: px(10),
              width: '100%',
              paddingBottom: px(10),
            }}
          >
            <Flex style={{ alignItems: 'center' }}>
              <Text style={styles.title}>当前模式：</Text>
              <Text
                style={{
                  fontWeight: 'bold',
                  color: 'red',
                }}
              >
                【{detail?.['model'] === 1 ? '性能优先' : '续航优先'}】
              </Text>
            </Flex>

            <Button
              size={'small'}
              style={{ height: px(29) }}
              type={'primary'}
              onPress={() => handleChange(detail?.['model'] === 1 ? 2 : 1)}
            >
              {detail?.['model'] === 1 ? '切换到续航优先' : '切换到性能优先'}
            </Button>
          </Flex>

          <View
            style={{
              marginBottom: px(20),
              marginTop: px(20),
              width: '100%',
            }}
          >
            <Text style={styles.title}>
              以下功能需要切换到
              <Text style={{ fontWeight: 'bold', color: 'red' }}>
                【性能模式】
              </Text>
              ：
            </Text>
          </View>
          <View
            style={[
              styles.deviceContentWrapper,
              detail?.model === 2 && styles.deviceContentWrapperModel2,
            ]}
          >
            {/* 蓝牙相关隐藏 */}
            {/*4G升降 */}
            <Flex style={styles.deviceInfoWrapper} direction={'column'}>
              <Flex style={styles.deviceInfoHeader} align="center">
                <Text style={styles.title}>4G升降测试</Text>
                <Tag
                  style={{
                    backgroundColor: '#70B601',
                    marginLeft: px(18),
                    marginRight: px(34),
                  }}
                  textStyle={{ color: '#ffffff' }}
                >
                  {testDeviceReslt.fourGLiftStatus === 2 ? '已降下' : '已升起'}
                </Tag>

                <Button
                  style={{ width: px(105), height: px(28) }}
                  type={'primary'}
                  size={'small'}
                  onPress={() => {
                    if (detail?.['model'] === 2) {
                      setConfirmPopup({
                        visible: true,
                        title: '需要切换到性能优先模式才能操作',
                        onConfirm: async () => {
                          if (!isLink) {
                            showToast({ title: '请先连接蓝牙', icon: 'info' });
                            return;
                          }
                          await handleChange(1);
                        },
                      });
                      return;
                    }
                    const isDown = testDeviceReslt.fourGLiftStatus === 2;
                    setConfirmPopup({
                      visible: true,
                      title: `确认${isDown ? '升起' : '降下'}地锁吗？`,
                      onConfirm: async () => {
                        await operateDevice({
                          optType: isDown
                            ? (TEST_OT_STATUS as any).RISE
                            : (TEST_OT_STATUS as any).DOWN,
                        });
                      },
                    });
                    confirmPopupRef.current?.open();
                  }}
                >
                  {testDeviceReslt.fourGLiftStatus === 2
                    ? '升起地锁'
                    : '降下地锁'}
                </Button>
              </Flex>
              <Flex
                style={{
                  flex: 1,
                }}
                justify={'center'}
              >
                {detail.fourGLiftTestStatus === 0 && (
                  <Flex>
                    <Flex
                      isTouchView
                      onPress={async () => {
                        await updateTestResult({
                          fourGLiftTestStatus: 1,
                        });
                      }}
                    >
                      <View style={styles.radioWrapper}>
                        <Image
                          style={{
                            width: px(20),
                            height: px(20),
                          }}
                          source={{
                            uri: 'https://g.18qjz.cn/img/boklock/radio_default.png',
                          }}
                        />
                      </View>
                      <Text
                        style={{
                          marginLeft: px(8),
                          color: '#70B601',
                        }}
                      >
                        正常
                      </Text>
                    </Flex>
                    <Flex
                      style={{
                        marginLeft: px(48),
                      }}
                      isTouchView
                      onPress={async () => {
                        await updateTestResult({
                          fourGLiftTestStatus: 2,
                        });
                      }}
                    >
                      <View style={styles.radioWrapper}>
                        <Image
                          style={{
                            width: px(20),
                            height: px(20),
                          }}
                          source={{
                            uri: 'https://g.18qjz.cn/img/boklock/radio_default.png',
                          }}
                        />
                      </View>
                      <Text
                        style={{
                          marginLeft: px(8),
                          color: '#E86B6E',
                        }}
                      >
                        故障
                      </Text>
                    </Flex>
                  </Flex>
                )}
                {detail.fourGLiftTestStatus !== 0 && (
                  <Text
                    style={{
                      color:
                        detail.fourGLiftTestStatus === 1
                          ? '#70B601'
                          : '#E86B6E',
                    }}
                  >
                    测试{detail.fourGLiftTestStatus === 1 ? '正常' : '故障'}
                  </Text>
                )}
              </Flex>
            </Flex>
            {/* 蓝牙近身升降测试 */}
            <Flex style={styles.deviceInfoWrapper} direction={'column'}>
              <Flex
                style={(styles.deviceInfoHeader, { marginBottom: px(8) })}
                align="center"
              >
                <Text style={styles.title}>蓝牙近身升降测试</Text>
              </Flex>
              <Flex direction={'column'}>
                <Text style={styles.modeText}>
                  蓝牙名称：
                  <Text style={styles.modeTextValue}>
                    {detail?.['bleName']}
                  </Text>
                </Text>
                <Flex
                  align="center"
                  justify="between"
                  style={{
                    width: '100%',
                  }}
                >
                  <Text style={styles.modeText}>
                    蓝牙连接状态：
                    <Text
                      style={
                        isLink ? styles.modeTextSuccess : styles.modeTextFail
                      }
                    >
                      {isLink ? '已连接' : '未连接'}
                    </Text>
                  </Text>
                  <TouchableOpacity
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      flexDirection: 'row',
                    }}
                    onPress={() => setHowToConnectVisible(true)}
                  >
                    <Text>如何连接蓝牙</Text>
                    <AppIcon name="explain" size={px(18)} color="#333333" />
                  </TouchableOpacity>
                </Flex>
              </Flex>

              <Text style={styles.desc}>
                手机靠近，自动降下地锁（需保证蓝牙信号稳定）
              </Text>
              <Flex
                style={{
                  flex: 1,
                }}
                justify={'center'}
              >
                {detail.bluetoothProximityStatus === 0 && (
                  <Flex>
                    <Flex
                      isTouchView
                      onPress={async () => {
                        await updateTestResult({
                          bluetoothProximityStatus: 1,
                        });
                      }}
                    >
                      <View style={styles.radioWrapper}>
                        <Image
                          style={{
                            width: px(20),
                            height: px(20),
                          }}
                          source={{
                            uri: 'https://g.18qjz.cn/img/boklock/radio_default.png',
                          }}
                        />
                      </View>
                      <Text
                        style={{
                          marginLeft: px(8),
                          color: '#70B601',
                        }}
                      >
                        正常
                      </Text>
                    </Flex>
                    <Flex
                      style={{
                        marginLeft: px(48),
                      }}
                      isTouchView
                      onPress={async () => {
                        await updateTestResult({
                          bluetoothProximityStatus: 2,
                        });
                      }}
                    >
                      <View style={styles.radioWrapper}>
                        <Image
                          style={{
                            width: px(20),
                            height: px(20),
                          }}
                          source={{
                            uri: 'https://g.18qjz.cn/img/boklock/radio_default.png',
                          }}
                        />
                      </View>
                      <Text
                        style={{
                          marginLeft: px(8),
                          color: '#E86B6E',
                        }}
                      >
                        故障
                      </Text>
                    </Flex>
                  </Flex>
                )}
                {detail.bluetoothProximityStatus !== 0 && (
                  <Text
                    style={{
                      color:
                        detail.bluetoothProximityStatus === 1
                          ? '#70B601'
                          : '#E86B6E',
                    }}
                  >
                    测试
                    {detail.bluetoothProximityStatus === 1 ? '正常' : '故障'}
                  </Text>
                )}
              </Flex>
            </Flex>
            {/* 蜂鸣测试 */}
            <Flex style={styles.deviceInfoWrapper} direction={'column'}>
              <Flex style={styles.deviceInfoHeader} align="center">
                <Text style={styles.title}>蜂鸣测试</Text>
                <Button
                  style={{
                    width: px(105),
                    height: px(28),
                    marginLeft: px(24),
                  }}
                  size="small"
                  type={'primary'}
                  onPress={() => {
                    if (detail?.['model'] === 2) {
                      setConfirmPopup({
                        visible: true,
                        title: '需要切换到性能优先模式才能操作',
                        onConfirm: async () => {
                          if (!isLink) {
                            showToast({ title: '请先连接蓝牙', icon: 'info' });
                            return;
                          }
                          await handleChange(1);
                        },
                      });
                      return;
                    }
                    setConfirmPopup({
                      visible: true,
                      title: '确认测试蜂鸣吗？',
                      onConfirm: async () => {
                        await operateDevice({ optType: TEST_OT_STATUS.BUZZER });
                      },
                    });
                    confirmPopupRef.current?.open();
                  }}
                >
                  测试
                </Button>
              </Flex>
              <Flex
                style={{
                  flex: 1,
                }}
                justify={'center'}
              >
                {detail.buzzerTestStatus === BUZZER_STATUS.CLOSE && (
                  <Flex>
                    <Flex
                      isTouchView
                      onPress={async () => {
                        await updateTestResult({
                          buzzerTestStatus: 1,
                        });
                      }}
                    >
                      <View style={styles.radioWrapper}>
                        <Image
                          style={{
                            width: px(20),
                            height: px(20),
                          }}
                          source={{
                            uri: 'https://g.18qjz.cn/img/boklock/radio_default.png',
                          }}
                        />
                      </View>
                      <Text
                        style={{
                          marginLeft: px(8),
                          color: '#70B601',
                        }}
                      >
                        正常
                      </Text>
                    </Flex>
                    <Flex
                      style={{
                        marginLeft: px(48),
                      }}
                      isTouchView
                      onPress={async () => {
                        await updateTestResult({
                          buzzerTestStatus: 2,
                        });
                      }}
                    >
                      <View style={styles.radioWrapper}>
                        <Image
                          style={{
                            width: px(20),
                            height: px(20),
                          }}
                          source={{
                            uri: 'https://g.18qjz.cn/img/boklock/radio_default.png',
                          }}
                        />
                      </View>
                      <Text
                        style={{
                          marginLeft: px(8),
                          color: '#E86B6E',
                        }}
                      >
                        故障
                      </Text>
                    </Flex>
                  </Flex>
                )}
                {detail.buzzerTestStatus !== 0 && (
                  <Text
                    style={{
                      color:
                        detail.buzzerTestStatus === BUZZER_STATUS.OPEN
                          ? '#70B601'
                          : '#E86B6E',
                    }}
                  >
                    测试
                    {detail.buzzerTestStatus === BUZZER_STATUS.OPEN
                      ? '正常'
                      : '故障'}
                  </Text>
                )}
              </Flex>
            </Flex>
            {/* 机盖解锁测试 */}
            {detail.canOpenCover && (
              <Flex style={styles.deviceInfoWrapper} direction={'column'}>
                <Flex style={styles.deviceInfoHeader} align="center">
                  <Text style={styles.title}>机盖解锁测试</Text>
                  <Button
                    style={{
                      width: px(105),
                      height: px(28),
                      marginLeft: px(24),
                    }}
                    size="small"
                    type={'primary'}
                    onPress={() => {
                      if (detail?.['model'] === 2) {
                        setConfirmPopup({
                          visible: true,
                          title: '需要切换到性能优先模式才能操作',
                          onConfirm: async () => {
                            if (!isLink) {
                              showToast({
                                title: '请先连接蓝牙',
                                icon: 'info',
                              });
                              return;
                            }
                            await handleChange(1);
                          },
                        });
                        return;
                      }
                      setConfirmPopup({
                        visible: true,
                        title: `确认${
                          testDeviceReslt.coverStatus === 1 ? '关闭' : '打开'
                        }机盖吗？`,
                        onConfirm: async () => {
                          await operateDevice({
                            optType: TEST_OT_STATUS.OPENCOVER,
                            isOpen: testDeviceReslt.coverStatus === 1 ? 0 : 1,
                          });
                        },
                      });
                      confirmPopupRef.current?.open();
                    }}
                  >
                    {testDeviceReslt.coverStatus === 1
                      ? '关闭机盖'
                      : '打开机盖'}
                  </Button>
                </Flex>
                <Flex
                  style={{
                    flex: 1,
                  }}
                  justify={'center'}
                >
                  {detail.coverTestStatus === COVER_STATUS.CLOSE && (
                    <Flex>
                      <Flex
                        isTouchView
                        onPress={async () => {
                          await updateTestResult({
                            coverTestStatus: 1,
                          });
                        }}
                      >
                        <View style={styles.radioWrapper}>
                          <Image
                            style={{
                              width: px(20),
                              height: px(20),
                            }}
                            source={{
                              uri: 'https://g.18qjz.cn/img/boklock/radio_default.png',
                            }}
                          />
                        </View>
                        <Text
                          style={{
                            marginLeft: px(8),
                            color: '#70B601',
                          }}
                        >
                          正常
                        </Text>
                      </Flex>
                      <Flex
                        style={{
                          marginLeft: px(48),
                        }}
                        isTouchView
                        onPress={async () => {
                          await updateTestResult({
                            coverTestStatus: 2,
                          });
                        }}
                      >
                        <View style={styles.radioWrapper}>
                          <Image
                            style={{
                              width: px(20),
                              height: px(20),
                            }}
                            source={{
                              uri: 'https://g.18qjz.cn/img/boklock/radio_default.png',
                            }}
                          />
                        </View>
                        <Text
                          style={{
                            marginLeft: px(8),
                            color: '#E86B6E',
                          }}
                        >
                          故障
                        </Text>
                      </Flex>
                    </Flex>
                  )}
                  {detail.coverTestStatus !== 0 && (
                    <Text
                      style={{
                        color:
                          detail.coverTestStatus === COVER_STATUS.OPEN
                            ? '#70B601'
                            : '#E86B6E',
                      }}
                    >
                      测试
                      {detail.coverTestStatus === COVER_STATUS.OPEN
                        ? '正常'
                        : '故障'}
                    </Text>
                  )}
                </Flex>
              </Flex>
            )}

            {/* 火焰检测  */}
            <Flex style={styles.deviceInfoWrapper} direction={'column'}>
              <Flex
                style={styles.deviceInfoHeader}
                justify="between"
                align="center"
              >
                <Text style={styles.title}>火焰测试</Text>
                <Text
                  style={{
                    color:
                      testDeviceReslt.fireStatus === 0 ? '#70B601' : '#E86B6E',
                  }}
                >
                  {testDeviceReslt.fireStatus === 1 ? '有火焰🔥' : '无火焰🔥'}
                </Text>
              </Flex>
              <Flex
                style={{
                  flex: 1,
                }}
                justify={'center'}
              >
                {detail.fireTestStatus === 0 && (
                  <Flex>
                    <Flex
                      isTouchView
                      onPress={async () => {
                        await updateTestResult({
                          fireTestStatus: 1,
                        });
                      }}
                    >
                      <View style={styles.radioWrapper}>
                        <Image
                          style={{
                            width: px(20),
                            height: px(20),
                          }}
                          source={{
                            uri: 'https://g.18qjz.cn/img/boklock/radio_default.png',
                          }}
                        />
                      </View>
                      <Text
                        style={{
                          marginLeft: px(8),
                          color: '#70B601',
                        }}
                      >
                        正常
                      </Text>
                    </Flex>
                    <Flex
                      style={{
                        marginLeft: px(48),
                      }}
                      isTouchView
                      onPress={async () => {
                        await updateTestResult({
                          fireTestStatus: 2,
                        });
                      }}
                    >
                      <View style={styles.radioWrapper}>
                        <Image
                          style={{
                            width: px(20),
                            height: px(20),
                          }}
                          source={{
                            uri: 'https://g.18qjz.cn/img/boklock/radio_default.png',
                          }}
                        />
                      </View>
                      <Text
                        style={{
                          marginLeft: px(8),
                          color: '#E86B6E',
                        }}
                      >
                        故障
                      </Text>
                    </Flex>
                  </Flex>
                )}
                {detail.fireTestStatus !== 0 && (
                  <Text
                    style={{
                      color:
                        detail.fireTestStatus === ABOVE_STATUS.OPEN
                          ? '#70B601'
                          : '#E86B6E',
                    }}
                  >
                    测试
                    {detail.fireTestStatus === ABOVE_STATUS.OPEN
                      ? '正常'
                      : '故障'}
                  </Text>
                )}
              </Flex>
            </Flex>
            {/* 温度检测 */}
            <Flex style={styles.deviceInfoWrapper} direction={'column'}>
              <Flex
                style={styles.deviceInfoHeader}
                justify="between"
                align="center"
              >
                <Text style={styles.title}>温度测试</Text>
                <Text
                  style={{
                    color:
                      testDeviceReslt.temperatureStatus === 1
                        ? '#70B601'
                        : '#E86B6E',
                  }}
                >
                  {testDeviceReslt.temp || 0} 度
                </Text>
              </Flex>
              <Flex
                style={{
                  flex: 1,
                }}
                justify={'center'}
              >
                {detail.tempTestStatus === 0 && (
                  <Flex>
                    <Flex
                      isTouchView
                      onPress={async () => {
                        await updateTestResult({
                          tempTestStatus: 1,
                        });
                      }}
                    >
                      <View style={styles.radioWrapper}>
                        <Image
                          style={{
                            width: px(20),
                            height: px(20),
                          }}
                          source={{
                            uri: 'https://g.18qjz.cn/img/boklock/radio_default.png',
                          }}
                        />
                      </View>
                      <Text
                        style={{
                          marginLeft: px(8),
                          color: '#70B601',
                        }}
                      >
                        正常
                      </Text>
                    </Flex>
                    <Flex
                      style={{
                        marginLeft: px(48),
                      }}
                      isTouchView
                      onPress={async () => {
                        await updateTestResult({
                          tempTestStatus: 2,
                        });
                      }}
                    >
                      <View style={styles.radioWrapper}>
                        <Image
                          style={{
                            width: px(20),
                            height: px(20),
                          }}
                          source={{
                            uri: 'https://g.18qjz.cn/img/boklock/radio_default.png',
                          }}
                        />
                      </View>
                      <Text
                        style={{
                          marginLeft: px(8),
                          color: '#E86B6E',
                        }}
                      >
                        故障
                      </Text>
                    </Flex>
                  </Flex>
                )}
                {detail.tempTestStatus !== 0 && (
                  <Text
                    style={{
                      color:
                        detail.tempTestStatus === ABOVE_STATUS.OPEN
                          ? '#70B601'
                          : '#E86B6E',
                    }}
                  >
                    测试
                    {detail.tempTestStatus === ABOVE_STATUS.OPEN
                      ? '正常'
                      : '故障'}
                  </Text>
                )}
              </Flex>
            </Flex>

            {/* 车辆存在检查（二选一：地磁+超声波 / 地磁） */}
            <Flex style={styles.deviceInfoWrapper} direction={'column'}>
              <Flex
                style={[styles.deviceInfoHeader, { marginBottom: 0 }]}
                align="center"
                justify="between"
              >
                <Flex align="center">
                  {detail.aboveGeoTestStatus === 0 &&
                    detail.aboveMixtureTestStatus === 0 && (
                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={{
                          width: px(20),
                          height: px(20),
                          backgroundColor: '#F5F5F5',
                          borderRadius: px(10),
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: px(8),
                        }}
                        onPress={async () => {
                          showLoading({ title: '切换中...' });
                          try {
                            const res: any = await switchTestDevice(
                              {
                                deviceNo: detail.deviceNo,
                                aboveCheckMethod: 1,
                              } as any,
                              'info' as any,
                            );
                            if (res && (res.code === 200 || res.success)) {
                              handleTestDeviceReslt('aboveCheckMethod', 1);
                            } else {
                              hideLoading();
                              showToast({
                                title: res?.message || res?.msg || '切换失败',
                                icon: 'info',
                              });
                            }
                          } catch (e) {
                            hideLoading();
                            showToast({ title: '切换失败', icon: 'info' });
                          }
                        }}
                      >
                        <Image
                          source={{
                            uri: `https://g.18qjz.cn/img/boklock/${
                              testDeviceReslt?.aboveCheckMethod === 1
                                ? 'radio_checked'
                                : 'radio_default'
                            }.png`,
                          }}
                          style={{ width: px(16), height: px(16) }}
                        />
                      </TouchableOpacity>
                    )}
                  <Text style={styles.title}>车辆存在检查-地磁+超声波</Text>
                </Flex>
                <Text
                  style={{
                    color:
                      testDeviceReslt?.aboveStatus === 0
                        ? '#70B601'
                        : '#E86B6E',
                  }}
                >
                  {testDeviceReslt?.aboveStatus === 1 ? '有车辆' : '无车辆'}
                </Text>
              </Flex>
              <Flex style={{ flex: 1, marginTop: px(16) }} justify={'center'}>
                {detail.aboveMixtureTestStatus === 0 ? (
                  <Flex>
                    <Flex
                      isTouchView
                      onPress={async () => {
                        await updateTestResult({
                          aboveMixtureTestStatus: 1,
                          aboveGeoTestStatus: 0,
                        } as any);
                      }}
                    >
                      <View style={styles.radioWrapper}>
                        <Image
                          style={{ width: px(20), height: px(20) }}
                          source={{
                            uri: 'https://g.18qjz.cn/img/boklock/radio_default.png',
                          }}
                        />
                      </View>
                      <Text style={{ marginLeft: px(8), color: '#70B601' }}>
                        正常
                      </Text>
                    </Flex>
                    <Flex
                      style={{ marginLeft: px(48) }}
                      isTouchView
                      onPress={async () => {
                        await updateTestResult({
                          aboveMixtureTestStatus: 2,
                          aboveGeoTestStatus: 0,
                        } as any);
                      }}
                    >
                      <View style={styles.radioWrapper}>
                        <Image
                          style={{ width: px(20), height: px(20) }}
                          source={{
                            uri: 'https://g.18qjz.cn/img/boklock/radio_default.png',
                          }}
                        />
                      </View>
                      <Text style={{ marginLeft: px(8), color: '#E86B6E' }}>
                        故障
                      </Text>
                    </Flex>
                  </Flex>
                ) : (
                  <Text
                    style={{
                      color:
                        detail.aboveMixtureTestStatus === ABOVE_STATUS.OPEN
                          ? '#70B601'
                          : '#E86B6E',
                    }}
                  >
                    测试
                    {detail.aboveMixtureTestStatus === ABOVE_STATUS.OPEN
                      ? '正常'
                      : '故障'}
                  </Text>
                )}
              </Flex>
            </Flex>

            <Flex style={styles.deviceInfoWrapper} direction={'column'}>
              <Flex
                style={[styles.deviceInfoHeader, { marginBottom: 0 }]}
                align="center"
                justify="between"
              >
                <Flex align="center">
                  {detail.aboveGeoTestStatus === 0 &&
                    detail.aboveMixtureTestStatus === 0 && (
                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={{
                          width: px(20),
                          height: px(20),
                          backgroundColor: '#F5F5F5',
                          borderRadius: px(10),
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: px(8),
                        }}
                        onPress={async () => {
                          showLoading({ title: '切换中...' });
                          try {
                            const res: any = await switchTestDevice(
                              {
                                deviceNo: detail.deviceNo,
                                aboveCheckMethod: 0,
                              } as any,
                              'info' as any,
                            );
                            if (res && (res.code === 200 || res.success)) {
                              handleTestDeviceReslt('aboveCheckMethod', 0);
                            } else {
                              showToast({
                                title: res?.message || res?.msg || '切换失败',
                                icon: 'info',
                              });
                            }
                          } catch (e) {
                            hideLoading();
                            hideLoading();
                            showToast({ title: '切换失败', icon: 'info' });
                          }
                        }}
                      >
                        <Image
                          source={{
                            uri: `https://g.18qjz.cn/img/boklock/${
                              testDeviceReslt?.aboveCheckMethod === 0
                                ? 'radio_checked'
                                : 'radio_default'
                            }.png`,
                          }}
                          style={{ width: px(16), height: px(16) }}
                        />
                      </TouchableOpacity>
                    )}
                  <Text style={styles.title}>车辆存在检测-地磁</Text>
                </Flex>
                <Text
                  style={{
                    color:
                      testDeviceReslt?.aboveStatus === 0
                        ? '#70B601'
                        : '#E86B6E',
                  }}
                >
                  {testDeviceReslt?.aboveStatus === 1 ? '有车辆' : '无车辆'}
                </Text>
              </Flex>
              <Flex style={{ flex: 1, marginTop: px(16) }} justify={'center'}>
                {detail.aboveGeoTestStatus === 0 ? (
                  <Flex>
                    <Flex
                      isTouchView
                      onPress={async () => {
                        await updateTestResult({
                          aboveGeoTestStatus: 1,
                          aboveMixtureTestStatus: 0,
                        } as any);
                      }}
                    >
                      <View style={styles.radioWrapper}>
                        <Image
                          style={{ width: px(20), height: px(20) }}
                          source={{
                            uri: 'https://g.18qjz.cn/img/boklock/radio_default.png',
                          }}
                        />
                      </View>
                      <Text style={{ marginLeft: px(8), color: '#70B601' }}>
                        正常
                      </Text>
                    </Flex>
                    <Flex
                      style={{ marginLeft: px(48) }}
                      isTouchView
                      onPress={async () => {
                        await updateTestResult({
                          aboveGeoTestStatus: 2,
                          aboveMixtureTestStatus: 0,
                        } as any);
                      }}
                    >
                      <View style={styles.radioWrapper}>
                        <Image
                          style={{ width: px(20), height: px(20) }}
                          source={{
                            uri: 'https://g.18qjz.cn/img/boklock/radio_default.png',
                          }}
                        />
                      </View>
                      <Text style={{ marginLeft: px(8), color: '#E86B6E' }}>
                        故障
                      </Text>
                    </Flex>
                  </Flex>
                ) : (
                  <Text
                    style={{
                      color:
                        detail.aboveGeoTestStatus === ABOVE_STATUS.OPEN
                          ? '#70B601'
                          : '#E86B6E',
                    }}
                  >
                    测试
                    {detail.aboveGeoTestStatus === ABOVE_STATUS.OPEN
                      ? '正常'
                      : '故障'}
                  </Text>
                )}
              </Flex>
            </Flex>

            {detail?.['model'] === 2 && <View style={styles.maskWrapper} />}
          </View>
        </Flex>
      )}

      {/* 历史不合格原因弹窗 */}
      <Popup
        visible={reasonPopupVisible}
        onClose={() => setReasonPopupVisible(false)}
        title="历史不合格原因"
      >
        <View style={styles.popupBody}>
          {reasonList.map(item => (
            <View key={item.testTime} style={styles.popupLine}>
              <Text style={styles.popupLineText}>
                {new Date(item.testTime).toLocaleString()}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setCurrentReason(item.failureReason);
                  setUnqualifiedPopupVisible(true);
                }}
              >
                <Text style={[styles.popupLineText, { color: '#2F77FF' }]}>
                  查看原因
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </Popup>

      {/* 不合格原因编辑弹窗 */}
      <UnqualifiedPop
        ref={unqualifiedPopupRef}
        onConfirm={async reason => {
          if (!reason?.trim()) {
            showToast({ title: '请输入不合格原因', icon: 'info' });
            return false;
          }
          await updateTestResult({
            testResult: TEST_RESULT.FAIL,
            testReason: reason.trim(),
          } as any);
          return true;
        }}
      />

      {/* 不合格原因弹窗（只读） */}
      <Popup
        visible={unqualifiedPopupVisible}
        onClose={() => setUnqualifiedPopupVisible(false)}
        title="本次测试结果为不合格"
      >
        <View style={styles.popupBody}>
          <View style={styles.popupLine}>
            <Text style={styles.reasonLabel}>不合格原因:</Text>
            <Text style={styles.reasonText}>{currentReason || '-'}</Text>
          </View>
        </View>
      </Popup>

      {/* 通用确认弹窗 */}
      <PopCenter
        ref={confirmPopupRef}
        title={confirmPopup.title}
        height={px(130)}
        onConfirm={() => {
          confirmPopupRef.current?.close();
          confirmPopup.onConfirm?.();
        }}
      />

      {/* 如何连接蓝牙（视频） */}
      <Popup
        visible={howToConnectVisible}
        onClose={() => setHowToConnectVisible(false)}
        title="如何连接蓝牙"
        minHeight={px(260)}
      >
        <View style={styles.popupBody}>
          <View
            style={{
              width: '100%',
              height: px(200),
              borderRadius: px(12),
              overflow: 'hidden',
              backgroundColor: '#000',
            }}
          >
            <Video
              source={{
                uri: 'https://g.18qjz.cn/img/boklock/setting/connectBluetooth_720.mp4',
              }}
              style={{ width: '100%', height: '100%' }}
              controls
              resizeMode="contain"
              poster="https://g.18qjz.cn/img/boklock/setting/connectBluetooth_poster.png"
              posterResizeMode="cover"
            />
          </View>
        </View>
      </Popup>
    </PageContainer>
  );
}
