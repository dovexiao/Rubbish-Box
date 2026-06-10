import type { GestureResponderEvent } from 'react-native';

export interface DeviceItemProps {
  data: DeviceItemDTO;
  active?: boolean;
  onSelect: () => void;
  onChangeName?: (event?: GestureResponderEvent) => void;
}

export interface DeviceItemDTO {
  /* */
  id: number;
  /*地锁名称 */
  lockName: string;
  /*角色 */
  role: number;
  /*角色名称 */
  roleName: string;
  /*设备数 */
  count?: number;
  /*设备数 */
  groupCount?: number;
  /*设备图片 */
  imageUrl: string;
}
