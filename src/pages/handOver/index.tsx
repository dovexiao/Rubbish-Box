import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { PageContainer, PopConfirm } from '@/components';
import { useRoute } from '@react-navigation/native';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { getAccountInfo, getLockInfo, isCombDevice } from '@/services';
import { styles } from './style';
import { PopConfirmRef } from '@/components/popConfirm';
import { showToast } from '@/utils';

export default function HandOver() {
  const route = useRoute<any>();
  const navigation = useAppNavigation();

  const pages = route.params?.pages as string | undefined;
  const lockId = route.params?.id as string | undefined;
  const adminUserId = route.params?.adminUserId as string | undefined;
  const bleNo = route.params?.bleNo as string | undefined;
  const needPin = route.params?.needPin as number | undefined;
  const powerType = route.params?.powerType as number | undefined;
  const showPopConfirm = pages !== 'setting';

  const popConfirmRef = useRef<PopConfirmRef>(null);
  const [checkReturn, setCheckReturn] = useState<{
    isComp: boolean;
    isShare: boolean;
  }>({
    isComp: false,
    isShare: false,
  });

  const handleNext = useCallback(
    (adminMobile: string, bleName?: string) => {
      if (showPopConfirm) {
        navigation.navigate('HandOverVerify' as any, {
          adminMobile,
          id: lockId,
          bleNo,
          bleName,
          needPin,
          powerType,
        });
      } else {
        navigation.navigate('HandOverDevice' as any, {
          adminMobile,
          adminUserId,
          powerType,
        });
      }
    },
    [adminUserId, bleNo, lockId, navigation, showPopConfirm],
  );

  const getAdminMobile = useCallback(async () => {
    try {
      let res: any;
      if (showPopConfirm) {
        res = await getLockInfo({ id: lockId });
      } else {
        const result = await getAccountInfo({});
        res = {
          ...result,
          data: { ...(result?.data || {}), adminMobile: result?.data?.mobile },
        };
      }

      if (res?.code === 200 && res?.success) {
        const adminMobile = res?.data?.adminMobile;
        if (!adminMobile) {
          showToast({ title: '未获取到管理员手机号', icon: 'info' });
          return;
        }
        handleNext(String(adminMobile), res?.data?.bleName);
      } else {
        showToast({
          title: res?.message || res?.msg || '获取管理员信息失败',
          icon: 'info',
        });
      }
    } catch {
      showToast({ title: '获取管理员信息失败', icon: 'info' });
    }
  }, [handleNext, lockId, showPopConfirm]);

  const handlePressNext = useCallback(async () => {
    if (!showPopConfirm) {
      await getAdminMobile();
      return;
    }

    try {
      const res: any = await isCombDevice({ id: lockId });
      if (res?.code === 200 && res?.success) {
        if (res?.data?.isComp || res?.data?.isShare) {
          setCheckReturn({
            isComp: !!res?.data?.isComp,
            isShare: !!res?.data?.isShare,
          });
          popConfirmRef.current?.open();
        } else {
          await getAdminMobile();
        }
      } else {
        showToast({
          title: res?.message || res?.msg || '校验失败',
          icon: 'info',
        });
      }
    } catch {
      showToast({ title: '校验失败', icon: 'info' });
    }
  }, [getAdminMobile, lockId, showPopConfirm]);

  const confirmTexts = useMemo(() => {
    const lines: string[] = [];
    if (checkReturn.isComp) {
      lines.push(
        `${
          checkReturn.isShare ? '1、' : ''
        }当前设备位于组合设备中，移交成功后，此设备自动从组合设备中移除`,
      );
    }
    if (checkReturn.isShare) {
      lines.push(
        `${
          checkReturn.isComp ? '2、' : ''
        }当前此设备已生成的贵宾码将立即作废，使用贵宾码将无法解锁地锁`,
      );
    }
    return lines;
  }, [checkReturn.isComp, checkReturn.isShare]);

  return (
    <PageContainer
      backgroundColor="#FFFFFF"
      statusBarStyle="dark-content"
      statusBarBackgroundColor="#FFFFFF"
      safeAreaEdges={['top', 'bottom']}
      pageNavProps={{
        text: '移交管理员须知',
        showBack: true,
        background: '#FFFFFF',
      }}
      navBorder
      scrollable={false}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.contentTitle}>移交管理员后，将会：</Text>
          <View style={styles.contentText}>
            <Text style={styles.text}>
              1.解除您对于该地锁的管理员身份，同时成员身份将一并解除；
            </Text>
            <Text style={styles.text}>
              2.您将无法查看移交后地锁升降等信息，移交后新的管理员同样不会看到您之前的历史信息。移交后操作无法恢复，若确认要移交，请点击“下一步”验证您的主人身份。
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.confirmBtn}
          onPress={handlePressNext}
        >
          <Text style={styles.confirmBtnText}>下一步</Text>
        </TouchableOpacity>

        <PopConfirm
          ref={popConfirmRef}
          title="温馨提示"
          showClose={false}
          confirmText="我已知晓,确定移交"
          onConfirm={async () => {
            await getAdminMobile();
            return true;
          }}
        >
          <View>
            {confirmTexts.map((t, idx) => (
              <Text key={String(idx)} style={styles.toastText}>
                {t}
              </Text>
            ))}
          </View>
        </PopConfirm>
      </View>
    </PageContainer>
  );
}
