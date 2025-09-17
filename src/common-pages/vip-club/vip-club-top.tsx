import React, {useState} from 'react';
import {
  View,
  ImageBackground,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
} from 'react-native';
import Text from '@basicComponents/text';
import LinearGradient from '@/components/basic/linear-gradient';
import theme from '@/style';
import {useTranslation} from 'react-i18next';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';

const ablotW = require('@assets/icons/about-w.webp');
const {width: screenWidth} = Dimensions.get('window');

interface VipClubTopProps {
  /** 当前等级 */
  currentLevel?: number;
  /** 下一等级 */
  nextLevel?: number;
  /** 周薪金额 */
  weeklySalary?: number;
  /** 需要充值的金额才能到达下一等级 */
  needRechargeAmount?: number;
  /** 当前进度 0-1 */
  progress?: number;
  h?: number;
  w?: number;
  /** 按钮状态：'available' | 'claimed' | 'locked' */
  buttonStatus?: 'available' | 'claimed' | 'locked';
  /** 点击领取按钮的回调 */
  onClaim?: () => void;
}

const VipClubTop: React.FC<VipClubTopProps> = ({
  weeklySalary = 666,
  progress = 0.6,
  buttonStatus = 'available',
  onClaim,
  h = 150,
  w = screenWidth - 20,
}) => {
  const {i18n} = useTranslation();
  const [isPressed, setIsPressed] = useState(false);
  const [visible, setVisible] = useState(false);

  const handleInfoPress = () => {
    setVisible(true);
  };

  const handlePress = () => {
    console.log('handlePress');
    if (buttonStatus === 'available' && onClaim) {
      onClaim();
    }
  };

  const getButtonText = () => {
    switch (buttonStatus) {
      case 'available':
        return 'Available';
      //   case 'claimed':
      //     return 'Claimed';
      //   case 'locked':
      //     return 'Locked';
      default:
        return 'Available';
    }
  };

  const getButtonStyle = () => {
    switch (buttonStatus) {
      case 'available':
        return styles.availableButton;
      case 'claimed':
        return styles.claimedButton;
      case 'locked':
        return styles.lockedButton;
      default:
        return styles.availableButton;
    }
  };

  return (
    <View style={[styles.container, {width: w}]}>
      {/* 卡片主体 */}
      <ImageBackground
        source={require('@assets/imgs/vip/vip-weekly.webp')}
        style={[styles.cardContainer, {width: w, height: h}]}>
        {/* 中间金额区域 */}
        <View style={styles.middleSection}>
          <View style={styles.salaryContainer}>
            <View style={[theme.flex.row, theme.flex.centerByCol]}>
              <Text
                fontSize={theme.fontSize.m}
                color={theme.fontColor.white80}
                style={[
                  styles.salaryLabel,
                  {
                    textAlign: 'center',
                  },
                ]}>
                {i18n.t('vip.weeklySalary')}
              </Text>
              <NativeTouchableOpacity
                style={{
                  marginLeft: 5,
                }}
                onPress={() => {
                  handleInfoPress();
                }}>
                <Image
                  source={ablotW}
                  style={[
                    {
                      width: 16,
                      height: 16,
                    },
                  ]}
                />
              </NativeTouchableOpacity>
            </View>
            <Text
              fontSize={theme.fontSize.xxxl}
              fontWeight="bold"
              color={theme.fontColor.white}
              style={[
                styles.salaryAmount,
                {
                  textAlign: 'center',
                },
              ]}>
              ₹{weeklySalary}
            </Text>
          </View>
          {/* 按钮区域 */}
          <View style={styles.buttonSection}>
            <TouchableOpacity
              style={[
                styles.claimButton,
                getButtonStyle(),
                isPressed && styles.buttonPressed,
              ]}
              onPress={handlePress}
              onPressIn={() => setIsPressed(true)}
              onPressOut={() => setIsPressed(false)}
              disabled={buttonStatus !== 'available'}>
              <LinearGradient
                colors={
                  buttonStatus === 'available'
                    ? ['#FF6B35', '#FF8E53']
                    : ['#888888', '#666666']
                }
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.buttonGradient}>
                <Text
                  fontSize={theme.fontSize.m}
                  fontWeight="bold"
                  color={theme.fontColor.white}
                  style={[
                    {
                      textAlign: 'center',
                    },
                  ]}>
                  {getButtonText()}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* 进度条区域 */}
        <View style={styles.progressSection}>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBg}>
              <LinearGradient
                colors={['#98B1FF', '#A356F7']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={[
                  styles.progressBarFill,
                  {
                    width: `${Math.min(progress * 100, 100)}%`,
                  },
                ]}
              />
            </View>
          </View>
          <View style={styles.progressBarText}>
            <Text
              fontSize={theme.fontSize.xs}
              color={theme.fontColor.white60}
              style={[
                styles.progressLabel,
                {
                  textAlign: 'center',
                },
              ]}>
              Weekly Recharge
            </Text>

            <Text
              fontSize={theme.fontSize.s}
              color={theme.fontColor.white}
              style={[
                styles.progressLabel,
                {
                  textAlign: 'center',
                },
              ]}>
              ₹2,300/₹5,000(V2)
            </Text>
          </View>
        </View>
      </ImageBackground>
      <Modal
        animationType="fade"
        transparent
        visible={visible}
        onRequestClose={() => {
          setVisible(false);
        }}>
        <View style={modalStyles.overlay}>
          <View
            style={[
              modalStyles.container,
              {backgroundColor: theme.basicColor.newBgInTwo},
            ]}>
            <Text style={modalStyles.title}>{i18n.t('label.prompt')}</Text>
            <Text style={modalStyles.message}>
              {
                'This is a detailed explanation of weekly salary, to be determined ...'
              }
            </Text>
            <View style={modalStyles.buttonRow}>
              {/* <TouchableOpacity style={modalStyles.button} onPress={onCancel}>
                <Text style={modalStyles.cancelText}></Text>
              </TouchableOpacity> */}
              <TouchableOpacity
                style={modalStyles.button}
                onPress={() => {
                  setVisible(false);
                }}>
                <Text style={modalStyles.confirmText}>
                  {i18n.t('label.confirm')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
    width: '75%',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: theme.fontColor.white,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
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
  cancelText: {
    color: '#999',
    fontSize: 16,
  },
  confirmText: {
    color: theme.basicColor.newFontYellow,
    fontSize: 16,
    fontWeight: '600',
  },
});
const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    marginVertical: theme.paddingSize.l,
  },
  cardContainer: {
    borderRadius: theme.borderRadiusSize.l,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    paddingBottom: 5,
  },
  backgroundImage: {
    borderRadius: theme.borderRadiusSize.l,
  },
  topSection: {
    alignItems: 'center',
    marginBottom: theme.paddingSize.xs,
    flex: 1,
    paddingHorizontal: theme.paddingSize.l,
    paddingVertical: theme.paddingSize.m,
    justifyContent: 'space-between',
  },
  topText: {
    marginTop: theme.paddingSize.xxs,
  },
  middleSection: {
    // flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    paddingLeft: 15,
    paddingRight: 20,
  },
  salaryContainer: {
    alignItems: 'center',
  },
  salaryAmount: {
    marginBottom: theme.paddingSize.xxs,
  },
  salaryLabel: {},
  decorLeft: {
    position: 'absolute',
    left: theme.paddingSize.l,
    top: '50%',
    transform: [{translateY: -10}],
  },
  decorRight: {
    position: 'absolute',
    right: theme.paddingSize.l,
    top: '30%',
    transform: [{translateY: -10}],
  },
  buttonSection: {
    alignItems: 'center',
    marginBottom: theme.paddingSize.s,
  },
  claimButton: {
    borderRadius: theme.borderRadiusSize.xxxl,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  availableButton: {},
  claimedButton: {
    opacity: 0.7,
  },
  lockedButton: {
    opacity: 0.5,
  },
  buttonPressed: {
    transform: [{scale: 0.95}],
  },
  buttonGradient: {
    paddingHorizontal: theme.paddingSize.xxxl,
    paddingVertical: theme.paddingSize.s,
    minWidth: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressSection: {
    alignItems: 'center',
  },
  progressLabel: {
    marginBottom: theme.paddingSize.xxs,
  },
  progressBarContainer: {
    width: '100%',
    alignItems: 'center',
    paddingLeft: 15,
    paddingRight: 20,
  },
  progressBarBg: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: theme.borderRadiusSize.xs,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: theme.borderRadiusSize.xs,
  },
  progressBarText: {
    marginTop: 8,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    paddingLeft: 15,
    paddingRight: 20,
  },
});

export default VipClubTop;
