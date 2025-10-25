import theme from '@/style';
import {View, ImageBackground} from 'react-native';
import {useTranslation} from 'react-i18next';
import Text from '@/components/basic/text';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import React, {useMemo} from 'react';
import {scaleSize} from '@utils';
import LazyImage from '@basicComponents/image';
import LinearGradient from '@/components/basic/linear-gradient';

export interface InvitationCodeProps {
  code?: string;
  onRefreshCode?: () => void;
  onCopy?: () => void;
}

const InvitationCode: React.FC<InvitationCodeProps> = ({
  code,
  onRefreshCode,
  onCopy,
}) => {
  const i18n = useTranslation();
  const renderCode = useMemo(() => {
    const finallyCode = code || '--------';
    return finallyCode.split('').map((c, i) => (
      <Text
        fontSize={15}
        color={theme.fontColor.black}
        key={i}
        style={[
          theme.font.center,
          {fontWeight: '900', marginHorizontal: 4}, // 给字母之间增加间隙
        ]}>
        {c}
      </Text>
    ));
  }, [code]);
  return (
    <View style={[theme.flex.col, theme.margin.btml, theme.borderRadius.l]}>
      <View
        style={[
          // theme.flex.row,
          // theme.flex.centerByCol,
          // theme.flex.between,
          theme.border.primary50,
          theme.borderRadius.xxxl,
          {
            padding: 10,
            backgroundColor: theme.basicColor.newBgInTwo,
          },
        ]}>
        <View style={[theme.flex.row, theme.flex.between]}>
          <Text white fontSize={15} fontWeight="700">
            {i18n.t('invitation.home.code-title')}
          </Text>
          <NativeTouchableOpacity
            activeOpacity={0.8}
            onPress={onRefreshCode}
            style={[
              theme.flex.row,
              theme.flex.between,
              theme.flex.centerByCol,
              {
                paddingHorizontal: 9,
                paddingVertical: 4.5,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: 12,
              },
            ]}>
            <LazyImage
              occupancy={'transparent'}
              imageUrl={require('@assets/icons/refresh2.webp')}
              width={scaleSize(12)}
              height={scaleSize(11)}
            />
            <Text
              color={theme.fontColor.white}
              fontSize={12}
              style={theme.margin.leftxxs}>
              {i18n.t('proxy.home.reset-link')}
            </Text>
          </NativeTouchableOpacity>
        </View>
        <ImageBackground
          source={require('@components/assets/imgs/proxy/invitation-code-bg.webp')}
          resizeMode="stretch"
          style={[
            theme.flex.flex,
            theme.flex.row,
            theme.flex.between,
            theme.flex.centerByCol,
            {height: 76, marginTop: 11},
          ]}>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 4,
              }}>
              {renderCode}
            </View>
            <Text color={'#666666'} fontSize={12} style={{textAlign: 'center'}}>
              My invitation code
            </Text>
          </View>
          <LinearGradient
            colors={theme.basicColor.newButtonLinear}
            start={{x: 0, y: 0.5}}
            end={{x: 1, y: 0.5}}
            style={[
              theme.flex.centerByCol,
              theme.flex.centerByRow,
              {borderRadius: 13, height: 26, width: 77, marginRight: 13},
            ]}>
            <NativeTouchableOpacity onPress={onCopy}>
              <Text
                fontSize={theme.fontSize.m}
                color={theme.basicColor.white}
                style={[{fontWeight: '900'}]}>
                {i18n.t('label.copy')}
              </Text>
            </NativeTouchableOpacity>
          </LinearGradient>
        </ImageBackground>
      </View>
    </View>
  );
};

export default InvitationCode;
