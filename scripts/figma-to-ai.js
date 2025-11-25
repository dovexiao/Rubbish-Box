#!/usr/bin/env node

/**
 * Figma 设计文件转 AI 可读格式
 */

const fs = require('fs');
const path = require('path');

function loadConfig() {
  const configPath = path.join(__dirname, '..', '.figma.config.json');
  if (!fs.existsSync(configPath)) {
    console.error('❌ 配置文件不存在，请先创建 .figma.config.json');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

async function fetchFigmaFile(config) {
  if (!config.token || !config.fileKey) {
    console.log('⚠️  未配置 Figma Token，将使用本地配置');
    return null;
  }

  try {
    console.log('📡 正在从 Figma 获取设计文件...');
    const response = await fetch(`https://api.figma.com/v1/files/${config.fileKey}`, {
      headers: { 'X-Figma-Token': config.token },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('❌ 获取失败:', error.message);
    console.log('💡 将使用本地配置...');
    return null;
  }
}

function extractDesignTokens(figmaData, config) {
  const tokens = {
    colors: {},
    typography: {},
    spacing: config.designTokens?.spacing || {},
    components: {},
  };

  if (!figmaData) return config.designTokens || tokens;

  function traverse(node) {
    if (!node) return;
    if (node.fills?.length) {
      node.fills.forEach(fill => {
        if (fill.type === 'SOLID' && fill.color) {
          const name = node.name?.toLowerCase().replace(/\s+/g, '_') || 'color';
          tokens.colors[name] = rgbToHex(fill.color.r, fill.color.g, fill.color.b);
        }
      });
    }
    if (node.children) node.children.forEach(traverse);
  }

  if (figmaData.document) traverse(figmaData.document);

  return {
    colors: { ...config.designTokens?.colors, ...tokens.colors },
    typography: { ...config.designTokens?.typography, ...tokens.typography },
    spacing: config.designTokens?.spacing || tokens.spacing,
    components: { ...config.designTokens?.components, ...tokens.components },
  };
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

function generateAIDesignSpec(tokens, config) {
  const spec = {
    version: '1.0.0',
    updatedAt: new Date().toISOString(),
    source: config.fileUrl || 'local config',
    designTokens: tokens,
  };
  const outputPath = path.join(__dirname, '..', 'src', 'constants', 'figma-design-spec.json');
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(spec, null, 2), 'utf-8');
  console.log(`✅ 设计规范已生成: ${outputPath}`);
  return spec;
}

function generateTypeDefinitions(tokens) {
  const types = `/**
 * Figma 设计规范类型定义（自动生成）
 * 更新时间: ${new Date().toLocaleString('zh-CN')}
 */

export interface FigmaDesignTokens {
  colors: { [key: string]: string };
  typography: { [key: string]: { fontFamily?: string; fontSize?: number; fontWeight?: number | string; lineHeight?: number } };
  spacing: { base: number; scale: number[] };
  components: { [key: string]: { width?: number; height?: number; borderRadius?: number; padding?: number[] } };
}

export const figmaDesignTokens: FigmaDesignTokens = ${JSON.stringify(tokens, null, 2)};
`;
  const outputPath = path.join(__dirname, '..', 'src', 'constants', 'figma-design-tokens.ts');
  fs.writeFileSync(outputPath, types, 'utf-8');
  console.log(`✅ TypeScript 类型已生成: ${outputPath}`);
}

async function main() {
  console.log('🎨 Figma 设计规范同步工具\n');
  const config = loadConfig();
  const figmaData = await fetchFigmaFile(config);
  const tokens = extractDesignTokens(figmaData, config);
  generateAIDesignSpec(tokens, config);
  generateTypeDefinitions(tokens);
  console.log('\n✅ 同步完成！');
}

if (require.main === module) {
  main().catch(console.error);
}
