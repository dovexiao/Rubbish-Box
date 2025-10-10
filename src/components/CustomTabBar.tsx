import { View, Text, TouchableOpacity, Image } from "react-native"
import { BottomTabBarProps } from "@react-navigation/bottom-tabs"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { createStyles } from "../utils/rpxStyleSheet"
import { Images } from "../constants/Assets"

/**
 * 自定义TabBar组件
 * 完全还原UniApp项目的tabbar样式和交互
 */
export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets()

  const tabbarConfig = [
    {
      name: "index",
      text: "首页",
      imgUrl: Images.tabHome,
      imgUrlActive: Images.tabHomeActive,
    },
    {
      name: "study",
      text: "学习",
      imgUrl: Images.tabStudy,
      imgUrlActive: Images.tabStudyActive,
    },
    {
      name: "points-mall",
      text: "时间商城",
      imgUrl: Images.tabPointsMall,
      imgUrlActive: Images.tabPointsMallActive,
    },
    {
      name: "my",
      text: "我的",
      imgUrl: Images.tabMine,
      imgUrlActive: Images.tabMineActive,
    },
  ]

  return (
    <View style={[styles.tabbarWrapper, { bottom: 17.1875 + insets.bottom }]}>
      <LinearGradient
        colors={["rgba(255, 255, 255, 0.8)", "rgba(255, 255, 255, 0.2)"]}
        locations={[0, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.tabbarContainer}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key]
          const isFocused = state.index === index

          // 找到对应的配置
          const tabConfig = tabbarConfig.find((tab) => tab.name === route.name)
          if (!tabConfig) return null

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            })

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params)
            }
          }

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            })
          }

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabItem}
            >
              <Image
                source={isFocused ? tabConfig.imgUrlActive : tabConfig.imgUrl}
                style={styles.tabIcon}
                resizeMode="contain"
              />
              <Text
                style={[styles.tabText, isFocused ? styles.tabTextActive : styles.tabTextInactive]}
              >
                {tabConfig.text}
              </Text>
            </TouchableOpacity>
          )
        })}
      </LinearGradient>
    </View>
  )
}

const styles = createStyles({
  tabbarWrapper: {
    position: "absolute",
    left: "50%",
    marginLeft: -208.3985, // 宽度的一半：416.797 / 2 = 208.3985
    width: 416.797, // 1067px转rpx
    height: 63.6718, // 163px转rpx
    // 外层阴影 - 向外散发
    shadowColor: "#1e64b7",
    shadowOffset: { width: 0, height: 1.5625 },
    shadowOpacity: 0.25,
    shadowRadius: 11.3281,
    elevation: 8, // Android阴影
  },
  tabbarContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    borderRadius: 15.625, // 40px转rpx
    overflow: "hidden",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  tabIcon: {
    width: 32.825, // 从UniApp模板中看到的w-32.825rpx
    height: 32.825,
    marginBottom: 4,
  },
  tabText: {
    fontSize: 8.6, // 匹配UniApp的8.6rpx
    textAlign: "center",
    fontWeight: "bold",
  },
  tabTextActive: {
    color: "#2A3658", // 匹配UniApp的激活颜色
  },
  tabTextInactive: {
    color: "rgba(0, 0, 0, 0.5019607843137255)", // 匹配UniApp的#00000080 (128/255 = 0.5019607843137255)
  },
})

export default CustomTabBar
