class FreshchatConfig {
  public appId: string;
  public appKey: string;
  public domain: string | null;
  public themeName: string | null;
  public stringsBundle: any | null; // 可根据实际情况指定正确的类型
  public teamMemberInfoVisible: boolean;
  public cameraCaptureEnabled: boolean;
  public gallerySelectionEnabled: boolean;
  public fileSelectionEnabled: boolean;
  public responseExpectationEnabled: boolean;
  public errorLogsEnabled: boolean; // 仅限 iOS
  public showNotificationBanner: boolean; // 仅限 iOS
  public notificationSoundEnabled: boolean; // 仅限 iOS

  constructor(appId: string, appKey: string) {
    this.appId = appId;
    this.appKey = appKey;
    this.domain = null;
    this.themeName = null;
    this.stringsBundle = null;
    this.teamMemberInfoVisible = true;
    this.cameraCaptureEnabled = true;
    this.gallerySelectionEnabled = true;
    this.fileSelectionEnabled = true;
    this.responseExpectationEnabled = true;
    this.errorLogsEnabled = true; // 仅限 iOS
    this.showNotificationBanner = true; // 仅限 iOS
    this.notificationSoundEnabled = true; // 仅限 iOS
  }
}

export default FreshchatConfig;
