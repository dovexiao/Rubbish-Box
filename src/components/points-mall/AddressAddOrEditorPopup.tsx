import React, { useCallback, useEffect, useMemo, useState, forwardRef, useImperativeHandle, useRef } from "react"
import { Modal, View, Text, TouchableOpacity, TextInput, TouchableWithoutFeedback, ActivityIndicator } from "react-native"
import { createStyles } from "../../utils/rpxStyleSheet"
import { type AddressItem, AddAddressParams, UpdateAddressParams } from "../../services/pointsMall"
import RegionSelector from "../common/RegionSelector"
import { showError } from "@/utils/toast"

export type AddressAddOrEditorPopupRef = {
    show: (address: AddressItem | null) => void;
}

interface AddressAddOrEditorPopupProps {
    onAddAddress: (params: AddAddressParams) => Promise<void>
    onUpdateAddress: (params: UpdateAddressParams) => Promise<void>
    onClose?: () => void
    onSuccess?: () => void
}

/**
 * 收货地址新增 / 编辑弹窗
 */
const AddressAddOrEditorPopup = forwardRef<AddressAddOrEditorPopupRef, AddressAddOrEditorPopupProps>(({
    onAddAddress,
    onUpdateAddress,
    onClose,
    onSuccess,
}, ref) => {
    const [visible, setVisible] = useState(false);
    const [address, setAddress] = useState<AddressItem | null>(null);
    const [isEdit, setIsEdit] = useState(false);
    const [loading, setLoading] = useState(false);
    const loadingRef = useRef<boolean>(false);

    const [receiverName, setReceiverName] = useState("")
    const [phone, setPhone] = useState("")
    //   const [region, setRegion] = useState("")
    const [province, setProvince] = useState("")
    const [city, setCity] = useState("")
    const [district, setDistrict] = useState("")
    const [detail, setDetail] = useState("")
    const [regionSelectorVisible, setRegionSelectorVisible] = useState(false)

    useEffect(() => {
        if (visible) {
            if (address) {
                setReceiverName(address.receiver_name || "")
                setPhone(address.phone_unencrypted || "")
                // const regionText =
                //   `${address.province_text || ""}${address.city_text || ""}${address.district_text || ""}` || ""
                // setRegion(regionText)
                setProvince(address.province || "")
                setCity(address.city || "")
                setDistrict(address.district || "")
                setDetail(address.detail_address || "")
            } else {
                setReceiverName("")
                setPhone("")
                // setRegion("")
                setProvince("")
                setCity("")
                setDistrict("")
                setDetail("")
            }
        }
    }, [visible, address])

    // 显示弹窗
    const show = useCallback((addressValue: AddressItem | null) => {
        setIsEdit(!!addressValue);
        setAddress(addressValue);
        setVisible(true);
    }, []);

    // 隐藏弹窗
    const hide = useCallback(() => {
        setVisible(false);
        setAddress(null);
        setIsEdit(false);
        setLoading(false);
    }, []);

    // 完整地址信息判定
    const isAddressInfoComplete = useMemo(() => {
        return !!(
            receiverName.trim() &&
            phone.trim() &&
            province.trim() &&
            city.trim() &&
            district.trim() &&
            detail.trim()
        );
    }, [receiverName, phone, province, city, district, detail]);

    // 保存按钮是否可用
    const isSaveButtonEnabled = useMemo(() => {
        return isAddressInfoComplete && !loading && !visible;
    }, [isAddressInfoComplete, loading, visible]);

    // 处理地区选择确认
    const handleRegionConfirm = useCallback((provinceValue: string, cityValue: string, districtValue: string) => {
        setProvince(provinceValue);
        setCity(cityValue);
        setDistrict(districtValue);
        setRegionSelectorVisible(false);
    }, []);

    // 暴露方法给父组件
    useImperativeHandle(ref, () => ({
        show,
    }), [show]);

    const handleSave = useCallback(async () => {
        if (!isAddressInfoComplete) {
            showError("请输入完整地址信息");
            return;
        }
        if (loadingRef.current) {
            return;
        }
        loadingRef.current = true;
        setLoading(true);

        let payload: AddAddressParams | UpdateAddressParams = {
            id: address?.id || 0,
            receiver_name: receiverName.trim(),
            phone: phone.trim(),
            province: province,
            city: city,
            district: district,
            detail_address: detail.trim(),
        };

        try {
            if (isEdit && address?.id) {
                await onUpdateAddress(payload);
            } else {
                await onAddAddress(payload);
            }
            onSuccess?.();
            hide();
            onClose?.();
        } catch (error) {
            console.warn("保存地址失败", error);
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    }, [isAddressInfoComplete, isEdit, address, receiverName, phone, province, city, district, detail, onAddAddress, onUpdateAddress, onSuccess, onClose, hide]);

    if (!visible) {
        return null;
    }

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={() => { hide(); onClose?.(); }}>
            <TouchableWithoutFeedback onPress={() => { hide(); onClose?.(); }}>
                <View style={styles.overlay} />
            </TouchableWithoutFeedback>
            <View style={styles.centerBox}>
                <View style={styles.popup}>
                    <Text style={styles.title}>{isEdit ? "编辑收货地址" : "添加收货地址"}</Text>

                    <View style={styles.formItem}>
                        <Text style={styles.label}>收货人</Text>
                        <TextInput
                            style={styles.valueInput}
                            placeholder="收货人姓名"
                            placeholderTextColor="#00000066"
                            value={receiverName}
                            onChangeText={setReceiverName}
                        />
                    </View>

                    <View style={styles.formItem}>
                        <Text style={styles.label}>手机号</Text>
                        <TextInput
                            style={styles.valueInput}
                            placeholder="收货人手机号"
                            placeholderTextColor="#00000066"
                            keyboardType="phone-pad"
                            maxLength={11}
                            value={phone}
                            onChangeText={setPhone}
                        />
                    </View>

                    <View style={styles.formItem}>
                        <Text style={styles.label}>地区</Text>
                        <TouchableOpacity style={styles.regionButton} activeOpacity={0.8} onPress={() => {
                            setRegionSelectorVisible(true);
                        }}>
                            <Text style={province || city || district ? styles.regionText : styles.regionPlaceholderText}>{province + city + district || "点击选择"}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.formItem}>
                        <Text style={styles.label}>详细地址</Text>
                        <TextInput
                            style={styles.valueInput}
                            placeholder="如街道、门牌号、小区、乡镇、村等"
                            placeholderTextColor="#00000066"
                            value={detail}
                            onChangeText={setDetail}
                            multiline
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.saveButton, !isAddressInfoComplete && styles.saveButtonDisabled]}
                        activeOpacity={isAddressInfoComplete ? 0.8 : 1}
                        onPress={isAddressInfoComplete ? handleSave : undefined}
                        disabled={!isAddressInfoComplete}
                    >
                        <Text style={[styles.saveButtonText, !isAddressInfoComplete && styles.saveButtonTextDisabled]}>
                            保存
                        </Text>
                        {loading && (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        )}
                    </TouchableOpacity>
                    <RegionSelector
                        visible={regionSelectorVisible}
                        onClose={() => setRegionSelectorVisible(false)}
                        onConfirm={handleRegionConfirm}
                        province={province}
                        city={city}
                        district={district}
                    />
                </View>
            </View>
        </Modal>
    );
});

