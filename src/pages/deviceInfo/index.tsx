import { Flex, PageContainer } from '@/components';
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { styles } from './style';
import IconFont from '@/iconfont';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRoute } from '@react-navigation/native';
import { getInfo, updateName } from '@/services';
import { lockInfoProps } from './typing';
import AnimationPop, { AnimationPopRef } from '@/components/AnimationPop';
import { Toast } from '@ant-design/react-native';
import { PageContainerRef } from '@/components/PageContainer';
import Popup from '@/components/Popup';
import PopCenter, { PopCenterRef } from '@/components/PopCenter';

const footerBtn = () => {
  return (
    <View style={styles.footerBtnContainer}>
      <TouchableOpacity
        style={[styles.footerBtn, styles.cancelBtn]}
        onPress={() => {
          console.log('移交');
        }}
      >
        <Text style={[styles.footerBtnText, styles.cancelBtnText]}>
          移交管理员
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.footerBtn, styles.confirmBtn]}
        onPress={() => {
          console.log('移交');
        }}
      >
        <Text style={[styles.footerBtnText, styles.confirmBtnText]}>
          解除绑定
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const DeviceInfo = () => {
  const { params } = useRoute() as {
    params: { lockId: number; isAdmin: boolean };
  };

  const [lockInfo, setLockInfo] = useState<lockInfoProps>();
  const [lockName, setLockName] = useState<string>();
  const [showPowerModeTips, setShowPowerModeTips] = useState(false);

  const editNamePopRef = useRef<AnimationPopRef>(null);
  const pageContainerRef = useRef<PageContainerRef>(null);
  const qrCodePopRef = useRef<PopCenterRef>(null);

  const getLockInfo = useCallback(async () => {
    if (!params.lockId) return;
    const res = await getInfo({
      id: params?.lockId,
    });
    if (res.code === 200 && res.success) {
      setLockInfo(res.data);
      setLockName(res.data.lockName);
    }
  }, [params]);

  const handleNameConfirm = async () => {
    if (!lockName?.trim()) {
      Toast.info('请输入名称');
      return;
    }
    const loadingToast = Toast.loading('修改中...', 0);

    try {
      const res = await updateName({
        id: params?.lockId,
        lockName: lockName,
      });

      if (res?.success) {
        Toast.remove(loadingToast);
        Toast.success('修改成功');
        editNamePopRef.current?.close();
        // 刷新数据
        pageContainerRef.current?.refresh();
      } else {
        Toast.remove(loadingToast);
        Toast.fail(res?.message || '修改失败');
      }
    } catch (error) {
      Toast.remove(loadingToast);
      Toast.fail('修改异常');
    }
  };

  useEffect(() => {
    getLockInfo();
  }, [getLockInfo]);

  return (
    <PageContainer
      ref={pageContainerRef}
      onRefresh={getLockInfo}
      backgroundColor="#FFFFFF"
      statusBarStyle="dark-content"
      safeAreaEdges={['top', 'bottom']}
      pageNavProps={{
        text: '设备信息',
        showBack: true,
      }}
      navBorder={true}
      scrollable
      loading={!lockInfo}
      padding={0}
      footer={footerBtn()}
    >
      <Flex style={styles.container} direction="column">
        <Flex direction="row" align="center">
          <View style={styles.cardTitleLine} />
          <Text style={styles.cardTitle}>基础信息</Text>
        </Flex>
        <Flex
          isTouchView
          style={styles.cardRows}
          onPress={() => {
            if (!params.isAdmin) return;
            editNamePopRef.current?.open();
          }}
        >
          <Text style={styles.cardLable}>设备名称</Text>
          <Text style={styles.cardValue}>{lockInfo?.lockName ?? ''}</Text>
          {params.isAdmin && (
            <IconFont name={'a-headfor-20'} color="#333" size={20} />
          )}
        </Flex>
        <Flex style={styles.cardRows}>
          <Text style={styles.cardLable}>地锁SN码</Text>
          <Text style={styles.cardValue}>{lockInfo?.deviceNo ?? ''}</Text>
        </Flex>
        <Flex style={[styles.cardRows, { position: 'relative' }]}>
          <Text style={styles.cardLable}>供电模式</Text>
          <Text style={[styles.cardValue, { marginRight: 4 }]}>
            {lockInfo?.powerType === 1 ? '市电版' : '电池版'}
          </Text>
          <IconFont
            onPressIn={() => {
              setShowPowerModeTips(true);
            }}
            onPressOut={() => {
              setShowPowerModeTips(false);
            }}
            name={'a-styledescription'}
            color="#333"
            size={20}
          />
          {showPowerModeTips && (
            <View style={styles.powerModeTooltip}>
              {lockInfo?.powerType === 1 && (
                <Text style={styles.powerModeTooltipText}>
                  市电款：需连接家用电源，电力持续稳定
                </Text>
              )}
              {lockInfo?.powerType === 0 && (
                <Text style={styles.powerModeTooltipText}>
                  电池款：内置电池，无需布线，安装位置灵活
                </Text>
              )}
            </View>
          )}
        </Flex>
        <Flex style={styles.cardRows}>
          <Text style={styles.cardLable}>二维码</Text>
          <Flex direction="row" align="center">
            <TouchableOpacity
              style={styles.qrCodeBtn}
              onPress={() => qrCodePopRef.current?.open()}
            >
              <Text style={styles.qrCodeBtnText}>查看</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.qrCodeBtn, { marginLeft: 12 }]}
              onPress={() => {}}
            >
              <Text style={styles.qrCodeBtnText}>更换二维码</Text>
              <IconFont name={'a-headfor-20'} color="#333" size={20} />
            </TouchableOpacity>
          </Flex>
        </Flex>
        <Flex style={styles.cardRows}>
          <Text style={styles.cardLable}>固件版本</Text>
          <Text style={styles.cardValue}>
            当前版本{lockInfo?.version ?? ''}
          </Text>
          <IconFont name={'a-headfor-20'} color="#333" size={20} />
        </Flex>
        <Flex style={styles.cardRows}>
          <Text style={styles.cardLable}>设备日志</Text>
          <Text style={styles.cardValue}>{'查看'}</Text>
          <IconFont name={'a-headfor-20'} color="#333" size={20} />
        </Flex>
        <Flex style={styles.cardLine} />
        <Flex direction="row" align="center">
          <View style={styles.cardTitleLine} />
          <Text style={styles.cardTitle}>功能设置</Text>
        </Flex>
        <Flex style={styles.cardRows}>
          <Text style={styles.cardLable}>充电指导</Text>
          <Text style={styles.cardValue}>{'查看'}</Text>
          <IconFont name={'a-headfor-20'} color="#333" size={20} />
        </Flex>
        <Flex
          style={
            (styles.cardRows,
            lockInfo?.powerType === 1 ? {} : { alignItems: 'flex-start' })
          }
        >
          {lockInfo?.powerType === 1 ? (
            <>
              <Text style={styles.cardLable}>碰撞蜂鸣</Text>
              <Text style={styles.cardValue}>
                {lockInfo?.buzzerStatus === 1 ? '已开启' : '未开启'}
              </Text>
              <IconFont name={'a-headfor-20'} color="#333" size={20} />
            </>
          ) : (
            <>
              <Text style={styles.cardLable}>碰撞蜂鸣</Text>
              <View
                style={[
                  styles.cardValue,
                  {
                    alignSelf: 'flex-end',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                  },
                ]}
              >
                <Flex direction="row" align="center">
                  <Text style={styles.cardValue}>蜂鸣测试</Text>
                  <TouchableOpacity style={styles.testBtn} onPress={() => {}}>
                    <Text style={styles.testBtnText}>测试</Text>
                  </TouchableOpacity>
                </Flex>
                <Text
                  style={styles.toastText}
                >{`触发碰撞蜂鸣秒后停止蜂鸣`}</Text>
              </View>
            </>
          )}
        </Flex>

        <Flex style={styles.cardRows}>
          <Text style={styles.cardLable}>离车升锁</Text>
          <Text
            style={styles.cardValue}
          >{`车辆离开${lockInfo?.leaveUpTime}秒后升起`}</Text>
          {lockInfo?.powerType === 1 && (
            <IconFont name={'a-headfor-20'} color="#333" size={20} />
          )}
        </Flex>
      </Flex>

      {/* 编辑地锁名称弹窗 */}
      <AnimationPop ref={editNamePopRef} direction="bottom" coverSafeArea>
        <View style={[styles.editContainer, { paddingBottom: 8 }]}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>编辑地锁名称</Text>
          </View>

          <View style={styles.editContent}>
            <View style={styles.editItem}>
              <Text style={styles.editLabel}>{'地锁名称'}</Text>
              <TextInput
                style={styles.input}
                value={lockName}
                onChangeText={setLockName}
                placeholder="请输入名称"
                placeholderTextColor="#999"
                maxLength={20}
              />
              <IconFont name={'redact'} color="#999" size={20} />
            </View>
          </View>
          <View style={styles.editFooter}>
            <TouchableOpacity
              style={[styles.editBtn, styles.cancelPopBtn]}
              onPress={() => editNamePopRef.current?.close()}
            >
              <Text style={styles.cancelText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.editBtn, styles.confirmPopBtn]}
              onPress={handleNameConfirm}
            >
              <Text style={styles.confirmText}>确定</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.closeIcon}>
            <TouchableOpacity onPress={() => editNamePopRef.current?.close()}>
              <IconFont name={'close'} color="#333" size={24} />
            </TouchableOpacity>
          </View>
        </View>
      </AnimationPop>

      {/* 查看二维码弹框 */}
      <PopCenter
        height={226}
        ref={qrCodePopRef}
        showHeader={false}
        showCancel={false}
        confirmText="关闭"
      >
        <View style={styles.qrCodeContainer}>
          {lockInfo?.qrCode ? (
            <Image
              source={{ uri: lockInfo.qrCode }}
              style={{ width: 160, height: 160 }}
              resizeMode="contain"
            />
          ) : (
            <Text style={{ color: '#999999' }}>暂无二维码</Text>
          )}
        </View>
      </PopCenter>
    </PageContainer>
  );
};

export default DeviceInfo;
