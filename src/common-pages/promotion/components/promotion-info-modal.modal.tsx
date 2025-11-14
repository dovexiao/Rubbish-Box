import React from 'react';
import {Modal, TouchableOpacity, View, StyleSheet} from 'react-native';
import Text from '@basicComponents/text';
import theme from '@style';

export interface PromotionInfoModalProps {
  visible: boolean;
  onClose: () => void;
  type: 0 | 1; // 0: Extra Recharge Bonus, 1: Daily Continuous Recharge Bonus
  i18n: any;
  currentReacgarge: any;
  currentReacgarge1: any;
  currentReacgarge2: any;
  currentReacgarge3: any;
}

const PromotionInfoModal: React.FC<PromotionInfoModalProps> = ({
  visible,
  onClose,
  type,
  i18n,
}) => {
  return (
    <Modal
      animationType="none"
      transparent
      visible={visible}
      onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        {type === 0 ? (
          <View
            style={[
              modalStyles.container,
              {backgroundColor: theme.basicColor.newBgInTwo},
            ]}>
            <Text style={modalStyles.message}>Extra Recharge Bonus</Text>
            <Text style={modalStyles.message}>
              1st recharge → +10%, Max ₹1,000
            </Text>
            <Text style={modalStyles.message}>
              2nd recharge → +15%, Max ₹2,000
            </Text>
            <Text style={modalStyles.message}>
              3rd recharge → +20%, Max ₹3,000
            </Text>
            <Text style={modalStyles.message}>
              4th recharge → +30%, Max ₹4,000
            </Text>
            <Text style={modalStyles.message}>
              Note :The bonus applies only once per recharge count. Higher
              top-ups won’t increase the bonus beyond the maximum limit.
            </Text>
            <View style={modalStyles.buttonRow}>
              <TouchableOpacity style={modalStyles.button} onPress={onClose}>
                <Text style={modalStyles.confirmText}>
                  {i18n.t('label.cancel')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View
            style={[
              modalStyles.container,
              {backgroundColor: theme.basicColor.newBgInTwo},
            ]}>
            <Text style={modalStyles.message}>Daily Sign-in Bonus</Text>
            <Text style={modalStyles.message}>Monday → ₹1 Bonus</Text>
            <Text style={modalStyles.message}>TuesDay → ₹2 Bonus</Text>
            <Text style={modalStyles.message}>Wednesday → ₹3 Bonus</Text>
            <Text style={modalStyles.message}>Thursday → ₹4 Bonus</Text>
            <Text style={modalStyles.message}>Friday → ₹5 Bonus</Text>
            <Text style={modalStyles.message}>Saturday → ₹6 Bonus</Text>
            <Text style={modalStyles.message}>Sunday → ₹10 Bonus</Text>
            <Text style={modalStyles.message}>
              You can check in and claim the remaining free rewards by
              recharging once a week.
            </Text>
            <Text style={modalStyles.message}>
              You can only claim your reward once a day, and you must claim it
              before 00:00. Rewards expire after that time (all free rewards
              reset every Sunday at 12:00 AM! If you want to claim all rewards,
              you must recharge on Monday).
            </Text>
            <View style={modalStyles.buttonRow}>
              <TouchableOpacity style={modalStyles.button} onPress={onClose}>
                <Text style={modalStyles.confirmText}>
                  {i18n.t('label.cancel')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  message: {
    width: '100%',
    fontSize: 16,
    textAlign: 'left',
    marginBottom: 20,
    color: theme.fontColor.white,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  confirmText: {
    color: theme.basicColor.newFontYellow,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PromotionInfoModal;
