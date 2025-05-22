enum NotificationPriority {
  PRIORITY_DEFAULT = 0,
  PRIORITY_HIGH = 1,
  PRIORITY_LOW = -1,
  PRIORITY_MAX = 2,
  PRIORITY_MIN = -2,
}

enum NotificationImportance {
  NONE = 0,
  MIN = 1,
  LOW = 2,
  DEFAULT = 3,
  HIGH = 4,
  MAX = 5,
}

class FreshchatNotificationConfig {
  public notificationSoundEnabled: boolean = true;
  public activityToLaunchOnFinish: string | null = null;
  public largeIcon: string | null = null;
  public smallIcon: string | null = null;
  public priority: number = NotificationPriority.PRIORITY_DEFAULT;
  public importance: number = NotificationImportance.DEFAULT;
  public overrideNotificationClickListener: boolean = false;

  private constructor() {
    Object.preventExtensions(this);
  }

  static get NotificationPriority(): NotificationPriority {
    return this.NotificationPriority;
  }

  static get NotificationImportance(): NotificationImportance {
    return this.NotificationImportance;
  }

  static getInstance(): FreshchatNotificationConfig {
    return new FreshchatNotificationConfig();
  }
}

export default {
  FreshchatNotificationConfig,
  NotificationPriority,
  NotificationImportance,
};
