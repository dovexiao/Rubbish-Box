import { Tabs } from "expo-router"

import { CustomTabBar } from "../../components/CustomTabBar"

/**
 * 标签页布局组件
 * 使用自定义TabBar完全还原UniApp样式
 */
export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "首页",
        }}
      />
      <Tabs.Screen
        name="study"
        options={{
          title: "学习",
        }}
      />
      <Tabs.Screen
        name="points-mall"
        options={{
          title: "时间商城",
        }}
      />
      <Tabs.Screen
        name="my"
        options={{
          title: "我的",
        }}
      />
    </Tabs>
  )
}
