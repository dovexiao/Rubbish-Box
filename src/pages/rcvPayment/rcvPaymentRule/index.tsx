import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PageContainer, PopConfirm } from '@/components';
import { deleteFeeTemplate, getFeeTemplateList } from '@/services/mall';
import styles from './styles';
import { hideLoading, showLoading, showToast } from '@/utils';
import { px } from '@/utils/ui';
import AppIcon from '@/components/AppIcon';
import GradientButton from '@/components/GradientButton';
import MyEmpty from '@/components/MyEmpty/index';
import { SimpleLoading } from '@/components';

const PAGE_SIZE = 20;

type RuleItem = {
  id: number | string;
  templateName?: string;
  ruleName?: string;
  chargingType?: number;
  unitFee?: number;
  duration?: number;
  maxFee?: number;
  billingType?: number;
  billingCycle?: number;
  isRoll?: number;
  feeUnitRoundUp?: number;
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
  const removingRuleName = removingRule?.templateName;

  const handleRemove = async () => {
    const targetId = removingRule?.id;
    if ([null, undefined].includes(targetId as any)) return;

    setRemoveConfirmVisible(false);
    showLoading({ title: '删除中...' });

    try {
      const res: any = await deleteFeeTemplate({ id: targetId });
      const ok =
        res?.success === true &&
        (Number(res?.code) === 0 || Number(res?.code) === 200) &&
        res?.data === true;

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
        const res: any = await getFeeTemplateList({
          offset,
          pageSize: PAGE_SIZE,
        });
        console.log('getRuleList res', res.data?.list?.[1]);
        if (res?.success) {
          const nextList: RuleItem[] = Array.isArray(res?.data?.list)
            ? res.data.list
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
    const title = item.templateName;

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
      // loading={initialLoading}
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
        {initialLoading ? (
          <SimpleLoading />
        ) : ruleList.length > 0 ? (
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
          <Text style={styles.removePopupSubTitle}>
            {`确定删除${removingRuleName}？`}
          </Text>
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
