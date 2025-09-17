import React, {useState} from 'react';
import {
  View,
  ImageBackground,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Text from '@basicComponents/text';
import LinearGradient from '@/components/basic/linear-gradient';
import theme from '@/style';

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
  /** 按钮状态：'available' | 'claimed' | 'locked' */
  buttonStatus?: 'available' | 'claimed' | 'locked';
  /** 点击领取按钮的回调 */
  onClaim?: () => void;
}

const VipClubTop: React.FC<VipClubTopProps> = ({
  nextLevel = 4,
  weeklySalary = 666,
  needRechargeAmount = 2700,
  progress = 0.6,
  buttonStatus = 'available',
  onClaim,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const handlePress = () => {
    if (buttonStatus === 'available' && onClaim) {
      onClaim();
    }
  };

  const getButtonText = () => {
    switch (buttonStatus) {
      case 'available':
        return 'Available';
      case 'claimed':
        return 'Claimed';
      case 'locked':
        return 'Locked';
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
    <View style={styles.container}>
      {/* 卡片主体 */}
      <ImageBackground
        source={{
          uri: 'https://your-background-image-url.com/vip-card-bg.png',
        }}
        style={styles.cardContainer}
        imageStyle={styles.backgroundImage}>
        <LinearGradient
          colors={['#4A2C7A', '#6B4C94', '#2D1B4E']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.gradientOverlay}>
          {/* 顶部文字 */}
          <View style={styles.topSection}>
            <Text
              fontSize={theme.fontSize.xs}
              color={theme.fontColor.white80}
              style={[
                styles.topText,
                {
                  textAlign: 'center',
                },
              ]}>
              Recharge ₹{needRechargeAmount.toLocaleString()} more reach level
              VIP{nextLevel}
            </Text>
          </View>

          {/* 中间金额区域 */}
          <View style={styles.middleSection}>
            <View style={styles.salaryContainer}>
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
              <Text
                fontSize={theme.fontSize.m}
                color={theme.fontColor.white80}
                style={[
                  styles.salaryLabel,
                  {
                    textAlign: 'center',
                  },
                ]}>
                Weekly Salary
              </Text>
            </View>

            {/* 装饰性元素 - 左侧 */}
            <View style={styles.decorLeft}>
              <Text fontSize={theme.fontSize.xs} color={'#FFD700'}>
                16px
              </Text>
            </View>

            {/* 装饰性元素 - 右侧 */}
            <View style={styles.decorRight}>
              <Text fontSize={theme.fontSize.xs} color={'#FFD700'}>
                10px
              </Text>
            </View>
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

          {/* 进度条区域 */}
          <View style={styles.progressSection}>
            <Text
              fontSize={theme.fontSize.xs}
              color={theme.fontColor.white60}
              style={[
                styles.progressLabel,
                {
                  textAlign: 'center',
                },
              ]}>
              ₹2,300/₹5,000(V2)
            </Text>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBg}>
                <LinearGradient
                  colors={['#FF6B35', '#FFD700', '#FF8E53']}
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
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: screenWidth - theme.paddingSize.xxl,
    alignSelf: 'center',
    marginVertical: theme.paddingSize.l,
  },
  cardContainer: {
    width: '100%',
    height: 180,
    borderRadius: theme.borderRadiusSize.l,
    overflow: 'hidden',
  },
  backgroundImage: {
    borderRadius: theme.borderRadiusSize.l,
  },
  gradientOverlay: {
    flex: 1,
    paddingHorizontal: theme.paddingSize.l,
    paddingVertical: theme.paddingSize.m,
    justifyContent: 'space-between',
  },
  topSection: {
    alignItems: 'center',
    marginBottom: theme.paddingSize.xs,
  },
  topText: {
    marginTop: theme.paddingSize.xxs,
  },
  middleSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
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
    width: '80%',
    alignItems: 'center',
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
});

export default VipClubTop;
