# UniApp 到 React Native 完整迁移计划

## 项目概述

将 `/Users/zhoudabo/Desktop/web项目/XHTX_APP` (UniApp项目) 完整迁移到 React Native (Expo) 项目。

**迁移原则**：
- 按模块逐步迁移，确保质量
- 全部功能完整实现
- 原生插件暂不迁移
- 不使用WebView包装，寻找React Native原生方案
- 遵循记忆模版规范（rpx单位、useEffect规范、完全重写等）

---

## 已完成模块

| 模块 | UniApp源文件 | RN目标文件 | 状态 |
|------|-------------|-----------|------|
| 学习首页 | `pages/study/index.vue` | `src/app/(tabs)/study.tsx` | ✅ 完成 |
| AI批改-作文结果 | `pages/AI/components/CompositionResult.vue` | `src/components/CompositionResult.tsx` | ✅ 完成 |
| 同步课堂首页 | `pages/sync-classroom/index.vue` | `src/app/sync-classroom/index.tsx` | ✅ 完成 |
| 同步课堂视频播放 | `pages/sync-classroom/video.vue` | `src/app/sync-classroom/video.tsx` | 🔧 需完善 |

---

## 待迁移模块

### 第一阶段：完善已有模块
**优先级：P0（立即执行）**  
**预计工时：6-9小时**

#### 1.1 修复同步课堂视频播放页面
- **源文件**：`/Users/zhoudabo/Desktop/web项目/XHTX_APP/src/pages/sync-classroom/video.vue`
- **目标文件**：`src/app/sync-classroom/video.tsx`
- **需要修复**：
  - [ ] 添加视频自动播放逻辑
  - [ ] 修复标题字体大小（16rpx）和位置（top: -17.1875rpx, left: 22.6rpx）
  - [ ] 完全还原控制器UI：
    - 进度条样式（高度4rpx，渐变色）
    - 播放/暂停按钮（左侧，20rpx图标）
    - 倍速选择菜单（0.5x, 0.8x, 1.0x, 1.25x, 1.5x）
    - 画质选择（显示"准高清"）
    - 全屏按钮（18rpx图标）
  - [ ] 实现控制栏自动隐藏（3秒后）
  - [ ] 实现进度保存和恢复（跳转到上次播放位置）
  - [ ] 实现学习完成提示弹窗
  - [ ] 修复视频容器高度（312.5rpx）
- **工作量**：2-3小时

#### 1.2 完善同步课堂练习页面
- **源文件**：`/Users/zhoudabo/Desktop/web项目/XHTX_APP/src/pages/sync-classroom/practice.vue`
- **目标文件**：`src/app/sync-classroom/practice.tsx`
- **功能**：
  - [ ] 课程练习题列表
  - [ ] 答题交互界面
  - [ ] 答题结果展示
  - [ ] 进度保存
- **工作量**：4-6小时

---

### 第二阶段：AI批改模块
**优先级：P1（核心功能）**  
**预计工时：40-53小时**

#### 2.1 AI批改-AI加载页
- **源文件**：`/Users/zhoudabo/Desktop/web项目/XHTX_APP/src/pages/AI/ai-loading.vue`
- **目标文件**：`src/app/ai/loading.tsx`（已存在，需完善）
- **功能**：
  - [ ] AI处理动画
  - [ ] 加载进度提示
  - [ ] 错误处理
- **工作量**：2-3小时

#### 2.2 AI批改-结果页面
- **源文件**：`/Users/zhoudabo/Desktop/web项目/XHTX_APP/src/pages/AI/ai-result.vue`
- **目标文件**：`src/app/ai/result.tsx`（已存在，需完善）
- **功能**：
  - [ ] 批改结果展示
  - [ ] 分数显示
  - [ ] 错误点标注
  - [ ] 操作按钮（重拍、查看详情等）
- **工作量**：2-3小时

