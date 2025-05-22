import React from 'react';
import {
  View,
  Image,
  ImageRequireSource,
  StyleProp,
  ViewStyle,
} from 'react-native';
import theme from '@/style';
import {useSettingWindowDimensions} from '@/store/useSettingStore';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import LinearGradient from '@/components/basic/linear-gradient';
import Text from '@basicComponents/text';

interface OptionItem {
  boxStyle?: StyleProp<ViewStyle>;
  source: ImageRequireSource;
  title: string;
  colors: string[];
  amount: number;
}

interface TotalAmountButtonProps {
  containerStyle?: StyleProp<ViewStyle>;
  optionList: OptionItem[];
  note?: string;
}

const TotalAmountButton = (props: TotalAmountButtonProps) => {
  const {containerStyle, optionList, note = ''} = props;
  const {} = useSettingWindowDimensions();

  const renderBtn = ({boxStyle, source, title, colors, amount}: OptionItem) => {
    return (
      <NativeTouchableOpacity
        key={title}
        style={[theme.flex.flex1, {height: 70}, boxStyle]}>
        <LinearGradient
          style={[
            theme.flex.flex1,
            theme.borderRadius.l,
            theme.flex.centerByRow,
            theme.padding.lrl,
            theme.border.white20,
          ]}
          colors={colors}>
          <View
            style={[
              theme.flex.row,
              theme.flex.centerByCol,
              theme.flex.between,
            ]}>
            <View
              style={[theme.flex.row, theme.flex.centerByCol, theme.gap.xs]}>
              <Image source={source} style={[theme.icon.s]} />
              <Text white>{title}</Text>
              {/* <Image
                source={require('@assets/icons/about-white.webp')}
                style={[theme.icon.s]}
              /> */}
            </View>
            {/* <Image
              source={require('@assets/icons/right-white.webp')}
              style={[theme.icon.s]}
            /> */}
          </View>
          <View style={[theme.flex.row]}>
            <Text white fontSize={24} blod>
              {amount}
            </Text>
          </View>
        </LinearGradient>
      </NativeTouchableOpacity>
    );
  };

  return (
    <View style={[containerStyle]}>
      <View style={[theme.flex.flex, theme.flex.row, theme.gap.m]}>
        {optionList?.map(item => {
          return renderBtn({
            title: item?.title,
            colors: item?.colors,
            source: item?.source,
            amount: item?.amount,
          });
        })}
      </View>
      {note ? (
        <View
          style={[theme.flex.row, theme.flex.centerByCol, theme.padding.tbs]}>
          <Text white>{note}</Text>
          <Image
            source={require('@assets/icons/about.webp')}
            style={[theme.icon.s]}
          />
        </View>
      ) : null}
    </View>
  );
};

export default TotalAmountButton;
