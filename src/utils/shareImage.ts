import { captureRef } from 'react-native-view-shot';
import { RefObject } from 'react';
import { Platform, AppState } from 'react-native';
import { DEPLOY_ENV } from '@/config';
import type { DetailsProp } from '@/pages/vip/type';
import { showToast, showLoading, hideLoading } from '@/utils';
import {
  hasWeChatShareCapability,
  shareWeChatMiniProgram,
} from '@/utils/wechat';

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
        format: 'jpg',
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
  const isHarmony = Platform.OS !== 'android' && Platform.OS !== 'ios';
  if (Platform.OS !== 'android' && Platform.OS !== 'ios' && !isHarmony) {
    return;
  }

  if (!hasWeChatShareCapability()) {
    return;
  }

  let previousState = AppState.currentState;
  const appStateListener = AppState.addEventListener('change', state => {
    if (
      (previousState === 'background' || previousState === 'inactive') &&
      state === 'active'
    ) {
      // 用户从微信返回时，尽快恢复 UI，避免长时间 loading
      hideLoading();
      showToast({
        title: '已返回应用，若微信未登录请重新登录后重试',
        icon: 'none',
      });
    }

    previousState = state;
  });

  showLoading({ title: '拉起微信中...' });
  try {
    const timeoutMs = 5000;
    const shareResult = await Promise.race([
      shareWeChatMiniProgram({
        userName: 'gh_00245e3a7d08',
        path: path || `/pages/index/index`,
        webpageUrl: 'https://your-domain.com/fallback.html',
        scene: 0,
        miniProgramType: DEPLOY_ENV === 'dev' ? 2 : 0, // 0 正式版 1 测试版 2 体验版
        title,
        thumbImageUrl: imageUrl,
      }),
      new Promise<any>((_, reject) =>
        setTimeout(() => reject(new Error('微信分享超时，请重试')), timeoutMs),
      ),
    ]);

    console.log('微信分享结果:', shareResult);

    if (
      shareResult &&
      typeof shareResult === 'object' &&
      'errCode' in shareResult
    ) {
      const errCode = shareResult.errCode;
      if (errCode === -2) {
        showToast({ title: '已取消分享', icon: 'none' });
        return shareResult;
      }
      if (errCode !== 0) {
        throw new Error(
          `微信分享失败，错误码：${errCode} ${shareResult.errStr || ''}`,
        );
      }
    }

    return shareResult;
  } catch (error: any) {
    const message =
      error?.message || '微信分享失败，请关闭微信后重试（可能未登录）';
    showToast({ title: message, icon: 'error' });
    throw error;
  } finally {
    appStateListener.remove();
    hideLoading();
  }
};
