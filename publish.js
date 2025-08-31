const {exec} = require('child_process');
const fs = require('fs');
const {exit} = require('process');

const channelList = [
  // 'prodgobet',
  // 'prodlotteryindia',
  // 'prodluckyone',
  // 'prodmybetfive',
  // 'prodmybetnine',
  // 'prodspinsnine',
  // 'prodspinsseven',
  // 'prodsupbetone',
  // 'prodsupbetseven',
  'prodwinlucky',
  'supbet',
];
async function replaceConfigFiles(channel) {
  const envFile = `.env.${channel}`;
  const targetFile = '.env.prod'; // 或根据您的实际使用情况调整
  try {
    // 检查是否存在渠道特定配置
    if (fs.existsSync(envFile)) {
      // 复制渠道特定配置到目标文件
      fs.copyFileSync(envFile, targetFile);
      console.log(`已应用 ${channel} 渠道特定配置`);
    } else {
      // 使用默认配置
      fs.copyFileSync('.env.prod', targetFile);
      console.log(`使用默认配置，未找到 ${envFile}`);
    }
  } catch (error) {
    throw new Error(`配置替换失败: ${error.message}`);
  }
}

async function replaceAndBuild(channel) {
  // 先替换环境配置
  // await replaceConfigFiles(channel);
  const appFile = 'src/App.tsx';
  let content = fs.readFileSync(appFile, 'utf8');
  // content = content.replace(
  //   /const defaultChannel = '.*';/m,
  //   `const defaultChannel = '${channel}';`,
  // );
  content = content.replace(
    /globalStore.channel = c \|\| '.*';/m,
    `globalStore.channel = c || '${channel}';`,
  );
  fs.writeFileSync(appFile, content);
  return new Promise((resolve, reject) => {
    // exec('yarn build:prod:all', {stdio: 'inherit'}, err => {
    exec(
      `rm -rf android/app/build && cd android && export ENVFILE=.env.${channel} && ./gradlew assemble${channel}Release && cd ../`,
      {stdio: 'inherit'},
      err => {
        if (err) {
          reject(err);
          return;
        }
        // const apkName = `supbet${channel === 'supbet' ? '' : '_' + channel}.apk`;
        const apkName = `${channel}.apk`;
        exec(
          `mv ./android/app/build/outputs/apk/${channel}/release/app-${channel}-release.apk ~/Desktop/apps/${apkName}`,
          {stdio: 'inherit'},
          _err => {
            if (_err) {
              console.log('打包失败', err);
              reject(_err);
              return;
            }

            resolve();
          },
        );
      },
    );
  });
}

async function main() {
  for (let i = 0; i < channelList.length; i++) {
    const channel = channelList[i];
    console.log(`正在处理渠道 ${channel}`);

    try {
      await replaceAndBuild(channel);
      console.log(`渠道 ${channel} 打包成功!`);
      exec(`say 渠道 ${channel} 打包成功!`);
    } catch (err) {
      console.error(`渠道 ${channel} 打包失败:`, err);
      exec(`say 渠道 ${channel} 打包失败!`);
      exit(1);
    }
  }

  console.log('渠道打包完成!');
}

console.log('开始打包');
main();
