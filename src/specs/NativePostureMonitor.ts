/**
 * TurboModule Spec for PostureMonitor
 * 定义原生模块的接口，供 Codegen 生成桥接代码
 */

import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  startMonitoringService(): Promise<boolean>;
  stopMonitoringService(): Promise<boolean>;
  isServiceRunning(): Promise<boolean>;
  setCameraInUseByOtherApp(inUse: boolean): void;
  checkConcurrentCameraSupport(): Promise<{
    supported: boolean;
    canUseConcurrently: boolean;
    cameraCount: number;
    concurrentSets: number;
  }>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('PostureMonitorModule');

