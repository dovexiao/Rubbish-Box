import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import {
  PageContainer,
  Popup,
  PopConfirm,
  GradientButton,
  Flex,
  TextInput,
} from '@/components';
import IconFont from '@/iconfont';
import { getVipList, saveVip, deleteVip } from '@/services/user';
import { PopConfirmRef } from '@/components/popConfirm';
import { styles } from './infoStyle';

const PAGE_SIZE = 20;

interface ListItem {
  id: number;
  belongUserId: number;
  username: string;
  mobile: string;
  createTime: string;
  updateTime: string;
}

export default function VipInfoPage() {
  const [list, setList] = useState<ListItem[]>([]);
  const [complete, setComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  const [currentRow, setCurrentRow] = useState<ListItem | undefined>();
  const [addUsername, setAddUsername] = useState('');
  const [addMobile, setAddMobile] = useState('');
  const [popTitle, setPopTitle] = useState('');
  const [type, setType] = useState<'add' | 'edit' | undefined>();
  const [addVisible, setAddVisible] = useState(false);

  const deleteRef = useRef<PopConfirmRef>(null);
  const loadingRef = useRef(false);
  const listLengthRef = useRef(0);

  const fetchList = useCallback(
    async (refresh: boolean, keyword?: string) => {
      if (loadingRef.current) {
        return;
      }
      loadingRef.current = true;

      const username = keyword ?? searchText;
      setLoading(true);
      try {
        const res: any = await getVipList({
          pageSize: PAGE_SIZE,
          offset: refresh ? 0 : listLengthRef.current,
          username,
        });

        const rows = res?.data?.list ?? res?.list ?? [];
        setList(prev => {
          const nextList = refresh ? rows : [...prev, ...rows];
          listLengthRef.current = nextList.length;
          return nextList;
        });
        setComplete(rows.length < PAGE_SIZE);
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [searchText],
  );

  useEffect(() => {
    void fetchList(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchChange = (value: string) => {
    const trimmed = value.trim();
    setSearchText(trimmed);
    fetchList(true, trimmed);
  };

  const handleOpenAdd = (row?: ListItem, isEdit?: boolean) => {
    if (row) {
      setCurrentRow(row);
      setAddUsername(row.username);
      setAddMobile(row.mobile);
      setPopTitle(isEdit ? '编辑宾客' : '新增宾客');
      setType(isEdit ? 'edit' : 'add');
    } else {
      setCurrentRow(undefined);
      setAddUsername('');
      setAddMobile('');
      setPopTitle('新增宾客');
      setType('add');
    }
    setAddVisible(true);
  };

  const handleSave = async () => {
    if (!addUsername || !addMobile) {
      return;
    }
    await saveVip({
      id: currentRow?.id,
      username: addUsername,
      mobile: addMobile,
    });
    setAddVisible(false);
    fetchList(true);
  };

  const handleDelete = async () => {
    if (!currentRow?.id) return;
    await deleteVip({ id: currentRow.id });
    await fetchList(true);
  };

  const canSubmit =
    addUsername.trim().length > 0 && addMobile.trim().length > 0;

  return (
    <PageContainer
      backgroundColor="#F6F7FA"
      statusBarStyle="dark-content"
      safeAreaEdges={['top', 'bottom']}
      pageNavProps={{ text: '贵宾管理', showBack: true }}
      scrollable
      loading={loading && list.length === 0}
      padding={0}
      onRefresh={() => fetchList(true)}
      footer={
        <Flex justify="center" align="center" style={styles.footerWrap}>
          <GradientButton
            width={196}
            height={48}
            colors={['#4A4A4A', '#282828']}
            style={styles.buttonWrap}
            onPress={() => handleOpenAdd(undefined, false)}
            text="新增贵宾"
            textStyle={styles.buttonTitle}
          />
        </Flex>
      }
    >
      <View style={styles.searchBoxWrap}>
        <View style={styles.searchBox}>
          <IconFont name="search" size={16} color="#999999" />
          <TextInput
            style={{ marginLeft: 8, flex: 1, padding: 0 }}
            placeholder="输入宾客名称进行搜索"
            placeholderTextColor="rgba(153,153,153,0.5)"
            onChangeText={handleSearchChange}
            value={searchText}
          />
        </View>
      </View>

      <View style={styles.container}>
        {list.map(item => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.8}
            style={styles.card}
            onPress={() => handleOpenAdd(item, true)}
          >
            <Flex align="center" justify="between">
              <Text style={styles.username}>{item.username}</Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleOpenAdd(item, true)}
              >
                <Flex align="center">
                  <Text style={styles.username}>编辑</Text>
                  <IconFont name="a-headfor-20" size={12} color="#333333" />
                </Flex>
              </TouchableOpacity>
            </Flex>

            <Flex align="center" justify="between" style={styles.mt20}>
              <Text style={styles.mobile}>{item.mobile}</Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setCurrentRow(item);
                  deleteRef.current?.open();
                }}
              >
                <Text style={[styles.mobile, styles.pr28]}>删除</Text>
              </TouchableOpacity>
            </Flex>
          </TouchableOpacity>
        ))}

        {complete && (
          <Text style={{ textAlign: 'center', marginTop: 12 }}>
            共 {list.length} 条记录
          </Text>
        )}

        {!complete && list.length >= PAGE_SIZE && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              if (!loadingRef.current) {
                void fetchList(false);
              }
            }}
            style={{ marginTop: 12, alignItems: 'center' }}
          >
            <Text style={{ color: '#999999' }}>
              {loading ? '加载中...' : '加载更多'}
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.listBottomSpace} />
      </View>

      <PopConfirm
        ref={deleteRef}
        textWeight="bold"
        title={`确定要删除贵宾【${currentRow?.username ?? ''}】吗？`}
        onConfirm={handleDelete}
      />

      <Popup
        visible={addVisible}
        onClose={() => setAddVisible(false)}
        minHeight={208}
        title={popTitle}
      >
        <View style={styles.popup}>
          <Flex
            direction="row"
            justify="between"
            align="center"
            style={{ marginBottom: 24 }}
          >
            <Text style={styles.popText}>贵宾姓名</Text>
            <TextInput
              placeholder="请输入"
              placeholderTextColor="#CCCCCC"
              style={[styles.input, { paddingRight: 0, flex: 1 }]}
              textAlign="right"
              value={addUsername}
              onChangeText={v => setAddUsername(v.trim())}
            />
            {type === 'edit' && (
              <IconFont name="redact" color="#cccccc" size={20} />
            )}
          </Flex>
          <Flex direction="row" justify="between" align="center">
            <Text style={styles.popText}>贵宾手机号码</Text>
            <TextInput
              placeholder="请输入"
              placeholderTextColor="#CCCCCC"
              style={[styles.input, { paddingRight: 0, flex: 1 }]}
              keyboardType="number-pad"
              maxLength={11}
              textAlign="right"
              value={addMobile}
              onChangeText={v => setAddMobile(v.trim())}
            />
            {type === 'edit' && (
              <IconFont name="redact" color="#cccccc" size={20} />
            )}
          </Flex>
          <Flex
            style={{
              width: '100%',
              marginTop: 31,
              marginBottom: 8,
            }}
            direction="row"
            justify="center"
            align="center"
          >
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.cancalBtn}
              onPress={() => setAddVisible(false)}
            >
              <Text>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.confirmBtn,
                canSubmit ? styles.bgColor333 : styles.bgColor999,
              ]}
              onPress={handleSave}
              disabled={!canSubmit}
            >
              <Text style={styles.confirmBtnText}>确定</Text>
            </TouchableOpacity>
          </Flex>
        </View>
      </Popup>
    </PageContainer>
  );
}
