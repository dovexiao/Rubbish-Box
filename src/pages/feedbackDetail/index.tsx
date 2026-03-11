import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import dayjs from 'dayjs';
import { useRoute } from '@react-navigation/native';
import { Flex, PageContainer } from '@/components';
import { getOpinionDetail, submitOpinionEvaluate } from '@/services/user';
import styles from './styles';
import { showToast } from '@/utils';

interface DetailInfo {
  id: number;
  feedbackNo: string;
  userMobile: string;
  feedbackTime: string;
  status: number; // 1: 处理中 2: 已处理
  content: string;
  images: string[];
  handleResult: string;
  handleImages?: string[];
  handleTime?: string;
  serviceAttitude?: number;
  responseSpeed?: number;
  serviceQuality?: number;
  evaluationContent?: string;
  evaluationFlag?: boolean;
}

interface EvalItem {
  label: string;
  key: 'serviceAttitude' | 'responseSpeed' | 'serviceQuality';
  count: number;
}

const STATUS_TEXT: Record<number, string> = {
  1: '处理中',
  2: '已处理',
};

const STAR_TEXT = ['不满意', '有待改进', '一般', '满意', '非常满意'];

export default function FeedbackDetail() {
  const route = useRoute<any>();
  const feedbackId = route.params?.feedbackId;

  const [detailInfo, setDetailInfo] = useState<DetailInfo | null>(null);
  const [evaluation, setEvaluation] = useState<EvalItem[]>([]);
  const [textLength, setTextLength] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const loadDetail = useCallback(async () => {
    if (!feedbackId) return;
    try {
      const res = await getOpinionDetail({ feedbackId });
      const data: DetailInfo = (res as any)?.data ?? res;
      setDetailInfo(data);
      setEvaluation([
        {
          label: '服务态度',
          key: 'serviceAttitude',
          count: data.serviceAttitude || 0,
        },
        {
          label: '响应速度',
          key: 'responseSpeed',
          count: data.responseSpeed || 0,
        },
        {
          label: '服务质量',
          key: 'serviceQuality',
          count: data.serviceQuality || 0,
        },
      ]);
      setTextLength((data.evaluationContent || '').length);
    } catch (e) {
      showToast('获取详情失败');
    }
  }, [feedbackId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const canSubmit = useMemo(() => {
    if (!detailInfo || detailInfo.evaluationFlag) return false;
    const total = evaluation.reduce((sum, item) => sum + (item.count || 0), 0);
    return total > 0 || textLength > 0;
  }, [detailInfo, evaluation, textLength]);

  const handleStarPress = (index: number, value: number) => {
    if (!detailInfo?.status || detailInfo.evaluationFlag) return;
    setEvaluation(prev =>
      prev.map((item, i) => (i === index ? { ...item, count: value } : item)),
    );
  };

  const handleSubmitEvaluate = useCallback(async () => {
    if (!detailInfo || !canSubmit || submitting) return;
    setSubmitting(true);
    try {
      const params: any = {
        feedbackId: detailInfo.id,
        evaluationContent: detailInfo.evaluationContent || '',
      };
      evaluation.forEach(item => {
        params[item.key] = item.count || 0;
      });
      const res = await submitOpinionEvaluate(params);
      const code = (res as any)?.code ?? (res as any)?.status;
      if (String(code) === '200') {
        showToast('提交成功');
        loadDetail();
      } else {
        showToast((res as any)?.message || '提交失败');
      }
    } catch (e) {
      showToast('提交失败');
    } finally {
      setSubmitting(false);
    }
  }, [detailInfo, canSubmit, submitting, evaluation, loadDetail]);

  if (!detailInfo) {
    return (
      <PageContainer
        backgroundColor="#F6F7FA"
        statusBarStyle="dark-content"
        statusBarBackgroundColor="#FFFFFF"
        safeAreaEdges={['top', 'bottom']}
        pageNavProps={{
          text: '服务单详情',
          showBack: true,
          background: '#FFFFFF',
        }}
        loading
      >
        <View />
      </PageContainer>
    );
  }

  const statusText = STATUS_TEXT[detailInfo.status] ?? '';

  return (
    <PageContainer
      backgroundColor="#F6F7FA"
      statusBarStyle="dark-content"
      statusBarBackgroundColor="#FFFFFF"
      safeAreaEdges={['top', 'bottom']}
      pageNavProps={{
        text: '服务单详情',
        showBack: true,
        background: '#FFFFFF',
      }}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* 基本信息 */}
        <View style={styles.section}>
          <View style={styles.titleRow}>
            <Text style={styles.toastText}>基本信息</Text>
            <Text
              style={[
                styles.toastTextRight,
                detailInfo.status === 1 && styles.processingColor,
                detailInfo.status === 2 && styles.processedColor,
              ]}
            >
              {statusText}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>反馈编号</Text>
            <Text style={styles.value}>{detailInfo.feedbackNo}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>反馈号码</Text>
            <Text style={styles.value}>{detailInfo.userMobile}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>反馈时间</Text>
            <Text style={styles.value}>
              {detailInfo.feedbackTime
                ? dayjs(detailInfo.feedbackTime).format('YYYY-MM-DD HH:mm')
                : ''}
            </Text>
          </View>
        </View>

        {/* 处理进度 */}
        <View style={styles.section}>
          <Text style={[styles.toastText, { marginBottom: 12, marginTop: 24 }]}>
            处理进度
          </Text>

          {/* 节点1：已处理 */}
          <View style={styles.timelineItem}>
            <View style={styles.timelineLeft}>
              <View style={[styles.circle, styles.circleBlack]} />
              <View style={styles.line} />
            </View>
            <View style={styles.timelineRight}>
              <View style={styles.progressHeader}>
                <Text style={styles.label}>{statusText}</Text>
                <Text style={styles.value}>
                  {detailInfo.handleTime
                    ? dayjs(detailInfo.handleTime).format('YYYY-MM-DD HH:mm')
                    : ''}
                </Text>
              </View>
              {detailInfo.status === 2 && (
                <View style={styles.feedbackContent}>
                  <Text>{detailInfo.handleResult || ''}</Text>
                </View>
              )}
            </View>
          </View>

          {/* 节点2：反馈已提交 */}
          <View style={styles.timelineItem}>
            <View style={styles.timelineLeft}>
              <View style={[styles.circle, styles.circleGray]} />
            </View>
            <View style={styles.timelineRight}>
              <View style={styles.progressHeader}>
                <Text style={styles.label}>反馈已提交</Text>
                <Text style={styles.value}>
                  {detailInfo.feedbackTime
                    ? dayjs(detailInfo.feedbackTime).format('YYYY-MM-DD HH:mm')
                    : ''}
                </Text>
              </View>
              <View style={styles.feedbackContent}>
                <Text>{detailInfo.content || ''}</Text>
                {detailInfo.images?.length ? (
                  <View style={styles.feedbackImageRow}>
                    {detailInfo.images.map((img, idx) => (
                      <Image
                        key={`${img}-${idx}`}
                        source={{ uri: img }}
                        style={styles.feedbackImage}
                        resizeMode="cover"
                      />
                    ))}
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        </View>

        {/* 评价 */}
        {detailInfo.status === 2 && (
          <View style={styles.evaluateBox}>
            <Flex style={styles.evaluateContentBox}>
              <Text style={styles.evaluateTitle}>请对本次服务进行评价</Text>

              {evaluation.map((item, index) => (
                <View key={item.key} style={styles.starsRow}>
                  <Text style={styles.starLabel}>{item.label}</Text>
                  {new Array(5).fill(0).map((_, i) => {
                    const active = i < item.count;
                    return (
                      <TouchableOpacity
                        key={i}
                        activeOpacity={0.8}
                        onPress={() => handleStarPress(index, i + 1)}
                        disabled={detailInfo.evaluationFlag}
                      >
                        <Text
                          style={[
                            styles.star,
                            active ? styles.starActive : styles.starInactive,
                          ]}
                        >
                          ★
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                  {item.count > 0 && (
                    <Text style={styles.starText}>{STAR_TEXT[item.count - 1]}</Text>
                  )}
                </View>
              ))}

              <View style={styles.evaluateInputBox}>
                <TextInput
                  style={styles.evaluateInput}
                  value={detailInfo.evaluationContent || ''}
                  onChangeText={text => {
                    if (detailInfo.evaluationFlag) return;
                    setDetailInfo(prev =>
                      prev ? { ...prev, evaluationContent: text } : prev,
                    );
                    setTextLength(text.length);
                  }}
                  placeholder="可填写补充内容文字"
                  placeholderTextColor="#CCCCCC"
                  maxLength={140}
                  multiline
                  editable={!detailInfo.evaluationFlag}
                />
                <Text style={styles.lengthToast}>{`${textLength}/140`}</Text>
              </View>
            </Flex>
          </View>
        )}

        {!detailInfo.evaluationFlag && (
          <View style={styles.evaluateFooter}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSubmitEvaluate}
              disabled={!canSubmit || submitting}
              style={[
                styles.evaluateBtn,
                canSubmit && !submitting && styles.evaluateBtnActive,
              ]}
            >
              <Text style={styles.evaluateBtnText}>提交</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </PageContainer>
  );
}
