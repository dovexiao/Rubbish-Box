import React, {useEffect} from 'react';
import {ScrollView, View, ImageBackground} from 'react-native';
import DetailNavTitle from '@businessComponents/detail-nav-title';
import {goBack, goTo} from '@utils';
import {useTranslation} from 'react-i18next';
import {LazyImageLGBackground} from '@/components/basic/image';
import theme from '@/style';
import Text from '@basicComponents/text';
import Button from '@/components/basic/button';
// import LinearGradient from '@basicComponents/linear-gradient';
import {useSettingWindowDimensions} from '@/store/useSettingStore';
import VipClubList from './vip-club-list';
import useVipStore, {useVipActions} from '@/store/useVipStore';

const VipClub = () => {
  const {i18n} = useTranslation();
  const {screenWidth, calculateItemWidth} = useSettingWindowDimensions();
  const imageWidth = screenWidth - theme.paddingSize.xxl * 2;
  const {vipConfigList} = useVipStore();

  const {setVipConfig} = useVipActions();

  useEffect(() => {
    setVipConfig();
  }, [setVipConfig]);

  return (
    <LazyImageLGBackground style={[theme.fill.fill, theme.flex.col]}>
      <DetailNavTitle
        title={i18n.t('vipclub.detail.title')}
        hideAmount
        hideServer
        onBack={goBack}
      />
      <ScrollView style={[theme.flex.flex1NoHidden, {marginBottom: 10}]}>
        <ImageBackground
          style={[
            {
              width: imageWidth,
              height: calculateItemWidth(332),
              zIndex: 2,
            },
          ]}
          source={{
            uri: 'https://apk.megadreamlottery.com/manager/2fbdfaf4692440c5aa2b74ba80976735.webp',
          }}>
          <View style={[theme.flex.flex, theme.flex.center]}>
            {/* 占位 */}
            <View
              style={[
                {
                  width: imageWidth,
                  height: 0.7 * calculateItemWidth(332),
                },
              ]}
            />
            <Text
              fontSize={24}
              fontWeight="700"
              style={[
                {
                  color: '#FFCE08',
                  textAlign: 'center',
                },
              ]}>
              Welcome to VIP Club!
            </Text>
            <Text
              fontSize={18}
              fontWeight="400"
              style={[
                {
                  color: '#FFFFFF',
                  textAlign: 'center',
                },
              ]}>
              The most unique VIP program ever
            </Text>
            <Text
              fontSize={14}
              fontWeight="400"
              style={[
                {
                  color: '#FFFFFF',
                  textAlign: 'center',
                },
              ]}>
              Become a member of supbet Club and get exclusive bonuses
            </Text>
          </View>
        </ImageBackground>
        Welcome to join Indra VIP! Explore the terrain and pass through 10 VIP
        levels to get more rewards. Once you receive an invitation, you will
        receive VIP customized benefits, such as high bonuses, cash back offers,
        VIP tournament access, you will not only receive exclusive VIP benefits,
        but also be assigned a dedicated VIP account manager, so that you can
        spend an unforgettable time in Indra!
        <Button
          style={[{width: 251, height: 44, marginTop: 30}]}
          radius={theme.borderRadiusSize.xxxxxxl}
          type="linear-primary"
          onPress={() => {
            goTo('Login');
          }}>
          <Text
            fontSize={theme.fontSize.l}
            fontWeight="700"
            style={[
              {
                color: '#FFFFFF',
              },
            ]}>
            Log in
          </Text>
        </Button>
        <Text
          fontSize={24}
          fontWeight="700"
          style={[
            {
              color: theme.basicColor.primary60,
              marginTop: 30,
            },
          ]}>
          VIP Reward Details
        </Text>
        <Text
          fontSize={16}
          fontWeight="400"
          style={[
            {
              color: '#FFFFFF',
              marginTop: 30,
            },
          ]}>
          Take advantage of my VIP program to turn your bets into exciting
          rewards Experience a thrilling adventure across 10 levels, each with
          its own unique and rewarding journey!
        </Text>
        <VipClubList vipConfigList={vipConfigList} />
        {/* <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[
            {
              height: 256,
              marginTop: 30,
            },
          ]}
          contentContainerStyle={{paddingHorizontal: 6}}>
          <View
            style={[
              {
                width: 163,
                height: 256,
                backgroundColor: 'rgba(0,0,0,0.35)',
                marginLeft: 10,
              },
            ]}>
            <Image
              style={[
                {
                  width: 163,
                  height: 91,
                  zIndex: 2,
                  marginTop: 10,
                },
              ]}
              source={{
                uri: 'https://mega-dream.oss-ap-southeast-1.aliyuncs.com/manager/78de2bc7207b4a6fa0fb9b5dafa1b345.webp',
              }}
            />
            <View
              style={[
                theme.flex.flex,
                theme.flex.row,
                theme.flex.between,
                theme.flex.centerByCol,
                theme.padding.lrxxl,
                {
                  width: '100%',
                  height: 24,
                  border: '1px solid rgba(255,255,255,0.1',
                  background: '#000000',
                  borderRadius: 2,
                  marginTop: 10,
                },
              ]}>
              <Text
                fontSize={12}
                fontWeight="400"
                style={[
                  {
                    color: '#6A67A2',
                  },
                ]}>
                Bouns
              </Text>
              <Text
                fontSize={12}
                fontWeight="400"
                style={[
                  {
                    color: '#6A67A2',
                  },
                ]}>
                0
              </Text>
            </View>
            <View
              style={[
                theme.flex.flex,
                theme.flex.row,
                theme.flex.between,
                theme.flex.centerByCol,
                theme.padding.lrxxl,
                {
                  width: '100%',
                  height: 24,
                  border: '1px solid rgba(255,255,255,0.1',
                  background: '#000000',
                  borderRadius: 2,
                  marginTop: 10,
                },
              ]}>
              <Text
                fontSize={12}
                fontWeight="400"
                style={[
                  {
                    color: '#6A67A2',
                  },
                ]}>
                Bouns
              </Text>
              <Text
                fontSize={12}
                fontWeight="400"
                style={[
                  {
                    color: '#6A67A2',
                  },
                ]}>
                0
              </Text>
            </View>
            <Button
              style={[
                theme.padding.lrxxl,
                {width: '100%', height: 44, marginTop: 30},
              ]}
              radius={22}
              type="linear-primary"
              onPress={() => {
                goTo('SingUp');
              }}>
              <Text
                fontSize={theme.fontSize.l}
                fontWeight="700"
                style={[
                  {
                    color: '#FFFFFF',
                  },
                ]}>
                Sign up
              </Text>
            </Button>
          </View>
          <View
            style={[
              {
                width: 163,
                height: 256,
                backgroundColor: 'rgba(0,0,0,0.35)',
                marginLeft: 10,
              },
            ]}>
            <Image
              style={[
                {
                  width: 163,
                  height: 91,
                  zIndex: 2,
                  marginTop: 10,
                },
              ]}
              source={{
                uri: 'https://mega-dream.oss-ap-southeast-1.aliyuncs.com/manager/78de2bc7207b4a6fa0fb9b5dafa1b345.webp',
              }}
            />
            <View
              style={[
                theme.flex.flex,
                theme.flex.row,
                theme.flex.between,
                theme.flex.centerByCol,
                theme.padding.lrxxl,
                {
                  width: '100%',
                  height: 24,
                  border: '1px solid rgba(255,255,255,0.1',
                  background: '#000000',
                  borderRadius: 2,
                  marginTop: 10,
                },
              ]}>
              <Text
                fontSize={12}
                fontWeight="400"
                style={[
                  {
                    color: '#6A67A2',
                  },
                ]}>
                Bouns
              </Text>
              <Text
                fontSize={12}
                fontWeight="400"
                style={[
                  {
                    color: '#6A67A2',
                  },
                ]}>
                0
              </Text>
            </View>
            <View
              style={[
                theme.flex.flex,
                theme.flex.row,
                theme.flex.between,
                theme.flex.centerByCol,
                theme.padding.lrxxl,
                {
                  width: '100%',
                  height: 24,
                  border: '1px solid rgba(255,255,255,0.1',
                  background: '#000000',
                  borderRadius: 2,
                  marginTop: 10,
                },
              ]}>
              <Text
                fontSize={12}
                fontWeight="400"
                style={[
                  {
                    color: '#6A67A2',
                  },
                ]}>
                Bouns
              </Text>
              <Text
                fontSize={12}
                fontWeight="400"
                style={[
                  {
                    color: '#6A67A2',
                  },
                ]}>
                0
              </Text>
            </View>
            <Button
              style={[
                theme.padding.lrxxl,
                {width: '100%', height: 44, marginTop: 30},
              ]}
              radius={22}
              type="linear-primary"
              onPress={() => {
                goTo('SingUp');
              }}>
              <Text
                fontSize={theme.fontSize.l}
                fontWeight="700"
                style={[
                  {
                    color: '#FFFFFF',
                  },
                ]}>
                Sign up
              </Text>
            </Button>
          </View>
          <View
            style={[
              {
                width: 163,
                height: 256,
                backgroundColor: 'rgba(0,0,0,0.35)',
                marginLeft: 10,
              },
            ]}>
            <Image
              style={[
                {
                  width: 163,
                  height: 91,
                  zIndex: 2,
                  marginTop: 10,
                },
              ]}
              source={{
                uri: 'https://mega-dream.oss-ap-southeast-1.aliyuncs.com/manager/78de2bc7207b4a6fa0fb9b5dafa1b345.webp',
              }}
            />
            <View
              style={[
                theme.flex.flex,
                theme.flex.row,
                theme.flex.between,
                theme.flex.centerByCol,
                theme.padding.lrxxl,
                {
                  width: '100%',
                  height: 24,
                  border: '1px solid rgba(255,255,255,0.1',
                  background: '#000000',
                  borderRadius: 2,
                  marginTop: 10,
                },
              ]}>
              <Text
                fontSize={12}
                fontWeight="400"
                style={[
                  {
                    color: '#6A67A2',
                  },
                ]}>
                Bouns
              </Text>
              <Text
                fontSize={12}
                fontWeight="400"
                style={[
                  {
                    color: '#6A67A2',
                  },
                ]}>
                0
              </Text>
            </View>
            <View
              style={[
                theme.flex.flex,
                theme.flex.row,
                theme.flex.between,
                theme.flex.centerByCol,
                theme.padding.lrxxl,
                {
                  width: '100%',
                  height: 24,
                  border: '1px solid rgba(255,255,255,0.1',
                  background: '#000000',
                  borderRadius: 2,
                  marginTop: 10,
                },
              ]}>
              <Text
                fontSize={12}
                fontWeight="400"
                style={[
                  {
                    color: '#6A67A2',
                  },
                ]}>
                Bouns
              </Text>
              <Text
                fontSize={12}
                fontWeight="400"
                style={[
                  {
                    color: '#6A67A2',
                  },
                ]}>
                0
              </Text>
            </View>
            <Button
              style={[
                theme.padding.lrxxl,
                {width: '100%', height: 44, marginTop: 30},
              ]}
              radius={22}
              type="linear-primary"
              onPress={() => {
                goTo('SingUp');
              }}>
              <Text
                fontSize={theme.fontSize.l}
                fontWeight="700"
                style={[
                  {
                    color: '#FFFFFF',
                  },
                ]}>
                Sign up
              </Text>
            </Button>
          </View>
        </ScrollView> */}
      </ScrollView>
    </LazyImageLGBackground>
  );
};
export default VipClub;
