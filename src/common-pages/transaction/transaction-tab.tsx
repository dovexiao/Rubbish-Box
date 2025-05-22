import React from 'react';
import {StyleSheet, View} from 'react-native';
import TabBar from './components/transaction-tabBar';
import {TabView} from '@rneui/themed';
import TransactionList from './transaction-list';
import {TabType} from './transaction-service';
import theme from '@/style';
import MeAmount from '@/pages/me/me-amount';
import {useUserActions} from '@/store/useUserStore';

const TransactionTab = (props: {tabs: TabType[]; amount?: number | 0}) => {
  const [active, setActive] = React.useState(0);
  const {tabs = [], amount} = props;

  const {getUserInfo} = useUserActions();

  return (
    <>
      <MeAmount
        containerStyle={{...theme.margin.l, ...theme.margin.topzorro}}
        onRefresh={getUserInfo}
        type={1}
      />
      <TabBar routers={tabs} value={active} onChange={setActive} />
      <TabView
        value={active}
        containerStyle={[theme.overflow.hidden]}
        onChange={setActive}
        animationConfig={{
          duration: 200,
          useNativeDriver: true,
        }}
        animationType="timing">
        {tabs.map((item, index) => {
          return (
            <TabView.Item key={index} style={[styles.itemContainer]}>
              <View style={{flex: 1}}>
                {/* {index === 0 && <Header amount={amount} />} */}
                <TransactionList
                  tabs={tabs}
                  isActive={active === index}
                  index={index}
                  type={item.type}
                  amount={amount}
                />
              </View>
            </TabView.Item>
          );
        })}
      </TabView>
    </>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    flex: 1,
    width: '100%',
  },
});

export default TransactionTab;
