import React, {useMemo} from 'react';
import {View, Image, Platform, StyleSheet} from 'react-native';
import LinearGradient from '@/components/basic/linear-gradient';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import Text from '@basicComponents/text';
import theme from '@style';

const proNew = require('@/assets/imgs/promotion/promotion-new.webp');
const proWhy = require('@/assets/imgs/promotion/pro-right-why.webp');
const amountClaim = require('@/assets/imgs/promotion/claim.webp');

export interface RechargeBonusCardProps {
  login: boolean;
  currentTime: number;
  isXiaomi: boolean;
  proAmountImages: any[];
  rechargeInfo: any;
  onPressGoDeposit: () => void;
  onPressWhy: () => void; // open modal with type 0
  i18n: any;
}

const RechargeBonusCard: React.FC<RechargeBonusCardProps> = ({
  login,
  isXiaomi,
  proAmountImages,
  rechargeInfo,
  onPressGoDeposit,
  onPressWhy,
  i18n,
}) => {
  const progressBottom = useMemo(
    () =>
      Platform.select({
        web: 22,
        android: isXiaomi ? 25 : 24,
        default: 24,
      }) as number,
    [isXiaomi],
  );

  return (
    <View
      style={{
        marginTop: 10,
        marginBottom: 2,
      }}>
      <LinearGradient
        colors={['#FA1C1B', '#A1251D']}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
        style={{
          borderRadius: 16,
          position: 'relative',
          padding: 16,
          paddingBottom: 4,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 4},
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}>
        <View
          style={{
            position: 'absolute',
            top: -3,
            left: -1,
            borderTopLeftRadius: 16,
            borderBottomRightRadius: 20,
            elevation: 100,
            zIndex: 10,
            backgroundColor: 'transparent',
          }}>
          <Image
            source={proNew}
            style={{
              width: 56,
              height: 56,
              resizeMode: 'contain',
            }}
          />
        </View>

        <NativeTouchableOpacity
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            borderTopRightRadius: 16,
            borderBottomLeftRadius: 20,
            elevation: 100,
            zIndex: 10,
            width: 40,
            height: 22,
            backgroundColor: 'rgba(255,255,255,0.2)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPressIn={onPressWhy}>
          <View>
            <Image
              source={proWhy}
              style={{
                width: 12,
                height: 12,
                resizeMode: 'contain',
                backgroundColor: 'transparent',
              }}
            />
          </View>
        </NativeTouchableOpacity>

        <View style={{marginTop: 10, marginBottom: 10}}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: login ? 'space-between' : 'center',
              alignItems: 'center',
            }}>
            <Text
              style={{
                color: '#fff',
                fontSize: 16,
                fontWeight: 'bold',
                flex: 1,
                marginRight: 12,
                display: 'flex',
                justifyContent: login ? 'flex-start' : 'center',
                alignItems: 'center',
                textAlign: 'center',
              }}>
              {i18n.t('promotion.continueBonus')}
            </Text>
            {/*{login && (*/}
            {/*  <CountDown remain={currentTime ? Math.round(currentTime / 1000) : 0} />*/}
            {/*)}*/}
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
            paddingHorizontal: 8,
            position: 'relative',
            backgroundColor: 'transparent',
          }}>
          {proAmountImages.map((img: any, index) => {
            const currentItem = (rechargeInfo?.list ?? [])[index];
            return (
              <View key={index} style={{alignItems: 'center', flex: 1}}>
                <View
                  style={{
                    width: 54,
                    height: 63,
                    position: 'relative',
                    left: 3,
                    top: index === 0 ? 3 : 0,
                  }}>
                  <Image
                    source={{uri: img?.image}}
                    style={{
                      width: 54,
                      height: 63,
                      resizeMode: 'contain',
                      zIndex: 10,
                      backgroundColor: 'transparent',
                    }}
                  />
                </View>

                <View
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 4,
                    position: 'relative',
                    zIndex: 10,
                    backgroundColor: 'transparent',
                  }}>
                  {currentItem?.status ? (
                    <Image
                      source={amountClaim}
                      style={{
                        width: 16,
                        height: 16,
                        zIndex: 10,
                        transform: [{scale: 1}],
                      }}
                    />
                  ) : (
                    <View style={styles.checkmark} />
                  )}
                </View>
                <Text style={{color: '#fff', fontSize: 11, fontWeight: '500'}}>
                  {index === 0
                    ? '1st'
                    : index === 1
                    ? '2nd'
                    : index === 2
                    ? '3st'
                    : '4st'}
                </Text>
              </View>
            );
          })}

          <View style={[styles.progressSection, {bottom: progressBottom}]}>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBg}>
                <LinearGradient
                  colors={['#C803FF', '#FF0085']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={[
                    styles.progressBarFill,
                    {width: `${Math.min(1 * 100, 100)}%`},
                  ]}
                />
              </View>
            </View>
          </View>
        </View>

        <NativeTouchableOpacity
          onPress={onPressGoDeposit}
          style={{alignItems: 'center'}}>
          <LinearGradient
            colors={['#FE8A1A', '#FEBC0A']}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            style={{
              position: 'relative',
              alignItems: 'center',
              marginBottom: 8,
              width: '80%',
              borderRadius: 25,
              paddingVertical: 12,
              shadowColor: '#FF6347',
              shadowOffset: {width: 0, height: 4},
              shadowOpacity: 0.4,
              shadowRadius: 6,
              elevation: 6,
            }}>
            <Text
              numberOfLines={1}
              style={{
                color: theme.fontColor.white,
                fontWeight: 'bold',
                fontSize: 16,
              }}>
              {i18n.t('rebate.go-get-bonus')}
            </Text>
          </LinearGradient>
        </NativeTouchableOpacity>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  checkmark: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.fontColor.white60,
  },
  progressSection: {
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: -1,
    elevation: 1,
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
});

export default RechargeBonusCard;
