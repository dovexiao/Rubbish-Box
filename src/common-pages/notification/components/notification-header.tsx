import Button from '@/components/basic/button';
import LinearGradient from '@/components/basic/linear-gradient';
import Text from '@/components/basic/text';
import theme from '@/style';
import React, {memo, useState, useEffect} from 'react';

import {View, Image, Linking} from 'react-native';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';

const NotificationHeader = () => {
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);

  useEffect(() => {
    const checkPermission = async () => {
      const messaging = require('@react-native-firebase/messaging').default;
      const authorizationStatus = await messaging().hasPermission();
      setIsPermissionGranted(
        authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED,
      );
    };
    checkPermission();
  }, []);

  if (isPermissionGranted) {
    return null;
  }

  const onPressPermission = () => {
    Linking.openSettings();
  };

  return (
    <LinearGradient
      colors={[theme.basicColor.primary15, theme.basicColor.primary50]}
      style={[
        theme.margin.lrl,
        theme.padding.lrl,
        theme.margin.btml,
        theme.flex.centerByCol,
        theme.borderRadius.m,
        theme.flex.row,
        theme.border.primary50,
        {height: 60},
      ]}>
      <View style={[theme.flex.flex1]}>
        <Text blod color={theme.fontColor.white}>
          Turn on message notifications
        </Text>
        <Text
          color={theme.fontColor.primaryMain}
          style={[theme.margin.topxs]}
          numberOfLines={1}>
          Receive news on orders, event offers and more in a timely manner
        </Text>
      </View>
      <Button
        title={'OPEN'}
        type="primary"
        size="small"
        radius={30}
        onPress={onPressPermission}
      />
      <NativeTouchableOpacity
        onPress={() => {
          setIsPermissionGranted(false);
        }}>
        <Image
          source={require('@assets/icons/close-white.webp')}
          style={[theme.icon.l]}
        />
      </NativeTouchableOpacity>
    </LinearGradient>
  );
};

export default memo(NotificationHeader);
