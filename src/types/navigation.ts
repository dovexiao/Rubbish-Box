export type RootStackParamList = {
  Index: undefined;
  Login: undefined;
  MainTabs: undefined;
  DeviceDetail: { deviceId: string };
  MemberShare: undefined;
  VipInvite: undefined;
  DeviceInfo: { lockId: number; isAdmin: boolean };
  WebView: { url?: string; title?: string };
  ForgetPassword: undefined;
  ForgetPasswordSms: { mobile: string; type: string };
  DeviceAddress: { addressInfo?: string | any[] };
};

export type MainTabParamList = {
  DeviceControl: undefined;
  DeviceGroup: undefined;
  Profile: undefined;
};
