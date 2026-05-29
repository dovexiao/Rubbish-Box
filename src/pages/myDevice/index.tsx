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
import { getLockDeviceList } from '@/services/device';
import { DeviceItem } from '@/components/Device/Item/index';
import AnimationPop, { AnimationPopRef } from '@/components/AnimationPop';
import styles from './styles';
import { fontSize, px } from '@/utils/ui';
import MyEmpty from '@/components/MyEmpty/index';

export default function MyDevice() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const fromRcvPayment = route.params?.fromRcvPayment ? true : false;
  const [lockName, setLockName] = useState('');
  const [deviceList, setDeviceList] = useState<any[]>([]);
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
  const [msgPopupVisible, setMsgPopupVisible] = useState(false);
  const [msgPopupText, setMsgPopupText] = useState('');
  const shouldReopenChooseRuleRef = useRef(false);

  const chargeRuleList = useMemo(() => {
    const list = route.params?.chargeRuleList;
    if (Array.isArray(list) && list.length > 0) {
      return list;
    }
    return [
      { id: 'r1', ruleName: '地上收费规则' },
      { id: 'r2', ruleName: '创景路车场收费规则' },
      { id: 'r3', ruleName: 'Boke车位收费' },
      { id: 'r4', ruleName: '未来星辰地下机动车收费规则' },
    ];
  }, [route.params?.chargeRuleList]);
  useEffect(() => {
    getList();
    const unsubscribeFocus = navigation.addListener('focus', () => {
      if (shouldReopenChooseRuleRef.current) {
        setChooseRulePopVisible(true);
        shouldReopenChooseRuleRef.current = false;
      }
    });

    return () => {
      eventCenter.off('refreshDeviceInfo');
      unsubscribeFocus();
    };
  }, [navigation]);

  const getList = async () => {
    const res: any = await getLockDeviceList({
      offset: 0,
      pageSize: 999,
    });
    setDeviceList(res.data.list);
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
        getList();
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
    return (
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.footerBtn, styles.footerBtnClose]}
          onPress={() => {
            setSelectedRemoveIds([]);
            setRemoveChargePopVisible(true);
          }}
        >
          <Text style={[styles.footerBtnText, styles.footerBtnCloseText]}>
            移除收费设备
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.footerBtn, styles.footerBtnAdd]}
          onPress={() => {
            setSelectedAddIds([]);
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
    return deviceList || [];
  }, [deviceList]);

  const closeAddPopupAndClear = () => {
    setAddChargePopVisible(false);
    setSelectedAddIds([]);
  };

  const getSelectedDeviceNames = (ids: Array<string | number>) => {
    const nameList = removeList
      .filter((it: any) => ids.includes(it.id))
      .map((it: any) => it?.lockName)
      .filter(Boolean);
    return nameList;
  };

  const mockSubmitChargeDevices = async (
    type: 'add' | 'remove',
    ids: Array<string | number>,
  ) => {
    return new Promise<{ ok: boolean; message: string }>(resolve => {
      setTimeout(() => {
        const names = getSelectedDeviceNames(ids);
        const displayNames = names.slice(0, 2).join('、');

        const inUseMessage =
          type === 'add'
            ? `${displayNames || '地锁'}正在被使用，使用完成后才会转入收费设备`
            : `${displayNames || '地锁'}正在被使用，使用完成后才会移除收费设备`;

        if (ids.length % 2 === 0) {
          resolve({ ok: true, message: inUseMessage });
          return;
        }

        resolve({
          ok: true,
          message: type === 'add' ? '添加收费设备成功' : '移除收费设备成功',
        });
      }, 450);
    });
  };

  const goRuleEdit = (rule?: any) => {
    setChooseRulePopVisible(false);
    shouldReopenChooseRuleRef.current = true;

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
    selectedIds: Array<string | number>,
    onToggle: (id: string | number) => void,
  ) => {
    return (
      <ScrollView
        style={styles.removeList}
        contentContainerStyle={styles.removeListContent}
        showsVerticalScrollIndicator={false}
      >
        {removeList.map((item: any) => {
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
        })}
      </ScrollView>
    );
  };

  const renderChargePopup = ({
    visible,
    title,
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
          {renderChargeDeviceRows(selectedIds, onToggle)}

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
                不收费订单
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
                收费订单
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView>
          {deviceList && deviceList?.length > 0 ? (
            <Flex direction={'column'}>
              {deviceList.map((item: any) => (
                <DeviceItem
                  data={item}
                  active={false}
                  key={item.id}
                  onSelect={async () => {}}
                  onChangeName={() => {
                    setCurrentDevice(item);
                    setLockName(item.lockName);
                    setEditNamePopVisible(true);
                  }}
                />
              ))}
            </Flex>
          ) : (
            <Flex justify="center" align="center">
              <Image
                source={{ uri: 'https://g.18qjz.cn/img/boklock/empty.png' }}
                style={{ width: px(130), height: px(130) }}
              />
            </Flex>
          )}
        </ScrollView>
      </View>

      <Popup
        showClose={false}
        onClose={() => setEditNamePopVisible(false)}
        title={`编辑${
          currentDevice?.groupCount === 1 ? '地锁' : '组合设备'
        }名称`}
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
              {currentDevice?.groupCount === 1 ? '地锁名称' : '组合设备名称'}
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
            const res = await mockSubmitChargeDevices(
              'remove',
              selectedRemoveIds,
            );
            setRemoveChargePopVisible(false);
            setSelectedRemoveIds([]);
            setMsgPopupText(res.message);
            setMsgPopupVisible(true);
          })();
        },
      })}

      {renderChargePopup({
        visible: addChargePopVisible,
        title: '添加收费设备',
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
          setAddChargePopVisible(false);
          setChooseRulePopVisible(true);
          if ([null, undefined].includes(selectedRuleId as any)) {
            setSelectedRuleId(chargeRuleList[0]?.id ?? null);
          }
        },
      })}

      <Popup
        visible={chooseRulePopVisible}
        onClose={() => {
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
                      {rule?.ruleName}
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
                  const res = await mockSubmitChargeDevices(
                    'add',
                    selectedAddIds,
                  );
                  setChooseRulePopVisible(false);
                  setSelectedAddIds([]);
                  setMsgPopupText(res.message);
                  setMsgPopupVisible(true);
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
        title={<Text style={styles.msgPopupText}>{msgPopupText}</Text>}
        showClose={false}
        confirmText="确定"
        onConfirm={() => {
          setMsgPopupVisible(false);
        }}
      />
    </PageContainer>
  );
}
