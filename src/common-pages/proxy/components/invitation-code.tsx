import React from 'react';
import theme from '@style';
import i18n from '@i18n';
import {icBgImage} from '../proxy.variable';
import {View, ImageBackground} from 'react-native';
import {ProxyTitle, CardItem} from '../basic-components';
import LinearGradient from '@/components/basic/linear-gradient';
import Text from '@basicComponents/text';
import Button from '@basicComponents/button';
import style from './style';
import {CardContent, CardItemProps} from '../basic-components/card-item';
import {useInnerStyle} from '../proxy.hooks';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import {goToUrl} from '@/common-pages/game-navigate';
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
      color: theme.fontColor.black,
      fontSize: 18,
    },
    bold: true,
  };
  const downstyle = {
    style: {
      color: theme.basicColor.newGrey,
      fontSize: theme.fontSize.s,
    },
    bold: false,
  };
  return (
    <View
      style={[
        theme.margin.lrl,
        {
          padding: theme.paddingSize.l,
          marginTop: theme.paddingSize.l,
          borderRadius: theme.borderRadiusSize.m,
          backgroundColor: theme.basicColor.newBgInOne,
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
              color={theme.basicColor.newFontRed2}
              style={[
                {
                  fontSize: theme.fontSize.l,
                },
              ]}>
              {i18n.t('label.copy')}
            </Text>
          </NativeTouchableOpacity>
        </ImageBackground>
        <LinearGradient
          colors={theme.basicColor.newButtonYellow2}
          style={[{borderRadius: 22}]}>
          <Button
            onPress={() => onShare?.()}
            radius={22}
            color={theme.basicColor.newTransparent}
            width={width - theme.paddingSize.l * 4}
            size="large"
            title={i18n.t('newProxy.home.invitation-link')}
            titleBold={true}
            titleColor={'#E02020'}
          />
        </LinearGradient>
        <View
          style={[
            theme.flex.row,
            theme.flex.center,
            {
              marginTop: 12,
              justifyContent: 'space-between',
            },
          ]}>
          <Button
            radius={22}
            color={'#FF493A'}
            width={(width - theme.paddingSize.l * 5) / 2}
            size="large"
            title="Join Telegtam"
            titleBold={true}
            onPress={() => goToUrl('https://t.me/eve1_official')}
          />
          <Button
            radius={22}
            color={'#F7B500'}
            width={(width - theme.paddingSize.l * 5) / 2}
            size="large"
            title="Join Whatsapp"
            titleBold={true}
            onPress={() => goToUrl('https://api.whatsapp.com/send/?phone=919332094811&text&type=phone_number&app_absent=0&wame_ctl=1')}
          />
        </View>
      </View>
    </View>
  );
};

export default DirectSubordinates;
