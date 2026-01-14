# PageContainer 组件

一个功能完整的页面容器组件，基于 `react-native-keyboard-controller` 构建，提供了状态栏管理、安全区域处理、键盘避让、滚动支持等功能。

## 功能特性

- ✅ 状态栏配置（样式、背景色、显示/隐藏）
- ✅ 安全区域处理（SafeAreaView，可配置边缘）
- ✅ 键盘避让（基于 react-native-keyboard-controller）
- ✅ 滚动支持（可选）
- ✅ 背景图片支持
- ✅ 加载状态（全屏遮罩）
- ✅ 自定义头部/底部
- ✅ 导航头部（pageNavProps）
- ✅ 灵活的 padding 配置

## 基本使用

```tsx
import { PageContainer } from '@/components';
import { View, Text } from 'react-native';

function MyPage() {
  return (
    <PageContainer
      backgroundColor="#F5F5F5"
      padding={16}
      pageNavProps={{
        text: '我的页面',
        showBack: true,
      }}
    >
      <View>
        <Text>页面内容</Text>
      </View>
    </PageContainer>
  );
}
```

## 滚动页面

```tsx
<PageContainer
  scrollable={true}
  keyboardAvoidingView={true}
  padding={16}
  pageNavProps={{
    text: '滚动页面',
    showBack: true,
  }}
>
  {/* 长内容 */}
</PageContainer>
```

## 带加载状态

```tsx
<PageContainer
  loading={isLoading}
  loadingIndicatorColor="#007AFF"
  loadingBackgroundColor="rgba(0,0,0,0.5)"
  pageNavProps={{
    text: '加载中',
  }}
>
  {/* 内容 */}
</PageContainer>
```

## 自定义头部和底部

```tsx
<PageContainer
  header={<CustomHeader />}
  footer={<CustomFooter />}
  padding={16}
>
  {/* 内容 */}
</PageContainer>
```

## API

### PageContainerProps

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| children | React.ReactNode | - | 页面内容 |
| backgroundColor | string | '#FFFFFF' | 背景颜色 |
| backgroundImage | ImageSourcePropType | - | 背景图片 |
| statusBarStyle | 'default' \| 'light-content' \| 'dark-content' | 'dark-content' | 状态栏样式 |
| statusBarBackgroundColor | string | - | 状态栏背景色（Android） |
| showStatusBar | boolean | true | 是否显示状态栏 |
| safeAreaEdges | ('top' \| 'bottom' \| 'left' \| 'right')[] | ['top', 'bottom'] | 安全区域边缘 |
| scrollable | boolean | false | 是否可滚动 |
| keyboardAvoidingView | boolean | false | 是否启用键盘避让（scrollable 为 true 时自动启用） |
| contentContainerStyle | ViewStyle | - | 内容容器样式 |
| loading | boolean | false | 是否显示加载状态 |
| loadingStyle | ViewStyle | - | 加载遮罩样式 |
| loadingIndicatorColor | string | '#333333' | 加载指示器颜色 |
| loadingBackgroundColor | string | 'rgba(0,0,0,0.3)' | 加载遮罩背景色 |
| style | ViewStyle | - | 容器样式 |
| header | React.ReactNode | - | 自定义头部 |
| footer | React.ReactNode | - | 自定义底部 |
| padding | number | 0 | 内边距 |
| paddingHorizontal | number | 0 | 水平内边距 |
| paddingVertical | number | 0 | 垂直内边距 |
| pageNavProps | PageNavProps | - | 导航头部配置 |

### PageNavProps

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| text | string | - | 标题文本 |
| showBack | boolean | true | 是否显示返回按钮 |
| background | string | - | 头部背景色 |
| extraNode | React.ReactNode | - | 额外节点（显示在右侧） |
| leftContent | React.ReactNode | - | 左侧内容 |
| rightContent | React.ReactNode | - | 右侧内容 |
| onBackPress | () => void | - | 返回按钮点击事件 |
| titleColor | string | '#333333' | 标题颜色 |

## 注意事项

1. 当 `scrollable={true}` 时，会自动启用键盘避让功能
2. `pageNavProps` 和 `header` 可以同时使用，但 `pageNavProps` 优先级更高
3. 背景图片和背景色可以同时使用，背景图片会覆盖背景色
4. 加载状态会显示全屏遮罩，阻止用户交互

