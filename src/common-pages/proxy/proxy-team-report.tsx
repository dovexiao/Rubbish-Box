/* eslint-disable react-native/no-inline-styles */
import DetailNavTitle from '@/components/business/detail-nav-title';
import i18n from '@/i18n';
import theme from '@/style';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View, RefreshControl} from 'react-native';
import Table, {
  TextStyle,
  tableLeft,
  teamReportDataObj,
} from './components/table';
import ProxySearch from './components/proxy-search';
import {goBack, goTo} from '@/utils';
// import LinearGradient from '@basicComponents/linear-gradient';
import Text from '@basicComponents/text';
import {getTeamReportDataList} from './proxy.service';

import {
  basicColor,
  borderRadius,
  flex,
  fontSize,
  margin,
  padding,
  // position,
} from '@/components/style';
import {ScrollView} from 'react-native-gesture-handler';
import {useInnerStyle} from './proxy.hooks';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import Sort from './components/sort';
import {SafeAny} from '@/types';
import {useFocusEffect} from '@react-navigation/native';
import Tabs from './components/tabs';
import {DateInlineFilter} from '@/components/business/filter';
import ProxyTeamReportResult from './components/proxy-team-report-result';
import dayjs from 'dayjs';
import {LazyImageLGBackground} from '@/components/basic/image';
const searchBox = {
  marginLeft: 10,
  width: 64,
  height: 40,
  backgroundColor: basicColor.newBgInOne,
};
const searchText = {
  color: '#fff',
  fontSize: fontSize.m,
};
const ProxyTeamReport = () => {
  const userSortRef: any = useRef(null);
  const rechargeSortRef: any = useRef(null);
  const bettingSortRef: any = useRef(null);
  const commissionSortRef: any = useRef(null);
  const scrollViewRef: any = useRef(null);
  const [phone, setPhone] = useState('');
  const {size} = useInnerStyle();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [teamReportData, setTeamReportData] = useState<teamReportDataObj[]>([]);
  const [userWidth, setUserWidth] = useState(63);
  const [rechargeWidth, setRechargeWidth] = useState(78);
  const [bettingWidth, setBettingWidth] = useState(78);
  const [commissionWidth, setCommissionWidth] = useState(93);
  const [dateRange, setDateRange] = useState<string[] | null>();
  const [totalSize, setTotalSize] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [next, setNext] = useState(false);
  const handleRefresh = async () => {
    setRefreshing(true);
  };
  const handleTabIndex = (str: string) => {
    setTeamReportData([]);
    setNext(false);
    setParameter({
      ...parameter,
      pageNo: 1,
      leve: Number(str),
    });
  };
  const [parameter, setParameter] = useState<SafeAny>({
    leve: 1,
    pageNo: 1,
    pageSize: 15,
    startDate: null,
    endDate: null,
    userSort: 0,
    rechargeSort: 0,
    bettingSort: 0,
    commissionSort: 0,
    searchWord: '',
  });
  useEffect(() => {
    handleTeamReportDataList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const handleTeamReportDataList = () => {
    setLoading(true);
    getTeamReportDataList(parameter)
      .then((res: SafeAny) => {
        setLoading(false);
        setTotalSize(res.totalSize);
        let arr: teamReportDataObj[] = [];
        let data: SafeAny = arr.concat(teamReportData);

        if (refreshing || next) {
          setTeamReportData(res.content);
        } else {
          setTeamReportData(data.concat(res.content));
        }
        setRefreshing(false);
      })
      .catch(() => {
        if (parameter.pageNo > 1) {
          setParameter({
            ...parameter,
            pageNo: parameter.pageNo - 1,
          });
        }
        setLoading(false);
        setRefreshing(false);
      });
  };
  const handleNext = () => {
    setParameter({
      ...parameter,
      pageNo: parameter.pageNo + 1,
    });
    setNext(false);
  };
  useFocusEffect(
    useCallback(() => {
      if (refreshing) {
        handleTeamReportDataList();
        return;
      } else {
        handleTeamReportDataList();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [parameter, refreshing]),
  );
  useEffect(() => {
    if (!phone) {
      parameter.pageNo = 1;
      setTeamReportData([]);
    } else {
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone]);
  useEffect(() => {
    if (dateRange) {
      setTeamReportData([]);
      setParameter({
        ...parameter,
        startDate: dateRange[0],
        endDate: dateRange[1],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);
  useEffect(() => {
    if (isFocused) {
      goTo('ProxyTeamReportSearch');
    }
  }, [isFocused]);
  return (
    <LazyImageLGBackground style={[{height: size.screenHeight}, flex.col]}>
      <DetailNavTitle
        onBack={goBack}
        hideServer
        hideAmount
        title={i18n.t('proxy.team.title')}
      />
      <ScrollView
        stickyHeaderIndices={[2]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        style={[theme.flex.col, theme.flex.flex]}>
        {!phone && (
          <View style={[theme.margin.lrl]}>
            <View style={[flex.row, flex.between, flex.centerByCol]}>
              <View style={[flex.flex1]}>
                <ProxySearch
                  searchValue={phone}
                  onSearchValueChange={setPhone}
                  placeholder={i18n.t('proxy.team.search')}
                  setIsFocused={setIsFocused}
                />
              </View>
              {phone && (
                <NativeTouchableOpacity
                  onPress={handleTeamReportDataList}
                  style={[searchBox, borderRadius.xs, flex.center]}>
                  <Text style={[searchText, {fontWeight: 'bold'}]}>Search</Text>
                </NativeTouchableOpacity>
              )}
            </View>
          </View>
        )}
        {!phone && <ProxyTeamReportResult />}
        {!phone && (
          <View style={[theme.margin.topl]}>
            <View
              style={[
                theme.borderRadius.s,
                theme.margin.lrl,
                {
                  height: 80,
                  backgroundColor: theme.basicColor.newBgInTwo,
                },
              ]}>
              <View
                style={[
                  flex.flex,
                  flex.row,
                  flex.between,
                  theme.margin.lrl,
                  theme.margin.topl,
                  {
                    marginBottom: 4,
                  },
                ]}>
                <View style={[theme.flex.center]}>
                  <Text
                    style={[
                      {color: theme.fontColor.white},
                      {fontSize: fontSize.m},
                      {fontWeight: 'bold'},
                    ]}>
                    {i18n.t('proxy.team-report.my-teams')}
                  </Text>
                </View>
                <View
                  style={[theme.flex.flex, theme.flex.row, theme.flex.between]}>
                  <DateInlineFilter
                    requiredInit={false}
                    validRange={{
                      startDate: dayjs().subtract(1, 'month').toDate(),
                      endDate: new Date(),
                    }}
                    dateRange={dateRange}
                    onDateRangeChanged={setDateRange}
                  />
                </View>
              </View>
              <View style={[margin.btms, flex.between, flex.row]}>
                <Tabs handleTabIndex={handleTabIndex} />
              </View>
            </View>
            <View
              style={[
                flex.flex,
                flex.row,
                flex.alignStart,
                theme.margin.topl,
                {height: 28, backgroundColor: theme.basicColor.newBgInTwo},
              ]}>
              <View
                style={[
                  tableLeft,
                  theme.flex.flex,
                  theme.flex.center,
                  {width: 110, height: 28},
                ]}>
                <Text style={[TextStyle]}>
                  {i18n.t('proxy.team-report.user-id')}
                </Text>
              </View>
              <ScrollView horizontal={true} ref={scrollViewRef}>
                <View
                  style={[
                    flex.row,
                    flex.centerByCol,
                    {height: 28, backgroundColor: theme.basicColor.newBgInTwo},
                  ]}>
                  <View
                    style={[padding.rights, padding.leftl, {width: userWidth}]}>
                    <Sort
                      ref={userSortRef}
                      title={i18n.t('proxy.team-report.user')}
                      handleClick={() => {
                        let obj: any = {...parameter};
                        obj.userSort = userSortRef.current.num();
                        rechargeSortRef.current.handelSetNum(0);
                        bettingSortRef.current.handelSetNum(0);
                        commissionSortRef.current.handelSetNum(0);
                        setParameter({
                          ...obj,
                          pageNo: 1,
                          rechargeSort: 0,
                          bettingSort: 0,
                          commissionSort: 0,
                        });
                        setNext(true);
                      }}
                    />
                  </View>
                  <View style={[padding.rights, {width: rechargeWidth}]}>
                    <Sort
                      title={i18n.t('proxy.team-report.recharge')}
                      ref={rechargeSortRef}
                      handleClick={() => {
                        let obj: any = {...parameter};
                        obj.rechargeSort = rechargeSortRef.current.num();
                        userSortRef.current.handelSetNum(0);
                        bettingSortRef.current.handelSetNum(0);
                        commissionSortRef.current.handelSetNum(0);
                        setParameter({
                          ...obj,
                          pageNo: 1,
                          userSort: 0,
                          bettingSort: 0,
                          commissionSort: 0,
                        });
                        setNext(true);
                      }}
                    />
                  </View>
                  <View style={[padding.rights, {width: bettingWidth}]}>
                    <Sort
                      title={i18n.t('proxy.team-report.betting')}
                      ref={bettingSortRef}
                      handleClick={() => {
                        let obj: any = {...parameter};
                        obj.bettingSort = bettingSortRef.current.num();
                        userSortRef.current.handelSetNum(0);
                        rechargeSortRef.current.handelSetNum(0);
                        commissionSortRef.current.handelSetNum(0);
                        setParameter({
                          ...obj,
                          pageNo: 1,
                          userSort: 0,
                          rechargeSort: 0,
                          commissionSort: 0,
                        });
                        setNext(true);
                      }}
                    />
                  </View>
                  <View style={[padding.rights, {width: commissionWidth}]}>
                    <Sort
                      title={i18n.t('proxy.team-report.commission')}
                      ref={commissionSortRef}
                      handleClick={() => {
                        let obj: any = {...parameter};
                        obj.commissionSort = commissionSortRef.current.num();
                        userSortRef.current.handelSetNum(0);
                        rechargeSortRef.current.handelSetNum(0);
                        bettingSortRef.current.handelSetNum(0);
                        setParameter({
                          ...obj,
                          pageNo: 1,
                          userSort: 0,
                          rechargeSort: 0,
                          bettingSort: 0,
                        });
                        setNext(true);
                      }}
                    />
                  </View>
                </View>
              </ScrollView>
              {/* <View style={[position.abs, {right: 0, height: '100%'}]}>
                <LinearGradient
                  style={[{width: 32, height: '100%'}, flex.center]}
                  colors={['#fff', 'rgba(255, 255, 255, 0.00)']}
                  start={{x: 1, y: 1}}
                  end={{x: 0, y: 1}}
                />
              </View> */}
            </View>
          </View>
        )}
        <Table
          scrollViewRef={scrollViewRef}
          refreshing={refreshing}
          setUserWidth={setUserWidth}
          setRechargeWidth={setRechargeWidth}
          setBettingWidth={setBettingWidth}
          setCommissionWidth={setCommissionWidth}
          loading={loading}
          handleNext={handleNext}
          teamReportData={teamReportData}
          parameter={parameter}
          totalSize={totalSize}
        />
      </ScrollView>
    </LazyImageLGBackground>
  );
};

export default ProxyTeamReport;
