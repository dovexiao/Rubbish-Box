const fs = require('fs');
const path = require('path');

const envFile = process.env.ENVFILE || '.env.development';
const filePath = path.resolve(__dirname, '..', envFile);

let config = {};
if (fs.existsSync(filePath)) {
  const content = fs.readFileSync(filePath, 'utf-8');
  content.split(/\r?\n/).forEach(line => {
    // 忽略注释
    if (line.trim().startsWith('#')) return;
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      config[match[1]] = match[2];
    }
  });
}

const outPath = path.resolve(
  __dirname,
  '..',
  'src',
  'config',
  'env.static.json',
);
fs.writeFileSync(outPath, JSON.stringify(config, null, 2));
console.log(
  `[Harmony Env] Injected ${envFile} into env.static.json successfully.`,
);