#### 2.3 AI批改-题目结果
- **源文件**：`/Users/zhoudabo/Desktop/web项目/XHTX_APP/src/pages/AI/components/QuestionResult.vue`
- **目标文件**：`src/components/QuestionResult.tsx`
- **功能**：
  - [ ] 题目批改结果
  - [ ] 答案解析
  - [ ] 知识点标注
- **工作量**：4-6小时

#### 2.4 AI批改-练习模式
- **源文件**：`/Users/zhoudabo/Desktop/web项目/XHTX_APP/src/pages/AI/practice.vue`
- **目标文件**：`src/app/ai/practice.tsx`
- **功能**：
  - [ ] 练习题展示
  - [ ] 答题交互
  - [ ] 计时功能
  - [ ] 答题进度
- **工作量**：6-8小时

#### 2.5 AI批改-练习结果
- **源文件**：`/Users/zhoudabo/Desktop/web项目/XHTX_APP/src/pages/AI/practice-result.vue`
- **目标文件**：`src/app/ai/practice-result.tsx`
- **功能**：
  - [ ] 练习结果统计
  - [ ] 正确率展示
  - [ ] 错题列表
  - [ ] 知识点分析
- **工作量**：4-6小时

#### 2.6 AI批改-题目解析
- **源文件**：`/Users/zhoudabo/Desktop/web项目/XHTX_APP/src/pages/AI/question-analysis.vue`
- **目标文件**：`src/app/ai/question-analysis.tsx`
- **功能**：
  - [ ] 题目详细解析
  - [ ] 答案步骤展示
  - [ ] 知识点关联
- **工作量**：3-4小时

#### 2.7 AI批改-错题本（7个页面）
- **源目录**：`/Users/zhoudabo/Desktop/web项目/XHTX_APP/src/pages/AI/`
- **目标目录**：`src/app/ai/error-book/`
- **页面清单**：
  - [ ] 错题本首页 (error-book.vue → index.tsx)
  - [ ] 错题选择 (error-selection.vue → selection.tsx)
  - [ ] 错题列表 (error-questions.vue → questions.tsx)
  - [ ] 错题详情 (error-question-detail.vue → detail.tsx)
  - [ ] 错题练习 (error-practice.vue → practice.tsx)
  - [ ] 错题结果 (error-result.vue → result.tsx)
  - [ ] 错题拍照 (error-camera.nvue → camera.tsx，使用expo-camera)
- **工作量**：12-15小时

#### 2.8 AI批改-作文收录
- **源文件**：`/Users/zhoudabo/Desktop/web项目/XHTX_APP/src/pages/AI/composition-record.vue`
- **目标文件**：`src/app/ai/composition-record.tsx`
- **功能**：
  - [ ] 作文历史记录
  - [ ] 作文详情查看
  - [ ] 作文管理（删除、分享等）
- **工作量**：4-6小时

#### 2.9 AI批改-照片管理
- **源文件**：`/Users/zhoudabo/Desktop/web项目/XHTX_APP/src/pages/AI/photo-manager.vue`
- **目标文件**：`src/app/ai/photo-manager.tsx`
- **功能**：
  - [ ] 照片列表
  - [ ] 照片预览
  - [ ] 照片删除
- **工作量**：3-4小时

---

### 第三阶段：个人中心模块
**优先级：P2（重要功能）**  
**预计工时：10-12小时**

#### 3.1 个人信息编辑
- **源文件**：`/Users/zhoudabo/Desktop/web项目/XHTX_APP/src/pages/my/edit.vue`
- **目标文件**：`src/app/my/edit.tsx`
- **功能**：
  - [ ] 头像上传
  - [ ] 昵称修改
  - [ ] 年级选择
  - [ ] 其他信息编辑
- **工作量**：3-4小时

#### 3.2 学习数据页
- **源文件**：`/Users/zhoudabo/Desktop/web项目/XHTX_APP/src/pages/my/data.vue`
- **目标文件**：`src/app/my/data.tsx`
- **功能**：
  - [ ] 学习时长统计
  - [ ] 学习进度展示
  - [ ] 数据图表
- **工作量**：3-4小时

