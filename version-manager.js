#!/usr/bin/env node

/**
 * 统一版本号管理脚本
 * 使用方法: node version-manager.js <command> [version]
 * 
 * 命令:
 *   patch    - 补丁版本 (1.0.0 → 1.0.1)
 *   minor    - 次版本 (1.0.0 → 1.1.0)
 *   major    - 主版本 (1.0.0 → 2.0.0)
 *   set      - 设置特定版本 (set 1.2.3)
 *   check    - 检查版本号一致性
 *   sync     - 同步所有版本号
 */

const fs = require('fs');
const path = require('path');

class VersionManager {
  constructor() {
    this.appJsonPath = 'app.json';
    this.packageJsonPath = 'package.json';
    this.appConfigPath = 'app.config.js';
    this.buildGradlePath = 'android/app/build.gradle';
    this.stringsXmlPath = 'android/app/src/main/res/values/strings.xml';  // ✨ 新增
  }

  // 读取配置文件
  readConfig() {
    const appConfig = JSON.parse(fs.readFileSync(this.appJsonPath, 'utf8'));
    const packageConfig = JSON.parse(fs.readFileSync(this.packageJsonPath, 'utf8'));
    
    // 读取 app.config.js
    let appConfigJs = null;
    if (fs.existsSync(this.appConfigPath)) {
      const appConfigContent = fs.readFileSync(this.appConfigPath, 'utf8');
      // 提取 runtimeVersion 值
      const runtimeVersionMatch = appConfigContent.match(/runtimeVersion:\s*["']([^"']+)["']/);
      appConfigJs = {
        runtimeVersion: runtimeVersionMatch ? runtimeVersionMatch[1] : null,
        content: appConfigContent
      };
    }
    
    // 读取 build.gradle
    let buildGradle = null;
    if (fs.existsSync(this.buildGradlePath)) {
      const buildGradleContent = fs.readFileSync(this.buildGradlePath, 'utf8');
      // 提取 versionCode 和 versionName
      const versionCodeMatch = buildGradleContent.match(/versionCode\s+(\d+)/);
      const versionNameMatch = buildGradleContent.match(/versionName\s+["']([^"']+)["']/);
      buildGradle = {
        versionCode: versionCodeMatch ? parseInt(versionCodeMatch[1]) : null,
        versionName: versionNameMatch ? versionNameMatch[1] : null,
        content: buildGradleContent
      };
    }
    
    // ✨ 新增：读取 strings.xml
    let stringsXml = null;
    if (fs.existsSync(this.stringsXmlPath)) {
      const stringsXmlContent = fs.readFileSync(this.stringsXmlPath, 'utf8');
      // 提取 expo_runtime_version
      const runtimeVersionMatch = stringsXmlContent.match(/<string name="expo_runtime_version">([^<]+)<\/string>/);
      stringsXml = {
        runtimeVersion: runtimeVersionMatch ? runtimeVersionMatch[1] : null,
        content: stringsXmlContent
      };
    }
    
    return {
      app: appConfig,
      package: packageConfig,
      appConfigJs: appConfigJs,
      buildGradle: buildGradle,
      stringsXml: stringsXml  // ✨ 新增
    };
  }

  // 写入配置文件
  writeConfig(config) {
    fs.writeFileSync(this.appJsonPath, JSON.stringify(config.app, null, 2));
    fs.writeFileSync(this.packageJsonPath, JSON.stringify(config.package, null, 2));
    
    // 更新 app.config.js 中的 runtimeVersion
    if (config.appConfigJs && config.appConfigJs.content) {
      const newContent = config.appConfigJs.content.replace(
        /runtimeVersion:\s*["'][^"']+["']/,
        `runtimeVersion: "${config.app.expo.version}"`
      );
      fs.writeFileSync(this.appConfigPath, newContent);
    }
    
    // 更新 build.gradle 中的 versionCode 和 versionName
    if (config.buildGradle && config.buildGradle.content) {
      let newContent = config.buildGradle.content;
      
      // 更新 versionCode
      newContent = newContent.replace(
        /versionCode\s+\d+/,
        `versionCode ${config.app.expo.android.versionCode}`
      );
      
      // 更新 versionName
      newContent = newContent.replace(
        /versionName\s+["'][^"']+["']/,
        `versionName "${config.app.expo.version}"`
      );
      
      fs.writeFileSync(this.buildGradlePath, newContent);
      console.log(`✅ 已更新 ${this.buildGradlePath}`);
    }
    
    // ✨ 新增：更新 strings.xml 中的 expo_runtime_version
    if (config.stringsXml && config.stringsXml.content) {
      const newContent = config.stringsXml.content.replace(
        /<string name="expo_runtime_version">.*<\/string>/,
        `<string name="expo_runtime_version">${config.app.expo.version}</string>`
      );
      fs.writeFileSync(this.stringsXmlPath, newContent);
      console.log(`✅ 已更新 ${this.stringsXmlPath}`);
    }
  }

