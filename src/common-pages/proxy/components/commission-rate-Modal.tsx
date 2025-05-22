/* eslint-disable react-native/no-inline-styles */
import {
  background,
  basicColor,
  flex,
  fontColor,
  fontSize,
  margin,
  padding,
  // position,
} from '@/components/style';
import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import {View, Text, ScrollView} from 'react-native';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import {CloseIcon} from '../svg.variable';
import {vip1Image, vip2Image, vip3Image, vip4Image} from '../proxy.variable';
import LazyImage from '@/components/basic/image';
import i18n from '@i18n';
import {getCommissionRate} from '../proxy.service';
import Drawer, {DrawerRef} from '@/components/basic/drawer/drawer';

// Commission Rate
interface dataObj {
  agentLevel: number;
  gameIcon: string;
  gameName: string;
  gameType: number;
  tier1: string;
  tier2: string;
  tier3: string;
  tier4: string;
}
const tableLeft = {
  width: 130,
  height: 40,
  backgroundColor: basicColor.primary50,
  marginRight: 2,
};
export const tableLeftNew = {
  ...tableLeft,
  backgroundColor: basicColor.primary30,
};
const tableLeftTwo = {
  ...tableLeft,
  backgroundColor: basicColor.primary10,
};
const TextStyle = {
  color: '#ffffff',
  fontSize: fontSize.s,
};
import LinearGradient from '@basicComponents/linear-gradient';
import {SafeAny} from '@/types';
import {useShare} from '@/common-pages/hooks/share.hooks';
import Spin from '@/components/basic/spin';
import CommissionError from './commissionError';

