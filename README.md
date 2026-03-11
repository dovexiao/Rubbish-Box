# boklock

一个基于 React Native 构建的跨平台移动应用，采用现代化的技术栈和最佳实践。

## 📋 目录

- [项目简介](#项目简介)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [环境要求](#环境要求)
- [快速开始](#快速开始)
- [环境配置](#环境配置)
- [开发指南](#开发指南)
- [构建与发布](#构建与发布)
- [主要功能](#主要功能)
- [代码规范](#代码规范)
- [常见问题](#常见问题)

## 🎯 项目简介

boklock 是一个使用 React Native 开发的移动应用，支持 iOS 和 Android 平台。项目采用 TypeScript 编写，集成了现代化的开发工具和库，提供了完整的开发、测试、构建和发布流程。

## 🛠 技术栈

### 核心框架

- **React Native** `0.82.1` - 跨平台移动应用框架
- **React** `19.1.1` - UI 库
- **TypeScript** `^5.8.3` - 类型安全的 JavaScript

### 导航与路由

- **@react-navigation/native** `^7.1.24` - 导航库
- **@react-navigation/native-stack** `^7.8.5` - 原生栈导航
- **@react-navigation/bottom-tabs** `^7.8.11` - 底部标签导航

### 状态管理与数据获取

- **@tanstack/react-query** `^5.56.2` - 强大的数据同步库，用于服务端状态管理

### 网络请求

- **axios** `^1.13.2` - HTTP 客户端

### 本地存储

- **react-native-mmkv** `^2.12.2` - 高性能键值存储库

### 工具库

- **react-native-device-info** `^10.13.0` - 设备信息获取
- **react-native-fs** `^2.20.0` - 文件系统操作
- **react-native-zip-archive** `^6.0.15` - 压缩/解压功能
- **react-native-gesture-handler** `^2.29.1` - 手势处理
- **react-native-safe-area-context** `^5.5.2` - 安全区域处理
- **react-native-screens** `^4.18.0` - 原生屏幕组件

### 开发工具

- **ESLint** - 代码检查
- **Prettier** - 代码格式化
- **Jest** - 单元测试框架
- **Babel** - JavaScript 编译器

## 📁 项目结构

```
boklock/
├── android/                 # Android 原生代码
│   ├── app/                # Android 应用代码
│   ├── build.gradle        # Gradle 构建配置
│   └── fastlane/           # Fastlane 自动化脚本
├── ios/                     # iOS 原生代码
│   ├── boklock/         # iOS 应用代码
│   ├── Podfile             # CocoaPods 依赖配置
│   └── fastlane/           # Fastlane 自动化脚本
├── src/                     # 源代码目录
│   ├── assets/             # 静态资源（图片、字体等）
│   ├── components/         # 可复用组件
│   │   ├── ErrorBoundary.tsx  # 错误边界组件
│   │   └── index.ts
│   ├── config/             # 配置文件
│   │   ├── index.ts        # 环境配置
│   │   ├── queryClient.ts  # React Query 配置
│   │   └── storagePersister.ts  # 存储持久化配置
│   ├── examples/           # 示例代码
│   │   ├── AppUpdateExample.tsx
│   │   ├── ReactQueryExample.tsx
│   │   └── StorageExample.tsx
│   ├── hooks/              # 自定义 Hooks
│   │   ├── useApi.ts       # API 请求 Hook
│   │   ├── useAppNavigation.ts  # 导航 Hook
│   │   ├── useAppUpdate.ts      # 应用更新 Hook
│   │   ├── useLocalStorage.ts   # 本地存储 Hook
│   │   ├── useSmartStorage.ts   # 智能存储 Hook
│   │   ├── useUser.ts           # 用户相关 Hook
│   │   └── useVersion.ts        # 版本管理 Hook
│   ├── navigation/         # 导航配置
│   │   ├── AppNavigator.tsx     # 主导航器
│   │   └── MainTabNavigator.tsx # 底部标签导航器
│   ├── pages/              # 页面组件
│   │   ├── index/          # 首页
│   │   ├── mine/           # 我的页面
│   │   └── multiple/       # 其他页面
│   ├── routes/             # 路由配置
│   │   └── index.tsx
│   ├── services/           # API 服务层
│   │   ├── common.ts       # 通用服务
│   │   └── user.ts         # 用户服务
│   ├── types/              # TypeScript 类型定义
│   │   ├── navigation.ts
│   │   └── react-native-config.d.ts
│   └── utils/              # 工具函数
│       ├── appUpdate.ts    # 应用更新工具
│       ├── http.ts         # HTTP 请求封装
│       ├── queryUtils.ts   # React Query 工具
│       ├── storage.ts      # 存储工具
│       └── version.ts      # 版本工具
├── App.tsx                 # 应用入口文件
├── index.js                # 应用启动文件
├── package.json            # 项目依赖配置
├── tsconfig.json           # TypeScript 配置
├── babel.config.js         # Babel 配置
├── metro.config.js         # Metro 打包配置
├── jest.config.js          # Jest 测试配置
└── README.md               # 项目说明文档
```

## ⚙️ 环境要求

在开始之前，请确保你的开发环境满足以下要求：

- **Node.js** >= 20
- **npm** 或 **yarn** 或 **pnpm**
- **React Native CLI** (全局安装)
- **Xcode** (仅 macOS，用于 iOS 开发)
- **Android Studio** (用于 Android 开发)
- **CocoaPods** (iOS 依赖管理)

### 环境设置

请按照 [React Native 官方文档](https://reactnative.dev/docs/set-up-your-environment) 完成开发环境的设置。

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd boklock
```

### 2. 安装依赖

```bash
# 使用 npm
npm install

# 或使用 yarn
yarn install

# 或使用 pnpm
pnpm install
```

### 3. iOS 依赖安装

如果你在 macOS 上开发 iOS 应用，需要安装 CocoaPods 依赖：

```bash
# 首次安装 CocoaPods
bundle install

# 安装 iOS 依赖
cd ios && bundle exec pod install && cd ..

# 或使用 npm 脚本
npm run podInstall
```

### 4. 启动 Metro 打包工具

```bash
# 使用 npm
npm start

# 或使用 yarn
yarn start

# 清除缓存启动
npm run start:reset
```

### 5. 运行应用

#### Android

```bash
# 开发模式
npm run android

# 或使用 yarn
yarn android
```

#### iOS

```bash
# 开发模式
npm run ios

# 或使用 yarn
yarn ios
```

#### HarmonyOS (鸿蒙)

鸿蒙开发仅启动 JS 侧打包或 Metro 服务，真正的 App 工程编译在 DevEco Studio 中进行（见 `boke_harmony/readme.md`）。

```bash
# 仅仅打包 JS bundle 文件并在本地运行用于被鸿蒙壳子加载
## 开发环境 bundle
pnpm dev:harmony

## 生产环境 bundle
pnpm real:harmony
```

## 🔧 环境配置

项目支持多环境配置（开发、测试、生产）。通过 `.env` 文件管理不同环境的配置。

### 环境文件

在项目根目录创建以下环境配置文件：

- `.env.development` - 开发环境
- `.env.staging` - 测试环境
- `.env.production` - 生产环境

### 环境变量示例

```bash
# .env.development
ENV=development
API_BASE_URL=https://dev-api.example.com
API_VERSION=v1
```

```bash
# .env.staging
ENV=staging
API_BASE_URL=https://staging-api.example.com
API_VERSION=v1
```

```bash
# .env.production
ENV=production
API_BASE_URL=https://api.example.com
API_VERSION=v1
```

### 使用不同环境运行

```bash
# 开发环境
npm run dev:android
npm run dev:ios
pnpm dev:harmony

# 测试环境
npm run staging:android
npm run staging:ios

# 生产环境
npm run real:android
npm run real:ios
pnpm real:harmony
```

## 📖 开发指南

### 代码结构说明

#### 1. 页面开发

页面组件位于 `src/pages/` 目录下，每个页面有独立的文件夹：

```typescript
// src/pages/index/index.tsx
import React from 'react';
import { View, Text } from 'react-native';

export default function IndexPage() {
  return (
    <View>
      <Text>首页</Text>
    </View>
  );
}
```

#### 2. API 请求

使用封装好的 HTTP 工具进行 API 请求：

```typescript
// src/services/user.ts
import { get, post } from '@/utils/http';

export const userService = {
  // GET 请求
  getUserInfo: (userId: string) => get<UserInfo>(`/users/${userId}`),

  // POST 请求
  login: (username: string, password: string) =>
    post<LoginResponse>('/auth/login', { username, password }),
};
```

#### 3. 使用 React Query

使用 React Query 进行数据获取和缓存管理：

```typescript
import { useApiQuery, useApiMutation } from '@/hooks/useApi';
import { userService } from '@/services/user';

function UserProfile({ userId }: { userId: string }) {
  // 查询数据
  const { data, isLoading, error } = useApiQuery(['user', userId], () =>
    userService.getUserInfo(userId),
  );

  // 变更数据
  const mutation = useApiMutation(
    (data: LoginData) => userService.login(data.username, data.password),
    {
      onSuccess: data => {
        console.log('登录成功', data);
      },
    },
  );

  // ...
}
```

#### 4. 本地存储

使用 MMKV 进行本地存储：

```typescript
import { storage, StorageKeys } from '@/utils/storage';

// 存储数据
storage.setItem(StorageKeys.USER_TOKEN, 'token-value');

// 获取数据
const token = storage.getItem<string>(StorageKeys.USER_TOKEN);

// 删除数据
storage.removeItem(StorageKeys.USER_TOKEN);
```

#### 5. 导航

使用导航 Hook 进行页面跳转：

```typescript
import { useAppNavigation } from '@/hooks/useAppNavigation';

function MyComponent() {
  const navigation = useAppNavigation();

  const handleNavigate = () => {
    navigation.navigate('Mine');
  };

  // ...
}
```

### 路径别名

项目配置了路径别名，使用 `@/` 代替 `src/`：

```typescript
// ✅ 推荐
import { storage } from '@/utils/storage';
import { useApiQuery } from '@/hooks/useApi';

// ❌ 不推荐
import { storage } from '../../utils/storage';
```

### 类型定义

所有 TypeScript 类型定义位于 `src/types/` 目录下。建议为 API 响应、组件 Props 等定义类型。

## 🏗 构建与发布

### Android 构建

#### 开发环境 APK

```bash
# Linux/macOS
npm run dev:apk

# Windows
npm run dev:apk:win
```

#### 生产环境 APK

```bash
# Linux/macOS
npm run real:apk

# Windows
npm run real:apk:win
```

#### 使用构建脚本

```bash
# 开发环境
npm run build:dev:apk

# 生产环境
npm run build:real:apk

# 测试环境
npm run build:staging:apk
```

### iOS 构建

#### 使用构建脚本

```bash
# 开发环境
npm run build:dev:ios

# 生产环境
npm run build:real:ios

# 测试环境
npm run build:staging:ios
```

#### 使用 Fastlane

项目集成了 Fastlane 用于自动化构建和发布：

```bash
# iOS
cd ios
fastlane beta
fastlane release

# Android
cd android
fastlane beta
fastlane release
```

### HarmonyOS（鸿蒙）构建

在当前仓库 (bokeapp) 我们仅提供 JS 打包命令：

```bash
# 打包并将产生的 bundle 和 assets 文件夹复制到 DevEco 工程中
pnpm run dev:harmony   # 测试环境配置
pnpm run real:harmony  # 准上线/生成环境配置
```

如果你只想检查签名是否正确（独立跑官方校验脚本）：

```bash
pnpm run sync:harmony:sign
```

打完 JS Bundle 后，需使用华为官方开发的 **DevEco Studio** 打开工作区旁的 `boke_harmony` 进行原生编译与签名构建成 App。详情请参考鸿蒙端专门的说明：`../DevEcoStudioProjects/boke_harmony/readme.md`。

### 清理构建缓存

```bash
# Android
npm run gradlew:clean

# Windows
npm run gradlew:clean:win

# iOS (需要手动清理)
cd ios
rm -rf Pods Podfile.lock
bundle exec pod install
```

## ✨ 主要功能

### 1. 错误边界

应用集成了全局错误边界组件，可以捕获和处理 React 组件树中的错误：

```typescript
// App.tsx
<ErrorBoundary onError={handleError} onNavigateHome={navigateHome}>
  {/* 应用内容 */}
</ErrorBoundary>
```

### 2. 应用更新

支持应用版本检查和更新功能：

```typescript
import { useAppUpdate } from '@/hooks/useAppUpdate';

function App() {
  const { checkUpdate, isUpdating } = useAppUpdate();

  // 检查更新
  useEffect(() => {
    checkUpdate();
  }, []);
}
```

### 3. 版本管理

提供版本信息获取和管理功能：

```typescript
import { useVersion } from '@/hooks/useVersion';

function AboutPage() {
  const { version, buildNumber } = useVersion();

  return (
    <Text>
      版本: {version} ({buildNumber})
    </Text>
  );
}
```

### 4. 智能存储

提供基于 React Query 的智能存储 Hook，支持数据持久化和自动同步：

```typescript
import { useSmartStorage } from '@/hooks/useSmartStorage';

function MyComponent() {
  const [userInfo, setUserInfo, isLoading] = useSmartStorage('userInfo');

  // 自动持久化到本地存储
  setUserInfo({ name: 'John' });
}
```

### 5. HTTP 拦截器

自动处理 token 添加、错误处理和响应格式化：

- 自动在请求头添加 `Authorization: Bearer <token>`
- 统一处理 401 未授权错误
- 自动提取响应中的 `data` 字段

## 📝 代码规范

### TypeScript

- 所有文件使用 TypeScript 编写
- 为函数、组件、变量等添加类型注解
- 使用接口定义对象结构

### 命名规范

- **组件**: 使用 PascalCase，如 `UserProfile.tsx`
- **函数/变量**: 使用 camelCase，如 `getUserInfo`
- **常量**: 使用 UPPER_SNAKE_CASE，如 `API_BASE_URL`
- **文件**: 组件文件使用 PascalCase，工具文件使用 camelCase

### 代码格式化

项目使用 Prettier 进行代码格式化，使用 ESLint 进行代码检查：

```bash
# 检查代码
npm run lint

# 格式化代码（需要配置 Prettier）
npx prettier --write .
```

### Git 提交规范

建议使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建/工具相关

## ❓ 常见问题

### 1. Metro 打包工具启动失败

**问题**: `npm start` 报错或无法启动

**解决方案**:

```bash
# 清除缓存重新启动
npm run start:reset

# 或手动清除
rm -rf node_modules
npm install
npm start -- --reset-cache
```

### 2. iOS 依赖安装失败

**问题**: `pod install` 失败

**解决方案**:

```bash
# 更新 CocoaPods
sudo gem install cocoapods

# 清理并重新安装
cd ios
rm -rf Pods Podfile.lock
bundle exec pod install
```

### 3. Android 构建失败

**问题**: Gradle 构建错误

**解决方案**:

```bash
# 清理构建缓存
npm run gradlew:clean

# 检查 Android SDK 和 Gradle 版本
# 确保 local.properties 配置正确
```

### 4. Android 安装失败 - 签名不匹配

**问题**: `INSTALL_FAILED_UPDATE_INCOMPATIBLE: Package signatures do not match`

**原因**: 设备上已安装的应用使用了不同的签名密钥，Android 不允许覆盖安装。

**解决方案**:

```bash
# 方法 1: 使用 adb 卸载（推荐）
adb uninstall com.boklock.m.test  # 开发环境包名
adb uninstall com.boklock.m       # 生产环境包名

# 方法 2: 在设备上手动卸载应用
# 进入设置 -> 应用 -> 找到应用 -> 卸载

# 方法 3: 重新安装前先卸载
npm run android -- --uninstall
```

### 5. Android Activity 类不存在

**问题**: `Activity class {com.boklockapp/com.boklockapp.MainActivity} does not exist`

**原因**: 当使用不同的 product flavors（如 dev/prod）时，applicationId 会改变，但 AndroidManifest 中使用相对路径可能导致类名解析错误。

**解决方案**:

确保 AndroidManifest.xml 中使用完整的类名而不是相对路径：

```xml
<!-- ❌ 错误：使用相对路径 -->
<activity android:name=".MainActivity" />

<!-- ✅ 正确：使用完整类名 -->
<activity android:name="com.boklockapp.MainActivity" />
```

如果问题仍然存在，清理构建缓存后重新构建：

```bash
npm run gradlew:clean
npm run android
```

### 6. 环境变量不生效

**问题**: `.env` 文件中的变量无法读取

**解决方案**:

- 确保 `.env` 文件在项目根目录
- 确保使用正确的环境变量前缀（如 `ENVFILE=.env.development`）
- 重启 Metro 打包工具

### 5. TypeScript 类型错误

**问题**: 导入路径或类型定义报错

**解决方案**:

```bash
# 检查 tsconfig.json 中的路径配置
# 确保使用 @/ 别名而不是相对路径
# 重启 IDE 或 TypeScript 服务器
```

## 📚 相关资源

- [React Native 官方文档](https://reactnative.dev)
- [React Navigation 文档](https://reactnavigation.org)
- [TanStack Query 文档](https://tanstack.com/query/latest)
- [TypeScript 文档](https://www.typescriptlang.org)
- [MMKV 文档](https://github.com/mrousavy/react-native-mmkv)
