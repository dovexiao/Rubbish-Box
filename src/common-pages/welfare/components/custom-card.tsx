import React from 'react';
import {View} from 'react-native';
import theme from '@/style';
import {useSettingWindowDimensions} from '@/store/useSettingStore';
import Text from '@/components/basic/text';
import LinearGradient from '@/components/basic/linear-gradient';

const CustomCard = (props: {title: string; children: React.ReactNode}) => {
  const {} = useSettingWindowDimensions();

  return (
    <View
      style={[
        theme.margin.topl,
        theme.borderRadius.s,
        theme.background.mainDark,
        theme.border.primary50,
      ]}>
      <LinearGradient
        colors={theme.linearGradientColor.linearGradientBtnColor}
        style={[
          theme.padding.lrl,
          theme.flex.centerByRow,
          // eslint-disable-next-line react-native/no-inline-styles
          {
            height: 38,
            alignSelf: 'flex-start',
            minWidth: '40%',
            borderTopLeftRadius: 6,
            borderBottomRightRadius: 16,
          },
        ]}>
        <Text white fontSize={18} blod>
          {props.title}
        </Text>
      </LinearGradient>
      {props.children}
    </View>
  );
};

export default CustomCard;
