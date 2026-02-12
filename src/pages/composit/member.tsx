import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ImageStyle,
  FlatList,
} from 'react-native';
import { useMemo, useState, useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { DatePicker } from '@ant-design/react-native';
import { styles } from './memberStyle';
import { MemberItem } from './typing';
import { memberList, memberDelete, memberEdit } from '@/services/combine';
import { showToast, showLoading, hideLoading } from '@/utils';
import { mobileExp } from '@/utils';
import {
  PageContainer,
  Flex,
  Popup,
  TextInput,
  GradientButton,
  PopConfirm,
} from '@/components';
import IconFont from '@/iconfont';
import dayjs from 'dayjs';
import { stringify } from '@/utils/stringify';
import { useAppNavigation } from '@/hooks/useAppNavigation';

const PAGE_SIZE = 999;

export default function MemberPage() {
  const navigation = useAppNavigation();
  const route = useRoute<any>();
  const [lockName, setLockName] = useState('');
  const [list, setList] = useState<MemberItem[] | undefined>(undefined);
  const [complete, setComplete] = useState(false);
  const [currentRow, setCurrentRow] = useState<MemberItem | undefined>(
    undefined,
  );
  const [total, setTotal] = useState<number | undefined>(undefined);
  const [deleteRef, setDeleteRef] = useState(false);
  const [popRef, setPopRef] = useState(false);
  const [timePopRef, setTimePopRef] = useState(false);
  const isChecked = useMemo(() => {
    return (
      currentRow?.username &&
      currentRow?.mobile &&
      (currentRow?.isForever || (!currentRow?.isForever && currentRow?.endTime))
    );
  }, [currentRow]);

  useEffect(() => {
    getList(true);
  }, []);

  const getList = async (refresh = false) => {
    const res = await memberList({
      pageSize: PAGE_SIZE,
      lockId: route.params?.lockId,
      offset: refresh ? 0 : list.length ?? 0,
    });
    setComplete(res.data.list.length < PAGE_SIZE);
    setLockName(res.data.lockName);
    setTotal(res.data.total);
    setList(refresh ? res.data.list : [...list, ...res.data.list]);
  };

  const onDelete = async () => {
    showLoading({ title: '删除中...' });
    try {
      await memberDelete({
        id: currentRow?.id,
      });
      await getList(true);
      showToast({ title: '删除成功', icon: 'success' });
      setDeleteRef(false);
      return true;
    } finally {
      hideLoading();
    }
  };

  const onEdit = async () => {
    if (!currentRow?.username) {
      showToast({ title: '请输入成员昵称' });
      return;
    }
    if (!currentRow?.mobile) {
      showToast({ title: '请输入手机号' });
      return;
    }

    if (!mobileExp(currentRow?.mobile)) {
      showToast({ title: '请输入正确的手机号' });
      return;
    }

    if (!currentRow?.isForever && !currentRow?.endTime) {
      showToast({ title: '请设置有效期' });
      return;
    }
    showLoading({ title: '提交中...' });
    setPopRef(false);
    await memberEdit({
      ...currentRow,
      lockId: route.params?.lockId,
    });
    hideLoading();
    await getList(true);
    if (currentRow?.id) {
      setCurrentRow(undefined);
      showToast({ title: '编辑成功', icon: 'success' });
    } else {
      setCurrentRow(undefined);
      const { lockId, lockType } = route.params || {};
      const queryString: any = stringify({ lockId, lockType });
      navigation.navigate('CompositeShare', queryString);
    }
  };

  return (
    <PageContainer
      loading={!list}
      pageNavProps={{
        showBack: true,
        text: `${
          route.params?.['type'] == 'single' ? '单个' : '组合'
        }【${lockName}】设备`,
      }}
      backgroundColor="#FFFFFF"
      statusBarStyle="dark-content"
      statusBarBackgroundColor="#FFFFFF"
      safeAreaEdges={['top', 'bottom']}
      onRefresh={() => {
        getList(true);
      }}
    >
      <View style={styles.container}>
        <Flex style={styles.mt24}>
          <Text
            style={{
              marginLeft: 24,
              marginRight: 4,
              ...styles.title,
            }}
          >
            成员
          </Text>
          <Text style={styles.title}>{total ?? '0'}/20</Text>
        </Flex>
        <TouchableOpacity
          style={[styles.mt24, styles.addBox]}
          onPress={() => {
            setPopRef(true);
            setCurrentRow({
              isForever: true,
            });
          }}
        >
          <IconFont name="add" color="#333333" size={14} />
          <Text style={styles.addBtnText}>添加成员，授权使用地锁</Text>
        </TouchableOpacity>
        {list?.map(item => {
          return (
            <View key={item.id} style={styles.card}>
              <Flex align="center" justify="between">
                <Text style={styles.username}>{item.username}</Text>
                <TouchableOpacity
                  onPress={() => {
                    setCurrentRow(item);
                    setPopRef(true);
                  }}
                >
                  <Flex align="center">
                    <Text style={styles.username}>编辑</Text>
                    <IconFont name="a-headfor-20" size={18} color="#333333" />
                  </Flex>
                </TouchableOpacity>
              </Flex>

              <Flex align="center" justify="between" style={styles.mt20}>
                <Text style={styles.mobile}>{item.mobile}</Text>
                <Text
                  style={[styles.mobile, styles.remove, styles.pr28]}
                  onPress={() => {
                    setCurrentRow(item);
                    setDeleteRef(true);
                  }}
                >
                  移除
                </Text>
              </Flex>
            </View>
          );
        })}
      </View>
      <PopConfirm
        visible={deleteRef}
        title={`确定要移除【${currentRow?.username ?? ''}】吗？`}
        onConfirm={onDelete}
        onCancel={() => setDeleteRef(false)}
      />
      <Popup
        visible={popRef}
        title={`${currentRow?.id ? '编辑' : '添加'}成员`}
        onClose={() => {
          setPopRef(false);
        }}
      >
        <View>
          <Flex style={styles.itemContent} align="center" justify="between">
            <Text style={[styles.label, styles.contentLabel]}>成员昵称</Text>
            <TextInput
              style={{ flex: 1, textAlign: 'right', ...styles.input }}
              placeholder="请输入"
              value={currentRow?.username}
              onChangeText={text => {
                setCurrentRow({
                  ...currentRow,
                  username: text,
                });
              }}
            />
          </Flex>
          <Flex style={styles.itemContent} align="center" justify="between">
            <Text style={[styles.label, styles.contentLabel]}>
              成员手机号码
            </Text>
            <TextInput
              style={{ flex: 1, textAlign: 'right', ...styles.input }}
              placeholder="请输入"
              type="phone"
              value={currentRow?.mobile}
              maxLength={11}
              onChangeText={text =>
                setCurrentRow({
                  ...currentRow,
                  mobile: text,
                })
              }
            />
          </Flex>
          <Flex
            style={[styles.itemContent, styles.itemContentValid]}
            align={'start'}
            justify="between"
          >
            <Text style={[styles.label, styles.contentLabel]}>有效期</Text>
            <View>
              <Flex
                align={'start'}
                justify="end"
                style={styles.itemContentRight}
              >
                <Flex
                  align="center"
                  isTouchView
                  onPress={() => {
                    setCurrentRow({
                      ...currentRow,
                      isForever: true,
                    });
                  }}
                >
                  <IconFont
                    name={currentRow?.isForever ? 'selected' : 'unselected'}
                    size={20}
                    color={currentRow?.isForever ? '#333333' : '#E1E1E1'}
                  />
                  <Text style={[styles.limitLabel, styles.ml12]}>永久</Text>
                </Flex>
                <Flex
                  align="center"
                  isTouchView
                  onPress={() => {
                    setCurrentRow({
                      ...currentRow,
                      isForever: false,
                      endTime:
                        currentRow?.endTime ?? dayjs().add(30, 'day').valueOf(),
                    });
                  }}
                  style={styles.ml32}
                >
                  <IconFont
                    name={currentRow?.isForever ? 'unselected' : 'selected'}
                    size={20}
                    color={currentRow?.isForever ? '#E1E1E1' : '#333333'}
                  />
                  <Text style={[styles.limitLabel, styles.ml12]}>自定义</Text>
                </Flex>
              </Flex>
              {!currentRow?.isForever ? (
                <Flex
                  style={styles.endtimeBox}
                  align="center"
                  onPress={() => {
                    setTimePopRef(true);
                  }}
                >
                  <Text style={[styles.label, styles.ml16]}>截止至</Text>
                  <Flex
                    style={styles.endTime}
                    align="center"
                    isTouchView
                    onPress={() => {
                      setTimePopRef(true);
                    }}
                  >
                    <Text>
                      {dayjs(currentRow?.endTime).format('YYYY-MM-DD')}
                    </Text>
                    <View style={styles.ml8}>
                      <IconFont
                        name={'a-headfor-20'}
                        size={24}
                        color="#333333"
                      />
                    </View>
                  </Flex>
                </Flex>
              ) : (
                <></>
              )}
            </View>
          </Flex>

          <Flex style={styles.btnContainerWrapper} justify={'center'}>
            <GradientButton
              colors={['transparent', 'transparent']}
              width={156}
              height={48}
              onPress={() => {
                setPopRef(false);
              }}
              style={[styles.btnContainer, styles.btnContainerClose]}
            >
              <Text style={styles.btnContainerCloseText}>取消</Text>
            </GradientButton>
            <GradientButton
              colors={
                isChecked ? ['#333333', '#333333'] : ['#999999', '#999999']
              }
              width={156}
              height={48}
              onPress={() => {
                if (isChecked) {
                  onEdit();
                }
              }}
              style={[styles.btnContainer, styles.btnContainerConfirm]}
            >
              <Text style={styles.btnContainerConfirmText}>{`确定${
                currentRow?.id ? '编辑' : '新增'
              }`}</Text>
            </GradientButton>
          </Flex>
        </View>
      </Popup>

      <DatePicker
        visible={timePopRef}
        title="选择截止日期"
        mode="date"
        value={currentRow?.endTime ? new Date(currentRow.endTime) : new Date()}
        minDate={new Date()}
        onVisibleChange={v => setTimePopRef(v)}
        onOk={d => {
          setCurrentRow(prev =>
            prev
              ? {
                  ...prev,
                  endTime: dayjs(d).valueOf(),
                }
              : prev,
          );
          setTimePopRef(false);
        }}
      />
    </PageContainer>
  );
}
