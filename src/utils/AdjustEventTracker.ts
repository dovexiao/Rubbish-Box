import {Adjust, AdjustEvent} from 'react-native-adjust';

// 事件Token映射接口定义
interface EventTokens {
  Register: string;
  First_Deposit: string;
  Recharge: string;
  Deposit: string;
  game_rounds: string;
  game_time: string;
  nextdaylogin: string;
  threedaylogin: string;
  sevendaylogin: string;
}

// 事件Token常量定义（与Adjust后台配置对应）
export const EVENT_TOKENS: EventTokens = {
  Register: 'azwuw3',
  First_Deposit: 'oig3he',
  Recharge: '26oxq3',
  Deposit: 'd75e06',
  game_rounds: 'uxh5j1',
  game_time: 'np6qka',
  nextdaylogin: '6e5ka3',
  threedaylogin: 'xc97gn',
  sevendaylogin: 'de65u4',
};

/**
 * 跟踪注册事件
 */
export const trackRegister = (): void => {
  const event = new AdjustEvent(EVENT_TOKENS.Register);
  Adjust.trackEvent(event);
};

/**
 * 跟踪首充事件
 * @param {number} amount - 充值金额（数值类型，支持小数点后两位）
 * @param {string} currency - 货币代码（默认INR，遵循ISO 4217标准）
 */
export const trackFirstDeposit = (
  amount: number,
  currency: string = 'INR',
): void => {
  if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
    console.error('Invalid amount for first deposit event');
    return;
  }

  const event = new AdjustEvent(EVENT_TOKENS.First_Deposit);
  event.setRevenue(amount, currency);
  Adjust.trackEvent(event);
};

/**
 * 跟踪复充事件
 * @param {number} amount - 充值金额（数值类型，支持小数点后两位）
 * @param {string} orderId - 订单唯一ID（用于去重，建议使用UUID）
 * @param {string} currency - 货币代码（默认INR）
 */
export const trackRecharge = (
  amount: number,
  orderId: string,
  currency: string = 'INR',
): void => {
  if (!orderId || typeof orderId !== 'string') {
    console.error('Valid orderId is required for recharge event');
    return;
  }

  if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
    console.error('Invalid amount for recharge event');
    return;
  }

  const event = new AdjustEvent(EVENT_TOKENS.Recharge);
  event.setRevenue(amount, currency);
  event.setDeduplicationId(orderId);
  Adjust.trackEvent(event);
};

/**
 * 跟踪游戏局数
 * @param {number} rounds - 游戏局数（正整数）
 */
export const trackGameRounds = (rounds: number): void => {
  if (!Number.isInteger(rounds) || rounds <= 0) {
    console.error('Game rounds must be a positive integer');
    return;
  }

  const event = new AdjustEvent(EVENT_TOKENS.game_rounds);
  event.addCallbackParameter('rounds', rounds.toString());
  Adjust.trackEvent(event);
};

/**
 * 跟踪游戏时长
 * @param {number} seconds - 游戏时长（秒，正整数）
 */
export const trackGameTime = (seconds: number): void => {
  if (!Number.isInteger(seconds) || seconds <= 0) {
    console.error('Game time must be a positive integer in seconds');
    return;
  }

  const event = new AdjustEvent(EVENT_TOKENS.game_time);
  event.addCallbackParameter('duration', seconds.toString());
  Adjust.trackEvent(event);
};

/**
 * 跟踪留存事件
 * @param {keyof EventTokens} type - 留存类型（严格限制为预定义的留存事件）
 */
export const trackRetention = (
  type: Extract<
    keyof EventTokens,
    'nextdaylogin' | 'threedaylogin' | 'sevendaylogin'
  >,
): void => {
  const event = new AdjustEvent(EVENT_TOKENS[type]);
  Adjust.trackEvent(event);
};

// 导出类型定义
export type RetentionType = Parameters<typeof trackRetention>[0];
export type EventTracker = {
  trackRegister: typeof trackRegister;
  trackFirstDeposit: typeof trackFirstDeposit;
  trackRecharge: typeof trackRecharge;
  trackGameRounds: typeof trackGameRounds;
  trackGameTime: typeof trackGameTime;
  trackRetention: typeof trackRetention;
};
