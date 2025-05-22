/* eslint-disable react-native/no-inline-styles */
import React, {useRef} from 'react';
import {View, ScrollView} from 'react-native';
import theme from '@/style';
import {
  background,
  borderRadius,
  flex,
  fontColor,
  fontSize,
  margin,
  padding,
  // position,
} from '@/components/style';
import Text from '@basicComponents/text';
import LazyImage from '@/components/basic/image';
import {chevronUp} from '../proxy.variable';
// import Sort from './sort';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import Drawer from './userModal';
import {SafeAny} from '@/types';
import Spin from '@/components/basic/spin';
// import LinearGradient from '@basicComponents/linear-gradient';
import TableError from './tableError';
import globalStore from '@/services/global.state';
import {toPriceStr} from '@/utils';
import {HomeRight} from '../svg.variable';
import i18n from '@/i18n';
export const tableLeft = {
  height: 28,
  marginRight: 2,
};
export const tableLeftNew = {
  ...tableLeft,
  backgroundColor: '#F1F5F8',
};
export const tableLeftTwo = {
  ...tableLeft,
  backgroundColor: '#FFF',
};
export const TextStyle = {
  color: fontColor.white,
  fontSize: fontSize.m,
};
export const backgroundColor = {
  backgroundColor: '#EFF2F7',
};
export interface teamReportDataObj {
  userId: number;
  userCount: number;
  commissionAmount: string;
  betAmount: string;
  rechargeAmount: string;
  winLossAmount: string;
}

