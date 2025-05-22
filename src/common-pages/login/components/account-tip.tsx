import theme from '@style';
import React from 'react';
import Text from '@basicComponents/text';
import {View} from 'react-native';
import TouchableOpacity from '@basicComponents/touchable-opacity';
import {useTranslation} from 'react-i18next';

const AccountTip = (props: {
  tip: string;
  linkTip: string;
  onPressLink?: () => void;
}) => {
  const {i18n} = useTranslation();
  const {tip, linkTip, onPressLink} = props;
  return (
    <View
      style={[
        theme.flex.row,
        theme.flex.alignEnd,
        theme.flex.centerByRow,
        theme.padding.l,
      ]}>
      <Text
        size="large"
        color={theme.fontColor.primaryMain}
        fontSize={theme.fontSize.l}>
        {i18n.t(tip)}
      </Text>
      <TouchableOpacity
        onPress={onPressLink}
        containerStyle={theme.padding.leftxxs}>
        <Text
          size="medium"
          blod
          style={[
            // eslint-disable-next-line react-native/no-inline-styles
            {
              textDecorationLine: 'underline',
            },
          ]}
          color={theme.fontColor.white}>
          {i18n.t(linkTip)}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default AccountTip;
