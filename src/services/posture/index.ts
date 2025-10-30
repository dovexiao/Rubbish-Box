y/**
 * 姿势监控模块 - 统一导出
 * 方便外部导入使用
 */

// 类型定义
export * from "../../types/posture";

// 核心服务
export { PostureEvaluator, postureEvaluator } from "../postureEvaluator";
export { AudioService, audioService } from "../audioService";
export { PostureStorageService, postureStorage } from "../postureStorage";
export {
  PostureMonitorService,
  getPostureMonitorService,
  resetPostureMonitorService,
} from "../postureMonitorService";

// React Hook
export { usePostureMonitor } from "../../hooks/usePostureMonitor";
export type { UsePostureMonitorReturn } from "../../hooks/usePostureMonitor";

// UI 组件
export { PostureMonitorScreen } from "../../screens/PostureMonitorScreen";

// 示例组件
export {
  BasicExample,
  MinimalExample,
  CustomConfigExample,
} from "../../examples/PostureMonitorExample";

