import theme from '@/style';
import {View} from 'react-native';
import {useTranslation} from 'react-i18next';
import Text from '@/components/basic/text';
// import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import React, {useMemo} from 'react';
import {scaleSize} from '@utils';
// import LazyImage from '@basicComponents/image';
import Button from '@/components/basic/button';

export interface InvitationCodeProps {
  code?: string;
  onRefreshCode?: () => void;
  onCopy?: () => void;
}

const InvitationCode: React.FC<InvitationCodeProps> = ({
  code,
  // onRefreshCode,
  onCopy,
}) => {
  const i18n = useTranslation();

  const renderCode = useMemo(() => {
    const finallyCode = code || '--------';
    return finallyCode.split('').map((c, i) => (
      <Text
        fontSize={theme.fontSize.xl}
        color={theme.fontColor.white}
        blod
        key={i}
        style={[theme.font.center]}>
        {c}
      </Text>
    ));
  }, [code]);
  return (
    <View style={[theme.flex.col, theme.margin.btml, theme.borderRadius.l]}>
      <View
        style={[
          theme.flex.row,
          theme.flex.centerByCol,
          theme.flex.between,
          theme.background.newFirst1,
          theme.border.primary50,
          theme.borderRadius.s,
          {height: 80, paddingLeft: 25},
        ]}>
        <View style={[{width: scaleSize(170)}]}>
          <Text white fontSize={theme.fontSize.m}>
            {i18n.t('invitation.home.code-title')}
          </Text>
          <View
            style={[
              theme.flex.row,
              theme.flex.centerByCol,
              theme.margin.topxs,
            ]}>
            <View
              style={[
                theme.flex.centerByCol,
                theme.flex.between,
                theme.flex.row,
                theme.padding.topxxs,
                theme.flex.flex1,
              ]}>
              {renderCode}
            </View>
            {/*<NativeTouchableOpacity*/}
            {/*  activeOpacity={0.8}*/}
            {/*  onPress={onRefreshCode}*/}
            {/*  style={[theme.margin.leftm]}>*/}
            {/*  <LazyImage*/}
            {/*    occupancy={'transparent'}*/}
            {/*    imageUrl={require('@assets/icons/refresh.webp')}*/}
            {/*    width={scaleSize(24)}*/}
            {/*    height={scaleSize(24)}*/}
            {/*  />*/}
            {/*</NativeTouchableOpacity>*/}
          </View>
        </View>
        <Button
          style={[theme.margin.rightl]}
          radius={30}
          size="small"
          title={i18n.t('label.copy')}
          type={'linear-primary-gold'}
          onPress={onCopy}
        />
      </View>
    </View>
  );
};

export default InvitationCode;
