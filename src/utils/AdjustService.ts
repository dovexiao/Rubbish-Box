import { Platform } from 'react-native';

export type AdjustEventName = 'download' | 'recharge' | 'register';

class AdjustService {
  static async track(eventName: AdjustEventName, amount?: number, currency: string = 'USD') {
    if (Platform.OS === 'web') {
      console.log(`[AdjustService] Web 平台忽略事件: ${eventName}`);
      return;
    }

    // 动态导入 Adjust，只在非 Web 平台执行
    const { Adjust, AdjustEvent } = await import('react-native-adjust');

    let eventToken = '';

    switch (eventName) {
      case 'download':
        eventToken = 'ubnlv5';
        break;
      case 'register':
        eventToken = 'pq5yba';
        break;
      case 'recharge':
        eventToken = 'jgi9qa';
        if (!amount || amount <= 0) {
          throw new Error('[AdjustService]recharge事件必须提供大于0的金额');
        }
        break;
      default:
        console.warn(`[AdjustService] Unknown event: ${eventName}`);
        return;
    }

    const event = new AdjustEvent(eventToken);

    if (eventName === 'recharge' && amount) {
      event.setRevenue(amount, currency);
    }

    Adjust.trackEvent(event);
  }

  /**
 * 获取 Adjust 设备 ID（adid）
 */
  static async getAdid(): Promise<string> {
    if (Platform.OS === 'web') return '';

    const { Adjust } = await import('react-native-adjust');

    return new Promise(resolve => {
      try {
        (Adjust as any).getAdid((adid: string) => {
          console.log('[AdjustService] 获取 adid 成功：', adid);
          resolve(adid || '');
        });
      } catch (error) {
        console.warn('[AdjustService] 获取 adid 失败:', error);
        resolve('');
      }
    });
  }
}

export default AdjustService;
