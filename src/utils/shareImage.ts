import { captureRef } from 'react-native-view-shot';
import { RefObject } from 'react';
import { shareMiniProgram } from 'react-native-wechat-lib';
import { Platform } from 'react-native';
import { DetailsProp } from '@/pages/vip/type';
import { showToast, showLoading, hideLoading } from '@/utils';

interface ShareImageOptions {
  details: DetailsProp;
  width?: number;
  height?: number;
  ref?: RefObject<any>;
}
export const generateShareImage = async (
  options: ShareImageOptions,
): Promise<string> => {
  const { details, width = 750, height = 600, ref } = options;
  if (ref) {
    try {
      return await captureRef(ref, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });
    } catch (error) {
      console.error('生成分享图片失败:', error);
      showToast({ title: '生成分享图片失败', icon: 'none' });
      throw error;
    }
  } else {
    return '';
  }
};

export const onShareAppMessage = async ({
  title,
  imageUrl,
  path,
}: {
  title: string;
  imageUrl: string;
  path?: string;
}) => {
  if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
    return;
  }

  if (typeof shareMiniProgram !== 'function') {
    return;
  }

  await shareMiniProgram({
    userName: 'gh_00245e3a7d08',
    path: path || `/pages/index/index`,
    webpageUrl: 'https://your-domain.com/fallback.html',
    scene: 0,
    miniProgramType: process.env.DEPLOY_ENV === 'dev' ? 2 : 0, // 0 正式版 1 测试版 2 体验版
    title,
    thumbImageUrl: imageUrl,
  });
};
