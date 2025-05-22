import React from 'react';
import {Image, ScrollView, View, ImageBackground} from 'react-native';
import DetailNavTitle from '@businessComponents/detail-nav-title';
import {goBack, goTo} from '@utils';
import {useTranslation} from 'react-i18next';
import {LazyImageLGBackground} from '@/components/basic/image';
import theme from '@/style';
import Text from '@basicComponents/text';
import Button from '@/components/basic/button';
import LinearGradient from '@basicComponents/linear-gradient';
import {useSettingWindowDimensions} from '@/store/useSettingStore';

const AgentFranchise = () => {
  const {i18n} = useTranslation();
  const {screenWidth, calculateItemWidth} = useSettingWindowDimensions();
  const imageWidth = screenWidth - theme.paddingSize.xxl * 2;
  return (
    <LazyImageLGBackground
      style={[theme.fill.fill, theme.flex.col]}
      showBottomBG={false}>
      <DetailNavTitle
        title={i18n.t('agentfranchise.detail.title')}
        hideAmount
        hideServer
        onBack={goBack}
      />
      <ScrollView style={[theme.flex.flex1NoHidden]}>
        <View style={[theme.padding.lrxxl]}>
          <View style={[theme.flex.flex, theme.flex.center]}>
            <Image
              style={[
                {
                  width: imageWidth,
                  height: imageWidth,
                  zIndex: 2,
                },
              ]}
              source={{
                uri: 'https://apk.megadreamlottery.com/manager/9c43249fe05d4f6b981afeff58e78b60.png',
              }}
            />
            <Text
              fontSize={theme.fontSize.xxxxxl}
              fontWeight="700"
              style={[
                {
                  color: theme.basicColor.primary60,
                  marginTop: 30,
                },
              ]}>
              Become an agent
            </Text>
            <Text
              fontSize={theme.fontSize.l}
              fontWeight="400"
              style={[
                {
                  color: '#FFFFFF',
                  marginTop: 30,
                },
              ]}>
              The most trusted gaming site
            </Text>
            <Text
              fontSize={theme.fontSize.l}
              fontWeight="400"
              style={[
                {
                  color: '#6A67A2',
                  marginTop: 30,
                },
              ]}>
              We have a special offer for you - a unique affiliate program with
              more generous referral rewards. We have put together a separate
              program with special conditions. Join the IndraLottery affiliate
              program and start earning commissions right away.
            </Text>
          </View>

          <View style={[theme.flex.flex, theme.flex.center, {marginTop: 30}]}>
            <Image
              style={[
                {
                  width: imageWidth,
                  height: imageWidth,
                  zIndex: 2,
                },
              ]}
              source={{
                uri: 'https://apk.megadreamlottery.com/manager/24f7262f13cb463d8b640ed69ff95361.png',
              }}
            />
            <Text
              fontSize={theme.fontSize.xxxxxl}
              fontWeight="700"
              style={[
                {
                  color: theme.basicColor.primary60,
                  marginTop: 30,
                },
              ]}>
              How to become an agent?
            </Text>
            <Text
              fontSize={theme.fontSize.l}
              fontWeight="400"
              style={[
                {
                  color: '#6A67A2',
                  marginTop: 30,
                },
              ]}>
              It only takes 2 simple steps to join the IndraLottery Affiliate
              Program and start earning commissions immediately.
            </Text>
            <Image
              style={[
                {
                  width: calculateItemWidth(128),
                  height: calculateItemWidth(128),
                  zIndex: 2,
                  marginTop: 30,
                },
              ]}
              source={{
                uri: 'https://apk.megadreamlottery.com/manager/1e2c5c87b44e41b980fe9a5bb722d0ad.png',
              }}
            />
            <Text
              fontSize={theme.fontSize.l}
              fontWeight="400"
              style={[
                {
                  color: '#FFFFFF',
                  marginTop: 30,
                },
              ]}>
              Register on megadreamlottery.com
            </Text>
            <Text
              fontSize={theme.fontSize.l}
              fontWeight="400"
              style={[
                {
                  color: '#6A67A2',
                  marginTop: 30,
                },
              ]}>
              Generate referral link in invitation task
            </Text>
            <Image
              style={[
                {
                  width: calculateItemWidth(128),
                  height: calculateItemWidth(128),
                  zIndex: 2,
                  marginTop: 30,
                },
              ]}
              source={{
                uri: 'https://apk.megadreamlottery.com/manager/cd6d04299e06454b838a4d27204f48ad.png',
              }}
            />
            <Text
              fontSize={theme.fontSize.l}
              fontWeight="400"
              style={[
                {
                  color: '#FFFFFF',
                  marginTop: 30,
                },
              ]}>
              Start promoting megadreamlottery.com
            </Text>
            <Text
              fontSize={theme.fontSize.l}
              fontWeight="400"
              style={[
                {
                  color: '#6A67A2',
                  marginTop: 30,
                },
              ]}>
              Share your links, monitor your traffic and enjoy your commission
            </Text>
            <Button
              style={[{width: 251, height: 44, marginTop: 30}]}
              radius={theme.borderRadiusSize.xxxxxxl}
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

          <View style={[theme.flex.flex, theme.flex.center, {marginTop: 30}]}>
            <Image
              style={[
                {
                  width: imageWidth,
                  height: imageWidth,
                  zIndex: 2,
                },
              ]}
              source={{
                uri: 'https://apk.megadreamlottery.com/manager/a0ab986fd6574e76b5a193434dd7e3d7.png',
              }}
            />
            <Text
              fontSize={theme.fontSize.xxxxxl}
              fontWeight="700"
              style={[
                {
                  color: theme.basicColor.primary60,
                  marginTop: 30,
                },
              ]}>
              Flexible commission plan
            </Text>
            <Text
              fontSize={theme.fontSize.l}
              fontWeight="400"
              style={[
                {
                  color: '#6A67A2',
                  marginTop: 30,
                },
              ]}>
              Fixed Fee, Hybrid or Profit Share: We offer various types of deals
              for our platform depending on your business model and traffic
              source. We are one of the most aggressive brands and our
              affiliates earn more than anywhere else for a long time.
            </Text>
            <ImageBackground
              style={[
                {
                  width: imageWidth,
                  height: calculateItemWidth(407),
                  zIndex: 2,
                  marginTop: 30,
                },
              ]}
              source={{
                uri: 'https://apk.megadreamlottery.com/manager/445c96d0ca8e412d941173985fc82084.png',
              }}>
              <View
                style={[
                  theme.flex.flex,
                  theme.flex.center,
                  {
                    marginTop: 140,
                    paddingLeft: 50,
                    paddingRight: 50,
                  },
                ]}>
                <Text
                  fontSize={18}
                  fontWeight="700"
                  style={[
                    {
                      color: '#FFFFFF',
                    },
                  ]}>
                  For lottery games
                </Text>
                <Text
                  fontSize={theme.fontSize.l}
                  fontWeight="400"
                  style={[
                    {
                      color: '#FFFFFF',
                      marginTop: 8,
                    },
                  ]}>
                  With every recommended bet, you will instantly receive a ?0%
                  house edge.
                </Text>
                <Text
                  fontSize={72}
                  fontWeight="700"
                  style={[
                    {
                      color: '#F97AFC',
                      marginTop: 30,
                    },
                  ]}>
                  ?0%
                </Text>
                <Text
                  fontSize={theme.fontSize.l}
                  fontWeight="400"
                  style={[
                    {
                      color: '#F97AFC',
                    },
                  ]}>
                  from house edge
                </Text>
              </View>
            </ImageBackground>
            <ImageBackground
              style={[
                {
                  width: imageWidth,
                  height: calculateItemWidth(407),
                  zIndex: 2,
                  marginTop: 30,
                },
              ]}
              source={{
                uri: 'https://apk.megadreamlottery.com/manager/1ee298c74f374b7a8f4764e125c67534.png',
              }}>
              <View
                style={[
                  theme.flex.flex,
                  theme.flex.center,
                  {
                    marginTop: 140,
                    paddingLeft: 50,
                    paddingRight: 50,
                  },
                ]}>
                <Text
                  fontSize={18}
                  fontWeight="700"
                  style={[
                    {
                      color: '#FFFFFF',
                    },
                  ]}>
                  For sports
                </Text>
                <Text
                  fontSize={theme.fontSize.l}
                  fontWeight="400"
                  style={[
                    {
                      color: '#FFFFFF',
                      marginTop: 8,
                    },
                  ]}>
                  ?0% of the platform’s house edge will be paid to you instantly
                  after every referral bet.
                </Text>
                <Text
                  fontSize={72}
                  fontWeight="700"
                  style={[
                    {
                      color: '#E7B709',
                      marginTop: 30,
                    },
                  ]}>
                  ?0%
                </Text>
                <Text
                  fontSize={theme.fontSize.l}
                  fontWeight="400"
                  style={[
                    {
                      color: '#E7B709',
                    },
                  ]}>
                  from house edge
                </Text>
              </View>
            </ImageBackground>
            <ImageBackground
              style={[
                {
                  width: imageWidth,
                  height: calculateItemWidth(407),
                  zIndex: 2,
                  marginTop: 30,
                },
              ]}
              source={{
                uri: 'https://apk.megadreamlottery.com/manager/ef45311d317f4cb9a26cb9793579b557.png',
              }}>
              <View
                style={[
                  theme.flex.flex,
                  theme.flex.center,
                  {
                    marginTop: 140,
                    paddingLeft: 50,
                    paddingRight: 50,
                  },
                ]}>
                <Text
                  fontSize={18}
                  fontWeight="700"
                  style={[
                    {
                      color: '#FFFFFF',
                    },
                  ]}>
                  For Cosino and Live
                </Text>
                <Text
                  fontSize={theme.fontSize.l}
                  fontWeight="400"
                  style={[
                    {
                      color: '#FFFFFF',
                      marginTop: 8,
                    },
                  ]}>
                  ?0% of the platform’s house edge will be paid to you instantly
                  after every referral bet.
                </Text>
                <Text
                  fontSize={72}
                  fontWeight="700"
                  style={[
                    {
                      color: '#00BE7C',
                      marginTop: 30,
                    },
                  ]}>
                  ?0%
                </Text>
                <Text
                  fontSize={theme.fontSize.l}
                  fontWeight="400"
                  style={[
                    {
                      color: '#00BE7C',
                    },
                  ]}>
                  from house edge
                </Text>
              </View>
            </ImageBackground>
            <LinearGradient
              style={[
                theme.borderRadius.xl,
                {
                  width: imageWidth,
                  aspectRatio: '343/480',
                  marginTop: 60,
                },
              ]}
              colors={[theme.basicColor.primary30, theme.basicColor.primary10]}>
              <View
                style={[
                  theme.flex.flex,
                  theme.flex.center,
                  {
                    paddingLeft: 35,
                    paddingRight: 35,
                  },
                ]}>
                <Image
                  style={[
                    {
                      width: calculateItemWidth(178),
                      height: calculateItemWidth(178),
                      zIndex: 2,
                      marginTop: 8,
                    },
                  ]}
                  source={{
                    uri: 'https://apk.megadreamlottery.com/manager/a4b782bb5c30493eb078369ebbdf0752.png',
                  }}
                />
                <Text
                  fontSize={18}
                  fontWeight="700"
                  style={[
                    {
                      color: '#FFFFFF',
                    },
                  ]}>
                  Do you want to have a popular gaming website?
                </Text>
                <Text
                  fontSize={theme.fontSize.l}
                  fontWeight="400"
                  style={[
                    {
                      color: '#FFFFFF',
                      marginTop: 8,
                    },
                  ]}>
                  We have a special offer for you - a unique affiliate program
                  with more generous referral bonuses. We will prepare a
                  separate program with special conditions. Contact our managers
                  to discuss terms
                </Text>
                <Text
                  fontSize={theme.fontSize.l}
                  fontWeight="400"
                  style={[
                    {
                      color: '#FFFFFF',
                      marginTop: 8,
                    },
                  ]}>
                  *Important: Only users who meet the manager's requirements and
                  are approved by the manager can participate in the program.
                </Text>
              </View>
            </LinearGradient>
          </View>

          <View style={[theme.flex.flex, theme.flex.center, {marginTop: 30}]}>
            <Image
              style={[
                {
                  width: imageWidth,
                  height: imageWidth,
                  zIndex: 2,
                },
              ]}
              source={{
                uri: 'https://apk.megadreamlottery.com/manager/a83d6173d1c44fb4bbce5df69e1d9f8a.png',
              }}
            />
            <Text
              fontSize={theme.fontSize.xxxxxl}
              fontWeight="700"
              style={[
                {
                  color: theme.basicColor.primary60,
                  marginTop: 30,
                },
              ]}>
              Hot conversation rate
            </Text>
            <Text
              fontSize={18}
              fontWeight="700"
              style={[
                {
                  color: theme.basicColor.primary15,
                  marginTop: 30,
                },
              ]}>
              Our product offering is unique, providing a complete iGaming
              product including sports betting and casino.
            </Text>
            <Text
              fontSize={theme.fontSize.l}
              fontWeight="400"
              style={[
                {
                  color: '#6A67A2',
                  marginTop: 30,
                },
              ]}>
              Combine an aggressive brand awareness strategy, clinical
              reputation and mobile-centric development with a native i0S
              .Android app and you’ll get the highest conversation rate* for
              your traffic.
            </Text>
            <Button
              style={[{width: 251, height: 44, marginTop: 30}]}
              radius={theme.borderRadiusSize.xxxxxxl}
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

          <View style={[theme.flex.flex, theme.flex.center, {marginTop: 30}]}>
            <Image
              style={[
                {
                  width: imageWidth,
                  height: imageWidth,
                  zIndex: 2,
                },
              ]}
              source={{
                uri: 'https://apk.megadreamlottery.com/manager/040f399cd1a646cc9b540a34a5379d6d.png',
              }}
            />
            <Text
              fontSize={theme.fontSize.xxxxxl}
              fontWeight="700"
              style={[
                {
                  color: theme.basicColor.primary60,
                  textAlign: 'center',
                  marginTop: 30,
                },
              ]}>
              Global Products and Operations
            </Text>
            <Text
              fontSize={theme.fontSize.l}
              fontWeight="400"
              style={[
                {
                  color: '#6A67A2',
                  marginTop: 30,
                },
              ]}>
              Serving multiple countries in multiple languages ​​with fully
              localized customer support 24 hours a day, 365 days a year. Money
              never sleeps. Neither do global sales. You no longer need to worry
              about our ability to serve you.
            </Text>
          </View>

          <View style={[theme.flex.flex, theme.flex.center, {marginTop: 30}]}>
            <Image
              style={[
                {
                  width: imageWidth,
                  height: imageWidth,
                  zIndex: 2,
                },
              ]}
              source={{
                uri: 'https://apk.megadreamlottery.com/manager/eb93bbf90ffa499aa7ecb3b8b4dda40d.png',
              }}
            />
            <Text
              fontSize={theme.fontSize.xxxxxl}
              fontWeight="700"
              style={[
                {
                  color: theme.basicColor.primary60,
                  textAlign: 'center',
                  marginTop: 30,
                },
              ]}>
              Dedicated Alliance Manager
            </Text>
            <Text
              fontSize={theme.fontSize.l}
              fontWeight="400"
              style={[
                {
                  color: '#6A67A2',
                  marginTop: 30,
                },
              ]}>
              Once you join, you will have a dedicated affiliate manager who
              will answer all your questions and help you grow.
            </Text>
          </View>

          <View style={[theme.flex.flex, theme.flex.center, {marginTop: 30}]}>
            <Image
              style={[
                {
                  width: imageWidth,
                  height: imageWidth,
                  zIndex: 2,
                },
              ]}
              source={{
                uri: 'https://apk.megadreamlottery.com/manager/fb3438328e124b6fb5bf3aa6268e5e68.png',
              }}
            />
            <Text
              fontSize={theme.fontSize.xxxxxl}
              fontWeight="700"
              style={[
                {
                  color: theme.basicColor.primary60,
                  marginTop: 30,
                },
              ]}>
              Exclusive agent activities
            </Text>
            <Text
              fontSize={theme.fontSize.l}
              fontWeight="400"
              style={[
                {
                  color: '#6A67A2',
                  marginTop: 30,
                },
              ]}>
              We regularly invite our members to exclusive events to have fun
              together, talk business or celebrate our successes. It's a great
              time to expand your network and enjoy an amazing party.
            </Text>
          </View>
        </View>
        <View style={[theme.flex.flex, theme.flex.center, {marginTop: 30}]}>
          <ImageBackground
            style={[
              {
                width: screenWidth,
                height: calculateItemWidth(545),
                zIndex: 2,
              },
            ]}
            source={{
              uri: 'https://apk.megadreamlottery.com/manager/33cb1ee708ed4396b3eb124b0bfe7136.png',
            }}>
            <View
              style={[
                theme.flex.flex,
                theme.flex.center,
                theme.padding.l,
                {
                  marginTop: 60,
                },
              ]}>
              <Text
                fontSize={24}
                fontWeight="700"
                style={[
                  {
                    color: '#FFFFFF',
                    textAlign: 'center',
                  },
                ]}>
                Join Indra Lottery Agent Program
              </Text>
              <Text
                fontSize={theme.fontSize.l}
                fontWeight="400"
                style={[
                  {
                    color: '#FFFFFF',
                    marginTop: 30,
                  },
                ]}>
                Get your personal benefits through MegeDreem
              </Text>
              <Button
                style={[{width: 251, height: 44, marginTop: 80}]}
                radius={theme.borderRadiusSize.xxxxxxl}
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
          </ImageBackground>
        </View>
      </ScrollView>
    </LazyImageLGBackground>
  );
};
export default AgentFranchise;
