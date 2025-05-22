import React from 'react';
import theme from '@style';
import {View, ImageRequireSource, ImageBackground} from 'react-native';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import {useTranslation} from 'react-i18next';
import Text from '@basicComponents/text';

export interface MeRowBtnProps {
  onInvite?: () => void;
  onProxy?: () => void;
}

const MeRowBtn: React.FC<MeRowBtnProps> = ({onInvite, onProxy}) => {
  const {i18n} = useTranslation();

  const renderItem = ({
    url,
    title,
    description,
    onPress,
  }: {
    url: ImageRequireSource;
    title: string;
    description: string;
    onPress?: () => void;
  }) => {
    return (
      // eslint-disable-next-line react-native/no-inline-styles
      <NativeTouchableOpacity style={[{height: 59, flex: 1}]} onPress={onPress}>
        <ImageBackground
          source={url}
          resizeMode={'stretch'}
          style={[
            // eslint-disable-next-line react-native/no-inline-styles
            {height: 59, paddingLeft: 57},
            theme.margin.tops,
            theme.flex.centerByRow,
            theme.padding.rightl,
          ]}>
          <Text numberOfLines={1} fontSize={13} white blod>
            {title}
          </Text>
          <Text
            style={[theme.margin.topxxxs]}
            numberOfLines={1}
            fontSize={10}
            color={theme.fontColor.white80}
            blod>
            {description}
          </Text>
        </ImageBackground>
      </NativeTouchableOpacity>
    );
  };

  return (
    // eslint-disable-next-line react-native/no-inline-styles
    <View style={[theme.flex.row, {gap: 10}]}>
      {renderItem({
        url: require('@assets/imgs/me/invite.webp'),
        title: i18n.t('invitation.home.title'),
        description: 'Invite friends to earn gold coins together',
        onPress: onInvite,
      })}
      {renderItem({
        url: require('@assets/imgs/me/proxy.webp'),
        title: i18n.t('me.bottom.proxy'),
        description: 'View detailed commission data',
        onPress: onProxy,
      })}
    </View>
  );
};

export default MeRowBtn;
