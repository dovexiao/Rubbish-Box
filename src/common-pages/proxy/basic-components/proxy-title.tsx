import React from 'react';
import theme from '@style';
import style from './style';
import {View} from 'react-native';
import Text from '@basicComponents/text';
import LinearGradient, {
  LinearGradientProps,
} from '@basicComponents/linear-gradient';
import baseVariable from '@/style/base.variable';

interface Iprops {
  title: string;
  onResetLink?: () => void;
}

const lightLinear: LinearGradientProps = {
  start: {x: 0, y: 0},
  end: {x: 1, y: 0},
  colors: baseVariable.linearGradientColor.proxylightLinear,
};

const ProxyTitle = (props: Iprops) => {
  const {title} = props;
  // const styles = StyleSheet.create({
  //   resetLink: {
  //     height: 28,
  //     backgroundColor: baseVariable.basicColor.proxyResetLink,
  //   },
  // });
  return (
    <View style={[theme.flex.row, theme.flex.between, theme.flex.centerByCol]}>
      <View style={[theme.flex.row, theme.flex.centerByCol]}>
        <LinearGradient
          {...lightLinear}
          style={[theme.margin.rights, style.preTitle]}
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

      {/*{onResetLink && (*/}
      {/*  <NativeTouchableOpacity*/}
      {/*    style={[*/}
      {/*      theme.borderRadius.xs,*/}
      {/*      styles.resetLink,*/}
      {/*      theme.padding.lrs,*/}
      {/*      theme.flex.row,*/}
      {/*      theme.flex.centerByCol,*/}
      {/*    ]}*/}
      {/*    onPress={onResetLink}>*/}
      {/*    <RefreshIcon*/}
      {/*      width={theme.iconSize.xs}*/}
      {/*      height={theme.iconSize.xs}*/}
      {/*      stroke={theme.fontColor.white}*/}
      {/*    />*/}
      {/*    <Text color={theme.fontColor.white} style={theme.margin.leftxxs}>*/}
      {/*      {i18n.t('proxy.home.reset-link')}*/}
      {/*    </Text>*/}
      {/*  </NativeTouchableOpacity>*/}
      {/*)}*/}
    </View>
  );
};

export default ProxyTitle;
