import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  ScrollView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import { PageContainer, Flex, MediaCarousel } from '@/components';
import AppIcon from '@/components/AppIcon';
import { getBannerDetails, updateBannerDetails } from '@/services/user';
import { hideLoading, showLoading, showToast, tencentUpload } from '@/utils';
import styles from './styles';
import PopConfirm from '@/components/popConfirm';
import { px } from '@/utils/ui';

let RNFS: any = null;
if (Platform.OS === 'ios' || Platform.OS === 'android') {
  RNFS = require('react-native-fs');
}

const MAX_TEXT = 100;
const MAX_FILES = 10;
const DEFAULT_BG = 'https://g.18qjz.cn/img/boklock/default_ad_bg.png';

export default function AdDisplay() {
  const navigation = useNavigation<any>();
  const [bannerText, setBannerText] = useState('');
  const [textLength, setTextLength] = useState(0);
  const [bannerImageUrls, setBannerImageUrls] = useState<string[]>([]);
  const [detail, setDetail] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const popConfirmRef = useRef<any>(null);

  const itemList = useMemo(() => {
    const list: string[] = [...bannerImageUrls];
    if (bannerText?.trim()) list.unshift(bannerText.trim());
    return list;
  }, [bannerImageUrls, bannerText]);

  const loadDetail = useCallback(async () => {
    try {
      const res = await getBannerDetails({});
      const data = (res as any).data ?? res;
      const urls = data?.bannerImageUrls ?? [];
      const text = data?.bannerText ?? '';
      setBannerImageUrls(Array.isArray(urls) ? urls : []);
      setBannerText(text || '');
      setTextLength((text || '').length);
      setDetail(data);
    } catch (e) {
      showToast({ title: '获取广告详情失败', icon: 'info' });
    }
  }, []);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const showChooseType = useCallback(() => {
    popConfirmRef.current.open();
  }, []);

  const handleUploadFiles = useCallback(
    async (uris: string[], isVideo: boolean): Promise<string[]> => {
      const results: string[] = [];
      for (let i = 0; i < uris.length; i++) {
        const uri = uris[i];

        // Android 视频通常返回 content://，部分原生上传 SDK 无法直接读取该 URI
        // 先拷贝到缓存目录转换成 file:// 再上传
        let uploadUri = uri;
        if (
          isVideo &&
          Platform.OS === 'android' &&
          typeof uri === 'string' &&
          uri.startsWith('content://')
        ) {
          const destPath = `${
            RNFS.CachesDirectoryPath
          }/upload_video_${Date.now()}_${i}.mp4`;
          try {
            await RNFS.copyFile(uri, destPath);
            uploadUri = `file://${destPath}`;
          } catch (e) {
            console.warn('[upload] copy content:// failed', e);
            uploadUri = uri;
          }
        }

        const rawName = uri.split('/').pop() || '';
        const hasExt = rawName.includes('.') && !rawName.endsWith('.');
        const filename = hasExt
          ? rawName
          : `file_${i}.${isVideo ? 'mp4' : 'jpg'}`;
        const res = await tencentUpload({
          file: uploadUri,
          filename,
          index: i,
        });
        if (res?.data?.Location) {
          results.push(`https://${res.data.Location}`);
        }
      }
      return results;
    },
    [],
  );

  const handleChooseImage = useCallback(async () => {
    const remain = MAX_FILES - bannerImageUrls.length;
    if (remain <= 0) {
      showToast({ title: '最多上传10个文件', icon: 'info' });
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
          showToast({ title: res.errorMessage || '选择失败', icon: 'error' });
          return;
        }
        const assets = res.assets || [];
        const uris = assets.map(a => a.uri).filter(Boolean) as string[];
        if (uris.length === 0) return;
        try {
          showLoading({ title: '上传中...' });
          const list = await handleUploadFiles(uris, false);
          hideLoading();
          setBannerImageUrls(prev => [...prev, ...list].slice(0, MAX_FILES));
        } catch (e) {
          hideLoading();
          showToast({ title: '上传失败，请重试', icon: 'error' });
        }
      },
    );
  }, [bannerImageUrls.length, handleUploadFiles]);

  const handleChooseVideo = useCallback(async () => {
    const remain = MAX_FILES - bannerImageUrls.length;
    if (remain <= 0) {
      showToast({ title: '最多上传10个文件', icon: 'info' });
      return;
    }
    launchImageLibrary(
      {
        mediaType: 'video',
        selectionLimit: 1,
      },
      async res => {
        if (res.didCancel) return;
        if (res.errorCode || res.errorMessage) {
          showToast({ title: res.errorMessage || '选择失败', icon: 'error' });
          return;
        }
        console.log('res', res);
        const assets = res.assets || [];
        const uri = assets[0]?.uri;
        if (!uri) return;
        console.log('uri', uri);
        try {
          showLoading({ title: '上传中...' });
          const list = await handleUploadFiles([uri], true);
          hideLoading();
          setBannerImageUrls(prev => [...prev, ...list].slice(0, MAX_FILES));
        } catch (e) {
          hideLoading();
          showToast({ title: '上传失败，请重试', icon: 'error' });
        }
      },
    );
  }, [bannerImageUrls.length, handleUploadFiles]);

  const removeUrl = useCallback((url: string) => {
    setBannerImageUrls(prev => prev.filter(u => u !== url));
  }, []);

  const handleCreate = useCallback(async () => {
    if (!bannerText?.trim() && bannerImageUrls.length === 0) {
      showToast({ title: '请上传广告图片或文案信息', icon: 'info' });
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await updateBannerDetails({
        bannerImageUrls,
        bannerText: bannerText?.trim() || '',
      });
      if (Number(res?.code) === 200) {
        showToast({ title: '更新广告成功', icon: 'success' });
        navigation.goBack();
      } else {
        showToast({
          title: (res as any)?.message || (res as any)?.msg || '更新失败',
          icon: 'error',
        });
      }
    } catch (e) {
      showToast({ title: '更新失败', icon: 'error' });
    } finally {
      setSubmitting(false);
    }
  }, [bannerText, bannerImageUrls, submitting, navigation]);

  const hasPreview =
    bannerImageUrls.length > 0 || (bannerText?.trim()?.length ?? 0) > 0;

  return (
    <PageContainer
      backgroundColor="#F6F7FA"
      statusBarStyle="dark-content"
      statusBarBackgroundColor="#FFFFFF"
      safeAreaEdges={['top', 'bottom']}
      scrollable
      pageNavProps={{
        text: '广告展示',
        showBack: true,
        background: '#FFFFFF',
      }}
      loading={detail === null && bannerImageUrls.length === 0 && !bannerText}
      footer={
        <View style={styles.pageFooter}>
          <TouchableOpacity
            style={styles.footerBtn}
            onPress={handleCreate}
            disabled={submitting}
            activeOpacity={0.8}
          >
            <Text style={styles.footerBtnText}>确定上传</Text>
          </TouchableOpacity>
        </View>
      }
    >
      <View style={styles.content}>
        {hasPreview && (
          <>
            <Flex style={styles.titleRow} align="center">
              <View style={styles.titleLine} />
              <Text style={styles.titleText}>展示效果</Text>
            </Flex>

            <MediaCarousel itemList={itemList} />

            <Flex
              style={[styles.titleRow, { marginTop: px(16) }]}
              align="center"
            >
              <View style={styles.titleLine} />
              <Text style={styles.titleText}>请上传广告图片</Text>
            </Flex>
          </>
        )}

        <Text style={styles.toastText}>
          图片/视频推荐宽高比例2:1，最大尺寸不超过2000*2000
        </Text>

        <View style={styles.imageList}>
          <TouchableOpacity
            style={[styles.uploaderStyle, styles.imageItem]}
            onPress={showChooseType}
            activeOpacity={0.8}
          >
            <AppIcon name="camera" size={px(24)} color="#CCCCCC" />
            <Text style={styles.uploadText}>相册上传</Text>
            <Text style={styles.uploadText}>({bannerImageUrls.length}/10)</Text>
          </TouchableOpacity>

          {bannerImageUrls.map(url => (
            <View
              key={url}
              style={[styles.imageItem, styles.positionContainer]}
            >
              {url.endsWith?.('.mp4') ? (
                <View
                  style={[
                    styles.imageItem,
                    {
                      backgroundColor: '#333',
                      justifyContent: 'center',
                      alignItems: 'center',
                    },
                  ]}
                >
                  <AppIcon name="play" size={px(20)} color="#fff" />
                </View>
              ) : (
                <Image
                  source={{ uri: url }}
                  style={styles.imageItem}
                  resizeMode="cover"
                />
              )}
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => removeUrl(url)}
              >
                <Image
                  source={{
                    uri: 'https://g.18qjz.cn/img/boklock/delete_image.png',
                  }}
                  style={{ width: px(20), height: px(20) }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <Flex style={[styles.titleRow, { marginTop: px(16) }]} align="center">
          <View style={styles.titleLine} />
          <Text style={styles.titleText}>请上传广告文案</Text>
        </Flex>

        <View style={[styles.problemView, { marginTop: px(12) }]}>
          <TextInput
            style={styles.textArea}
            value={bannerText}
            onChangeText={v => {
              const s = v.length > MAX_TEXT ? v.slice(0, MAX_TEXT) : v;
              setBannerText(s);
              setTextLength(s.length);
            }}
            placeholder="请输入广告文案"
            placeholderTextColor="#999999"
            maxLength={MAX_TEXT}
            multiline
          />
          <Text style={styles.lengthToast}>{`${textLength}/${MAX_TEXT}`}</Text>
        </View>
        <View style={{ height: px(50) }} />
      </View>

      {/* 视频类型 */}
      <PopConfirm
        title="选择类型"
        ref={popConfirmRef}
        confirmText="图片"
        cancelText="视频"
        onConfirm={() => {
          popConfirmRef.current?.close();
          handleChooseImage();
        }}
        onCancel={() => {
          popConfirmRef.current?.close();
          handleChooseVideo();
        }}
      ></PopConfirm>
    </PageContainer>
  );
}
