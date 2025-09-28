/**
 * Pushy 多包热更新发布脚本
 * 支持原有的多包配置，使用Pushy替换CodePush
 * 作者: AI Assistant
 */

const {exec} = require('child_process');
const fs = require('fs');
const path = require('path');
const {exit} = require('process');
const {setBuildEnv} = require('./build-scripts.js');

// 从原publish.js导入多包配置
const mainPackage = [
  {
    title: 'prodgobet',
    channelList: ['gbFB01', 'gobet758'],
  },
  {
    title: 'prodlotteryindia',
    channelList: ['liFB01', 'lotteryindia'],
  },
  {
    title: 'prodluckyone',
    channelList: ['lucky101'],
  },
  {
    title: 'prodmybetfive',
    channelList: ['mybet758', 'mbfFB01'],
  },
  {
    title: 'prodmybetnine',
    channelList: ['mybet798'],
  },
  {
    title: 'prodspinsnine',
    channelList: ['spnFB01', 'spnFB02', 'spins999'],
  },
  {
    title: 'prodspinsseven',
    channelList: ['spsB01', 'spins007'],
  },
  {
    title: 'prodsupbetone',
    channelList: [
      'sboFB01',
      'sboFB02',
      'sboFB03',
      'sboFB04',
      'sboFB05',
      'sboFB06',
      'supbet001',
    ],
  },
  {
    title: 'prodsupbetseven',
    channelList: ['sbsFB01', 'sbsFB02', 'supbet007'],
  },
  {
    title: 'prodwinlucky',
    channelList: ['winlucky001'],
  },
  {
    title: 'supbet',
    channelList: [
      'sbFB01',
      'supbet', // 默认渠道
    ],
  },
];

/**
 * 重写环境配置但不包含敏感的env配置
 * @param {string} channel - 渠道ID
 * @param {string} packageName - 包名
 */
async function startRewriteEnv(
  channel: string,
  packageName: string,
): Promise<void> {
  const envFile = `./.env.${packageName}`;
  setBuildEnv('REACT_APP_API_CHANNEL_ID', channel, envFile);
}

/**
 * 替换App.tsx中的渠道配置并生成热更新包
 * @param {string} channel - 渠道ID
 * @param {string} packageName - 包名
 * @param {string} version - 版本号
 */
async function buildHotUpdatePackage(
  channel: string,
  packageName: string,
  version: string,
): Promise<void> {
  const appFile = 'src/App.tsx';

  // 重新写入渠道配置
  await startRewriteEnv(channel, packageName);

  // 读取并替换App.tsx中的渠道配置
  let content = fs.readFileSync(appFile, 'utf8');
  const originalContent = content;

  try {
    content = content.replace(
      /globalStore\.channel = c \|\| '.*';/m,
      `globalStore.channel = c || '${channel}';`,
    );
    fs.writeFileSync(appFile, content);

    // 设置环境变量
    process.env.ENVFILE = `.env.${packageName}`;

    // 生成bundle文件
    const bundleDir = `./bundles/${packageName}/${channel}`;
    const bundleFile = `${bundleDir}/index.android.bundle`;
    const assetsDir = `${bundleDir}/assets`;

    // 确保目录存在
    if (!fs.existsSync(bundleDir)) {
      fs.mkdirSync(bundleDir, {recursive: true});
    }
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, {recursive: true});
    }

    console.log(`正在为 ${packageName}/${channel} 生成bundle...`);

    return new Promise((resolve, reject) => {
      const bundleCommand = `react-native bundle --platform android --dev false --entry-file index.js --bundle-output ${bundleFile} --assets-dest ${assetsDir}`;

      exec(bundleCommand, {stdio: 'inherit'}, err => {
        if (err) {
          console.error(`Bundle生成失败: ${err}`);
          reject(err);
          return;
        }

        console.log(`Bundle生成成功: ${bundleFile}`);

        // 使用Pushy CLI上传热更新包
        const pushyCommand = `pushy upload ${bundleFile} --platform android --description "${packageName}-${channel}-${version}"`;

        exec(pushyCommand, {stdio: 'inherit'}, uploadErr => {
          if (uploadErr) {
            console.error(`Pushy上传失败: ${uploadErr}`);
            reject(uploadErr);
            return;
          }

          console.log(`${packageName}/${channel} 热更新包上传成功`);
          resolve();
        });
      });
    });
  } finally {
    // 恢复原始App.tsx内容
    fs.writeFileSync(appFile, originalContent);
  }
}

/**
 * 主函数：为所有包和渠道生成热更新包
 */
async function main(): Promise<void> {
  const version = process.argv[2] || '1.0.0';
  console.log(`开始为版本 ${version} 生成热更新包...`);

  for (let i = 0; i < mainPackage.length; i++) {
    const packageInfo = mainPackage[i];
    const channelList = packageInfo.channelList;

    if (channelList.length) {
      for (let j = 0; j < channelList.length; j++) {
        const channel = channelList[j];
        console.log(`正在处理 ${packageInfo.title}/${channel}...`);

        try {
          await buildHotUpdatePackage(channel, packageInfo.title, version);
          console.log(`${packageInfo.title}/${channel} 热更新包生成成功!`);
          exec(`say ${packageInfo.title} ${channel} 热更新包生成成功!`);
        } catch (err) {
          console.error(
            `${packageInfo.title}/${channel} 热更新包生成失败:`,
            err,
          );
          exec(`say ${packageInfo.title} ${channel} 热更新包生成失败!`);
          exit(1);
        }
      }
    } else {
      const channel = packageInfo.title;
      console.log(`正在处理 ${packageInfo.title}/${channel}...`);

      try {
        await buildHotUpdatePackage(channel, packageInfo.title, version);
        console.log(`${packageInfo.title}/${channel} 热更新包生成成功!`);
        exec(`say ${packageInfo.title} ${channel} 热更新包生成成功!`);
      } catch (err) {
        console.error(`${packageInfo.title}/${channel} 热更新包生成失败:`, err);
        exec(`say ${packageInfo.title} ${channel} 热更新包生成失败!`);
        exit(1);
      }
    }
  }

  console.log('所有热更新包生成完成!');
  exec('say 所有热更新包生成完成!');
}

// 检查Pushy CLI是否已安装
exec('pushy --version', err => {
  if (err) {
    console.error('请先安装Pushy CLI: npm install -g react-native-update-cli');
    console.error('然后使用 pushy login 登录到您的Pushy账户');
    exit(1);
  } else {
    console.log('开始生成热更新包...');
    main();
  }
});
