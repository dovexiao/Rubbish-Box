import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Carousel, Toast } from '@ant-design/react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { PageContainer, Flex } from '@/components';
import IconFont from '@/iconfont';
import { getBannerDetails, updateBannerDetails } from '@/services/user';
import { tencentUpload } from '@/utils';
import styles from './styles';

const MAX_TEXT = 100;
const MAX_FILES = 10;
const DEFAULT_BG = 'https://g.18qjz.cn/img/boklock/default_ad_bg.png';

export default function AdDisplay() {
  const navigation = useNavigation<any>();
  const [bannerText, setBannerText] = useState('');
  const [textLength, setTextLength] = useState(0);
  const [bannerImageUrls, setBannerImageUrls] = useState<string[]>([]);
  const [detail, setDetail] = useState<any>(null);
  const [current, setCurrent] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const itemList = useMemo(() => {
    const list: string[] = [...bannerImageUrls];
    if (bannerText?.trim()) list.push(bannerText.trim());
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
      Toast.fail('获取广告信息失败');
    }
  }, []);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const showChooseType = useCallback(() => {
    Alert.alert('选择类型', '', [
      { text: '取消', style: 'cancel' },
      {
        text: '图片',
        onPress: () => handleChooseImage(),
      },
      {
        text: '视频',
        onPress: () => handleChooseVideo(),
      },
    ]);
  }, []);

  const handleUploadFiles = useCallback(
    async (uris: string[], isVideo: boolean): Promise<string[]> => {
      const results: string[] = [];
      for (let i = 0; i < uris.length; i++) {
        const uri = uris[i];
        const filename =
          uri.split('/').pop() || `file_${i}.${isVideo ? 'mp4' : 'jpg'}`;
        const res = await tencentUpload({
          file: uri,
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
      Toast.fail('最多上传10个文件');
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
          Toast.fail(res.errorMessage || '选择失败');
          return;
        }
        const assets = res.assets || [];
        const uris = assets.map(a => a.uri).filter(Boolean) as string[];
        if (uris.length === 0) return;
        try {
          Toast.loading('上传中...', 0);
          const list = await handleUploadFiles(uris, false);
          Toast.removeAll();
          setBannerImageUrls(prev => [...prev, ...list].slice(0, MAX_FILES));
        } catch (e) {
          Toast.removeAll();
          Toast.fail('上传失败，请重试');
        }
      },
    );
  }, [bannerImageUrls.length, handleUploadFiles]);

  const handleChooseVideo = useCallback(async () => {
    const remain = MAX_FILES - bannerImageUrls.length;
    if (remain <= 0) {
      Toast.fail('最多上传10个文件');
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
          Toast.fail(res.errorMessage || '选择失败');
          return;
        }
        const assets = res.assets || [];
        const uri = assets[0]?.uri;
        if (!uri) return;
        try {
          Toast.loading('上传中...', 0);
          const list = await handleUploadFiles([uri], true);
          Toast.removeAll();
          setBannerImageUrls(prev => [...prev, ...list].slice(0, MAX_FILES));
        } catch (e) {
          Toast.removeAll();
          Toast.fail('上传失败，请重试');
        }
      },
    );
  }, [bannerImageUrls.length, handleUploadFiles]);

  const removeUrl = useCallback((url: string) => {
    setBannerImageUrls(prev => prev.filter(u => u !== url));
  }, []);

  const handleCreate = useCallback(async () => {
    if (!bannerText?.trim() && bannerImageUrls.length === 0) {
      Toast.fail('请上传广告图片或文案信息');
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
        Toast.success('更新广告成功');
        navigation.goBack();
      } else {
        Toast.fail((res as any)?.message || (res as any)?.msg || '更新失败');
      }
    } catch (e) {
      Toast.fail('更新失败');
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

            {itemList.length > 0 && (
              <>
                <Carousel
                  style={[
                    styles.swiperBox,
                    { width: Dimensions.get('window').width - 32 },
                  ]}
                  autoplay
                  autoplayInterval={2000}
                  dots={false}
                  afterChange={index => setCurrent(index)}
                  infinite
                >
                  {itemList.map((item, index) => (
                    <View key={`${item}-${index}`} style={styles.swiperItem}>
                      {item.endsWith?.('.mp4') ? (
                        <View style={styles.videoPlaceholder}>
                          <IconFont name="play" size={40} color="#fff" />
                          <Text style={{ color: '#fff', marginTop: 8 }}>
                            视频
                          </Text>
                        </View>
                      ) : /\.(png|jpe?g|webp|gif)$/i.test(item) ? (
                        <Image
                          source={{ uri: item }}
                          style={{ width: '100%', height: '100%' }}
                          resizeMode="cover"
                        />
                      ) : (
                        <>
                          <Image
                            source={{ uri: DEFAULT_BG }}
                            style={{ width: '100%', height: '100%' }}
                            resizeMode="cover"
                          />
                          <View style={styles.bannerTextBox}>
                            <Text style={styles.adText}>{item}</Text>
                          </View>
                        </>
                      )}
                    </View>
                  ))}
                </Carousel>
                <View style={styles.dotWrap}>
                  {itemList.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.dot,
                        {
                          backgroundColor:
                            current === index ? '#333333' : '#000',
                          opacity: current === index ? 1 : 0.2,
                        },
                      ]}
                    />
                  ))}
                </View>
              </>
            )}

            <Flex style={[styles.titleRow, { marginTop: 16 }]} align="center">
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
            <IconFont name="camera" size={24} color="#CCCCCC" />
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
                  <IconFont name="play" size={20} color="#fff" />
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
                  style={{ width: 20, height: 20 }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <Flex style={[styles.titleRow, { marginTop: 16 }]} align="center">
          <View style={styles.titleLine} />
          <Text style={styles.titleText}>请上传广告文案</Text>
        </Flex>

        <View style={[styles.problemView, { marginTop: 12 }]}>
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
      </View>
    </PageContainer>
  );
}
