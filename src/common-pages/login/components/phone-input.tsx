import React from 'react';
import {Image, Animated, View} from 'react-native';
import {Input} from '@rneui/themed';
import theme from '@style';
import {inputProps, styles} from '../login.style';
import Text from '@basicComponents/text';
import TouchableOpacity from '@basicComponents/touchable-opacity';
const closeIcon = require('@/assets/icons/close-white.webp');
import PhoneCodeList from '../phone-code.json';
import Picker from '@basicComponents/picker';
import globalStore from '@/services/global.state';
import {useTranslation} from 'react-i18next';

const PhoneInput = (props: {
  userPhone: string;
  setUserPhone: React.Dispatch<React.SetStateAction<string>>;
  userPhoneCode: string;
  setUserPhoneCode: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const {i18n} = useTranslation();
  const {userPhone, setUserPhone, userPhoneCode, setUserPhoneCode} = props;
  const [blured, setBlured] = React.useState(true);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const [openPhonePicker, setOpenPhonePicker] = React.useState(false);
  const phoneCodeItemRender = (item: (typeof PhoneCodeList)[0]) => {
    return (
      <View style={[theme.flex.row, theme.flex.centerByCol]}>
        <Text size="medium" second>
          {item.en}
        </Text>
        <View style={[theme.flex.flex1]} />
        <Text size="medium" second>
          {item.code}
        </Text>
      </View>
    );
  };
  React.useEffect(() => {
    if (userPhone && !blured) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 50,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }).start();
    }
  }, [fadeAnim, userPhone, blured]);
  return (
    <View
      style={[
        styles.loginInputBox,
        blured ? styles.greyBorder : styles.deepBorder,
      ]}>
      <Image
        style={{
          width: 18,
          height: 18,
        }}
        source={require('@components/assets/pofile/smartphone.webp')}
      />
      <View
        style={[
          theme.padding.leftxxs,
          theme.padding.rights,
          // eslint-disable-next-line react-native/no-inline-styles
          {
            borderRightColor: theme.fontColor.secAccent,
            borderRightWidth: 1,
          },
        ]}>
        <Picker
          disabled={globalStore.disabledPhoneCode}
          open={openPhonePicker}
          setOpen={setOpenPhonePicker}
          list={PhoneCodeList}
          valueKey="code"
          labelKey="en"
          value={userPhoneCode}
          onValueChange={value => {
            setUserPhoneCode(value);
            setOpenPhonePicker(false);
          }}
          itemRender={phoneCodeItemRender}
          sheetHeaderTitle={i18n.t('login.label.select-region')}
          titleRender={
            <Text white size="medium">
              +{userPhoneCode}
            </Text>
          }
        />
      </View>
      <View style={theme.flex.flex1}>
        <Input
          {...inputProps}
          onFocus={() => setBlured(false)}
          onBlur={() => setBlured(true)}
          keyboardType="numeric"
          inputMode="numeric"
          value={userPhone}
          onChangeText={value => {
            if (value) {
              if (/^[0-9]+$/.test(value)) {
                setUserPhone(value);
              } else {
                setUserPhone(userPhone || '');
              }
            } else {
              setUserPhone('');
            }
          }}
          maxLength={10}
          placeholder={i18n.t('login.tip.phone')}
        />
      </View>
      <Animated.View
        style={{
          opacity: fadeAnim,
        }}>
        <TouchableOpacity
          disabled={!userPhone}
          onPress={() => setUserPhone('')}>
          <Image
            style={[
              {
                height: theme.iconSize.xl / 2,
                width: theme.iconSize.xl / 2,
                backgroundColor: theme.basicColor.transparent,
              },
            ]}
            source={closeIcon}
          />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default PhoneInput;
