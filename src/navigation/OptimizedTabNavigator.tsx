import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NavigationContainer } from '@react-navigation/native'
import CustomTabBar from '../components/CustomTabBar'
import LazyScreen from '../components/LazyScreen'
import PreloadScreen from '../components/PreloadScreen'

// 懒加载页面组件
const LazyHomeScreen = () => (
  <LazyScreen delay={30}>
    {/* 你的首页组件 */}
  </LazyScreen>
)

const LazyStudyScreen = () => (
  <LazyScreen delay={30}>
    {/* 你的学习页面组件 */}
  </LazyScreen>
)

const LazyPointsMallScreen = () => (
  <LazyScreen delay={30}>
    {/* 你的商城页面组件 */}
  </LazyScreen>
)

const LazyMyScreen = () => (
  <LazyScreen delay={30}>
    {/* 你的我的页面组件 */}
  </LazyScreen>
)

const Tab = createBottomTabNavigator()

/**
 * 优化的导航配置
 * 移除所有动画，提升切换速度
 */
export function OptimizedTabNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          // 移除所有动画
          animationEnabled: false,
          animationTypeForReplace: 'push',
          // 优化性能
          lazy: true,
          unmountOnBlur: false, // 保持页面状态
          freezeOnBlur: true,   // 冻结后台页面
        }}
      >
        <Tab.Screen
          name="index"
          component={LazyHomeScreen}
          options={{ tabBarLabel: '首页' }}
        />
        <Tab.Screen
          name="study"
          component={LazyStudyScreen}
          options={{ tabBarLabel: '学习' }}
        />
        <Tab.Screen
          name="points-mall"
          component={LazyPointsMallScreen}
          options={{ tabBarLabel: '时间商城' }}
        />
        <Tab.Screen
          name="my"
          component={LazyMyScreen}
          options={{ tabBarLabel: '我的' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  )
}

export default OptimizedTabNavigator
