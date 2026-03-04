# React Navigation 路由/跳转说明（以当前代码为准）

## 1. 路由结构（先理解命名）

本项目是“根栈（Stack） + 底部 Tab（Tabs）”嵌套：

- 根栈负责：登录、设置、设备详情等“普通页面”
- Tab 负责：底部 3 个主入口（Multiple / Index / Mine）
- 根栈里有一个“Tab 容器页”，路由名为 `MainTabs`

关键文件：

- 根栈配置：[AppNavigator.tsx](file:///c:/Users/rookie/Desktop/xinqiang/bokeapp/src/navigation/AppNavigator.tsx)
- Tab 配置：[MainTabNavigator.tsx](file:///c:/Users/rookie/Desktop/xinqiang/bokeapp/src/navigation/MainTabNavigator.tsx)
- 路由清单（统一登记）：[routes/index.tsx](file:///c:/Users/rookie/Desktop/xinqiang/bokeapp/src/routes/index.tsx)
- 路由类型（TS 参数约束）：[types/navigation.ts](file:///c:/Users/rookie/Desktop/xinqiang/bokeapp/src/types/navigation.ts)
- 全局导航工具（含 reLaunch）：[navigation.ts](file:///c:/Users/rookie/Desktop/xinqiang/bokeapp/src/utils/navigation.ts)
- Home 容器路由常量：`HOME_STACK_ROUTE = 'MainTabs'` [constants/index.ts](file:///c:/Users/rookie/Desktop/xinqiang/bokeapp/src/constants/index.ts#L20)

### 1.1 routes/index.tsx 怎么组织

`routes` 里分两类：

- `routes.tabs`：Tab 页面（Multiple / Index / Mine）
- `routes.pages`：根栈页面（Login、Setting、DeviceInfo…）

## 2. 跳转方式（按场景选）

> 组件内跳转一般用 `useAppNavigation()`：
> [useAppNavigation.ts](file:///c:/Users/rookie/Desktop/xinqiang/bokeapp/src/hooks/useAppNavigation.ts)

### 2.1 跳“普通页面”（根栈页面）

适用：从任意页面打开详情、列表、设置等。

```ts
navigation.navigate('DeviceInfo', { lockId: 123, isAdmin: true });
navigation.navigate('MessageDetail', { msgId: 1 });
```

要求：

- 页面必须在 `routes.pages` 注册
- 参数类型在 `RootStackParamList` 里声明：[types/navigation.ts](file:///c:/Users/rookie/Desktop/xinqiang/bokeapp/src/types/navigation.ts)

### 2.2 Tab 内切换 Tab（Multiple / Index / Mine）

适用：你当前已经在 Tab 体系内，想切换底部 Tab。

```ts
navigation.navigate('Multiple');
navigation.navigate('Index');
navigation.navigate('Mine');
```

### 2.3 从“普通页面”跳回 Tab（并指定落在哪个 Tab）

适用：你在 Login / Setting / Message 等根栈页面，想回到 Tab 并指定目标 Tab。

```ts
navigation.navigate('MainTabs', {
  screen: 'Index',
  params: { lockId: 123 },
});
```

这里的参数会进入 Tab 内 `Index` 页的 `route.params`。

项目里从消息页跳首页并携参的实现参考：
[message/index.tsx](file:///c:/Users/rookie/Desktop/xinqiang/bokeapp/src/pages/message/index.tsx)

### 2.4 “清空栈并跳转”（推荐用 reLaunch）

适用：你希望回到某个页面时把当前栈清掉（类似 Taro 的 reLaunch）。

工具函数：[navigation.ts:reLaunch](file:///c:/Users/rookie/Desktop/xinqiang/bokeapp/src/utils/navigation.ts#L82-L122)

```ts
reLaunch('Login');
reLaunch('DeviceInfo', { lockId: 123, isAdmin: true });

// 也支持直接跳 Tab（内部会自动重置到 MainTabs）
reLaunch('Index', { lockId: 123 });
reLaunch('Multiple');
```

## 3. 参数读取与“参数残留”

### 3.1 Tab 页读取参数

```ts
const route = useRoute<any>();
const lockId = route.params?.lockId;
```

示例（Index 页读取并消费 lockId）：
[pages/index/index.tsx](file:///c:/Users/rookie/Desktop/xinqiang/bokeapp/src/pages/index/index.tsx)

### 3.2 为什么会出现“点 Tab 回来还会继续跳”

Tab 的路由对象会保留 `route.params`，你从外部带入的 `lockId` 如果只应生效一次，就需要在消费后清理。

常用做法（消费后立刻清掉）：

```ts
(navigation as any)?.setParams?.({ lockId: undefined });
```

## 4. 路由信息需要怎么配置（新增页面 / 新增 Tab）

### 4.1 新增一个“普通页面”

1. 新建页面组件：`src/pages/...`
2. 在 `routes.pages` 追加配置：[routes/index.tsx](file:///c:/Users/rookie/Desktop/xinqiang/bokeapp/src/routes/index.tsx)

```ts
{
  name: 'NewPage',
  component: require('@/pages/newPage').default,
  label: '新页面',
}
```

3. 在 `RootStackParamList` 添加参数类型：[types/navigation.ts](file:///c:/Users/rookie/Desktop/xinqiang/bokeapp/src/types/navigation.ts)

```ts
NewPage: {
  id: number;
}
```

4. 调用：

```ts
navigation.navigate('NewPage', { id: 1 });
```

### 4.2 新增一个 Tab 页

1. 新建页面组件：`src/pages/...`
2. 在 `routes.tabs` 追加（同时提供 icon/chooseIcon）
3. 切 Tab：

```ts
navigation.navigate('NewTab');
```

4. 从普通页面跳到该 Tab：

```ts
navigation.navigate('MainTabs', { screen: 'NewTab' });
// 或者清栈跳
reLaunch('NewTab');
```

## 5. 常用“回首页/回登录”

工具函数位置：[navigation.ts](file:///c:/Users/rookie/Desktop/xinqiang/bokeapp/src/utils/navigation.ts)

- 回登录（清栈）：`navigateToLogin()`
- 回首页 Tab（清栈到 MainTabs->Index）：`navigateToHome()`
- 清栈通用：`reLaunch(url, params?)`
