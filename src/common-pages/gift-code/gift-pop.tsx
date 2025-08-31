import React, {useState} from 'react';
import {
  Modal,
  View,
  TextInput,
  Text,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  Image,
} from 'react-native';
import LinearGradient from '@/components/basic/linear-gradient';
import {useScreenSize} from '@/common-pages/hooks/size.hooks';
import theme from '@style';
import i18n from '@i18n';

interface GiftPopProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (value: string, callback: () => void) => void;
}

const GiftPop: React.FC<GiftPopProps> = ({visible, onClose, onSubmit}) => {
  const [inputValue, setInputValue] = useState<string>('');
  const {screenWidth} = useScreenSize();
  const handleSubmit = () => {
    onSubmit(inputValue, () => {
      setInputValue(''); // Clear input after submit
    });
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <ImageBackground
          source={require('@assets/icons/me/gift-pop.png')}
          style={[
            styles.background,
            {width: screenWidth * 0.72, height: screenWidth * 0.83},
          ]}>
          <View style={[styles.modalContent, {marginTop: screenWidth * 0.4}]}>
            <TextInput
              style={[
                styles.input,
                {width: screenWidth * 0.62, height: screenWidth * 0.11},
              ]}
              placeholderTextColor="#888888"
              placeholder={i18n.t('me.bottom.enterYourGiftCode')}
              value={inputValue}
              onChangeText={setInputValue}
            />
            <TouchableOpacity onPress={handleSubmit}>
              <LinearGradient
                colors={theme.basicColor.newButtonLinear}
                start={{x: 0, y: 0}} // 起点在左侧
                end={{x: 1, y: 0}} // 终点在右侧
                style={[
                  styles.button,
                  {width: screenWidth * 0.62, height: screenWidth * 0.11},
                ]}>
                <Text style={styles.buttonText}>
                  {i18n.t('me.bottom.exchange')}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ImageBackground>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Image
            style={[theme.icon.xxl]}
            source={require('@assets/icons/home/button-close.png')}
          />
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Overlay with opacity
  },
  background: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  modalContent: {
    alignItems: 'center',
  },
  input: {
    paddingLeft: 16,
    marginBottom: 20,
    backgroundColor: '#f2f2f2',
    borderWidth: 0.5,
    borderColor: '#D6D6D6',
    borderRadius: 4,
  },
  button: {
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '700',
  },
  closeButton: {
    marginTop: 20,
  },
});

export default GiftPop;
