/* eslint-disable react-native/no-inline-styles */
import React, {
  useImperativeHandle,
  forwardRef,
  useState,
  useEffect,
} from 'react';
import {Text, View, TextInput} from 'react-native';
import {useModal} from '@components/basic/modal';
import {
  padding,
  flex,
  position,
  borderRadius,
  font,
  fontColor,
  basicColor,
  backgroundColor,
} from '@/components/style';
import {del} from './profile.variable';
import LazyImage from '@/components/basic/image';
import {NativeTouchableOpacity} from '@basicComponents/touchable-opacity';
import {updateProfile} from './pofile.service';

import {
  w24,
  h24,
  w295,
  margintb,
  fontSize18,
  height48,
  delIcon,
  pos,
} from './profile.variable';
// import globalStore from '@/services/global.state';
const ModelDemo = (props: any, ref: any) => {
  const [name, seTName] = useState('');
  const [errorMessage, setEerrorMessage] = useState('');
  useEffect(() => {
    if (!name) {
      setEerrorMessage('');
    }
  }, [name]);
  const handleupdateProfile = async () => {
    await updateProfile(name.trim(), '');
    props.getUserInfo();
    hide();
    setEerrorMessage('');
  };
  const {renderModal, show, hide} = useModal(
    <View style={[w295]}>
      <View style={[flex.flex, flex.alignEnd]}>
        <NativeTouchableOpacity
          onPress={() => {
            setEerrorMessage('');
            hide();
          }}>
          <LazyImage
            occupancy={'transparent'}
            imageUrl={del}
            width={w24}
            height={h24}
          />
        </NativeTouchableOpacity>
      </View>
      <View style={[flex.centerByCol]}>
        <Text style={[fontSize18, font.white, {fontWeight: 'bold'}]}>
          USER NAME
        </Text>
      </View>
      <View style={[position.rel]}>
        <TextInput
          style={[
            margintb,
            padding.l,
            borderRadius.xs,
            {
              borderColor: '#04CC9B26',
              borderWidth: 1,
              color: fontColor.white,
              fontSize: 14,
              fontWeight: name.trim().length > 1 ? 'bold' : 'normal',
            },
          ]}
          placeholder={'please enter'}
          placeholderTextColor={'#FFFFFF'}
          value={name}
          onChangeText={text => {
            name.trim().length >= 4 && setEerrorMessage('');
            if (/^[^\u4e00-\u9fa5]+$/.test(text)) {
              seTName(text);
            } else {
              seTName('');
            }
          }}
          maxLength={16}
        />
        <View style={[position.abs, pos, flex.flex, flex.center]}>
          <NativeTouchableOpacity
            onPress={() => seTName('')}
            style={[flex.flex1, flex.centerByRow, padding.lrl]}>
            <LazyImage
              occupancy={'transparent'}
              imageUrl={delIcon}
              width={14}
              height={14}
            />
          </NativeTouchableOpacity>
        </View>
      </View>
      {errorMessage ? (
        <View style={[{marginBottom: 16, paddingLeft: 10, paddingRight: 10}]}>
          <Text style={[{color: '#ff0000'}]}> {errorMessage}</Text>
        </View>
      ) : null}
      <NativeTouchableOpacity
        onPress={() => {
          if (name.trim().length < 4) {
            setEerrorMessage(
              'Username Should Be Between 4 And 16 Characters Long. Please Retype.',
            );
          } else {
            handleupdateProfile();
          }
        }}>
        <View
          style={[
            height48,
            {
              backgroundColor: basicColor.newBgInOne,
            },
            flex.flex,
            flex.center,
            flex.centerByCol,
            borderRadius.l,
          ]}>
          <Text style={[fontSize18, font.white, font.m, font.bold]}>SAVE</Text>
        </View>
      </NativeTouchableOpacity>
    </View>,
    {
      backDropClose: true,
      overlayStyle: {
        borderRadius: 20,
        backgroundColor: backgroundColor.mainDark,
      },
    },
  );
  useImperativeHandle(ref, () => ({
    show,
    handleSetName: (str: string) => seTName(str),
  }));
  return <View>{renderModal}</View>;
};

export default forwardRef(ModelDemo);
