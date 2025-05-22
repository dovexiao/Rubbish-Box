/**
 * componentName: 组件名,多个单词中划线分隔
 * compnoentPath: 组件路径 basic or business or otherpath(比如pages),默认basic,如果传入basic or business,会创建组件,包含demo和readme,否则不会包含
 * 创建组件的脚本。
 * 比如传入test basic(默认，可省略)
 * 会在src/components/basic
 * 创建test文件夹，下面包含test.tsx, index.ts, readme.md, demo.tsx
 */
let [, , componentName, compnoentPath] = process.argv;
const exit = (msg, error) => {
  console.error(msg);
  if (error) {
    console.error(error);
  }
  process.exit(1);
};
if (!componentName || componentName.indexOf('--') > -1) {
  exit('componentName is not illegal');
}
if (!compnoentPath) {
  compnoentPath = 'basic';
}
let isComponent = true;
if (compnoentPath === 'basic' || compnoentPath === 'business') {
  compnoentPath = `${__dirname}/src/components/${compnoentPath}`;
} else {
  isComponent = false;
  compnoentPath = `${__dirname}/src/${compnoentPath}`;
}

const fs = require('fs');
const tpl = require('./createTempltes');

const writeFile = (filePath, context = '') => {
  fs.writeFile(filePath, context, writeFileError => {
    if (writeFileError) {
      exit(`cannot creat file: ${filePath}`, writeFileError);
    }
  });
};

const componentFolderPath = `${compnoentPath}/${componentName}`;
// 创建组件文件夹
fs.mkdir(componentFolderPath, {recursive: true}, mkdirError => {
  if (mkdirError) {
    exit(`cannot creat dir: ${componentFolderPath}`, mkdirError);
  } else {
    writeFile(
      `${componentFolderPath}/${componentName}.tsx`,
      tpl.getTsxTpl(componentName),
    );
    writeFile(
      `${componentFolderPath}/index.ts`,
      tpl.getIndexTpl(componentName),
    );
    if (isComponent) {
      writeFile(
        `${componentFolderPath}/demo.tsx`,
        tpl.getDemoTpl(componentName),
      );
      writeFile(`${componentFolderPath}/index.md`, componentName);
    }
  }
});
