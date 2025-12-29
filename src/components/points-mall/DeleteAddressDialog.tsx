import React, { useState, useCallback, useImperativeHandle, forwardRef } from "react"
import ConfirmDialog from "../common/ConfirmDialog"

export type DeleteAddressDialogRef = {
    show: (id: number) => void;
}

interface DeleteAddressDialogProps {
    onDeleteAddress: (id: number) => Promise<void>
    onSuccess?: () => void
    onClose?: () => void
}

/**
 * 删除地址弹窗组件
 */
const DeleteAddressDialog = forwardRef<DeleteAddressDialogRef, DeleteAddressDialogProps>(({
    onDeleteAddress,
    onSuccess,
    onClose,
}, ref) => {
    const [visible, setVisible] = useState(false);
    const [addressId, setAddressId] = useState<number | null>(null);

    // 显示弹窗
    const show = useCallback((id: number) => {
        setAddressId(id);
        setVisible(true);
    }, []);

    // 隐藏弹窗
    const hide = useCallback(() => {
        setVisible(false);
        setAddressId(null);
    }, []);

    // 暴露方法给父组件
    useImperativeHandle(ref, () => ({
        show,
    }), [show]);

    // 处理确认删除
    const handleConfirm = useCallback(async () => {
        await onDeleteAddress(addressId ?? NaN);
        onSuccess?.();
        hide();
        onClose?.();
    }, [addressId, onDeleteAddress, onSuccess, onClose, hide]);

    // 处理取消
    const handleCancel = useCallback(() => {
        hide();
        onClose?.();
    }, [hide, onClose]);

    return (
        <ConfirmDialog
            visible={visible}
            title="确认删除地址吗?"
            confirmText="确定"
            cancelText="取消"
            onConfirm={handleConfirm}
            onCancel={handleCancel}
            onClose={handleCancel}
        />
    );
});

DeleteAddressDialog.displayName = 'DeleteAddressDialog';

export default DeleteAddressDialog

