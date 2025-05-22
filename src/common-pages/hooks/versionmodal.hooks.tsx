import {useModal} from '@basicComponents/modal';
import Text from '@basicComponents/text';
import {NativeTouchableOpacity} from '@basicComponents/touchable-opacity';
import theme from '@style';

import {VersionInfo, checkVersion} from '@/app.service';
import React, {useEffect} from 'react';
import {BackHandler, Linking, View, Image} from 'react-native';
import globalStore from '@/services/global.state';
import {useTranslation} from 'react-i18next';

export function useVersionModal(
  autoCheckVersion?: boolean,
  afterCheck?: (res?: VersionInfo) => void,
  showTip = true,
) {
  const {i18n} = useTranslation();
  const [versionInfo, setVersionInfo] = React.useState<VersionInfo | null>(
    null,
  );
  /** 是否需要更新 */
  const versionModal = useModal(
    <View
      style={[
        theme.flex.col,
        theme.flex.centerByCol,
        // eslint-disable-next-line react-native/no-inline-styles
        {
          minWidth: 260,
          maxWidth: 320,
          paddingTop: 23,
          backgroundColor: theme.backgroundColor.mediumblue,
          // backgroundColor: theme.basicColor.primary,
        },
      ]}>
      {versionInfo && (
        <Image
          source={{uri: versionInfo.popBack}}
          // eslint-disable-next-line react-native/no-inline-styles
          style={{
            width: '100%',
            aspectRatio: 260 / 148.5,
            resizeMode: 'contain',
          }}
        />
      )}
      <View style={[theme.fill.fillW, theme.padding.l]}>
        <Text size="medium" color={theme.basicColor.white}>
          {versionInfo?.levelContent}
        </Text>
        <View style={[theme.margin.topl, theme.flex.row, theme.fill.fillW]}>
          <View style={theme.flex.flex1} />
          <View>
            <NativeTouchableOpacity
              onPress={() => {
                Linking.openURL(versionInfo!.downUrl);
              }}>
              <Text
                size="large"
                textAlign="right"
                main
                style={[{color: '#F3E751'}]}>
                {i18n.t('label.download')}
              </Text>
            </NativeTouchableOpacity>
            <NativeTouchableOpacity
              onPress={() => {
                if (versionInfo?.levelUp === 3) {
                  BackHandler.exitApp();
                } else {
                  versionModal.hide();
                }
              }}
              style={[theme.margin.topm]}>
              <Text size="large" secAccent textAlign="right">
                {i18n.t('label.cancel')}
              </Text>
            </NativeTouchableOpacity>
          </View>
        </View>
      </View>
    </View>,
    {
      backDropClose: false,
      overlayStyle: {
        padding: 0,
        ...theme.borderRadius.m,
        ...theme.overflow.hidden,
        ...theme.margin.lrxxl,
      },
    },
  );

  useEffect(() => {
    if (globalStore.isAndroid && autoCheckVersion) {
      checkVersion()
        .then(res => {
          if (res) {
            setVersionInfo(res);
            versionModal.show();
          }
          afterCheck?.(res);
        })
        .catch(() => {
          afterCheck?.();
        });
    } else {
      afterCheck?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoCheckVersion]);

  const handleUpdate = () => {
    showTip && globalStore.globalLoading.next(true);
    checkVersion()
      .then(res => {
        if (res) {
          setVersionInfo(res);
          versionModal.show();
        } else if (showTip) {
          globalStore.globalTotal.next({
            type: 'success',
            message: i18n.t('no-update'),
          });
        }
      })
      .finally(() => {
        showTip && globalStore.globalLoading.next(false);
      });
  };

  return {
    versionModal,
    handleUpdate,
  };
}
