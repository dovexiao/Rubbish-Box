import React from 'react';
import {StyleSheet, View} from 'react-native';
import TabBar from './components/transaction-tabBar';
import {TabView} from '@rneui/themed';
import TransactionList from './transaction-list';
import {TabType} from './transaction-service';
import theme from '@/style';

const TransactionTab = (props: {tabs: TabType[]; amount?: number | 0}) => {
  const [active, setActive] = React.useState(0);
  const {tabs = [], amount} = props;

  // 记录已经激活过的 tabs，用于懒加载
  const [loadedTabs, setLoadedTabs] = React.useState<number[]>([0]);

  const handleChange = (index: number) => {
    setActive(index);
    // 标记这个 tab 已经加载过
    if (!loadedTabs.includes(index)) {
      setLoadedTabs(prev => [...prev, index]);
    }
  };

  return (
    <>
      <TabBar routers={tabs} value={active} onChange={handleChange} />
      <TabView
        value={active}
        containerStyle={[theme.overflow.hidden]}
        onChange={handleChange}
        animationConfig={{
          duration: 200,
          useNativeDriver: true,
        }}
        animationType="timing">
        {tabs.map((item, index) => {
          return (
            <TabView.Item key={index} style={styles.itemContainer}>
              <View style={{flex: 1}}>
                {/* 只有已经激活过的 tab 才渲染 TransactionList */}
                {loadedTabs.includes(index) && (
                  <TransactionList
                    tabs={tabs}
                    isActive={active === index}
                    index={index}
                    type={item.type}
                    amount={amount}
                  />
                )}
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
