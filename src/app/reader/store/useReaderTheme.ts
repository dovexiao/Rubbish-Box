import { create } from 'zustand';
import AsyncStorage from "@react-native-async-storage/async-storage"

// 主题配置接口
export type ReaderTheme =  {
  name: string
  bgColor: string
  textColor: string
  titleColor: string
  spineColor: string
  highlightColor: string
}

// 预定义主题
const READER_THEMES: ReaderTheme[] = [
  {
    name: "默认",
    bgColor: "#f8f5e8",
    textColor: "#333333",
    titleColor: "#2c3e50",
    spineColor: "rgba(0, 0, 0, 0.1)",
    highlightColor: "#e67e22",
  },
  {
    name: "护眼",
    bgColor: "#e8f0e0",
    textColor: "#3a3a3a",
    titleColor: "#2c3e50",
    spineColor: "rgba(0, 0, 0, 0.05)",
    highlightColor: "#27ae60",
  },
  {
    name: "夜间",
    bgColor: "#1c1c1e",
    textColor: "#d1d1d6",
    titleColor: "#f1f1f1",
    spineColor: "rgba(255, 255, 255, 0.1)",
    highlightColor: "#f39c12",
  },
]

type ReaderThemeState = {
    currentThemeIndex: number;
    fontSize: number;
    themes: ReaderTheme[];
    setCurrentThemeIndex: (index: number) => void;
    setFontSize: (size: number) => void;
    setThemes: (themes: ReaderTheme[]) => void;

    saveReaderSettings: () => Promise<void>;
    loadReaderSettings: () => Promise<void>;
    changeTheme: (index: number) => void;
    increaseFontSize: () => void;
    decreaseFontSize: () => void;
    setFontSizeValue: (size: number) => void;
}

export const useReaderThemeStore = create<ReaderThemeState>((set, get) => ({
    currentThemeIndex: 0,
    fontSize: 30,
    themes: READER_THEMES,
    setCurrentThemeIndex: (index: number) => set({ currentThemeIndex: index }),
    setFontSize: (size: number) => set({ fontSize: size }),
    setThemes: (themes: ReaderTheme[]) => set({ themes: themes }),

    saveReaderSettings: async () => {
        try {
            const settings = {
                theme: get().currentThemeIndex,
                fontSize: get().fontSize,
            }
            await AsyncStorage.setItem('reader_settings_global', JSON.stringify(settings));
        } catch (error) {
            console.error('保存阅读设置失败:', error);
        }
    },
    loadReaderSettings: async () => {
        try {
            const settings = await AsyncStorage.getItem('reader_settings_global');
            if (settings) {
                const settingsObj = JSON.parse(settings);
                set({ currentThemeIndex: settingsObj.theme, fontSize: settingsObj.fontSize });
            }
            console.log('阅读设置加载成功:', settings);
        } catch (error) {
            console.error('加载阅读设置失败:', error);
        }
    },
    changeTheme: (index: number) => {
        if (index >= 0 && index < get().themes.length) {
            set({ currentThemeIndex: index });
        }
    },
    increaseFontSize: () => {
        set({ fontSize: Math.min(get().fontSize + 1, 35) });
    },
    decreaseFontSize: () => {
        set({ fontSize: Math.max(get().fontSize - 1, 25) });
    },
    setFontSizeValue: (size: number) => {
        set({ fontSize: Math.max(25, Math.min(35, size)) });
    },
}));