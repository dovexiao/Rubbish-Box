import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import PageContainer from '@/components/PageContainer';
import PopConfirm, { type PopConfirmRef } from '@/components/popConfirm';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { cacheGetSync, showToast } from '@/utils';
import { getLockInfo, isCombDevice } from '@/services';
import { styles } from './style';

export default function UnbindNotice() {
  const { params } = useRoute<any>() as { params: { id: number } };
  const navigation = useAppNavigation();

  const popConfirmRef = useRef<PopConfirmRef>(null);
  const [lockId, setLockId] = useState<string | number | undefined>(params?.id);
  const [checkReturn, setCheckReturn] = useState<{
    isComp: boolean;
    isShare: boolean;
  }>({ isComp: false, isShare: false });

  const loadLockIdFromCache = useCallback(async () => {
    if (lockId !== undefined && lockId !== null && String(lockId) !== '')
      return;
    const info: any = await cacheGetSync('deviceInfo').catch(() => null);
    if (info?.id !== undefined && info?.id !== null) {
      setLockId(info.id);
    }
  }, [lockId]);

  useEffect(() => {
    void loadLockIdFromCache();
  }, [loadLockIdFromCache]);

  const handleNext = useCallback(async () => {
    if (!lockId) {
      showToast({ title: '未找到设备信息', icon: 'none' });
      return;
    }
    const res: any = await getLockInfo({ id: lockId });
    if (res?.code === 200 && res?.success) {
      const adminMobile = res?.data?.adminMobile;
      const bleNo = res?.data?.bleNo;
      const id = res?.data?.id;
      const bleName = res?.data?.bleName;
      navigation.navigate('UnbindDevice' as any, {
        phoneNumber: adminMobile,
        bleNo,
        id,
        bleName,
      });
      return;
    }
    showToast({
      title: res?.message || res?.msg || '获取设备信息失败',
      icon: 'none',
    });
  }, [lockId, navigation]);

  const handlePressNext = useCallback(async () => {
    if (!lockId) {
      showToast({ title: '未找到设备信息', icon: 'none' });
      return;
    }
    try {
      const res: any = await isCombDevice({ id: lockId });
      if (res?.code === 200 && res?.success) {
        const nextCheck = {
          isComp: !!res?.data?.isComb,
          isShare: !!res?.data?.isShare,
        };
        setCheckReturn(nextCheck);
        if (nextCheck.isShare) {
          popConfirmRef.current?.open();
        } else {
          await handleNext();
        }
        return;
      }
      showToast({
        title: res?.message || res?.msg || '校验失败',
        icon: 'none',
      });
    } catch {
      showToast({ title: '校验失败', icon: 'none' });
    }
  }, [handleNext, lockId]);

  const popContent = useMemo(() => {
    if (!checkReturn.isShare) return null;
    return (
      <>
        <Text style={styles.toastTitle}>解除绑定后</Text>
        <Text style={styles.toastText}>
          当前此设备已生成的贵宾码将立即作废，使用贵宾码将无法解锁地锁
        </Text>
      </>
    );
  }, [checkReturn.isShare]);

  return (
    <PageContainer
      backgroundColor="#FFFFFF"
      statusBarStyle="dark-content"
      safeAreaEdges={['top', 'bottom']}
      pageNavProps={{
        text: '解除绑定须知',
        showBack: true,
      }}
      scrollable={false}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.contentTitle}>地锁解除绑定后，将会：</Text>
          <View style={styles.contentText}>
            <Text style={styles.text}>
              1.解除您对于该地锁的管理员身份，若同时成员权限使用此地锁，将会一同解除；
            </Text>
            <Text style={styles.text}>
              2.您将无法查看未绑定期间的地锁升降等信息，若其他用户在您解绑后绑定此地锁，同样不会看到末绑定期间以及您之前的历史信息。解绑操作无法恢复，若确认要解绑地锁，请点击“下一步”验证您的主人身份。
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            void handlePressNext();
          }}
          style={styles.confirmBtn}
        >
          <Text style={styles.confirmBtnText}>下一步</Text>
        </TouchableOpacity>

        <PopConfirm
          title="温馨提示"
          ref={popConfirmRef}
          showClose={false}
          confirmText="我已知晓,确定解绑"
          onConfirm={async () => handleNext()}
          btnWrapStyle={styles.popBtnWrap}
        >
          {popContent}
        </PopConfirm>
      </View>
    </PageContainer>
  );
}
