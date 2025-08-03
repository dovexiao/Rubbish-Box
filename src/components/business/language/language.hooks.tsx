import theme from '@style';
import {useBottomSheet} from '@basicComponents/modal';
import {TouchableOpacity, View} from 'react-native';
import Text from '@basicComponents/text';
import {languagesMap} from '@i18n';
import LazyImage from '@basicComponents/image';
import React from 'react';
import globalStore from '@services/global.state';
import {useTranslation} from 'react-i18next';
const iconSelected = require('@assets/icons/selected.webp');
const iconClose = require('@components/assets/icons/close.webp');
const {borderRadiusSize, padding, font, flex, margin} = theme;

interface LanguageItem {
  name: string;
  locale: string;
}

export function useLanguageModal({
  afterHidden,
}: {afterHidden?: () => void} = {}) {
  const {i18n} = useTranslation();

  const languageItems: LanguageItem[] = Object.keys(languagesMap).map(key => ({
    name: languagesMap[key],
    locale: key,
  }));

  const handleToggle = (_locale: string) => {
    globalStore.lang = _locale;
    i18n.changeLanguage(_locale);
    hide();
  };
  const {renderModal, show, hide} = useBottomSheet(
    <View style={[padding.s, flex.col, {backgroundColor: '#000'}]}>
      <View style={[flex.row, flex.between, flex.centerByCol]}>
        <Text style={[font.bold, font.m, font.white]}>
          {i18n.t('me.language.switch')}
        </Text>
        <TouchableOpacity activeOpacity={1} onPress={() => hide()}>
          <LazyImage
            occupancy={'transparent'}
            imageUrl={iconClose}
            width={24}
            height={24}
          />
        </TouchableOpacity>
      </View>
      <View style={[flex.col, margin.topl]}>
        {languageItems.map((lang, index) => (
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => handleToggle(lang.locale)}
            key={index}>
            <View
              style={[
                padding.l,
                flex.row,
                flex.between,
                flex.centerByCol,
                // globalStore.lang === lang.locale ? background.primary50 : {},
              ]}>
              <Text style={[font.white, font.m]}>{lang.name}</Text>
              {globalStore.lang === lang.locale ? (
                <LazyImage
                  occupancy={'transparent'}
                  imageUrl={iconSelected}
                  width={12}
                  height={12}
                />
              ) : (
                <View />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>,
    {
      topBorderRadius: borderRadiusSize.m,
      backDropClose: true,
      afterHidden: () => {
        // TODO 这里为了解决首次启动不选语言直接关闭的情况,不太优雅,需要优化
        globalStore.lang = globalStore.lang;
        afterHidden?.();
      },
    },
  );

  return {renderModal, show};
}
