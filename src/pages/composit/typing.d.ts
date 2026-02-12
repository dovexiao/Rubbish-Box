export interface ListItem {
  id: number;
  lockName: string;
  role: number;
  roleName: string;
  battery: number;
  atCsq: number;
  showBattery: boolean;
  fallStatus?: number;
  deviceStatus: number;
  overlay?: boolean;
  coverStatus?: number;
  imageUrl: string;
  /** 本地标记：是否为本次会话中新添加的设备 */
  isNew?: boolean;
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
  imageUrl?: string;
  checked?: boolean;
  isNew?: boolean;
}
