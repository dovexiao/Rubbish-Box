import { showToast, eventCenter } from '@/utils';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Image, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import {
  PageContainer,
  TextInput,
  Flex,
  GradientButton,
  Popup,
  PopConfirm,
} from '@/components/index';
import AppIcon from '@/components/AppIcon';
import { cacheGet } from '@/utils/cache';
import { updateName } from '@/services/deviceInfo';
import {
  checkUserLockFeeAddOrRemove,
  addUserLockFee,
  getUserLockFeeAddableList,
  getUserLockFeeList,
  getUserLockFeeRemovableList,
  removeUserLockFee,
} from '@/services/device';
import { getFeeTemplateList } from '@/services/mall';
import { DeviceItem } from '@/components/Device/Item/index';
import styles from './styles';
import { showLoading, hideLoading } from '@/utils/index';
import { fontSize, px } from '@/utils/ui';
import MyEmpty from '@/components/MyEmpty/index';

type FeeDeviceItem = {
  id: string | number;
  lockId: string | number;
  deviceId?: number;
  deviceNo?: string;
  lockName?: string;
  role?: number;
  roleName?: string;
  count?: number;
  imageUrl?: string;
  [key: string]: any;
};

export default function MyDevice() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const fromRcvPayment = route.params?.fromRcvPayment ? true : false;
  const isOpen = route.params?.isOpen;
  const [lockName, setLockName] = useState('');
  const [freeDeviceList, setFreeDeviceList] = useState<FeeDeviceItem[]>([]);
  const [feeDeviceList, setFeeDeviceList] = useState<FeeDeviceItem[]>([]);
  const [addableFeeDeviceList, setAddableFeeDeviceList] = useState<
    FeeDeviceItem[]
  >([]);
  const [removableFeeDeviceList, setRemovableFeeDeviceList] = useState<
    FeeDeviceItem[]
  >([]);
  const [currentDevice, setCurrentDevice] = useState<any>(undefined);
  const [editNamePopVisible, setEditNamePopVisible] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [removeChargePopVisible, setRemoveChargePopVisible] = useState(false);
  const [addChargePopVisible, setAddChargePopVisible] = useState(false);
  const [chooseRulePopVisible, setChooseRulePopVisible] = useState(false);
  const [selectedRemoveIds, setSelectedRemoveIds] = useState<
    Array<string | number>
  >([]);
  const [selectedAddIds, setSelectedAddIds] = useState<Array<string | number>>(
    [],
  );
  const [selectedRuleId, setSelectedRuleId] = useState<string | number | null>(
    null,
  );
  const [chargeRuleList, setChargeRuleList] = useState<any[]>([]);
  const [msgPopupVisible, setMsgPopupVisible] = useState(false);
  const [msgPopupText, setMsgPopupText] = useState('');
  const shouldReopenChooseRuleRef = useRef(false);
  const goingToRuleEditRef = useRef(false);
  useEffect(() => {
    void getList(currentTab === 1 ? 1 : 0);
    const unsubscribeFocus = navigation.addListener('focus', () => {
      void getList(currentTab === 1 ? 1 : 0);
      if (shouldReopenChooseRuleRef.current) {
        void (async () => {
          const list = await getChargeRuleList();
          setSelectedRuleId(prev => {
            if ([null, undefined].includes(prev as any)) {
              const firstRuleId = list?.[0]?.id;
              return [null, undefined].includes(firstRuleId as any)
                ? null
                : firstRuleId;
            }
            return prev;
          });
          setChooseRulePopVisible(true);
          shouldReopenChooseRuleRef.current = false;
        })();
      }
    });

    return () => {
      eventCenter.off('refreshDeviceInfo');
      unsubscribeFocus();
    };
  }, [navigation, currentTab]);

  const normalizeFeeDeviceList = (list: any[]): FeeDeviceItem[] => {
    return list.map(item => ({
      ...item,
      id: item?.lockId,
    }));
  };

  const getList = async (hasFee: 0 | 1) => {
    const userIdRaw = await cacheGet({ key: 'userId' });
    const userId = Number(userIdRaw);
    showLoading();

    try {
      const res: any = await getUserLockFeeList({
        offset: 0,
        pageSize: 999,
        hasFee,
        userId: Number.isNaN(userId) ? undefined : userId,
      });
      hideLoading();
      if (!res?.success) {
        showToast({
          title: res?.msg || res?.message || '加载设备失败',
          icon: 'info',
        });
        return;
      }

      const list = Array.isArray(res?.data?.list) ? res.data.list : [];
      const normalized = normalizeFeeDeviceList(list);
      if (hasFee === 1) {
        setFeeDeviceList(normalized);
      } else {
        setFreeDeviceList(normalized);
      }
    } catch {
      showToast({ title: '加载设备失败', icon: 'info' });
    }
  };

  const handleNameConfirm = async () => {
    setEditNamePopVisible(false);
    const userId = await cacheGet({ key: 'userId' });
    try {
      const res = await updateName({
        id: currentDevice?.id,
        lockName: lockName,
        userId,
      });
      if (res) {
        showToast({
          title: '修改成功',
          icon: 'success',
          duration: 2000,
        });
        void getList(currentTab === 1 ? 1 : 0);
      }
    } catch (error) {
      console.error(error);
      showToast({
        title: '修改地锁名称失败',
        icon: 'error',
        duration: 2000,
      });
    }
  };

  const footerRender = useMemo(() => {
    if (!isOpen) {
      return null;
    }
    return (
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.footerBtn, styles.footerBtnClose]}
          onPress={async () => {
            setSelectedRemoveIds([]);
            await getRemovableList();
            setRemoveChargePopVisible(true);
          }}
        >
          <Text style={[styles.footerBtnText, styles.footerBtnCloseText]}>
            移除收费设备
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.footerBtn, styles.footerBtnAdd]}
          onPress={async () => {
            setSelectedAddIds([]);
            await getAddableList();
            setAddChargePopVisible(true);
          }}
        >
          <Text style={[styles.footerBtnText, styles.footerBtnAddText]}>
            添加收费设备
          </Text>
        </TouchableOpacity>
      </View>
    );
  }, [currentTab]);

  const toggleRemoveDevice = (id: string | number) => {
    setSelectedRemoveIds(prev => {
      const has = prev.includes(id);
      return has ? prev.filter(it => it !== id) : [...prev, id];
    });
  };

  const toggleAddDevice = (id: string | number) => {
    setSelectedAddIds(prev => {
      const has = prev.includes(id);
      return has ? prev.filter(it => it !== id) : [...prev, id];
    });
  };

  const removeList = useMemo(() => {
    return removableFeeDeviceList;
  }, [removableFeeDeviceList]);

  const addList = useMemo(() => {
    return addableFeeDeviceList;
  }, [addableFeeDeviceList]);

  const displayList = useMemo(() => {
    return currentTab === 1 ? feeDeviceList : freeDeviceList;
  }, [currentTab, feeDeviceList, freeDeviceList]);

  const closeAddPopupAndClear = () => {
    setAddChargePopVisible(false);
    setSelectedAddIds([]);
  };

  const getAddableList = async () => {
    const userIdRaw = await cacheGet({ key: 'userId' });
    const userId = Number(userIdRaw);
    showLoading({ title: '加载可添加设备...' });

    try {
      const res: any = await getUserLockFeeAddableList({
        offset: 0,
        pageSize: 999,
        userId: Number.isNaN(userId) ? undefined : userId,
      });

      if (!res?.success) {
        showToast({
          title: res?.msg || res?.message || '加载可添加设备失败',
          icon: 'info',
        });
        return [];
      }

      const list = Array.isArray(res?.data?.list) ? res.data.list : [];
      const normalized = normalizeFeeDeviceList(list);
      setAddableFeeDeviceList(normalized);
      return normalized;
    } catch {
      showToast({ title: '加载可添加设备失败', icon: 'info' });
      return [];
    } finally {
      hideLoading();
    }
  };

  const getChargeRuleList = async () => {
    const userIdRaw = await cacheGet({ key: 'userId' });
    const userId = Number(userIdRaw);

    try {
      const res: any = await getFeeTemplateList({
        offset: 0,
        pageSize: 999,
        userId: Number.isNaN(userId) ? undefined : userId,
      });

      if (!res?.success) {
        showToast({
          title: res?.msg || res?.message || '加载收费规则失败',
          icon: 'info',
        });
        return [];
      }

      const list = Array.isArray(res?.data?.list) ? res.data.list : [];
      setChargeRuleList(list);
      return list;
    } catch {
      showToast({ title: '加载收费规则失败', icon: 'info' });
      return [];
    }
  };

  const getRemovableList = async () => {
    const userIdRaw = await cacheGet({ key: 'userId' });
    const userId = Number(userIdRaw);
    showLoading({ title: '加载可移除设备...' });

    try {
      const res: any = await getUserLockFeeRemovableList({
        offset: 0,
        pageSize: 999,
        userId: Number.isNaN(userId) ? undefined : userId,
      });
      console.log('getUserLockFeeRemovableList res', res);

      if (!res?.success) {
        showToast({
          title: res?.msg || res?.message || '加载可移除设备失败',
          icon: 'info',
        });
        return;
      }

      const list = Array.isArray(res?.data?.list) ? res.data.list : [];
      setRemovableFeeDeviceList(normalizeFeeDeviceList(list));
    } catch {
      showToast({ title: '加载可移除设备失败', icon: 'info' });
    } finally {
      hideLoading();
    }
  };

  const checkAfterFeeOperation = async (
    type: 'add' | 'remove',
    list: FeeDeviceItem[],
    lockIds: Array<string | number>,
  ) => {
    const selectedItems = list.filter(item => lockIds.includes(item.id));
    const deviceNos = selectedItems
      .map(item => item.deviceNo)
      .filter(Boolean) as string[];

    if (deviceNos.length === 0) {
      showToast({
        title: type === 'add' ? '添加收费设备成功' : '移除收费设备成功',
        icon: 'success',
      });
      return;
    }

    try {
      const res: any = await checkUserLockFeeAddOrRemove({ deviceNos });
      if (!res?.success) {
        showToast({
          title: type === 'add' ? '添加收费设备成功' : '移除收费设备成功',
          icon: 'success',
        });
        return;
      }

      const usingNos = Array.isArray(res?.data) ? res.data : [];
      if (usingNos.length === 0) {
        showToast({
          title: type === 'add' ? '添加收费设备成功' : '移除收费设备成功',
          icon: 'success',
        });
        return;
      }

      const usingNameList = selectedItems
        .filter(item => usingNos.includes(String(item.deviceNo || '')))
        .map(item => item.lockName)
        .filter(Boolean);

      const usingNames = usingNameList.slice(0, 2).join('、');
      const displaySuffix =
        usingNameList.length > 2 ? `等${usingNameList.length}台地锁` : '';

      const displayName = `${usingNames}${displaySuffix}`;
      setMsgPopupText(
        type === 'add'
          ? `${displayName}正在被使用，使用完成后才会转入收费设备`
          : `${displayName}正在被使用，使用完成后才会移除收费设备`,
      );
      setMsgPopupVisible(true);
    } catch {
      showToast({
        title: type === 'add' ? '添加收费设备成功' : '移除收费设备成功',
        icon: 'success',
      });
    }
  };

  const goRuleEdit = (rule?: any) => {
    shouldReopenChooseRuleRef.current = true;
    goingToRuleEditRef.current = true;
    setChooseRulePopVisible(false);

    if (rule?.id) {
      navigation.navigate('RcvPaymentRuleEdit', {
        ruleId: rule.id,
        rule,
      });
      return;
    }
    navigation.navigate('RcvPaymentRuleEdit');
  };

  const renderChargeDeviceRows = (
    list: any[],
    selectedIds: Array<string | number>,
    onToggle: (id: string | number) => void,
  ) => {
    return (
      <ScrollView
        style={styles.removeList}
        contentContainerStyle={styles.removeListContent}
        showsVerticalScrollIndicator={false}
      >
        {list && list.length ? (
          list.map((item: any) => {
            const active = selectedIds.includes(item.id);

            return (
              <TouchableOpacity
                key={String(item.id)}
                activeOpacity={0.85}
                style={styles.removeRow}
                onPress={() => onToggle(item.id)}
              >
                <View style={styles.removeLeft}>
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={{ width: px(48), height: px(28) }}
                    resizeMode="contain"
                  />
                  <Text style={styles.removeName} numberOfLines={1}>
                    {`${item.lockName}`}
                  </Text>
                </View>

                <View
                  style={[
                    styles.removeCheck,
                    active ? styles.removeCheckActive : null,
                  ]}
                >
                  {active ? (
                    <AppIcon name="tick-white" color="#FFFFFF" size={px(24)} />
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <MyEmpty
            emptyText="暂无可选设备"
            marginTop={px(0)}
            paddingBottom={px(20)}
          />
        )}
      </ScrollView>
    );
  };

  const renderChargePopup = ({
    visible,
    title,
    list,
    selectedIds,
    onToggle,
    onClose,
    onConfirm,
    confirmText,
    confirmBtnStyle,
    confirmBtnDisabledStyle,
  }: {
    visible: boolean;
    title: string;
    list: any[];
    selectedIds: Array<string | number>;
    onToggle: (id: string | number) => void;
    onClose: () => void;
    onConfirm: () => void;
    confirmText: string;
    confirmBtnStyle: any;
    confirmBtnDisabledStyle: any;
  }) => {
    return (
      <Popup visible={visible} onClose={onClose} title={title} showClose>
        <View style={styles.removePopupWrap}>
          {renderChargeDeviceRows(list, selectedIds, onToggle)}

          <View style={styles.removeFooter}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.removeBtn, styles.removeCancelBtn]}
              onPress={onClose}
            >
              <Text style={styles.removeCancelText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.removeBtn,
                confirmBtnStyle,
                selectedIds.length === 0 ? confirmBtnDisabledStyle : null,
              ]}
              onPress={onConfirm}
            >
              <Text style={styles.removeConfirmText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Popup>
    );
  };

  const contentRender = useCallback(() => {
    return currentTab === 1 ? ['top', 'bottom'] : ['top'];
  }, [currentTab]);

  return (
    <PageContainer
      safeAreaEdges={contentRender()}
      statusBarStyle="dark-content"
      statusBarBackgroundColor="#ffffff"
      pageNavProps={{
        text: fromRcvPayment ? '设备列表' : '添加设备',
        showBack: true,
        background: '#FFFFFF',
      }}
      navBorder
      backgroundColor="#ffffff"
      footer={currentTab === 1 ? footerRender : undefined}
    >
      <View
        style={[
          styles.container,
          currentTab === 1 ? { paddingBottom: px(0) } : {},
        ]}
      >
        {!fromRcvPayment && (
          <View style={{ height: px(48), width: '100%' }}>
            <GradientButton
              colors={['#282828', '#4A4A4A']}
              onPress={() => {
                navigation.navigate('BindDevice');
              }}
              style={[
                styles.btnContainer,
                styles.btnContainerClose,
                { height: px(48) },
              ]}
            >
              <Flex
                style={styles.btnContainerConfirmText}
                align="center"
                justify="center"
              >
                <Text style={styles.btnAddText}>+</Text>
                <Text style={styles.btnContainerText}>添加设备</Text>
              </Flex>
            </GradientButton>
          </View>
        )}
        {!fromRcvPayment && (
          <Flex align="center" style={styles.title}>
            <Text style={styles.titleBorder} />
            <Text style={styles.titleText}>设备列表</Text>
            <Text style={styles.titleBorder} />
          </Flex>
        )}
        <View style={styles.tabContainer}>
          <View style={styles.tabItemList}>
            <TouchableOpacity
              style={[styles.tabItem, currentTab === 0 && styles.tabItemActive]}
              onPress={() => setCurrentTab(0)}
              activeOpacity={1}
            >
              <Text
                style={[
                  styles.tabItemText,
                  currentTab === 0 && styles.tabItemTextActive,
                ]}
              >
                不收费设备
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabItem, currentTab === 1 && styles.tabItemActive]}
              onPress={() => setCurrentTab(1)}
              activeOpacity={1}
            >
              <Text
                style={[
                  styles.tabItemText,
                  currentTab === 1 && styles.tabItemTextActive,
                ]}
              >
                收费设备
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView>
          {displayList && displayList.length > 0 ? (
            <Flex direction={'column'}>
              {displayList.map((item: any) => (
                <DeviceItem
                  data={item}
                  active={false}
                  key={item.id}
                  onSelect={async () => {
                    navigation.navigate('DeviceInfo', {
                      lockId: item.id,
                      isAdmin: item.role === 1,
                    });
                  }}
                  onChangeName={event => {
                    event?.stopPropagation?.();
                    setCurrentDevice(item);
                    console.log('item', item);
                    setLockName(item.lockName);
                    setEditNamePopVisible(true);
                  }}
                />
              ))}
            </Flex>
          ) : (
            <MyEmpty emptyText="暂无设备" marginTop={px(40)} />
          )}
        </ScrollView>
      </View>

      <Popup
        showClose={false}
        onClose={() => setEditNamePopVisible(false)}
        title={`编辑${currentDevice?.count === 1 ? '地锁' : '组合设备'}名称`}
        visible={editNamePopVisible}
      >
        <View style={styles.popup}>
          <Flex
            align="center"
            style={{
              width: '100%',
              height: px(20),
            }}
          >
            <Text style={styles.label}>
              {currentDevice?.count === 1 ? '地锁名称' : '组合设备名称'}
            </Text>
            <TextInput
              value={lockName}
              placeholder="请输入"
              style={{
                flex: 1,
                padding: 0,
                textAlign: 'right',
                fontSize: fontSize(14),
              }}
              onChangeText={e => setLockName(e)}
            />
            <AppIcon name="redact" color="#999999" size={px(20)} />
          </Flex>
          <View style={styles.popupFooter}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => {
                setEditNamePopVisible(false);
              }}
            >
              <Text style={styles.btnTextCancel}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={() => {
                handleNameConfirm();
              }}
            >
              <Text style={styles.btnTextConfirm}>确定</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Popup>

      {renderChargePopup({
        visible: removeChargePopVisible,
        title: '移除收费设备',
        list: removeList,
        selectedIds: selectedRemoveIds,
        onToggle: toggleRemoveDevice,
        onClose: () => setRemoveChargePopVisible(false),
        confirmText: '确认移除',
        confirmBtnStyle: styles.removeConfirmBtn,
        confirmBtnDisabledStyle: styles.removeConfirmBtnDisabled,
        onConfirm: () => {
          if (selectedRemoveIds.length === 0) {
            showToast({ title: '请选择设备', icon: 'info' });
            return;
          }

          void (async () => {
            const userIdRaw = await cacheGet({ key: 'userId' });
            const userId = Number(userIdRaw);
            setRemoveChargePopVisible(false);
            showLoading({ title: '移除收费设备中' });
            const res: any = await removeUserLockFee({
              lockIds: selectedRemoveIds,
              userId: Number.isNaN(userId) ? undefined : userId,
            });

            const ok =
              res?.success === true &&
              (Number(res?.code) === 0 || Number(res?.code) === 200) &&
              res?.data === true;
            hideLoading();

            if (!ok) {
              showToast({
                title: res?.msg || res?.message || '移除收费设备失败',
                icon: 'info',
              });
              return;
            }
            setSelectedRemoveIds([]);
            await checkAfterFeeOperation(
              'remove',
              removeList,
              selectedRemoveIds,
            );
            await Promise.all([getList(1), getList(0)]);
          })();
        },
      })}

      {renderChargePopup({
        visible: addChargePopVisible,
        title: '添加收费设备',
        list: addList,
        selectedIds: selectedAddIds,
        onToggle: toggleAddDevice,
        onClose: closeAddPopupAndClear,
        confirmText: '确认添加',
        confirmBtnStyle: styles.addConfirmBtn,
        confirmBtnDisabledStyle: styles.addConfirmBtnDisabled,
        onConfirm: () => {
          if (selectedAddIds.length === 0) {
            showToast({ title: '请选择设备', icon: 'info' });
            return;
          }
          void (async () => {
            const list = await getChargeRuleList();
            setAddChargePopVisible(false);
            setChooseRulePopVisible(true);
            const firstRuleId = list?.[0]?.id;
            setSelectedRuleId(
              [null, undefined].includes(firstRuleId as any)
                ? null
                : firstRuleId,
            );
          })();
        },
      })}

      <Popup
        visible={chooseRulePopVisible}
        onClose={() => {
          if (goingToRuleEditRef.current) {
            goingToRuleEditRef.current = false;
            return;
          }
          shouldReopenChooseRuleRef.current = false;
          setChooseRulePopVisible(false);
        }}
        title="选择收费规则"
        showClose
      >
        <View style={styles.rulePopupWrap}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.newRuleBtn}
            onPress={() => goRuleEdit()}
          >
            <Text style={styles.newRuleText}>新增收费规则</Text>
          </TouchableOpacity>

          <ScrollView
            style={styles.ruleList}
            contentContainerStyle={styles.ruleListContent}
            showsVerticalScrollIndicator={false}
          >
            {chargeRuleList && chargeRuleList.length ? (
              chargeRuleList.map((rule: any) => {
                const active = String(selectedRuleId) === String(rule.id);

                return (
                  <TouchableOpacity
                    key={String(rule.id)}
                    activeOpacity={0.85}
                    style={styles.ruleRow}
                    onPress={() => setSelectedRuleId(rule.id)}
                  >
                    <Text style={styles.ruleName} numberOfLines={1}>
                      {rule?.templateName}
                    </Text>

                    <View style={styles.ruleRight}>
                      <View
                        style={[
                          styles.removeCheck,
                          active ? styles.removeCheckActive : null,
                        ]}
                      >
                        {active ? (
                          <AppIcon
                            name="tick-white"
                            color="#FFFFFF"
                            size={px(24)}
                          />
                        ) : null}
                      </View>

                      <TouchableOpacity
                        activeOpacity={0.85}
                        style={styles.ruleEditBtn}
                        onPress={e => {
                          e?.stopPropagation?.();
                          goRuleEdit(rule);
                        }}
                      >
                        <Text style={styles.ruleEditText}>编辑</Text>
                        <AppIcon
                          name="a-headfor-20"
                          size={px(14)}
                          color="#666666"
                        />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <MyEmpty emptyText="暂无内容" marginTop={px(30)} />
            )}
          </ScrollView>

          <View style={styles.removeFooter}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.removeBtn, styles.removeCancelBtn]}
              onPress={() => {
                setChooseRulePopVisible(false);
                setAddChargePopVisible(true);
              }}
            >
              <Text style={styles.removeCancelText}>上一步</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.removeBtn, styles.addConfirmBtn]}
              onPress={() => {
                if ([null, undefined].includes(selectedRuleId as any)) {
                  showToast({ title: '请选择收费规则', icon: 'info' });
                  return;
                }
                shouldReopenChooseRuleRef.current = false;

                void (async () => {
                  setChooseRulePopVisible(false);
                  const userIdRaw = await cacheGet({ key: 'userId' });
                  const userId = Number(userIdRaw);
                  showLoading({ title: '添加收费设备中' });
                  const res: any = await addUserLockFee({
                    lockIds: selectedAddIds,
                    templateId: selectedRuleId,
                    userId: Number.isNaN(userId) ? undefined : userId,
                  });

                  const ok =
                    res?.success === true &&
                    (Number(res?.code) === 0 || Number(res?.code) === 200) &&
                    res?.data === true;
                  hideLoading();
                  if (!ok) {
                    showToast({
                      title: res?.msg || res?.message || '添加收费设备失败',
                      icon: 'info',
                    });
                    return;
                  }

                  setSelectedAddIds([]);
                  setSelectedRuleId(null);
                  await checkAfterFeeOperation('add', addList, selectedAddIds);
                  await Promise.all([getList(1), getList(0)]);
                })();
              }}
            >
              <Text style={styles.removeConfirmText}>完成</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Popup>

      <PopConfirm
        visible={msgPopupVisible}
        onVisibleChange={setMsgPopupVisible}
        title={<Text style={styles.removeName}>{msgPopupText}</Text>}
        showClose={false}
        confirmText="确定"
        onConfirm={() => {
          setMsgPopupVisible(false);
        }}
      />
    </PageContainer>
  );
}
