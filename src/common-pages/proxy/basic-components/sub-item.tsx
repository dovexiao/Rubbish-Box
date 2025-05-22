import React from 'react';
import theme from '@style';
import {View, Image} from 'react-native';
import Text from '@basicComponents/text';
import {NativeTouchableOpacity} from '@basicComponents/touchable-opacity';
import {rightIcon} from '../proxy.variable';

interface IProps {
  icon: any;
  title: string;
  comp?: any;
  onPress?: () => void;
}

const SubItem = (props: IProps) => {
  const {icon, title, comp, onPress} = props;
  return (
    <NativeTouchableOpacity onPress={onPress}>
      <View
        style={[
          theme.flex.flex,
          theme.flex.row,
          theme.flex.between,
          theme.flex.centerByCol,
          {
            height: theme.paddingSize.m * 4,
          },
        ]}>
        <View style={[theme.flex.flex, theme.flex.row, theme.flex.centerByCol]}>
          <Image
            source={icon}
            style={{
              width: theme.paddingSize.xxl,
              height: theme.paddingSize.xxl,
              marginRight: theme.paddingSize.l,
            }}
          />
          <Text
            style={[
              {
                color: theme.fontColor.white,
                fontSize: theme.fontSize.m,
              },
            ]}>
            {title}
          </Text>
        </View>
        <View style={[theme.flex.flex, theme.flex.row, theme.flex.centerByCol]}>
          {comp}
          <Image
            source={rightIcon}
            style={{
              width: theme.paddingSize.xl,
              height: theme.paddingSize.xl,
              marginLeft: theme.paddingSize.s,
            }}
          />
        </View>
      </View>
    </NativeTouchableOpacity>
  );
};

export default SubItem;
