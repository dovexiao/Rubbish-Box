import React, {useState, useEffect} from 'react';
import {Modal, Image, TouchableOpacity, View} from 'react-native';

type Props = {
  onImagePress: () => void;
  imageSource: number | string; // 可以是require('image.png')或网络图片的URI
};

const CustomModal: React.FC<Props> = ({onImagePress, imageSource}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function getDeviceType() {
      var userAgent = navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(userAgent)) {
        return 'ios';
      } else if (/android/.test(userAgent)) {
        return 'android';
      } else {
        return 'No';
      }
    }
    if (getDeviceType() === 'android') {
      setVisible(true);
    }
  }, []);

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <TouchableOpacity onPress={onImagePress}>
          <Image
            source={
              typeof imageSource === 'string' ? {uri: imageSource} : imageSource
            }
            style={{width: 300, height: 400}}
          />
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default CustomModal;
