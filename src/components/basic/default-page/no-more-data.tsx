import {View} from 'react-native';
import Text from '@basicComponents/text';
import theme from '@style';
import React from 'react';
import {useTranslation} from 'react-i18next';

const NoMoreData = (props: {text?: string}) => {
  const {i18n} = useTranslation();
  const {text = i18n.t('defaultPage.noMore')} = props;
  return (
    <View style={[theme.flex.center, theme.padding.tbl]}>
      <Text
        fontSize={theme.fontSize.m}
        style={[theme.font.secAccent, theme.margin.tbl]}>
        {text}
      </Text>
    </View>
  );
};

export default NoMoreData;
