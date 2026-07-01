const fs = require('fs');
const https = require('https');
const FormData = require('form-data');
const progress = require('progress-stream');
const path = require('path');
const { execSync } = require('child_process');


const args = process.argv.slice(2);
const UPLOAD_ONLY = args.includes('--upload');
const ENV = args.find(a => a === 'dev' || a === 'real') || 'dev';
const CUSTOM_VERSION = args.find(a => /^\d{10,}$/.test(a)) || null;


function uploadToPgyer(filePath) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.PGYER_API_KEY;

    if (!apiKey) {
      return reject(new Error('缺少 PGYER_API_KEY'));
    }

    const stat = fs.statSync(filePath);
    const fileName = path.basename(filePath);

    const form = new FormData();
    form.append('_api_key', apiKey);
    form.append('file', fs.createReadStream(filePath), {
      knownLength: stat.size,
      filename: fileName,
      contentType: 'application/vnd.android.package-archive',
    });
    form.append('buildUpdateDescription', `自动构建上传 ${new Date().toLocaleString()}`);

    // 先获取 form 的总长度，再创建进度流
    form.getLength((err, totalLength) => {
      if (err) return reject(err);

      const progressStream = progress({
        length: totalLength,
        time: 100,
      });

      progressStream.on('progress', (p) => {
        const percent = Math.round(p.percentage);
        process.stdout.write(`\r📤 上传中: ${percent}%`);
      });

      const options = {
        method: 'POST',
        hostname: 'www.pgyer.com',
        path: '/apiv2/app/upload',
        headers: form.getHeaders(),
      };

      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => (data += chunk));

        res.on('end', () => {
          console.log('\n');

          try {
            const result = JSON.parse(data);

            if (result.code !== 0) {
              return reject(new Error(result.message || '上传失败'));
            }

            resolve(result);
          } catch (e) {
            reject(new Error('响应解析失败'));
          }
        });
      });

      req.on('error', reject);

      // form → progress → request
      form.pipe(progressStream).pipe(req);
    });
  });
}


function getVersion() {
  if (CUSTOM_VERSION) return CUSTOM_VERSION;

  const d = new Date();
  const pad = n => String(n).padStart(2, '0');

  return (
    d.getFullYear() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds())
  );
}



function log(msg) {
  console.log(`\n日志 > ${msg}`);
}

function fail(msg, err) {
  console.error('\n执行失败');
  console.error(msg);

  if (err) {
    console.error('\n错误详情:');
    console.error(err.message || err);
  }

  process.exit(1);
}

function rmDirWithRetry(dir, maxRetries) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      fs.rmSync(dir, { recursive: true, force: true });
      return;
    } catch (err) {
      if (i < maxRetries - 1 && (err.code === 'EBUSY' || err.code === 'EPERM')) {
        console.log(`⚠ 文件被占用，1秒后重试 (${i + 1}/${maxRetries})...`);
        execSync('ping -n 2 127.0.0.1 >nul', { stdio: 'ignore', shell: true });
      } else {
        throw err;
      }
    }
  }
}

function run(command) {
  console.log(`> ${command}\n`);

  execSync(command, {
    stdio: 'inherit',
    shell: true,
    env: cleanEnv(), // ⭐关键：使用“干净环境”
  });
}

function cleanEnv() {
  const env = { ...process.env };

  // 清掉所有可能导致污染的变量
  delete env.NODE_PATH;
  delete env.npm_config_prefix;
  delete env.NPM_CONFIG_PREFIX;
  delete env.YARN_GLOBAL_FOLDER;

  // 防止 Gradle / RN 继承异常路径
  delete env.GRADLE_USER_HOME;

  // 强制统一
  env.PATH = process.env.PATH.replace(/X:\\[^;]*/gi, '');

  return env;
}

function getGradleTask(env) {
  return `assemble${env.charAt(0).toUpperCase() + env.slice(1)}Release`;
}


function checkCommand(cmd, name) {
  try {
    execSync(`${cmd} --version`, {
      stdio: 'ignore',
      shell: true,
    });
  } catch {
    fail(`${name} 未安装或不可执行`);
  }
}

