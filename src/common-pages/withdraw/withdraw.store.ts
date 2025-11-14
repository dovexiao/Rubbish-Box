import { create } from 'zustand';

type WithdrawStoreState = {
    price: string;
    receive: string | number;
    per: string;
    setPrice: (price: string) => void;
    setPer: (per: string) => void;
}

/**
 * 将 per 字符串转换为数字
 * 支持百分比格式（如 "5%"）或小数格式（如 "0.05"）
 * @param per - 百分比或小数字符串
 * @returns 转换后的数字（0-1之间的小数）
 */
const convertPerToNumber = (per: string): number => {
    if (!per || typeof per !== 'string') {
        return 0;
    }
    
    // 去除空格
    const trimmedPer = per.trim();
    
    // 如果是百分比格式（包含 %）
    if (trimmedPer.includes('%')) {
        const percentValue = parseFloat(trimmedPer.replace('%', ''));
        if (isNaN(percentValue)) {
            return 0;
        }
        // 将百分比转换为小数：5% -> 0.05
        return percentValue / 100;
    }
    
    // 如果是小数字符串
    const decimalValue = parseFloat(trimmedPer);
    if (isNaN(decimalValue)) {
        return 0;
    }
    
    return decimalValue;
};

/**
 * 计算实际收到的金额
 * @param price - 提现金额字符串
 * @param per - 提现比例字符串（百分比或小数）
 * @returns 计算后的金额字符串（保留2位小数）
 */
const calculateReceive = (price: string, per: string): string => {
    if (!price || !per) {
        return '';
    }
    
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
        return '';
    }
    
    const perNum = convertPerToNumber(per);
    if (perNum <= 0) {
        return '';
    }
    
    const receiveNum = priceNum * (1 - perNum);
    if (isNaN(receiveNum) || receiveNum < 0) {
        return '';
    }
    
    return receiveNum.toFixed(2);
};

const useWithdrawStore = create<WithdrawStoreState>((set, get) => ({
    price: '',
    receive: '',
    per: '',
    setPrice: (price: string) => {
        const { per } = get();
        const receive = calculateReceive(price, per);
        set({ price, receive });
    },
    setPer: (per: string) => {
        const { price } = get();
        const receive = calculateReceive(price, per);
        set({ per, receive });
    },
}));

export const useSetWithdrawPrice = useWithdrawStore.getState().setPrice;
export const useSetWithdrawPer = useWithdrawStore.getState().setPer;

export default useWithdrawStore;