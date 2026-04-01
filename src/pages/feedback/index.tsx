import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import { PageContainer, Flex } from '@/components';
import AppIcon from '@/components/AppIcon';
import { getAccountInfo, submitOpinion } from '@/services/user';
import { showToast, tencentUpload } from '@/utils';
import styles from './styles';

const MAX_IMAGES = 4;

function isMobile(mobile: string) {
  return /^1\d{10}$/.test(mobile);
}

export default function Feedback() {
  const navigation = useNavigation<any>();
  const [description, setDescription] = useState('');
  const [imageList, setImageList] = useState<string[]>([]);
  const [userName, setUserName] = useState('');
  const [userMobile, setUserMobile] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(
    () => !!description.trim() && isMobile(userMobile),
    [description, userMobile],
  );

  const loadAccount = useCallback(async () => {
    try {
      const res = await getAccountInfo({});
      const data = (res as any).data ?? res;
      if (data?.adminMobile) {
        setUserMobile(data.adminMobile);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadAccount();
  }, [loadAccount]);

  const handleChooseImage = useCallback(() => {
    const remain = MAX_IMAGES - imageList.length;
    if (remain <= 0) {
      showToast({ title: '最多上传4张图片', icon: 'info' });
      return;
    }
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: remain,
        quality: 0.8,
      },
      async res => {
        if (res.didCancel) return;
        if (res.errorCode || res.errorMessage) {
          showToast({ title: res.errorMessage || '选择失败', icon: 'info' });
          return;
        }
        const assets = res.assets || [];
        const uris = assets.map(a => a.uri).filter(Boolean) as string[];
        if (!uris.length) return;
        setImageList(prev => [...prev, ...uris].slice(0, MAX_IMAGES));
      },
    );
  }, [imageList.length]);

  const handleUploadImages = useCallback(
    async (uris: string[]): Promise<string[]> => {
      const results: string[] = [];
      for (let i = 0; i < uris.length; i++) {
        const uri = uris[i];
        try {
          const res = await tencentUpload({
            file: uri,
            filename: uri.split('/').pop() || `img_${i}.jpg`,
            index: i,
          });
          if (res?.data?.Location) {
            results.push(`https://${res.data.Location}`);
          }
        } catch {
          showToast({ title: '图片上传失败，请重试', icon: 'info' });
          return [];
        }
      }
      return results;
    },
    [],
  );

  const handleSubmit = useCallback(async () => {
    if (!description.trim()) {
      showToast({ title: '请填写反馈内容', icon: 'info' });
      return;
    }
    if (!isMobile(userMobile)) {
      showToast({ title: '请输入正确的手机号', icon: 'info' });
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    try {
      const images = await handleUploadImages(imageList);
      if (!images && imageList.length) {
        setSubmitting(false);
        return;
      }
      await submitOpinion({
        content: description.trim(),
        images,
        userName,
        userMobile,
      });
      showToast({ title: '提交成功', icon: 'success' });
      setDescription('');
      setImageList([]);
      setUserName('');
    } catch {
      showToast({ title: '提交失败，请重试', icon: 'info' });
    } finally {
      setSubmitting(false);
    }
  }, [
    description,
    userMobile,
    userName,
    imageList,
    submitting,
    handleUploadImages,
  ]);

  return (
    <PageContainer
      backgroundColor="#F6F7FA"
      statusBarStyle="dark-content"
      statusBarBackgroundColor="#FFFFFF"
      safeAreaEdges={['top', 'bottom']}
      scrollable={Platform.OS === 'ios'}
      pageNavProps={{
        text: '意见反馈',
        showBack: true,
        background: '#FFFFFF',
        rightContent: (
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.titleRight}
            onPress={() => navigation.navigate('FeedbackRecord')}
          >
            <Text
              style={{ fontSize: 12, color: '#333333', fontWeight: 'bold' }}
            >
              意见反馈记录
            </Text>
            <View>
              <AppIcon name="a-headfor-12" color="#333333" size={16} />
            </View>
          </TouchableOpacity>
        ),
      }}
      footer={
        <Flex
          style={{
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSubmit}
            disabled={!canSubmit || submitting}
            style={[
              styles.footerBtn,
              (!canSubmit || submitting) && styles.footerBtnDisabled,
            ]}
          >
            <Text style={styles.footerBtnText}>提交</Text>
          </TouchableOpacity>
        </Flex>
      }
    >
      <View style={styles.container}>
        <View style={styles.section}>
          <Flex direction="column" style={styles.textAreaContainer}>
            <Text style={styles.sectionTitle}>请填写反馈内容</Text>
            <TextInput
              style={styles.textArea}
              value={description}
              onChangeText={setDescription}
              placeholder="您想对我们说"
              placeholderTextColor="#CCCCCC"
              maxLength={140}
              multiline
            />
            <Text
              style={styles.lengthToast}
            >{`${description.length}/140`}</Text>
          </Flex>
          <Text style={styles.sectionTitle}>
            相关图片上传（{imageList.length}/{MAX_IMAGES}）
          </Text>
          <View style={styles.imageList}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.imageItem, styles.uploader]}
              onPress={handleChooseImage}
            >
              <AppIcon name="camera" size={24} color="#CCCCCC" />
              <Text style={styles.uploaderText}>相册上传</Text>
            </TouchableOpacity>
            {imageList.map(uri => (
              <View key={uri} style={styles.imageItem}>
                <Image
                  source={{ uri }}
                  style={styles.imageItem}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() =>
                    setImageList(prev => prev.filter(item => item !== uri))
                  }
                >
                  <Image
                    source={{
                      uri: 'https://g.18qjz.cn/img/boklock/delete_image.png',
                    }}
                    style={{ width: 20, height: 20 }}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.section, styles.contactSection]}>
          <Text style={styles.sectionTitle}>请留下您的联系方式</Text>
          <View style={styles.contactRow}>
            <Text style={styles.contactLabel}>称呼</Text>
            <TextInput
              style={styles.contactInput}
              value={userName}
              onChangeText={setUserName}
              placeholder="请输入您的称呼"
              placeholderTextColor="#CCCCCC"
              maxLength={20}
            />
          </View>
          <View style={styles.contactRow}>
            <Text style={styles.contactLabel}>手机号</Text>
            <TextInput
              style={styles.contactInput}
              value={userMobile}
              onChangeText={setUserMobile}
              keyboardType="number-pad"
              placeholder="请输入您的手机号"
              placeholderTextColor="#CCCCCC"
              maxLength={11}
            />
          </View>
        </View>
      </View>
    </PageContainer>
  );
}
