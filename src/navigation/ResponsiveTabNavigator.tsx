import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NavigationContainer } from '@react-navigation/native'
import CustomTabBar from '../components/CustomTabBar'
import FastScreen from '../components/FastScreen'

// 快速页面组件
const FastHomeScreen = () => (
  <FastScreen preloadDelay={0} showLoading={false}>
    {/* 你的首页组件 */}
  </FastScreen>
)

const FastStudyScreen = () => (
  <FastScreen preloadDelay={0} showLoading={false}>
    {/* 你的学习页面组件 */}
  </FastScreen>
)

const FastPointsMallScreen = () => (
  <FastScreen preloadDelay={0} showLoading={false}>
    {/* 你的商城页面组件 */}
  </FastScreen>
)

const FastMyScreen = () => (
  <FastScreen preloadDelay={0} showLoading={false}>
    {/* 你的我的页面组件 */}
  </FastScreen>
)

const Tab = createBottomTabNavigator()

/**
 * 跟手感导航配置
 * 优化页面切换性能
 */
export function ResponsiveTabNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          // 移除所有动画，实现即时切换
          animationEnabled: false,
          animationTypeForReplace: 'push',
          // 性能优化配置
          lazy: false,           // 预加载所有页面
          unmountOnBlur: false, // 保持页面状态
          freezeOnBlur: false,  // 不冻结页面，保持响应
          // 优化渲染
          detachInactiveScreens: false,
        }}
      >
        <Tab.Screen
          name="index"
          component={FastHomeScreen}
          options={{ tabBarLabel: '首页' }}
        />
        <Tab.Screen
          name="study"
          component={FastStudyScreen}
          options={{ tabBarLabel: '学习' }}
        />
        <Tab.Screen
          name="points-mall"
          component={FastPointsMallScreen}
          options={{ tabBarLabel: '时间商城' }}
        />
        <Tab.Screen
          name="my"
          component={FastMyScreen}
          options={{ tabBarLabel: '我的' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  )
}

export default ResponsiveTabNavigator
