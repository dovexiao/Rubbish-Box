import React from 'react';
import theme from '@style';
import i18n from '@i18n';
import {icBgImage} from '../proxy.variable';
import {View, ImageBackground} from 'react-native';
import {ProxyTitle, CardItem} from '../basic-components';
import Text from '@basicComponents/text';
import Button from '@basicComponents/button';
import style from './style';
import {CardContent, CardItemProps} from '../basic-components/card-item';
import {useInnerStyle} from '../proxy.hooks';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
interface IProps {
  code: string;
  onRefresh?: () => void;
  onShare?: () => void;
  onCopy?: () => void;
}
const DirectSubordinates = (props: IProps) => {
  const {code, onRefresh, onShare, onCopy} = props;
  const {
    size: {screenWidth: width},
    homeInvitationStyle,
  } = useInnerStyle();
  const condContent: CardItemProps<CardContent> = {
    content: [
      {
        text: code,
      },
      {
        text: i18n.t('proxy.home.my-invitation-code'),
      },
    ],
    isRight: 1,
  };
  const upstyle = {
    style: {
      color: theme.fontColor.white,
      fontSize: 18,
    },
    bold: true,
  };
  const downstyle = {
    style: {
      color: theme.fontColor.white60,
      fontSize: theme.fontSize.s,
    },
    bold: false,
  };
  return (
    <View
      style={[
        theme.background.mainDark,
        theme.margin.lrl,
        {
          padding: theme.paddingSize.l,
          marginTop: theme.paddingSize.l,
          borderRadius: theme.borderRadiusSize.m,
        },
      ]}>
      <ProxyTitle
        title={i18n.t('proxy.home.my-invitation-code')}
        onResetLink={onRefresh}
      />
      <View
        style={[
          {
            width: width - theme.paddingSize.l * 4,
          },
          theme.margin.topl,
        ]}>
        <ImageBackground
          source={icBgImage}
          resizeMode="stretch"
          style={[
            homeInvitationStyle.image,
            theme.flex.flex,
            theme.flex.row,
            theme.margin.btml,
          ]}>
          <View
            style={[
              style.codeWrap,
              theme.flex.flex,
              theme.flex.row,
              theme.flex.center,
            ]}>
            <CardItem
              {...condContent}
              upStyle={upstyle}
              downStyle={downstyle}
              margin={4}
            />
          </View>
          <View style={style.gap} />
          <NativeTouchableOpacity
            style={[
              style.copyWrap,
              theme.flex.flex,
              theme.flex.row,
              theme.flex.center,
            ]}
            onPress={() => onCopy?.()}>
            <Text
              blod
              color={theme.basicColor.white}
              style={[
                {
                  fontSize: theme.fontSize.l,
                },
              ]}>
              {i18n.t('label.copy')}
            </Text>
          </NativeTouchableOpacity>
        </ImageBackground>
        <Button
          onPress={() => onShare?.()}
          radius={30}
          color={theme.fontColor.primary}
          width={width - theme.paddingSize.l * 4}
          size="large"
          title={i18n.t('newProxy.home.invitation-link')}
          titleBold={true}
        />
      </View>
    </View>
  );
};

export default DirectSubordinates;
