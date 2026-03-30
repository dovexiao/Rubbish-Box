export interface DetailsProp {
  id: number;

  /*用户ID */
  userId: number;

  /*地锁管理员ID */
  adminUserId: number;

  /*地锁管理员 */
  adminUsername: string;

  /*贵宾码 */
  code: string;

  /*贵宾名称 */
  username: string;

  /*贵宾手机号 */
  mobile: string;

  /*开始时间 */
  startTime: string;

  /*结束时间 */
  endTime: string;

  /*次数限制 */
  limitTime: number;

  /*0限制次数 1不限制次数 */
  noLimit: number;

  /*使用次数 */
  useTime: number;

  /*剩余次数 */
  leftTime: number;

  /*状态：1-未使用 2-已使用 10-过期未用 20-已作废 */
  status: number;

  /*二维码，data:image/png;base64 */
  qrCode: string;

  /*空锁数量 */
  emptyLockCount: number;

  /*锁数量 */
  allLockCount: number;

  /* */
  address: string;
}