  // 解析版本号
  parseVersion(version) {
    const parts = version.split('.').map(Number);
    return {
      major: parts[0] || 0,
      minor: parts[1] || 0,
      patch: parts[2] || 0,
      version: version
    };
  }

  // 生成版本号
  generateVersion(major, minor, patch) {
    return `${major}.${minor}.${patch}`;
  }

  // 生成版本代码
  generateVersionCode(major, minor, patch) {
    return major * 10000 + minor * 100 + patch;
  }

  // 更新版本号
  updateVersion(type, customVersion = null) {
    const config = this.readConfig();
    const currentVersion = config.app.expo.version;
    const currentVersionCode = config.app.expo.android.versionCode || 1;
    
    let newVersion;
    let newVersionCode;
    
    if (customVersion) {
      newVersion = customVersion;
      const parsed = this.parseVersion(customVersion);
      newVersionCode = this.generateVersionCode(parsed.major, parsed.minor, parsed.patch);
    } else {
      const parsed = this.parseVersion(currentVersion);
      
      switch (type) {
        case 'patch':
          parsed.patch++;
          break;
        case 'minor':
          parsed.minor++;
          parsed.patch = 0;
          break;
        case 'major':
          parsed.major++;
          parsed.minor = 0;
          parsed.patch = 0;
          break;
        default:
          throw new Error(`未知的版本类型: ${type}`);
      }
      
      newVersion = this.generateVersion(parsed.major, parsed.minor, parsed.patch);
      newVersionCode = this.generateVersionCode(parsed.major, parsed.minor, parsed.patch);
    }

    // 更新配置
    config.app.expo.version = newVersion;
    config.app.expo.android.versionCode = newVersionCode;
    config.app.expo.ios.buildNumber = newVersionCode.toString();
    config.package.version = newVersion;

    this.writeConfig(config);

    console.log('✅ 版本号更新完成!');
    console.log(`📱 用户版本号: ${currentVersion} → ${newVersion}`);
    console.log(`🔢 Android版本代码: ${currentVersionCode} → ${newVersionCode}`);
    console.log(`🔢 iOS构建号: ${currentVersionCode} → ${newVersionCode}`);
    
    return {
      version: newVersion,
      versionCode: newVersionCode
    };
  }

  // 检查版本号一致性
  checkConsistency() {
    const config = this.readConfig();
    const appVersion = config.app.expo.version;
    const packageVersion = config.package.version;
    const androidVersionCode = config.app.expo.android.versionCode;
    const iosBuildNumber = config.app.expo.ios.buildNumber;

    console.log('🔍 检查版本号一致性...');
    console.log(`📱 app.json version: ${appVersion}`);
    console.log(`📦 package.json version: ${packageVersion}`);
    console.log(`🤖 Android versionCode: ${androidVersionCode}`);
    console.log(`🍎 iOS buildNumber: ${iosBuildNumber}`);
    
    if (config.appConfigJs && config.appConfigJs.runtimeVersion) {
      console.log(`⚙️  app.config.js runtimeVersion: ${config.appConfigJs.runtimeVersion}`);
    }
    
    if (config.buildGradle) {
      console.log(`🔧 build.gradle versionCode: ${config.buildGradle.versionCode}`);
      console.log(`🔧 build.gradle versionName: ${config.buildGradle.versionName}`);
    }
    
    // ✨ 新增：显示 strings.xml
    if (config.stringsXml && config.stringsXml.runtimeVersion) {
      console.log(`📄 strings.xml expo_runtime_version: ${config.stringsXml.runtimeVersion}`);
    }

    const issues = [];
    
    if (appVersion !== packageVersion) {
      issues.push(`app.json 和 package.json 版本号不一致: ${appVersion} vs ${packageVersion}`);
    }

    if (androidVersionCode !== parseInt(iosBuildNumber)) {
      issues.push(`Android versionCode 和 iOS buildNumber 不一致: ${androidVersionCode} vs ${iosBuildNumber}`);
    }
    
    if (config.appConfigJs && config.appConfigJs.runtimeVersion && config.appConfigJs.runtimeVersion !== appVersion) {
      issues.push(`app.config.js runtimeVersion 和 app.json version 不一致: ${config.appConfigJs.runtimeVersion} vs ${appVersion}`);
    }
    
    if (config.buildGradle) {
      if (config.buildGradle.versionName !== appVersion) {
        issues.push(`build.gradle versionName 和 app.json version 不一致: ${config.buildGradle.versionName} vs ${appVersion}`);
      }
      if (config.buildGradle.versionCode !== androidVersionCode) {
        issues.push(`build.gradle versionCode 和 app.json versionCode 不一致: ${config.buildGradle.versionCode} vs ${androidVersionCode}`);
      }
    }
    
    // ✨ 新增：检查 strings.xml
    if (config.stringsXml && config.stringsXml.runtimeVersion && config.stringsXml.runtimeVersion !== appVersion) {
      issues.push(`strings.xml expo_runtime_version 和 app.json version 不一致: ${config.stringsXml.runtimeVersion} vs ${appVersion}`);
    }

    if (issues.length === 0) {
      console.log('✅ 版本号一致性检查通过!');
    } else {
      console.log('❌ 发现版本号不一致问题:');
      issues.forEach(issue => console.log(`   - ${issue}`));
      console.log('\n💡 运行 "npm run version:sync" 来同步所有版本号');
    }

    return issues.length === 0;
  }

