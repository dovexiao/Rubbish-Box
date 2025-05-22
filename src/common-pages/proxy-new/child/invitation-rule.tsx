import React, {useState} from 'react';
import theme from '@style';
import i18n from '@i18n';
import {View, Text, ScrollView, RefreshControl, StyleSheet} from 'react-native';
import DetailNavTitle from '@/components/business/detail-nav-title';
import {useRoute} from '@react-navigation/native';
import Button from '@/components/basic/button';
import {LazyImageLGBackground} from '@basicComponents/image';
import {goBack} from '@utils';
const TotalUser = () => {
  const [refreshing, setRefreshing] = useState(false);
  const route = useRoute();

  const handleRefresh = () => {
    setRefreshing(true);
  };
  const onCopy = () => {
    // Clipboard.setString(id);
    // globalStore.globalSucessTotal(i18n.t('copy-success'));
  };
  return (
    <LazyImageLGBackground style={[theme.fill.fill, theme.flex.col]}>
      <DetailNavTitle
        hideServer
        hideAmount
        onBack={(route.path || '').indexOf('index') > -1 ? undefined : goBack}
        title={i18n.t('newProxy.child.invite-rule')}
        iconColor="white"
        titleColor={theme.fontColor.white}
      />
      <ScrollView
        style={[theme.flex.col]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }>
        <View
          style={[
            theme.background.mainDark,
            styles.mgS,
            theme.padding.l,
            theme.borderRadius.m,
          ]}>
          <View>
            <Text style={styles.textStyle}>
              {i18n.t('newProxy.child.invite-text1')}
            </Text>
          </View>
        </View>
        <View
          style={[
            theme.background.mainDark,
            styles.mgS,
            theme.padding.l,
            theme.borderRadius.m,
          ]}>
          <View style={[theme.margin.btml]}>
            <View>图像</View>
          </View>
        </View>
        <View
          style={[
            theme.background.mainDark,
            styles.mgS,
            theme.padding.l,
            theme.borderRadius.m,
          ]}>
          <View>
            <Text style={styles.textStyle}>
              {i18n.t('newProxy.child.invite-text2')}
            </Text>
          </View>
        </View>
        <View
          style={[
            theme.background.mainDark,
            styles.mgS,
            theme.padding.l,
            theme.borderRadius.m,
          ]}>
          <View
            style={[
              theme.flex.flex,
              theme.flex.col,
              theme.flex.centerByCol,
              theme.flex.centerByRow,
              styles.betStyle,
            ]}>
            <View>
              <Text style={styles.textStyle}>
                {i18n.t('newProxy.child.proxy-upgrade-rules')}
              </Text>
            </View>
            <View>
              <Text style={styles.textStyle}>
                {i18n.t('newProxy.child.proxy-betting-recharge-ratio')}
              </Text>
            </View>
          </View>
        </View>

        <Button
          style={[
            theme.margin.rightl,
            theme.margin.leftl,
            theme.margin.topl,
            theme.margin.bottoml,
          ]}
          radius={30}
          size="small"
          title={i18n.t('newProxy.child.copy')}
          type={'linear-primary'}
          onPress={onCopy}
        />
        <View style={styles.bottom} />
      </ScrollView>
    </LazyImageLGBackground>
  );
};

const styles = StyleSheet.create({
  mgS: {
    marginLeft: 12,
    marginRight: 12,
    marginTop: 12,
  },
  textStyle: {
    color: '#fff',
    lineHeight: 13 * 2,
  },
  betStyle: {
    width: 320,
    height: 400,
  },
  bottom: {
    height: 76,
  },
});

export default TotalUser;
