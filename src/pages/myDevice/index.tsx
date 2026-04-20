import { showToast, eventCenter } from '@/utils';
import { useNavigation } from '@react-navigation/native';
import { Image, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRef, useState, useEffect } from 'react';
import {
  PageContainer,
  TextInput,
  Flex,
  GradientButton,
  Popup,
} from '@/components/index';
import AppIcon from '@/components/AppIcon';
import { cacheGet } from '@/utils/cache';
import { updateName } from '@/services/deviceInfo';
import { getLockDeviceList } from '@/services/device';
import { DeviceItem } from '@/components/Device/Item/index';
import AnimationPop, { AnimationPopRef } from '@/components/AnimationPop';
import styles from './styles';
import { fontSize, px } from '@/utils/ui';

export default function MyDevice() {
  const navigation = useNavigation<any>();
  const [lockName, setLockName] = useState('');
  const [deviceList, setDeviceList] = useState<any[]>([]);
  const [currentDevice, setCurrentDevice] = useState<any>(undefined);
  const [editNamePopVisible, setEditNamePopVisible] = useState(false);

  useEffect(() => {
    getList();
    return () => {
      eventCenter.off('refreshDeviceInfo');
    };
  }, []);

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
  return (
    <PageContainer
      safeAreaEdges={['top', 'bottom']}
      statusBarStyle="dark-content"
      statusBarBackgroundColor="#ffffff"
      pageNavProps={{
        text: '添加设备',
        showBack: true,
        background: '#FFFFFF',
      }}
      navBorder
      backgroundColor="#ffffff"
    >
      <ScrollView style={styles.container}>
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
        <Flex align="center" style={styles.title}>
          <Text style={styles.titleBorder}></Text>
          <Text style={styles.titleText}>设备列表</Text>
        </Flex>
        {deviceList && deviceList?.length > 0 ? (
          <Flex direction={'column'}>
            {deviceList.map((item: any, index: number) => (
              <DeviceItem
                data={item}
                active={false}
                key={item.id}
                // isfirst={index === 0}
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
              // closeable={true}
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
    </PageContainer>
  );
}
