/* eslint-disable react-native/no-inline-styles */
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
import LinearGradient from '@basicComponents/linear-gradient';
import Text from '@basicComponents/text';
import {getTeamReportDataList} from './proxy.service';

import {
  basicColor,
  borderRadius,
  flex,
  fontColor,
  fontSize,
  padding,
  position,
} from '@/components/style';
import {ScrollView} from 'react-native-gesture-handler';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import Sort from './components/sort';
import {SafeAny} from '@/types';
import {useFocusEffect} from '@react-navigation/native';
import DetailNavTitle from '@/components/business/detail-nav-title';
import {goBack} from '@/utils';
import {useInnerStyle} from './proxy.hooks';
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
  const tableRef: any = useRef(null);
  const userSortRef: any = useRef(null);
  const rechargeSortRef: any = useRef(null);
  const bettingSortRef: any = useRef(null);
  const commissionSortRef: any = useRef(null);
  const scrollViewRef: any = useRef(null);
  const [phone, setPhone] = useState('');
  const [totalSize, setTotalSize] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userWidth, setUserWidth] = useState(63);
  const [rechargeWidth, setRechargeWidth] = useState(78);
  const [bettingWidth, setBettingWidth] = useState(78);
  const [commissionWidth, setCommissionWidth] = useState(93);
  const [search, setSearch] = useState(false);
  const [teamReportData, setTeamReportData] = useState<teamReportDataObj[]>([]);
  const {size} = useInnerStyle();
  const handleRefresh = async () => {
    setRefreshing(true);
    setSearch(true);
  };

  const [parameter, setParameter] = useState<SafeAny>({
    pageNo: 1,
    pageSize: 15,
    userSort: 0,
    rechargeSort: 0,
    bettingSort: 0,
    commissionSort: 0,
    searchWord: '',
  });
  const handleTeamReportDataList = (paramet: SafeAny, next: boolean) => {
    setLoading(true);
    getTeamReportDataList(paramet)
      .then((res: SafeAny) => {
        setLoading(false);
        let arr: teamReportDataObj[] = [];
        let data: SafeAny = arr.concat(teamReportData);
        setTotalSize(res.totalSize);
        if (refreshing || !next) {
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
    handleTeamReportDataList(
      {...parameter, pageNo: parameter.pageNo + 1},
      true,
    );
  };
  useFocusEffect(
    useCallback(() => {
      if (search) {
        handleTeamReportDataList(parameter, false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshing]),
  );

  useEffect(() => {
    if (!phone) {
      parameter.pageNo = 1;
      setTotalSize(10);
      setTeamReportData([]);
    }
    setParameter({
      ...parameter,
      searchWord: phone,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone]);

  return (
    <LazyImageLGBackground style={[{height: size.screenHeight}, flex.col]}>
      <DetailNavTitle
        onBack={goBack}
        hideServer
        hideAmount
        title={i18n.t('proxy.team.title')}
      />
      <ScrollView
        stickyHeaderIndices={[0]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        style={[theme.flex.col, theme.flex.flex, flex.flex1]}>
        <View style={[{height: 104}]}>
          <View
            style={[
              // theme.background.white,
              theme.margin.lrl,
              theme.borderRadius.xl,
              {height: 64},
            ]}>
            <View style={[theme.margin.l]}>
              <View
                style={[
                  flex.flex,
                  flex.row,
                  flex.between,
                  flex.centerByCol,
                  {height: 40},
                ]}>
                <View style={[flex.flex1]}>
                  <ProxySearch
                    searchValue={phone}
                    onSearchValueChange={setPhone}
                    placeholder={i18n.t('proxy.team.search')}
                    serach={true}
                  />
                </View>
                <NativeTouchableOpacity
                  onPress={() => {
                    setSearch(true);
                    handleTeamReportDataList(parameter, false);
                  }}
                  style={[searchBox, borderRadius.xs, flex.center]}>
                  <Text style={[searchText, {fontWeight: 'bold'}]}>Search</Text>
                </NativeTouchableOpacity>
              </View>
            </View>
          </View>
          {totalSize > 0 && (
            <View style={[padding.l, {height: 40}]}>
              <Text color={fontColor.yellow} fontSize={14}>
                Found <Text color={basicColor.primary}>{totalSize}</Text>{' '}
                results in the search.
              </Text>
            </View>
          )}
          <View
            style={[
              flex.flex,
              flex.row,
              flex.alignStart,
              theme.margin.topl,
              {height: 28},
            ]}>
            <View style={[flex.row, {height: 28}]}>
              <View
                style={[
                  tableLeft,
                  theme.flex.flex,
                  theme.flex.center,
                  {width: 110, backgroundColor: theme.basicColor.newBgInTwo},
                ]}>
                <Text style={[TextStyle]}>
                  {i18n.t('proxy.team-report.user-id')}
                </Text>
              </View>
            </View>
            <ScrollView horizontal={true} ref={scrollViewRef}>
              <View style={[flex.row, flex.centerByCol]}>
                <View style={[{backgroundColor: theme.basicColor.newBgInTwo}]}>
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
                      }}
                    />
                  </View>
                </View>
                <View style={[{backgroundColor: theme.basicColor.newBgInTwo}]}>
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
                      }}
                    />
                  </View>
                </View>
                <View style={[{backgroundColor: theme.basicColor.newBgInTwo}]}>
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
                      }}
                    />
                  </View>
                </View>
                <View style={[{backgroundColor: theme.basicColor.newBgInTwo}]}>
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
                      }}
                    />
                  </View>
                </View>
              </View>
            </ScrollView>
            <View style={[position.abs, {right: 0, height: '100%'}]}>
              <LinearGradient
                style={[{width: 32, height: '100%'}, flex.center]}
                colors={['#fff', 'rgba(255, 255, 255, 0.00)']}
                start={{x: 1, y: 1}}
                end={{x: 0, y: 1}}
              />
            </View>
          </View>
        </View>
        <View style={[{}]}>
          <Table
            ref={tableRef}
            scrollViewRef={scrollViewRef}
            refreshing={refreshing}
            loading={loading}
            setUserWidth={setUserWidth}
            setRechargeWidth={setRechargeWidth}
            setBettingWidth={setBettingWidth}
            setCommissionWidth={setCommissionWidth}
            teamReportData={teamReportData}
            totalSize={totalSize}
            handleNext={handleNext}
            parameter={parameter}
          />
        </View>
      </ScrollView>
    </LazyImageLGBackground>
  );
};

export default ProxyTeamReport;
