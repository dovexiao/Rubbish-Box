import { storageUtil } from './storage';

export async function getBluetoothDeviceInfo(): Promise<Record<string, any>> {
  try {
    const raw = await storageUtil.getItem<any>('bluetoothDeviceInfoList');
    if (!raw) return {};
    if (typeof raw === 'object' && raw !== null && 'data' in raw) {
      return (raw as any).data || {};
    }
    return raw as Record<string, any>;
  } catch {
    return {};
  }
}

export async function removeBluetoothDeviceInfo(
  deviceId: string,
): Promise<void> {
  try {
    const cached = await getBluetoothDeviceInfo();
    let updated = false;
    const next: Record<string, any> = {};
    for (const [key, val] of Object.entries(cached)) {
      if ((val as any)?.deviceId !== deviceId) {
        next[key] = val;
      } else {
        updated = true;
      }
    }
    if (updated) {
      await storageUtil.setItem('bluetoothDeviceInfoList', next);
    }
  } catch {}
}
