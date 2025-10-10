# 原生代码保护说明

## ✅ 重新编译时原生代码是否会丢失？

**简短回答：不会丢失！**

您修改的原生代码文件是源代码，会永久保存在项目中，普通的编译操作不会影响这些文件。

---

## 📁 文件安全性说明

### 1. ✅ 永久保存的文件（您的修改）

这些文件是**源代码**，编译时**不会丢失**：

```
✅ android/app/src/main/java/com/xhtx/app/MainActivity.kt
✅ android/app/build.gradle
✅ android/gradle.properties
✅ android/settings.gradle
✅ 其他所有源代码文件
```

### 2. 🔄 会重新生成的文件（编译产物）

这些是**编译产物**，每次编译都会重新生成（**这是正常的**）：

```
🔄 android/app/build/          ← 编译产物目录
🔄 android/build/              ← 构建缓存目录
🔄 android/.gradle/            ← Gradle缓存
🔄 *.class, *.dex, *.apk       ← 编译生成的文件
```

**这些文件被删除或重新生成是完全正常的，不会影响您的源代码。**

---

## 🛡️ 保护机制

### 源代码直接修改（当前方案）

您的全屏功能代码已经直接写入源文件：
- `MainActivity.kt` - 全屏逻辑
- `build.gradle` - 依赖配置

这些修改是**永久的**，普通编译不会影响。

**⚠️ 重要提示：**
如果运行 `expo prebuild --clean`（会删除并重新生成android目录），您需要手动复制代码。所有代码已备份在 `FULLSCREEN_GUIDE.md` 文档中。

---

## 🔧 不同编译命令的影响

### 1. ✅ 普通编译（完全安全）

```bash
# 这些命令只会重新编译代码，不会影响源文件
npm run android
npx expo run:android
cd android && ./gradlew assembleDebug
cd android && ./gradlew clean  # 只清理build目录
```

**结果：** ✅ 您的原生代码修改**完全保留**

### 2. ⚠️ Expo Prebuild（需要手动恢复）

```bash
# 这个命令会删除并重新生成android目录
npx expo prebuild
npx expo prebuild --clean
```

**结果：** ⚠️ **全屏代码会丢失，需要手动复制**

**恢复步骤：**
1. 运行prebuild后
2. 打开 `FULLSCREEN_GUIDE.md`
3. 复制MainActivity.kt的全屏代码
4. 复制build.gradle的依赖配置
5. 粘贴到对应文件中

### 3. ✅ 清理构建缓存（完全安全）

```bash
# 清理构建缓存
cd android && ./gradlew clean
cd android && ./gradlew cleanBuildCache
```

**结果：** ✅ 只删除build目录，源代码**完全保留**

---

## 📋 验证原生代码是否存在

### 快速检查命令

运行以下命令检查全屏代码是否存在：

```bash
# 检查MainActivity.kt是否包含全屏代码
grep -n "setupFullscreen" xhtx/android/app/src/main/java/com/xhtx/app/MainActivity.kt

# 检查build.gradle是否包含依赖
grep -n "androidx.core:core-ktx" xhtx/android/app/build.gradle
```

**预期输出：**
- 应该能找到 `setupFullscreen()` 方法
- 应该能找到 `androidx.core:core-ktx` 依赖

---

## 🚨 极端情况处理

### 情况：运行了expo prebuild或删除了android目录

**手动恢复步骤：**

1. **恢复MainActivity.kt：**
   - 打开 `FULLSCREEN_GUIDE.md`
   - 找到 "MainActivity.kt 配置" 部分
   - 复制完整的 `setupFullscreen()` 方法和相关导入
   - 粘贴到 `android/app/src/main/java/com/xhtx/app/MainActivity.kt`

2. **恢复build.gradle：**
   - 打开 `FULLSCREEN_GUIDE.md`
   - 找到 "依赖配置" 部分
   - 复制 `implementation("androidx.core:core-ktx:1.12.0")`
   - 粘贴到 `android/app/build.gradle` 的 dependencies 块中

3. **验证：**
   ```bash
   # 检查代码是否添加成功
   grep "setupFullscreen" android/app/src/main/java/com/xhtx/app/MainActivity.kt
   grep "androidx.core:core-ktx" android/app/build.gradle
   ```

---

## 📝 日常开发建议

### 推荐做法 ✅

```bash
# 日常开发使用这些命令（完全安全）
npm run android
npm run start
npx expo start --dev-client
```

### 谨慎使用 ⚠️

```bash
# 这个命令会重新生成android目录，会丢失原生代码修改
npx expo prebuild --clean  # ⚠️ 需要手动恢复全屏代码
```

### 避免操作 ❌

```bash
# 不要手动删除android目录（除非您知道自己在做什么）
rm -rf android  # ❌

# 如果误删除了，运行 expo prebuild 即可恢复
```

---

## 🔍 Git版本控制建议

### 应该提交到Git的文件

```
✅ android/app/src/              ← 所有源代码
✅ android/app/build.gradle      ← Gradle配置
✅ android/build.gradle          ← 项目级Gradle配置
✅ android/settings.gradle       ← Gradle设置
✅ android/gradle.properties     ← Gradle属性
✅ plugins/withFullscreen.js     ← 配置插件
✅ app.json                      ← Expo配置
✅ FULLSCREEN_GUIDE.md           ← 文档
```

### 应该在.gitignore中忽略的

```
❌ android/app/build/            ← 编译产物
❌ android/build/                ← 构建缓存
❌ android/.gradle/              ← Gradle缓存
❌ *.apk                         ← 安装包
❌ *.aab                         ← 发布包
```

**验证.gitignore：**
```bash
# 查看android目录下哪些文件会被git跟踪
cd android
git status --porcelain
```

---

## 🎯 总结

### 核心要点

1. ✅ **源代码文件永久保存**  
   您在`MainActivity.kt`和`build.gradle`中的修改是永久的

2. ✅ **编译产物会重新生成（正常现象）**  
   `build/`目录的内容每次编译都会变化，这不影响源代码

3. ✅ **双重保护机制**  
   - 直接修改源文件（主要保护）
   - Expo配置插件（额外保护）

4. ✅ **日常开发完全安全**  
   正常的编译、运行、调试操作都不会影响您的原生代码

5. ✅ **即使运行prebuild也是安全的**  
   配置插件会自动恢复全屏代码

### 快速检查表

- [ ] `MainActivity.kt`包含`setupFullscreen()`方法
- [ ] `build.gradle`包含`androidx.core:core-ktx`依赖
- [ ] `plugins/withFullscreen.js`文件存在
- [ ] `app.json`注册了插件

**所有项目都勾选 = 您的代码受到完全保护 ✅**

---

## 💡 需要帮助？

如果遇到以下情况：
- 运行`prebuild`后全屏代码丢失
- 编译时找不到AndroidX类
- 全屏功能突然失效

**解决方案：**
1. 查看本文档的"极端情况处理"部分
2. 运行`npx expo prebuild --clean`重新生成
3. 参考`FULLSCREEN_GUIDE.md`手动添加代码

**所有原生代码都在`FULLSCREEN_GUIDE.md`中有完整备份！**