#### 3.3 徽章系统
- **源文件**：`/Users/zhoudabo/Desktop/web项目/XHTX_APP/src/pages/my/badges.vue`
- **目标文件**：`src/app/my/badges.tsx`
- **功能**：
  - [ ] 徽章列表
  - [ ] 徽章详情
  - [ ] 获得条件说明
- **工作量**：2-3小时

#### 3.4 图表组件
- **源目录**：`/Users/zhoudabo/Desktop/web项目/XHTX_APP/src/pages/my/components/`
- **目标目录**：`src/components/charts/`
- **组件清单**：
  - [ ] 难度图表 (DifficultyChart.vue → DifficultyChart.tsx)
  - [ ] 掌握度图表 (MasteryChart.vue → MasteryChart.tsx)
  - [ ] 每周学习图表 (WeeklyStudyChart.vue → WeeklyStudyChart.tsx)
  - [ ] 每周时长图表 (WeeklyTimeChart.vue → WeeklyTimeChart.tsx)
- **技术方案**：使用`react-native-svg`和`react-native-chart-kit`
- **工作量**：2-3小时

---

### 第四阶段：通用组件和工具
**优先级：P2（重要）**  
**预计工时：10-14小时**

#### 4.1 通用组件迁移
- **源目录**：`/Users/zhoudabo/Desktop/web项目/XHTX_APP/src/components/`
- **目标目录**：`src/components/`
- **组件清单**：
  - [ ] 奖励通知 (RewardNotification.vue → RewardNotification.tsx)
  - [ ] 科普弹窗 (SciencePopularization.vue → SciencePopularization.tsx)
  - [ ] 更新对话框 (UpdateDialog.vue → UpdateDialog.tsx)
  - [ ] 设备认证弹窗 (DeviceAuthModal.vue → DeviceAuthModal.tsx)
  - [ ] 登录弹窗 (LoginPopup.vue → LoginPopup.tsx)
- **工作量**：6-8小时

#### 4.2 API服务完善
- **源目录**：`/Users/zhoudabo/Desktop/web项目/XHTX_APP/src/service/`
- **目标目录**：`src/services/`
- **服务清单**：
  - [ ] 个人中心服务 (my.ts → my.ts)
  - [ ] 积分商城服务 (pointsMall.ts → pointsMall.ts)
  - [ ] 阅读服务 (reader.ts → reader.ts)
  - [ ] 学习服务 (study.ts → study.ts)
  - [ ] 应用服务 (app.ts → app.ts)
- **工作量**：4-6小时

---

### 第五阶段：次要功能（最后执行）
**优先级：P3（最后）**  
**预计工时：27-35小时**

#### 5.1 小褐阅读模块
- **源目录**：`/Users/zhoudabo/Desktop/web项目/XHTX_APP/src/pages/reader/`
- **目标目录**：`src/app/reader/`
- **页面清单**：
  - [ ] 阅读首页 (index.vue → reader/index.tsx)
  - [ ] EPUB阅读器 (epubReader.vue, epubReaderNew.vue → reader/epub.tsx)
  - [ ] PDF阅读器 (pdfReader.vue → reader/pdf.tsx)
  - [ ] TXT阅读器 (txtReader.vue → reader/txt.tsx)
- **技术方案**：
  - EPUB: `@epubjs-react-native/core`或自定义实现
  - PDF: `react-native-pdf`
  - TXT: 自定义ScrollView实现
- **工作量**：15-20小时

#### 5.2 积分商城完善
- **源目录**：`/Users/zhoudabo/Desktop/web项目/XHTX_APP/src/pages/pointsMall/`
- **目标目录**：`src/app/points-mall/`
- **页面清单**：
  - [ ] 商城首页完善 (index.vue → (tabs)/points-mall.tsx，需完善)
  - [ ] 积分明细 (pointsDetail/index.vue → points-mall/detail.tsx)
  - [ ] 兑换记录 (exchangeRecord/index.vue → points-mall/exchange-record.tsx)