  // 同步版本号
  syncVersions() {
    const config = this.readConfig();
    const appVersion = config.app.expo.version;
    const parsed = this.parseVersion(appVersion);
    const versionCode = this.generateVersionCode(parsed.major, parsed.minor, parsed.patch);

    // 同步所有版本号
    config.package.version = appVersion;
    config.app.expo.android.versionCode = versionCode;
    config.app.expo.ios.buildNumber = versionCode.toString();

    this.writeConfig(config);

    console.log('🔄 版本号同步完成!');
    console.log(`📱 统一版本号: ${appVersion}`);
    console.log(`🔢 统一版本代码: ${versionCode}`);
  }

  // 显示当前版本信息
  showCurrentVersion() {
    const config = this.readConfig();
    const appVersion = config.app.expo.version;
    const androidVersionCode = config.app.expo.android.versionCode;
    const iosBuildNumber = config.app.expo.ios.buildNumber;

    console.log('📋 当前版本信息:');
    console.log(`📱 用户版本号: ${appVersion}`);
    console.log(`🤖 Android版本代码: ${androidVersionCode}`);
    console.log(`🍎 iOS构建号: ${iosBuildNumber}`);
    console.log(`📦 项目版本号: ${config.package.version}`);
    
    if (config.appConfigJs && config.appConfigJs.runtimeVersion) {
      console.log(`⚙️  App.config.js runtimeVersion: ${config.appConfigJs.runtimeVersion}`);
    } else {
      console.log(`⚙️  App.config.js runtimeVersion: 未找到`);
    }
    
    if (config.buildGradle) {
      console.log(`🔧 build.gradle versionCode: ${config.buildGradle.versionCode}`);
      console.log(`🔧 build.gradle versionName: ${config.buildGradle.versionName}`);
    } else {
      console.log(`🔧 build.gradle: 未找到`);
    }
    
    // ✨ 新增：显示 strings.xml
    if (config.stringsXml && config.stringsXml.runtimeVersion) {
      console.log(`📄 strings.xml expo_runtime_version: ${config.stringsXml.runtimeVersion}`);
    } else {
      console.log(`📄 strings.xml: 未找到`);
    }
  }
}

// 命令行接口
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const version = args[1];

  const manager = new VersionManager();

  try {
    switch (command) {
      case 'patch':
        manager.updateVersion('patch');
        break;
      case 'minor':
        manager.updateVersion('minor');
        break;
      case 'major':
        manager.updateVersion('major');
        break;
      case 'set':
        if (!version) {
          console.error('❌ 请提供版本号: node version-manager.js set 1.2.3');
          process.exit(1);
        }
        manager.updateVersion('set', version);
        break;
      case 'check':
        manager.checkConsistency();
        break;
      case 'sync':
        manager.syncVersions();
        break;
      case 'show':
        manager.showCurrentVersion();
        break;
      default:
        console.log('📋 版本号管理工具');
        console.log('');
        console.log('使用方法:');
        console.log('  node version-manager.js patch          # 补丁版本 (1.0.0 → 1.0.1)');
        console.log('  node version-manager.js minor          # 次版本 (1.0.0 → 1.1.0)');
        console.log('  node version-manager.js major          # 主版本 (1.0.0 → 2.0.0)');
        console.log('  node version-manager.js set 1.2.3      # 设置特定版本');
        console.log('  node version-manager.js check          # 检查版本号一致性');
        console.log('  node version-manager.js sync           # 同步所有版本号');
        console.log('  node version-manager.js show           # 显示当前版本信息');
        break;
    }
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = VersionManager;