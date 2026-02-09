/*
 * 使用 sharp 将「TSX 图标组件」批量转换为 PNG，供鸿蒙端使用。
 *
 * 当前会针对常用的几个 Icon（比如个人中心里的图标）读取 src/iconfont 下对应的
 * IconXxx.tsx 文件，解析出 viewBox、Path.d 和默认颜色，拼出标准 SVG 字符串，
 * 然后用 sharp 渲染为 PNG，输出到 src/assets/harmony-icons 目录。
 *
 * 使用方式：
 * 1. 确保已安装 sharp： pnpm add -D sharp
 * 2. 运行： pnpm iconfont 或 pnpm generate:harmony-icons
 * 3. 生成的 PNG 文件会放在 src/assets/harmony-icons 下，并同时生成
 *    src/harmony/harmonyIconMap.ts，供 HarmonyIconImage 直接引用。
 */

const fs = require('fs');
const path = require('path');

let sharp;
try {
  // 延迟引入，避免在未安装 sharp 时直接崩溃，给出更友好的提示
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  sharp = require('sharp');
} catch (e) {
  // eslint-disable-next-line no-console
  console.warn('[harmony-icons] 需要先安装 sharp： pnpm add -D sharp');
  process.exit(0);
}

const projectRoot = __dirname.replace(/scripts$/, '');
const iconfontDir = path.join(projectRoot, 'src', 'iconfont');
const outDir = path.join(projectRoot, 'src', 'assets', 'harmony-icons');
const harmonyDir = path.join(projectRoot, 'src', 'harmony');
const mapFilePath = path.join(harmonyDir, 'harmonyIconMap.ts');

function log(msg) {
  // eslint-disable-next-line no-console
  console.log(`[harmony-icons] ${msg}`);
}

if (!fs.existsSync(iconfontDir)) {
  log(`未找到 iconfont 目录：${iconfontDir}`);
  process.exit(0);
}

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

if (!fs.existsSync(harmonyDir)) {
  fs.mkdirSync(harmonyDir, { recursive: true });
}

/**
 * 从 src/iconfont/index.tsx 中自动解析「Icon 名称 → TSX 组件文件名」映射，
 * 这样就不需要手动维护列表，可以做到全量覆盖。
 *
 * 依赖的代码形态示例：
 *   case 'member-20':
 *     return <IconMember20 key="40" {...rest} />;
 */
function getIconTsxMapFromIndex() {
  const indexPath = path.join(iconfontDir, 'index.tsx');
  if (!fs.existsSync(indexPath)) {
    log(`未找到 iconfont 入口文件：${indexPath}`);
    return {};
  }

  const content = fs.readFileSync(indexPath, 'utf8');
  const map = {};

  const caseRegex = /case '([^']+)':\s*return <([A-Za-z0-9_]+)/g;
  let m;
  while ((m = caseRegex.exec(content))) {
    const iconName = m[1];
    const componentName = m[2];
    map[iconName] = `${componentName}.tsx`;
  }

  const count = Object.keys(map).length;
  log(`已从 index.tsx 解析到 ${count} 个图标映射。`);

  return map;
}

/**
 * 从 TSX 内容中构造一个简单的 SVG 字符串：
 * - 提取 viewBox 属性
 * - 提取所有 <Path ... />，读取 d 属性和 getIconColor 的默认颜色
 */
function buildSvgFromTsx(content) {
  const viewBoxMatch = content.match(/viewBox="([^"]+)"/);
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 1024 1024';

  const pathTags = [];
  const pathRegex = /<Path([\s\S]*?)\/>/g;
  let m;
  while ((m = pathRegex.exec(content))) {
    const block = m[1];
    const dMatch = block.match(/d="([^"]+)"/);
    if (!dMatch) continue;

    let fillColor = '#333333';
    const getColorMatch = block.match(
      /getIconColor\(color,\s*\d+,\s*'([^']+)'\s*\)/,
    );
    if (getColorMatch) {
      fillColor = getColorMatch[1];
    } else {
      const constFillMatch = block.match(/fill="([^"]+)"/);
      if (constFillMatch) {
        fillColor = constFillMatch[1];
      }
    }

    pathTags.push(`<path d="${dMatch[1]}" fill="${fillColor}"/>`);
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${pathTags.join(
    '',
  )}</svg>`;
  return svg;
}

async function convertOneFromTsx(iconName, tsxFileName) {
  const tsxPath = path.join(iconfontDir, tsxFileName);
  if (!fs.existsSync(tsxPath)) {
    log(`未找到 TSX 图标组件：${tsxFileName}，已跳过。`);
    return false;
  }

  const outputPath = path.join(outDir, `${iconName}.png`);
  const tsxContent = fs.readFileSync(tsxPath, 'utf8');
  const svg = buildSvgFromTsx(tsxContent);

  await sharp(Buffer.from(svg))
    .resize(96, 96, { fit: 'contain' })
    .png()
    .toFile(outputPath);

  log(
    `生成 PNG: ${path.relative(projectRoot, outputPath)} (from ${tsxFileName})`,
  );
  return true;
}

function generateMapFile(iconNames) {
  if (!iconNames.length) {
    log('没有成功生成任何 PNG，跳过生成映射文件。');
    return;
  }

  const header =
    '/* 自动生成：鸿蒙端 icon 名称到 PNG 资源的映射，请勿手动修改。*/\n' +
    "import { IconFontTTFName } from '@/iconfont/IconFontTTF';\n\n";

  const entries = iconNames
    .map(name => `  '${name}': require('../assets/harmony-icons/${name}.png'),`)
    .join('\n');

  const body =
    'const harmonyPngMap: Partial<Record<IconFontTTFName, number>> = {\n' +
    entries +
    '\n};\n\nexport default harmonyPngMap;\n';

  fs.writeFileSync(mapFilePath, header + body, 'utf8');
  log(`已生成映射文件: ${path.relative(projectRoot, mapFilePath)}`);
}

async function main() {
  const iconTsxMap = getIconTsxMapFromIndex();
  const iconNames = Object.keys(iconTsxMap);

  if (!iconNames.length) {
    log('未解析到任何图标映射，已退出。');
    return;
  }

  log(`准备从 TSX 组件生成 ${iconNames.length} 个 PNG 图标（全量）...`);

  const generated = [];

  for (const name of iconNames) {
    const tsxFile = iconTsxMap[name];
    try {
      // eslint-disable-next-line no-await-in-loop
      const ok = await convertOneFromTsx(name, tsxFile);
      if (ok) {
        generated.push(name);
      }
    } catch (e) {
      log(`转换失败 ${name} (${tsxFile}): ${e.message}`);
    }
  }

  if (!generated.length) {
    log('没有任何图标转换成功。');
    return;
  }

  generateMapFile(generated);
  log('全部转换完成。');
}

main().catch(e => {
  log(`执行出错: ${e.message}`);
  process.exit(1);
});