AddressAddOrEditorPopup.displayName = 'AddressAddOrEditorPopup';

const styles = createStyles({
    overlay: {
        position: "absolute" as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.6)",
    },
    centerBox: {
        flex: 1,
        justifyContent: "center" as const,
        alignItems: "center" as const,
    },
    popup: {
        width: 246.25, // 632
        height: 281.25, // 720
        backgroundColor: "#FFFFFF",
        borderRadius: 10.546875, // 27
        paddingHorizontal: 15.625, // 40
        paddingVertical: 16.40625, // 42
        justifyContent: "flex-start" as const,
    },
    title: {
        fontFamily: "PingFang SC",
        fontWeight: "400" as const,
        fontSize: 11.71875, // 30
        color: "#000000",
        textAlign: "center" as const,
        marginBottom: 7.8125, // 20
    },
    formItem: {
        width: "100%" as const,
        minHeight: 43.359375, // 111
        flexDirection: "row" as const,
        alignItems: "center" as const,
        // paddingVertical: 5.46875, // 14
    },
    label: {
        width: "30%" as const,
        fontFamily: "PingFang SC",
        fontWeight: "400" as const,
        fontSize: 11.71875, // 30
        color: "#000000",
    },
    valueInput: {
        width: "70%" as const,
        fontFamily: "PingFang SC",
        fontWeight: "400" as const,
        fontSize: 11.71875, // 30
        color: "#000000",
    },
    regionButton: {
        width: "70%" as const,
    },
    regionText: {
        fontFamily: "PingFang SC",
        fontWeight: "400" as const,
        fontSize: 11.71875, // 30
        color: "#000000",
    },
    regionPlaceholderText: {
        fontFamily: "PingFang SC",
        fontWeight: "400" as const,
        fontSize: 11.71875, // 30
        color: "#00000066",
    },
    saveButton: {
        flexDirection: "row" as const,
        marginTop: 15.625, // 40
        width: 190.625, // 488
        height: 32.8125, // 84
        backgroundColor: "#FFBC81",
        borderRadius: 7.8125, // 20
        alignSelf: "center" as const,
        alignItems: "center" as const,
        justifyContent: "center" as const,
        gap: 1.953125, // 5
    },
    saveButtonText: {
        fontFamily: "PingFang SC",
        fontWeight: "500" as const,
        fontSize: 11.71875, // 30
        color: "#FFFFFF",
    },
    saveButtonDisabled: {
        backgroundColor: "#CCCCCC",
        opacity: 0.6,
    },
    saveButtonTextDisabled: {
        color: "#999999",
    },
})

export default AddressAddOrEditorPopup


