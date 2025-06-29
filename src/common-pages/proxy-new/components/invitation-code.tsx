import React from 'react';
import theme from '@style';
import i18n from '@i18n';
import {icBgImage} from '@/common-pages/proxy/proxy.variable';
import {View, ImageBackground, StyleSheet} from 'react-native';
import {CardItem} from '@/common-pages/proxy/basic-components';
import Text from '@basicComponents/text';
// import Button from '@basicComponents/button';
import style from '@//common-pages/proxy/components/style';
import {
  CardContent,
  CardItemProps,
} from '@/common-pages/proxy/basic-components/card-item';
import {useInnerStyle} from '@/common-pages/proxy/proxy.hooks';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import LinearGradient from '@/components/basic/linear-gradient';
const styles = StyleSheet.create({
  backgroundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 44,
  },
  imgStyle: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  inviteBtnStyle: {
    width: '90%',
    marginLeft: '8%',
    height: 44,
  },
  inviteLinerBtnStyleL: {
    borderRadius: 24,
  },
  btnStyle: {
    fontSize: 12,
    color: '#000',
    lineHeight: 24,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
interface IProps {
  code: string;
  onRefresh?: () => void;
  onShare?: () => void;
  onCopy?: () => void;
}
const DirectSubordinates = (props: IProps) => {
  const {code, onShare, onCopy} = props;
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
        text: i18n.t('newProxy.home.my-invitation-code'),
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
        theme.margin.lrl,
        {
          paddingBottom: theme.paddingSize.l,
          marginTop: theme.paddingSize.l,
          borderRadius: theme.borderRadiusSize.m,
          backgroundColor: theme.basicColor.transparentP10,
        },
      ]}>
      <View
        style={[
          {
            width: width - theme.paddingSize.l * 4,
            paddingLeft: theme.paddingSize.l,
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
                  fontSize: theme.fontSize.xl,
                },
              ]}>
              {i18n.t('label.copy')}
            </Text>
          </NativeTouchableOpacity>
        </ImageBackground>

        <NativeTouchableOpacity
          style={[styles.inviteBtnStyle]}
          onPress={() => onShare?.()}>
          <LinearGradient
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            colors={[theme.basicColor.primary1, theme.basicColor.primary1]}
            style={[
              theme.flex.row,
              theme.fill.fillW,
              theme.fill.fillH,
              styles.inviteLinerBtnStyleL,
              theme.flex.centerByRow,
              theme.flex.centerByCol,
            ]}>
            <Text
              style={[
                styles.btnStyle,
                theme.flex.flex,
                theme.flex.row,
                theme.flex.centerByRow,
                theme.flex.centerByCol,
              ]}>
              {i18n.t('newProxy.home.invitation-link')}
            </Text>
          </LinearGradient>
        </NativeTouchableOpacity>
      </View>
    </View>
  );
};

export default DirectSubordinates;