const boxRadius = {
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
};
const ModalContent = forwardRef((props, ref: any) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<dataObj[]>([]);
  const {doShare} = useShare(true);
  const drawerRef = useRef<DrawerRef>(null);
  const [agentUserLevel, setAgentUserLevel] = useState(1);
  const handleGetData = (level: number) => {
    setLoading(true);
    getCommissionRate({level})
      .then((res: SafeAny) => {
        setData(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };
  const LevelImg = useMemo(() => {
    if (agentUserLevel === 1) {
      return vip1Image;
    }
    if (agentUserLevel === 2) {
      return vip2Image;
    }
    if (agentUserLevel === 3) {
      return vip3Image;
    }
    if (agentUserLevel === 4) {
      return vip4Image;
    }
  }, [agentUserLevel]);
  const LinearColor: SafeAny = useMemo(() => {
    if (agentUserLevel === 1) {
      return [basicColor.primary60, basicColor.primary10];
    }
    if (agentUserLevel === 2) {
      return [basicColor.primary60, basicColor.primary30];
    }
    if (agentUserLevel === 3) {
      return [basicColor.primary60, basicColor.primary50];
    }
    if (agentUserLevel === 4) {
      return [basicColor.primary60, basicColor.primary];
    }
  }, [agentUserLevel]);
  useImperativeHandle(ref, () => ({
    showModal: (level: number) => {
      drawerRef.current?.open();
      setAgentUserLevel(level);
      handleGetData(level);
    },
  }));
  return (
    <Drawer ref={drawerRef} mode="bottom" contentBackgroundColor="#0000">
      <View style={[background.mainDark, boxRadius]}>
        <View
          style={[
            {padding: 20, paddingBottom: 0},
            margin.btml,
            flex.row,
            flex.end,
          ]}>
          <NativeTouchableOpacity
            onPress={() => {
              drawerRef.current?.close();
            }}>
            <CloseIcon width={24} height={24} />
          </NativeTouchableOpacity>
        </View>
        <View style={[{height: 61, paddingLeft: 20, paddingRight: 20}]}>
          <LinearGradient
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            colors={[LinearColor[0], LinearColor[1]]}>
            <View style={[padding.lrl, padding.tbs]}>
              <LazyImage
                imageUrl={LevelImg}
                occupancy="#0000"
                width={51}
                height={20}
              />
              <Text
                style={[
                  {
                    color: fontColor.white,
                    fontSize: fontSize.m,
                    fontWeight: 'bold',
                  },
                  margin.tops,
                ]}>
                {i18n.t('proxy.commission-base.commissionRate')}
              </Text>
            </View>
          </LinearGradient>
        </View>
        <Spin loading={loading}>
          {data?.length === 0 ? (
            <CommissionError />
          ) : (
            <View>
              <ScrollView>
                <View
                  style={[
                    flex.flex,
                    flex.row,
                    flex.alignStart,
                    {maxHeight: 400, paddingLeft: 20, paddingRight: 20},
                  ]}>
                  <View>
                    <View
                      style={[tableLeft, flex.flex, flex.center, {height: 28}]}>
                      <Text style={[TextStyle]}>
                        {i18n.t('proxy.commission-base.commissionType')}
                      </Text>
                    </View>
                    {data?.map((item: dataObj, index: number) => {
                      return (
                        <NativeTouchableOpacity
                          key={index}
                          onPress={() => {}}
                          style={[
                            index % 2 === 0 ? tableLeftTwo : tableLeftNew,
                            flex.flex,
                            flex.start,
                            flex.centerByCol,
                            flex.row,
                            padding.lefts,
                          ]}>
                          <LazyImage
                            imageUrl={item.gameIcon}
                            occupancy="#0000"
                            width={24}
                            height={24}
                          />
                          <Text style={[TextStyle, margin.leftxxs]}>
                            {item.gameName}
                          </Text>
                          {/* right */}
                        </NativeTouchableOpacity>
                      );
                    })}
                  </View>
                  <ScrollView horizontal={true}>
                    <View>
                      <View
                        style={[
                          tableLeft,
                          {width: 68, marginRight: 0, height: 28},
                          flex.flex,
                          flex.center,
                        ]}>
                        <Text style={[TextStyle]}>
                          {i18n.t('proxy.commission-base.commissionTier1')}
                        </Text>
                      </View>
                      {data?.map((item: dataObj, index: number) => {
                        return (
                          <View
                            key={index}
                            style={[
                              index % 2 === 0 ? tableLeftTwo : tableLeftNew,
                              {width: 68, marginRight: 0},
                              flex.flex,
                              flex.center,
                            ]}>
                            <Text style={[TextStyle]}>
                              {(+item.tier1 * 100).toFixed(2)}%
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                    <View>
                      <View
                        style={[
                          tableLeft,
                          {width: 68, marginRight: 0, height: 28},

                          flex.flex,
                          flex.center,
                        ]}>
                        <Text style={[TextStyle]}>
                          {i18n.t('proxy.commission-base.commissionTier2')}
                        </Text>
                      </View>
                      {data?.map((item: dataObj, index: number) => {
                        return (
                          <View
                            key={index}
                            style={[
                              index % 2 === 0 ? tableLeftTwo : tableLeftNew,
                              {width: 68, marginRight: 0},
                              flex.flex,
                              flex.center,
                            ]}>
                            <Text style={[TextStyle]}>
                              {(+item.tier2 * 100).toFixed(2)}%
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                    <View>
                      <View
                        style={[
                          tableLeft,
                          {width: 68, marginRight: 0, height: 28},
                          flex.flex,
                          flex.center,
                        ]}>
                        <Text style={[TextStyle]}>
                          {i18n.t('proxy.commission-base.commissionTier3')}
                        </Text>
                      </View>
                      {data?.map((item: dataObj, index: number) => {
                        return (
                          <View
                            key={index}
                            style={[
                              index % 2 === 0 ? tableLeftTwo : tableLeftNew,
                              {width: 68, marginRight: 0},
                              flex.flex,
                              flex.center,
                            ]}>
                            <Text style={[TextStyle]}>
                              {(+item.tier3 * 100).toFixed(2)}%
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                    <View>
                      <View
                        style={[
                          tableLeft,
                          {width: 68, marginRight: 0, height: 28},
                          flex.flex,
                          flex.center,
                        ]}>
                        <Text style={[TextStyle]}>
                          {i18n.t('proxy.commission-base.commissionTier4')}
                        </Text>
                      </View>
                      {data?.map((item: dataObj, index: number) => {
                        return (
                          <View
                            key={index}
                            style={[
                              index % 2 === 0 ? tableLeftTwo : tableLeftNew,
                              {width: 68, marginRight: 0},
                              flex.flex,
                              flex.center,
                            ]}>
                            <Text style={[TextStyle]}>
                              {(+item.tier4 * 100).toFixed(2)}%
                            </Text>
                          </View>
                        );
                      })}
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
              </ScrollView>
            </View>
          )}

          <NativeTouchableOpacity
            style={[
              flex.col,
              margin.topl,
              {
                marginLeft: 20,
                marginRight: 20,
                borderRadius: 32,
                marginBottom: 44,
                height: 50,
              },
              flex.center,
              padding.tbs,
              padding.lrl,
              {backgroundColor: basicColor.primary},
            ]}
            onPress={() => doShare()}>
            <Text
              style={[
                {
                  color: '#fff',
                  fontSize: fontSize.m,
                  fontWeight: 'bold',
                  textAlign: 'center',
                },
              ]}>
              {agentUserLevel === 4 ? (
                i18n.t('proxy.commission-base.commissionLv4')
              ) : (
                <Text>
                  {i18n.t('proxy.commission-base.commissionLv')}
                  {agentUserLevel + 1}
                  {i18n.t('proxy.commission-base.commissionLvE')}
                </Text>
              )}
            </Text>
          </NativeTouchableOpacity>
        </Spin>
      </View>
    </Drawer>
  );
});
export default ModalContent;
