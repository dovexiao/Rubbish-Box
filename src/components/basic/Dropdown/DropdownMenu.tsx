import React, {useState, useRef, ReactNode} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import theme from '@style';

interface DropdownMenuProps {
  buttonText: ReactNode | string;
  right?: number;
  actions: {label: string; onPress: () => void}[];
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  buttonText,
  actions,
  right = 12,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const buttonRef = useRef<TouchableOpacity>(null);
  const [buttonLayout, setButtonLayout] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const openModal = () => {
    buttonRef.current?.measure((fx, fy, width, height, px, py) => {
      setButtonLayout({x: px, y: py, width, height});
      setModalVisible(true);
    });
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <View>
      <TouchableOpacity
        ref={buttonRef}
        onPress={openModal}
        style={styles.button}>
        <Text style={styles.buttonText}>{buttonText}</Text>
      </TouchableOpacity>
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={closeModal}>
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.dropdown,
                {
                  top: buttonLayout.y + buttonLayout.height,
                  // left: buttonLayout.x - 70,
                  right: right,
                },
              ]}>
              {actions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    action.onPress();
                    closeModal();
                  }}
                  style={styles.actionButton}>
                  <Text style={styles.actionText}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.background.mainDark,
    borderRadius: 5,
    alignItems: 'center',
    height: 20,
    overflow: 'hidden',
  },
  buttonText: {
    color: theme.fontColor.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dropdown: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 57, 65, 1)',
    borderRadius: 5,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionButton: {
    padding: 5,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    color: '#E0FFF7',
  },
});

export default DropdownMenu;
