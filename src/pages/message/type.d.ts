export interface messagesProps {
  /*消息ID */
  id: number;
  /*消息类型（1-电量不足提醒 2-碰撞蜂鸣） */
  messageType: number;
  /*消息类型名称 */
  messageTypeName: string;
  /*消息内容 */
  messageContent: string;
  /*设备ID */
  deviceId: number;
  /*地锁ID */
  lockId: number;
  /*地锁名称 */
  lockName: string;
  /*创建时间 */
  createTime: string;
  /**是否已读（0-未读 1-已读） */
  isRead: number;
  //组合设备id
  groupId: number;
}
export interface msgListProps {
  /*日期标签（今天、昨天、7月1日等） */
  dateLabel: string;
  /*日期（yyyy-MM-dd格式） */
  date: string;
  /*该天的消息列表 */
  messages: messagesProps[];
}
