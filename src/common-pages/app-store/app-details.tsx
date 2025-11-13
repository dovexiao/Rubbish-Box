import React from 'react';
import {View, StyleSheet, ScrollView, Platform} from 'react-native';
import Header from './components/header';
import AppDetailContent from './components/app-detail-content';
import Footer from './components/footer';

export interface AppDetailsProps {}

const AppDetails = ({}: AppDetailsProps) => {
  // Web端需要的特殊样式
  const isWeb = Platform.OS === 'web';

  const containerStyle = [styles.container, isWeb && styles.containerWeb];

  const scrollViewStyle = [styles.scrollView, isWeb && styles.scrollViewWeb];

  const scrollContentStyle = [
    styles.scrollContent,
    isWeb && styles.scrollContentWeb,
  ];

  return (
    <View style={[containerStyle]}>
      <Header />
      <ScrollView
        style={scrollViewStyle}
        contentContainerStyle={[scrollContentStyle, isWeb && {paddingTop: 0}]}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        bounces={!isWeb}
        scrollEventThrottle={16}>
        <AppDetailContent />
        <Footer />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  containerWeb: {
    height: '100vh',
    width: '100%',
  } as any,
  scrollView: {
    flex: 1,
  },
  scrollViewWeb: {
    flex: 1, // ✅ 使用 flex 1
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
  } as any,
  scrollContent: {
    // paddingBottom: 72,
  },
  scrollContentWeb: {
    flexGrow: 1,
    height: '100vh',
  } as any,
});

export default AppDetails;
