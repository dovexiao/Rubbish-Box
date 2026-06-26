export interface PageTypeConfig {
  imgUrl: string;
  route?: string;
  videoUrl?: string;
}

const PAGE_TYPE_ENTRIES = {
  1: {
    imgUrl: 'https://g.18qjz.cn/img/boklock/skill/skill_1.png',
    route: 'BindDevice',
  },
  2: {
    imgUrl: 'https://g.18qjz.cn/img/boklock/skill/skill_2.png',
    route: 'DeviceInfo',
  },
  3: {
    imgUrl: 'https://g.18qjz.cn/img/boklock/skill/skill_3.png',
    route: 'CombineDevice',
  },
  5: {
    imgUrl: 'https://g.18qjz.cn/img/boklock/skill/skill_5.png',
    route: 'BindPhone',
  },
  6: {
    imgUrl: 'https://g.18qjz.cn/img/boklock/skill/skill_6.png',
    route: 'Account',
  },
  7: {
    imgUrl: 'https://g.18qjz.cn/img/boklock/skill/skill_7.png',
    route: 'ChangeMobile',
  },
  8: {
    imgUrl: 'https://g.18qjz.cn/img/boklock/skill/skill_8.png',
    route: 'PasswordSet',
  },
  9: {
    imgUrl: 'https://g.18qjz.cn/img/boklock/skill/skill_9.png',
    route: 'PasswordSet',
  },
  10: {
    imgUrl: 'https://g.18qjz.cn/img/boklock/skill/skill_10.png',
    route: 'DeviceInfo',
  },
  11: {
    imgUrl: 'https://g.18qjz.cn/img/boklock/skill/skill_11.png',
    route: 'DeviceAddress',
  },
  12: {
    imgUrl: 'https://g.18qjz.cn/img/boklock/skill/skill_12.png',
    route: 'DeviceLog',
  },
  13: {
    imgUrl: 'https://g.18qjz.cn/img/boklock/deviceChargingPoster.png',
    videoUrl:
      'https://g.18qjz.cn/img/boklock/deviceChargingVideo_compatible.mp4',
  },
  14: {
    imgUrl: 'https://g.18qjz.cn/img/boklock/skill/skill_6.png', //解绑微信
    route: 'Account',
  },
  15: {
    imgUrl: 'https://g.18qjz.cn/img/boklock/skill/skill_3.png', //编辑组合设备
    route: 'CombineDevice',
  },
  16: {
    imgUrl: 'https://g.18qjz.cn/img/boklock/skill/skill_3.png', //修改组合设备
    route: 'MultipleDevice',
  },
} satisfies Record<number, PageTypeConfig>;

export const PAGE_TYPE_MAP = PAGE_TYPE_ENTRIES;

export function getPageTypeConfig(
  pageType?: string | number,
  fallback: keyof typeof PAGE_TYPE_ENTRIES = 13,
): PageTypeConfig {
  const key = Number(pageType) as keyof typeof PAGE_TYPE_ENTRIES;
  return PAGE_TYPE_ENTRIES[key] ?? PAGE_TYPE_ENTRIES[fallback];
}
