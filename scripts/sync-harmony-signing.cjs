const fs = require('fs');
const path = require('path');
const { X509Certificate } = require('crypto');

function resolveShellProjectPath() {
  const candidates = [
    process.env.HARMONY_SHELL_PATH,
    path.resolve(process.cwd(), '../DevEcoStudioProjects/boke_harmony'),
    path.resolve(process.cwd(), '../boke_harmony'),
    path.resolve(process.cwd(), 'boke_harmony'),
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, 'build-profile.json5'))) {
      return candidate;
    }
  }

  throw new Error(
    '未找到 Harmony 壳工程。请设置环境变量 HARMONY_SHELL_PATH 指向 boke_harmony 目录。',
  );
}

function getCertExpireAt(cerPath) {
  const raw = fs.readFileSync(cerPath);
  const cert = new X509Certificate(raw);
  const expireAt = new Date(cert.validTo);
  if (Number.isNaN(expireAt.getTime())) {
    return null;
  }
  return expireAt.getTime();
}

function getProfileExpireAt(p7bPath) {
  const rawText = fs.readFileSync(p7bPath).toString('latin1');
  const match = rawText.match(/"not-after"\s*:\s*(\d{10,13})/);
  if (!match) {
    return null;
  }

  const rawValue = Number(match[1]);
  if (!Number.isFinite(rawValue)) {
    return null;
  }

  return rawValue > 1e12 ? rawValue : rawValue * 1000;
}

function ensureCertNotExpired(cerPath) {
  const expireAtMs = getCertExpireAt(cerPath);
  if (expireAtMs !== null && expireAtMs <= Date.now()) {
    throw new Error(
      `当前签名证书已过期（${new Date(expireAtMs).toLocaleString()}）。请在 DevEco Studio 重新生成签名证书后重试。`,
    );
  }
}

function ensureProfileNotExpired(p7bPath) {
  const expireAtMs = getProfileExpireAt(p7bPath);
  if (expireAtMs === null) {
    return;
  }

  if (expireAtMs <= Date.now()) {
    throw new Error(
      `Profile(.p7b) 已过期（${new Date(expireAtMs).toLocaleString()}）。请在 DevEco Studio 重新生成签名 Profile。`,
    );
  }
}

function hasSigningConfig(content, configName) {
  const pattern = new RegExp(`"name"\\s*:\\s*"${configName}"`);
  return pattern.test(content);
}

function replaceSigningConfig(content, configName) {
  const pattern = /("signingConfig"\s*:\s*")([^"]+)(")/;
  if (!pattern.test(content)) {
    throw new Error('build-profile.json5 中未找到 products.signingConfig 字段');
  }
  return content.replace(pattern, `$1${configName}$3`);
}

function extractPathFieldFromText(content, fieldName) {
  const pattern = new RegExp(`"${fieldName}"\\s*:\\s*"([^"]+)"`);
  const matched = content.match(pattern);
  if (!matched?.[1]) {
    return null;
  }
  return matched[1].replace(/\\\\/g, '\\');
}

function isExistingFile(filePath) {
  try {
    return !!filePath && fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

function isMaterialUsable(certPath, p12Path, p7bPath) {
  if (
    !isExistingFile(certPath) ||
    !isExistingFile(p12Path) ||
    !isExistingFile(p7bPath)
  ) {
    return false;
  }

  const certExpireAt = getCertExpireAt(certPath);
  const profileExpireAt = getProfileExpireAt(p7bPath);
  const now = Date.now();

  const certValid = certExpireAt === null || certExpireAt > now;
  const profileValid = profileExpireAt === null || profileExpireAt > now;
  return certValid && profileValid;
}

function getMaterialExpireAt(certPath, p7bPath) {
  const certExpireAt = getCertExpireAt(certPath);
  const profileExpireAt = getProfileExpireAt(p7bPath);

  if (certExpireAt === null && profileExpireAt === null) {
    return null;
  }

  if (certExpireAt === null) {
    return profileExpireAt;
  }

  if (profileExpireAt === null) {
    return certExpireAt;
  }

  return Math.min(certExpireAt, profileExpireAt);
}

function extractSigningConfigs(content) {
  const configs = [];
  const regex = /"name"\s*:\s*"([^"]+)"[\s\S]*?"material"\s*:\s*\{([\s\S]*?)\}\s*(?:,|\})/g;
  let match;

  while ((match = regex.exec(content)) !== null) {
    const name = match[1];
    const materialText = match[2] || '';
    const certPath = extractPathFieldFromText(materialText, 'certpath');
    const p12Path = extractPathFieldFromText(materialText, 'storeFile');
    const p7bPath = extractPathFieldFromText(materialText, 'profile');

    configs.push({
      name,
      certPath,
      p12Path,
      p7bPath,
      usable: isMaterialUsable(certPath, p12Path, p7bPath),
    });
  }

  return configs;
}

function pickSigningConfig(signingConfigs, preferredFromEnv) {
  if (!signingConfigs.length) {
    throw new Error('build-profile.json5 中未找到 signingConfigs。');
  }

  if (preferredFromEnv) {
    const target = signingConfigs.find(item => item.name === preferredFromEnv);
    if (!target) {
      throw new Error(`未找到指定签名配置：${preferredFromEnv}`);
    }
    if (!target.usable) {
      throw new Error(`指定签名配置不可用：${preferredFromEnv}（证书文件缺失或已过期）`);
    }
    return target;
  }

  const defaultConfig = signingConfigs.find(item => item.name === 'default');
  if (defaultConfig?.usable) {
    return defaultConfig;
  }

  const others = signingConfigs
    .filter(item => item.usable)
    .map(item => ({
      ...item,
      expireAt: getMaterialExpireAt(item.certPath, item.p7bPath),
    }))
    .sort((a, b) => {
      const aExpire = a.expireAt ?? Number.POSITIVE_INFINITY;
      const bExpire = b.expireAt ?? Number.POSITIVE_INFINITY;
      return bExpire - aExpire;
    });

  if (others.length) {
    return others[0];
  }

  throw new Error(
    '未找到可用签名配置：default 已不可用，且其他签名配置也不可用。请在 DevEco Studio 重新生成签名材料。',
  );
}

function main() {
  const shellProjectPath = resolveShellProjectPath();
  const buildProfilePath = path.join(shellProjectPath, 'build-profile.json5');

  let content = fs.readFileSync(buildProfilePath, 'utf8');
  const signingConfigs = extractSigningConfigs(content);
  const preferredConfigFromEnv = process.env.HARMONY_SIGNING_CONFIG;
  const selected = pickSigningConfig(signingConfigs, preferredConfigFromEnv);

  ensureCertNotExpired(selected.certPath);
  ensureProfileNotExpired(selected.p7bPath);

  if (!hasSigningConfig(content, selected.name)) {
    throw new Error(`build-profile.json5 中不存在 signingConfig: ${selected.name}`);
  }

  content = replaceSigningConfig(content, selected.name);
  fs.writeFileSync(buildProfilePath, content, 'utf8');

  console.log('[sync-harmony-signing] 签名配置已校验并应用:');
  console.log(`  signingConfig: ${selected.name}`);
  console.log(`  certpath: ${selected.certPath}`);
  console.log(`  storeFile: ${selected.p12Path}`);
  console.log(`  profile: ${selected.p7bPath}`);
}

try {
  main();
} catch (error) {
  console.error('[sync-harmony-signing] 失败：', error.message || error);
  process.exit(1);
}
