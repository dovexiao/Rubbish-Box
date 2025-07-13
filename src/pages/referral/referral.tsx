import React, {useState} from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from 'react-native';
import Text from '@basicComponents/text';
import theme from '@style';
import {goBack, goTo} from '@utils';
import {getShareInfo} from './referral.service';
import Clipboard from '@react-native-clipboard/clipboard';
import {ToastType, useToast} from '@basicComponents/modal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import globalStore from '@/services/global.state';
import {SafeAny} from '@/types';
import {useFocusEffect} from '@react-navigation/native';
import Skeleton from '@basicComponents/skeleton';
import DetailNavTitle from '@/components/business/detail-nav-title';
import {useTranslation} from 'react-i18next';

const {flex, padding, position, font, background, paddingSize} = theme;

const Referral = () => {
  const {i18n} = useTranslation();
  const [imageHeight, setImageHeight] = useState<number>(0);
  const innerStyles = StyleSheet.create({
    bottomView: {
      bottom: 25,
      left: 0,
      width: '100%',
    },
    largeBorder: {
      borderRadius: 34,
      borderWidth: 2,
      borderColor: '#B557FF',
    },
    button: {
      borderRadius: 30,
      paddingHorizontal: 24,
    },
    buttomButton: {
      width: globalStore.screenWidth - 4 * paddingSize.l,
      height: 48,
      borderRadius: 24,
    },
    buttomButtonText: {
      fontSize: 18,
    },
    image: {
      width: globalStore.screenWidth,
      height: imageHeight,
    },
    skeleton: {
      zIndex: -2,
    },
  });
  const [imageUrl, setImageUrl] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const {renderModal, show} = useToast();
  const [login, setLogin] = useState<boolean>(false);
  const [invateText, setInviteText] = useState('');
  const [loading, setLoading] = useState(true);

  const copy = (content: string) => {
    if (!login) {
      goTo('Login');
      return;
    }
    Clipboard.setString(content);
    show({
      type: ToastType.success,
      message: i18n.t('share.copy-success'),
    });
  };

  const onShare = async (message: string) => {
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

  const copyShareLink = () => {
    if (!code) {
      goTo('Login');
      return;
    }
    if (globalStore.isAndroid) {
      onShare(`${invateText}`);
    } else {
      copy(`${invateText}`);
    }
  };

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const refresh = () => {
    AsyncStorage.getItem('token').then(value => {
      setLogin(!!value);
    });
    getShareInfo().then(data => {
      setImageUrl(data.backgroundPicture);
      setCode(data.inviteCode);
      setInviteText(data.inviteRegisterLinkUrl);
      Image.getSize(data.backgroundPicture, (width, height) => {
        setImageHeight((globalStore.screenWidth / width) * height);
      });
    });
  };
  useFocusEffect(refresh);
  return (
    <View
      style={[
        position.rel,
        theme.fill.fill,
        {
          maxHeight: globalStore.screenHeight,
        },
      ]}>
      <DetailNavTitle
        title={i18n.t('home.tab.referral')}
        hideServer
        hideAmount
        onBack={() => goBack()}
      />
      <View style={[padding.lrxxl, padding.tbs, background.primary]}>
        <View
          style={[
            flex.row,
            flex.between,
            innerStyles.largeBorder,
            padding.rights,
            padding.tbxxs,
            padding.leftxxl,
            flex.centerByCol,
          ]}>
          <View
            style={[
              theme.flex.flex1,
              theme.flex.row,
              theme.flex.centerByCol,
              theme.flex.around,
            ]}>
            {[0, 1, 2, 3, 4, 5].map(v => (
              <Text
                key={v}
                blod
                fontSize={theme.fontSize.xl}
                color={theme.basicColor.white}>
                {code?.[v] || '-'}
              </Text>
            ))}
          </View>
          <Pressable
            style={[padding.tbs, innerStyles.button, theme.background.second]}
            onPress={() => copy(code)}>
            <Text style={[font.white, font.xl, font.bold]}>
              {i18n.t('referral.copy')}
            </Text>
          </Pressable>
        </View>
      </View>
      <ScrollView style={[theme.flex.flex1]}>
        <Skeleton loading={!imageUrl || loading}>
          <Image
            source={{uri: imageUrl}}
            onLoadEnd={handleLoadEnd}
            style={innerStyles.image}
            resizeMode="cover"
          />
        </Skeleton>
      </ScrollView>
      <View
        style={[position.abs, innerStyles.bottomView, padding.lrl, flex.row]}>
        <View style={[padding.lrl]}>
          <Pressable
            onPress={() => copyShareLink()}
            style={[
              innerStyles.buttomButton,
              flex.center,
              theme.background.primary,
            ]}>
            <Text style={[innerStyles.buttomButtonText, font.bold, font.white]}>
              {i18n.t('referral.invite')}
            </Text>
          </Pressable>
        </View>
      </View>
      {renderModal}
    </View>
  );
};

export default Referral;