const Table = (props: SafeAny) => {
  const drawerRef: any = useRef(null);
  return (
    <Spin loading={props.loading} style={[]}>
      {props?.teamReportData.length === 0 ? (
        <TableError
          content={i18n.t(
            props?.parameter.searchWord
              ? 'proxy.team-report.no-search'
              : 'proxy.team-report.no-data',
          )}
        />
      ) : (
        <View style={[{paddingBottom: 30}]}>
          <View
            style={[
              theme.background.white,
              flex.flex,
              flex.row,
              flex.alignStart,
            ]}>
            <View style={[flex.row]}>
              <View style={{width: 110, height: 28}}>
                {/* <View
                  style={[
                    tableLeft,
                    theme.flex.flex,
                    theme.flex.center,
                    {width: 110, height: 28},
                  ]}>
                  <Text style={[TextStyle]}>
                    {i18n.t('proxy.team-report.user-id')}
                  </Text>
                </View> */}
                {props?.teamReportData &&
                  props?.teamReportData.map(
                    (item: teamReportDataObj, index: number) => {
                      return (
                        <NativeTouchableOpacity
                          key={index}
                          onPress={() => {
                            drawerRef?.current.showModal(item.userId);
                          }}
                          style={[
                            index % 2 === 0 ? tableLeftTwo : tableLeftNew,
                            theme.flex.flex,
                            theme.flex.center,
                            flex.row,
                            {height: 40},
                          ]}>
                          <Text style={[TextStyle, margin.rightxxs]}>
                            {item.userId}
                          </Text>
                          <HomeRight width={12} height={12} />
                        </NativeTouchableOpacity>
                      );
                    },
                  )}
              </View>
            </View>
            <ScrollView
              horizontal={true}
              onScroll={event => {
                // eslint-disable-next-line no-lone-blocks
                {
                  props.scrollViewRef.current.scrollTo({
                    x: event.nativeEvent.contentOffset.x,
                    y: 0,
                  });
                }
              }}>
              <View style={[flex.row, flex.centerByCol]}>
                <View style={[{backgroundColor: '#D8E2E7', width: 100}]}>
                  {/* <View style={[padding.rights, padding.leftl]}>
                    <Sort title={i18n.t('proxy.team-report.user')} />
                  </View> */}
                  <View
                    style={[{backgroundColor: '#fff'}]}
                    onLayout={({nativeEvent}) => {
                      props.setUserWidth(nativeEvent.layout.width);
                    }}>
                    {props?.teamReportData?.map(
                      (item: teamReportDataObj, index: number) => {
                        return (
                          <View
                            key={index}
                            style={[
                              index % 2 === 0 ? tableLeftTwo : tableLeftNew,
                              theme.flex.flex,
                              {marginRight: 0, height: 40},
                              padding.rights,
                              padding.leftl,
                              flex.centerByRow,
                            ]}>
                            <Text style={[TextStyle, {textAlign: 'center'}]}>
                              {item.userCount}
                            </Text>
                          </View>
                        );
                      },
                    )}
                  </View>
                </View>
                <View style={[{backgroundColor: '#D8E2E7', width: 100}]}>
                  {/* <View style={[padding.rights]}>
                    <Sort title={i18n.t('proxy.team-report.recharge')} />
                  </View> */}
                  <View
                    onLayout={({nativeEvent}) => {
                      props.setRechargeWidth(nativeEvent.layout.width);
                    }}>
                    {props?.teamReportData?.map(
                      (item: teamReportDataObj, index: number) => {
                        return (
                          <View
                            key={index}
                            style={[
                              index % 2 === 0 ? tableLeftTwo : tableLeftNew,
                              theme.flex.flex,
                              theme.flex.center,
                              padding.rights,
                              {marginRight: 0, height: 40},
                            ]}>
                            <Text style={[TextStyle]}>
                              {toPriceStr(+(item.rechargeAmount || 0), {
                                fixed: 2,
                                currency: globalStore.currency,
                                thousands: true,
                                suffixUnit: 'K',
                                overPrice: 100000,
                              })}
                            </Text>
                          </View>
                        );
                      },
                    )}
                  </View>
                </View>
                <View style={[{backgroundColor: '#D8E2E7', width: 100}]}>
                  {/* <View style={[padding.rights]}>
                    <Sort title={i18n.t('proxy.team-report.betting')} />
                  </View> */}
                  <View
                    onLayout={({nativeEvent}) => {
                      props.setBettingWidth(nativeEvent.layout.width);
                    }}>
                    {props?.teamReportData?.map(
                      (item: teamReportDataObj, index: number) => {
                        return (
                          <View
                            key={index}
                            style={[
                              index % 2 === 0 ? tableLeftTwo : tableLeftNew,
                              theme.flex.flex,
                              theme.flex.center,
                              padding.rights,
                              {marginRight: 0, height: 40},
                            ]}>
                            <Text style={[TextStyle]}>
                              {toPriceStr(+(item.betAmount || 0), {
                                fixed: 2,
                                currency: globalStore.currency,
                                thousands: true,
                                suffixUnit: 'K',
                                overPrice: 100000,
                              })}
                            </Text>
                          </View>
                        );
                      },
                    )}
                  </View>
                </View>
                <View style={[{backgroundColor: '#D8E2E7', width: 100}]}>
                  {/* <View style={[padding.rights]}>
                    <Sort title={i18n.t('proxy.team-report.commission')} />
                  </View> */}
                  <View
                    onLayout={({nativeEvent}) => {
                      props.setCommissionWidth(nativeEvent.layout.width);
                    }}>
                    {props?.teamReportData?.map(
                      (item: teamReportDataObj, index: number) => {
                        return (
                          <View
                            key={index}
                            style={[
                              index % 2 === 0 ? tableLeftTwo : tableLeftNew,
                              theme.flex.flex,
                              theme.flex.center,
                              theme.flex.alignEnd,
                              padding.rights,
                              {marginRight: 0, height: 40},
                            ]}>
                            <Text style={[TextStyle]}>
                              {toPriceStr(+(item.commissionAmount || 0), {
                                fixed: 2,
                                currency: globalStore.currency,
                                thousands: true,
                                suffixUnit: 'K',
                                overPrice: 100000,
                              })}
                            </Text>
                          </View>
                        );
                      },
                    )}
                  </View>
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
          {props?.teamReportData.length < props?.totalSize && (
            <NativeTouchableOpacity
              onPress={() => {
                !props?.loading && props?.handleNext();
              }}
              style={[
                margin.l,
                background.white,
                padding.tbs,
                padding.lrl,
                borderRadius.xs,
                flex.row,
                flex.center,
              ]}>
              <Text
                style={[
                  {
                    color: fontColor.second,
                    fontSize: 20,
                    textAlign: 'center',
                  },
                  margin.rightxxs,
                ]}>
                {i18n.t('proxy.team-report.next')}
              </Text>
              <LazyImage
                imageUrl={chevronUp}
                occupancy="#0000"
                width={14}
                height={14}
              />
            </NativeTouchableOpacity>
          )}
          <Drawer ref={drawerRef} />
        </View>
      )}
    </Spin>
  );
};
export default Table;
