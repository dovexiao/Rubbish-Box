import React, {useMemo} from 'react';
import {View, Image, Animated} from 'react-native';
import LinearGradient from '@/components/basic/linear-gradient';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import Text from '@basicComponents/text';
import LazyImage from '@/components/basic/image/lazy-image';
import {useTranslation} from 'react-i18next';

const proNew = require('@/assets/imgs/promotion/promotion-new.webp');
const proWhy = require('@/assets/imgs/promotion/pro-right-why.webp');
const boxScaleIcon = require('@/assets/imgs/promotion/box_50.webp');
const proAmountSevenTopImages = [
  require('@/assets/imgs/promotion/pro-amount.webp'),
  require('@/assets/imgs/promotion/pro-amount.webp'),
  require('@/assets/imgs/promotion/pro-amount.webp'),
  require('@/assets/imgs/promotion/pro-amount.webp'),
  require('@/assets/imgs/promotion/pro-amount.webp'),
  require('@/assets/imgs/promotion/pro-amount.webp'),
  require('@/assets/imgs/promotion/box_80.webp'),
];

export interface SevenDayBonusCardProps {
  proAmountSevenImages: any[];
  sevenInfo: any[];
  canGetNum: number;
  bounceAnim: Animated.Value;
  btnAnim: Animated.Value;
  onPressWhy: () => void;
  onPressGetAll: () => void;
  onPressGetSingle: (item: any) => void;
}

