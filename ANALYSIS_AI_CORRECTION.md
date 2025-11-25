# 科大讯飞AI批改图片处理实现分析

## 图片对比分析

### 处理前（拍照图片）
- 原始相机拍摄
- 可能有透视畸变
- 背景杂乱（桌面、阴影等）
- 光照不均
- 对比度一般

### 处理后（AI批改图片）
- ✅ 文档边缘自动检测和裁剪
- ✅ 透视校正（矫正倾斜角度）
- ✅ 对比度增强（文字更清晰）
- ✅ 背景去噪/二值化处理
- ✅ 类似扫描仪效果

---

## 技术实现方案

### 方案1：客户端实时处理 📱

#### 需要的库
```bash
# 图像处理
npx expo install expo-image-manipulator

# 文档扫描（边缘检测）
npm install react-native-document-scanner-plugin
# 或
npm install react-native-perspective-image-cropper
```

#### 实现步骤
1. **拍照后立即处理**
   - 边缘检测 → 找到文档四个角点
   - 透视变换 → 将倾斜的文档矫正
   - 图像增强 → 提高对比度、锐化

2. **基础处理（expo-image-manipulator）**
```typescript
import * as ImageManipulator from 'expo-image-manipulator';

async function enhanceImage(uri: string) {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [
      { resize: { width: 2000 } }, // 统一尺寸
      // 增加对比度和锐化需要通过滤镜或自定义处理
    ],
    { 
      compress: 0.9, 
      format: ImageManipulator.SaveFormat.JPEG 
    }
  );
  return result.uri;
}
```

3. **高级处理（文档扫描）**
```typescript
import DocumentScanner from 'react-native-document-scanner-plugin';

async function scanDocument(imageUri: string) {
  const { scannedImages } = await DocumentScanner.scanDocument({
    sourceImageUri: imageUri,
    // 自动检测边缘并裁剪
    // 透视校正
    // 增强对比度
  });
  return scannedImages[0];
}
```

#### 优点
- ⚡ 即时反馈，无需等待上传
- 👍 用户可以立即看到处理效果
- 💾 减少服务器负担

#### 缺点
- 📱 受设备性能限制
- 🔋 耗电量较大
- 🐌 复杂算法可能较慢

---

### 方案2：服务器端处理 ☁️

#### 服务器使用的技术栈
- **Python + OpenCV**（最常用）
- **Python + PIL/Pillow**
- **专业文档扫描SDK**

#### 后端处理流程
```python
import cv2
import numpy as np

def process_document_image(image_path):
    """
    文档图像处理主流程
    """
    # 1. 读取图像
    img = cv2.imread(image_path)
    
    # 2. 边缘检测
    edges = detect_edges(img)
    
    # 3. 找到文档轮廓
    contours = find_document_contour(edges)
    
    # 4. 透视变换（矫正）
    warped = perspective_transform(img, contours)
    
    # 5. 图像增强
    enhanced = enhance_contrast(warped)
    
    # 6. 去噪/二值化（可选）
    # final = cv2.adaptiveThreshold(enhanced, ...)
    
    return enhanced

def detect_edges(img):
    """边缘检测"""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    edges = cv2.Canny(blurred, 50, 150)
    return edges

def find_document_contour(edges):
    """找到文档的四个角点"""
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    # 找到最大的矩形轮廓
    largest_contour = max(contours, key=cv2.contourArea)
    # 近似为多边形
    epsilon = 0.02 * cv2.arcLength(largest_contour, True)
    approx = cv2.approxPolyDP(largest_contour, epsilon, True)
    return approx

def perspective_transform(img, corners):
    """透视变换"""
    # 获取目标点
    dst_points = get_destination_points(corners)
    # 计算变换矩阵
    M = cv2.getPerspectiveTransform(corners, dst_points)
    # 应用变换
    warped = cv2.warpPerspective(img, M, (img.shape[1], img.shape[0]))
    return warped

def enhance_contrast(img):
    """对比度增强"""
    # 方法1：直方图均衡化
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    enhanced = cv2.equalizeHist(gray)
    
    # 方法2：CLAHE（自适应直方图均衡）
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    enhanced = clahe.apply(gray)
    
    return enhanced
```

#### 优点
- 🎯 处理质量高
- 🔧 算法复杂度不受限
- 📊 统一处理标准
- 🔄 易于更新算法

#### 缺点
- ⏱️ 需要上传时间
- 📡 依赖网络
- 💰 服务器成本

---

### 方案3：混合方案（推荐）⭐

#### 实现流程

1. **拍照时：客户端预览处理**
   ```typescript
   // 快速处理用于预览
   const previewUri = await quickEnhance(photoUri);
   setPhotos(prev => [...prev, { 
     original: photoUri,
     preview: previewUri 
   }]);
   ```

