import React from 'react';
import {View, Image, ImageRequireSource} from 'react-native';
import theme from '@/style';
import {useSettingWindowDimensions} from '@/store/useSettingStore';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import Text from '@/components/basic/text';
import LinearGradient from '@/components/basic/linear-gradient';
import {goTo, goToWithLogin} from '@/utils';

const JumpButton = () => {
  const {} = useSettingWindowDimensions();

  const renderBtn = ({
    source,
    title,
    flex,
    onPress,
  }: {
    source: ImageRequireSource;
    title: string;
    flex: number;
    onPress: () => void;
  }) => {
    return (
      <NativeTouchableOpacity
        onPress={onPress}
        style={[
          theme.flex.row,
          theme.border.primary50,
          theme.flex.center,
          theme.borderRadius.s,
          {height: 36, flex: flex},
        ]}>
        <Image source={source} style={[theme.icon.s, theme.margin.rightxs]} />
        <Text white>{title}</Text>
      </NativeTouchableOpacity>
    );
  };

  return (
    // eslint-disable-next-line react-native/no-inline-styles
    <View style={[{height: 32}, theme.margin.topl]}>
      <View
        style={[
          theme.flex.flex,
          theme.flex.row,
          theme.gap.m,
          {display: 'none'},
        ]}>
        {renderBtn({
          title: 'Withdraw',
          source: require('@assets/icons/welfare/withdraw.webp'),
          flex: 1,
          onPress: () => {
            goToWithLogin('Withdraw');
          },
        })}
        {renderBtn({
          title: 'Exchange',
          source: require('@assets/icons/welfare/shopping.webp'),
          flex: 1,
          onPress: () => {
            goTo('ShoppingPage');
          },
        })}
        {renderBtn({
          title: 'Quests to earn gold',
          source: require('@assets/icons/welfare/quest.webp'),
          flex: 1.5,
          onPress: () => {},
        })}
      </View>
      <NativeTouchableOpacity
        onPress={() => {
          goTo('ShoppingPage');
        }}>
        <LinearGradient
          colors={[theme.basicColor.primary10, theme.basicColor.primary60]}
          style={[
            theme.padding.lefts,
            theme.flex.row,
            theme.border.white20,
            theme.borderRadius.xl,
            theme.flex.centerByCol,
            {height: 32},
          ]}>
          <Image
            source={require('@assets/icons/welfare/gift.webp')}
            style={[theme.icon.xl]}
          />
          <Text style={[theme.flex.flex1]} white>
            GO TO SHOP
          </Text>
          <View
            style={[
              theme.flex.row,
              theme.flex.center,
              theme.padding.leftl,
              // eslint-disable-next-line react-native/no-inline-styles
              {
                borderTopRightRadius: 12,
                borderBottomRightRadius: 12,
                backgroundColor: '#18004A4D',
                height: 32,
              },
            ]}>
            <Text style={[]} white>
              Go redeem
            </Text>
            <Image
              source={require('@assets/icons/right-white.webp')}
              style={[theme.icon.s]}
            />
          </View>
        </LinearGradient>
      </NativeTouchableOpacity>
    </View>
  );
};

export default JumpButton;
