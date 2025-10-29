const {exec} = require('child_process');
const fs = require('fs');
const {exit} = require('process');
const { setBuildEnv } = require('./build-scripts.js');
const mainPackage = [
  {
    title: 'prodgobet',
    channelList:[
      // 'gbFB01',
      'gobet758'
    ]
  },
  {
    title: 'prodlotteryindia',
    channelList:[
      // 'liFB01',
      'lotteryindia'
    ]
  },
  {
    title: 'prodluckyone',
    channelList:[
      // 'luFB01',
      // 'luFB02',
      // 'luFB03',
      // 'luFB04',
      // 'luFB05',
      // 'luFB06',
      'lucky101'
    ]
  },
  {
    title: 'prodmybetfive',
    channelList:[
      'mybet758',
      // 'mbfFB01'
    ]
  },
  {
    title: 'prodmybetnine',
    channelList:[
      // 'mbnFB01',
      // 'mbnFB02',
      // 'mbnFB03',
      // 'mbnFB04',
      // 'mbnFB05',
      'mybet798'
    ]
  },
  {
    title: 'prodspinsnine',
    channelList:[
      // 'spnFB01',
      // 'spnFB02',
      'spins999'
    ]
  },
  {
    title: 'prodspinsseven',
    channelList:[
      // 'spsB01',
      'spins007'
    ]
  },
  // {
  //   title: 'prodsupbetone',
  //   channelList:[
  //     // 'sboFB01',
  //     // 'sboFB02',
  //     // 'sboFB03',
  //     // 'sboFB04',
  //     // 'sboFB05',
  //     // 'sboFB06',
  //     'supbet001'
  //   ]
  // },
  {
    title: 'prodsupbetseven',
    channelList:[
      // 'sbsFB01',
      // 'sbsFB02',
      'supbet007'
    ]
  },
  {
    title: 'prodwinlucky',
    channelList:[
      // 'wlFB01', 'wlFB02', 'wlFB03', 'wlFB04', 'wlFB05',
      // 'wlFB06', 'wlFB07', 'wlFB08', 'wlFB09', 'wlFB10',
      // 'wlFB11', 'wlFB12', 'wlFB13', 'wlFB14', 'wlFB15',
      // 'wlFB16', 'wlFB17', 'wlFB18', 'wlFB19', 'wlFB20',
      // 'wlFB21', 'wlFB22', 'wlFB23', 'wlFB24', 'wlFB25',
      // 'wlFB26', 'wlFB27', 'wlFB28', 'wlFB29', 'wlFB30',
      // 'wlFB31', 'wlFB32', 'wlFB33', 'wlFB34', 'wlFB35',
      // 'wlFB36', 'wlFB37', 'wlFB38', 'wlFB39', 'wlFB40',
      // 'wlFB41', 'wlFB42', 'wlFB43', 'wlFB44', 'wlFB45',
      // 'wlFB46', 'wlFB47', 'wlFB48',
      // 'wlFB49', 'wlFB50',
      // 'wlFB51', 'wlFB52', 'wlFB53', 'wlFB54', 'wlFB55',
      // 'wlFB56', 'wlFB57', 'wlFB58', 'wlFB59', 'wlFB60',
      // 'wlFB61', 'wlFB62', 'wlFB63', 'wlFB64', 'wlFB65',
      // 'wlFB66', 'wlFB67', 'wlFB68', 'wlFB69', 'wlFB70',
      'winlucky001'
    ]
  },
  {
    title: 'supbet',
    channelList: [
      'supbet', // 默认渠道
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
