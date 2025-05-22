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

const InviteFriends = () => {
  const {} = useTranslation();
  const {screenWidth, calculateItemWidth} = useSettingWindowDimensions();
  const imageWidth = screenWidth - theme.paddingSize.xxl * 2;

  return (
    <LazyImageLGBackground
      style={[theme.fill.fill, theme.flex.col]}
      showBottomBG={false}>
      <DetailNavTitle
        title={'InviteFriends'}
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
                },
              ]}
              source={{
                uri: 'https://apk.megadreamlottery.com/manager/21dac7b4dba24960be20a791a1519d7d.png',
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
              Invite your friends
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
              Earn money by sharing and recommending friends
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
              Indra Lottery is a leading online casino offering the best slots
              and casino games. It's easy to recommend Indra Lottery to your
              friends all you have to do is share your unique referral link with
              your friends via email or social media. You'll receive in credits
              for every eligible friend who signs up and makes their first
              deposit. Referral bonuses are a great way for players to earn
              extra money, especially if they have a lot of friends who love
              playing casino games online. Recommend MageDream to your friends
              today so they can enjoy the best online casino experience in the
              world.
            </Text>
            <Image
              style={[
                {
                  width: imageWidth,
                  height: imageWidth,

                  marginTop: 30,
                },
              ]}
              source={{
                uri: 'https://apk.megadreamlottery.com/manager/16d111b2e44749ad9133e8ce556e616b.png',
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
              What is Refer a Friend?
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
              At Indra Lottery Online Casino, referring a friend has never been
              easier. In short, Refer a Friend is an online casino promotion
              that rewards players for referring friends to the casino. For
              every eligible friend who registers and makes a deposit, the
              player will receive a free bonus.
            </Text>
          </View>

          <View style={[theme.flex.flex, theme.flex.center, {marginTop: 30}]}>
            <Text
              fontSize={theme.fontSize.xxxxxl}
              fontWeight="700"
              style={[
                {
                  color: theme.basicColor.primary60,
                },
              ]}>
              How does it work?
            </Text>
            <Image
              style={[
                {
                  width: calculateItemWidth(128),
                  height: calculateItemWidth(128),

                  marginTop: 30,
                },
              ]}
              source={{
                uri: 'https://apk.megadreamlottery.com/manager/8b5da34303d645668f8e24d8a8c695c2.png',
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
              Create an account on IndraLottery
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
              View referral link on the Invite Friends page
            </Text>
            <Image
              style={[
                {
                  width: calculateItemWidth(128),
                  height: calculateItemWidth(128),

                  marginTop: 30,
                },
              ]}
              source={{
                uri: 'https://apk.megadreamlottery.com/manager/3f1e28413cc84dcea0bad7c74f67317f.png',
              }}
            />
            <Text
              fontSize={theme.fontSize.l}
              fontWeight="400"
              style={[
                {
                  color: '#FFFFFF',
                  textAlign: 'center',
                  marginTop: 30,
                },
              ]}>
              Invite your friends to register and play games on IndraLottery
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
              Promote IndraLottery as the best online gambling site among your
              friends!
            </Text>
            <Image
              style={[
                {
                  width: calculateItemWidth(128),
                  height: calculateItemWidth(128),

                  marginTop: 30,
                },
              ]}
              source={{
                uri: 'https://apk.megadreamlottery.com/manager/fe649e9b6b444ec9a33ab36af78402a1.png',
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
              Receive your commission
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
              Wait for your commission to be deposited directly into your
              account and withdraw instantly via the payment method of your
              choice!
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
            <Text
              fontSize={theme.fontSize.xxxxxl}
              fontWeight="700"
              style={[
                {
                  color: theme.basicColor.primary60,
                },
              ]}>
              Your advantages
            </Text>
            <LinearGradient
              style={[
                theme.borderRadius.xl,
                {
                  width: '100%',
                  aspectRatio: '343/257',
                  border: '1px solid rgba(255,255,255,0.2)',
                  marginTop: 30,
                },
              ]}
              colors={['rgba(0, 0, 0, 1)', 'rgba(0, 83, 22, 0.20)']}>
              <View
                style={[
                  theme.fill.fill,
                  theme.flex.flex,
                  theme.flex.centerByCol,
                  theme.flex.around,
                  {
                    paddingLeft: 35,
                    paddingRight: 35,
                    paddingTop: 8,
                    paddingBottom: 8,
                  },
                ]}>
                <Image
                  style={[
                    {
                      width: calculateItemWidth(157),
                      height: calculateItemWidth(157),
                      aspectRatio: 1,
                    },
                  ]}
                  source={{
                    uri: 'https://apk.megadreamlottery.com/manager/de32476012e941a3aea75e174b17d49b.png',
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
                  Signing up is very simple
                </Text>
                <Text
                  fontSize={theme.fontSize.l}
                  fontWeight="400"
                  style={[
                    {
                      color: '#FFFFFF',
                    },
                  ]}>
                  It only takes 10 seconds for your friends to get a Indra
                  Lottery account!
                </Text>
              </View>
            </LinearGradient>
            <LinearGradient
              style={[
                theme.borderRadius.xl,
                {
                  width: '100%',
                  aspectRatio: '343/257',
                  border: '1px solid rgba(255,255,255,0.2)',
                  marginTop: 30,
                },
              ]}
              colors={['rgba(0, 0, 0, 1)', 'rgba(21, 0, 83, 0.20)']}>
              <View
                style={[
                  theme.fill.fill,
                  theme.flex.flex,
                  theme.flex.centerByCol,
                  theme.flex.around,
                  {
                    paddingLeft: 35,
                    paddingRight: 35,
                    paddingTop: 8,
                    paddingBottom: 8,
                  },
                ]}>
                <Image
                  style={[
                    {
                      width: calculateItemWidth(157),
                      height: calculateItemWidth(157),
                    },
                  ]}
                  source={{
                    uri: 'https://apk.megadreamlottery.com/manager/e22f9ab6b4ba4a64a945854f0b4f1f96.png',
                  }}
                />
                <Text
                  fontSize={18}
                  fontWeight="700"
                  style={[
                    {
                      color: '#FFFFFF',
                      textAlign: 'center',
                    },
                  ]}>
                  Bonuses will be given to you and your friends
                </Text>
                <Text
                  fontSize={theme.fontSize.l}
                  fontWeight="400"
                  style={[
                    {
                      color: '#FFFFFF',
                    },
                  ]}>
                  This is the most generous offer on the market right now!
                </Text>
              </View>
            </LinearGradient>
            <LinearGradient
              style={[
                theme.borderRadius.xl,
                {
                  width: '100%',
                  aspectRatio: '343/257',
                  border: '1px solid rgba(255,255,255,0.2)',
                  marginTop: 30,
                },
              ]}
              colors={['rgba(0, 0, 0, 1)', 'rgba(0, 40, 83, 0.20)']}>
              <View
                style={[
                  theme.fill.fill,
                  theme.flex.flex,
                  theme.flex.centerByCol,
                  theme.flex.around,
                  {
                    paddingLeft: 35,
                    paddingRight: 35,
                    paddingTop: 8,
                    paddingBottom: 8,
                  },
                ]}>
                <Image
                  style={[
                    {
                      width: calculateItemWidth(157),
                      height: calculateItemWidth(157),
                    },
                  ]}
                  source={{
                    uri: 'https://apk.megadreamlottery.com/manager/e5308004e2eb4015b188562807dccf61.png',
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
                  Fast Payment Fast Payment
                </Text>
                <Text
                  fontSize={theme.fontSize.l}
                  fontWeight="400"
                  style={[
                    {
                      color: '#FFFFFF',
                    },
                  ]}>
                  IndraLottery is one of the best gaming platforms in the world
                  Your friends will love it.
                </Text>
              </View>
            </LinearGradient>
          </View>

          <View style={[theme.flex.flex, theme.flex.center, {marginTop: 30}]}>
            <Text
              fontSize={theme.fontSize.xxxxxl}
              fontWeight="700"
              style={[
                {
                  color: theme.basicColor.primary60,
                  textAlign: 'center',
                },
              ]}>
              How do I invite my friends and earn money?
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
              Simply log into your account, click on the menu in the top left
              corner and select "Refer a Friend". This page will generate your
              own unique link, copy your exclusive referral link and you can
              share it with friends and people interested in gambling via social
              media, text messages, emails, carrier pigeons, or tell the nosy
              neighbor on the street to share it with anyone. Your referral uses
              your link to sign up as a Indra Lottery member. Your friend makes
              a deposit and you get a cash bonus! Referral bonuses are a great
              way for players to earn extra income, especially if they have a
              lot of friends who love playing casino games online. You can refer
              You can refer as many friends as you want, so don't hesitate!
            </Text>
            <Button
              style={[{width: 251, height: 44, marginTop: 30}]}
              type="linear-primary"
              radius={theme.borderRadiusSize.xxxxxxl}
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
                Invite friends
              </Text>
            </Button>
          </View>

          <View style={[theme.flex.flex, theme.flex.center, {marginTop: 30}]}>
            <Image
              style={[
                {
                  width: imageWidth,
                  height: imageWidth,
                },
              ]}
              source={{
                uri: 'https://apk.megadreamlottery.com/manager/61e3d5fde7464e7cab146f04e90d918f.png',
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
              When do I get paid for referring a friend?
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
              For every successful referral, you will have a chance to cash in
              your account. Remember, the referee must register through your
              unique referral link and make the first deposit to get paid,
              understand?
            </Text>
          </View>
          <View style={[theme.flex.flex, theme.flex.center, {marginTop: 30}]}>
            <Image
              style={[
                {
                  width: imageWidth,
                  height: imageWidth,
                },
              ]}
              source={{
                uri: 'https://apk.megadreamlottery.com/manager/104ea6098de0418e803ab1e6b06be20d.png',
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
              Can my friends and referrals also receive rewards?
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
              Yes! The people you refer will sign up without making a deposit
              and will not only receive free chips, but also special offers
              because your friends are also our friends.
            </Text>
          </View>
          <View style={[theme.flex.flex, theme.flex.center, {marginTop: 30}]}>
            <Image
              style={[
                {
                  width: imageWidth,
                  height: imageWidth,
                },
              ]}
              source={{
                uri: 'https://apk.megadreamlottery.com/manager/13cd7788b7e644859fd92ce8a8a8f540.png',
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
              How do I qualify to become a referral?
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
              Anyone can recommend Indra Lottery to their friends, friends or
              acquaintances. All you need is an active player account to get
              your unique referral code and start making money immediately.
            </Text>
          </View>
          <View style={[theme.flex.flex, theme.flex.center, {marginTop: 30}]}>
            <Image
              style={[
                {
                  width: imageWidth,
                  height: imageWidth,
                },
              ]}
              source={{
                uri: 'https://apk.megadreamlottery.com/manager/73748e6de1a240dea4524f1e890a685d.png',
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
              What types of refer-a-friend bonuses are there in Indra Lottery?
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
              At MeqaDream online casino, players can get free bonuses after
              successfully recommending friends to deposit in the casino.
              Additional invitation task bonuses will also be obtained when the
              number of players that the customer can recommend to the casino
              reaches the corresponding number of players and recharge
              requirements of the invitation task
            </Text>
          </View>
          <View style={[theme.flex.flex, theme.flex.center, {marginTop: 30}]}>
            <Image
              style={[
                {
                  width: imageWidth,
                  height: imageWidth,
                },
              ]}
              source={{
                uri: 'https://apk.megadreamlottery.com/manager/fb6052c9d734446c88da9d9fe55cd800.png',
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
              How do I check my earnings?
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
              You can view your balance on your personal Refer a Friend
              dashboard, where players you refer can sort out and claim your
              rewards, including the option to share your link directly to
              various social platforms and get more information.
            </Text>
          </View>
          <View style={[theme.flex.flex, theme.flex.center, {marginTop: 30}]}>
            <Image
              style={[
                {
                  width: imageWidth,
                  height: imageWidth,
                },
              ]}
              source={{
                uri: 'https://apk.megadreamlottery.com/manager/c16917a96d67417a9686151fd3021fc0.png',
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
              How to get referral link?
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
              Create an account on IndraLottery. click on the Refer a Friend
              section. Your referral link will appear there and you can start
              sharing right away!
            </Text>
          </View>

          <ImageBackground
            style={[
              {
                width: imageWidth,
                height: calculateItemWidth(153),
                marginTop: 30,
              },
            ]}
            source={{
              uri: 'https://mega-dream.oss-ap-southeast-1.aliyuncs.com/manager/0c6fff4a9091499c9780f719519cf08a.webp',
            }}>
            <View
              style={[
                theme.fill.fill,
                theme.flex.flex,
                theme.flex.centerByCol,
                theme.flex.around,
                {
                  paddingTop: 25,
                  paddingBottom: 25,
                },
              ]}>
              <Text
                fontSize={24}
                fontWeight="700"
                style={[
                  {
                    color: '#FFFFFF',
                  },
                ]}>
                No invite link?
              </Text>
              <Button
                style={[theme.margin.topl, {width: 251, height: 44}]}
                type="linear-primary"
                radius={theme.borderRadiusSize.xxxxxxl}
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
                  Become a VIP
                </Text>
              </Button>
            </View>
          </ImageBackground>

          {/* <View style={[{marginTop: 30}]}>
            <Text
              fontSize={theme.fontSize.xxxxxl}
              fontWeight="700"
              style={[
                {
                  color: theme.basicColor.primary60,
                },
              ]}>
              How do I invite my friends?
            </Text>
            <Text
              fontSize={theme.fontSize.l}
              fontWeight="400"
              style={[
                {
                  color: '#6A67A2',
                  marginTop: 8,
                },
              ]}>
              1. Log in to your MegaDream account and find the "Menu" in the
              upper right corner of your mobile screen.
            </Text>
            <Image
              style={[
                {
                  width: imageWidth,
                  aspectRatio: '343/112',

                  marginTop: 8,
                },
              ]}
              source={{uri:'https://mega-dream.oss-ap-southeast-1.aliyuncs.com/manager/80a8799eb4e74f2bbdf84e10153994ea.webp'}}
            />
            <Text
              fontSize={theme.fontSize.l}
              fontWeight="400"
              style={[
                {
                  color: '#6A67A2',
                  marginTop: 8,
                },
              ]}>
              2. Select "Recommend to a friend"
            </Text>
            <Image
              style={[
                {
                  width: imageWidth,
                  aspectRatio: '343/325',

                  marginTop: 8,
                },
              ]}
              source={{uri:'https://mega-dream.oss-ap-southeast-1.aliyuncs.com/manager/7ac41ececdce42fd989e13cfb356ebc1.webp'}}
            />
            <Text
              fontSize={theme.fontSize.l}
              fontWeight="400"
              style={[
                {
                  color: '#6A67A2',
                  marginTop: 8,
                },
              ]}>
              3. Select a plan and copy your unique referral link. You can share
              this link on your social media accounts such as Facebook, Twitter,
              TikTok, Whatsapp, SMS, etc. You can also add up to 5 friends’
              email addresses so that they receive your unique link. Tell your
              friends to check their spam folders Remember: Your friend cannot
              have an existing account at MegaDream and must be eligible to hold
              an account,
            </Text>
            <Image
              style={[
                {
                  width: imageWidth,
                  aspectRatio: '343/695',

                  marginTop: 8,
                },
              ]}
              source={{uri:'https://mega-dream.oss-ap-southeast-1.aliyuncs.com/manager/2b8b2ee9b0634f168b1696530658793b.webp'}}
            />
          </View> */}

          <View style={[{marginTop: 30}]}>
            <Text
              fontSize={theme.fontSize.xxxxxl}
              fontWeight="700"
              style={[
                {
                  color: theme.basicColor.primary60,
                  textAlign: 'center',
                },
              ]}>
              Refer a Friend Bonus Terms and Conditions:
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
              1. In this promotion, a "Referrer" is a person who invites a
              friend to play, and a "Referred Friend" is a person who is invited
              to play.
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
              2. In order to receive the Refer a Friend benefit, the Referrer
              must have made at least one deposit at Indra Lottery Casino.
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
              3. In order to receive any benefits, the Referrer's balance must
              have no pending withdrawals.
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
              4. Only new players (players who do not have an account at Indra
              Indra Lottery Casino) will be considered as Refer a Friend.
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
              5. Only customers who are eligible to play at the casino will be
              considered as Refer a Friend.
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
              6. The Referred Friend must successfully make their first deposit
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
              7. The Referrer and the Referred Friend are eligible for the Refer
              a Friend promotion only if the Referred Friend registers at Indra
              Indra Lottery Casino via a unique referral link.
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
              8. For every friend you refer who deposits at Indra Lottery
              Casino, the Referrer will receive a free bonus.
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
              9. The "Refer a Friend" bonus will be credited to the Referrer's
              casino account by the next day
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
              10. The Referrer must wager the Refer a Friend bonus before making
              any withdrawal request.
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
              11. Any party is eligible to participate in the "Refer a Friend"
              promotion
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
              12. Both the referrer and the referred friend must meet all of the
              above requirements. The referrer and the referred friend must not
              be from the same household or have the same IP address.
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
              13. Indra Lottery Casino reserves the right to change or terminate
              this promotion at any time without prior notice.
            </Text>
          </View>

          <View style={[theme.flex.flex, theme.flex.center, {marginTop: 30}]}>
            <Text
              fontSize={24}
              fontWeight="700"
              style={[
                {
                  color: '#FFFFFF',
                  textAlign: 'center',
                },
              ]}>
              Are you ready to make money with us?
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
              Create your free account now, start playing and having fun
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
        </View>
        <View style={[{marginTop: 30}]}>
          <ImageBackground
            style={[
              {
                width: screenWidth,
                height: calculateItemWidth(193),
              },
            ]}
            source={{
              uri: 'https://apk.megadreamlottery.com/manager/fa7fd1f2ac314002a02b18d48d92d01c.webp',
            }}
          />
        </View>
      </ScrollView>
    </LazyImageLGBackground>
  );
};
export default InviteFriends;
