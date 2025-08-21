/* eslint-disable react-native/no-inline-styles */
import theme from '@/style';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {View, ScrollView} from 'react-native';
import Text from '@/components/basic/text';
import i18n from '@/i18n';
import LinearGradient from '@/components/basic/linear-gradient';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import Picker from '../../../components/business/filter/picker';
import LazyImage from '@/components/basic/image';
import {sanImg} from '../proxy.variable';
import {
  HomeBettingIcon,
  HomeNewUserIcon,
  HomeRechargeIcon,
  HomeBetUserIcon,
} from '../svg.variable';
import {getTeamReportData} from '../proxy.service';
import {SafeAny} from '@/types';
import getDay from '@components/utils/getDay';
import dayjs from 'dayjs';
import {useFocusEffect} from '@react-navigation/native';
import {toPriceStr} from '@/utils';
import baseVariable from '@/style/base.variable';
// const textBox = {
//   width: 24,
//   height: 4,
// };
const LinearGradientBox = {
  maxWidth: 360,
  height: 25,
  borderRadius: 13,
};
// const transparent = {
//   backgroundColor: 'transparent',
// };
interface getTeamReportDataObj {
  betAmount: string;
  betCommissionAmount: string;
  newUserCount: number;
  rechargeAmount: string;
  rechargeCommissionAmount: string;
  rechargeUserCount: number;
}
const ProxyTeamReportResult: React.FC = () => {
  const [date, setDate] = useState([
    {name: 'today', status: true, value: 0},
    {name: 'yesterday', status: false, value: 1},
    {name: 'threedays', status: false, value: 3},
    {name: 'sevendays', status: false, value: 7},
    {name: 'fifteendays', status: false, value: 15},
    {name: 'thirtydays', status: false, value: 30},
  ]);
  const [range, setRange] = useState<SafeAny>({});
  const [timeIndex, setTimeIndex] = useState(0);
  const pickerRef: SafeAny = useRef(null);
  const [teamReportData, setTeamReportData] = useState<getTeamReportDataObj>();
  const handleOpenPick = () => {
    pickerRef.current.handleOpen();
  };
  // dateTime
  const {startDate, endDate} = useMemo(() => {
    let dateArr: SafeAny =
      timeIndex === 10 ? range : getDay(date[timeIndex].value);
    // eslint-disable-next-line @typescript-eslint/no-shadow
    let startDate = dateArr[0];
    // eslint-disable-next-line @typescript-eslint/no-shadow
    let endDate = dateArr[1];
    return {startDate, endDate};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeIndex, range]);
  useFocusEffect(
    useCallback(() => {
      handleGetTeamReportData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startDate, range]),
  );
  const handleGetTeamReportData = () => {
    getTeamReportData({startDate, endDate}).then((res: SafeAny) => {
      setTeamReportData(res);
    });
  };
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const handleConfirm = (range: SafeAny) => {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const startDate = dayjs(range.startDate).format('YYYYMMDD');
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const endDate = dayjs(range.endDate).format('YYYYMMDD');
    setRange([startDate, endDate]);
    setTimeIndex(10);
  };
  return (
    <View
      style={[
        theme.margin.lrl,
        theme.margin.topl,
        theme.padding.l,
        theme.borderRadius.m,
        {
          backgroundColor: theme.basicColor.newBgInTwo,
        },
      ]}>
      <View style={[theme.flex.col, theme.flex.between]}>
        <View
          style={[theme.flex.row, theme.flex.between, theme.flex.centerByCol]}>
          <LinearGradient
            start={{x: 0, y: 1}}
            end={{x: 0, y: 0}}
            style={[LinearGradientBox, theme.flex.flex1]}
            colors={baseVariable.linearGradientColor.tranProxylightLinear}>
            <ScrollView showsVerticalScrollIndicator={false} horizontal={true}>
              {date.map((item, index) => {
                return (
                  <NativeTouchableOpacity
                    onPress={() => {
                      let data = [...date];
                      data.map(val => (val.status = false));
                      data[index].status = !data[index].status;
                      setDate([...data]);
                      setTimeIndex(index);
                    }}
                    key={item.name}
                    style={[
                      theme.padding.rightm,
                      theme.flex.center,
                      {marginLeft: index === 0 ? 8 : 0},
                    ]}>
                    <Text
                      // color={theme.fontColor.white}
                      fontSize={
                        item.status ? theme.fontSize.m : theme.fontSize.s
                      }
                      color={
                        item.status
                          ? theme.basicColor.newFontYellow
                          : theme.fontColor.white
                      }
                      fontWeight={item.status ? '700' : '500'}>
                      {i18n.t('proxy.team.' + item.name)}
                    </Text>
                    {/* {item.status ? (
                      <Text
                        style={[
                          textBox,
                          theme.margin.topxxs,
                          theme.background.primary,
                        ]}
                      />
                    ) : (
                      <Text
                        style={[textBox, transparent, theme.margin.topxxs]}
                      />
                    )} */}
                  </NativeTouchableOpacity>
                );
              })}
            </ScrollView>
          </LinearGradient>
          <NativeTouchableOpacity onPress={handleOpenPick}>
            <View
              style={[
                theme.padding.tbxxs,
                theme.padding.lrs,
                theme.borderRadius.xs,
                theme.flex.flex,
                theme.flex.row,
                theme.flex.center,
                theme.border.shallow,
                {
                  marginLeft: 28,
                  backgroundColor: theme.basicColor.newButtonYellow,
                },
              ]}>
              {startDate ? (
                <View style={[{overflow: 'hidden', flexWrap: 'nowrap'}]}>
                  <Text
                    style={[{color: 'white', fontWeight: '700', fontSize: 14}]}>
                    {dayjs(startDate, 'YYYYMMDD').format('DD/MM')}
                  </Text>
                </View>
              ) : null}
              <View style={[{marginLeft: 8}]}>
                <LazyImage
                  imageUrl={sanImg}
                  occupancy="#0000"
                  width={theme.iconSize.xs}
                  height={theme.iconSize.xs}
                />
              </View>
            </View>
          </NativeTouchableOpacity>
        </View>
        <View
          style={[
            theme.flex.flex,
            theme.flex.row,
            theme.flex.between,
            theme.padding.tbl,
          ]}>
          <View>
            <View
              style={[theme.flex.flex, theme.flex.row, theme.flex.centerByCol]}>
              <HomeNewUserIcon
                width={theme.iconSize.s}
                height={theme.iconSize.s}
                stroke={theme.basicColor.primary15}
              />
              <Text
                white
                style={[
                  {fontSize: theme.fontSize.s, opacity: 0.7},
                  {fontWeight: '500'},
                  theme.margin.leftxxs,
                ]}>
                {i18n.t('proxy.team-report.new-user')}
              </Text>
            </View>
            <Text
              white
              style={[theme.margin.topxxs, {fontSize: theme.fontSize.m}]}
              blod>
              {teamReportData?.newUserCount}
            </Text>
          </View>
          <View>
            <View
              style={[theme.flex.flex, theme.flex.row, theme.flex.centerByCol]}>
              <HomeBetUserIcon
                width={theme.iconSize.s}
                height={theme.iconSize.s}
                stroke={theme.basicColor.primary15}
              />
              <Text
                white
                style={[
                  {fontSize: theme.fontSize.s, opacity: 0.7},
                  {fontWeight: '500'},
                  theme.margin.leftxxs,
                ]}>
                {i18n.t('proxy.user.recharge-user')}
              </Text>
            </View>
            <Text
              white
              style={[theme.margin.topxxs, {fontSize: theme.fontSize.m}]}
              blod>
              {teamReportData?.rechargeUserCount}
            </Text>
          </View>
        </View>
        <View style={[theme.flex.flex, theme.flex.row, theme.flex.between]}>
          <View>
            <View
              style={[theme.flex.flex, theme.flex.row, theme.flex.centerByCol]}>
              <HomeRechargeIcon
                width={theme.iconSize.s}
                height={theme.iconSize.s}
                stroke={theme.basicColor.primary15}
              />
              <Text
                white
                style={[
                  {fontSize: theme.fontSize.s, opacity: 0.7},
                  {fontWeight: '500'},
                  theme.margin.leftxxs,
                ]}>
                {i18n.t('proxy.team-report.recharge')}
              </Text>
            </View>
            <Text
              white
              style={[theme.margin.topxxs, {fontSize: theme.fontSize.m}]}
              blod>
              {toPriceStr(+(teamReportData?.rechargeAmount || 0))}
            </Text>
            <View
              style={[
                theme.flex.flex,
                theme.flex.row,
                theme.flex.centerByCol,
                theme.margin.tops,
              ]}>
              <Text
                white
                style={[
                  {fontSize: theme.fontSize.s, opacity: 0.7},
                  {fontWeight: '500'},
                ]}>
                {i18n.t('proxy.team-report.recharge-commission')}
              </Text>
            </View>
            <Text
              white
              style={[theme.margin.topxxs, {fontSize: theme.fontSize.m}]}
              blod>
              {toPriceStr(+(teamReportData?.rechargeCommissionAmount || 0))}
            </Text>
          </View>
          <View
            style={[{width: 1}, {backgroundColor: 'rgba(255,255,255,0.3)'}]}
          />
          <View>
            <View
              style={[theme.flex.flex, theme.flex.row, theme.flex.centerByCol]}>
              <HomeBettingIcon
                width={theme.iconSize.s}
                height={theme.iconSize.s}
                stroke={theme.basicColor.primary15}
              />
              <Text
                white
                style={[
                  {fontSize: theme.fontSize.s, opacity: 0.7},
                  {fontWeight: '500'},
                  theme.margin.leftxxs,
                ]}>
                {i18n.t('proxy.team-report.betting')}
              </Text>
            </View>
            <Text
              white
              style={[theme.margin.topxxs, {fontSize: theme.fontSize.m}]}
              blod>
              {toPriceStr(+(teamReportData?.betAmount || 0))}
            </Text>
            <View
              style={[
                theme.flex.flex,
                theme.flex.row,
                theme.flex.centerByCol,
                theme.margin.tops,
              ]}>
              <Text
                white
                style={[
                  {fontSize: theme.fontSize.s, opacity: 0.7},
                  {fontWeight: '500'},
                ]}>
                {i18n.t('proxy.team-report.betting-commission')}
              </Text>
            </View>
            <Text
              white
              style={[theme.margin.topxxs, {fontSize: theme.fontSize.m}]}
              blod>
              {toPriceStr(+(teamReportData?.betCommissionAmount || 0))}
            </Text>
          </View>
        </View>
      </View>
      <Picker ref={pickerRef} handleConfirm={handleConfirm} />
    </View>
  );
};

export default ProxyTeamReportResult;
