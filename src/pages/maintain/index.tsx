import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import { PageContainer } from '@/components';
import AppIcon from '@/components/AppIcon';
import { repairAdd } from '@/services/user';
import { showToast, tencentUpload } from '@/utils';
import styles from './styles';

const MAX_LENGTH = 140;
const MAX_IMAGES = 10;

export default function Maintain() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const lockId = route.params?.lockId;
  const lockName = route.params?.lockName ?? '';

  const [description, setDescription] = useState('');
  const [textLength, setTextLength] = useState(0);
  const [imageList, setImageList] = useState<string[]>([]);
  const [localUris, setLocalUris] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const selectedLock = lockId != null ? { id: lockId, lockName } : null;

  const canSubmit =
    selectedLock?.id &&
    textLength > 0 &&
    (imageList.length > 0 || localUris.length > 0);

  const handleChooseImage = useCallback(() => {
    const remain = MAX_IMAGES - (imageList.length + localUris.length);
    if (remain <= 0) {
      showToast(`最多上传${MAX_IMAGES}张图片`);
      return;
    }
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: remain,
        quality: 0.8,
      },
      res => {
        if (res.didCancel) return;
        if (res.errorCode || res.errorMessage) {
          showToast(res.errorMessage || '选择图片失败');
          return;
        }
        const assets = res.assets || [];
        const uris = assets.map(a => a.uri).filter(Boolean) as string[];
        if (uris.length) setLocalUris(prev => [...prev, ...uris]);
      },
    );
  }, [imageList.length, localUris.length]);

  const removeLocalImage = useCallback((uri: string) => {
    setLocalUris(prev => prev.filter(u => u !== uri));
  }, []);

  const uploadImages = useCallback(
    async (uris: string[]): Promise<string[]> => {
      const results: string[] = [];
      for (let i = 0; i < uris.length; i++) {
        const uri = uris[i];
        const filename = uri.split('/').pop() || `image_${i}.jpg`;
        try {
          const res = await tencentUpload({
            file: uri,
            filename,
            index: i,
          });
          if (res?.data?.Location) {
            results.push(`https://${res.data.Location}`);
          }
        } catch (e) {
          showToast('图片上传失败');
          throw e;
        }
      }
      return results;
    },
    [],
  );

  const handleCreate = useCallback(async () => {
    if (!canSubmit || submitting) return;
    if (!selectedLock?.id) {
      showToast('请选择报修设备');
      return;
    }
    if (!description.trim()) {
      showToast('请描述问题');
      return;
    }

    setSubmitting(true);
    try {
      let picList: string[] = [...imageList];
      if (localUris.length > 0) {
        const uploaded = await uploadImages(localUris);
        picList = [...picList, ...uploaded];
      }
      const res = await repairAdd({
        lockId: selectedLock.id,
        problemDescription: description.trim(),
        picList,
      });
      if (Number(res?.code) === 200) {
        showToast('提交报修成功');
        setDescription('');
        setTextLength(0);
        setImageList([]);
        setLocalUris([]);
        navigation.navigate('MaintainService');
      } else {
        showToast(res?.message || res?.msg || '提交失败');
      }
    } catch (e) {
      showToast('提交失败');
    } finally {
      setSubmitting(false);
    }
  }, [
    canSubmit,
    submitting,
    selectedLock,
    description,
    imageList,
    localUris,
    uploadImages,
    navigation,
  ]);

  return (
    <PageContainer
      backgroundColor="#F6F7FA"
      statusBarStyle="dark-content"
      statusBarBackgroundColor="#FFFFFF"
      safeAreaEdges={['top', 'bottom']}
      scrollable={Platform.OS === 'ios'}
      pageNavProps={{
        text: '在线报修',
        showBack: true,
        background: '#FFFFFF',
        rightContent: (
          <TouchableOpacity
            style={styles.titleRight}
            onPress={() => navigation.navigate('MaintainService')}
            activeOpacity={0.8}
          >
            <Text style={styles.titleText}>服务记录</Text>
            <AppIcon name="a-headfor-12" color="#333333" size={16} />
          </TouchableOpacity>
        ),
      }}
      footer={
        <View style={styles.pageFooter}>
          <TouchableOpacity
            style={[styles.footerBtn, !canSubmit && styles.footerBtnDisabled]}
            onPress={canSubmit ? handleCreate : undefined}
            disabled={!canSubmit || submitting}
            activeOpacity={0.8}
          >
            <Text style={styles.footerBtnText}>提交报修</Text>
          </TouchableOpacity>
        </View>
      }
    >
      <View style={styles.container}>
        <Text style={[styles.toastTitle, styles.chooseViewTitle]}>
          选择报修设备
        </Text>
        <TouchableOpacity
          style={styles.chooseView}
          onPress={() => navigation.navigate('MaintainLockChoose', { lockId })}
          activeOpacity={0.8}
        >
          {selectedLock?.lockName ? (
            <Text style={styles.selectedText}>{selectedLock.lockName}</Text>
          ) : (
            <Text style={styles.chooseText}>请选择</Text>
          )}
          <AppIcon name="a-headfor-20" size={20} color="#333333" />
        </TouchableOpacity>
        <View style={styles.problemView}>
          <Text style={styles.toastTitle}>请描述您的问题</Text>
          <TextInput
            style={styles.textArea}
            value={description}
            onChangeText={v => {
              setDescription(v.slice(0, MAX_LENGTH));
              setTextLength(v.length);
            }}
            placeholder="为了更好地服务您，请输入地锁的故障描述，您可以：“地锁的XX部位出现了XX问题”"
            placeholderTextColor="#CCCCCC"
            maxLength={MAX_LENGTH}
            multiline
          />
          <Text
            style={styles.lengthToast}
          >{`${textLength}/${MAX_LENGTH}`}</Text>

          <Text
            style={[styles.toastTitle, { marginTop: 16, marginBottom: 12 }]}
          >
            上传图片
          </Text>
          <View style={styles.imageList}>
            <TouchableOpacity
              style={[styles.uploaderStyle, styles.imageItem]}
              onPress={handleChooseImage}
              activeOpacity={0.8}
            >
              <AppIcon name="camera" size={24} color="#CCCCCC" />
              <Text style={styles.uploadText}>相册上传</Text>
            </TouchableOpacity>
            {imageList.map(uri => (
              <View
                key={uri}
                style={[styles.imageItem, styles.positionContainer]}
              >
                <Image
                  source={{ uri }}
                  style={styles.imageItem}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() =>
                    setImageList(prev => prev.filter(u => u !== uri))
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
            {localUris.map(uri => (
              <View
                key={uri}
                style={[styles.imageItem, styles.positionContainer]}
              >
                <Image
                  source={{ uri }}
                  style={styles.imageItem}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => removeLocalImage(uri)}
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
      </View>
    </PageContainer>
  );
}
