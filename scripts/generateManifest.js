const fs = require('fs');
const path = require('path');

const env = process.env.REACT_APP_API_CHANNEL_ID;

const configs = {
  supbet: {
    id: 'supbet',
    scope: '/supbet/',
    start_url: '/?app=supbet',
    name: 'supbet',
    theme_color: '#ffffff',
    iconDir: 'supbet',
    background_color: '#000000',
  },
  winlucky001: {
    id: 'winlucky001',
    scope: '/winlucky001/',
    start_url: '/?app=winlucky001',
    name: 'winlucky001',
    theme_color: '#ffffff',
    iconDir: 'winlucky001',
    background_color: '#210118',
  },
  lucky101: {
    id: 'lucky101',
    scope: '/lucky101/',
    start_url: '/?app=lucky101',
    name: 'lucky101',
    theme_color: '#ffffff',
    iconDir: 'lucky101',
    background_color: '#000000',
  },
};

const base = {
  short_name: process.env.REACT_APP_API_CHANNEL_ID,
  start_url: '.',
  display: 'standalone',
};

const cfg = configs[env];
const manifest = {
  ...base,
  ...cfg,
  icons: [
    {
      src: `assets/icons/${cfg.iconDir}/icon-192.png`,
      sizes: '192x192',
      type: 'image/png',
    },
    // {
    //   src: `assets/icons/${cfg.iconDir}/icon-384.png`,
    //   sizes: '384x384',
    //   type: 'image/png',
    // },
    {
      src: `assets/icons/${cfg.iconDir}/icon-512.png`,
      sizes: '512x512',
      type: 'image/png',
    },
  ],
};

// 写入 manifest.json
fs.writeFileSync('./public/manifest.json', JSON.stringify(manifest, null, 2));
console.log(`✅ Generated manifest for ${env}`);

// 可选：复制对应图标到 public 根目录（如果构建工具需要）
['icon-192.png', 'icon-512.png'].forEach(file => {
  fs.copyFileSync(
    path.join(__dirname, `../public/assets/icons/${cfg.iconDir}/${file}`),
    path.join(__dirname, `../public/${file}`),
  );
});
