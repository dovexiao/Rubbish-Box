package com.boklock.m.NativeModules;

import android.Manifest;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothManager;
import android.bluetooth.BluetoothProfile;
import android.content.Context;
import android.content.pm.PackageManager;
import android.os.Build;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

import java.lang.reflect.Field;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class BluetoothManagerModule extends ReactContextBaseJavaModule {
    private static final String TAG = "BluetoothManagerModule";
    private final ReactApplicationContext reactContext;

    public BluetoothManagerModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @NonNull
    @Override
    public String getName() {
        return "BluetoothManager";
    }

    // -------------------------
    // Helpers
    // -------------------------

    private boolean hasBluetoothConnectPermission() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) return true; // < Android 12
        return reactContext.checkSelfPermission(Manifest.permission.BLUETOOTH_CONNECT)
                == PackageManager.PERMISSION_GRANTED;
    }

    private BluetoothAdapter getBluetoothAdapterSafely() {
        BluetoothAdapter bluetoothAdapter = null;
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR2) {
                BluetoothManager bluetoothManager =
                        (BluetoothManager) reactContext.getSystemService(Context.BLUETOOTH_SERVICE);
                if (bluetoothManager != null) {
                    bluetoothAdapter = bluetoothManager.getAdapter();
                }
            } else {
                bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
            }
        } catch (Throwable t) {
            android.util.Log.w(TAG, "getBluetoothAdapterSafely error: " + t.getMessage());
        }
        return bluetoothAdapter;
    }

    private BluetoothManager getBluetoothManagerSafely() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.JELLY_BEAN_MR2) return null;
        try {
            return (BluetoothManager) reactContext.getSystemService(Context.BLUETOOTH_SERVICE);
        } catch (Throwable t) {
            android.util.Log.w(TAG, "getBluetoothManagerSafely error: " + t.getMessage());
            return null;
        }
    }

    private Integer getHidHostProfileConst() {
        // Prefer reflection to avoid magic number and avoid compile issues on some SDK setups
        try {
            Field f = BluetoothProfile.class.getField("HID_HOST"); // API 28+
            return (Integer) f.get(null);
        } catch (Throwable t) {
            return null;
        }
    }

    private Integer getHidDeviceProfileConst() {
        // HID_DEVICE is available on newer APIs; use reflection for compatibility
        try {
            Field f = BluetoothProfile.class.getField("HID_DEVICE");
            return (Integer) f.get(null);
        } catch (Throwable t) {
            return null;
        }
    }

    private void addConnectedDevicesForProfile(BluetoothManager bluetoothManager,
                                               Set<BluetoothDevice> out,
                                               int profile) {
        try {
            List<BluetoothDevice> devices = bluetoothManager.getConnectedDevices(profile);
            if (devices != null) out.addAll(devices);
        } catch (SecurityException se) {
            android.util.Log.w(TAG, "No permission for getConnectedDevices(profile=" + profile + "): " + se.getMessage());
        } catch (Throwable t) {
            android.util.Log.w(TAG, "getConnectedDevices(profile=" + profile + ") failed: " + t.getMessage());
        }
    }

    private String getDeviceTypeDescription(int type) {
        switch (type) {
            case BluetoothDevice.DEVICE_TYPE_CLASSIC:
                return "Classic Bluetooth";
            case BluetoothDevice.DEVICE_TYPE_LE:
                return "BLE (Low Energy)";
            case BluetoothDevice.DEVICE_TYPE_DUAL:
                return "Dual (Classic + BLE)";
            case BluetoothDevice.DEVICE_TYPE_UNKNOWN:
            default:
                return "Unknown";
        }
    }

    private String getBondStateDescription(int bondState) {
        switch (bondState) {
            case BluetoothDevice.BOND_NONE:
                return "未配对";
            case BluetoothDevice.BOND_BONDING:
                return "配对中";
            case BluetoothDevice.BOND_BONDED:
                return "已配对";
            default:
                return "未知";
        }
    }

    private WritableMap buildError(String error, String message) {
        WritableMap m = Arguments.createMap();
        m.putBoolean("success", false);
        m.putString("error", error);
        m.putString("message", message);
        return m;
    }

    // -------------------------
    // Public APIs
    // -------------------------

    /**
     * 获取系统“已连接”的蓝牙设备列表（仅 connected，不再用 bonded 兜底）
     * 返回 devices: [{address,name,type,bondState,isConnected,profiles?}]
     */
    @ReactMethod
    public void getConnectedDevices(Callback callback) {
        try {
            if (callback == null) return;

            // Android 12+ requires BLUETOOTH_CONNECT for these APIs
            if (!hasBluetoothConnectPermission()) {
                callback.invoke(buildError("NO_PERMISSION",
                        "Missing BLUETOOTH_CONNECT permission (Android 12+)"));
                return;
            }

            BluetoothAdapter bluetoothAdapter = getBluetoothAdapterSafely();
            BluetoothManager bluetoothManager = getBluetoothManagerSafely();

            if (bluetoothAdapter == null) {
                callback.invoke(buildError("NO_ADAPTER", "蓝牙适配器不可用"));
                return;
            }

            if (!bluetoothAdapter.isEnabled()) {
                callback.invoke(buildError("BLUETOOTH_DISABLED", "蓝牙未开启"));
                return;
            }

            Set<BluetoothDevice> connectedDevicesSet = new HashSet<>();

            if (bluetoothManager != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR2) {
                // GATT (BLE)
                addConnectedDevicesForProfile(bluetoothManager, connectedDevicesSet, BluetoothProfile.GATT);
                // Classic audio
                addConnectedDevicesForProfile(bluetoothManager, connectedDevicesSet, BluetoothProfile.A2DP);
                // HFP
                addConnectedDevicesForProfile(bluetoothManager, connectedDevicesSet, BluetoothProfile.HEADSET);
                // HID_HOST (if available)
                Integer hidProfile = getHidHostProfileConst();
                if (hidProfile != null) {
                    addConnectedDevicesForProfile(bluetoothManager, connectedDevicesSet, hidProfile);
                }
                // HID_DEVICE (if available)
                Integer hidDeviceProfile = getHidDeviceProfileConst();
                if (hidDeviceProfile != null) {
                    addConnectedDevicesForProfile(bluetoothManager, connectedDevicesSet, hidDeviceProfile);
                }
            }

            WritableArray deviceList = Arguments.createArray();

            for (BluetoothDevice device : connectedDevicesSet) {
                try {
                    WritableMap deviceMap = Arguments.createMap();

                    String address = device.getAddress();
                    String name = null;
                    int deviceType = BluetoothDevice.DEVICE_TYPE_UNKNOWN;
                    int bondState = BluetoothDevice.BOND_NONE;

                    try { name = device.getName(); } catch (Throwable ignore) {}
                    try { deviceType = device.getType(); } catch (Throwable ignore) {}
                    try { bondState = device.getBondState(); } catch (Throwable ignore) {}

                    deviceMap.putString("address", address != null ? address : "");
                    deviceMap.putString("name", name != null ? name : "");
                    deviceMap.putInt("type", deviceType);
                    deviceMap.putInt("bondState", bondState);
                    deviceMap.putString("typeDescription", getDeviceTypeDescription(deviceType));
                    deviceMap.putString("bondStateDescription", getBondStateDescription(bondState));

                    // 这里的列表来源就是 connected，因此恒为 true
                    deviceMap.putBoolean("isConnected", true);

                    // UUID 不可靠，尽量不强依赖，给到就给
                    try {
                        android.os.ParcelUuid[] uuids = device.getUuids();
                        if (uuids != null && uuids.length > 0) {
                            WritableArray uuidArray = Arguments.createArray();
                            for (android.os.ParcelUuid uuid : uuids) {
                                uuidArray.pushString(uuid.toString());
                            }
                            deviceMap.putArray("uuids", uuidArray);
                        }
                    } catch (Throwable ignore) {}

                    deviceList.pushMap(deviceMap);
                } catch (Throwable t) {
                    android.util.Log.w(TAG, "处理设备失败: " + t.getMessage());
                }
            }

            WritableMap result = Arguments.createMap();
            result.putBoolean("success", true);
            result.putArray("devices", deviceList);
            result.putInt("count", deviceList.size());

            callback.invoke(result);
        } catch (Throwable e) {
            android.util.Log.e(TAG, "获取已连接设备列表失败", e);
            if (callback != null) {
                callback.invoke(buildError("ERROR", "获取已连接设备列表失败: " + e.getMessage()));
            }
        }
    }

    /**
     * 旧接口：检查指定 MAC 地址设备是否在“系统已连接列表”中（任一 profile 命中就 true）
     * 仍保留，但推荐用 getSystemConnectionState 更精细。
     */
    @ReactMethod
    public void isSystemConnected(String mac, Callback callback) {
        try {
            if (callback == null) return;

            if (mac == null || mac.isEmpty()) {
                callback.invoke(false);
                return;
            }

            // Android 12+ requires BLUETOOTH_CONNECT for these APIs
            if (!hasBluetoothConnectPermission()) {
                callback.invoke(false);
                return;
            }

            BluetoothManager bluetoothManager = getBluetoothManagerSafely();
            BluetoothAdapter bluetoothAdapter = getBluetoothAdapterSafely();

            if (bluetoothManager == null || bluetoothAdapter == null) {
                callback.invoke(false);
                return;
            }

            if (!bluetoothAdapter.isEnabled()) {
                callback.invoke(false);
                return;
            }

            String target = mac.trim().toUpperCase();

            // GATT
            if (isMacConnectedInProfile(bluetoothManager, BluetoothProfile.GATT, target)) {
                callback.invoke(true);
                return;
            }
            // A2DP
            if (isMacConnectedInProfile(bluetoothManager, BluetoothProfile.A2DP, target)) {
                callback.invoke(true);
                return;
            }
            // HFP
            if (isMacConnectedInProfile(bluetoothManager, BluetoothProfile.HEADSET, target)) {
                callback.invoke(true);
                return;
            }
            // HID_HOST
            Integer hidProfile = getHidHostProfileConst();
            if (hidProfile != null && isMacConnectedInProfile(bluetoothManager, hidProfile, target)) {
                callback.invoke(true);
                return;
            }
            // HID_DEVICE
            Integer hidDeviceProfile = getHidDeviceProfileConst();
            if (hidDeviceProfile != null && isMacConnectedInProfile(bluetoothManager, hidDeviceProfile, target)) {
                callback.invoke(true);
                return;
            }

            callback.invoke(false);
        } catch (Throwable e) {
            android.util.Log.e(TAG, "isSystemConnected 检查失败", e);
            if (callback != null) callback.invoke(false);
        }
    }

    private boolean isMacConnectedInProfile(BluetoothManager bluetoothManager, int profile, String targetUpperMac) {
        try {
            List<BluetoothDevice> devices = bluetoothManager.getConnectedDevices(profile);
            if (devices == null) return false;
            for (BluetoothDevice d : devices) {
                String addr = null;
                try { addr = d.getAddress(); } catch (Throwable ignore) {}
                if (addr != null && addr.toUpperCase().equals(targetUpperMac)) return true;
            }
        } catch (Throwable t) {
            android.util.Log.w(TAG, "isMacConnectedInProfile(profile=" + profile + ") failed: " + t.getMessage());
        }
        return false;
    }

    /**
     * 推荐新接口：返回系统连接状态（按 profile 分开）
     * 用它就能更准确判断：系统是以 GATT 连的，还是 HID_HOST 连的。
     *
     * 返回：
     * {
     *   success: true,
     *   mac: "...",
     *   any: true/false,
     *   gatt: true/false,
     *   hid: true/false,
     *   a2dp: true/false,
     *   headset: true/false
     * }
     */
    @ReactMethod
    public void getSystemConnectionState(String mac, Callback callback) {
        try {
            if (callback == null) return;

            if (mac == null || mac.isEmpty()) {
                callback.invoke(buildError("INVALID_MAC", "MAC 不能为空"));
                return;
            }

            if (!hasBluetoothConnectPermission()) {
                callback.invoke(buildError("NO_PERMISSION",
                        "Missing BLUETOOTH_CONNECT permission (Android 12+)"));
                return;
            }

            BluetoothManager bluetoothManager = getBluetoothManagerSafely();
            BluetoothAdapter bluetoothAdapter = getBluetoothAdapterSafely();

            if (bluetoothManager == null || bluetoothAdapter == null) {
                callback.invoke(buildError("NO_ADAPTER", "蓝牙适配器不可用"));
                return;
            }

            if (!bluetoothAdapter.isEnabled()) {
                callback.invoke(buildError("BLUETOOTH_DISABLED", "蓝牙未开启"));
                return;
            }

            String target = mac.trim().toUpperCase();

            boolean gatt = isMacConnectedInProfile(bluetoothManager, BluetoothProfile.GATT, target);
            boolean a2dp = isMacConnectedInProfile(bluetoothManager, BluetoothProfile.A2DP, target);
            boolean headset = isMacConnectedInProfile(bluetoothManager, BluetoothProfile.HEADSET, target);

            boolean hid = false;
            Integer hidProfile = getHidHostProfileConst();
            if (hidProfile != null) {
                hid = isMacConnectedInProfile(bluetoothManager, hidProfile, target);
            }
            Integer hidDeviceProfile = getHidDeviceProfileConst();
            if (hidDeviceProfile != null) {
                hid = hid || isMacConnectedInProfile(bluetoothManager, hidDeviceProfile, target);
            }

            WritableMap result = Arguments.createMap();
            result.putBoolean("success", true);
            result.putString("mac", target);
            result.putBoolean("gatt", gatt);
            result.putBoolean("hid", hid);
            result.putBoolean("a2dp", a2dp);
            result.putBoolean("headset", headset);
            result.putBoolean("any", gatt || hid || a2dp || headset);

            callback.invoke(result);
        } catch (Throwable e) {
            android.util.Log.e(TAG, "getSystemConnectionState failed", e);
            if (callback != null) {
                callback.invoke(buildError("ERROR", "getSystemConnectionState failed: " + e.getMessage()));
            }
        }
    }

    /**
     * 获取系统设置里“已配对”的设备列表，并标记是否当前已连接
     *
+     * 返回：
     * {
     *   success: true,
     *   devices: [
     *     { mac: "AA:BB:CC:DD:EE:FF", isContent: true/false }
     *   ]
     * }
     *
     * 说明：isContent 按用户要求命名，对应 isConnected（是否当前已连接）
     */
    @ReactMethod
    public void getBondedDevices(Callback callback) {
        try {
            if (callback == null) return;

            if (!hasBluetoothConnectPermission()) {
                callback.invoke(buildError("NO_PERMISSION",
                        "Missing BLUETOOTH_CONNECT permission (Android 12+)"));
                return;
            }

            BluetoothManager bluetoothManager = getBluetoothManagerSafely();
            BluetoothAdapter bluetoothAdapter = getBluetoothAdapterSafely();

            if (bluetoothAdapter == null) {
                callback.invoke(buildError("NO_ADAPTER", "蓝牙适配器不可用"));
                return;
            }

            if (!bluetoothAdapter.isEnabled()) {
                callback.invoke(buildError("BLUETOOTH_DISABLED", "蓝牙未开启"));
                return;
            }

            Set<BluetoothDevice> bonded = bluetoothAdapter.getBondedDevices();
            WritableArray devices = Arguments.createArray();

            if (bonded != null && !bonded.isEmpty()) {
                for (BluetoothDevice device : bonded) {
                    try {
                        String mac = device.getAddress();
                        if (mac == null) continue;
                        String macUpper = mac.trim().toUpperCase();

                        boolean isConnected = false;
                        if (bluetoothManager != null) {
                            isConnected =
                                    isMacConnectedInProfile(bluetoothManager, BluetoothProfile.GATT, macUpper) ||
                                            isMacConnectedInProfile(bluetoothManager, BluetoothProfile.A2DP, macUpper) ||
                                            isMacConnectedInProfile(bluetoothManager, BluetoothProfile.HEADSET, macUpper);

                            Integer hidProfile = getHidHostProfileConst();
                            if (hidProfile != null) {
                                isConnected = isConnected || isMacConnectedInProfile(bluetoothManager, hidProfile, macUpper);
                            }
                            Integer hidDeviceProfile = getHidDeviceProfileConst();
                            if (hidDeviceProfile != null) {
                                isConnected = isConnected || isMacConnectedInProfile(bluetoothManager, hidDeviceProfile, macUpper);
                            }
                        }

                        WritableMap item = Arguments.createMap();
                        item.putString("mac", mac);
                        item.putBoolean("isContent", isConnected); // 按用户要求命名
                        devices.pushMap(item);
                    } catch (Throwable ignore) {
                        // 跳过单个异常设备
                    }
                }
            }

            WritableMap result = Arguments.createMap();
            result.putBoolean("success", true);
            result.putArray("devices", devices);
            result.putInt("count", devices.size());

            callback.invoke(result);
        } catch (Throwable e) {
            android.util.Log.e(TAG, "getBondedDevices failed", e);
            if (callback != null) {
                callback.invoke(buildError("ERROR", "getBondedDevices failed: " + e.getMessage()));
            }
        }
    }
}