function findLatestApk(outputsDir) {
  const apks = [];

  function walk(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const full = path.join(dir, file);
      const stat = fs.statSync(full);

      if (stat.isDirectory()) {
        walk(full);
      } else if (file.endsWith('.apk')) {
        apks.push({
          path: full,
          time: stat.mtimeMs,
        });
      }
    }
  }

  walk(outputsDir);

  if (!apks.length) return null;

  apks.sort((a, b) => b.time - a.time);

  return apks[0].path;
}


const build = async () => {
  const projectRoot = process.cwd();
  const version = getVersion();

  try {
    log('检查运行环境');

    checkCommand('node', 'Node');
    checkCommand('ruby', 'Ruby');
    checkCommand('bundle', 'Bundler');

    log(`版本号 ${version}`);

    //  强制干净环境
    process.env.NODE_ENV = 'production';
    process.env.DEPLOY_ENV = ENV;
    process.env.DEPLOY_VERSION = version;

    // 防止编码问题（RN/Gradle 兼容）
    process.env.LANG = 'en_US.UTF-8';
    process.env.LC_ALL = 'en_US.UTF-8';

    // ===== .env =====
    const envSource = path.join(projectRoot, `.env.${ENV}`);
    const envTarget = path.join(projectRoot, '.env');

    if (!fs.existsSync(envSource)) {
      fail(`找不到文件 ${envSource}`);
    }

    fs.copyFileSync(envSource, envTarget);

    // 手动注入 .env 变量到 process.env（dotenv@17 是 ESM-only，无法 require）
    const envContent = fs.readFileSync(envSource, 'utf-8');
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const idx = trimmed.indexOf('=');
        if (idx > 0) {
          const key = trimmed.substring(0, idx).trim();
          const value = trimmed.substring(idx + 1).trim();
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      }
    });

    log('.env 文件已更新');

    // ===== Android =====
    const androidDir = path.join(projectRoot, 'android');

    if (!fs.existsSync(androidDir)) {
      fail(`目录不存在: ${androidDir}`);
    }

    let apk;

    if (!UPLOAD_ONLY) {
      // ===== 完整构建流程 =====
      process.chdir(androidDir);

      // 🚨 关键：先停止 Gradle daemon，释放文件锁
      log('停止 Gradle daemon');
      try {
        execSync('gradlew.bat --stop', { stdio: 'inherit', shell: true });
      } catch {
        // daemon 可能本来就没在跑，忽略错误
      }

      const appBuildDir = path.join(androidDir, 'app', 'build');

      if (fs.existsSync(appBuildDir)) {
        log('删除旧构建目录');
        rmDirWithRetry(appBuildDir, 3);
      }

      // ===== Clean =====
      log('Gradle Clean');
      run('gradlew.bat clean');

      // ===== Build =====
      const task = getGradleTask(ENV);
      log(`开始构建 APK：${task}`);
      run(
        `gradlew.bat ${task} -PDEPLOY_ENV=${ENV} -PDEPLOY_VERSION=${version}`,
      );

      const outputsDir = path.join(androidDir, 'app', 'build', 'outputs');
      apk = findLatestApk(outputsDir);

      if (!apk) {
        fail('构建成功但未找到 APK');
      }
    } else {
      // ===== 仅上传模式 =====
      log('跳过构建，直接找 APK');
      const outputsDir = path.join(androidDir, 'app', 'build', 'outputs');
      apk = findLatestApk(outputsDir);

      if (!apk) {
        fail(`未找到 APK，请检查 ${outputsDir} 目录`);
      }
    }

    log(`APK: ${apk}`);

    log('开始上传蒲公英（Node HTTP）');

    const result = await uploadToPgyer(apk);

    log('上传成功');

    console.log('\n应用信息：');
    console.log('名称:', result.data.buildName);
    console.log('版本:', result.data.buildVersion);
    console.log('Build:', result.data.buildBuildVersion);
    console.log('更新时间:', result.data.buildUpdated);
    console.log('下载地址:', `https://www.pgyer.com/${result.data.buildShortcutUrl}`);

    log('发布成功');
  } catch (err) {
    fail('构建流程终止', err);
  } finally {
    try {
      process.chdir(projectRoot);
    } catch {}
  }
}

build();
