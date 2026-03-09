/**
 * 轻量全局事件中心（兼容既有代码的 on/off/trigger 调用方式）。
 *
 * - 用于跨页面/跨组件的一次性通知，不建议承载状态
 * - 事件名建议使用 `业务域:动作`（如 `privacy:open`、`global:popConfirm:show`）
 */
class EventCenter {
  private events: Map<string, Set<Function>> = new Map();

  /**
   * 订阅事件。
   * @param eventName 事件名称
   * @param callback 回调函数
   */
  on(eventName: string, callback: Function) {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, new Set());
    }
    this.events.get(eventName)!.add(callback);
  }

  /**
   * 取消订阅事件；不传 callback 则移除该事件下所有订阅。
   * @param eventName 事件名称
   * @param callback 回调函数（可选）
   */
  off(eventName: string, callback?: Function) {
    if (!this.events.has(eventName)) {
      return;
    }

    if (callback) {
      this.events.get(eventName)!.delete(callback);
      if (this.events.get(eventName)!.size === 0) {
        this.events.delete(eventName);
      }
    } else {
      this.events.delete(eventName);
    }
  }

  /**
   * 触发事件并向订阅者传递参数。
   * @param eventName 事件名称
   * @param args 透传给订阅回调的参数
   */
  trigger(eventName: string, ...args: any[]) {
    if (!this.events.has(eventName)) {
      return;
    }

    const callbacks = this.events.get(eventName)!;
    callbacks.forEach(callback => {
      try {
        callback(...args);
      } catch (error) {
        console.error(
          `EventCenter: Error executing callback for event "${eventName}":`,
          error,
        );
      }
    });
  }

  /**
   * 判断是否存在至少一个订阅者。
   * @param eventName 事件名称
   */
  has(eventName: string): boolean {
    return this.events.has(eventName) && this.events.get(eventName)!.size > 0;
  }

  /**
   * 清空所有事件订阅。
   */
  clear() {
    this.events.clear();
  }
}

/**
 * 全局单例事件中心。
 */
const eventCenter = new EventCenter();

export default eventCenter;
