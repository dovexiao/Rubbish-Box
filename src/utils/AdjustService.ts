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
}

export default AdjustService;
