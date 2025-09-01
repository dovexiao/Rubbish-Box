const fs = require('fs');
const path = require('path');

function setBuildEnv(key, value, envFile = '.env.prod') {
  // 验证输入
  if (typeof key !== 'string' || key.trim() === '') {
    throw new Error('键名必须是非空字符串');
  }

  if (typeof value !== 'string') {
    value = String(value);
  }

  // 确保文件目录存在
  const dir = path.dirname(envFile);
  if (dir !== '.' && !fs.existsSync(dir)) {
    fs.mkdirSync(dir, {recursive: true});
  }
  // 读取和修改文件
  let lines = [];
  if (fs.existsSync(envFile)) {
    const content = fs.readFileSync(envFile, 'utf8');
    lines = content.split('\n');
  }

  // 处理每一行
  let keyFound = false;
  const newLines = lines.map(line => {
    const trimmed = line.trim();

    // 保留注释和空行
    if (trimmed === '' || trimmed.startsWith('#')) {
      return line;
    }

    const equalsIndex = trimmed.indexOf('=');
    if (equalsIndex === -1) {
      return line; // 无效行，保持原样
    }

    const currentKey = trimmed.substring(0, equalsIndex).trim();
    if (currentKey === key) {
      keyFound = true;
      return `${key}=${value}`;
    }

    return line;
  });

  // 如果键不存在，添加到文件末尾
  if (!keyFound) {
    newLines.push(`${key}=${value}`);
  }

  // 写入文件
  fs.writeFileSync(envFile, newLines.join('\n'));

  return true;
}

module.exports = {setBuildEnv};