- **弹窗组件**：
  - [ ] 添加地址弹窗 (AddAddressPopup.vue → components/AddAddressPopup.tsx)
  - [ ] 地址列表弹窗 (AddressListPopup.vue → components/AddressListPopup.tsx)
  - [ ] 编辑地址弹窗 (EditAddressPopup.vue → components/EditAddressPopup.tsx)
  - [ ] 订单确认弹窗 (OrderConfirmPopup.vue → components/OrderConfirmPopup.tsx)
  - [ ] 商品详情弹窗 (ProductDetailPopup.vue → components/ProductDetailPopup.tsx)
- **工作量**：12-15小时

---

## 不迁移的模块

以下模块暂不迁移（已明确排除）：

- ❌ 排行榜模块 (pages/ranking/)
- ❌ 健康模块 (pages/health/)
- ❌ VIP会员模块 (pages/vip/)
- ❌ WiFi配置模块 (pages/wifi/)
- ❌ 学习日历模块 (pages/calendar/)
- ❌ 精品课堂模块 (pages/classroom/)
- ❌ 精准学习模块 (pages/study/precision-learning/)
- ❌ 教材同步模块 (pages/study/textbook-sync/)
- ❌ 自习室模块 (pages/study-room/)

---

## 技术方案汇总

### React Native替代方案

| UniApp功能 | React Native方案 |
|-----------|-----------------|
| 视频播放 | `expo-av` (Video组件) |
| 相机拍照 | `expo-camera`或`react-native-vision-camera` |
| 图片处理 | `expo-image-manipulator` |
| 音频录制 | `expo-av` (Audio) |
| EPUB阅读 | `@epubjs-react-native/core` |
| PDF阅读 | `react-native-pdf` |
| 图表绘制 | `react-native-svg` + `react-native-chart-kit` |
| 语音识别 | `@react-native-voice/voice` |
| 语音合成 | `expo-speech` |
| 文件系统 | `expo-file-system` |
| Canvas绘图 | `react-native-svg`或自定义View组件 |
| 雷达图 | `react-native-svg` (Polygon) |

### 暂不处理的原生功能

- 姿态检测插件 (uniplugin_posemonitor)
- 百度语音唤醒
- WebView姿态检测

---

## 总工作量估算

| 阶段 | 模块数量 | 预计工时 | 优先级 |
|------|---------|---------|--------|
| 第一阶段 | 2个模块 | 6-9小时 | P0 |
| 第二阶段 | 9个模块 | 40-53小时 | P1 |
| 第三阶段 | 4个任务 | 10-12小时 | P2 |
| 第四阶段 | 2个任务 | 10-14小时 | P2 |
| 第五阶段 | 2个模块 | 27-35小时 | P3 |
| **总计** | **19个模块/任务** | **93-123小时** | - |

---

## 执行计划

### 当前状态
- ✅ 已完成4个模块（学习首页、AI作文结果、同步课堂首页、同步课堂视频播放-部分）
- 🎯 下一步：修复同步课堂视频播放页面

### 执行顺序
1. **立即执行**：第一阶段（完善已有模块）
2. **核心功能**：第二阶段（AI批改模块）
3. **重要功能**：第三阶段（个人中心）+ 第四阶段（通用组件）
4. **次要功能**：第五阶段（阅读器、积分商城）

### 质量保证
- 每个模块完成后进行功能测试
- 确保UI与UniApp版本一致
- 所有API调用经过验证
- 遵循React Native最佳实践
- 使用rpx单位确保适配
- 避免useEffect无限循环问题

---

## 注意事项

1. **严格遵循记忆模版规范**
2. **所有单位使用rpx**
3. **避免useEffect无限循环**（对象依赖、分离初始化和数据加载）
4. **不创建迁移文档**（只记录在本计划中）
5. **模块化组织**（每个功能模块独立文件夹）
6. **完全重写**（理解业务逻辑后重写，不是简单翻译）

---

**计划制定日期**：2025-10-10  
**预计完成时间**：93-123小时工作量  
**当前进度**：4/23个模块完成（17.4%）

