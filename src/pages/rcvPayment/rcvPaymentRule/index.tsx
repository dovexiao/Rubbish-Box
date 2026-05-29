import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PageContainer, PopConfirm } from '@/components';
import { getPickupCodeRecordList, removeRcvPaymentRule } from '@/services/mall';
import styles from './styles';
import { hideLoading, showLoading, showToast } from '@/utils';
import { px } from '@/utils/ui';
import AppIcon from '@/components/AppIcon';
import GradientButton from '@/components/GradientButton';
import MyEmpty from '@/components/MyEmpty/index';

const PAGE_SIZE = 20;

type RuleItem = {
  id: number | string;
  ruleName?: string;
  name?: string;
  title?: string;
  [key: string]: any;
};

export default function RcvPaymentRule() {
  const navigation = useNavigation<any>();
  const [ruleList, setRuleList] = useState<RuleItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [complete, setComplete] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [removeConfirmVisible, setRemoveConfirmVisible] = useState(false);
  const [removeResultVisible, setRemoveResultVisible] = useState(false);
  const [removingRule, setRemovingRule] = useState<RuleItem | null>(null);
  const [removeResult, setRemoveResult] = useState<{
    title: string;
    desc?: string;
  }>({ title: '' });

  const buildInUseText = (data: any) => {
    const lockSource =
      data?.usedLockNos ??
      data?.lockNos ??
      data?.lockNoList ??
      data?.usedLockList ??
      [];

    const lockText = Array.isArray(lockSource)
      ? lockSource.filter(Boolean).join('、')
      : String(lockSource || '');

    if (lockText) {
      return `当前收费规则已在：${lockText}使用，无法删除`;
    }

    return '当前收费规则已被地锁使用，无法删除';
  };

  const handleRemove = async () => {
    const targetId = removingRule?.id;
    if ([null, undefined].includes(targetId as any)) return;

    setRemoveConfirmVisible(false);
    showLoading({ title: '删除中...' });

    try {
      const res: any = await removeRcvPaymentRule({ id: targetId });
      const ok = Number(res?.code) === 200 || res?.success === true;
      const data = res?.data || {};
      const msg = String(res?.msg || res?.message || '');

      const inUse =
        data?.inUse === true ||
        data?.used === true ||
        data?.canDelete === false ||
        /已在|使用|无法删除|in use/i.test(msg);

      if (inUse) {
        setRemoveResult({
          title: '当前收费规则已在：',
          desc: buildInUseText(data).replace('当前收费规则已在：', ''),
        });
        setRemoveResultVisible(true);
        return;
      }

      if (ok) {
        setRemoveResult({ title: '删除成功' });
        setRemoveResultVisible(true);
        setRuleList(prev =>
          prev.filter(it => String(it.id) !== String(targetId)),
        );
        return;
      }

      showToast({
        title: res?.msg || res?.message || '删除失败',
        icon: 'info',
      });
    } catch {
      showToast({ title: '删除失败', icon: 'info' });
    } finally {
      hideLoading();
    }
  };

  const getRuleList = useCallback(
    async (refresh: boolean) => {
      if (refresh) setRefreshing(true);
      else setLoadingMore(true);

      try {
        const offset = refresh ? 0 : ruleList.length;
        const res: any = await getPickupCodeRecordList({
          offset,
          pageSize: PAGE_SIZE,
        });

        if (res?.code === 200 && res?.success) {
          const data = res?.data || {};
          const nextList: RuleItem[] = Array.isArray(data.list)
            ? data.list
            : Array.isArray(data.rows)
            ? data.rows
            : Array.isArray(res?.list)
            ? res.list
            : [];

          setRuleList(prev => (refresh ? nextList : [...prev, ...nextList]));
          setComplete(nextList.length < PAGE_SIZE);
        } else {
          showToast({
            title: res?.msg || res?.message || '加载收费规则失败',
            icon: 'info',
          });
        }
      } catch {
        showToast({ title: '加载收费规则失败', icon: 'info' });
      } finally {
        setRefreshing(false);
        setLoadingMore(false);
        setInitialLoading(false);
      }
    },
    [ruleList.length],
  );

  useEffect(() => {
    void getRuleList(true);
    const unsubscribe = navigation.addListener('focus', () => {
      void getRuleList(true);
    });

    return unsubscribe;
  }, [getRuleList, navigation]);

  const renderItem = useCallback(({ item }: { item: RuleItem }) => {
    const title = item.ruleName || item.name || item.title || '未命名收费规则';

    return (
      <View style={styles.card}>
        <Text style={styles.ruleName} numberOfLines={1}>
          {title}
        </Text>

        <View style={styles.actionWrap}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.actionBtn}
            onPress={() => {
              navigation.navigate('RcvPaymentRuleEdit', {
                ruleId: item.id,
                rule: item,
              });
            }}
          >
            <Text style={styles.editText}>编辑</Text>
            <AppIcon name="a-headfor-20" size={px(14)} color="#333333" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              setRemovingRule(item);
              setRemoveConfirmVisible(true);
            }}
          >
            <Text style={styles.removeText}>移除</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }, []);

  return (
    <PageContainer
      backgroundColor="#f6f7fa"
      statusBarStyle="dark-content"
      statusBarBackgroundColor="#FFFFFF"
      safeAreaEdges={['top', 'bottom']}
      scrollable={false}
      pageNavProps={{
        text: '设备收费规则',
        showBack: true,
        background: '#FFFFFF',
      }}
      loading={initialLoading}
      footer={
        <View style={styles.footer}>
          <GradientButton
            colors={['#4A4A4A', '#282828']}
            style={styles['footer-btn']}
            onPress={async () => {
              navigation.navigate('RcvPaymentRuleEdit');
            }}
          >
            <Text style={styles['footer-btn_text']}>新增收费规则</Text>
          </GradientButton>
        </View>
      }
    >
      <View style={styles.container}>
        {ruleList.length > 0 ? (
          <FlatList
            data={ruleList}
            keyExtractor={item => String(item.id)}
            renderItem={renderItem}
            onRefresh={() => void getRuleList(true)}
            refreshing={refreshing}
            onEndReachedThreshold={0.3}
            onEndReached={() => {
              if (!complete && !loadingMore && !refreshing) {
                void getRuleList(false);
              }
            }}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <MyEmpty emptyText="暂无内容" />
        )}

        <PopConfirm
          visible={removeConfirmVisible}
          onVisibleChange={setRemoveConfirmVisible}
          //   title="确定删除收费规则?"
          confirmText="确定"
          cancelText="取消"
          onConfirm={handleRemove}
          onCancel={() => {
            setRemoveConfirmVisible(false);
          }}
        >
          <Text style={styles.removePopupSubTitle}>确定删除地上收费规则？</Text>
          <Text style={styles.removePopupSubTitle}>删除后无法恢复</Text>
        </PopConfirm>

        <PopConfirm
          visible={removeResultVisible}
          onVisibleChange={setRemoveResultVisible}
          title={removeResult.title}
          showClose={false}
          confirmText="确定"
          onConfirm={() => {
            setRemoveResultVisible(false);
            if (removeResult.title === '删除成功') {
              void getRuleList(true);
            }
          }}
        >
          {removeResult.desc ? (
            <Text style={styles.removePopupDesc}>{removeResult.desc}</Text>
          ) : null}
        </PopConfirm>
      </View>
    </PageContainer>
  );
}
