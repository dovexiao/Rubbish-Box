import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import type { StyleProp, TextStyle } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Button } from '@ant-design/react-native';
import { PageContainer, Popup, Tag } from '@/components';
import Flex from '@/components/Flex';
import {
  getTestDeviceDetail,
  getTestDeviceReason,
  getTestOperateResult,
  modifyTestDevice,
  resetTestDevice,
  testDeviceOperation,
} from '@/services/deviceTest';
import { hideLoading, loopFunc, showLoading, showToast } from '@/utils';
import { getSystemConnectedDevices, isSameMac } from '@/utils';
import styles from './styles';
import IconFont from '@/iconfont';

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

const TEST_OT_STATUS = {
  DOWN: 2,
  BUZZER: 11,
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

  const [reasonPopupVisible, setReasonPopupVisible] = useState(false);
  const [unqualifiedPopupVisible, setUnqualifiedPopupVisible] = useState(false);
  const [confirmPopup, setConfirmPopup] = useState<{
    visible: boolean;
    title: string;
    onConfirm?: () => Promise<void> | void;
  }>({ visible: false, title: '' });

  const unqualifiedPopupRef = useRef<any>(null);

  const fetchDetail = useCallback(async () => {
    if (!deviceNo) return;
    try {
      const res: any = await getTestDeviceDetail({ deviceNo });
      const d: TestDeviceDetail = res?.data ?? res ?? {};
      setDetail(d);
      setTestResult(d.testReason ? (d.testResult as any) : undefined);
    } catch (e) {
      showToast('获取设备详情失败');
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
      const info = await getSystemConnectedDevices();
      const data = (info as any).data || [];
      const connected = data.some((item: any) =>
        isSameMac(item.deviceId, (detail as any).bleNo || detail.lockId),
      );
      const found = data.find((item: any) =>
        isSameMac(item.deviceId, (detail as any).bleNo || detail.lockId),
      );
      setIsLink(!!connected);
      setLinkDevice(found || null);
    } catch (e) {
      console.error('检查蓝牙连接状态失败:', e);
      setIsLink(false);
      setLinkDevice(null);
    }
  }, [detail]);

  useEffect(() => {
    void fetchDetail();
    void fetchReasons();
  }, [fetchDetail, fetchReasons]);

  useEffect(() => {
    if (detail) {
      void checkConnection();
    }
  }, [detail, checkConnection]);

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
        showToast(res?.message || res?.msg || '操作失败');
      }
    } catch (e) {
      showToast('操作失败');
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
        showToast('操作超时');
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
      showToast('操作失败');
    }
  };

  const handleReset = async () => {
    if (!deviceNo) return;
    showLoading({ title: '重测中...' });
    try {
      const res: any = await resetTestDevice({ deviceNo });
      if (res === true || Number(res?.code) === 200) {
        await fetchDetail();
        showToast('重测已发起');
      } else {
        showLoading(res?.message || res?.msg || '重测失败');
      }
    } catch (e) {
      showToast('重测失败');
    } finally {
      hideLoading();
    }
  };

  const renderStatusText = (label: string, status: number) => {
    let text = '未测试';
    let style: StyleProp<TextStyle> = styles.statusText;
    if (status === 1) {
      text = '正常';
      style = [styles.statusText, styles.statusNormal];
    } else if (status === 2) {
      text = '故障';
      style = [styles.statusText, styles.statusFail];
    }
    return (
      <Text style={style}>
        {label}：{text}
      </Text>
    );
  };

  // const handleChange = async (val: number) => {
  //   const params = {
  //     lockId: detail?.lockId,
  //     mode: val,
  //   };

  //   // 如果切换到性能优先（val === 1）且已连接蓝牙，使用蓝牙切换方式
  //   if (
  //     val === 1 &&
  //     isLink &&
  //     linkDevice &&
  //     Object.keys(linkDevice).length > 0
  //   ) {
  //     showLoading({ title: '切换模式中...' });
  //     try {
  //       // 1. 通过蓝牙发送切换指令
  //       const cmdRes = await sendModeCommandByBluetooth({
  //         deviceId: linkDevice?.deviceId,
  //         mode: val,
  //       });

  //       if (!cmdRes?.success) {
  //         hideLoading();
  //         showToast(cmdRes?.msg || '蓝牙模式切换失败，请重试');
  //         return;
  //       }

  //       // 2. 等待设备响应
  //       await sleep(5000);

  //       // 3. 调用后端接口同步状态
  //       const apiRes: any = await testModeSwitch(
  //         {
  //           lockId: detail?.lockId,
  //           mode: val,
  //         },
  //         'info',
  //       );

  //       if (!apiRes || apiRes.code !== '200') {
  //         hideLoading();
  //         showToast(apiRes?.message || '模式切换失败，请稍后重试');
  //         return;
  //       }

  //       // 4. 刷新详情
  //       await fetchDetail();
  //       hideLoading();
  //       showToast('模式切换成功');
  //       return;
  //     } catch (error) {
  //       hideLoading();
  //       showToast('模式切换异常，请稍后重试');
  //       return;
  //     }
  //   }

  //   // 如果切换到性能优先但未连接蓝牙，提示用户
  //   if (val === 1 && !isLink) {
  //     showToast({
  //       title: '请先连接蓝牙',
  //       icon: 'none',
  //     });
  //     return;
  //   }

  //   // 其他情况（切换到续航优先或未连接蓝牙时），使用 API 轮询方式
  //   if (val === 2) {
  //     try {
  //       showLoading({ title: '切换模式中...' });

  //       // 1. 调用切换模式接口
  //       const res: any = await testModeSwitch(params, 'info');
  //       if (!res || res.code !== '200') {
  //         hideLoading();
  //         showToast({
  //           title: res?.message || '模式切换失败，请稍后重试',
  //           icon: 'none',
  //         });
  //         return;
  //       }

  //       // 2. 轮询切换结果
  //       let timer: any = null;
  //       const { start, stop } = loopFunc(async () => {
  //         try {
  //           const pollRes: any = await testModeSwitchResult(params);

  //           if (pollRes && pollRes.code === '200' && pollRes.data) {
  //             await getDetail();
  //             hideLoading();
  //             stop();
  //             showToast({
  //               title: '模式切换成功',
  //               icon: 'success',
  //             });
  //             if (timer) {
  //               clearTimeout(timer);
  //               timer = null;
  //             }
  //             return false;
  //           }
  //         } catch (e) {
  //           console.error('testModeSwitchResult error', e);
  //         }

  //         // 继续轮询
  //         return true;
  //       }, 1000);

  //       // 超时兜底（10s）
  //       timer = setTimeout(() => {
  //         stop();
  //         hideLoading();
  //         showToast({
  //           title: '模式切换超时，请稍后重试',
  //           icon: 'none',
  //         });
  //       }, 10000);

  //       start();
  //     } catch (error) {
  //       hideLoading();
  //       showToast({
  //         title: '模式切换异常，请稍后重试',
  //         icon: 'none',
  //       });
  //     }
  //   }
  // };

  const handleChange = (val: number) => {
    if (!detail) return;
  };
  const renderFooterButtons = () => {
    if (!detail) return null;
    if (detail.testResult === TEST_RESULT.QUALIFIED) {
      return null;
    }
    if (detail.testResult === TEST_RESULT.NORMAL) {
      return (
        <View style={styles.footerButtons}>
          <Flex justify="between">
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.card, { backgroundColor: 'transparent' }]}
              onPress={() => {
                setCurrentReason('');
                setConfirmPopup({
                  visible: true,
                  title: '确定本次测试结果为不合格吗？',
                  onConfirm: async () => {
                    if (!currentReason) {
                      showToast('请输入不合格原因');
                      return;
                    }
                    await updateTestResult({
                      testResult: TEST_RESULT.FAIL,
                      testReason: currentReason,
                    } as any);
                  },
                });
              }}
            >
              <Text style={[styles.statusText, styles.statusFail]}>
                测试不合格
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.card, { backgroundColor: '#333333' }]}
              onPress={() => {
                setConfirmPopup({
                  visible: true,
                  title: '确定本次测试结果为合格吗？',
                  onConfirm: async () => {
                    await updateTestResult({
                      testResult: TEST_RESULT.QUALIFIED,
                    } as any);
                  },
                });
              }}
            >
              <Text
                style={{ color: '#FFFFFF', fontSize: 14, textAlign: 'center' }}
              >
                测试合格
              </Text>
            </TouchableOpacity>
          </Flex>
          {reasonList.length > 0 && (
            <Text
              style={styles.historyLink}
              onPress={() => setReasonPopupVisible(true)}
            >
              历史不合格原因》
            </Text>
          )}
        </View>
      );
    }

    // 已不合格时：展示查看原因 + 再次测试
    return (
      <View style={styles.footerButtons}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            setCurrentReason(detail.testReason);
            setUnqualifiedPopupVisible(true);
          }}
        >
          <Text style={[styles.statusText, styles.statusFail]}>
            测试不合格，查看原因
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.card, { backgroundColor: '#333333', marginTop: 12 }]}
          onPress={handleReset}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 14, textAlign: 'center' }}>
            再次测试
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

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
    >
      {detail && (
        <Flex direction={'column'} align={'center'}>
          <Flex style={styles.lockContentWrapper} justify={'center'}>
            <Image
              style={{ width: 120, height: 120 }}
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

          <Flex
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
          </Flex>

          <Flex style={styles.deviceInfoWrapper} direction={'column'}>
            <Flex style={styles.deviceInfoHeader}>
              <Text style={styles.title}>模式切换</Text>
              <Tag
                style={{
                  backgroundColor: '#70B601',
                  marginLeft: 18,
                  marginRight: 34,
                }}
                textStyle={{ color: '#ffffff' }}
              >
                {detail?.['model'] === 1 ? '性能优先' : '续航优先'}
              </Tag>

              <Button
                style={{ height: 24 }}
                type={'primary'}
                onPress={() => handleChange(detail?.['model'] === 1 ? 2 : 1)}
              >
                {detail?.['model'] === 1 ? '切换到续航优先' : '切换到性能优先'}
              </Button>
            </Flex>
            <Flex
              style={{
                flex: 1,
              }}
              justify={'center'}
            >
              {detail.modeSwitchTestStatus === 0 && (
                <Flex>
                  <Flex
                    onPress={async () => {
                      await updateTestResult({
                        modeSwitchTestStatus: 1,
                      });
                    }}
                  >
                    <View style={styles.radioWrapper}>
                      <Image
                        style={{
                          width: 20,
                          height: 20,
                        }}
                        source={{
                          uri: 'https://g.18qjz.cn/img/boklock/radio_default.png',
                        }}
                      />
                    </View>
                    <Text
                      style={{
                        marginLeft: 8,
                        color: '#70B601',
                      }}
                    >
                      正常
                    </Text>
                  </Flex>
                  <Flex
                    style={{
                      marginLeft: 48,
                    }}
                    onPress={async () => {
                      await updateTestResult({
                        modeSwitchTestStatus: 2,
                      });
                    }}
                  >
                    <View style={styles.radioWrapper}>
                      <Image
                        style={{
                          width: 20,
                          height: 20,
                        }}
                        source={{
                          uri: 'https://g.18qjz.cn/img/boklock/radio_default.png',
                        }}
                      />
                    </View>
                    <Text
                      style={{
                        marginLeft: 8,
                        color: '#E86B6E',
                      }}
                    >
                      故障
                    </Text>
                  </Flex>
                </Flex>
              )}
              {detail.modeSwitchTestStatus !== 0 && (
                <Text
                  style={{
                    color:
                      detail.modeSwitchTestStatus === 1 ? '#70B601' : '#E86B6E',
                  }}
                >
                  测试{detail.modeSwitchTestStatus === 1 ? '正常' : '故障'}
                </Text>
              )}
            </Flex>
          </Flex>
          {/* 蓝牙相关隐藏 */}

          <Flex style={styles.deviceInfoWrapper} direction={'column'}>
            <Flex style={styles.deviceInfoHeader}>
              <Text style={styles.title}>4G升降测试</Text>
              <Tag
                style={{
                  backgroundColor: '#70B601',
                  marginLeft: 18,
                  marginRight: 34,
                }}
                textStyle={{ color: '#ffffff' }}
              >
                {detail.fourGLiftStatus === 2 ? '已降下' : '已升起'}
              </Tag>

              <Button
                style={{ width: 105, height: 24 }}
                type={'primary'}
                // round={true}
                onPress={() => {
                  // if (detail?.['model'] === 2) {
                  //   return modeSwitchPopupRef.current?.open();
                  // }
                  // if (detail.fourGLiftStatus === 0) {
                  //   downFourGLiftPopConfirmRef.current?.open();
                  // } else {
                  //   fourGLiftPopConfirmRef.current?.open();
                  // }
                }}
              >
                {detail.fourGLiftStatus === 2 ? '升起地锁' : '降下地锁'}
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
                    onPress={async () => {
                      await updateTestResult({
                        fourGLiftTestStatus: 1,
                      });
                    }}
                  >
                    <View style={styles.radioWrapper}>
                      <Image
                        style={{
                          width: 20,
                          height: 20,
                        }}
                        source={{
                          uri: 'https://g.18qjz.cn/img/boklock/radio_default.png',
                        }}
                      />
                    </View>
                    <Text
                      style={{
                        marginLeft: 8,
                        color: '#70B601',
                      }}
                    >
                      正常
                    </Text>
                  </Flex>
                  <Flex
                    style={{
                      marginLeft: 48,
                    }}
                    onPress={async () => {
                      await updateTestResult({
                        fourGLiftTestStatus: 2,
                      });
                    }}
                  >
                    <View style={styles.radioWrapper}>
                      <Image
                        style={{
                          width: 20,
                          height: 20,
                        }}
                        source={{
                          uri: 'https://g.18qjz.cn/img/boklock/radio_default.png',
                        }}
                      />
                    </View>
                    <Text
                      style={{
                        marginLeft: 8,
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
                      detail.fourGLiftTestStatus === 1 ? '#70B601' : '#E86B6E',
                  }}
                >
                  测试{detail.fourGLiftTestStatus === 1 ? '正常' : '故障'}
                </Text>
              )}
            </Flex>
          </Flex>
          <Flex style={styles.deviceInfoWrapper} direction={'column'}>
            <Flex style={(styles.deviceInfoHeader, { marginBottom: 0 })}>
              <Text style={styles.title}>蓝牙近身升降测试</Text>

              <Flex
                style={{
                  marginLeft: 24,
                }}
              >
                <Text>{isLink ? '已开启' : '未开启'}</Text>
                <IconFont name={'a-headfor-12'} size={36} color={'#333333'} />
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
                    onPress={async () => {
                      await updateTestResult({
                        bluetoothProximityStatus: 1,
                      });
                    }}
                  >
                    <View style={styles.radioWrapper}>
                      <Image
                        style={{
                          width: 20,
                          height: 20,
                        }}
                        source={{
                          uri: 'https://g.18qjz.cn/img/boklock/radio_default.png',
                        }}
                      />
                    </View>
                    <Text
                      style={{
                        marginLeft: 8,
                        color: '#70B601',
                      }}
                    >
                      正常
                    </Text>
                  </Flex>
                  <Flex
                    style={{
                      marginLeft: 48,
                    }}
                    onPress={async () => {
                      await updateTestResult({
                        bluetoothProximityStatus: 2,
                      });
                    }}
                  >
                    <View style={styles.radioWrapper}>
                      <Image
                        style={{
                          width: 20,
                          height: 20,
                        }}
                        source={{
                          uri: 'https://g.18qjz.cn/img/boklock/radio_default.png',
                        }}
                      />
                    </View>
                    <Text
                      style={{
                        marginLeft: 8,
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
                  测试{detail.bluetoothProximityStatus === 1 ? '正常' : '故障'}
                </Text>
              )}
            </Flex>
          </Flex>

          <Flex style={styles.deviceInfoWrapper} direction={'column'}>
            <Flex style={styles.deviceInfoHeader}>
              <Text style={styles.title}>蜂鸣测试</Text>
              <Button
                style={{
                  width: 105,
                  height: 24,
                  marginLeft: 24,
                }}
                // round={true}
                type={'primary'}
                onPress={() => {
                  // if (detail?.['model'] === 2) {
                  //   return modeSwitchPopupRef.current?.open();
                  // }
                  // buzzerPopConfirmRef.current?.open();
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
                    onPress={async () => {
                      await updateTestResult({
                        buzzerTestStatus: 1,
                      });
                    }}
                  >
                    <View style={styles.radioWrapper}>
                      <Image
                        style={{
                          width: 20,
                          height: 20,
                        }}
                        source={{
                          uri: 'https://g.18qjz.cn/img/boklock/radio_default.png',
                        }}
                      />
                    </View>
                    <Text
                      style={{
                        marginLeft: 8,
                        color: '#70B601',
                      }}
                    >
                      正常
                    </Text>
                  </Flex>
                  <Flex
                    style={{
                      marginLeft: 48,
                    }}
                    onPress={async () => {
                      await updateTestResult({
                        buzzerTestStatus: 2,
                      });
                    }}
                  >
                    <View style={styles.radioWrapper}>
                      <Image
                        style={{
                          width: 20,
                          height: 20,
                        }}
                        source={{
                          uri: 'https://g.18qjz.cn/img/boklock/radio_default.png',
                        }}
                      />
                    </View>
                    <Text
                      style={{
                        marginLeft: 8,
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

          {detail.canOpenCover && (
            <Flex style={styles.deviceInfoWrapper} direction={'column'}>
              <Flex style={styles.deviceInfoHeader}>
                <Text style={styles.title}>机盖解锁测试</Text>
                <Button
                  style={{
                    width: 105,
                    height: 24,
                    marginLeft: 24,
                  }}
                  // round={true}
                  type={'primary'}
                  onPress={() => {
                    // if (detail?.['model'] === 2) {
                    //   return modeSwitchPopupRef.current?.open();
                    // }
                    // coverPopConfirmRef.current?.open();
                  }}
                >
                  {detail.coverStatus === 1 ? '关闭机盖' : '打开机盖'}
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
                      onPress={async () => {
                        await updateTestResult({
                          coverTestStatus: 1,
                        });
                      }}
                    >
                      <View style={styles.radioWrapper}>
                        <Image
                          style={{
                            width: 20,
                            height: 20,
                          }}
                          source={{
                            uri: 'https://g.18qjz.cn/img/boklock/radio_default.png',
                          }}
                        />
                      </View>
                      <Text
                        style={{
                          marginLeft: 8,
                          color: '#70B601',
                        }}
                      >
                        正常
                      </Text>
                    </Flex>
                    <Flex
                      style={{
                        marginLeft: 48,
                      }}
                      onPress={async () => {
                        await updateTestResult({
                          coverTestStatus: 2,
                        });
                      }}
                    >
                      <View style={styles.radioWrapper}>
                        <Image
                          style={{
                            width: 20,
                            height: 20,
                          }}
                          source={{
                            uri: 'https://g.18qjz.cn/img/boklock/radio_default.png',
                          }}
                        />
                      </View>
                      <Text
                        style={{
                          marginLeft: 8,
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
          <Flex style={styles.deviceInfoWrapper} direction={'column'}>
            <Flex style={styles.deviceInfoHeader}>
              <Text style={styles.title}>离车升锁测试</Text>
            </Flex>
            <Flex
              style={{
                flex: 1,
              }}
              justify={'center'}
            >
              {detail.leaveTestStatus === 0 && (
                <Flex>
                  <Flex
                    onPress={async () => {
                      await updateTestResult({
                        leaveTestStatus: 1,
                      });
                    }}
                  >
                    <View style={styles.radioWrapper}>
                      <Image
                        style={{
                          width: 20,
                          height: 20,
                        }}
                        source={{
                          uri: 'https://g.18qjz.cn/img/boklock/radio_default.png',
                        }}
                      />
                    </View>
                    <Text
                      style={{
                        marginLeft: 8,
                        color: '#70B601',
                      }}
                    >
                      正常
                    </Text>
                  </Flex>
                  <Flex
                    style={{
                      marginLeft: 48,
                    }}
                    onPress={async () => {
                      await updateTestResult({
                        leaveTestStatus: 2,
                      });
                    }}
                  >
                    <View style={styles.radioWrapper}>
                      <Image
                        style={{
                          width: 20,
                          height: 20,
                        }}
                        source={{
                          uri: 'https://g.18qjz.cn/img/boklock/radio_default.png',
                        }}
                      />
                    </View>
                    <Text
                      style={{
                        marginLeft: 8,
                        color: '#E86B6E',
                      }}
                    >
                      故障
                    </Text>
                  </Flex>
                </Flex>
              )}
              {detail.leaveTestStatus !== 0 && (
                <Text
                  style={{
                    color:
                      detail.leaveTestStatus === ABOVE_STATUS.OPEN
                        ? '#70B601'
                        : '#E86B6E',
                  }}
                >
                  测试
                  {detail.leaveTestStatus === ABOVE_STATUS.OPEN
                    ? '正常'
                    : '故障'}
                </Text>
              )}
            </Flex>
          </Flex>
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
      <Popup
        visible={confirmPopup.visible}
        onClose={() => setConfirmPopup({ ...confirmPopup, visible: false })}
        title={confirmPopup.title}
        footer={
          <View style={{ flexDirection: 'row', marginBottom: 8 }}>
            <TouchableOpacity
              style={[
                styles.popupBtn,
                {
                  backgroundColor: 'transparent',
                  borderWidth: 1,
                  borderColor: '#DDD',
                },
              ]}
              onPress={() =>
                setConfirmPopup({ ...confirmPopup, visible: false })
              }
            >
              <Text style={[styles.popupBtnText, { color: '#333' }]}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.popupBtn, { flex: 1 }]}
              onPress={async () => {
                try {
                  await confirmPopup.onConfirm?.();
                } finally {
                  setConfirmPopup({ ...confirmPopup, visible: false });
                }
              }}
            >
              <Text style={styles.popupBtnText}>确定</Text>
            </TouchableOpacity>
          </View>
        }
      >
        <View />
      </Popup>
    </PageContainer>
  );
}
