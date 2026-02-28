export type RootStackParamList = {
  Index: undefined;
  Login: undefined;
  MainTabs: undefined;
  DeviceDetail: { deviceId: string };
  MemberShare: undefined;
  VipInvite: undefined;
  DeviceInfo: { lockId: number; isAdmin: boolean };
  DeviceList: { id: number; role: number };
  DeviceLog: { lockId: number };
  FirmwareVersion: { lockId: number; currentVersion: string };
  VersionHistory: { lockId: number };
  WebView: { url?: string; title?: string };
  ForgetPassword: undefined;
  ForgetPasswordSms?: { mobile: string; type: string };
  CompositeManage: { lockId: number };
  DevicesMember: { lockId: number; type: 'single' | 'group' };
  CompositeShare: { lockId: number; lockType: number };
  BindDevice: undefined;
  CombineDevice: { id: number; lockName: string; type: boolean };
  HandOver: undefined;
  HandOverDevice: { bleNo: string };
  HandOverVerify: { bleNo: string };
  HandOverVerifyNew: { bleNo: string };
  BluetoothSearch: {
    bleNo: string;
    lockName: string;
    lockId: number;
    imageMap: Record<string, string>;
    pin: string;
    mode: number;
    bleName?: string;
    deviceNo: string;
    role: string;
  };
  Unbind: { id: number };
  UnbindDevice: {
    phoneNumber?: string;
    bleNo?: string;
    id?: string | number;
    bleName?: string;
  };
  Message: { lockId: number };
  MessageDetail: { msgId: number };
};

export type MainTabParamList = {
  DeviceControl: undefined;
  DeviceGroup: undefined;
  Profile: undefined;
};
