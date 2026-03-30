export interface ListItem {
  id: number;
  lockName: string;
  role: number;
  roleName: string;
  battery: number;
  atCsq: number;
  showBattery: boolean;
  fallStatus: number;
  deviceStatus: number;
  overlay?: boolean;
  coverStatus?: number;
  imageUrl: string;
  warnBattery?: number;
  bluetoothStatus?: number;
  bleNo?: string;
  deviceNo?: string;
  imageMap?: any;
  aboveStatus: number;
  mode: number;
  powerType: number;
  blePin: string;
  bleName: string;
  canOpenCover?: boolean;
  needPin?: number;
  compVer?: string;
}

export interface MemberItem {
  id?: number | string;
  username?: string | undefined;
  mobile?: string | undefined;
  lockId?: number | undefined;
  endTime?: number | undefined;
  isForever?: boolean | undefined;
}

export interface AddListItem {
  id: number;
  lockName: string;
  checked?: boolean;
  isNew?: boolean;
}
