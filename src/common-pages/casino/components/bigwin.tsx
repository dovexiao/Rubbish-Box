import theme from '@style';
import React from 'react';
import {StyleSheet, View, ViewProps} from 'react-native';
import Text from '@basicComponents/text';
import {useTranslation} from 'react-i18next';

const styles = StyleSheet.create({
  bigwin: {
    paddingVertical: theme.paddingSize.xxs / 2,
    backgroundColor: theme.basicColor.dark,
    borderTopLeftRadius: theme.borderRadiusSize.xs,
    borderBottomRightRadius: theme.borderRadiusSize.xs,
  },
  firstText: {
    marginBottom: -2,
  },
});

const BigWin: React.FC<ViewProps> = props => {
  const {i18n} = useTranslation();
  const {style, ...otherProps} = props;
  return (
    <View
      style={[theme.padding.lrxs, theme.flex.col, styles.bigwin, style]}
      {...otherProps}>
      <Text
        style={[theme.font.white, styles.firstText]}
        fontFamily="fontDin"
        fontSize={8}
        fontWeight="900">
        {i18n.t('casino.big')}
      </Text>
      <Text
        style={[theme.font.white]}
        fontFamily="fontDin"
        fontSize={8}
        fontWeight="900">
        {i18n.t('casino.win')}
      </Text>
    </View>
  );
};

export default BigWin;
