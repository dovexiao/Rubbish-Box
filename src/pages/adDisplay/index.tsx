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
import Video from 'react-native-video';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import { PageContainer, Flex } from '@/components';
import AppIcon from '@/components/AppIcon';
import { getBannerDetails, updateBannerDetails } from '@/services/user';
import { hideLoading, showLoading, showToast, tencentUpload } from '@/utils';
import styles from './styles';
import PopConfirm from '@/components/popConfirm';

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const popConfirmRef = useRef<any>(null);
  const screenWidth = Dimensions.get('window').width;
  const carouselWidth = screenWidth - 32;
  const carouselHeight = 170;
  const carouselRef = useRef<ScrollView>(null);
  const [isDragging, setIsDragging] = useState(false);

  const itemList = useMemo(() => {
    const list: string[] = [...bannerImageUrls];
    if (bannerText?.trim()) list.unshift(bannerText.trim());
    return list;
  }, [bannerImageUrls, bannerText]);

  const renderList = useMemo(() => {
    if (itemList.length <= 1) return itemList;
    return [itemList[itemList.length - 1], ...itemList, itemList[0]];
  }, [itemList]);

  useEffect(() => {
    if (itemList.length > 1) {
      if (currentIndex >= itemList.length) {
        setCurrentIndex(0);
        setTimeout(() => {
          carouselRef.current?.scrollTo({ x: carouselWidth, animated: false });
        }, 10);
      }
    } else if (itemList.length > 0) {
      if (currentIndex >= itemList.length) {
        setCurrentIndex(0);
        setTimeout(() => {
          carouselRef.current?.scrollTo({ x: 0, animated: false });
        }, 10);
      }
    }
  }, [itemList.length, currentIndex, carouselWidth]);

  // Initial layout align
  useEffect(() => {
    if (itemList.length > 1 && currentIndex === 0) {
      // Small timeout ensures layout has finished calculation
      setTimeout(() => {
        carouselRef.current?.scrollTo({ x: carouselWidth, animated: false });
      }, 50);
    }
  }, [itemList.length]); // trigger when list structure formed

  useEffect(() => {
    if (itemList.length <= 1 || isDragging) return;
    const item = itemList[currentIndex];
    const isVideo = item?.endsWith?.('.mp4');

    let timer: ReturnType<typeof setTimeout>;
    let jumpTimer: ReturnType<typeof setTimeout>;
    if (!isVideo) {
      timer = setTimeout(() => {
        const nextRenderIndex = currentIndex + 2;
        carouselRef.current?.scrollTo({
          x: nextRenderIndex * carouselWidth,
          animated: true,
        });

        let newCurrentIndex = currentIndex + 1;
        if (newCurrentIndex >= itemList.length) {
          newCurrentIndex = 0;
          jumpTimer = setTimeout(() => {
            // jump silently to real first
            carouselRef.current?.scrollTo({
              x: carouselWidth,
              animated: false,
            });
          }, 350); // wait for animated scroll
        }
        setCurrentIndex(newCurrentIndex);
      }, 2000);
    }

    return () => {
      if (timer) clearTimeout(timer);
      if (jumpTimer) clearTimeout(jumpTimer);
    };
  }, [currentIndex, itemList, carouselWidth, isDragging]);

  const handleVideoEnd = useCallback(() => {
    if (itemList.length <= 1) return;
    const nextRenderIndex = currentIndex + 2;
    carouselRef.current?.scrollTo({
      x: nextRenderIndex * carouselWidth,
      animated: true,
    });

    let newCurrentIndex = currentIndex + 1;
    if (newCurrentIndex >= itemList.length) {
      newCurrentIndex = 0;
      setTimeout(() => {
        carouselRef.current?.scrollTo({ x: carouselWidth, animated: false });
      }, 350);
    }
    setCurrentIndex(newCurrentIndex);
  }, [currentIndex, itemList, carouselWidth]);

  const handleMomentumScrollEnd = useCallback(
    (e: any) => {
      setIsDragging(false);
      if (itemList.length <= 1) return;

      const offsetX = e.nativeEvent.contentOffset.x;
      let index = Math.round(offsetX / carouselWidth);

      if (index === 0) {
        // swipe left to fake last -> jump silently to real last
        index = itemList.length;
        carouselRef.current?.scrollTo({
          x: index * carouselWidth,
          animated: false,
        });
      } else if (index === itemList.length + 1) {
        // swipe right to fake first -> jump silently to real first
        index = 1;
        carouselRef.current?.scrollTo({
          x: index * carouselWidth,
          animated: false,
        });
      }

      setCurrentIndex(index - 1);
    },
    [carouselWidth, itemList.length],
  );

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

            {itemList.length > 0 && (
              <>
                <ScrollView
                  ref={carouselRef}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onScrollBeginDrag={() => setIsDragging(true)}
                  onMomentumScrollEnd={handleMomentumScrollEnd}
                  contentOffset={
                    itemList.length > 1 ? { x: carouselWidth, y: 0 } : undefined
                  }
                  style={[
                    styles.swiperBox,
                    { width: carouselWidth, height: carouselHeight },
                  ]}
                >
                  {renderList.map((item, renderIndex) => {
                    const isFocused =
                      itemList.length <= 1
                        ? renderIndex === 0
                        : renderIndex === currentIndex + 1;

                    return (
                      <View
                        key={renderIndex}
                        style={[
                          styles.swiperItem,
                          { width: carouselWidth, height: carouselHeight },
                        ]}
                      >
                        {item.endsWith?.('.mp4') ? (
                          isFocused ? (
                            <Video
                              source={{ uri: item }}
                              style={{ width: '100%', height: '100%' }}
                              resizeMode="cover"
                              repeat={false}
                              paused={false}
                              onEnd={handleVideoEnd}
                            />
                          ) : (
                            <View style={styles.videoPlaceholder}>
                              <AppIcon name="play" size={40} color="#fff" />
                              <Text style={{ color: '#fff', marginTop: 8 }}>
                                视频
                              </Text>
                            </View>
                          )
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
                    );
                  })}
                </ScrollView>
                <View style={styles.dotWrap}>
                  {itemList.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.dot,
                        {
                          backgroundColor:
                            currentIndex === index
                              ? '#333333'
                              : 'rgba(0,0,0,0.2)',
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
            <AppIcon name="camera" size={24} color="#CCCCCC" />
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
                  <AppIcon name="play" size={20} color="#fff" />
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
        <View style={{ height: 50 }} />
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
