/* 自动根据 iconfont.json 的 symbol_url 下载 .ttf/.css 并生成 TTF 版 Icon 组件 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const projectRoot = __dirname.replace(/scripts$/, '');
const configPath = path.join(projectRoot, 'iconfont.json');

function log(msg) {
  // 简单前缀，方便在终端里识别
  // eslint-disable-next-line no-console
  console.log(`[iconfont-ttf] ${msg}`);
}

if (!fs.existsSync(configPath)) {
  log('iconfont.json not found, skip generating TTF icons.');
  process.exit(0);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

if (!config.symbol_url) {
  log('symbol_url is missing in iconfont.json, skip.');
  process.exit(0);
}

const defaultFontFamily = config.font_family || 'iconfont';
const defaultFontSize = config.default_icon_size || 18;

function normalizeUrl(u) {
  let url = String(u).trim();
  if (url.startsWith('//')) {
    url = 'https:' + url;
  }
  return url;
}

const symbolUrl = normalizeUrl(config.symbol_url).split('?')[0];
if (!symbolUrl.endsWith('.js')) {
  log(`symbol_url is not a .js link: ${symbolUrl}`);
}

const baseUrl = symbolUrl.replace(/\.js$/i, '');
const cssUrl = `${baseUrl}.css`;
const ttfUrl = `${baseUrl}.ttf`;

const assetsDir = path.join(projectRoot, 'assets', 'iconfont');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

const cssPath = path.join(assetsDir, 'iconfont.css');
const ttfPath = path.join(assetsDir, 'iconfont.ttf');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);

    https
      .get(url, res => {
        if (res.statusCode !== 200) {
          file.close();
          fs.unlink(dest, () => {});
          return reject(
            new Error(`Request failed ${url} - status ${res.statusCode}`),
          );
        }
        res.pipe(file);
        file.on('finish', () => file.close(resolve));
      })
      .on('error', err => {
        file.close();
        fs.unlink(dest, () => {});
        reject(err);
      });
  });
}

async function main() {
  try {
    log(`Downloading CSS from ${cssUrl}`);
    await download(cssUrl, cssPath);
    log(`Saved CSS to ${cssPath}`);

    log(`Downloading TTF from ${ttfUrl}`);
    await download(ttfUrl, ttfPath);
    log(`Saved TTF to ${ttfPath}`);
  } catch (e) {
    log(`Download failed: ${e.message}`);
    process.exit(1);
  }

  const css = fs.readFileSync(cssPath, 'utf8');

  // 匹配 .icon-xxx:before { content: "\e600"; }
  const regex =
    /\.icon-([a-zA-Z0-9_-]+):before\s*\{[^}]*content:\s*"\\([a-fA-F0-9]+)"[^}]*\}/g;

  /** @type {Array<{name: string, code: string}>} */
  const icons = [];
  let match;
  while ((match = regex.exec(css))) {
    const name = match[1];
    const code = match[2];
    icons.push({ name, code });
  }

  if (icons.length === 0) {
    log('No icons found in CSS, stop.');
    return;
  }

  // 去重
  const seen = new Set();
  const uniqueIcons = icons.filter(item => {
    if (seen.has(item.name)) return false;
    seen.add(item.name);
    return true;
  });

  const namesUnion = uniqueIcons.map(i => `'${i.name}'`).join(' | ');

  const glyphEntries = uniqueIcons
    .map(i => {
      const padded = i.code.padStart(4, '0');
      return `  '${i.name}': '\\u${padded}',`;
    })
    .join('\n');

  const outDir = path.join(projectRoot, 'src', 'iconfont');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outPath = path.join(outDir, 'IconFontTTF.tsx');

  const fileContent = `/* 自动生成：请不要手动修改。\n * 命令：pnpm iconfont 或 pnpm iconfont:ttf\n */\n\nimport React from 'react';\nimport { Text, TextProps, StyleProp, TextStyle } from 'react-native';\n\nexport type IconFontTTFName = ${namesUnion};\n\nexport interface IconFontTTFProps extends TextProps {\n  name: IconFontTTFName;\n  size?: number;\n  color?: string;\n  style?: StyleProp<TextStyle>;\n}\n\nconst glyphMap: Record<IconFontTTFName, string> = {\n${glyphEntries}\n};\n\nconst DEFAULT_SIZE = ${defaultFontSize};\nconst FONT_FAMILY = '${defaultFontFamily}';\n\nconst IconFontTTF: React.FC<IconFontTTFProps> = ({\n  name,\n  size = DEFAULT_SIZE,\n  color = '#333333',\n  style,\n  ...rest\n}) => {\n  const glyph = glyphMap[name] || '';\n  return (\n    <Text\n      {...rest}\n      style={[{ fontFamily: FONT_FAMILY, fontSize: size, color }, style]}\n    >\n      {glyph}\n    </Text>\n  );\n};\n\nexport default IconFontTTF;\n`;

  fs.writeFileSync(outPath, fileContent, 'utf8');
  log(`Generated ${outPath}`);
}

main();
