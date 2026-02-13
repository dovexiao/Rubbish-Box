import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Pressable,
  ImageStyle,
} from 'react-native';
import IconFont from '@/iconfont';
import { Toast } from '@ant-design/react-native';
import { operateLock } from '@/services/device';
import { OPT_TYPE } from '@/constants';
import { DeviceSwitch } from '../Device/switch';
import { LockInfoDTO } from '@/pages/index/typing';
import { styles } from './style';
import { groupSubList } from '@/services';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { BUZZER_STATUS, COVER_STATUS, LOCK_ROLE } from '@/constants';
import { Flex, Popup, PopConfirm } from '@/components';
import { showToast, makePhoneCall } from '@/utils';
import MapComponent from '../Map';

interface ContentProps {
  detail?: LockInfoDTO;
  reload?: (id?: number) => Promise<any> | void;
  optioning?: boolean;
  onFresh?: (id?: number) => Promise<any> | void;
  onAnimation?: (params: any) => void;
  children?: React.ReactNode;
  isMultiple?: boolean;
}

const Content: React.FC<ContentProps> = ({
  detail,
  reload,
  optioning,
  onFresh,
  isMultiple = false,
  onAnimation,
  children,
}) => {
  const navigation = useAppNavigation();

  const [operating, setOperating] = useState(false);
  const [groupList, setGroupList] = useState<any[]>([]);
  const [manageMultipleRef, setManageMultipleRef] = useState(false);
  const [deleteMultipleRef, setDeleteMultipleRef] = useState(false);
  const [eleInstallRef, setEleInstallRef] = useState(false);

  useEffect(() => {
    if (detail?.isGroup) {
      const funs = async function getGroupSubList() {
        const res = await groupSubList({
          id: detail?.id,
          pageSize: 30,
          offset: 0,
        });
        setGroupList(res.data?.list || []);
      };
      funs();
    }
  }, [detail]);

  const handleOperate = useCallback(
    async (direction: 'rise' | 'fall') => {
      if (!detail?.id || operating) return;

      setOperating(true);
      const loadingToast = Toast.loading(
        direction === 'fall' ? '降下中...' : '升起中...',
        0,
      );

      try {
        const res = await operateLock({
          id: detail.id,
          optType: direction === 'fall' ? OPT_TYPE.FALL : OPT_TYPE.RISE,
        } as any);

        if (res?.code === 200 || res?.success) {
          Toast.success(
            direction === 'fall' ? '已发送降锁指令' : '已发送升锁指令',
          );
          if (onFresh) {
            await onFresh(detail.id);
          } else if (reload) {
            await reload(detail.id);
          }
        } else {
          Toast.fail(res?.message || res?.msg || '操作失败');
        }
      } catch (e) {
        Toast.fail('操作失败，请稍后重试');
      } finally {
        Toast.remove(loadingToast);
        setOperating(false);
      }
    },
    [detail, onFresh, reload, operating],
  );

  const handleDeviceInfo = () => {
    if (!detail?.id) return;
    if (detail?.isGroup) {
      console.log(11111);
    } else {
      navigation.navigate('DeviceInfo', {
        lockId: detail.id,
        isAdmin: detail?.role === 1,
      });
    }
  };

  const address = detail?.locationList?.[0]?.address || detail?.address || '';
  const markers = useMemo(() => {
    return detail?.locationList?.map(item => {
      return {
        iconPath: 'https://g.18qjz.cn/img/boklock/device_icon.png',
        id: item.lockId,
        latitude: item.latitude,
        longitude: item.longitude,
        width: 36,
        height: 36,
      };
    });
  }, [detail?.locationList]);

  return (
    <View style={styles.contentBox}>
      {/* 上方设备模型/状态图 */}
      <Flex direction="column" align="center">
        {children}
        <DeviceSwitch
          lockInfo={detail}
          reload={reload}
          type={detail?.isGroup ? 2 : 1}
        />
      </Flex>

      <Flex justify="between" style={styles.manualRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.manualBtn}
          disabled={operating}
          onPress={() => handleOperate('rise')}
        >
          {detail?.bluetoothStatus == 0 && (
            <View style={styles.warningIcon}>
              <Image
                source={{
                  uri: 'https://g.18qjz.cn/img/boklock/icon/bluetooth_close.png',
                }}
                style={{ width: 20, height: 20 }}
              ></Image>
            </View>
          )}
          <View style={styles.manualIconCircle}>
            <IconFont name="bluetooth-1" size={24} color="#333333" />
          </View>
          <Text style={styles.manualText}>自动升降</Text>
        </TouchableOpacity>
        {detail?.noBleOpt == true ? null : (
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.manualBtn}
            disabled={operating}
            onPress={() => handleOperate('rise')}
          >
            <View style={styles.manualIconCircle}>
              <IconFont name="rise" size={24} color="#333333" />
            </View>
            <Text style={styles.manualText}>手动升锁</Text>
          </TouchableOpacity>
        )}
        {detail?.noBleOpt == true ? null : (
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.manualBtn}
            disabled={operating}
            onPress={() => handleOperate('fall')}
          >
            <View style={styles.manualIconCircle}>
              <IconFont name="down" size={24} color="#333333" />
            </View>
            <Text style={styles.manualText}>手动降锁</Text>
          </TouchableOpacity>
        )}
        {isMultiple ? (
          detail?.role === 1 && (
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.manualBtn}
              disabled={operating}
              onPress={() => setManageMultipleRef(true)}
            >
              <View style={styles.manualIconCircle}>
                <IconFont
                  name="a-combinationmanagement"
                  size={24}
                  color="#333333"
                />
              </View>
              <Text style={styles.manualText}>组合管理</Text>
            </TouchableOpacity>
          )
        ) : detail?.powerType === 1 && detail.canOpenCover ? (
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.manualBtn}
            disabled={operating}
            onPress={() => handleOperate('fall')}
          >
            <View style={styles.manualIconCircle}>
              <IconFont
                name={
                  detail?.coverStatus === COVER_STATUS.OPEN ? 'unlock' : 'lock'
                }
                size={24}
                color="#333333"
              />
            </View>
            <Text style={styles.manualText}>
              {detail?.coverStatus === COVER_STATUS.OPEN
                ? '关闭锁盖'
                : '打开锁盖'}
            </Text>
          </TouchableOpacity>
        ) : (
          <></>
        )}
      </Flex>

      {/* 地图 + 设备信息卡片 */}
      <Flex justify="between" style={styles.cardsRow}>
        <Flex
          direction="column"
          justify="between"
          align="center"
          style={[
            styles.contentLeftBox,
            // detail?.isGroup ? styles.multipleHeight : styles.singleHeight,
          ]}
        >
          <MapComponent
            style={{ flex: 1 }}
            key={detail?.locationList?.[0]?.lockId}
            address={detail?.locationList?.[0]?.formattedAddress}
            longitude={detail?.locationList?.[0]?.longitude as number}
            latitude={detail?.locationList?.[0]?.latitude as number}
            markers={markers}
            onClick={() => {
              (navigation as any).navigate('DeviceAddress', {
                addressInfo: detail?.locationList,
              });
            }}
          />
        </Flex>

        <Pressable style={[styles.card]} onPress={handleDeviceInfo}>
          <Flex justify="between" align="center" style={styles.cardHeader}>
            <IconFont
              name={
                detail?.isGroup ? 'a-Equipmentlist' : 'a-equipmentinformation'
              }
              size={20}
              color={'#333'}
            />
            <Text style={styles.cardTitle}>
              {detail?.isGroup ? '设备列表' : '设备信息'}
            </Text>
            <IconFont name="a-headfor-20" size={20} color="#333333" />
          </Flex>
          {detail?.isGroup ? (
            <Flex
              style={styles.groupListBox}
              direction="column"
              justify="between"
              align="center"
            >
              {(groupList || [])?.slice(0, 2)?.map(item => (
                <Flex
                  key={item?.id}
                  style={styles.groupItem}
                  direction="row"
                  justify={'between'}
                  align={'center'}
                >
                  <Image
                    source={
                      item?.imageUrl
                        ? { uri: String(item.imageUrl) }
                        : undefined
                    }
                    style={styles.groupItemImage as ImageStyle}
                  />
                  <Text numberOfLines={1} style={styles.groupItemLockName}>
                    {item?.lockName || ''}
                  </Text>
                </Flex>
              ))}
            </Flex>
          ) : (
            <View style={styles.infoList}>
              <View style={styles.infoRow}>
                <IconFont name={'a-Upgradelock'} size={16} color="#ccc" />
                <Text style={styles.infoLabel}>离车升锁</Text>
                <Text style={styles.infoValue}>
                  {detail?.battery ? `${detail?.leaveUpTime}s` : '20s'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <IconFont name={'bell'} size={16} color="#ccc" />
                <Text style={styles.infoLabel}>蜂鸣碰撞</Text>
                <Image
                  style={{ width: 16, height: 16 }}
                  source={{
                    uri: `https://g.18qjz.cn/img/boklock/icon/${
                      detail?.buzzerStatus === 1
                        ? 'buzzing_icon'
                        : 'buzzing_icon_close'
                    }.png`,
                  }}
                />
              </View>
            </View>
          )}
        </Pressable>
      </Flex>

      <View style={styles.entryList}>
        <TouchableOpacity
          style={styles.entryItem}
          onPress={() => {
            if (!detail?.id) return;
            navigation.navigate('DevicesMember', {
              lockId: detail.id,
              type: detail?.isGroup ? 'group' : 'single',
            });
          }}
        >
          <Flex justify="between" align="center">
            <IconFont name="member" size={16} color="#333333" />
            <Text style={styles.entryText}>成员共享</Text>
            <IconFont name="a-headfor-20" size={20} color="#333333" />
          </Flex>
        </TouchableOpacity>
        {detail?.mode == 1 && (
          <TouchableOpacity
            style={styles.entryItem}
            onPress={() => {
              if (!detail?.id) return;
              navigation.navigate('DevicesMember', {
                lockId: detail.id,
                type: detail?.isGroup ? 'group' : 'single',
              });
            }}
          >
            <Flex justify="between" align="center">
              <IconFont name="a-VIPInvitation" size={16} color="#333333" />
              <Text style={styles.entryText}>贵宾邀请</Text>
              <IconFont name="a-headfor-20" size={20} color="#333333" />
            </Flex>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.entryItem}
          onPress={() => {
            if (detail?.customerServicePhone) setEleInstallRef(true);
            else showToast({ title: '敬请期待', icon: 'none' });
          }}
        >
          <Flex justify="between" align="center">
            <IconFont name="a-powersupply" size={16} color="#333333" />
            <Text style={styles.entryText}>市电安装</Text>
            <IconFont name="a-headfor-20" size={20} color="#333333" />
          </Flex>
        </TouchableOpacity>
      </View>
      <Popup
        visible={manageMultipleRef}
        title="管理组合设备"
        onClose={() => setManageMultipleRef(false)}
      >
        <Flex
          style={{ marginTop: 48 }}
          direction="column"
          justify="center"
          align="center"
        >
          <Flex
            isTouchView
            justify="center"
            align="center"
            style={{
              backgroundColor: '#333333',
              ...styles.manageBtn,
            }}
            onPress={() => {
              if (!detail?.id) return;
              setManageMultipleRef(false);
              navigation.navigate('CompositeManage', {
                lockId: detail.id,
              });
            }}
          >
            <Text style={styles.manageBtnText}>编辑</Text>
          </Flex>
          <Flex
            isTouchView
            justify="center"
            align="center"
            onPress={() => setDeleteMultipleRef(true)}
            style={{ ...styles.manageBtn, ...styles.manageDeteleBtn }}
          >
            <Text style={styles.manageDeteleBtnText}>删除</Text>
          </Flex>
        </Flex>
      </Popup>
      <PopConfirm
        visible={eleInstallRef}
        title={`市电联系${detail?.customerServicePhone}进行安装`}
        confirmText="前往拨打"
        cancelText="取消"
        onConfirm={async () => {
          setEleInstallRef(false);
          await makePhoneCall({
            phoneNumber: detail?.customerServicePhone || '',
          });
        }}
      />
    </View>
  );
};

export default Content;
