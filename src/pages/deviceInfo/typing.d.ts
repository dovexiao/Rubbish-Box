export interface lockInfoProps {
  /* */
  id: number;

  /*设备名称 */
  lockName: string;

  /*设备编号 */
  deviceNo: string;

  /*设备外观码/SN码 */
  lockId: string;

  /*二维码，data:image/png;base64 */
  qrCode: string;

  /*版本号 */
  version: string;

  /*管理员姓名 */
  adminUsername: string;

  /*管理员手机号 */
  adminMobile: string;

  /*离车升锁秒数 */
  leaveUpTime: number;

  /*蜂鸣器状态：0-关闭 1-打开 */
  buzzerStatus: number;

  /*蜂鸣时长 */
  buzzerTime: number;

  /*蓝牙编号 */
  bleNo: string;

  /*蓝牙名称 */
  bleName: string;

  /*蓝牙PIN码 */
  blePin: string;

  /*用电类型：0-续航版 1-市电款 2-均衡版 */
  powerType: number;

  /*用电类型名称：0-续航版 1-市电款 2-均衡版 */
  powerTypeName: string;

  has433Key: boolean;

  keyCount: number;
  resetTime: string;
}
