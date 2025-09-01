const {exec} = require('child_process');
const fs = require('fs');
const {exit} = require('process');
const { setBuildEnv } = require('./build-scripts.js');
const mainPackage = [
  {
    title: 'prodgobet',
    channelList:[
      'gbFB01'
    ]
  },
  {
    title: 'prodlotteryindia',
    channelList:[
      'liFB01'
    ]
  },
  // {
  //   title: 'prodluckyone',
  //   channelList:[
  //     'lucky101'
  //   ]
  // },
  {
    title: 'prodmybetfive',
    channelList:[
      'mbfFB01'
    ]
  },
  // {
  //   title: 'prodmybetnine',
  //   channelList:[
  //     'mybet798'
  //   ]
  // },
  {
    title: 'prodspinsnine',
    channelList:[
      'spnFB01'
    ]
  },
  {
    title: 'prodspinsseven',
    channelList:[
      'spsB01'
    ]
  },
  {
    title: 'prodsupbetone',
    channelList:[
      'sboFB01',
      'sboFB02',
      'sboFB03',
      'sboFB04',
      'sboFB05',
      'sboFB06'
    ]
  },
  {
    title: 'prodsupbetseven',
    channelList:[
      'sbsFB01'
    ]
  },
  // {
  //   title: 'prodwinlucky',
  //   channelList:[
  //     'winlucky001'
  //   ]
  // },
  {
    title: 'supbet',
    channelList: [
      // 'sboFB01',
      // 'sboFB02',
      // 'sboFB03',
      // 'sboFB04',
      // 'sboFB05',
      'sbFB01', // 默认渠道
    ]
  }
];
// package 包名
async function startRewriteEnv(channel, package) {
  const envFile = `./.env.${package}`;
  setBuildEnv('REACT_APP_API_CHANNEL_ID', channel, envFile);
}
async function replaceAndBuild(channel, package) {
  const appFile = 'src/App.tsx';
  //重新写入渠道
  await startRewriteEnv(channel, package);
  let content = fs.readFileSync(appFile, 'utf8');
  content = content.replace(
    /globalStore.channel = c \|\| '.*';/m,
    `globalStore.channel = c || '${channel}';`,
  );
  fs.writeFileSync(appFile, content);
  return new Promise((resolve, reject) => {
    exec(
      `rm -rf android/app/build && cd android && export ENVFILE=.env.${package} && ./gradlew assemble${package}Release && cd ../`,
      {stdio: 'inherit'},
      err => {
        if (err) {
          reject(err);
          return;
        }
        // const supBetNameFlag = channel == 'supbet';
        // const apkName = supBetNameFlag ? `${channel}001.apk` : `${package}_${channel}.apk`;
        const apkName = `${package}_${channel}.apk`;
        exec(
          `mv ./android/app/build/outputs/apk/${package}/release/app-${package}-release.apk ~/Desktop/apps/${apkName}`,
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
  for (let i = 0; i < mainPackage.length; i++) {
    const package = mainPackage[i];
    const channelList = package.channelList;
    if(channelList.length) {
      for (let i = 0; i < channelList.length; i++) {
        const channel = channelList[i];
        console.log(`正在处理渠道 ${channel}`);
        try {
          await replaceAndBuild(channel, package.title);
          console.log(`渠道 ${channel} 打包成功!`);
          exec(`say 渠道 ${channel} 打包成功!`);
        } catch (err) {
          console.error(`渠道 ${channel} 打包失败:`, err);
          exec(`say 渠道 ${channel} 打包失败!`);
          exit(1);
        }
      }
    } else {
      try {
        const channel = package.title;
        await replaceAndBuild(channel, package.title);
        console.log(`渠道 ${channel} 打包成功!`);
        exec(`say 渠道 ${channel} 打包成功!`);
      } catch (err) {
        console.error(`渠道 ${channel} 打包失败:`, err);
        exec(`say 渠道 ${channel} 打包失败!`);
        exit(1);
      }
    }
  }

  console.log('渠道打包完成!');
}

console.log('开始打包');
main();
