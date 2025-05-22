import React from 'react';

import {useSettingWindowDimensions} from '@/store/useSettingStore';

import CustomCard from './custom-card';
import Text from '@basicComponents/text';
import theme from '@/style';
import {View} from 'react-native';
import LazyImage from '@/components/basic/image/lazy-image';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import LinearGradient from '@/components/basic/linear-gradient';
import useWelfareStore, {useWelfareStoreActions} from '@/store/useWelfareStore';
import {useToast} from '@/components/basic/modal';
import {postNewUserGetAward, WelfareCheckingItem} from '../welfare.service';
import useUserStore from '@/store/useUserStore';
import {goTo} from '@/utils';

const NewUserCard = () => {
  const {screenWidth} = useSettingWindowDimensions();
  const {renderModal, show} = useToast();
  const {wealNewUserInfo} = useWelfareStore(state => state.welfareHomeData);
  const {getWelfareHomeData} = useWelfareStoreActions();
  const defaultItemWidth = (screenWidth - 48 - 26) / 4;
  const lastItemWidth = screenWidth - 50 - defaultItemWidth * 2 - 16;

  //（0未领取、1待领取、2已领取、3已过期）
  const itemColor = (status: number) => {
    let colors = {
      lgColors: ['#3aa157', '#397888'],
      borderColor: theme.basicColor.primary15,
      btnLGColors: [theme.basicColor.primary30, theme.basicColor.primary50],
      btnBorderColor: '#FFFFFF1A',
    };
    switch (status) {
      case 1:
        colors = {
          lgColors: ['#3aa157', '#397888'],
          borderColor: '#52812a',
          btnLGColors: [theme.basicColor.primary30, theme.basicColor.primary50],
          btnBorderColor: '#FFFFFF1A',
        };
        break;
      case 2:
        colors = {
          lgColors: ['#3aa157', '#397888'],
          borderColor: theme.basicColor.primary15,
          btnLGColors: ['#433A8A', '#433A8A'],
          btnBorderColor: '#FFFFFF1A',
        };
        break;
      case 3:
        colors = {
          lgColors: ['#3aa157', '#397888'],
          borderColor: '#52812a',
          btnLGColors: ['#85a975', '#317036'],
          btnBorderColor: '#FFFFFF1A',
        };
        break;
    }
    return colors;
  };

  const onPressDrawdown = async (item: WelfareCheckingItem) => {
    const token = useUserStore.getState().token;
    if (!token) {
      goTo('Login');
      return;
    }
    if (item?.status !== 1) {
      return;
    }
    try {
      await postNewUserGetAward(wealNewUserInfo?.issueNo, item?.date);
      show({
        type: 'success',
        message: 'success',
      });
      await getWelfareHomeData();
    } catch (error) {}
  };

  return (
    <CustomCard title="New User Rewards">
      <View
        style={[
          theme.flex.flex,
          theme.flex.row,
          theme.flex.wrap,
          theme.margin.l,
          // eslint-disable-next-line react-native/no-inline-styles
          {gap: 8},
        ]}>
        {wealNewUserInfo?.newUserInfoList.map((item, index) => {
          return (
            <LinearGradient
              key={`${item?.day + index}`}
              colors={itemColor(item?.status)?.lgColors}
              style={[
                theme.flex.centerByCol,
                theme.border.red,
                theme.borderRadius.m,
                theme.flex.between,
                theme.padding.topxs,
                theme.padding.btms,
                // eslint-disable-next-line react-native/no-inline-styles
                {
                  height: 107,
                  width: index === 6 ? lastItemWidth : defaultItemWidth,
                  borderWidth: 1,
                  borderColor: itemColor(item?.status)?.borderColor,
                },
              ]}>
              <View
                style={[
                  theme.flex.row,
                  theme.flex.center,
                  theme.padding.lrl,
                  // eslint-disable-next-line react-native/no-inline-styles
                  {
                    width: index === 6 ? lastItemWidth : defaultItemWidth,
                    justifyContent: index === 6 ? 'space-between' : 'center',
                  },
                ]}>
                <Text white>{item?.week}</Text>
                {index === 6 ? <Text color={'white'}>JACKPOT</Text> : null}
              </View>

              <View
                style={[theme.flex.row, theme.flex.centerByCol, theme.gap.s]}>
                {item?.prizeList?.map((prizeItem, index) => {
                  return (
                    <View
                      key={`${prizeItem?.name + index}`}
                      style={[theme.flex.centerByCol]}>
                      <LazyImage
                        imageUrl={prizeItem?.icon}
                        width={24}
                        height={24}
                      />
                      <Text white>{prizeItem?.count}</Text>
                    </View>
                  );
                })}
              </View>

              <NativeTouchableOpacity
                onPress={() => {
                  onPressDrawdown(item);
                }}>
                <LinearGradient
                  colors={itemColor(item?.status).btnLGColors}
                  style={[
                    theme.padding.tbxxxs,
                    theme.padding.lrs,
                    theme.borderRadius.xl,
                    // eslint-disable-next-line react-native/no-inline-styles
                    {
                      borderColor: itemColor(item?.status).btnBorderColor,
                      borderWidth: 1,
                      opacity: item?.status === 0 ? 0.6 : 1,
                    },
                  ]}>
                  <Text white>{item?.buttonText}</Text>
                </LinearGradient>
              </NativeTouchableOpacity>
            </LinearGradient>
          );
        })}
      </View>
      {renderModal}
    </CustomCard>
  );
};

export default NewUserCard;
