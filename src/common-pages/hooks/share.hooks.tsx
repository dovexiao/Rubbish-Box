import {useRef, useState} from 'react';
import {Share} from 'react-native';
import {getShareInfo, updateInviteCode} from './share.service';
import globalStore from '@/services/global.state';
import {goTo} from '@/utils';
import {SafeAny} from '@/types';
import Clipboard from '@react-native-clipboard/clipboard';
import i18n from '@/i18n';

export function useShare(_autoInit = false) {
  const [code, setCode] = useState<string>('');
  const [invateText, setInviteText] = useState('');
  const throttleRef = useRef(false);

  const copy = (content: string, tip: SafeAny = '') => {
    if (!globalStore.token) {
      goTo('Login');
      return;
    }
    Clipboard.setString(content);
    globalStore.globalSucessTotal(i18n.t('share.copy-success'), tip);
  };

  const onShare = async (message: string) => {
    if (throttleRef.current) {
      return;
    }
    throttleRef.current = true;
    setTimeout(() => {
      throttleRef.current = false;
    }, 300);
    try {
      const result = await Share.share({
        message,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      globalStore.globalTotal.next({
        type: 'warning',
        message: (error as SafeAny)?.message || error,
      });
    }
  };
  const doShare = (tip = '') => {
    // if (!code) {
    //   goTo('Login');
    //   return;
    // }
    if (globalStore.isAndroid) {
      // onShare(`${invateText}?code=${code}`);
      onShare(`${invateText}`);
    } else {
      copyShareLink(tip);
    }
  };

  const copyShareLink = (tip = '') => copy(`${invateText}`, tip);

  const initShare = () => {
    return getShareInfo().then(data => {
      setCode(data.inviteCode);
      setInviteText(data.inviteRegisterLinkUrl);
    });
  };

  const refreshCode = async () => {
    await updateInviteCode();
    await initShare();
  };

  // useEffect(() => {
  //   if (autoInit) {
  //     initShare();
  //   }
  // }, [autoInit]);

  return {
    initShare,
    doShare,
    code,
    refreshCode,
    copyShareLink,
    copy,
  };
}
