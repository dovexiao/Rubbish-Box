# AI批改完整流程文档

## 流程概述

```
学习首页 (study/index)
  ↓ 点击"作业批改"或"作文批改"
相机拍照页面 (ai/camera)
  ↓ 拍摄1-6张照片，点击"开始批改"
照片旋转页面 (ai/rotate)
  ↓ 调整照片角度，点击确认
照片管理页面 (ai/photo-manager)
  ↓ 上传照片获取imguuid
AI加载页面 (ai/loading)
  ↓ 调用OCR API识别
AI结果页面 (ai/result)
  ├─ 题目批改 → QuestionResult组件
  └─ 作文批改 → CompositionResult组件
```

## 已实现的页面和组件

### 页面 (Pages)

1. **学习首页** `/src/app/(tabs)/study.tsx` ✅
   - 已完成，包含AI批改入口

2. **相机拍照页面** `/src/app/ai/camera.tsx` ✅
   - 已完成，支持拍摄1-6张照片
   - 支持删除照片
   - 点击"开始批改"提交

3. **照片旋转页面** `/src/app/ai/rotate.tsx` ✅
   - 新创建，支持90度旋转
   - 三个按钮：旋转、返回、确认

4. **AI加载页面** `/src/app/ai/loading.tsx` ✅
   - 新创建，调用OCR API
   - 显示科普知识轮播
   - 自动跳转到结果页面

5. **AI结果页面** `/src/app/ai/result.tsx` ✅
   - 新创建，根据类型显示不同结果
   - 支持题目批改和作文批改

### 组件 (Components)

1. **QuestionResult** `/src/components/QuestionResult.tsx` ✅
   - 题目批改结果展示
   - 左侧错题列表
   - 右侧答案和解析
   - 刮刮卡查看答案功能
   - 全部正确弹窗

2. **CompositionResult** `/src/components/CompositionResult.tsx` ✅
   - 作文批改结果展示
   - 左侧作文原文（分页显示）
   - 右侧作文点评
   - 写作能力分析
   - 分段点评
   - 总评、亮点、不足
   - 提升建议

3. **SciencePopularization** `/src/components/SciencePopularization.tsx` ✅
   - 科普知识展示
   - 每12.5秒轮播一次
   - 淡入淡出动画

### 服务 (Services)

**AI服务** `/src/services/ai.ts` ✅
- `aiOcr()` - OCR识别
- `getQuestion()` - 获取题目批改结果
- `getCompositionCorrectionRecordDetails()` - 获取作文批改详情
- `getWhysList()` - 获取科普知识列表

### 状态管理 (Stores)

**TabbarStore** `/src/stores/tabbarStore.ts` ✅
- 管理底部导航栏当前索引

## 待完成的组件

1. **照片管理页面** `/src/app/ai/photo-manager.tsx` ⏳
   - 需要实现上传功能
   - 返回imguuid供加载页面使用

2. **CompositionCanvas** `/src/components/CompositionCanvas.tsx` ⏳
   - 作文原文Canvas渲染
   - 田字格显示
   - 标题和分数显示

3. **WritingAnalysis** `/src/components/WritingAnalysis.tsx` ⏳
   - 写作能力雷达图
   - 多维度评分展示

## 路由配置

所有页面都在 `/src/app/ai/` 目录下，使用 expo-router 自动生成路由：

- `/ai/camera?type=question` - 作业批改相机
- `/ai/camera?type=composition` - 作文批改相机
- `/ai/rotate?imageUrl={url}&type={type}` - 照片旋转
- `/ai/photo-manager?imagePath={path}` - 照片管理
- `/ai/loading?imguuid={uuid}&type={type}` - AI加载
- `/ai/result?cache_key={key}` - 题目结果
- `/ai/result?resData={json}` - 作文结果
- `/ai/result?id={id}` - 作文收录详情

## API接口

### 1. OCR识别
```typescript
POST /AppStart/Protected/ai_ocr/
{
  imguuid: string,
  type: string  // "question" 或 "composition"
}
```

### 2. 获取题目结果
```typescript
GET /AppStart/Protected/get_question/?cache_key={key}
```

### 3. 获取作文详情
```typescript
GET /AppStart/Protected/composition_correction_record_details/?id={id}
```

### 4. 获取科普知识
```typescript
POST /AppStart/UserInformation/whys_list/
```

## 测试流程

1. 启动应用
2. 进入"学习"标签页
3. 点击"作业批改"或"作文批改"
4. 拍摄照片（1-6张）
5. 点击"开始批改"
6. 调整照片角度
7. 确认上传
8. 等待AI识别（显示科普知识）
9. 查看批改结果

## 注意事项

- 相机页面需要相机权限
- 照片旋转支持90度递增
- AI加载页面会自动跳转
- 题目结果支持刮刮卡查看答案
- 作文结果支持分页显示