const SevenDayBonusCard: React.FC<SevenDayBonusCardProps> = ({
  proAmountSevenImages,
  sevenInfo,
  canGetNum,
  bounceAnim,
  btnAnim,
  onPressWhy,
  onPressGetAll,
  onPressGetSingle,
}) => {
  const {i18n} = useTranslation();

  // 卡片标题
  const header = useMemo(() => {
    return (
      <View style={{marginTop: 12, marginBottom: 17}}>
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            elevation: 101,
            zIndex: 11,
          }}>
          <Text
            style={{color: '#fff', fontSize: 16, fontWeight: 'bold', flex: 1}}>
            {i18n.t('promotion.sevenContinueBonus.title')}
          </Text>
        </View>
      </View>
    );
  }, [i18n]);

  return (
    <View style={{marginBottom: 2, marginTop: 10}}>
      <LinearGradient
        colors={['#FA1C1B', '#A1251D']}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
        style={{
          borderRadius: 16,
          position: 'relative',
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
            style={{width: 56, height: 56, resizeMode: 'contain'}}
          />
        </View>
        <NativeTouchableOpacity
          onPressIn={onPressWhy}
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
          }}>
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

        {header}

        <View key={'first-row'} style={{alignItems: 'center', flex: 1}}>
          <View
            style={{
              width: '100%',
              marginBottom: 6,
              flexDirection: 'row',
              alignItems: 'center',
              flexWrap: 'wrap',
              paddingLeft: 5,
              paddingRight: 5,
            }}>
            {proAmountSevenImages.map((img: any, index) => {
              const imgW = 28;
              const currentItem = sevenInfo[index] ?? {};
              const status = currentItem.status;
              // 是否领取
              const received = status === 1;
              const notExpired = status !== 2;
              const canClaim = status === 0;
              const isLast = index === proAmountSevenImages.length - 1;
              return (
                <View
                  key={`seven-day${index + 1}`}
                  style={{flexBasis: !isLast ? '25%' : '50%'}}>
                  <NativeTouchableOpacity
                    onPressIn={() => {
                      if (canClaim) {
                        onPressGetSingle(currentItem);
                      }
                    }}>
                    <LinearGradient
                      key={`day${index + 1}`}
                      colors={
                        notExpired
                          ? ['#C803FF', '#FF0085']
                          : ['#CF2730', '#A11116']
                      }
                      start={{x: 0, y: 0}}
                      end={{x: 0, y: 1}}
                      style={{
                        borderRadius: 12,
                        marginLeft: 5,
                        marginRight: 5,
                        marginBottom: 8,
                        height: 80,
                      }}>
                      <View
                        style={{
                          backgroundColor: notExpired ? '#C803FF' : '#999999',
                          borderTopLeftRadius: 12,
                          borderTopRightRadius: 12,
                          alignItems: 'center',
                          justifyContent: 'center',
                          paddingTop: 4,
                          paddingBottom: 4,
                        }}>
                        <Text style={{color: '#FFFFFF', fontSize: 10}}>
                          {i18n.t(`promotion.sevenContinueBonus.week.${index}`)}
                        </Text>
                      </View>
                      {!isLast ? (
                        <View
                          style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}>
                          <Animated.Image
                            source={
                              notExpired
                                ? boxScaleIcon
                                : proAmountSevenTopImages[index]
                            }
                            style={{
                              width: imgW,
                              height: imgW,
                              resizeMode: 'contain',
                              transform: [
                                {
                                  scale: notExpired
                                    ? (bounceAnim as unknown as number)
                                    : 1,
                                },
                              ],
                            }}
                          />
                          {notExpired ? (
                            <View
                              style={{
                                position: 'relative',
                                backgroundColor: 'transparent',
                              }}>
                              <LazyImage
                                imageUrl={img?.image}
                                width={38}
                                height={18}
                                style={{backgroundColor: 'transparent'}}
                              />
                              {/*<Animated.Image*/}
                              {/*  source={require('@/assets/imgs/promotion/pro_btn_bg.webp')}*/}
                              {/*  style={{*/}
                              {/*    width: 66,*/}
                              {/*    height: 22,*/}
                              {/*    zIndex: -1,*/}
                              {/*    position: 'absolute',*/}
                              {/*    left: -14,*/}
                              {/*    transform: [*/}
                              {/*      {scale: btnAnim as unknown as number},*/}
                              {/*    ],*/}
                              {/*  }}*/}
                              {/*/>*/}
                            </View>
                          ) : (
                            <Animated.Image
                              source={{uri: img?.image}}
                              style={{
                                width: 38,
                                height: 18,
                                resizeMode: 'contain',
                                transform: [{scale: 1}],
                              }}
                            />
                          )}
                        </View>
                      ) : (
                        <View
                          style={{
                            flex: 1,
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}>
                          <Animated.Image
                            source={proAmountSevenTopImages[index]}
                            style={{
                              width: imgW,
                              height: imgW,
                              resizeMode: 'contain',
                              transform: [
                                {
                                  scale: notExpired
                                    ? (bounceAnim as unknown as number)
                                    : 2,
                                },
                              ],
                            }}
                          />
                          {notExpired ? (
                            <View
                              style={{
                                position: 'relative',
                                backgroundColor: 'transparent',
                                marginLeft: 30,
                              }}>
                              <LazyImage
                                imageUrl={img?.image}
                                width={40}
                                height={18}
                                style={{
                                  backgroundColor: 'transparent',
                                  transform: [{scale: 1.3}],
                                }}
                              />
                              {/*<Animated.Image*/}
                              {/*  source={require('@/assets/imgs/promotion/pro_btn_bg.webp')}*/}
                              {/*  width={30}*/}
                              {/*  height={22}*/}
                              {/*  style={{*/}
                              {/*    zIndex: -1,*/}
                              {/*    position: 'absolute',*/}
                              {/*    left: -10,*/}
                              {/*    top: -1,*/}
                              {/*    transform: [*/}
                              {/*      {scale: btnAnim as unknown as number},*/}
                              {/*    ],*/}
                              {/*  }}*/}
                              {/*/>*/}
                            </View>
                          ) : (
                            <Image
                              source={{uri: img?.image}}
                              style={{
                                width: 40,
                                height: 18,
                                resizeMode: 'contain',
                                marginLeft: 30,
                                transform: [{scale: 1.5}],
                              }}
                            />
                          )}
                        </View>
                      )}
                      {received && (
                        <View
                          style={{position: 'absolute', bottom: 4, right: 4}}>
                          <LazyImage
                            imageUrl={require('@/assets/imgs/promotion/selected.webp')}
                            width={15}
                            height={15}
                          />
                        </View>
                      )}
                    </LinearGradient>
                  </NativeTouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>

        <NativeTouchableOpacity
          onPress={onPressGetAll}
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
            <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 16}}>
              {canGetNum > 1
                ? i18n.t('rebate.get-all-bonus')
                : canGetNum <= 0
                ? i18n.t('rebate.go-get-bonus')
                : i18n.t('rebate.get-bonus')}
            </Text>
          </LinearGradient>
        </NativeTouchableOpacity>
      </LinearGradient>
    </View>
  );
};

export default SevenDayBonusCard;