2. **上传时：上传原图**
   ```typescript
   // 上传原始高清图，由服务器做专业处理
   await uploadOriginalPhoto(photo.original);
   ```

3. **服务器返回：最终处理结果**
   ```typescript
   // 服务器返回处理后的图片URL
   const result = {
     batch_id: "xxx",
     processed_images: [
       { 
         original_url: "...",
         processed_url: "...",  // 服务器处理后的高质量图片
         corners: [...],         // 检测到的文档角点
       }
     ]
   };
   ```

#### 优点
- ✅ 用户体验好（即时预览）
- ✅ 处理质量高（服务器专业处理）
- ✅ 灵活性强（可以同时保留原图）

---

## 具体实现建议

### 阶段1：快速实现（服务器处理）

**修改上传接口，返回处理后的图片**

当前代码已经上传到服务器，只需要：
1. 后端添加图像处理逻辑
2. 返回处理后的图片URL
3. 前端展示处理后的图片

**时间成本**：后端 2-3天

---

### 阶段2：完整体验（混合方案）

**前端添加预览处理**

```typescript
// 在 takePicture 函数中添加
const takePicture = async () => {
  // ... 拍照代码
  
  // 快速预处理（提升对比度、裁剪）
  const enhanced = await ImageManipulator.manipulateAsync(
    photo.uri,
    [
      { resize: { width: 1600 } },
      // 可以添加更多滤镜
    ],
    { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
  );
  
  setPhotos(prev => [...prev, {
    path: photo.uri,        // 原图
    preview: enhanced.uri,  // 预览图
    id: Date.now().toString(),
  }]);
};
```

**时间成本**：前端 1-2天

---

### 阶段3：专业处理（文档扫描）

**使用专业文档扫描库**

```bash
npm install react-native-document-scanner-plugin
```

```typescript
import DocumentScanner from 'react-native-document-scanner-plugin';

const takePicture = async () => {
  const photo = await cameraRef.current.takePictureAsync();
  
  // 文档扫描处理
  const scanned = await DocumentScanner.scanDocument({
    sourceImageUri: photo.uri,
    mode: 'auto', // 自动检测边缘
  });
  
  setPhotos(prev => [...prev, {
    path: scanned.uri,      // 处理后的图
    original: photo.uri,    // 原图
    id: Date.now().toString(),
  }]);
};
```

**时间成本**：前端 2-3天（含测试和优化）

---

## 推荐实现路径

### 第一步（最小可行）
✅ **服务器端处理**
- 修改后端上传接口，添加图像处理
- 返回处理后的图片URL
- 前端不需要改动

**收益**：快速实现核心功能

---

### 第二步（体验优化）
✅ **添加客户端预览**
- 使用 expo-image-manipulator 做轻量处理
- 用户拍照后立即看到增强效果
- 仍然上传原图给服务器做专业处理

**收益**：提升用户体验

---

### 第三步（专业功能）
✅ **文档扫描功能**
- 集成专业文档扫描库
- 自动边缘检测和透视校正
- 提供手动调整功能

**收益**：达到商业产品水平

---

## 技术难点和解决方案

### 1. 边缘检测准确性
**问题**：复杂背景下难以准确识别文档边缘

**解决方案**：
- 使用深度学习模型（如U-Net）
- 提供手动调整功能
- 引导用户在简单背景下拍照

### 2. 光照不均
**问题**：阴影、反光影响识别

**解决方案**：
- 自适应直方图均衡（CLAHE）
- 提示用户改善拍照环境
- 使用闪光灯补光

### 3. 透视畸变
**问题**：倾斜角度过大

**解决方案**：
- 透视变换矫正
- 拍照时显示参考线
- 实时检测并提示用户调整角度

### 4. 性能优化
**问题**：图像处理耗时

**解决方案**：
- 显示处理进度
- 使用 Web Worker 或原生模块
- 降低处理分辨率（预览时）

---

## 成本评估

| 方案 | 开发时间 | 处理质量 | 用户体验 | 服务器成本 |
|------|---------|---------|---------|-----------|
| 纯服务器 | 2-3天 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | 高 |
| 纯客户端 | 3-5天 | ⭐⭐⭐ | ⭐⭐⭐⭐ | 低 |
| 混合方案 | 5-7天 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 中 |

---

## 结论

**可以实现！** 建议采用混合方案：

1. **短期**：服务器处理（2-3天快速上线）
2. **中期**：添加客户端预览（提升体验）
3. **长期**：专业文档扫描功能（达到商业水平）

这样可以：
- ✅ 快速验证功能
- ✅ 逐步优化体验
- ✅ 控制开发成本
- ✅ 保证处理质量

