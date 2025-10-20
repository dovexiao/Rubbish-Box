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
  }

  // 读取配置文件
  readConfig() {
    const appConfig = JSON.parse(fs.readFileSync(this.appJsonPath, 'utf8'));
    const packageConfig = JSON.parse(fs.readFileSync(this.packageJsonPath, 'utf8'));
    
    return {
      app: appConfig,
      package: packageConfig
    };
  }

  // 写入配置文件
  writeConfig(config) {
    fs.writeFileSync(this.appJsonPath, JSON.stringify(config.app, null, 2));
    fs.writeFileSync(this.packageJsonPath, JSON.stringify(config.package, null, 2));
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

    const issues = [];
    
    if (appVersion !== packageVersion) {
      issues.push(`app.json 和 package.json 版本号不一致: ${appVersion} vs ${packageVersion}`);
    }

    if (androidVersionCode !== parseInt(iosBuildNumber)) {
      issues.push(`Android versionCode 和 iOS buildNumber 不一致: ${androidVersionCode} vs ${iosBuildNumber}`);
    }

    if (issues.length === 0) {
      console.log('✅ 版本号一致性检查通过!');
    } else {
      console.log('❌ 发现版本号不一致问题:');
      issues.forEach(issue => console.log(`   - ${issue}`));
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
