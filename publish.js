const {exec} = require('child_process');
const fs = require('fs');
const {exit} = require('process');

const channelList = [
  // 'sboFB01',
  // 'sboFB02',
  // 'sboFB03',
  // 'sboFB04',
  // 'sboFB05',
  'supbet001', // 默认渠道
];

function replaceAndBuild(channel) {
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
    exec('yarn build:prod', {stdio: 'inherit'}, err => {
      if (err) {
        reject(err);
        return;
      }
      const apkName = `supbet001${
        channel === 'supbet001' ? '' : '_' + channel
      }.apk`;
      exec(
        `mv ./android/app/build/outputs/apk/release/app-release.apk ~/Desktop/apps/${apkName}`,
        {stdio: 'inherit'},
        _err => {
          if (_err) {
            reject(_err);
            return;
          }

          resolve();
        },
      );
    });
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

main();
